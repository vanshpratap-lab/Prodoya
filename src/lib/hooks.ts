import { useState, useEffect, useCallback } from 'react';
import { supabase, type Post, type Profile, type ChatChannel, type DbMessage } from './supabase';
import { formatRelativeTime, formatClockTime } from './time';

// ─── Posts / Feed ──────────────────────────────────────────────────────────

export function usePosts(currentUserId: string | undefined) {
  const [posts, setPosts] = useState<Post[]>([]);
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
    const { data: likesData } = postIds.length
      ? await supabase.from('post_likes').select('post_id, user_id').in('post_id', postIds)
      : { data: [] as { post_id: number; user_id: string }[] };

    const likeCounts = new Map<number, number>();
    const likedByMe = new Set<number>();
    (likesData || []).forEach(l => {
      likeCounts.set(l.post_id, (likeCounts.get(l.post_id) || 0) + 1);
      if (l.user_id === currentUserId) likedByMe.add(l.post_id);
    });

    setPosts(
      postsData.map((p: any) => ({
        ...p,
        like_count: likeCounts.get(p.id) || 0,
        has_liked: likedByMe.has(p.id),
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

  return { posts, loading, createPost, toggleLike, refetch: fetchPosts };
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
