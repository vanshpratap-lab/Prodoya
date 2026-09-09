# Prodoya — Engineer Network (Rails)

> Proof-of-work community for engineering students. A minimalist Ruby on Rails
> rewrite of the original React + Supabase app.

## Features

- **Auth** — Devise (email + password), profile fields on signup (name, username, college, role)
- **Feed** — ranked by proof-of-work score (engagement × time decay × difficulty), computed in SQL
- **Posts** — text + difficulty (beginner/intermediate/advanced) + optional code snippet + GitHub link
- **Engagement** — likes (+2), comments (+3), reposts (+5), points awarded via model callbacks
- **Blocking** — hide a user's posts from your feed
- **Peers** — directory of engineers, connect/disconnect (creates a notification)
- **Leaderboard** — top 50 by points
- **Chat** — community channels with message history
- **Notifications** — connections, comments, with mark-all-read
- **Profiles** — `users/:id` (in-app) and `/u/:username` (public, no login)

## Stack

Ruby 3.4, Rails 8.1, SQLite, Tailwind-like custom CSS, Devise, Hotwire (Turbo).

## Getting started

```bash
bundle install
bin/rails db:create db:migrate db:seed
bin/rails server
# → http://localhost:3000
```

Seed login: `engineer1@example.com` / `password123` (5 seeded users).

## Routes

| Path | Purpose |
|---|---|
| `/` | Ranked feed (auth) |
| `/posts` | Create post |
| `/posts/:id/like` `/repost` `/block` | Toggle engagement / block author |
| `/peers` | Peer directory + connect |
| `/leaderboard` | Top 50 by points |
| `/channels` | Community chat |
| `/notifications` | Notifications |
| `/u/:username` | Public profile (no auth) |

## Ranking

Feed order uses the Postgres-style formula simplified for SQLite:

```
score = (likes×1 + comments×3 + reposts×5 + 1)
      × 1/(age_days + 2)
      × difficulty (1.0 / 1.15 / 1.3)
```

Implemented as a `ranked` scope on `Post` (`app/models/post.rb`).

## Notes

- `json` pinned to `~> 2.9` — the `3.0.1` pure-Ruby parser crashes on Ruby 3.4
  during session decryption.
- ActionMailer is disabled; password-reset emails are not sent in this build.
- Omakase-style code; `bundle exec rubocop --only Lint` passes.