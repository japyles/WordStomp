-- Add RLS policies for users table

-- Allow users to insert their own profile
CREATE POLICY "Allow users to insert their own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update their own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow public read access to user profiles
CREATE POLICY "Allow public read access to user profiles"
  ON public.users
  FOR SELECT
  TO public
  USING (true);
