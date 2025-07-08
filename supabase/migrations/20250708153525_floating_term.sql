/*
  # Create user stats table

  1. New Tables
    - `user_stats`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - references users.id
      - `total_games` (integer) - total games played
      - `games_won` (integer) - games won
      - `games_lost` (integer) - games lost
      - `longest_streak` (integer) - longest winning streak
      - `current_streak` (integer) - current winning streak
      - `fastest_time` (integer) - fastest completion time in seconds
      - `average_time` (integer) - average completion time in seconds
      - `words_found` (integer) - total words found
      - `tournaments_won` (integer) - tournaments won
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_stats` table
    - Add policies for users to read all stats and update their own
*/

CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  total_games integer DEFAULT 0,
  games_won integer DEFAULT 0,
  games_lost integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  fastest_time integer DEFAULT 0,
  average_time integer DEFAULT 0,
  words_found integer DEFAULT 0,
  tournaments_won integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Users can read all user stats
CREATE POLICY "Users can read all user stats"
  ON user_stats
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own stats
CREATE POLICY "Users can update own stats"
  ON user_stats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can insert their own stats
CREATE POLICY "Users can insert own stats"
  ON user_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);