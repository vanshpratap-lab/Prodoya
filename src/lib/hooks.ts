import { useState, useEffect, useCallback } from 'react';
import { supabase, type Post, type Profile, type ChatChannel, type DbMessage, type PostComment } from './supabase';
import { formatRelativeTime, formatClockTime } from './time';

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

  // Merge original posts and repost activity into one LinkedIn-style feed timeline.
  const feedItems: FeedItem[] = posts.map(p => ({
    ...p,
    feed_key: `post-${p.id}`,
    reposted_by: null,
    activity_at: p.created_at,
  }));
  repostEntries.forEach(r => {
    const original = posts.find(p => p.id === r.post_id);
    if (!original) return;
    feedItems.push({
      ...original,
      feed_key: `repost-${r.post_id}-${r.user_id}`,
      reposted_by: r.reposter_name,
      activity_at: r.created_at,
    });
  });
  feedItems.sort((a, b) => new Date(b.activity_at).getTime() - new Date(a.activity_at).getTime());

  return { posts, feedItems, loading, createPost, toggleLike, toggleRepost, incrementCommentCount, deletePost, refetch: fetchPosts };
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
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: allProfiles }, connResult] = await Promise.all([
      supabase.from('profiles').select('*').order('points', { ascending: false }),
      currentUserId
        ? supabase.from('connections').select('requester_id, addressee_id').or(
            `requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`,
          )
        : Promise.resolve({ data: [] as { requester_id: string; addressee_id: string }[] }),
    ]);
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

  const connections: PeerCard[] = profiles
    .filter(p => p.id !== currentUserId)
    .map(p => ({
      id: p.id,
      name: p.full_name,
      role: p.role,
      college: p.college,
      avatar: p.avatar_url,
      connected: connectedIds.has(p.id),
    }));

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
      await supabase.from('connections').insert({ requester_id: currentUserId, addressee_id: peerId });
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
      .limit(30);
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

  const addNotification = async (icon: string, text: string) => {
    if (!currentUserId) return;
    await supabase.from('notifications').insert({ user_id: currentUserId, icon, text });
    await fetchNotifications();
  };

  return { notifications, addNotification, refetch: fetchNotifications };
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export function useLeaderboard() {
  const [rows, setRows] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('points', { ascending: false })
      .limit(50);
    setRows((data || []) as Profile[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { rows, loading, refetch: fetchLeaderboard };
}
