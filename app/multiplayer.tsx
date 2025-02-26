import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '@/context/SupabaseProvider';

interface Player {
  id: string;
  name: string;
  avatar: string;
  level: string;
  xp: number;
  rank: number;
}

interface Game {
  id: string;
  player1_id: string;
  player2_id: string | null;
  status: 'waiting' | 'in_progress' | 'completed';
  current_word: string;
  player1_score: number;
  player2_score: number;
  created_at: string;
}

interface GameInvite {
  id: string;
  sender_id: string;
  receiver_id: string;
  game_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  created_at: string;
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
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'challenges' | 'game'>('leaderboard');
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [invites, setInvites] = useState<GameInvite[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchLeaderboard();
    subscribeToGames();
    subscribeToInvites();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('xp', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPlayers(data);
    } catch (error) {
      Alert.alert('Hata', 'Liderlik tablosu yüklenirken bir hata oluştu.');
    }
  };

  const createGame = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .insert({
          player1_id: user?.id,
          status: 'waiting',
          player1_score: 0,
          player2_score: 0,
        })
        .select()
        .single();

      if (error) throw error;
      setCurrentGame(data);
      setActiveTab('game');
    } catch (error) {
      Alert.alert('Hata', 'Oyun oluşturulurken bir hata oluştu.');
    }
  };

  const joinGame = async (gameId: string) => {
    try {
      const { data, error } = await supabase
        .from('games')
        .update({
          player2_id: user?.id,
          status: 'in_progress',
        })
        .eq('id', gameId)
        .select()
        .single();

      if (error) throw error;
      setCurrentGame(data);
      setActiveTab('game');
    } catch (error) {
      Alert.alert('Hata', 'Oyuna katılırken bir hata oluştu.');
    }
  };

  const subscribeToGames = () => {
    const gameSubscription = supabase
      .channel('games')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'games',
        filter: `player1_id=eq.${user?.id}`,
      }, (payload) => {
        if (payload.new) {
          setCurrentGame(payload.new as Game);
        }
      })
      .subscribe();

    return () => {
      gameSubscription.unsubscribe();
    };
  };

  const subscribeToInvites = () => {
    const inviteSubscription = supabase
      .channel('game_invites')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_invites',
        filter: `receiver_id=eq.${user?.id}`,
      }, (payload) => {
        if (payload.new) {
          const invite = payload.new as GameInvite;
          if (invite.status === 'pending') {
            Alert.alert(
              'Oyun Daveti',
              'Yeni bir oyun davetin var!',
              [
                {
                  text: 'Reddet',
                  style: 'cancel',
                  onPress: () => handleInviteResponse(invite.id, 'rejected'),
                },
                {
                  text: 'Kabul Et',
                  onPress: () => handleInviteResponse(invite.id, 'accepted'),
                },
              ]
            );
          }
        }
      })
      .subscribe();

    return () => {
      inviteSubscription.unsubscribe();
    };
  };

  const sendGameInvite = async (receiverId: string) => {
    try {
      // Önce yeni bir oyun oluştur
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .insert({
          player1_id: user?.id,
          status: 'waiting',
          player1_score: 0,
          player2_score: 0,
        })
        .select()
        .single();

      if (gameError) throw gameError;

      // Sonra daveti gönder
      const { error: inviteError } = await supabase
        .from('game_invites')
        .insert({
          sender_id: user?.id,
          receiver_id: receiverId,
          game_id: gameData.id,
          status: 'pending',
        });

      if (inviteError) throw inviteError;

      Alert.alert('Başarılı', 'Oyun daveti gönderildi!');
      setShowInviteModal(false);
    } catch (error) {
      Alert.alert('Hata', 'Davet gönderilirken bir hata oluştu.');
    }
  };

  const handleInviteResponse = async (inviteId: string, status: 'accepted' | 'rejected') => {
    try {
      const { data: invite, error: inviteError } = await supabase
        .from('game_invites')
        .update({ status })
        .eq('id', inviteId)
        .select()
        .single();

      if (inviteError) throw inviteError;

      if (status === 'accepted') {
        // Oyunu güncelle
        const { error: gameError } = await supabase
          .from('games')
          .update({
            player2_id: user?.id,
            status: 'in_progress',
          })
          .eq('id', invite.game_id);

        if (gameError) throw gameError;

        setActiveTab('game');
      }
    } catch (error) {
      Alert.alert('Hata', 'Davet yanıtlanırken bir hata oluştu.');
    }
  };

  const renderLeaderboard = () => (
    <View style={styles.leaderboardContainer}>
      {players.map((player) => (
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
      <TouchableOpacity 
        style={styles.challengeCard}
        onPress={() => setShowInviteModal(true)}
      >
        <MaterialCommunityIcons name="sword-cross" size={32} color="#4c669f" />
        <View style={styles.challengeInfo}>
          <Text style={styles.challengeTitle}>Kelime Düellosu</Text>
          <Text style={styles.challengeDescription}>
            Arkadaşını davet et ve yarışmaya başla!
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
    </View>
  );

  const renderGame = () => {
    if (!currentGame) return null;

    return (
      <View style={styles.gameContainer}>
        <Text style={styles.gameTitle}>Kelime Yarışması</Text>
        <View style={styles.scoreBoard}>
          <View style={styles.playerScore}>
            <Text style={styles.playerName}>Sen</Text>
            <Text style={styles.score}>{currentGame.player1_score}</Text>
          </View>
          <Text style={styles.vs}>VS</Text>
          <View style={styles.playerScore}>
            <Text style={styles.playerName}>Rakip</Text>
            <Text style={styles.score}>{currentGame.player2_score}</Text>
          </View>
        </View>
        {currentGame.status === 'waiting' && (
          <Text style={styles.waitingText}>Rakip bekleniyor...</Text>
        )}
        {currentGame.status === 'in_progress' && (
          <View style={styles.wordContainer}>
            <Text style={styles.currentWord}>{currentGame.current_word}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderInviteModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showInviteModal}
      onRequestClose={() => setShowInviteModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Rakip Seç</Text>
          <ScrollView style={styles.playerList}>
            {players.filter(p => p.id !== user?.id).map((player) => (
              <TouchableOpacity
                key={player.id}
                style={styles.playerItem}
                onPress={() => {
                  setSelectedPlayer(player);
                  sendGameInvite(player.id);
                }}
              >
                <Image source={{ uri: player.avatar }} style={styles.playerAvatar} />
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerLevel}>{player.level}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowInviteModal(false)}
          >
            <Text style={styles.closeButtonText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'game' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('game')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'game' && styles.activeTabText,
            ]}
          >
            Oyun
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'leaderboard' ? renderLeaderboard() : activeTab === 'challenges' ? renderChallenges() : renderGame()}
      </ScrollView>
      {renderInviteModal()}
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
  gameContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scoreBoard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  playerScore: {
    alignItems: 'center',
    padding: 10,
  },
  vs: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  score: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  waitingText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
  },
  wordContainer: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginTop: 20,
  },
  currentWord: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  playerList: {
    maxHeight: 400,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  playerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  closeButton: {
    backgroundColor: '#4c669f',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
