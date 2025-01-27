import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Player {
  id: string;
  name: string;
  avatar: string;
  level: string;
  xp: number;
  rank: number;
}

const DUMMY_PLAYERS: Player[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    avatar: 'https://i.pravatar.cc/150?img=1',
    level: 'Advanced',
    xp: 12500,
    rank: 1,
  },
  {
    id: '2',
    name: 'Sarah Smith',
    avatar: 'https://i.pravatar.cc/150?img=2',
    level: 'Intermediate',
    xp: 8750,
    rank: 2,
  },
  {
    id: '3',
    name: 'Mike Brown',
    avatar: 'https://i.pravatar.cc/150?img=3',
    level: 'Beginner',
    xp: 5000,
    rank: 3,
  },
];

export default function MultiplayerScreen() {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'challenges'>(
    'leaderboard'
  );

  const renderLeaderboard = () => (
    <View style={styles.leaderboardContainer}>
      {DUMMY_PLAYERS.map((player) => (
        <View key={player.id} style={styles.playerCard}>
          <Text style={styles.rankText}>#{player.rank}</Text>
          <Image source={{ uri: player.avatar }} style={styles.avatar} />
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.playerLevel}>{player.level}</Text>
          </View>
          <View style={styles.xpContainer}>
            <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.xpText}>{player.xp} XP</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderChallenges = () => (
    <View style={styles.challengesContainer}>
      <TouchableOpacity style={styles.challengeCard}>
        <MaterialCommunityIcons name="sword-cross" size={32} color="#4c669f" />
        <View style={styles.challengeInfo}>
          <Text style={styles.challengeTitle}>Kelime Düellosu</Text>
          <Text style={styles.challengeDescription}>
            Rakibinizle gerçek zamanlı kelime yarışması
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color="#4c669f"
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.challengeCard}>
        <MaterialCommunityIcons name="trophy" size={32} color="#4c669f" />
        <View style={styles.challengeInfo}>
          <Text style={styles.challengeTitle}>Günlük Turnuva</Text>
          <Text style={styles.challengeDescription}>
            En yüksek puanı topla, ödülleri kazan
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color="#4c669f"
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.challengeCard}>
        <MaterialCommunityIcons name="account-group" size={32} color="#4c669f" />
        <View style={styles.challengeInfo}>
          <Text style={styles.challengeTitle}>Takım Yarışması</Text>
          <Text style={styles.challengeDescription}>
            Takımınla birlikte yarış ve kazanın
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color="#4c669f"
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Çoklu Oyuncu</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'leaderboard' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'leaderboard' && styles.activeTabText,
            ]}
          >
            Sıralama
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'challenges' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('challenges')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'challenges' && styles.activeTabText,
            ]}
          >
            Meydan Okumalar
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'leaderboard' ? renderLeaderboard() : renderChallenges()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#4c669f',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4c669f',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#4c669f',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  leaderboardContainer: {
    padding: 20,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4c669f',
    width: 40,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  playerLevel: {
    fontSize: 14,
    color: '#666',
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  challengesContainer: {
    padding: 20,
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  challengeInfo: {
    flex: 1,
    marginLeft: 15,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
  },
});
