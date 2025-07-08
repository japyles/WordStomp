/*
  # Create notifications table

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - references users.id
      - `type` (text) - challenge, tournament, achievement
      - `title` (text) - notification title
      - `message` (text) - notification message
      - `read_status` (boolean) - whether notification is read
      - `metadata` (jsonb) - additional data
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `notifications` table
    - Add policies for users to read and update their own notifications
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('challenge', 'tournament', 'achievement')),
  title text NOT NULL,
  message text NOT NULL,
  read_status boolean DEFAULT false,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- System can insert notifications
CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);