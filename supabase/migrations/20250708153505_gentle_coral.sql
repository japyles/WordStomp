/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - references auth.users
      - `username` (text, unique) - display name
      - `email` (text, unique) - user email
      - `highlight_color` (text) - player's preferred highlight color
      - `avatar_url` (text, optional) - profile picture URL
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policies for users to read public data and update their own data
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  highlight_color text DEFAULT '#8B5CF6',
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read all public user data
CREATE POLICY "Users can read public user data"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own data
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);