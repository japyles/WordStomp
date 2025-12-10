import './polyfills';
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Get the correct redirect URL based on platform
const getRedirectUrl = () => {
  if (Platform.OS === 'web') {
    return window.location.origin;
  }
  // For mobile, use the app scheme
  return 'myapp://';
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
    flowType: 'implicit',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Handle auth state changes and URL redirects
if (Platform.OS === 'web') {
  // Handle the auth callback on web
  const handleAuthCallback = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Auth callback error:', error);
    }
  };
  
  // Check if we're on the auth callback page
  if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
    handleAuthCallback();
  }
}