import { useState, useEffect, useCallback } from 'react';
import { supabase, type Post, type Profile, type ChatChannel, type DbMessage, type PostComment, type EngineeringActivity } from './supabase';
import { formatRelativeTime, formatClockTime } from './time';
import { playNotificationChime } from './sound';

// ─── Posts / Feed ──────────────────────────────────────────────────────────

export interface RepostEntry {
  post_id: number;
  user_id: string;
  created_at: string;
  reposter_name: string;
}

export function usePosts(currentUserId: string | undefined) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [repostEntries, setRepostEntries] = useState<RepostEntry[]>([]);
  const [rankScores, setRankScores] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data: postsData, error } = await supabase
      .from('posts')
      .select('*, author:profiles!posts_author_id_fkey(*)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !postsData) {
      setLoading(false);
      return;
    }

    const postIds = postsData.map((p: any) => p.id);
    const [{ data: likesData }, { data: repostsData }, { data: commentsData }] = postIds.length
      ? await Promise.all([
          supabase.from('post_likes').select('post_id, user_id').in('post_id', postIds),
          supabase.from('post_reposts').select('post_id, user_id, created_at').in('post_id', postIds),
          supabase.from('post_comments').select('post_id').in('post_id', postIds),
        ])
      : [{ data: [] as { post_id: number; user_id: string }[] }, { data: [] as { post_id: number; user_id: string; created_at: string }[] }, { data: [] as { post_id: number }[] }];

    // Resolve reposter names so reposts can surface as real feed activity.
    const reposterIds = [...new Set((repostsData || []).map((r: any) => r.user_id))];
    const { data: reposterProfiles } = reposterIds.length
      ? await supabase.from('profiles').select('id, full_name').in('id', reposterIds)
      : { data: [] as { id: string; full_name: string }[] };
    const reposterNames = new Map<string, string>((reposterProfiles || []).map(p => [p.id, p.full_name]));

    setRepostEntries(
      (repostsData || []).map((r: any) => ({
        post_id: r.post_id,
        user_id: r.user_id,
        created_at: r.created_at,
        reposter_name: reposterNames.get(r.user_id) || 'Someone',
      })),
    );

    const likeCounts = new Map<number, number>();
    const likedByMe = new Set<number>();
    (likesData || []).forEach(l => {
      likeCounts.set(l.post_id, (likeCounts.get(l.post_id) || 0) + 1);
      if (l.user_id === currentUserId) likedByMe.add(l.post_id);
    });

    const repostCounts = new Map<number, number>();
    const repostedByMe = new Set<number>();
    (repostsData || []).forEach(r => {
      repostCounts.set(r.post_id, (repostCounts.get(r.post_id) || 0) + 1);
      if (r.user_id === currentUserId) repostedByMe.add(r.post_id);
    });

    const commentCounts = new Map<number, number>();
    (commentsData || []).forEach(c => {
      commentCounts.set(c.post_id, (commentCounts.get(c.post_id) || 0) + 1);
    });

    // Feed ranking algorithm (engagement × decay × affinity × trust — computed in Postgres).
    const { data: ranking } = await supabase.rpc('get_feed_ranking');
    setRankScores(new Map(((ranking as { post_id: number; score: number }[] | null) || []).map(r => [r.post_id, r.score])));

    setPosts(
      postsData.map((p: any) => ({
        ...p,
        like_count: likeCounts.get(p.id) || 0,
        has_liked: likedByMe.has(p.id),
        repost_count: repostCounts.get(p.id) || 0,
        has_reposted: repostedByMe.has(p.id),
        comment_count: commentCounts.get(p.id) || 0,
      })),
    );
    setLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = async (input: {
    content: string;
    ai_difficulty: 'beginner' | 'intermediate' | 'advanced';
    ai_points: number;
    tags: string[];
    code_snippet?: string;
    github_url?: string;
    project_showcase_url?: string;
    video_url?: string;
  }) => {
    if (!currentUserId) throw new Error('Not signed in.');
    const { error } = await supabase.from('posts').insert({
      author_id: currentUserId,
      content: input.content.trim(),
      tags: input.tags,
      ai_difficulty: input.ai_difficulty,
      ai_points: input.ai_points,
      code_snippet: input.code_snippet?.trim() || null,
      github_url: input.github_url?.trim() || null,
      project_showcase_url: input.project_showcase_url || null,
      video_url: input.video_url || null,
    });
    if (error) throw error;
    await supabase.rpc('award_post_points', { p_points: input.ai_points });
    await fetchPosts();
  };

  const toggleLike = async (postId: number) => {
    if (!currentUserId) return;
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, has_liked: !p.has_liked, like_count: p.like_count + (p.has_liked ? -1 : 1) }
          : p,
      ),
    );
    const { error } = await supabase.rpc('toggle_post_like', { p_post_id: postId });
    if (error) await fetchPosts();
  };

  const toggleRepost = async (postId: number) => {
    if (!currentUserId) return;
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, has_reposted: !p.has_reposted, repost_count: p.repost_count + (p.has_reposted ? -1 : 1) }
          : p,
      ),
    );
    await supabase.rpc('toggle_post_repost', { p_post_id: postId });
    // Refetch so the repost surfaces (or disappears) as a real feed activity entry.
    await fetchPosts();
  };

  const incrementCommentCount = (postId: number) => {
    setPosts(prev => prev.map(p => (p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p)));
  };

  const deletePost = async (postId: number) => {
    if (!currentUserId) return;
    // Optimistically remove the post and any repost activity referencing it.
    setPosts(prev => prev.filter(p => p.id !== postId));
    setRepostEntries(prev => prev.filter(r => r.post_id !== postId));
    // RLS allows deletion only when auth.uid() = author_id, so this is a no-op for non-owners.
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) await fetchPosts();
  };

  const blockUser = async (userId: string) => {
    if (!currentUserId || userId === currentUserId) return;
    // Optimistically drop everything from the blocked author, then persist.
    setPosts(prev => prev.filter(p => p.author_id !== userId));
    setRepostEntries(prev => prev.filter(r => r.user_id !== userId));
    await supabase.from('user_blocks').insert({ blocker_id: currentUserId, blocked_id: userId });
    await fetchPosts();
  };

  // Merge original posts and repost activity into one ranked feed timeline.
  // Blocked authors are excluded because get_feed_ranking omits their posts.
  const visiblePosts = rankScores.size > 0 ? posts.filter(p => rankScores.has(p.id)) : posts;
  const feedItems: FeedItem[] = visiblePosts.map(p => ({
    ...p,
    feed_key: `post-${p.id}`,
    reposted_by: null,
    activity_at: p.created_at,
  }));
  repostEntries.forEach(r => {
    const original = visiblePosts.find(p => p.id === r.post_id);
    if (!original) return;
    feedItems.push({
      ...original,
      feed_key: `repost-${r.post_id}-${r.user_id}`,
      reposted_by: r.reposter_name,
      activity_at: r.created_at,
    });
  });
  // Primary sort: algorithm score. Tiebreak: newest activity first.
  feedItems.sort((a, b) => {
    const diff = (rankScores.get(b.id) ?? 0) - (rankScores.get(a.id) ?? 0);
    if (Math.abs(diff) > 1e-9) return diff;
    return new Date(b.activity_at).getTime() - new Date(a.activity_at).getTime();
  });

  return { posts, feedItems, loading, createPost, toggleLike, toggleRepost, incrementCommentCount, deletePost, blockUser, refetch: fetchPosts };
}

export interface FeedItem extends Post {
  feed_key: string;
  reposted_by: string | null;
  activity_at: string;
}

// ─── Post uploads (images / video) ─────────────────────────────────────────

export async function uploadPostMedia(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'bin';
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('post-media').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('post-media').getPublicUrl(path);
  return data.publicUrl;
}

// ─── Post comments ──────────────────────────────────────────────────────────

export function usePostComments(postId: number, enabled: boolean) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('post_comments')
      .select('*, author:profiles!post_comments_author_id_fkey(*)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    setComments((data || []) as PostComment[]);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    if (enabled) fetchComments();
  }, [enabled, fetchComments]);

  const addComment = async (authorId: string, text: string) => {
    if (!text.trim()) return;
    const { error } = await supabase.from('post_comments').insert({
      post_id: postId,
      author_id: authorId,
      text: text.trim(),
    });
    if (error) throw error;
    await fetchComments();
  };

  return { comments, loading, addComment, refetch: fetchComments };
}

// ─── Engineering Activity (replaces the old streak system) ─────────────────
// GitHub-contribution-graph-style metrics computed live from real proof-of-work
// data: posts, likes, comments, reposts. Nothing here is a login streak.

const EMPTY_ACTIVITY: EngineeringActivity = {
  active_days: 0,
  projects_built: 0,
  learning_sessions: 0,
  open_source_contributions: 0,
  research_activity: 0,
  community_contributions: 0,
  reputation_score: 0,
  ai_impact_score: 0,
};

export function useEngineeringActivity(userId: string | undefined) {
  const [activity, setActivity] = useState<EngineeringActivity>(EMPTY_ACTIVITY);
  const [loading, setLoading] = useState(true);

  const fetchActivity = useCallback(async () => {
    if (!userId) {
      setActivity(EMPTY_ACTIVITY);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase.rpc('get_engineering_activity', { p_user_id: userId });
    const row = (data as EngineeringActivity[] | null)?.[0];
    setActivity(row ?? EMPTY_ACTIVITY);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return { activity, loading, refetch: fetchActivity };
}

// GitHub-style contribution calendar (day → post count) for a user.
export function useActivityCalendar(userId: string | undefined) {
  const [days, setDays] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchCalendar = useCallback(async () => {
    if (!userId) {
      setDays(new Map());
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase.rpc('get_activity_calendar', { p_user_id: userId, p_days: 371 });
    const map = new Map<string, number>();
    ((data as { activity_date: string; post_count: number }[] | null) || []).forEach(row => {
      map.set(row.activity_date, row.post_count);
    });
    setDays(map);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  return { days, loading, refetch: fetchCalendar };
}

// ─── Peers / Connections ───────────────────────────────────────────────────

export interface PeerCard {
  id: string;
  name: string;
  role: string;
  college: string;
  avatar: string;
  connected: boolean;
}

export function useConnections(currentUserId: string | undefined) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [suggestionScores, setSuggestionScores] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: allProfiles }, connResult, { data: suggestions }] = await Promise.all([
      supabase.from('profiles').select('*').order('points', { ascending: false }),
      currentUserId
        ? supabase.from('connections').select('requester_id, addressee_id').or(
            `requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`,
          )
        : Promise.resolve({ data: [] as { requester_id: string; addressee_id: string }[] }),
      supabase.rpc('get_peer_suggestions'),
    ]);
    setSuggestionScores(
      new Map(((suggestions as { peer_id: string; score: number }[] | null) || []).map(s => [s.peer_id, s.score])),
    );
    setProfiles((allProfiles || []) as Profile[]);
    const ids = new Set<string>();
    (connResult.data || []).forEach(row => {
      ids.add(row.requester_id === currentUserId ? row.addressee_id : row.requester_id);
    });
    setConnectedIds(ids);
    setLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Discovery ranking: mutual connections + same college + reputation (computed in Postgres).
  const connections: PeerCard[] = profiles
    .filter(p => p.id !== currentUserId && (suggestionScores.size === 0 || suggestionScores.has(p.id)))
    .map(p => ({
      id: p.id,
      name: p.full_name,
      role: p.role,
      college: p.college,
      avatar: p.avatar_url,
      connected: connectedIds.has(p.id),
    }))
    .sort((a, b) => (suggestionScores.get(b.id) ?? 0) - (suggestionScores.get(a.id) ?? 0));

  const toggleConnect = async (peerId: string) => {
    if (!currentUserId) return;
    const isConnected = connectedIds.has(peerId);
    setConnectedIds(prev => {
      const next = new Set(prev);
      if (isConnected) next.delete(peerId);
      else next.add(peerId);
      return next;
    });

    if (isConnected) {
      await supabase
        .from('connections')
        .delete()
        .or(
          `and(requester_id.eq.${currentUserId},addressee_id.eq.${peerId}),and(requester_id.eq.${peerId},addressee_id.eq.${currentUserId})`,
        );
    } else {
      // Also notifies the addressee in real time (see send_connection_request RPC).
      await supabase.rpc('send_connection_request', { p_addressee_id: peerId });
    }
  };

  return { connections, loading, toggleConnect, connectionCount: connectedIds.size };
}

// ─── Community Chat ─────────────────────────────────────────────────────────

export interface ChatMessageView {
  id: number;
  text: string;
  time: string;
  sender: 'incoming' | 'outgoing';
  senderName?: string;
  senderAvatar?: string;
}

export interface ChatChannelView {
  id: number;
  name: string;
  role: string;
  avatar: string;
  avatarBg: string;
  avatarText: string;
  subtext: string;
  time: string;
  messages: ChatMessageView[];
}

const AVATAR_PALETTE = ['#7c3aed', '#3b82f6', '#059669', '#d97706', '#db2777', '#0891b2'];

export function useCommunityChat(currentUserId: string | undefined) {
  const [chats, setChats] = useState<ChatChannelView[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [{ data: channels }, { data: msgs }] = await Promise.all([
      supabase.from('chats').select('*').order('id'),
      supabase
        .from('messages')
        .select('*, sender:profiles!messages_sender_id_fkey(*)')
        .order('created_at', { ascending: true })
        .limit(500),
    ]);

    const channelList = (channels || []) as ChatChannel[];
    const messageList = (msgs || []) as DbMessage[];

    const grouped: ChatChannelView[] = channelList.map((c, idx) => {
      const chatMessages = messageList.filter(m => m.chat_id === c.id);
      const last = chatMessages[chatMessages.length - 1];
      return {
        id: c.id,
        name: c.name,
        role: c.description,
        avatar: '',
        avatarBg: AVATAR_PALETTE[idx % AVATAR_PALETTE.length],
        avatarText: c.emoji,
        subtext: last ? `${last.sender?.full_name ?? 'Someone'}: ${last.text}` : 'No messages yet — say hi!',
        time: last ? formatClockTime(last.created_at) : '',
        messages: chatMessages.map(m => ({
          id: m.id,
          text: m.text,
          time: formatClockTime(m.created_at),
          sender: (m.sender_id === currentUserId ? 'outgoing' : 'incoming') as 'incoming' | 'outgoing',
          senderName: m.sender?.full_name,
          senderAvatar: m.sender?.avatar_url,
        })),
      };
    });

    setChats(grouped);
    setLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const channel = supabase
      .channel('messages-all')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchAll();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  const sendMessage = async (chatId: number, text: string) => {
    if (!currentUserId || !text.trim()) return;
    await supabase.from('messages').insert({ chat_id: chatId, sender_id: currentUserId, text: text.trim() });
  };

  return { chats, loading, sendMessage };
}

// ─── Notifications ──────────────────────────────────────────────────────────

export interface NotificationView {
  id: number;
  icon: string;
  text: string;
  time: string;
}

export function useNotifications(currentUserId: string | undefined) {
  const [notifications, setNotifications] = useState<NotificationView[]>([]);

  const fetchNotifications = useCallback(async () => {
    if (!currentUserId) {
      setNotifications([]);
      return;
    }
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false })
      .limit(50);
    setNotifications(
      (data || []).map((n: any) => ({
        id: n.id,
        icon: n.icon,
        text: n.text,
        time: formatRelativeTime(n.created_at),
      })),
    );
  }, [currentUserId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Live-push new notifications (e.g. connection requests) and chime for the recipient only.
  useEffect(() => {
    if (!currentUserId) return;
    const channel = supabase
      .channel(`notifications-${currentUserId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${currentUserId}` },
        (payload: any) => {
          const n = payload.new;
          setNotifications(prev =>
            prev.some(existing => existing.id === n.id)
              ? prev
              : [{ id: n.id, icon: n.icon, text: n.text, time: formatRelativeTime(n.created_at) }, ...prev],
          );
          playNotificationChime();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const addNotification = async (icon: string, text: string) => {
    if (!currentUserId) return;
    await supabase.from('notifications').insert({ user_id: currentUserId, icon, text });
    await fetchNotifications();
  };

  return { notifications, addNotification, refetch: fetchNotifications };
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────
// Ranked by the engineering-rank composite (reputation, activity, projects,
// open source, community contribution, AI impact) — see get_engineering_rankings().

export interface LeaderboardRow extends Profile {
  rank_score: number;
  active_days: number;
  projects_built: number;
  open_source_contributions: number;
  community_contributions: number;
  ai_impact_score: number;
}

export function useLeaderboard() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    const [{ data: profiles }, { data: rankings }] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.rpc('get_engineering_rankings'),
    ]);
    const rankMap = new Map(((rankings as any[] | null) || []).map(r => [r.user_id, r]));
    const merged: LeaderboardRow[] = ((profiles || []) as Profile[])
      .map(p => {
        const r = rankMap.get(p.id);
        return {
          ...p,
          rank_score: r?.rank_score ?? p.points,
          active_days: r?.active_days ?? 0,
          projects_built: r?.projects_built ?? 0,
          open_source_contributions: r?.open_source_contributions ?? 0,
          community_contributions: r?.community_contributions ?? 0,
          ai_impact_score: r?.ai_impact_score ?? 0,
        };
      })
      .sort((a, b) => b.rank_score - a.rank_score)
      .slice(0, 50);
    setRows(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { rows, loading, refetch: fetchLeaderboard };
}
