import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, Clock, Users, Plus } from 'lucide-react-native';

export default function Tournaments() {
  const tournaments = [
    {
      id: 1,
      name: 'Weekly Championship',
      status: 'active',
      participants: 24,
      startTime: '2024-01-15T10:00:00Z',
      prize: '🏆 Champion Badge',
    },
    {
      id: 2,
      name: 'Animals Hunt',
      status: 'upcoming',
      participants: 8,
      startTime: '2024-01-16T15:00:00Z',
      prize: '🥇 Gold Medal',
    },
    {
      id: 3,
      name: 'Speed Challenge',
      status: 'completed',
      participants: 16,
      startTime: '2024-01-14T12:00:00Z',
      prize: '⚡ Lightning Badge',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'upcoming': return '#F59E0B';
      case 'completed': return '#64748B';
      default: return '#64748B';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Live';
      case 'upcoming': return 'Starting Soon';
      case 'completed': return 'Finished';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tournaments</Text>
        <TouchableOpacity style={styles.createButton}>
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active & Upcoming</Text>
          {tournaments.filter(t => t.status !== 'completed').map((tournament) => (
            <TouchableOpacity key={tournament.id} style={styles.tournamentCard}>
              <View style={styles.tournamentHeader}>
                <Text style={styles.tournamentName}>{tournament.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tournament.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(tournament.status)}</Text>
                </View>
              </View>
              
              <View style={styles.tournamentInfo}>
                <View style={styles.infoItem}>
                  <Users size={16} color="#64748B" />
                  <Text style={styles.infoText}>{tournament.participants} players</Text>
                </View>
                <View style={styles.infoItem}>
                  <Clock size={16} color="#64748B" />
                  <Text style={styles.infoText}>
                    {new Date(tournament.startTime).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Trophy size={16} color="#64748B" />
                  <Text style={styles.infoText}>{tournament.prize}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completed</Text>
          {tournaments.filter(t => t.status === 'completed').map((tournament) => (
            <TouchableOpacity key={tournament.id} style={styles.tournamentCard}>
              <View style={styles.tournamentHeader}>
                <Text style={styles.tournamentName}>{tournament.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tournament.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(tournament.status)}</Text>
                </View>
              </View>
              
              <View style={styles.tournamentInfo}>
                <View style={styles.infoItem}>
                  <Users size={16} color="#64748B" />
                  <Text style={styles.infoText}>{tournament.participants} players</Text>
                </View>
                <View style={styles.infoItem}>
                  <Clock size={16} color="#64748B" />
                  <Text style={styles.infoText}>
                    {new Date(tournament.startTime).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Trophy size={16} color="#64748B" />
                  <Text style={styles.infoText}>{tournament.prize}</Text>
                </View>
              </View>
            </TouchableOpacity>
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
  createButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  content: {
    flex: 1,
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
  tournamentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tournamentName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  tournamentInfo: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
});