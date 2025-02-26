import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import { BORDER_RADIUS, PADDING, MARGIN, ICON_SIZE } from '@/constants/AppConstants';
import { useAuth } from '@/context/SupabaseProvider';

export default function HomePage() {
  const router = useRouter();
  const { mode } = useTheme();
  const { session } = useAuth();
  const user = session?.user;

  const menuItems = [
    {
      icon: 'test-tube',
      title: 'Seviye Testi',
      route: '/level-test',
      color: '#E0F2FE',
      textColor: '#0369A1',
    },
    {
      icon: 'book-open-variant',
      title: 'Öğren',
      route: '/learn',
      color: '#FEF3C7',
      textColor: '#B45309',
    },
    {
      icon: 'pencil',
      title: 'Alıştırmalar',
      route: '/exercises',
      color: '#DCFCE7',
      textColor: '#166534',
    },
    {
      icon: 'account-group',
      title: 'Çoklu Oyuncu',
      route: '/multiplayer',
      color: '#F3E8FF',
      textColor: '#6B21A8',
    },
    {
      icon: 'cog',
      title: 'Ayarlar',
      route: '/settings',
      color: '#FFE4E6',
      textColor: '#BE123C',
    },
    {
      icon: 'palette',
      title: 'Renk Paleti',
      route: '/colors',
      color: '#FECDD3',
      textColor: '#9D174D',
    },
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: Colors[mode].background }]}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['#6366F1', '#4F46E5', '#4338CA']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Image
              source={user?.user_metadata?.avatar_url ? { uri: user.user_metadata.avatar_url } : undefined}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Text style={styles.welcomeText}>Hoş geldin,</Text>
              <Text style={styles.userName}>{user?.user_metadata?.full_name || 'Kullanıcı'}</Text>
              {/* <Text style={styles.userEmail}>{user?.email}</Text> */}
            </View>
          </View>
          <View style={styles.statsHeader}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
              <Text style={styles.statValue}>1250 XP</Text>
              <Text style={styles.statLabel}>Toplam Puan</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="fire" size={24} color="#FF4500" />
              <Text style={styles.statValue}>5 Gün</Text>
              <Text style={styles.statLabel}>Seri</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.title}
            style={[
              styles.menuItem,
              { 
                backgroundColor: item.color,
              }
            ]}
            onPress={() => router.push(item.route)}
          >
            <View style={[styles.iconContainer, { backgroundColor: 'transparent' }]}>
              <MaterialCommunityIcons
                name={item.icon as any}
                size={32}
                color={item.textColor}
              />
            </View>
            <Text style={[styles.menuText, { color: item.textColor }]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.dailyGoalsContainer}>
        <Text style={[styles.sectionTitle, { color: Colors[mode].text }]}>
          Günlük Hedefler
        </Text>
        <View style={[styles.goalCard, { backgroundColor: Colors[mode].card }]}>
          <View style={styles.goalProgress}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '75%' }]} />
            </View>
            <Text style={[styles.progressText, { color: Colors[mode].text }]}>
              15/20 kelime öğrenildi
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContent: {
    gap: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  userEmail: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  menuContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  menuItem: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  dailyGoalsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  goalCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
  },
  goalProgress: {
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4c669f',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
