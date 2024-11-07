import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import { useTheme } from '@/hooks/theme/useTheme';
import { handleBack } from '@/helpers/app-functions';
import { ICON_SIZE } from '@/constants/AppConstants';

const HeaderClose = () => {
  const { mode } = useTheme();
  return (
    <PressableOpacity onPress={handleBack}>
      <Ionicons name="close" size={ICON_SIZE.sm} color={Colors[mode].text} />
    </PressableOpacity>
  );
};

export default HeaderClose;
