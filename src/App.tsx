import { useState, Suspense, lazy, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import Feed from './components/Feed';
import Auth from './components/Auth';

// Every non-default tab is code-split so the first paint ships only the feed.
const Peers = lazy(() => import('./components/Peers'));
const Rankings = lazy(() => import('./components/Rankings'));
const Chat = lazy(() => import('./components/Chat'));
const Notifications = lazy(() => import('./components/Notifications'));
const ProfileView = lazy(() => import('./components/ProfileView'));
const Activity = lazy(() => import('./components/Activity'));
const AiChat = lazy(() => import('./components/AiChat'));
import { useAuth } from './lib/AuthContext';
import { usePosts, useConnections, useCommunityChat, useNotifications, useLeaderboard } from './lib/hooks';
import { formatRelativeTime } from './lib/time';
import { playNotificationChime } from './lib/sound';

const POINTS_MAP = { beginner: 10, intermediate: 20, advanced: 35 } as const;

export default function App() {
  const { session, user, profile, loading: authLoading, refreshProfile, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<'home' | 'network' | 'rank' | 'messages' | 'profile' | 'activity' | 'notifications' | 'ai'>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedFilter] = useState<'all' | 'aiml' | 'webdev' | 'opensource' | 'hackathons'>('all');
  const [selectedChatId, setSelectedChatId] = useState<number>(1);
  const [typeMessage, setTypeMessage] = useState('');

  const userId = user?.id;
  const { feedItems, createPost, toggleLike, toggleRepost, incrementCommentCount, deletePost, blockUser } = usePosts(userId);
  const { connections, toggleConnect, connectionCount } = useConnections(userId);
  const { chats, sendMessage, startDirectChat } = useCommunityChat(userId);
  const {
    notifications,
    loading: notificationsLoading,
    unreadCount,
    addNotification,
    markRead,
    markAllRead,
    deleteNotification,
  } = useNotifications(userId);
  const { rows: leaderboardRows, loading: leaderboardLoading, refetch: refetchLeaderboard } = useLeaderboard();

  if (authLoading) {
    return (
      <div
        style={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg-home)',
          color: 'var(--color-text-muted-light)',
        }}
      >
        <Loader2 size={28} className="animate-spin" />
      </div>
    );
  }

  if (!session || !user || !profile) {
    return <Auth />;
  }

  const feedPosts = feedItems.map(p => ({
    id: p.id,
    feedKey: p.feed_key,
    repostedBy: p.reposted_by ?? undefined,
    authorId: p.author_id,
    author: p.author?.full_name ?? 'Unknown',
    avatar: p.author?.avatar_url ?? '',
    college: p.author?.college ?? '',
    role: p.author?.role ?? '',
    content: p.content,
    tags: p.tags,
    aiDifficulty: p.ai_difficulty,
    aiPoints: p.ai_points,
    likes: p.like_count,
    hasLiked: p.has_liked,
    reposts: p.repost_count,
    hasReposted: p.has_reposted,
    commentCount: p.comment_count,
    time: formatRelativeTime(p.activity_at),
    githubUrl: p.github_url ?? undefined,
    codeSnippet: p.code_snippet ?? undefined,
    images: p.image_urls ?? [],
    videoUrl: p.video_url ?? undefined,
  }));

  const handleCreatePost = async (
    text: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    category: string,
    extraData?: { imageUrls?: string[]; videoUrl?: string },
  ) => {
    const points = POINTS_MAP[difficulty];
    try {
      await createPost({
        content: text,
        ai_difficulty: difficulty,
        ai_points: points,
        tags: [`#${category}`, '#proofOfWork', '#buildInPublic'],
        image_urls: extraData?.imageUrls,
        video_url: extraData?.videoUrl,
      });
      await Promise.all([refreshProfile(), refetchLeaderboard()]);
      await addNotification(
        '🤖',
        `Your post was categorized as ${difficulty.toUpperCase()} (+${points} points).`,
        'ai',
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create post. Please try again.');
    }
  };

  const handleLikePost = (id: number) => {
    toggleLike(id);
  };

  const handleRepostPost = (id: number) => {
    toggleRepost(id);
  };

  const handleDeletePost = async (id: number) => {
    await deletePost(id);
    await Promise.all([refreshProfile(), refetchLeaderboard()]);
  };

  // The signed-in user's own authored posts (original entries only, newest first).
  const myPosts = feedPosts.filter(p => p.authorId === user.id && !p.repostedBy);

  const handleToggleConnect = (id: string) => {
    // Chime for the initiating user only when a new connection request goes out (not on disconnect).
    const alreadyConnected = connections.find(c => c.id === id)?.connected;
    if (!alreadyConnected) playNotificationChime();
    toggleConnect(id);
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!typeMessage.trim()) return;
    sendMessage(selectedChatId, typeMessage);
    setTypeMessage('');
  };

  const myRankIndex = leaderboardRows.findIndex(r => r.id === user.id);

  const profileStats = {
    connections: connectionCount,
    rating: 4.9,
    rank: myRankIndex >= 0 ? myRankIndex + 1 : leaderboardRows.length || 1,
    points: profile.points,
  };

  const showRightSidebar = activeTab === 'home';

  return (
    <div className="app-container">
      {/* Top Navigation Bar — always visible */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSidebarOpen={setSidebarOpen}
        notificationsCount={unreadCount}
        profile={profile}
        onSignOut={signOut}
      />

      {/* Main Container Wrapper */}
      <div className="main-wrapper" style={{ height: 'calc(100vh - 72px)' }}>
        {activeTab !== 'ai' && (
          <Sidebar 
            profileStats={profileStats} 
            sidebarOpen={sidebarOpen} 
            profile={profile} 
            setActiveTab={setActiveTab}
          />
        )}

        <Suspense
          fallback={
            <main className="content-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={26} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
            </main>
          }
        >
        {activeTab === 'ai' ? (
          <main className="content-area" style={{ padding: 0 }}>
            <AiChat currentUser={profile} sidebarOpen={sidebarOpen} />
          </main>
        ) : activeTab === 'activity' ? (
          <main className="content-area">
            <Activity
              variant="full"
              currentUser={profile}
              myPosts={myPosts}
              followerCount={connectionCount}
              onLike={handleLikePost}
              onRepost={handleRepostPost}
              onCommentAdded={incrementCommentCount}
              onDelete={handleDeletePost}
              onBack={() => setActiveTab('profile')}
            />
          </main>
        ) : activeTab === 'notifications' ? (
          <main className="content-area">
            <Notifications
              notifications={notifications}
              loading={notificationsLoading}
              markRead={markRead}
              markAllRead={markAllRead}
              deleteNotification={deleteNotification}
            />
          </main>
        ) : (
          /* Content View Switcher */
          <main
            className={`content-area ${activeTab === 'messages' ? 'messages-tab-active' : ''} ${activeTab === 'rank' ? 'rank-tab-active' : ''} ${activeTab === 'profile' ? 'profile-tab-active' : ''}`}
          >
            {activeTab === 'home' && (
              <Feed
                feedPosts={feedPosts}
                handleLikePost={handleLikePost}
                handleRepostPost={handleRepostPost}
                onCommentAdded={incrementCommentCount}
                handleDeletePost={handleDeletePost}
                handleBlockUser={blockUser}
                handleCreatePost={handleCreatePost}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                feedFilter={feedFilter}
                currentUser={profile}
              />
            )}

            {activeTab === 'network' && (
              <Peers connections={connections} handleToggleConnect={handleToggleConnect} searchQuery={searchQuery} currentUser={profile} />
            )}

            {activeTab === 'rank' && <Rankings rows={leaderboardRows} loading={leaderboardLoading} currentUser={profile} />}

            {activeTab === 'messages' && (
              <Chat
                chats={chats}
                selectedChatId={selectedChatId}
                setSelectedChatId={setSelectedChatId}
                typeMessage={typeMessage}
                setTypeMessage={setTypeMessage}
                handleSendMessage={handleSendMessage}
                currentUser={profile}
                connections={connections}
                startDirectChat={startDirectChat}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                profile={profile}
                myPosts={myPosts}
                followerCount={connectionCount}
                onLike={handleLikePost}
                onRepost={handleRepostPost}
                onCommentAdded={incrementCommentCount}
                onDelete={handleDeletePost}
                onShowAllActivity={() => setActiveTab('activity')}
                onCreatePost={() => setActiveTab('home')}
                onProfileUpdated={refreshProfile}
              />
            )}
          </main>
        )}
        </Suspense>

        {/* Right Widget Sidebar for home feed only */}
        {showRightSidebar && (
          <RightSidebar
            connections={connections}
            handleToggleConnect={handleToggleConnect}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
      </div>
    </div>
  );
}

