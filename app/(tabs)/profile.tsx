import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Settings, Trophy, Target, Clock, Award, Play } from 'lucide-react-native';
import { ColorPicker } from 'react-native-color-picker-palette/lite';
import { ColorService } from 'react-native-color-picker-palette';

const primaryColors = [
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#64748B',
];

export default function Profile() {
  const { profile, signOut, updateProfile, uploadImage } = useAuth();
  const { loadGame } = useGame();
  const router = useRouter();
  const savedColor = profile?.highlightColor ?? '#8B5CF6';
  const [color, setColor] = useState<any>(ColorService.fromHex(savedColor));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const currentColor = color?.hex ?? savedColor;
  const statsData = useQuery(api.users.stats, {});
  const activeGames = useQuery(api.games.myActiveGames, {});

  const gamesWon = statsData?.gamesWon ?? 0;
  const winRate = statsData?.winRate ?? 0;
  const avgTime = statsData?.avgTime ?? 0;
  const tournaments = statsData?.tournaments ?? 0;
  const wordsFound = statsData?.wordsFound ?? 0;
  const fastWins = statsData?.fastWins ?? 0;

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const statCards = [
    { label: 'Games Won', value: String(gamesWon), icon: Trophy, color: '#10B981' },
    { label: 'Win Rate', value: `${winRate}%`, icon: Target, color: '#8B5CF6' },
    { label: 'Avg. Time', value: formatTime(avgTime), icon: Clock, color: '#F59E0B' },
    { label: 'Tournaments', value: String(tournaments), icon: Award, color: '#EF4444' },
  ];

  const achievements = [
    { id: 1, name: 'First Victory', description: 'Win your first game', unlocked: gamesWon >= 1, icon: '🏆' },
    { id: 2, name: 'Speed Demon', description: 'Complete a puzzle in under 1 minute', unlocked: fastWins >= 1, icon: '⚡' },
    { id: 3, name: 'Word Master', description: 'Find 100 words', unlocked: wordsFound >= 100, icon: '📝' },
    { id: 4, name: 'Streak Legend', description: 'Win 10 games in a row', unlocked: gamesWon >= 10, icon: '🔥' },
    { id: 5, name: 'Tournament Champion', description: 'Win a tournament', unlocked: tournaments >= 1, icon: '👑' },
  ];

  const saveColor = async (hex: string) => {
    if (hex === profile?.highlightColor) return;
    setSaving(true);
    await updateProfile({ highlightColor: hex });
    setSaving(false);
  };

  const handleColorChange = (c: any) => {
    setColor(c);
  };

  useEffect(() => {
    if (modalVisible) {
      setColor(ColorService.fromHex(savedColor));
    }
  }, [modalVisible, savedColor]);

  const handleColorComplete = (c: any) => {
    setColor(c);
  };

  const selectPrimary = (hex: string) => {
    setColor(ColorService.fromHex(hex));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library to upload a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images' as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setUploading(true);
      const { error } = await uploadImage(result.assets[0].uri);
      setUploading(false);
      if (error) {
        Alert.alert('Upload failed', 'Could not upload your profile picture. Please try again.');
      }
    }
  };

  const handleSave = async () => {
    await saveColor(currentColor);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={signOut}>
          <Settings size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} disabled={uploading}>
            {profile?.image ? (
              <Image source={{ uri: profile.image }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatar}>👤</Text>
            )}
            {uploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.username}>{profile?.name}</Text>
          <Text style={styles.email}>{profile?.email}</Text>

          <View style={styles.colorPicker}>
            <Text style={styles.colorLabel}>Highlight Color</Text>
            <TouchableOpacity
              style={[styles.colorSwatch, { backgroundColor: savedColor }]}
              onPress={() => setModalVisible(true)}
            />
          </View>

          <Modal
            animationType="slide"
            transparent
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Choose Highlight Color</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.pickerContainer}>
                  <ColorPicker
                    color={color}
                    onChange={handleColorChange}
                    onChangeComplete={handleColorComplete}
                    style={styles.picker}
                  />
                </View>

                <View style={styles.primaryRow}>
                  {primaryColors.map((hex) => (
                    <TouchableOpacity
                      key={hex}
                      style={[
                        styles.primaryChip,
                        { backgroundColor: hex },
                        currentColor === hex && styles.primaryChipSelected,
                      ]}
                      onPress={() => selectPrimary(hex)}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Text style={styles.saveButtonText}>
                    {saving ? 'Saving...' : 'Save Color'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            {statCards.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                  <stat.icon size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsList}>
            {achievements.map((achievement) => (
              <View key={achievement.id} style={[
                styles.achievementCard,
                !achievement.unlocked && styles.achievementCardLocked
              ]}>
                <Text style={[
                  styles.achievementIcon,
                  !achievement.unlocked && styles.achievementIconLocked
                ]}>
                  {achievement.icon}
                </Text>
                <View style={styles.achievementInfo}>
                  <Text style={[
                    styles.achievementName,
                    !achievement.unlocked && styles.achievementNameLocked
                  ]}>
                    {achievement.name}
                  </Text>
                  <Text style={[
                    styles.achievementDescription,
                    !achievement.unlocked && styles.achievementDescriptionLocked
                  ]}>
                    {achievement.description}
                  </Text>
                </View>
                {achievement.unlocked && (
                  <View style={styles.unlockedBadge}>
                    <Text style={styles.unlockedText}>✓</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {activeGames && activeGames.length > 0 && (
          <View style={styles.savedGamesSection}>
            <Text style={styles.sectionTitle}>Saved Games</Text>
            <View style={styles.savedGamesList}>
              {activeGames.map((game) => {
                const foundCount = Object.keys(game.gameState.foundWords).length;
                const totalWords = game.wordList.length;
                return (
                  <TouchableOpacity
                    key={game._id}
                    style={styles.savedGameCard}
                    onPress={() => {
                      loadGame(game._id);
                      router.push(`/game/${game._id}`);
                    }}
                  >
                    <View style={styles.savedGameInfo}>
                      <Text style={styles.savedGameCategory}>{game.category}</Text>
                      <Text style={styles.savedGameMeta}>
                        {game.gridSize} • {foundCount}/{totalWords} words
                      </Text>
                    </View>
                    <View style={styles.playButton}>
                      <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    fontSize: 32,
    color: '#FFFFFF',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
  },
  username: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 16,
  },
  colorPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  modalClose: {
    fontSize: 20,
    color: '#64748B',
    padding: 4,
  },
  pickerContainer: {
    width: '100%',
    height: 260,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  picker: {
    width: '100%',
    height: '100%',
  },
  primaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  primaryChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  primaryChipSelected: {
    borderColor: '#1E293B',
  },
  saveButton: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  saving: {
    marginTop: 8,
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '47%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    textAlign: 'center',
  },
  achievementsSection: {
    padding: 20,
  },
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  achievementCardLocked: {
    backgroundColor: '#F8FAFC',
    opacity: 0.7,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementIconLocked: {
    opacity: 0.5,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  achievementNameLocked: {
    color: '#64748B',
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  achievementDescriptionLocked: {
    color: '#94A3B8',
  },
  unlockedBadge: {
    backgroundColor: '#10B981',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  savedGamesSection: {
    padding: 20,
    paddingTop: 0,
  },
  savedGamesList: {
    gap: 12,
  },
  savedGameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  savedGameInfo: {
    flex: 1,
  },
  savedGameCategory: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  savedGameMeta: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
