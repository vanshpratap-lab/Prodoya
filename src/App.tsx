import { useState } from 'react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import Peers from './components/Peers';
import Rankings from './components/Rankings';
import Chat from './components/Chat';
import NotificationsDrawer from './components/NotificationsDrawer';
import ProfileView from './components/ProfileView';

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface FeedPost {
  id: number;
  author: string;
  avatar: string;
  college: string;
  role: string;
  content: string;
  tags: string[];
  aiDifficulty: 'beginner' | 'intermediate' | 'advanced';
  aiPoints: number;
  likes: number;
  hasLiked: boolean;
  time: string;
  githubUrl?: string;
  projectShowcase?: string;
  codeSnippet?: string;
  githubRepoName?: string;
}

interface Connection {
  id: number;
  name: string;
  role: string;
  college: string;
  avatar: string;
  connected: boolean;
}

interface Message {
  id: number;
  text: string;
  time: string;
  sender: 'incoming' | 'outgoing';
  senderName?: string;
  senderAvatar?: string;
  inlineButtons?: string[];
}

interface ChatItem {
  id: number;
  name: string;
  role: string;
  avatar: string;
  messages: Message[];
  badge?: string;
  badgeColor?: 'purple' | 'gray';
  subtext: string;
  avatarBg?: string;
  avatarText?: string;
  time: string;
}

export default function App() {
  // Navigation Tabs State (Renamed 'massage' -> 'messages' as requested)
  const [activeTab, setActiveTab] = useState<'home' | 'network' | 'rank' | 'messages' | 'profile'>('home');
  
  // Notification Drawer State (Renamed "Notificon" references)
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Left Sidebar Expand/Collapse Toggle
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Feed Category Filter State
  const [feedFilter, setFeedFilter] = useState<'all' | 'aiml' | 'webdev' | 'opensource' | 'hackathons'>('all');

  // Sidebar profile statistics (Engineer Network Style)
  const [profileStats, setProfileStats] = useState({
    connections: 142,
    rating: 4.9,
    rank: 4, // Upgraded rank representation
    streaks: 34,
    points: 12450
  });

  // Learning Feed Data (CS/EE Engineering Platform PRD)
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([
    {
      id: 1,
      author: 'Evelyn Sterling',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      college: 'MIT - Computer Science',
      role: 'Core Contributor',
      content: 'Just published a research summary on optimizing local LLM inferences using llama.cpp. Managed to get 7B models running on standard dev laptops at 25 tokens/sec. Check out the setup steps and memory maps below!',
      tags: ['#ai', '#inference', '#opensource', '#research'],
      aiDifficulty: 'advanced',
      aiPoints: 35,
      likes: 128,
      hasLiked: false,
      time: '1 hour ago',
      githubUrl: 'https://github.com/evelyn/llama-optimize',
      projectShowcase: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400'
    },
    {
      id: 2,
      author: 'Julian Vance',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      college: 'IIT Delhi - Software Engineering',
      role: 'Startup Builder',
      content: 'Day 45 of my learning streak! Today I set up collaborative canvas synchronizing state using Yjs CRDTs. It solves the cursor drift issue perfectly. Next step is connecting it to the Stripe usage credits backend.',
      tags: ['#react', '#crdt', '#collaboration', '#webdev'],
      aiDifficulty: 'intermediate',
      aiPoints: 20,
      likes: 84,
      hasLiked: true,
      time: '3 hours ago',
      githubUrl: 'https://github.com/julian/yjs-canvas'
    },
    {
      id: 3,
      author: 'Clara Oswald',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      college: 'Stanford University - Human-Computer Interaction',
      role: 'Design Director',
      content: 'Tackled visual accessibility guidelines today! Refined font contrasts and screen reader label mapping across our engineering feed components. A clean proof-of-work portfolio must be readable by everyone.',
      tags: ['#accessibility', '#design', '#ux', '#frontend'],
      aiDifficulty: 'beginner',
      aiPoints: 10,
      likes: 42,
      hasLiked: false,
      time: '6 hours ago'
    },
    {
      id: 4,
      author: 'Alice Vandy',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      college: 'University of Toronto - AI/ML Student',
      role: 'ML Learner',
      content: 'Built a simple convolutional neural network (CNN) from scratch in NumPy today to truly understand backpropagation matrices. The training loss curve converged beautifully after 20 epochs!',
      tags: ['#aiml', '#numpy', '#backprop', '#math'],
      aiDifficulty: 'intermediate',
      aiPoints: 25,
      likes: 56,
      hasLiked: false,
      time: '1 day ago',
      githubUrl: 'https://github.com/alice/cnn-numpy'
    }
  ]);

  const [connections, setConnections] = useState<Connection[]>(() => {
    const baseList = [
      { id: 1, name: 'Alice Vandy', role: 'AI/ML Learner', college: 'Univ of Toronto', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', connected: false },
      { id: 2, name: 'Marcus Brody', role: 'Technical Mentor', college: 'Google Tech Lead', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', connected: true },
      { id: 3, name: 'Sophia Loren', role: 'CS Engineering Student', college: 'Stanford University', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', connected: false },
      { id: 4, name: 'David Kim', role: 'Startup Founder', college: 'MIT CS Alumni', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', connected: false },
      { id: 5, name: 'Emma Watson', role: 'Lead Product Architect', college: 'Oxford Engineering', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', connected: true },
      { id: 6, name: 'Lucas Scott', role: 'Systems Engineer', college: 'IIT Madras', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', connected: false },
      { id: 7, name: 'Olivia West', role: 'Full Stack Mentor', college: 'Meta Tech Lead', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', connected: false },
      { id: 8, name: 'Nathaniel Drake', role: 'Computer Graphics Architect', college: 'USC Games Lab', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', connected: false },
      { id: 9, name: 'Clara Oswald', role: 'Design Director', college: 'Stanford University', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', connected: false },
      { id: 10, name: 'Julian Vance', role: 'Startup Builder', college: 'IIT Delhi', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', connected: false },
      { id: 11, name: 'Evelyn Sterling', role: 'AI Researcher', college: 'MIT CS Lab', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', connected: true },
      { id: 12, name: 'Grace Hopper', role: 'Compiler Architect', college: 'Yale CS Alumni', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', connected: false }
    ];
    const expanded: Connection[] = [];
    for (let i = 0; i < 4; i++) {
      baseList.forEach(c => {
        expanded.push({
          ...c,
          id: c.id + i * 12,
          name: i === 0 ? c.name : `${c.name} (${String.fromCharCode(65 + i)})`
        });
      });
    }
    return expanded;
  });

  // Chats List State (Updated: On-brand messaging threads)
  const [chats, setChats] = useState<ChatItem[]>([
    {
      id: 1,
      name: 'Dev Team Collaboration 🚀',
      role: 'Engineering Channel',
      avatar: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150',
      avatarBg: '#a78bfa',
      avatarText: '🚀',
      subtext: 'Blaze (admin): The CRDT synchronization issues...',
      time: '20:43',
      badge: '4',
      badgeColor: 'purple',
      messages: [
        { 
          id: 1, 
          text: 'Blaze (admin): The CRDT synchronization issues on the collaborative canvas are solved. I pushed the fix to master.', 
          time: '20:43', 
          sender: 'incoming',
          senderName: 'Blaze (admin)',
          inlineButtons: ['Review Codebase', 'Launch Demo']
        }
      ]
    },
    {
      id: 2,
      name: 'CS Study Group — Data Structures',
      role: 'Academics Group',
      avatar: '',
      avatarBg: '#3b82f6',
      avatarText: '🏫',
      subtext: 'Sophia: Red-Black Tree inserts...',
      time: '20:41',
      badge: '12',
      badgeColor: 'purple',
      messages: [
        { 
          id: 1, 
          text: 'Sophia: Can someone explain the rotation recoloring cases in Red-Black Tree insertions? Struggling with double red cases.', 
          time: '20:41', 
          sender: 'incoming',
          senderName: 'Sophia'
        }
      ]
    },
    {
      id: 3,
      name: 'Open Source Contributors — React',
      role: 'Community Channel',
      avatar: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
      avatarBg: '#1f2937',
      avatarText: '⚛️',
      subtext: 'David: PR #182 merged successfully!',
      time: '20:40',
      messages: [
        { 
          id: 1, 
          text: 'David: PR #182 adding compiler-safe state caching triggers is merged! Build scores are green.', 
          time: '20:40', 
          sender: 'incoming',
          senderName: 'David'
        }
      ]
    },
    {
      id: 4,
      name: '1:1 Mentor Thread — Marcus Brody (Google)',
      role: 'Mentorship Chat',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      avatarBg: '#d97706',
      avatarText: '👨‍🏫',
      subtext: 'Marcus: Let\'s review your NumPy CNN code...',
      time: '19:56',
      badge: '1',
      badgeColor: 'purple',
      messages: [
        { 
          id: 1, 
          text: 'Marcus: Let\'s review your NumPy CNN backprop code tomorrow at 2 PM. You have set up the gradient updates cleanly.', 
          time: '19:56', 
          sender: 'incoming',
          senderName: 'Marcus Brody (Google)'
        }
      ]
    },
    {
      id: 5,
      name: 'Hackathon Squad — HackMIT 2026',
      role: 'Hackathon Chat',
      avatar: '',
      avatarBg: '#059669',
      avatarText: '🤖',
      subtext: 'Lucas: Pitch deck design drafts are...',
      time: '19:40',
      messages: [
        { 
          id: 1, 
          text: 'Lucas: Pitch deck design drafts are ready. Let\'s sync up after dinner to finalize our AI categorizer proof-of-concept.', 
          time: '19:40', 
          sender: 'incoming',
          senderName: 'Lucas'
        }
      ]
    },
    {
      id: 6,
      name: 'AI/ML Research Circle',
      role: 'Research Group',
      avatar: '',
      avatarBg: '#7c3aed',
      avatarText: '🧠',
      subtext: 'Evelyn: Pushed local LLM benchmark...',
      time: '19:22',
      badge: '9',
      badgeColor: 'gray',
      messages: [
        { 
          id: 1, 
          text: 'Evelyn: Pushed the local LLM benchmark scripts. We should check memory bandwidth parameters on Apple Silicon models.', 
          time: '19:22', 
          sender: 'incoming',
          senderName: 'Evelyn'
        }
      ]
    }
  ]);

  // Selected chat ID inside Dev Collaboration tab
  const [selectedChatId, setSelectedChatId] = useState<number>(1);
  const [typeMessage, setTypeMessage] = useState('');

  // Leaderboard data for Rank tab
  const ranks = [
    { rank: 1, name: 'Evelyn Sterling', score: '15,420 pts', streaks: '54 Days Streak', change: 'up', role: 'MIT Computer Science', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' },
    { rank: 2, name: 'Julian Vance', score: '13,950 pts', streaks: '45 Days Streak', change: 'down', role: 'IIT Delhi Software Eng', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150' },
    { rank: 3, name: 'Clara Oswald', score: '12,810 pts', streaks: '41 Days Streak', change: 'up', role: 'Stanford HCI Design', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
    { rank: 4, name: 'Emma Watson', score: '12,450 pts', streaks: '34 Days Streak', change: 'up', role: 'Oxford Product Architect', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }
  ];

  // Static list of notifications matching Figma boxes (Notification Drawer)
  const [notifications, setNotifications] = useState([
    { id: 1, icon: '🤖', text: 'AI analyzed your new post and categorized it as Intermediate (+20 points).', time: '2 mins ago' },
    { id: 2, icon: '📈', text: 'Evelyn Sterling posted a new research summary: Optimizing local LLM inferences.', time: '15 mins ago' },
    { id: 3, icon: '🤝', text: 'Marcus Brody liked your NumPy CNN model showcase.', time: '1 hour ago' },
    { id: 4, icon: '🎉', text: 'Welcome to your premium showcase portal dashboard!', time: 'Yesterday' }
  ]);

  // Toggle connection handler
  const handleToggleConnect = (id: number) => {
    setConnections(prev => prev.map(conn => {
      if (conn.id === id) {
        const nextState = !conn.connected;
        // Adjust stats dynamically
        setProfileStats(stats => ({
          ...stats,
          connections: stats.connections + (nextState ? 1 : -1)
        }));
        return { ...conn, connected: nextState };
      }
      return conn;
    }));
  };

  // Send message handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeMessage.trim()) return;

    setChats(prev => prev.map(c => {
      if (c.id === selectedChatId) {
        return {
          ...c,
          messages: [
            ...c.messages,
            {
              id: Date.now(),
              text: typeMessage.trim(),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              sender: 'outgoing'
            }
          ]
        };
      }
      return c;
    }));
    setTypeMessage('');
  };

  // Create learning feed post handler (AI Powered)
  const handleCreatePost = (
    text: string, 
    difficulty: 'beginner' | 'intermediate' | 'advanced', 
    category: string, 
    extraData?: { codeSnippet?: string; githubUrl?: string }
  ) => {
    const pointsMapping = {
      beginner: 10,
      intermediate: 20,
      advanced: 35
    };

    const newPost: FeedPost = {
      id: Date.now(),
      author: 'Emma Watson',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      college: 'Oxford University - Product Architecture',
      role: 'Lead Architect',
      content: text,
      tags: [`#${category}`, '#streakUpdate', '#buildInPublic'],
      aiDifficulty: difficulty,
      aiPoints: pointsMapping[difficulty],
      likes: 0,
      hasLiked: false,
      time: 'Just now',
      codeSnippet: extraData?.codeSnippet,
      githubUrl: extraData?.githubUrl
    };

    setFeedPosts([newPost, ...feedPosts]);
    
    // Increment points and streaks
    setProfileStats(stats => ({
      ...stats,
      points: stats.points + pointsMapping[difficulty],
      streaks: stats.streaks + 1
    }));

    // Add alert notification
    setNotifications([
      {
        id: Date.now(),
        icon: '🤖',
        text: `AI analyzed your new post and categorized it as ${difficulty.toUpperCase()} (+${pointsMapping[difficulty]} points).`,
        time: 'Just now'
      },
      ...notifications
    ]);
  };

  // Like feed post handler
  const handleLikePost = (id: number) => {
    setFeedPosts(prev => prev.map(post => {
      if (post.id === id) {
        const nextLikedState = !post.hasLiked;
        return {
          ...post,
          hasLiked: nextLikedState,
          likes: post.likes + (nextLikedState ? 1 : -1)
        };
      }
      return post;
    }));
  };

  return (
    <div className="app-container">
      {/* Protected Background Layer (1.png Telegram-style background) */}
      <div 
        className="protected-background-container"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      >
        <img 
          src="/1.png" 
          alt="" 
          className="protected-background-image" 
        />
      </div>

      {/* Top Navigation Bar */}
      <TopBar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        setNotificationsOpen={setNotificationsOpen} 
        setSidebarOpen={setSidebarOpen} 
        notificationsCount={notifications.length} 
      />

      {/* Main Container Wrapper */}
      <div className="main-wrapper">
        
        {/* Sidebar Navigation & Profile Card */}
        <Sidebar 
          profileStats={profileStats} 
          sidebarOpen={sidebarOpen} 
        />

        {/* Content View Switcher */}
        <main className={`content-area ${activeTab === 'messages' ? 'messages-tab-active' : ''} ${activeTab === 'rank' ? 'rank-tab-active' : ''} ${activeTab === 'profile' ? 'profile-tab-active' : ''}`}>
          
          {/* HOME FEED TAB */}
          {activeTab === 'home' && (
            <Feed 
              feedPosts={feedPosts}
              handleLikePost={handleLikePost}
              handleCreatePost={handleCreatePost}
              searchQuery={searchQuery}
              feedFilter={feedFilter}
              setFeedFilter={setFeedFilter}
            />
          )}

          {/* PEERS TAB */}
          {activeTab === 'network' && (
            <Peers 
              connections={connections} 
              handleToggleConnect={handleToggleConnect} 
              searchQuery={searchQuery} 
            />
          )}

          {/* RANKINGS TAB */}
          {activeTab === 'rank' && (
            <Rankings 
              ranks={ranks} 
            />
          )}

          {/* MESSAGES TAB */}
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

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <ProfileView />
          )}

        </main>
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
