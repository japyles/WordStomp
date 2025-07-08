import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Users, Zap, Settings } from 'lucide-react-native';

export default function Home() {
  const { profile, signOut } = useAuth();
  const router = useRouter();

  const gameCategories = [
    { id: 'animals', name: 'Animals', icon: '🐾', color: '#10B981' },
    { id: 'colors', name: 'Colors', icon: '🎨', color: '#F59E0B' },
    { id: 'sports', name: 'Sports', icon: '⚽', color: '#EF4444' },
    { id: 'food', name: 'Food', icon: '🍕', color: '#8B5CF6' },
  ];

  const gridSizes = [
    { width: 10, height: 10, name: 'Small (10x10)' },
    { width: 15, height: 15, name: 'Medium (15x15)' },
    { width: 20, height: 20, name: 'Large (20x20)' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.username}>{profile?.username}!</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton} onPress={signOut}>
            <Settings size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.primaryAction}>
            <Play size={24} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Quick Match</Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.secondaryAction}>
              <Users size={20} color="#8B5CF6" />
              <Text style={styles.secondaryActionText}>Challenge Friend</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryAction}>
              <Zap size={20} color="#8B5CF6" />
              <Text style={styles.secondaryActionText}>Join Tournament</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Category</Text>
          <View style={styles.categoryGrid}>
            {gameCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { borderColor: category.color }]}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grid Size</Text>
          <View style={styles.gridSizes}>
            {gridSizes.map((size, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.gridSizeCard,
                  index === 1 && styles.gridSizeCardActive,
                ]}
              >
                <Text style={[
                  styles.gridSizeText,
                  index === 1 && styles.gridSizeTextActive,
                ]}>
                  {size.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Games</Text>
          <View style={styles.recentGames}>
            <Text style={styles.emptyText}>No recent games</Text>
          </View>
        </View>
      </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  username: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  settingsButton: {
    padding: 8,
  },
  quickActions: {
    padding: 20,
    gap: 12,
  },
  primaryAction: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  secondaryActionText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '47%',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
  },
  gridSizes: {
    gap: 8,
  },
  gridSizeCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  gridSizeCardActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  gridSizeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
  },
  gridSizeTextActive: {
    color: '#FFFFFF',
  },
  recentGames: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
});