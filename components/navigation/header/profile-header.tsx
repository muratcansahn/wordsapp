import React from 'react';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import { Cog } from 'lucide-react-native';
import { useTheme } from '@/hooks/theme/useTheme';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { MARGIN } from '@/constants/AppConstants';

const ProfileHeader = () => {
  const { mode } = useTheme();
  const router = useRouter();
  return (
    <PressableOpacity
      onPress={() => router.push('/settings')}
      style={styles.container}
    >
      <Cog size={24} color={Colors[mode].text} />
    </PressableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: MARGIN.lg,
  },
});

export default ProfileHeader;
