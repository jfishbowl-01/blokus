-- Games table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished')),
  current_player_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  color TEXT NOT NULL CHECK (color IN ('blue', 'yellow', 'red', 'green')),
  player_name TEXT,
  has_passed BOOLEAN DEFAULT FALSE,
  remaining_pieces JSONB DEFAULT '[]',
  join_order INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(game_id, color),
  UNIQUE(game_id, join_order)
);

-- Moves table
CREATE TABLE IF NOT EXISTS moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  piece_id INT NOT NULL,
  grid_positions JSONB NOT NULL,
  placed_at TIMESTAMP DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE moves;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE games;
