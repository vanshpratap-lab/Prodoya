import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import Peers from './components/Peers';
import Rankings from './components/Rankings';
import Chat from './components/Chat';
import NotificationsDrawer from './components/NotificationsDrawer';
import ProfileView from './components/ProfileView';
import ToolsView from './components/ToolsView';
import Auth from './components/Auth';
import { useAuth } from './lib/AuthContext';
import { usePosts, useConnections, useCommunityChat, useNotifications, useLeaderboard } from './lib/hooks';
import { formatRelativeTime } from './lib/time';

const POINTS_MAP = { beginner: 10, intermediate: 20, advanced: 35 } as const;

export default function App() {
  const { session, user, profile, loading: authLoading, refreshProfile, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<'home' | 'network' | 'rank' | 'messages' | 'profile' | 'tools'>('home');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedFilter, setFeedFilter] = useState<'all' | 'aiml' | 'webdev' | 'opensource' | 'hackathons'>('all');
  const [selectedChatId, setSelectedChatId] = useState<number>(1);
  const [typeMessage, setTypeMessage] = useState('');

  const userId = user?.id;
  const { posts, createPost, toggleLike } = usePosts(userId);
  const { connections, toggleConnect, connectionCount } = useConnections(userId);
  const { chats, sendMessage } = useCommunityChat(userId);
  const { notifications, addNotification } = useNotifications(userId);
  const { rows: leaderboardRows, refetch: refetchLeaderboard } = useLeaderboard();

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

  const feedPosts = posts.map(p => ({
    id: p.id,
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
    time: formatRelativeTime(p.created_at),
    githubUrl: p.github_url ?? undefined,
    codeSnippet: p.code_snippet ?? undefined,
    projectShowcase: p.project_showcase_url ?? undefined,
  }));

  const handleCreatePost = async (
    text: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    category: string,
    extraData?: { codeSnippet?: string; githubUrl?: string },
  ) => {
    const points = POINTS_MAP[difficulty];
    try {
      await createPost({
        content: text,
        ai_difficulty: difficulty,
        ai_points: points,
        tags: [`#${category}`, '#streakUpdate', '#buildInPublic'],
        code_snippet: extraData?.codeSnippet,
        github_url: extraData?.githubUrl,
      });
      await Promise.all([refreshProfile(), refetchLeaderboard()]);
      await addNotification(
        '🤖',
        `AI analyzed your new post and categorized it as ${difficulty.toUpperCase()} (+${points} points).`,
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create post. Please try again.');
    }
  };

  const handleLikePost = (id: number) => {
    toggleLike(id);
  };

  const handleToggleConnect = (id: string) => {
    toggleConnect(id);
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!typeMessage.trim()) return;
    sendMessage(selectedChatId, typeMessage);
    setTypeMessage('');
  };

  const ranks = leaderboardRows.map((p, idx) => ({
    id: p.id,
    rank: idx + 1,
    name: p.full_name,
    score: `${p.points.toLocaleString()} pts`,
    streaks: `${p.streak_days} Days Streak`,
    change: idx % 2 === 0 ? 'up' : 'down',
    role: p.college ? `${p.role} — ${p.college}` : p.role,
    avatar: p.avatar_url,
  }));

  const myRankIndex = ranks.findIndex(r => r.id === user.id);

  const profileStats = {
    connections: connectionCount,
    rating: 4.9,
    rank: myRankIndex >= 0 ? myRankIndex + 1 : ranks.length || 1,
    streaks: profile.streak_days,
    points: profile.points,
  };

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setNotificationsOpen={setNotificationsOpen}
        setSidebarOpen={setSidebarOpen}
        notificationsCount={notifications.length}
        profile={profile}
        onSignOut={signOut}
      />

      {/* Main Container Wrapper */}
      <div className="main-wrapper">
        {/* Sidebar Navigation & Profile Card (hidden on the Tools workspace) */}
        {activeTab !== 'tools' && (
          <Sidebar profileStats={profileStats} sidebarOpen={sidebarOpen} profile={profile} />
        )}

        {activeTab === 'tools' ? (
          <ToolsView profile={profile} setActiveTab={setActiveTab} />
        ) : (
          /* Content View Switcher */
          <main
            className={`content-area ${activeTab === 'messages' ? 'messages-tab-active' : ''} ${activeTab === 'rank' ? 'rank-tab-active' : ''} ${activeTab === 'profile' ? 'profile-tab-active' : ''}`}
          >
            {activeTab === 'home' && (
              <Feed
                feedPosts={feedPosts}
                handleLikePost={handleLikePost}
                handleCreatePost={handleCreatePost}
                searchQuery={searchQuery}
                feedFilter={feedFilter}
                setFeedFilter={setFeedFilter}
                currentUser={profile}
              />
            )}

            {activeTab === 'network' && (
              <Peers connections={connections} handleToggleConnect={handleToggleConnect} searchQuery={searchQuery} />
            )}

            {activeTab === 'rank' && <Rankings ranks={ranks} currentUserId={user.id} streakDays={profile.streak_days} />}

            {activeTab === 'messages' && (
              <Chat
                chats={chats}
                selectedChatId={selectedChatId}
                setSelectedChatId={setSelectedChatId}
                typeMessage={typeMessage}
                setTypeMessage={setTypeMessage}
                handleSendMessage={handleSendMessage}
              />
            )}

            {activeTab === 'profile' && <ProfileView profile={profile} />}
          </main>
        )}
      </div>

      {/* Slide-out Notification Drawer */}
      <NotificationsDrawer
        notifications={notifications}
        notificationsOpen={notificationsOpen}
        setNotificationsOpen={setNotificationsOpen}
      />
    </div>
  );
}
