# Blokus
Recreating Blokus to be played online.

## Setup Checklist
- Create a Supabase project.
- Run `supabase/schema.sql` in Supabase SQL Editor.
- Reload schema cache: Supabase Dashboard → Settings → API → Reload schema cache.
- Verify tables exist (`games`, `players`, `moves`) in Table Editor.
- Verify Realtime publication includes tables:
  ```sql
  select * from pg_publication_tables where pubname = 'supabase_realtime';
  ```
- Create `.env` based on `.env.example` with your Supabase URL and anon key.
- Install dependencies: `npm install`
- Run the app: `npm run dev`

## Environment Variables
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Local Play Modes
- Single player uses offline mode and AI.
- Multiplayer uses Supabase Realtime.

## Multiplayer QA Checklist
- Confirm `supabase/schema.sql` is applied and schema cache is refreshed.
- Create a room in one window and join from at least one other window.
- Start the game once 4 players join.
- Place a piece and verify it appears in all windows.
- Verify turn order advances correctly after confirm or pass.
- Ensure “Active” badge matches the current player in all windows.
- Pass turns until all players have passed; confirm game ends and standings show.

## Deploy Notes
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your hosting provider.
- Ensure Supabase Realtime is enabled for `games`, `players`, and `moves`.
