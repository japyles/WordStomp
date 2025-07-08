import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

export default function Welcome() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (session && !loading) {
      router.replace('/(tabs)');
    }
  }, [session, loading]);

  useEffect(() => {
    // Handle deep linking for email confirmation on mobile
    if (Platform.OS !== 'web') {
      const handleDeepLink = (url: string) => {
        if (url.includes('access_token')) {
          // Handle the auth callback
          supabase.auth.getSession().then(({ data, error }) => {
            if (data.session) {
              router.replace('/(tabs)');
            }
          });
        }
      };

      // Set up deep link listener for mobile
      const subscription = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          router.replace('/(tabs)');
        }
      });

      return () => {
        subscription.data.subscription.unsubscribe();
      };
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>WordSearch</Text>
        <Text style={styles.subtitle}>Multiplayer</Text>
        <Text style={styles.description}>
          Challenge friends in real-time word search battles!
        </Text>

        <View style={styles.buttonContainer}>
          <Link href="/(auth)/signin" asChild>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    fontFamily: 'Inter-Medium',
    color: '#8B5CF6',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryButtonText: {
    color: '#1E293B',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});