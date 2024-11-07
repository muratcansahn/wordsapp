import { FontAwesome6 } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import { ThemedText } from '@/components/common/typography';
import PressableOpacity from '@/components/common/buttons/pressable-opacity';
import {
  BORDER_RADIUS,
  BUTTON_HEIGHT,
  FONT_SIZE,
  MARGIN,
} from '@/constants/AppConstants';

const ShareOption = ({
  icon,
  label,
  color,
  onPress,
}: {
  icon: keyof typeof FontAwesome6.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) => {
  const { mode } = useTheme();
  return (
    <View>
      <PressableOpacity
        style={[
          styles.shareOption,
          {
            backgroundColor: Colors[mode].background,
          },
        ]}
        onPress={onPress}
      >
        <FontAwesome6 name={icon} size={24} color={color} />
      </PressableOpacity>
      <ThemedText
        style={[styles.shareOptionLabel, { color: Colors[mode].text }]}
      >
        {label}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  shareOption: {
    alignItems: 'center',
    justifyContent: 'center',
    height: BUTTON_HEIGHT.md,
    width: BUTTON_HEIGHT.md,
    borderRadius: BORDER_RADIUS.rounded,
  },
  shareOptionLabel: {
    fontSize: FONT_SIZE.sm,
    marginVertical: MARGIN.md,
    textAlign: 'center',
  },
});

export default ShareOption;
