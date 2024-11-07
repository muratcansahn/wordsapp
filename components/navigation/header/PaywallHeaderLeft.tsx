import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import { handleBack } from '@/helpers/app-functions';
import { ICON_SIZE } from '@/constants/AppConstants';

const PaywallHeaderLeft = () => {
  return (
    <PressableOpacity onPress={handleBack}>
      <Ionicons name="close" size={ICON_SIZE.sm} color={Colors.light.white} />
    </PressableOpacity>
  );
};

export default PaywallHeaderLeft;
