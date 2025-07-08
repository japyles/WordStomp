/*
  # Create leaderboards table

  1. New Tables
    - `leaderboards`
      - `id` (uuid, primary key)
      - `type` (text) - all-time, tournament, weekly
      - `user_id` (uuid) - references users.id
      - `score` (integer) - player score
      - `rank` (integer) - player rank
      - `streak` (integer) - winning streak
      - `tournament_id` (uuid, nullable) - reference to tournament
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `leaderboards` table
    - Add policies for users to read all leaderboard data
*/

CREATE TABLE IF NOT EXISTS leaderboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('all-time', 'tournament', 'weekly')),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  rank integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  tournament_id uuid REFERENCES tournaments(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

-- Users can read all leaderboard data
CREATE POLICY "Users can read all leaderboard data"
  ON leaderboards
  FOR SELECT
  TO authenticated
  USING (true);

-- System can insert leaderboard entries
CREATE POLICY "System can insert leaderboard entries"
  ON leaderboards
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- System can update leaderboard entries
CREATE POLICY "System can update leaderboard entries"
  ON leaderboards
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);