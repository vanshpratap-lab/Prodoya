import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  username: string | null;
  full_name: string;
  college: string;
  role: string;
  avatar_url: string;
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
  project_showcase_url: string | null;
  video_url: string | null;
  created_at: string;
  author: Profile;
  like_count: number;
  has_liked: boolean;
  repost_count: number;
  has_reposted: boolean;
  comment_count: number;
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
}

export interface DbMessage {
  id: number;
  chat_id: number;
  sender_id: string;
  text: string;
  created_at: string;
  sender: Profile;
}
