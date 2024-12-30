import React from 'react';
import { X } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import { useTheme } from '@/hooks/theme/useTheme';
import { handleBack } from '@/helpers/app-functions';
import { ICON_SIZE } from '@/constants/AppConstants';

const HeaderClose = () => {
  const { mode } = useTheme();
  return (
    <PressableOpacity onPress={handleBack}>
      <X size={ICON_SIZE.sm} color={Colors[mode].text} />
    </PressableOpacity>
  );
};

export default HeaderClose;
