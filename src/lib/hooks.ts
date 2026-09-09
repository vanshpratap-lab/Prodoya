import { useState, useEffect, useCallback, useRef } from 'react';
import { api, hasToken } from './api';
import type { Profile, Post, PostComment, EngineeringActivity } from './supabase';
import { formatRelativeTime, formatClockTime } from './time';
import { playNotificationChime } from './sound';

export const MAX_POST_IMAGES = 5;

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
    if (!hasToken()) { setLoading(false); return; }
    setLoading(true);
    const data = await api.get<{ posts: Post[]; reposts: RepostEntry[]; ranks: Record<number, number> }>('/posts');
    setRankScores(new Map(Object.entries(data.ranks).map(([k, v]) => [Number(k), v as number])));
    setRepostEntries(data.reposts);
    setPosts(data.posts.map((p: Post) => ({
      ...p,
      like_count: p.like_count ?? 0,
      has_liked: p.has_liked ?? false,
      repost_count: p.repost_count ?? 0,
      has_reposted: p.has_reposted ?? false,
      comment_count: p.comment_count ?? 0,
      has_saved: p.has_saved ?? false,
    })));
    setLoading(false);
  }, [currentUserId]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const createPost = async (input: {
    content: string; ai_difficulty: 'beginner' | 'intermediate' | 'advanced';
    ai_points: number; tags: string[]; code_snippet?: string;
    github_url?: string; image_urls?: string[]; video_url?: string;
  }) => {
    if (!currentUserId) throw new Error('Not signed in.');
    const images = (input.image_urls ?? []).slice(0, MAX_POST_IMAGES);
    await api.post<{ post: Post }>('/posts', {
      content: input.content.trim(), tags: input.tags, ai_difficulty: input.ai_difficulty,
      ai_points: input.ai_points, code_snippet: input.code_snippet?.trim() || null,
      github_url: input.github_url?.trim() || null, image_urls: images, video_url: input.video_url || null,
    });
    await fetchPosts();
  };

  const toggleLike = async (postId: number) => {
    if (!currentUserId) return;
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, has_liked: !p.has_liked, like_count: p.like_count + (p.has_liked ? -1 : 1) } : p));
    try { await api.post<{ liked: boolean; like_count: number }>(`/posts/${postId}/like`); } catch { await fetchPosts(); }
  };

  const toggleRepost = async (postId: number) => {
    if (!currentUserId) return;
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, has_reposted: !p.has_reposted, repost_count: p.repost_count + (p.has_reposted ? -1 : 1) } : p));
    try { await api.post<{ reposted: boolean; repost_count: number; created_at: string }>(`/posts/${postId}/repost`); } catch {}
    await fetchPosts();
  };

  const incrementCommentCount = (postId: number) => {
    setPosts(prev => prev.map(p => (p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p)));
  };

  const toggleSave = async (postId: number) => {
    if (!currentUserId) return;
    const wasSaved = posts.find(p => p.id === postId)?.has_saved ?? false;
    setPosts(prev => prev.map(p => (p.id === postId ? { ...p, has_saved: !wasSaved } : p)));
    try { await api.post<{ saved: boolean }>(`/posts/${postId}/save`); } catch { await fetchPosts(); }
  };

  const deletePost = async (postId: number) => {
    if (!currentUserId) return;
    setPosts(prev => prev.filter(p => p.id !== postId));
    setRepostEntries(prev => prev.filter(r => r.post_id !== postId));
    try { await api.delete(`/posts/${postId}`); } catch { await fetchPosts(); }
  };

  const blockUser = async (userId: string) => {
    if (!currentUserId || userId === currentUserId) return;
    setPosts(prev => prev.filter(p => p.author_id !== userId));
    setRepostEntries(prev => prev.filter(r => r.user_id !== userId));
    await api.post(`/users/${userId}/block`);
    await fetchPosts();
  };

  const visiblePosts = rankScores.size > 0 ? posts.filter(p => rankScores.has(p.id)) : posts;
  const feedItems = visiblePosts.map(p => ({ ...p, feed_key: `post-${p.id}`, reposted_by: null as string | null, activity_at: p.created_at }));
  repostEntries.forEach(r => {
    const original = visiblePosts.find(p => p.id === r.post_id);
    if (!original) return;
    feedItems.push({ ...original, feed_key: `repost-${r.post_id}-${r.user_id}`, reposted_by: r.reposter_name, activity_at: r.created_at });
  });
  feedItems.sort((a, b) => {
    const diff = (rankScores.get(b.id) ?? 0) - (rankScores.get(a.id) ?? 0);
    return Math.abs(diff) > 1e-9 ? diff : new Date(b.activity_at).getTime() - new Date(a.activity_at).getTime();
  });

  return { posts, feedItems, loading, createPost, toggleLike, toggleRepost, toggleSave, incrementCommentCount, deletePost, blockUser, refetch: fetchPosts };
}

export type ReportReason = 'spam' | 'harassment' | 'misinformation' | 'inappropriate' | 'other';

export async function submitContentReport(input: { reporterId: string; postId?: number; reportedUserId?: string; reason: ReportReason; details?: string }): Promise<void> {
  await api.post('/reports', { reporter_id: input.reporterId, post_id: input.postId ?? null, reported_user_id: input.reportedUserId ?? null, reason: input.reason, details: input.details?.trim() || null });
}

export interface SearchResults {
  people: Profile[];
  posts: Post[];
}

export async function searchEverything(query: string): Promise<SearchResults> {
  const q = query.trim();
  if (q.length < 2) return { people: [], posts: [] };
  const like = `%${q.replace(/[%_]/g, m => `\\${m}`).replace(/[,()."]/g, ' ').trim()}%`;
  const { people, posts } = await api.get<{ people: Profile[]; posts: Post[] }>('/search', { q: like });
  return { people, posts: posts.map((p: Post) => ({ ...p, like_count: 0, has_liked: false, repost_count: 0, has_reposted: false, comment_count: 0, has_saved: false })) };
}

export interface FeedItem extends Post { feed_key: string; reposted_by: string | null; activity_at: string; }

export async function uploadPostMedia(_userId: string, file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const { url } = await api.postForm<{ url: string }>('/uploads', form);
  return url;
}

export async function updateProfileCover(userId: string, file: File): Promise<string> {
  const url = await uploadPostMedia(userId, file);
  await api.patch('/users/me', { cover_url: url });
  return url;
}

export async function updateProfileAvatar(userId: string, file: File): Promise<string> {
  const url = await uploadPostMedia(userId, file);
  await api.patch('/users/me', { avatar_url: url });
  return url;
}

export interface EditableProfileFields {
  full_name: string; bio: string; role: string; college: string;
  github_url: string; linkedin_url: string; twitter_url: string;
}

export async function updateProfileDetails(_userId: string, fields: EditableProfileFields) {
  await api.patch('/users/me', {
    full_name: fields.full_name.trim(), bio: fields.bio.trim(), role: fields.role.trim(),
    college: fields.college.trim(), github_url: fields.github_url.trim(),
    linkedin_url: fields.linkedin_url.trim() || null, twitter_url: fields.twitter_url.trim() || null,
  });
}

export function usePostComments(postId: number, enabled: boolean) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchComments = useCallback(async () => {
    if (!hasToken()) { setLoading(false); return; }
    setLoading(true);
    const { comments } = await api.get<{ comments: PostComment[] }>(`/posts/${postId}/comments`);
    setComments(comments); setLoading(false);
  }, [postId]);
  useEffect(() => { if (enabled) fetchComments(); }, [enabled, fetchComments]);
  const addComment = async (_authorId: string, text: string) => {
    if (!text.trim()) return;
    await api.post<{ comment: PostComment }>(`/posts/${postId}/comments`, { text: text.trim() });
    await fetchComments();
  };
  return { comments, loading, addComment, refetch: fetchComments };
}

const EMPTY_ACTIVITY: EngineeringActivity = { active_days: 0, projects_built: 0, learning_sessions: 0, open_source_contributions: 0, research_activity: 0, community_contributions: 0, reputation_score: 0, ai_impact_score: 0 };

export function useEngineeringActivity(userId: string | undefined) {
  const [activity, setActivity] = useState<EngineeringActivity>(EMPTY_ACTIVITY);
  const [loading, setLoading] = useState(true);
  const fetchActivity = useCallback(async () => {
    if (!userId) { setActivity(EMPTY_ACTIVITY); setLoading(false); return; }
    setLoading(true);
    const { activity } = await api.get<{ activity: EngineeringActivity }>(`/users/${userId}/activity`);
    setActivity(activity ?? EMPTY_ACTIVITY); setLoading(false);
  }, [userId]);
  useEffect(() => { fetchActivity(); }, [fetchActivity]);
  return { activity, loading, refetch: fetchActivity };
}

export function useActivityCalendar(userId: string | undefined) {
  const [days, setDays] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const fetchCalendar = useCallback(async () => {
    if (!userId) { setDays(new Map()); setLoading(false); return; }
    setLoading(true);
    const { days } = await api.get<{ days: { activity_date: string; post_count: number }[] }>(`/users/${userId}/calendar`);
    setDays(new Map((days ?? []).map(r => [r.activity_date, r.post_count]))); setLoading(false);
  }, [userId]);
  useEffect(() => { fetchCalendar(); }, [fetchCalendar]);
  return { days, loading, refetch: fetchCalendar };
}

export function usePeerProfile(peerId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [connectionCount, setConnectionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    if (!peerId) { setProfile(null); setConnectionCount(0); setLoading(false); return; }
    if (!hasToken()) { setLoading(false); return; }
    setLoading(true);
    api.get<{ profile: Profile }>(`/users/${peerId}`).then((profileResult) => {
      if (!cancelled) { setProfile(profileResult.profile ?? null); setConnectionCount(0); setLoading(false); }
    }).catch(() => { if (!cancelled) { setProfile(null); setConnectionCount(0); setLoading(false); } });
    return () => { cancelled = true; };
  }, [peerId]);
  return { profile, connectionCount, loading };
}

export function usePeerPosts(peerId: string | undefined, currentUserId: string | undefined) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchPosts = useCallback(async () => {
    if (!peerId) { setPosts([]); setLoading(false); return; }
    if (!hasToken()) { setLoading(false); return; }
    setLoading(true);
    const { posts } = await api.get<{ posts: Post[] }>(`/users/${peerId}/posts`);
    setPosts((posts ?? []).map((p: Post) => ({ ...p, has_liked: false, has_reposted: false, has_saved: false })));
    setLoading(false);
  }, [peerId]);
  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  const toggleLike = async (postId: number) => {
    if (!currentUserId) return;
    setPosts(prev => prev.map(p => (p.id === postId ? { ...p, has_liked: !p.has_liked, like_count: p.like_count + (p.has_liked ? -1 : 1) } : p)));
    try { await api.post<{ liked: boolean }>(`/posts/${postId}/like`); } catch { await fetchPosts(); }
  };
  const toggleRepost = async (postId: number) => {
    if (!currentUserId) return;
    setPosts(prev => prev.map(p => (p.id === postId ? { ...p, has_reposted: !p.has_reposted, repost_count: p.repost_count + (p.has_reposted ? -1 : 1) } : p)));
    try { await api.post<{ reposted: boolean }>(`/posts/${postId}/repost`); } catch { await fetchPosts(); }
  };
  const incrementCommentCount = (postId: number) => { setPosts(prev => prev.map(p => (p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p))); };
  return { posts, loading, toggleLike, toggleRepost, incrementCommentCount, refetch: fetchPosts };
}

export interface PeerCard {
  id: string; name: string; role: string; college: string; avatar: string; connected: boolean;
}

export function useConnections(currentUserId: string | undefined) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [suggestionScores, setSuggestionScores] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const fetchAll = useCallback(async () => {
    if (!hasToken()) { setLoading(false); return; }
    setLoading(true);
    const [{ peers: allProfiles }, { suggestions }, { connected_ids: cIds }] = await Promise.all([
      api.get<{ peers: Profile[] }>('/peers'),
      api.get<{ suggestions: { peer_id: string; score: number }[] }>('/peers'),
      api.get<{ connected_ids: string[] }>('/peers'),
    ]);
    setSuggestionScores(new Map((suggestions ?? []).map(s => [s.peer_id, s.score])));
    setProfiles(allProfiles ?? []);
    setConnectedIds(new Set(cIds ?? []));
    setLoading(false);
  }, [currentUserId]);
  useEffect(() => { fetchAll(); }, [fetchAll]);
  const connections: PeerCard[] = profiles
    .filter(p => p.id !== currentUserId && (suggestionScores.size === 0 || suggestionScores.has(p.id)))
    .map(p => ({ id: String(p.id), name: p.full_name, role: p.role, college: p.college, avatar: p.avatar_url, connected: connectedIds.has(String(p.id)) }))
    .sort((a, b) => (suggestionScores.get(b.id) ?? 0) - (suggestionScores.get(a.id) ?? 0));
  const toggleConnect = async (peerId: string) => {
    if (!currentUserId) return;
    const isConnected = connectedIds.has(peerId);
    setConnectedIds(prev => { const next = new Set(prev); if (isConnected) next.delete(peerId); else next.add(peerId); return next; });
    await api.post(`/users/${peerId}/connect`);
  };
  return { connections, loading, toggleConnect, connectionCount: connectedIds.size };
}

export interface ChatMessageView {
  id: number; text: string; time: string; sender: 'incoming' | 'outgoing'; senderName?: string; senderAvatar?: string;
}

export interface ChatChannelView {
  id: number; name: string; role: string; avatar: string; avatarBg: string; avatarText: string; subtext: string; time: string;
  messages: ChatMessageView[]; peerId: string | null;
}

const AVATAR_PALETTE = ['#7c3aed', '#3b82f6', '#059669', '#d97706', '#db2777', '#0891b2'];

export function useCommunityChat(currentUserId: string | undefined) {
  const [chats, setChats] = useState<ChatChannelView[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchAll = useCallback(async () => {
    if (!hasToken()) { setLoading(false); return; }
    const { channels, messages } = await api.get<{ channels: any[]; messages: any[] }>('/chat');
    const channelList = channels ?? [];
    const messageList = messages ?? [];
    const grouped: ChatChannelView[] = channelList.map((c: any, idx: number) => {
      const chatMessages = messageList.filter((m: any) => m.chat_id === c.id);
      const last = chatMessages[chatMessages.length - 1];
      const isDirect = c.participant_1 !== null && c.participant_2 !== null;
      const peerId = isDirect ? (c.participant_1 === currentUserId ? c.participant_2 : c.participant_1) : null;
      return {
        id: c.id, name: c.name, role: c.description, avatar: '',
        avatarBg: AVATAR_PALETTE[idx % AVATAR_PALETTE.length], avatarText: c.emoji,
        subtext: last ? `${last.sender?.full_name ?? 'Someone'}: ${last.text}` : 'No messages yet — say hi!',
        time: last ? formatClockTime(last.created_at) : '', peerId,
        messages: chatMessages.map((m: any) => ({ id: m.id, text: m.text, time: formatClockTime(m.created_at), sender: (m.sender_id === currentUserId ? 'outgoing' : 'incoming') as 'incoming' | 'outgoing', senderName: m.sender?.full_name, senderAvatar: m.sender?.avatar_url })),
      };
    });
    setChats(grouped); setLoading(false);
  }, [currentUserId]);
  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    if (!currentUserId) return;
    const interval = setInterval(fetchAll, 10000);
    return () => clearInterval(interval);
  }, [currentUserId, fetchAll]);
  const sendMessage = async (chatId: number, text: string) => {
    if (!currentUserId || !text.trim()) return;
    await api.post<{ message: any }>('/chat/messages', { chat_id: chatId, text: text.trim() });
  };
  const startDirectChat = async (peerId: string): Promise<number | null> => {
    if (!currentUserId) return null;
    const { chat_id } = await api.post<{ chat_id: number }>('/chat/direct', { peer_id: peerId });
    return chat_id ?? null;
  };
  return { chats, loading, sendMessage, startDirectChat };
}

export type NotificationCategory = 'community' | 'network' | 'message' | 'ai' | 'system';

export interface NotificationView {
  id: number; icon: string; text: string; time: string; createdAt: string; category: NotificationCategory; read: boolean; actor: { name: string; avatar: string } | null;
}

const KNOWN_CATEGORIES: NotificationCategory[] = ['community', 'network', 'message', 'ai', 'system'];

function mapNotificationRow(n: any): NotificationView {
  return { id: n.id, icon: n.icon, text: n.text, time: formatRelativeTime(n.created_at), createdAt: n.created_at, category: KNOWN_CATEGORIES.includes(n.category) ? n.category : 'system', read: !!n.read_at, actor: n.actor ? { name: n.actor.full_name, avatar: n.actor.avatar_url } : null };
}

export function useNotifications(currentUserId: string | undefined) {
  const [notifications, setNotifications] = useState<NotificationView[]>([]);
  const [loading, setLoading] = useState(true);
  const prevUnread = useRef<number | null>(null);
  const fetchNotifications = useCallback(async () => {
    if (!currentUserId) { setNotifications([]); setLoading(false); return; }
    const { notifications: data } = await api.get<{ notifications: NotificationView[] }>('/notifications');
    const mapped = (data ?? []).map(mapNotificationRow);
    const unread = mapped.filter(n => !n.read).length;
    if (prevUnread.current !== null && unread > prevUnread.current) playNotificationChime();
    prevUnread.current = unread;
    setNotifications(mapped); setLoading(false);
  }, [currentUserId]);
  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);
  useEffect(() => {
    if (!currentUserId) return;
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [currentUserId, fetchNotifications]);
  const addNotification = async (icon: string, text: string, category: NotificationCategory = 'system') => {
    if (!currentUserId) return;
    await api.post('/notifications', { text, category, icon });
    await fetchNotifications();
  };
  const markRead = async (id: number) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    await api.post(`/notifications/${id}/mark_read`);
  };
  const markAllRead = async () => {
    if (!currentUserId) return;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await api.post('/notifications/read_all');
  };
  const deleteNotification = async (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await api.delete(`/notifications/${id}`);
  };
  return { notifications, loading, unreadCount: notifications.filter(n => !n.read).length, addNotification, markRead, markAllRead, deleteNotification, refetch: fetchNotifications };
}

export interface LeaderboardRow extends Profile { rank_score: number; active_days: number; projects_built: number; open_source_contributions: number; community_contributions: number; ai_impact_score: number; }

export function useLeaderboard() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchLeaderboard = useCallback(async () => {
    if (!hasToken()) { setLoading(false); return; }
    setLoading(true);
    const { rows } = await api.get<{ rows: LeaderboardRow[] }>('/leaderboard');
    setRows((rows ?? []).sort((a: LeaderboardRow, b: LeaderboardRow) => b.rank_score - a.rank_score).slice(0, 50)); setLoading(false);
  }, []);
  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);
  return { rows, loading, refetch: fetchLeaderboard };
}
