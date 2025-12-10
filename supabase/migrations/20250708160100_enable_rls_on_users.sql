-- Enable RLS on users table if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow users to insert their own profile') THEN
        DROP POLICY "Allow users to insert their own profile" ON public.users;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow users to update their own profile') THEN
        DROP POLICY "Allow users to update their own profile" ON public.users;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow public read access to user profiles') THEN
        DROP POLICY "Allow public read access to user profiles" ON public.users;
    END IF;
END
$$;

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
