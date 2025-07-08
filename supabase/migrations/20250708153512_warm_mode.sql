/*
  # Create games table

  1. New Tables
    - `games`
      - `id` (uuid, primary key)
      - `word_list` (text array) - words to find
      - `grid_size` (jsonb) - {width, height}
      - `category` (text) - word search category
      - `start_time` (timestamp, nullable)
      - `end_time` (timestamp, nullable)
      - `participants` (text array) - user IDs
      - `game_state` (jsonb) - current game state
      - `tournament_id` (uuid, nullable) - reference to tournament
      - `status` (text) - waiting, active, completed
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `games` table
    - Add policies for participants to read and update game data
*/

CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word_list text[] NOT NULL,
  grid_size jsonb NOT NULL,
  category text NOT NULL,
  start_time timestamptz,
  end_time timestamptz,
  participants text[] NOT NULL DEFAULT '{}',
  game_state jsonb NOT NULL,
  tournament_id uuid,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Participants can read games they're part of
CREATE POLICY "Participants can read their games"
  ON games
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = ANY(participants));

-- Participants can update games they're part of
CREATE POLICY "Participants can update their games"
  ON games
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = ANY(participants))
  WITH CHECK (auth.uid()::text = ANY(participants));

-- Authenticated users can create games
CREATE POLICY "Authenticated users can create games"
  ON games
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = ANY(participants));