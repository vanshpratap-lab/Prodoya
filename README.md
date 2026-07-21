# Engineer Network — Proof-of-Work Community for Engineering Students

> A full-stack social platform where engineering students prove their technical work through a ranked, AI-powered feed — not likes and vibes, but real code, projects, and contributions.


---

## Table of Contents

1. [What Is This Project?](#what-is-this-project)
2. [Why It Was Created](#why-it-was-created)
3. [Live Features](#live-features)
4. [Tech Stack](#tech-stack)
5. [Architecture Overview](#architecture-overview)
6. [Database Schema & Backend](#database-schema--backend)
7. [Ranking & Trust Algorithm](#ranking--trust-algorithm)
8. [Project Structure — Every File Explained](#project-structure--every-file-explained)
9. [Pages / Views (Tab-Based Routing)](#pages--views-tab-based-routing)
10. [Authentication Flow](#authentication-flow)
11. [Real-Time Features](#real-time-features)
12. [Public Profiles (SEO-friendly)](#public-profiles-seo-friendly)
13. [AI Chat Integration](#ai-chat-integration)
14. [Design System & Styling](#design-system--styling)
15. [Environment Variables](#environment-variables)
16. [Local Development](#local-development)
17. [Deployment](#deployment)
18. [Skills Folder](#skills-folder)

---

## What Is This Project?

**Engineer Network** is a proof-of-work community platform designed specifically for engineering students. Unlike generic social media that rewards popularity, this platform rewards **actual engineering work** — posting a project, sharing a code snippet, linking a GitHub repo, contributing to open source, or logging a learning session.

Every post is assigned a **difficulty level** (Beginner / Intermediate / Advanced) and **points** are automatically awarded. A server-side ranking algorithm orders the feed based on engagement, time decay, author reputation, and your personal network — all computed in Postgres so nothing can be gamed from the client.

The platform includes:
- A **ranked social feed** with proof-of-work posts
- A **leaderboard** based on real engineering metrics
- A **Mentors & Peers discovery** system with algorithmic suggestions
- **Community chat channels** with real-time messaging
- **Personal profiles** with a GitHub-style contribution calendar
- **Public profile pages** accessible without login (SEO-ready)
- An **AI assistant** powered by Supabase Edge Functions
- A **tools/workspace area** (Notion-style panel UI) for advanced productivity workflows

---

## Why It Was Created

Traditional student social platforms (LinkedIn, Twitter) reward followers and luck. They do not surface *what you actually built*. This project was created to solve a specific problem:

> **How do you measure an engineering student's real output in a verifiable, community-reviewed way?**

The answer: make every post a proof-of-work artifact. Attach difficulty grades. Let the algorithm surface harder, more engaged work. Let peers validate through likes, comments, and reposts. Cap self-gaming with server-side RLS and rate limits. The result is a trustworthy signal of who is actually doing the work.

---

## Live Features

| Feature | Status | Notes |
|---|---|---|
| Email/password auth | ? | Multi-step signup flow with college picker |
| Google OAuth | ? | One-click social login |
| GitHub OAuth | ? | One-click social login |
| Post creation | ? | Text + difficulty + category + image/video |
| Ranked feed | ? | Server-side algorithm via Postgres RPC |
| Likes / Reposts / Comments | ? | Optimistic UI + DB triggers |
| Blocking | ? | Removed from feed + block penalty to author |
| Leaderboard | ? | Top 50 ranked by engineering metrics |
| Peer discovery | ? | Algorithmic suggestions (mutual ? college ? reputation) |
| Peer profiles (in-app) | ? | Full profile view for any peer |
| Public profiles (/u/username) | ? | No login required, SEO-ready |
| Community chat | ? | Multi-channel, real-time via Supabase Realtime |
| Notifications | ? | Real-time push + audio chime |
| AI assistant | ? | Conversation history, new chat, search |
| Contribution calendar | ? | GitHub-style 371-day grid from real post data |
| Engineering activity metrics | ? | Active days, projects built, contributions |
| Sidebar (collapsible) | ? | Profile card + proof-of-work score |
| Audio feedback | ? | Web Audio API chime on connections/notifications |
| Vercel deployment | ? | SPA rewrites configured |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **UI Framework** | React 19 (with react-dom) |
| **Language** | TypeScript 6 |
| **Bundler** | Vite 8 |
| **Styling** | Vanilla CSS (custom design system in index.css) |
| **Icons** | Lucide React |
| **Fonts** | Google Fonts — Inter, Italiana, Italianno |
| **Backend / DB** | Supabase (PostgreSQL + Row Level Security) |
| **Auth** | Supabase Auth (email, Google, GitHub OAuth) |
| **Realtime** | Supabase Realtime (Postgres Changes) |
| **Storage** | Supabase Storage (post-media bucket) |
| **Edge Functions** | Supabase Edge Functions (AI chat proxy) |
| **Linting** | OxLint |
| **Deployment** | Vercel (SPA mode via vercel.json) |

---

## Architecture Overview

```
Browser (React SPA)
    |
    +-- main.tsx --------------- Entry point: /u/:username -> PublicProfile, else App
    |
    +-- AuthProvider (Context) -- Wraps entire app, holds session/user/profile
    |
    +-- App.tsx ---------------- Root layout: TopBar + Sidebar + Content Area
            |
            +-- TopBar       Navigation + Search + Profile menu
            +-- Sidebar      Profile card + engineering score (hidden on AI tab)
            |
            +-- Content Area (tab-based SPA router)
                    +-- home         ? Feed
                    +-- network      ? Peers
                    +-- rank         ? Rankings
                    +-- messages     ? Chat
                    +-- profile      ? ProfileView
                    +-- activity     ? Activity (full screen)
                    +-- notifications ? Notifications
                    +-- ai           ? AiChat (full screen, no sidebar)

Supabase (Cloud Backend)
    +-- PostgreSQL database
    |       profiles, posts, connections, messages, chats,
    |       notifications, post_likes, post_reposts, post_comments, user_blocks
    +-- RLS policies (every table locked to auth.uid())
    +-- DB triggers (reputation points on like/comment/repost)
    +-- RPCs (get_feed_ranking, get_peer_suggestions, get_engineering_activity,
    |       get_engineering_rankings, get_activity_calendar, toggle_post_like,
    |       toggle_post_repost, award_post_points, send_connection_request)
    +-- Realtime subscriptions (messages, notifications)
    +-- Storage (post-media bucket for images/videos)
```

---

## Database Schema & Backend

All data lives in Supabase PostgreSQL. The client never does raw SQL — it goes through Supabase RPCs (stored procedures) or direct table access protected by Row Level Security (RLS).

### Tables

| Table | Purpose |
|---|---|
| `profiles` | One row per user: id, username, full_name, college, role, avatar_url, bio, github_url, linkedin_url, twitter_url, tech_stack (JSON), points, last_post_at, created_at |
| `posts` | Proof-of-work posts: id, author_id, content, tags[], ai_difficulty, ai_points, code_snippet, github_url, project_showcase_url, video_url, created_at |
| `post_likes` | Many-to-many: post_id + user_id. RLS: one row per user per post. |
| `post_reposts` | Same structure as likes but tracks reposts and timestamp |
| `post_comments` | post_id, author_id, text, created_at, joined with profiles |
| `connections` | Peer connections: requester_id, addressee_id (bidirectional lookup) |
| `chats` | Community channels: id, name, emoji, description |
| `messages` | Channel messages: chat_id, sender_id, text, created_at, joined with profiles |
| `notifications` | Per-user: user_id, icon, text, created_at. Max 50 fetched. |
| `user_blocks` | blocker_id, blocked_id. Blocked users are invisible everywhere. |

### Key Stored Procedures (RPCs)

| RPC | What It Does |
|---|---|
| `get_feed_ranking()` | Returns post_id + score for the calling user's personalized feed. Factors: engagement, time decay, difficulty, author quality, affinity, discovery boost, block penalty. |
| `get_peer_suggestions()` | Returns peer_id + score for peer discovery. Factors: mutual connections, same college, reputation, new member. |
| `get_engineering_activity(p_user_id)` | Returns a row of 8 engineering metrics computed from real activity data. |
| `get_engineering_rankings()` | Returns composite rank scores for all users (used in leaderboard). |
| `get_activity_calendar(p_user_id, p_days)` | Returns activity_date + post_count for the contribution calendar grid. |
| `toggle_post_like(p_post_id)` | Upserts/deletes post_likes row and fires reputation trigger. |
| `toggle_post_repost(p_post_id)` | Upserts/deletes post_reposts row and fires reputation trigger. |
| `award_post_points(p_points)` | Adds points to the calling user's profile (called after post creation). |
| `send_connection_request(p_addressee_id)` | Inserts into connections AND creates a notification for the recipient. |

---

## Ranking & Trust Algorithm

> See [ALGORITHM.md](./ALGORITHM.md) for the full mathematical breakdown.

The ranking system runs 100% in Postgres — the browser cannot manipulate scores.

### Feed Ranking (get_feed_ranking)

Each post's score is a **product of seven multiplied factors**:

| Factor | Formula | Rationale |
|---|---|---|
| Engagement | `1 + likes×1 + comments×3 + reposts×5` | Comments beat likes; reposts signal real value |
| Time decay | `1 / (age_hours + 2)^1.5` | Hacker News-style power-law — fresh wins unless engagement is real |
| Difficulty | `beginner×1.0 · intermediate×1.15 · advanced×1.3` | Harder posts rank higher |
| Author quality | `1 + min(points, 2000)/4000` (max ×1.5) | Reputation amplifies reach, but capped |
| Affinity | ×1.5 if connected to author | Personalised to your network |
| Discovery boost | ×1.2 if author joined < 7 days ago | Cold-start problem solved |
| Block penalty | `1 / (1 + blocks_against_author × 0.5)` | Community-downvotes lose reach |

### Reputation Points (DB Triggers)

- Like received ? +2 pts
- Comment received ? +3 pts
- Repost received ? +5 pts
- Post created ? +10 / +20 / +35 pts (by difficulty)
- Undo actions subtract the same. Self-engagement earns nothing. Floor at 0.

### Peer Discovery (get_peer_suggestions)

```
score = mutual_connections×3 + same_college×2 + min(points,2000)/1000 + new_member×1
```

### Anti-Spam

- Max 5 posts per rolling hour (DB trigger — cannot be bypassed client-side)
- All writes go through RLS — auth.uid() must match the author

---

## Project Structure — Every File Explained

```
polywork-main/
+-- index.html                   HTML shell, Google Fonts, viewport meta
+-- vite.config.ts               Vite config (React plugin only)
+-- tsconfig.json                Root TS config (references app + node)
+-- tsconfig.app.json            App TS config (ES2023, jsx, strict linting)
+-- tsconfig.node.json           Node TS config (vite config files)
+-- package.json                 npm scripts + dependencies
+-- .env.example                 Template: VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
+-- .env.local                   Local secrets (git-ignored)
+-- .gitignore                   Ignores node_modules, dist, .env.local, etc.
+-- .oxlintrc.json               OxLint rules configuration
+-- vercel.json                  SPA rewrite: all paths ? index.html
+-- ALGORITHM.md                 Full documentation of the ranking algorithm
+-- README.md                    This file
¦
+-- public/                      Static assets served at root
¦   +-- favicon.svg              Browser tab icon
¦
+-- skills/                      Custom agent skills (dev tooling, not app code)
¦   +-- Dezine/                  Design-taste skill bundle
¦       +-- ui-ux-pro-max-skill/ UI/UX design intelligence tools
¦       +-- taste-skill/         Design taste & aesthetic guidelines
¦       +-- hallmark/            Brand hallmark guidelines
¦
+-- src/                         All application source code
    +-- main.tsx                 Entry point — route split public vs. app
    +-- App.tsx                  Root layout + state orchestration
    +-- App.css                  App-level component styles
    +-- index.css                Global design system (tokens, layout, all styles)
    +-- assets/                  Static assets bundled by Vite
    ¦   +-- hero.png             Hero image used in auth/landing
    ¦   +-- react.svg            React logo (scaffold leftover)
    ¦   +-- vite.svg             Vite logo (scaffold leftover)
    +-- lib/                     Core logic, types, utilities
    ¦   +-- supabase.ts          Supabase client + all TypeScript interfaces
    ¦   +-- AuthContext.tsx      React context for auth state + profile
    ¦   +-- hooks.ts             All data-fetching custom hooks (622 lines)
    ¦   +-- time.ts              Time formatting utilities
    ¦   +-- sound.ts             Web Audio API notification chime
    +-- components/              All UI components
        +-- Avatar.tsx           Deterministic-color avatar (image or initials)
        +-- TopBar.tsx           Top navigation bar with search
        +-- Sidebar.tsx          Left sidebar (profile card + score widget)
        +-- Feed.tsx             Home feed with post composer + filter tabs
        +-- PostCard.tsx         Individual post card with comments
        +-- Activity.tsx         Activity view (compact or full screen)
        +-- Peers.tsx            Peer discovery grid with pagination
        +-- PeerProfileView.tsx  Full profile view for any peer (in-app)
        +-- Rankings.tsx         Engineering leaderboard
        +-- Chat.tsx             Community chat (channel list + message thread)
        +-- AiChat.tsx           AI assistant (conversations, history, search)
        +-- Notifications.tsx    Notifications list page
        +-- ProfileView.tsx      Logged-in user own profile
        +-- PublicProfile.tsx    Public profile page at /u/:username
        +-- Auth.tsx             Authentication UI (login + multi-step signup)
```

---

### Root Files

**`index.html`** — The single HTML page Vite serves. Sets the page title, loads Google Fonts (Inter, Italiana, Italianno), and mounts the React app at `<div id="root">`. All navigation is client-side.

**`vite.config.ts`** — Minimal Vite config using only `@vitejs/plugin-react` for JSX transform and Fast Refresh.

**`tsconfig.app.json`** — TypeScript config for application source: target ES2023, DOM library, ESNext modules with bundler resolution, strict unused-locals/parameters checks, JSX via react-jsx.

**`package.json`** — Four scripts: `dev` (Vite dev server), `build` (tsc + Vite bundle), `lint` (OxLint), `preview` (serve dist). Runtime deps: supabase-js, lucide-react, react, react-dom. Dev deps: vite, typescript, @types/\*, oxlint.

**`vercel.json`** — Rewrites every URL path to `/index.html`. Required for client-side routing to work on Vercel (direct URL access would 404 without this).

**`ALGORITHM.md`** — Human-readable docs of the entire ranking/trust system. All 7 feed-ranking factors, reputation triggers, peer discovery scoring, and anti-spam rules.

**`.env.example`** — Template showing the two required env vars: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

---

### `src/` — Application Source

**`src/main.tsx`** — Entry point. Checks if the URL matches `/u/:username`. If yes, renders `<PublicProfile username="...">` directly (no auth). For all other URLs, wraps `<App />` in `<AuthProvider>`. This split enables SEO-crawlable public profile pages.

**`src/App.tsx`** — Root layout and state orchestration (260 lines). Manages: `activeTab`, `sidebarOpen`, `searchQuery`, `feedFilter`, `selectedChatId`, `typeMessage`. Invokes all top-level data hooks. Shows spinner on auth loading, shows Auth screen if no session. Transforms raw Supabase data into typed view models. Defines all event handlers and passes them as props. Renders: `TopBar ? main-wrapper ? Sidebar + content-area`.

**`src/index.css`** — Global design system (~1,200 lines). Contains all CSS custom properties (design tokens), layout classes, all component styles, and animation keyframes. Nothing is hardcoded in component files — all colors/fonts reference tokens.

---

### `src/lib/` — Core Logic & Data Layer

**`supabase.ts`** — Creates the singleton Supabase client from env vars. Throws at startup if vars are missing. Exports all TypeScript interfaces: `Profile`, `EngineeringActivity`, `Post`, `PostComment`, `ChatChannel`, `DbMessage`.

**`AuthContext.tsx`** — React Context managing global auth state. On mount: restores session via `getSession()`, fetches profile, subscribes to `onAuthStateChange`. Exports `AuthProvider` and `useAuth()` hook returning `{ session, user, profile, loading, refreshProfile, signOut }`.

**`hooks.ts`** (622 lines) — The entire data layer. Seven custom hooks:

- **`usePosts(userId)`** — Loads 100 posts, parallel-fetches likes/reposts/comments, calls `get_feed_ranking()`, merges original posts + reposts into a ranked `feedItems[]`. Mutations: `createPost`, `toggleLike`, `toggleRepost`, `incrementCommentCount`, `deletePost`, `blockUser`.
- **`usePostComments(postId, enabled)`** — Lazy-loaded comments for a post. `addComment()` inserts and re-fetches.
- **`useEngineeringActivity(userId)`** — Calls `get_engineering_activity` RPC. Returns 8 real engineering metrics.
- **`useActivityCalendar(userId)`** — Calls `get_activity_calendar` RPC. Returns `Map<date, post_count>` for 371 days.
- **`useConnections(userId)`** — Loads all profiles + connections + `get_peer_suggestions()`. Outputs sorted `PeerCard[]`. `toggleConnect()` calls `send_connection_request` RPC or deletes the connection row.
- **`useCommunityChat(userId)`** — Loads channels + 500 messages. Subscribes to Realtime INSERT on messages table. `sendMessage()` inserts into messages.
- **`useNotifications(userId)`** — Loads 50 notifications. Subscribes to Realtime INSERT filtered to current user. New notifications trigger `playNotificationChime()`.
- **`useLeaderboard()`** — Loads profiles + `get_engineering_rankings()` RPC. Merges, sorts by rank_score, slices top 50.

Also exports standalone `uploadPostMedia(userId, file)` — uploads to Supabase Storage `post-media` bucket, returns public CDN URL.

**`time.ts`** — Two pure functions: `formatRelativeTime(iso)` (humanised: "Just now", "5 mins ago", etc.) and `formatClockTime(iso)` (HH:MM AM/PM).

**`sound.ts`** — Singleton Web Audio API context. `playNotificationChime()` plays two sine tones (740 Hz + 988 Hz, 100ms apart) with linear gain ramps.

---

### `src/components/` — UI Components

**`Avatar.tsx`** — Props: `name`, `avatarUrl?`, `size?`, `className?`. Shows circular image if URL loads; falls back to deterministic-colored initials (first letter, color from name hash across 8 presets).

**`TopBar.tsx`** — Top navigation bar (293 lines). Left: hamburger (hidden when activeTab is 'tools') + animated expanding search input (280?360px). Center: nav links (Home Feed, Mentors & Peers, Rankings, Messages). Right: notification bell with badge, Sparkles (AI) button, avatar + profile dropdown menu.

**`Sidebar.tsx`** — Left sidebar (110 lines). Two widgets: (1) Profile card with avatar, name, role, college, active-days stat, projects-shipped badge, peers + rank stats. (2) Proof-of-work score with animated progress bar. Collapses via `.collapsed` CSS class.

**`Feed.tsx`** (317 lines) — Home feed. Post composer (collapses, expands to textarea + difficulty + category + image/video upload). Filter tabs (All/AI-ML/WebDev/OpenSource/Hackathons). Search filter. Maps posts to `<PostCard>`. Loading skeleton on filter change.

**`PostCard.tsx`** (359 lines) — Individual post. Shows: repost banner, author info, AI difficulty badge, content, optional GitHub link + showcase image + code snippet + video. Action row: Like (heart toggles red), Comment (expands thread), Repost (toggles green), More menu (delete own / block others). Nested `PostComments` sub-component loads lazily when expanded.

**`Activity.tsx`** (201 lines) — Activity view. Two variants: `compact` (2 posts, "view all" button, embedded in ProfileView) and `full` (all posts, back button, full screen). Tabs: Posts | Images.

**`Peers.tsx`** (191 lines) — Peer discovery grid. Loading skeleton on mount. Search filter. 8 peers per page with pagination. Click a card to open `PeerProfileView`. Connect/Disconnect button per card.

**`PeerProfileView.tsx`** (629 lines) — Full in-app profile for any peer. Hero section (avatar, name, role, college, GitHub). Tech stack bars. Engineering metrics (8 stats). Trust/verification badges. Year tabs (2025/2026) + GitHub-style contribution calendar grid (53×7 cells, 5 green intensity levels). Achievements list. Read-only (no post editing).

**`Rankings.tsx`** (190 lines) — Engineering leaderboard. Banner showing current user's rank and points gap to #1. Podium cards for top 3 (gold/silver/bronze). Ranked list rows 4-50 with trend arrows, avatars, scores. Current user's row highlighted purple. Loading skeleton on mount.

**`Chat.tsx`** (314 lines) — Community chat. Two-column layout: channel list (left) + message thread (right). Auto-scroll to newest message. Scroll-to-bottom floating button. Incoming/outgoing message bubbles. Message input with send button.

**`AiChat.tsx`** (408 lines) — AI assistant. Conversation history in localStorage. Left panel: conversation list with search + "New chat". Right panel: message history (user right / assistant left) with "Thinking..." indicator. Welcome screen with 4 platform-specific suggestion chips when no conversation is active. Calls Supabase Edge Function `ai-chat` with full conversation history.

**`Notifications.tsx`** (87 lines) — Notification list. Maps emoji icons to Lucide icons. Empty state with centered bell illustration. Each item: icon badge + text + relative time.

**`ProfileView.tsx`** (621 lines) — Own profile page. Header: avatar, name, username, role, college, bio, social links. Share profile link button. Stats row. Tech stack bars. Engineering metrics. Year selector + GitHub contribution calendar grid (built from `useActivityCalendar` data). Trust badges. Compact activity section with "View all" link.

**`PublicProfile.tsx`** (215 lines) — Public read-only profile at `/u/:username`. No auth required. Fetches profile by username field, then posts with engagement counts. Shows avatar, bio, links, and post timeline. Not-found state if username doesn't exist.

**`Auth.tsx`** (467 lines) — Multi-step auth UI. Login mode: email ? password (2 steps). Signup mode: email ? password ? confirm (3 steps) with full name + college picker. Real-time validation. Password visibility toggles. Google + GitHub OAuth buttons (inline SVG icons). Inline error/info messages. Smooth step transitions.

---

## Pages / Views (Tab-Based Routing)

The app uses no router library. Navigation is managed by `activeTab` state in `App.tsx`:

| Tab Value | Component | Sidebar Shown | Notes |
|---|---|---|---|
| `home` | Feed | Yes | Default tab on login |
| `network` | Peers | Yes | Peer discovery + connect |
| `rank` | Rankings | Yes | Engineering leaderboard |
| `messages` | Chat | Yes | Community chat channels |
| `profile` | ProfileView | Yes | Own profile |
| `activity` | Activity (full) | Yes | All own posts |
| `notifications` | Notifications | Yes | Notification list |
| `ai` | AiChat | No | Full-width AI workspace |

---

## Authentication Flow

```
App loads
    |
    +-- authLoading=true ? show spinner
    |
    +-- supabase.auth.getSession() resolves
    |   +-- No session  ?  render Auth component
    |   +-- Session     ?  fetch profile  ?  render main app
    |
    +-- onAuthStateChange subscription (active for app lifetime)
        +-- LOGIN  ?  fetch profile, set session
        +-- LOGOUT ?  clear session + profile  ?  render Auth component
```

Profile creation is handled server-side (Supabase trigger on `auth.users` INSERT creates a `profiles` row). The client only reads and updates profiles.

---

## Real-Time Features

Two Supabase Realtime subscriptions are active at all times when logged in:

1. **`messages-all` channel** — `INSERT` on `messages` table ? triggers `fetchAll()` in `useCommunityChat`. All chat channels update instantly for all connected users.

2. **`notifications-{userId}` channel** — `INSERT` on `notifications` filtered to `user_id=currentUserId` ? appends to notifications list + plays audio chime. Connection request notifications arrive instantly for the recipient.

Both subscriptions are cleaned up when their respective hook unmounts (`supabase.removeChannel(channel)` in useEffect cleanup).

---

## Public Profiles (SEO-friendly)

URL pattern: `/u/:username`

- Handled in `main.tsx` before `AuthProvider` mounts
- `PublicProfile` fetches directly from Supabase with anon key
- No session, cookie, or localStorage required
- Displays: avatar, name, role, college, bio, social links, all posts with engagement counts
- Vercel rewrite in `vercel.json` ensures this path serves `index.html`

---

## AI Chat Integration

`AiChat.tsx` communicates with a Supabase Edge Function at `${VITE_SUPABASE_URL}/functions/v1/ai-chat`.

Request body:
```json
{
  "messages": [{ "role": "user", "content": "..." }],
  "context": "Platform context string with current user info"
}
```

Conversations persist to `localStorage` under key `ai-convos-{userId}`. Device-local only (not synced to DB). Suggestion chips provide platform-specific starting prompts the Edge Function can answer using community data.

---

## Design System & Styling

All styles live in `src/index.css`. CSS custom properties throughout — no hardcoded colors in component files.

**Key design tokens:**

```css
--color-bg-home: #f8f7f4          /* warm off-white page background */
--color-surface: #ffffff           /* card surfaces */
--color-primary: #7c3aed           /* purple accent (brand color) */
--color-primary-soft: #f3f0ff      /* light purple tint */
--color-dark-border: #e5e7eb       /* border color */
--color-text-strong: #111827       /* headings */
--color-text-muted-light: #6b7280  /* secondary text */
--color-warning: #d97706           /* amber (leaderboard gold) */
--font-sans: 'Inter', sans-serif
--font-display: 'Italiana', serif    /* large headings */
--font-specialty: 'Italianno', cursive  /* accent numbers */
```

**Animations:** `fadeIn`, `slideUp`, `fillProgress`, `animate-spin`

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL (e.g. https://xyz.supabase.co) |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase public anon key (safe to include in browser JS) |

Read by `src/lib/supabase.ts` via `import.meta.env`. Vite statically replaces them at build time.

---

## Local Development

```bash
# 1. Clone and install
git clone <repo-url>
cd polywork-main
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local and add your Supabase URL + anon key

# 3. Start dev server
npm run dev
# ? http://localhost:5173

# 4. Optional: Type-check
npx tsc --noEmit

# 5. Optional: Lint
npm run lint
```

**Supabase setup required:**
- Create a Supabase project at supabase.com
- Run the database migrations (tables, RLS policies, triggers, RPCs)
- Enable Google and/or GitHub OAuth providers in Auth dashboard
- Create a `post-media` storage bucket (public read, authenticated write)
- Deploy the `ai-chat` Edge Function

---

## Deployment

The app deploys to **Vercel** as a static SPA:

1. Push to your Git repository
2. Connect to Vercel, set env variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
3. Build command: `npm run build` | Output directory: `dist`
4. `vercel.json` handles the SPA rewrite so all paths serve `index.html`

---

## Skills Folder

The `skills/` directory at the project root is **not part of the application code**. It contains agent skill definitions used during development with AI coding assistants:

```
skills/
+-- Dezine/
    +-- ui-ux-pro-max-skill/   Design intelligence search and style database
    +-- taste-skill/            Design taste and aesthetic guidelines
    +-- hallmark/               Brand identity guidelines
```

These are instruction files (SKILL.md, README.md) and supporting scripts used by AI agents to guide design decisions during development. They have no effect on the deployed application.

---

*Built with React 19 + Vite + TypeScript + Supabase. Deployed on Vercel.*
