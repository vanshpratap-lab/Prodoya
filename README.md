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
11. [Refresh (Polling, No Websockets Yet)](#refresh-polling-no-websockets-yet)
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

Every post is assigned a **difficulty level** (Beginner / Intermediate / Advanced) and **points** are automatically awarded. A server-side ranking algorithm orders the feed based on engagement, time decay, author reputation, and your personal network — all computed in the Rails API so nothing can be gamed from the client.

The platform includes:
- A **ranked social feed** with proof-of-work posts
- A **leaderboard** based on real engineering metrics
- A **Mentors & Peers discovery** system with algorithmic suggestions
- **Community chat channels** with real-time messaging
- **Personal profiles** with a GitHub-style contribution calendar
- **Public profile pages** accessible without login (SEO-ready)
- An **AI assistant** proxied through the Rails API (`POST /api/v1/ai_chat`)
- A **tools/workspace area** (Notion-style panel UI) for advanced productivity workflows

---

## Why It Was Created

Traditional student social platforms (LinkedIn, Twitter) reward followers and luck. They do not surface *what you actually built*. This project was created to solve a specific problem:

> **How do you measure an engineering student's real output in a verifiable, community-reviewed way?**

The answer: make every post a proof-of-work artifact. Attach difficulty grades. Let the algorithm surface harder, more engaged work. Let peers validate through likes, comments, and reposts. Cap self-gaming with server-side auth checks. The result is a trustworthy signal of who is actually doing the work.

---

## Live Features

| Feature | Status | Notes |
|---|---|---|
| Email/password auth | Yes | Multi-step signup flow with username + college picker, JWT in localStorage |
| Google OAuth | No | Buttons present but disabled — no OAuth provider wired up yet |
| GitHub OAuth | No | Buttons present but disabled — no OAuth provider wired up yet |
| Post creation | Yes | Text + difficulty + category + image/video |
| Ranked feed | Yes | Server-side algorithm in the Rails API |
| Likes / Reposts / Comments | Yes | Optimistic UI + server-side toggles |
| Blocking | Yes | Removed from feed |
| Leaderboard | Yes | Top 50 ranked by engineering metrics |
| Peer discovery | Yes | Algorithmic suggestions (mutual + college + reputation) |
| Peer profiles (in-app) | Yes | Full profile view for any peer |
| Public profiles (/u/username) | Yes | No login required, SEO-ready |
| Community chat | Yes | Multi-channel, polling refresh (10s) |
| Notifications | Yes | Polling refresh (15s) + audio chime |
| AI assistant | Yes | Conversation history, new chat, search (needs `ANTHROPIC_API_KEY` on server) |
| Contribution calendar | Yes | GitHub-style 371-day grid from real post data |
| Engineering activity metrics | Yes | Active days, projects built, contributions |
| Sidebar (collapsible) | Yes | Profile card + proof-of-work score |
| Audio feedback | Yes | Web Audio API chime on connections/notifications |

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
| **Backend / DB** | Ruby on Rails 8.1 API + SQLite (`backend/`) |
| **Auth** | Email/password with Devise + devise-jwt (30-day tokens in localStorage) |
| **Refresh** | Polling (chat 10s, notifications 15s) — no websockets yet |
| **Storage** | Rails ActiveStorage, local disk (`backend/storage/`) |
| **AI Chat** | Rails proxy to Anthropic API (`POST /api/v1/ai_chat`) |
| **Linting** | OxLint |
| **Deployment** | Static SPA (`dist/`) + separately hosted Rails API |

---

## Architecture Overview

```
Browser (React SPA, http://localhost:5173)
    |
    +-- main.tsx --------------- Entry point: /u/:username -> PublicProfile, else App
    |
    +-- AuthProvider (Context) -- Wraps entire app, holds token/profile
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

    |  All data goes through src/lib/api.ts (typed fetch client,
    |  JWT from localStorage). In dev, Vite proxies /api/* to Rails.
    v
Rails JSON API (http://localhost:3000, backend/)
    +-- SQLite database (backend/storage/development.sqlite3)
    |       users, posts, connections, messages, channels,
    |       notifications, post_likes, post_reposts, post_comments, user_blocks
    +-- Devise + devise-jwt auth (POST /api/v1/auth/sign_in|up, DELETE .../sign_out)
    +-- REST endpoints under /api/v1 (posts, profiles, peers, leaderboard,
    |       chat, notifications, search, reports, uploads, ai_chat)
    +-- Server-side feed ranking (engagement x decay x difficulty)
    +-- ActiveStorage uploads on local disk
```

---

## Database Schema & Backend

All data lives in SQLite, accessed only through the Rails JSON API (`backend/`). The client never does raw SQL — it calls typed REST endpoints under `/api/v1` with a JWT bearer token.

### Tables

| Table | Purpose |
|---|---|
| `users` | One row per user: id, email, username, full_name, college, role, avatar_url, cover_url, bio, github_url, linkedin_url, twitter_url, tech_stack (JSON), points, last_post_at, jti, created_at |
| `posts` | Proof-of-work posts: id, user_id, content, tags[], difficulty, points, code_snippet, github_url, image_urls[], video_url, created_at |
| `post_likes` | Many-to-many: post_id + user_id (one row per user per post) |
| `post_reposts` | Same structure as likes but tracks reposts and timestamp |
| `post_comments` | post_id, user_id, body, created_at, joined with users |
| `connections` | Peer connections: requester_id, addressee_id (bidirectional lookup) |
| `channels` | Community channels + 1-on-1 DMs: id, name, emoji, description, participant_1/2 (null = public) |
| `messages` | Channel messages: channel_id, user_id, body, created_at, joined with users |
| `notifications` | Per-user: user_id, icon, body, category, actor_id, read_at, created_at |
| `user_blocks` | blocker_id, blocked_id. Blocked users are invisible everywhere. |

### Key API Endpoints (`backend/app/controllers/api/v1/`)

| Endpoint | What It Does |
|---|---|
| `POST /api/v1/auth/sign_up` | Creates user (+ auto-generates username if blank), returns JWT + profile |
| `POST /api/v1/auth/sign_in` | Email/password login, returns JWT + profile |
| `DELETE /api/v1/auth/sign_out` | Revokes the JWT (jti rotation) |
| `GET /api/v1/posts` | Ranked feed: `{ posts, reposts, ranks }` with like/repost/comment counts |
| `POST /api/v1/posts` | Creates a post, awards difficulty points (10/20/35) |
| `POST /api/v1/posts/:id/{like,repost,save}` | Toggles engagement |
| `GET+POST /api/v1/posts/:post_id/comments` | Lists / adds comments (notifies the author) |
| `GET /api/v1/peers` | All profiles + `{ peer_id: score }` suggestions + `connected_ids` |
| `POST /api/v1/users/:id/connect` | Toggles a connection (notifies the peer on connect) |
| `GET /api/v1/leaderboard` | Top 50 rows with composite rank scores |
| `GET /api/v1/users/:id/{activity,calendar}` | 8 engineering metrics + 371-day contribution grid |
| `GET /api/v1/chat`, `POST /api/v1/chat/messages`, `POST /api/v1/chat/direct` | Channels + messages, send, open-or-create DM (connected peers only) |
| `GET/POST /api/v1/notifications` (+ `mark_read`, `read_all`) | Lists / creates / reads / deletes notifications |
| `POST /api/v1/uploads` | ActiveStorage upload, returns `{ url }` |
| `POST /api/v1/ai_chat` | `{ messages }` → Anthropic proxy, returns `{ reply }` |
| `GET /api/v1/profiles/:username` | Public profile lookup (no post data needed for auth) |

---

## Ranking & Trust Algorithm

> See [ALGORITHM.md](./ALGORITHM.md) for the full mathematical breakdown.

The ranking system runs 100% in the Rails API — the browser cannot manipulate scores.

### Feed Ranking (`PostsController#build_ranks`)

Each post's score combines engagement, freshness, and difficulty:

| Factor | Formula | Rationale |
|---|---|---|
| Engagement | `1 + likes×1 + comments×3 + reposts×5` | Comments beat likes; reposts signal real value |
| Time decay | `1 / (age_days + 2)` | Fresh wins unless engagement is real |
| Difficulty | `beginner×1.0 · intermediate×1.15 · advanced×1.3` | Harder posts rank higher |

### Reputation Points

- Post created → +10 / +20 / +35 pts (by difficulty), added to the author's `users.points`
- Leaderboard score = points + activity metrics (active days, projects, open source, community, AI impact)

### Peer Discovery (`PeersController#index`)

```
score = mutual_connections×2 + same_college×1 + points/100
```

### Anti-Spam

- All writes require a valid JWT for the acting user — `current_user` must match the author
- Blocked users are excluded from feeds, DMs require an existing connection

---

## Project Structure — Every File Explained

```
Engineer-Network/ (repo root)
+-- index.html                   HTML shell, Google Fonts, viewport meta
+-- vite.config.ts               Vite config (React plugin + /api proxy to Rails :3000)
+-- tsconfig.json                Root TS config (references app + node)
+-- tsconfig.app.json            App TS config (ES2023, jsx, strict linting)
+-- tsconfig.node.json           Node TS config (vite config files)
+-- package.json                 npm scripts + dependencies (no backend SDK)
+-- .env.example                 Notes: no frontend env vars needed; backend keys below
+-- .gitignore                   Ignores node_modules, dist, .env, etc.
+-- .oxlintrc.json               OxLint rules configuration
+-- vercel.json                  SPA rewrite: all paths ? index.html
+-- ALGORITHM.md                 Full documentation of the ranking/trust system
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
+-- backend/                     Ruby on Rails 8.1 JSON API (see backend/README.md)
¦   +-- app/controllers/api/v1/  All endpoints (sessions, registrations, posts,
¦   ¦                            profiles, peers, leaderboard, chat, notifications,
¦   ¦                            search, reports, uploads, ai_chat)
¦   +-- app/models/              User (Devise + JWT), Post, Channel, Message,
¦   ¦                            Notification, Connection, UserBlock, ...
¦   +-- app/lib/api_serializer.rb Shapes the exact JSON the React app consumes
¦   +-- config/routes.rb         All /api/v1 routes
¦   +-- db/                      Migrations + seeds (demo users, channels)
¦   +-- storage/                 SQLite DB + ActiveStorage uploads (git-ignored)
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
    ¦   +-- api.ts               Typed fetch client (JWT header, 401 handling) + authApi
    ¦   +-- supabase.ts          TypeScript interfaces only (legacy name, no client)
    ¦   +-- AuthContext.tsx      React context for auth state + profile (localStorage JWT)
    ¦   +-- hooks.ts             All data-fetching custom hooks
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

**`vite.config.ts`** — React plugin for JSX transform and Fast Refresh, plus a dev-server proxy: `/api/*` → `http://localhost:3000` (the Rails API).

**`tsconfig.app.json`** — TypeScript config for application source: target ES2023, DOM library, ESNext modules with bundler resolution, strict unused-locals/parameters checks, JSX via react-jsx.

**`package.json`** — Four scripts: `dev` (Vite dev server), `build` (tsc + Vite bundle), `lint` (OxLint), `preview` (serve dist). Runtime deps: lucide-react, react, react-dom. Dev deps: vite, typescript, @types/*, oxlint.

**`vercel.json`** — Rewrites every URL path to `/index.html`. Required for client-side routing to work on Vercel (direct URL access would 404 without this).

**`ALGORITHM.md`** — Human-readable docs of the entire ranking/trust system. All 7 feed-ranking factors, reputation triggers, peer discovery scoring, and anti-spam rules.

**`.env.example`** — Notes on setup: the frontend needs no env vars (API base is `/api/v1`, proxied in dev); backend secrets (`DEVISE_JWT_SECRET`, `ANTHROPIC_API_KEY`) are documented there.

---

### `src/` — Application Source

**`src/main.tsx`** — Entry point. Checks if the URL matches `/u/:username`. If yes, renders `<PublicProfile username="...">` directly (no auth). For all other URLs, wraps `<App />` in `<AuthProvider>`. This split enables SEO-crawlable public profile pages.

**`src/App.tsx`** — Root layout and state orchestration. Manages: `activeTab`, `sidebarOpen`, `searchQuery`, `feedFilter`, `selectedChatId`, `typeMessage`. Invokes all top-level data hooks. Shows spinner on auth loading, shows Auth screen if no token/profile. Transforms API posts into typed view models. Defines all event handlers and passes them as props. Renders: `TopBar → main-wrapper → Sidebar + content-area`.

**`src/index.css`** — Global design system (~1,200 lines). Contains all CSS custom properties (design tokens), layout classes, all component styles, and animation keyframes. Nothing is hardcoded in component files — all colors/fonts reference tokens.

---

### `src/lib/` — Core Logic & Data Layer

**`api.ts`** — Typed fetch client for the Rails API. Base path `/api/v1`, JWT from `localStorage` (`auth_token`) sent as bearer header, 401 handling (single reload only when a stale token existed), `FormData` upload helper. Exports `api` (`get/post/put/patch/delete/postForm`) and `authApi` (`signIn/signUp/signOut/me`).

**`supabase.ts`** — TypeScript interfaces only (`Profile`, `EngineeringActivity`, `Post`, `PostComment`, `ChatChannel`, `DbMessage`, `AuthTokens`). Legacy filename; there is no Supabase client anymore.

**`AuthContext.tsx`** — React Context managing global auth state. On mount: reads JWT from `localStorage`, fetches profile via `GET /api/v1/users/me`. Exports `AuthProvider` and `useAuth()` hook returning `{ token, profile, loading, refreshProfile, signOut }`.

**`hooks.ts`** — The entire data layer, calling the Rails endpoints above. Custom hooks:

- **`usePosts(userId)`** — Loads the ranked feed (`GET /api/v1/posts` returns `{ posts, reposts, ranks }`), merges original posts + repost activity into ranked `feedItems[]`. Mutations: `createPost`, `toggleLike`, `toggleRepost`, `toggleSave`, `incrementCommentCount`, `deletePost`, `blockUser`.
- **`usePostComments(postId, enabled)`** — Lazy-loaded comments (`GET /api/v1/posts/:id/comments`). `addComment()` posts and re-fetches.
- **`useEngineeringActivity(userId)`** — `GET /api/v1/users/:id/activity`. Returns 8 real engineering metrics.
- **`useActivityCalendar(userId)`** — `GET /api/v1/users/:id/calendar`. Returns `Map<date, post_count>` for 371 days.
- **`useConnections(userId)`** — `GET /api/v1/peers` (profiles + suggestion scores + connected ids). Outputs sorted `PeerCard[]`. `toggleConnect()` hits `POST /api/v1/users/:id/connect`.
- **`useCommunityChat(userId)`** — `GET /api/v1/chat` (channels + messages), 10s polling refresh. `sendMessage()` posts to `/api/v1/chat/messages`; `startDirectChat()` opens/creates a DM via `/api/v1/chat/direct`.
- **`useNotifications(userId)`** — `GET /api/v1/notifications`, 15s polling refresh. New unread items trigger `playNotificationChime()`. `markRead` / `markAllRead` / `deleteNotification` included.
- **`useLeaderboard()`** — `GET /api/v1/leaderboard`. Sorts by rank_score, slices top 50.

Also exports standalone helpers: `uploadPostMedia` / `updateProfileCover` / `updateProfileAvatar` (via `POST /api/v1/uploads`), `updateProfileDetails` (via `PATCH /api/v1/users/me`), `searchEverything` (via `GET /api/v1/search`), `submitContentReport` (via `POST /api/v1/reports`).

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

**`AiChat.tsx`** (408 lines) — AI assistant. Conversation history in localStorage. Left panel: conversation list with search + "New chat". Right panel: message history (user right / assistant left) with "Thinking..." indicator. Sends full conversation history to `POST /api/v1/ai_chat`.

**`Notifications.tsx`** (87 lines) — Notification list. Maps emoji icons to Lucide icons. Empty state with centered bell illustration. Each item: icon badge + text + relative time.

**`ProfileView.tsx`** (621 lines) — Own profile page. Header: avatar, name, username, role, college, bio, social links. Share profile link button. Stats row. Tech stack bars. Engineering metrics. Year selector + GitHub contribution calendar grid (built from `useActivityCalendar` data). Trust badges. Compact activity section with "View all" link.

**`PublicProfile.tsx`** (215 lines) — Public read-only profile at `/u/:username`. No auth required. Fetches via `GET /api/v1/profiles/:username` and `/api/v1/users/:id/posts`. Shows avatar, bio, links, and post timeline. Not-found state if username doesn't exist.

**`Auth.tsx`** (467 lines) — Multi-step auth UI. Login mode: email → password (2 steps). Signup mode: full name + username + college + email → password → confirm (3 steps) with real-time validation. Password visibility toggles. Google + GitHub OAuth buttons are present but disabled (no provider wired up yet). Inline error/info messages. Smooth step transitions.

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
    +-- authLoading=true → show spinner
    |
    +-- Read JWT from localStorage (auth_token)
    |   +-- No token  →  render Auth component
    |   +-- Token     →  GET /api/v1/users/me  →  render main app
    |
    +-- Login/signup success  →  store token, reload  →  main app
    +-- Logout  →  DELETE /api/v1/auth/sign_out (revokes JWT),
                    clear token + profile  →  render Auth component
    +-- Any API call returns 401 with a stale token  →  single reload to Auth
```

Signup (`POST /api/v1/auth/sign_up`) takes email + password + full_name + college + username; a blank username is auto-generated server-side from the email. Tokens are JWTs valid for 30 days (`devise-jwt`, jti rotation on sign-out).

---

## Refresh (Polling, No Websockets Yet)

Two polling loops run while logged in (no realtime subscriptions yet):

1. **Chat** — `useCommunityChat` re-fetches `GET /api/v1/chat` every 10s, so new messages appear for all viewers.
2. **Notifications** — `useNotifications` re-fetches `GET /api/v1/notifications` every 15s; newly arrived unread items play the audio chime.

Both intervals are cleaned up when their hook unmounts or the user logs out (fetches no-op without a token).

---

## Public Profiles (SEO-friendly)

URL pattern: `/u/:username`

- Handled in `main.tsx` before `AuthProvider` mounts
- `PublicProfile` fetches via the Rails API (`GET /api/v1/profiles/:username`), same origin through the Vite `/api` proxy in dev
- No token or localStorage required
- Displays: avatar, name, role, college, bio, social links, all posts with engagement counts
- `vercel.json` rewrite ensures this path serves `index.html` on static hosts

---

## AI Chat Integration

`AiChat.tsx` sends the conversation to the Rails API:

```json
POST /api/v1/ai_chat
{ "messages": [{ "role": "user", "content": "..." }] }
```

The controller proxies to the Anthropic Messages API and returns `{ "reply": "..." }`. Requires `ANTHROPIC_API_KEY` in the Rails environment (otherwise the endpoint returns 503).

Conversations persist to `localStorage` under key `ai-convos-{userId}`. Device-local only (not synced to DB).

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

The frontend needs **no** env vars (API base is `/api/v1`, proxied to Rails by Vite in dev). Backend secrets live in `backend/` and are never committed:

| Variable | Required | Description |
|---|---|---|
| `DEVISE_JWT_SECRET` | No | JWT signing secret. Falls back to Rails `secret_key_base`. Set it in production. |
| `ANTHROPIC_API_KEY` | For AI chat | Anthropic API key used by `POST /api/v1/ai_chat`. Without it the endpoint returns 503. |
| `SECRET_KEY_BASE` | Production | Rails secret. In dev it comes from `backend/config/credentials.yml.enc` + local `master.key` (git-ignored, never commit it). |

---

## Local Development

Two servers run together: **Rails API on `:3000`** + **Vite frontend on `:5173`** (proxies `/api/*` to Rails).

### Prerequisites

- **Ruby 3.4.10** (see `backend/.ruby-version` — via mise/rbenv/rvm) + `bundler`
- **Node ≥ 20** + npm

### Steps (clone → open in browser)

```bash
# 1. Clone and enter the repo
git clone <repo-url>
cd Prodoya

# 2. Backend: install gems, create + seed the database
cd backend
bundle install
bin/rails db:prepare   # runs migrations + seeds demo users and channels

# 3. Start the Rails API (keep this terminal running)
bin/rails server -p 3000
# → http://localhost:3000  (API only; opening it directly shows 401 JSON, that's normal)

# 4. In a NEW terminal: install + start the frontend
cd Prodoya
npm install
npm run dev
# → http://localhost:5173
```

### Open the app

1. Go to **http://localhost:5173** — the login screen appears (no flicker, no API calls until you act).
2. Either **sign up** (full name + username + college + email + password), or log in with a seeded account:
   - Email `engineer1@example.com`, password `password123` (more demo users in `backend/db/seeds.rb`)
3. Done — feed, peers, chat, leaderboard, notifications all work against your local Rails server.

### Verify both servers are up

```bash
curl -s -o /dev/null -w "rails:%{http_code}\n" http://localhost:3000/api/v1/posts   # expect 401 (means API is up, you just need login)
curl -s -o /dev/null -w "vite:%{http_code}\n" http://localhost:5173/                 # expect 200
```

### Optional

```bash
npx tsc -b     # Type-check
npm run lint   # Lint
npm run build  # Production bundle → dist/
```

**Backend notes:**
- SQLite database + uploads live in `backend/storage/` (git-ignored — each clone starts fresh from seeds)
- `ANTHROPIC_API_KEY` must be exported before starting Rails for AI chat to work (otherwise `/api/v1/ai_chat` returns 503)
- First boot without `backend/config/master.key` falls back to `DEVISE_JWT_SECRET`; set one of them if auth misbehaves

---

## Deployment

The app ships as two pieces:

1. **Frontend** — static SPA: `npm run build` → `dist/`. Host anywhere static (Vercel, Netlify, nginx). `vercel.json` handles the SPA rewrite so all paths serve `index.html`. The app calls same-origin `/api/v1/*`, so configure the host to proxy `/api/*` to the Rails server.
2. **Backend** — Rails 8.1 app in `backend/` (SQLite via ActiveStorage-local by default). Needs `SECRET_KEY_BASE` (or `DEVISE_JWT_SECRET`) and optionally `ANTHROPIC_API_KEY` in the environment.

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

*Built with React 19 + Vite + TypeScript + Ruby on Rails 8.1.*
