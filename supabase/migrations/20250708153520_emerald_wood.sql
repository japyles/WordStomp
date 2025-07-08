/*
  # Create tournaments table

  1. New Tables
    - `tournaments`
      - `id` (uuid, primary key)
      - `name` (text) - tournament name
      - `start_time` (timestamp)
      - `end_time` (timestamp)
      - `participants` (text array) - user IDs
      - `current_round` (integer) - current round number
      - `max_rounds` (integer) - total rounds
      - `status` (text) - upcoming, active, completed
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `tournaments` table
    - Add policies for participants to read tournament data
*/

CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  participants text[] NOT NULL DEFAULT '{}',
  current_round integer DEFAULT 1,
  max_rounds integer DEFAULT 3,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all tournaments
CREATE POLICY "Authenticated users can read tournaments"
  ON tournaments
  FOR SELECT
  TO authenticated
  USING (true);

-- Participants can update tournaments they're part of
CREATE POLICY "Participants can update their tournaments"
  ON tournaments
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = ANY(participants))
  WITH CHECK (auth.uid()::text = ANY(participants));

-- Authenticated users can create tournaments
CREATE POLICY "Authenticated users can create tournaments"
  ON tournaments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);