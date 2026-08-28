import React, { createContext, useContext, useEffect, useState } from 'react';
import { useConvexAuth, useAuthActions } from '@convex-dev/auth/react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { UserProfile } from '@/types/database';

interface User {
  id: string;
  email?: string;
  name?: string;
  image?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const { signIn: convexSignIn, signOut: convexSignOut } = useAuthActions();
  const me = useQuery(api.users.me);
  const updateUser = useMutation(api.users.update);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) {
      setLoading(true);
      return;
    }
    if (!isAuthenticated) {
      setProfile(null);
      setLoading(false);
      return;
    }
    if (me === undefined) {
      setLoading(true);
      return;
    }
    setProfile(me as UserProfile);
    setLoading(false);
  }, [isAuthLoading, isAuthenticated, me]);

  const user: User | null = profile
    ? { id: profile._id, email: profile.email, name: profile.name, image: profile.image }
    : null;

  const signIn = async (email: string, password: string) => {
    try {
      await convexSignIn('password', { email, password, flow: 'signIn' });
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      await convexSignIn('password', { email, password, flow: 'signUp', name: username });
      await updateUser({ highlightColor: '#8B5CF6' });
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await convexSignOut();
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      await updateUser({
        name: updates.name,
        highlightColor: updates.highlightColor,
        image: updates.image,
      });
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    isAuthenticated,
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
