import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Users, Zap, Settings } from 'lucide-react-native';
import { Category, GridSize, categoryMeta } from '@/lib/wordSearchPuzzles';

export default function Home() {
  const { profile, signOut } = useAuth();
  const { createGame, loading } = useGame();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedGridSize, setSelectedGridSize] = useState<GridSize | null>(null);

  const gameCategories = categoryMeta;

  const gridSizes: { size: GridSize; name: string }[] = [
    { size: '10x10', name: 'Small (10x10)' },
    { size: '15x15', name: 'Medium (15x15)' },
    { size: '20x20', name: 'Large (20x20)' },
  ];

  const handleQuickMatch = async () => {
    if (!selectedCategory || !selectedGridSize) {
      Alert.alert("Selection Required", "Please select both a category and grid size");
      return;
    }

    try {
      const gameId = await createGame(selectedCategory, selectedGridSize);
      if (gameId) {
        // Use the typed navigation
        router.push({
          pathname: '/game/[id]',
          params: { id: gameId }
        } as any); // Type assertion needed until Expo Router types are fully set up
      }
    } catch (error) {
      console.error("Error creating game:", error);
      Alert.alert("Error", "Failed to create game. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.username}>{profile?.name}!</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton} onPress={signOut}>
            <Settings size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.primaryAction, loading && styles.disabledButton]}
            onPress={handleQuickMatch}
            disabled={loading}
          >
            <Play size={24} color="#00281F" />
            <Text style={styles.primaryActionText}>
              {loading ? 'Creating Game...' : 'Quick Match'}
            </Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.secondaryAction}>
              <Users size={20} color="#00281F" />
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
                style={[
                  styles.categoryCard, 
                  { 
                    borderColor: category.color,
                    backgroundColor: selectedCategory === category.id ? `${category.color}33` : '#FFFFFF',
                  }
                ]}
                onPress={() => setSelectedCategory(category.id)}
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
                  selectedGridSize === size.size && styles.gridSizeCardActive,
                ]}
                onPress={() => setSelectedGridSize(size.size)}
              >
                <Text style={[
                  styles.gridSizeText,
                  selectedGridSize === size.size && styles.gridSizeTextActive,
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
  disabledButton: {
    opacity: 0.6,
  },
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
    backgroundColor: '#7BD4CC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  primaryActionText: {
    color: '#00281F',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: '#FFB7A9',
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
    color: '#00281F',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#00281F',
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
    color: '#00281F',
  },
  gridSizes: {
    gap: 8,
  },
  gridSizeCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFB7A9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  gridSizeCardActive: {
    backgroundColor: '#7BD4CC',
    borderColor: '#7BD4CC',
  },
  gridSizeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#00281F',
  },
  gridSizeTextActive: {
    color: '#00281F',
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