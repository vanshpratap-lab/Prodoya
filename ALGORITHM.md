# Engineer Network — Ranking & Trust Algorithm

All scoring runs in Postgres (Supabase), so every client sees the same ranking and
nothing can be faked from the browser. Two RPCs power it: `get_feed_ranking()` and
`get_peer_suggestions()`, both `SECURITY DEFINER`, executable by authenticated users only.

## 1. Feed ranking — `get_feed_ranking()`

Each post's score is a product of seven factors:

| Factor | Formula | Why |
|---|---|---|
| Engagement | `1 + likes×1 + comments×3 + reposts×5` | Comments beat likes; reposts spread content, so they weigh most (X-style). |
| Time decay | `1 / (age_hours + 2)^1.5` | Power-law decay (Hacker-News-style): fresh content wins unless older content earned real engagement. |
| Difficulty | beginner ×1.0 · intermediate ×1.15 · advanced ×1.3 | Rewards harder, AI-graded proof-of-work. |
| Author quality | `1 + min(points, 2000)/4000` (max ×1.5) | Reputation compounds reach, but is capped so big accounts can't dominate forever. |
| Affinity | ×1.5 if you're connected to the author | Your network ranks higher for you (personalized per viewer). |
| Discovery boost | ×1.2 if the author joined < 7 days ago | Solves cold start: new members get a temporary reach boost. |
| Block penalty | `1 / (1 + blocks_against_author × 0.5)` | Accounts many people block lose reach platform-wide. |

Posts from anyone you blocked (or who blocked you) are removed from your feed entirely.
Reposts re-enter the feed as fresh activity, which is the built-in virality loop.

## 2. Reputation points (DB triggers, fire on every like/comment/repost)

- Someone likes your post → **+2 pts** · comments → **+3 pts** · reposts → **+5 pts**
- Undo (unlike/un-repost/delete) subtracts the same amount; points floor at 0.
- Self-engagement earns nothing.
- Posting itself still awards AI-graded points (+10/+20/+35 by difficulty).

## 3. Peer discovery — `get_peer_suggestions()`

`score = mutual_connections×3 + same_college×2 + min(points,2000)/1000 + new_member×1`

The Mentors & Peers grid is ordered by this score; blocked users never appear.

## 4. Anti-spam

- Rate limit: max **5 posts per rolling hour** per account (DB trigger, cannot be bypassed client-side).
- All writes go through RLS; scores are computed server-side.
