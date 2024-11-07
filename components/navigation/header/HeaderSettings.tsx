import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import { useRouter } from 'expo-router';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import { ICON_SIZE } from '@/constants/AppConstants';

const HeaderRight = () => {
  const { mode } = useTheme();
  const router = useRouter();

  const handleSettings = () => {
    // Don't forget to change the path to the settings page!
    router.push('/settings');
  };

  return (
    <PressableOpacity onPress={handleSettings}>
      <MaterialIcons
        name="settings"
        size={ICON_SIZE.sm}
        color={Colors[mode].text}
      />
    </PressableOpacity>
  );
};
export default HeaderRight;
