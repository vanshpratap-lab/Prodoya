export const API_BASE = import.meta.env.VITE_API_BASE || '';

export interface Profile {
  id: string;
  username: string | null;
  full_name: string;
  college: string;
  role: string;
  avatar_url: string;
  cover_url: string | null;
  bio: string;
  github_url: string;
  linkedin_url: string | null;
  twitter_url: string | null;
  tech_stack: { label: string; percent: number }[];
  points: number;
  last_post_at: string | null;
  created_at: string;
}

export interface EngineeringActivity {
  active_days: number;
  projects_built: number;
  learning_sessions: number;
  open_source_contributions: number;
  research_activity: number;
  community_contributions: number;
  reputation_score: number;
  ai_impact_score: number;
}

export interface Post {
  id: number;
  author_id: string;
  content: string;
  tags: string[];
  ai_difficulty: 'beginner' | 'intermediate' | 'advanced';
  ai_points: number;
  code_snippet: string | null;
  github_url: string | null;
  image_urls: string[];
  video_url: string | null;
  created_at: string;
  author: Profile;
  like_count: number;
  has_liked: boolean;
  repost_count: number;
  has_reposted: boolean;
  comment_count: number;
  has_saved: boolean;
}

export interface PostComment {
  id: number;
  post_id: number;
  author_id: string;
  text: string;
  created_at: string;
  author: Profile;
}

export interface ChatChannel {
  id: number;
  name: string;
  emoji: string;
  description: string;
  participant_1: string | null;
  participant_2: string | null;
}

export interface DbMessage {
  id: number;
  chat_id: number;
  sender_id: string;
  text: string;
  created_at: string;
  sender: Profile;
}

export interface AuthTokens {
  token: string;
  user: Profile;
}
