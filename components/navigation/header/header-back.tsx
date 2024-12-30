import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import { handleBack } from '@/helpers/app-functions';
import { ICON_SIZE } from '@/constants/AppConstants';

const HeaderBack = () => {
  const { mode } = useTheme();
  return (
    <PressableOpacity onPress={handleBack}>
      <Ionicons
        name="chevron-back"
        size={ICON_SIZE.sm}
        color={Colors[mode].text}
      />
    </PressableOpacity>
  );
};

export default HeaderBack;
