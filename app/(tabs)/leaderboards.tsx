import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Crown, Medal, Award } from 'lucide-react-native';

export default function Leaderboards() {
  const leaderboardTypes = [
    { id: 'all-time', name: 'All Time', active: true },
    { id: 'weekly', name: 'Weekly', active: false },
    { id: 'tournament', name: 'Tournament', active: false },
  ];

  const leaderboardData = [
    { rank: 1, username: 'WordMaster', score: 2850, streak: 12, avatar: '👑' },
    { rank: 2, username: 'QuickFinder', score: 2640, streak: 8, avatar: '🥈' },
    { rank: 3, username: 'PuzzlePro', score: 2420, streak: 5, avatar: '🥉' },
    { rank: 4, username: 'SearchGuru', score: 2180, streak: 3, avatar: '🏆' },
    { rank: 5, username: 'WordHunter', score: 1950, streak: 7, avatar: '⚡' },
    { rank: 6, username: 'GridMaster', score: 1820, streak: 2, avatar: '🎯' },
    { rank: 7, username: 'FastEyes', score: 1690, streak: 4, avatar: '👁️' },
    { rank: 8, username: 'LetterLord', score: 1540, streak: 1, avatar: '📝' },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown size={20} color="#FFD700" />;
      case 2: return <Medal size={20} color="#C0C0C0" />;
      case 3: return <Award size={20} color="#CD7F32" />;
      default: return <Text style={styles.rankNumber}>{rank}</Text>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return styles.firstPlace;
      case 2: return styles.secondPlace;
      case 3: return styles.thirdPlace;
      default: return styles.regularPlace;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboards</Text>
      </View>

      <View style={styles.tabContainer}>
        {leaderboardTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[styles.tab, type.active && styles.tabActive]}
          >
            <Text style={[styles.tabText, type.active && styles.tabTextActive]}>
              {type.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.podium}>
          {leaderboardData.slice(0, 3).map((player, index) => (
            <View key={player.rank} style={[styles.podiumPlace, getRankStyle(player.rank)]}>
              <Text style={styles.playerAvatar}>{player.avatar}</Text>
              <Text style={styles.playerName}>{player.username}</Text>
              <Text style={styles.playerScore}>{player.score.toLocaleString()}</Text>
              <View style={styles.podiumRank}>
                {getRankIcon(player.rank)}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.leaderboardList}>
          {leaderboardData.slice(3).map((player) => (
            <View key={player.rank} style={styles.leaderboardItem}>
              <View style={styles.playerInfo}>
                <View style={styles.rankContainer}>
                  {getRankIcon(player.rank)}
                </View>
                <Text style={styles.playerAvatar}>{player.avatar}</Text>
                <View style={styles.playerDetails}>
                  <Text style={styles.playerName}>{player.username}</Text>
                  <Text style={styles.playerStreak}>🔥 {player.streak} streak</Text>
                </View>
              </View>
              <Text style={styles.playerScore}>{player.score.toLocaleString()}</Text>
            </View>
          ))}
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
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#8B5CF6',
  },
  content: {
    flex: 1,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'end',
    padding: 20,
    marginBottom: 20,
  },
  podiumPlace: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: 100,
    borderWidth: 2,
  },
  firstPlace: {
    borderColor: '#FFD700',
    height: 120,
  },
  secondPlace: {
    borderColor: '#C0C0C0',
    height: 100,
  },
  thirdPlace: {
    borderColor: '#CD7F32',
    height: 80,
  },
  regularPlace: {
    borderColor: '#E2E8F0',
  },
  playerAvatar: {
    fontSize: 24,
    marginBottom: 4,
  },
  playerName: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
  },
  playerScore: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#8B5CF6',
  },
  podiumRank: {
    marginTop: 8,
  },
  leaderboardList: {
    paddingHorizontal: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#64748B',
  },
  playerDetails: {
    marginLeft: 12,
  },
  playerStreak: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 2,
  },
});