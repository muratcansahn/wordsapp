import React from 'react';
import { Colors } from '@/constants/Colors';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import { handleBack } from '@/helpers/app-functions';
import { BORDER_RADIUS, ICON_SIZE, PADDING } from '@/constants/AppConstants';
import { X } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/theme/useTheme';

const PaywallHeader = () => {
  const { mode } = useTheme();
  return (
    <PressableOpacity
      onPress={handleBack}
      style={[
        styles.container,
        {
          backgroundColor: Colors[mode].borderColor,
        },
      ]}
    >
      <X size={ICON_SIZE.xs} color={Colors[mode].text} />
    </PressableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: PADDING.xs,
    borderRadius: BORDER_RADIUS.rounded,
  },
});

export default PaywallHeader;
