# Injury Tracker

Mobile-first injury tracker for a small climbing group.

## What is included

- Lightweight gate question: `which day is the game night?`
- Answer: `wednesday`
- People view with search, active/should rest/resting stats, and body markers
- Return timeline for members who should rest or are resting
- Member detail pages with current and past injuries
- Four digit member PIN for editing; default PIN is `0000`
- Automatic activity state calculation with optional manual override
- Local browser storage fallback for demo use
- Supabase schema, seed data, PIN-protected RPCs, and realtime subscriptions

## Run locally

This app has no build step.

```bash
cd injury-tracker
python3 -m http.server 5173
```

Open:

```text
http://127.0.0.1:5173/
```

You can also run:

```bash
npm run dev
```

## Supabase setup

1. Create a new Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Run `supabase/seed.sql` in the SQL editor.
4. Copy `src/config.example.js` to `src/config.js` if needed.
5. Set `supabaseUrl` and `supabaseAnonKey` in `src/config.js`.

The anon key is expected to be public. Direct table writes are blocked by RLS.
Edits go through security definer RPCs that verify the member PIN.

## Deploy

Because this is static HTML/CSS/JS, it can be hosted on GitHub Pages, Vercel,
Netlify, Cloudflare Pages, or any static file host.

For GitHub Pages, push the `main` branch to GitHub, then open repository
settings and set Pages to deploy from the `main` branch with `/root` as the
folder.

## Privacy note

The landing question is lightweight gatekeeping, not strong authentication. The
member PIN protects edit actions in Supabase, but public read access is enabled
by design for the shared group board.
