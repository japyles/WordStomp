-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, highlight_color)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'email',
    new.raw_user_meta_data->>'username',
    '#8B5CF6'  -- Default highlight color
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Allow the handle_new_user function to insert user profiles
CREATE POLICY "Allow auth function to create user profiles"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Grant necessary permissions to the function
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
