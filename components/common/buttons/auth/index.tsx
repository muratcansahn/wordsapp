import React from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import Button from '@/components/common/buttons/button';
import { ThemedText } from '@/components/common/typography';
import { BORDER_WIDTH, ICON_SIZE, MARGIN } from '@/constants/AppConstants';
import { authStyles } from '@/constants/AuthStyles';

interface AuthButtonProps {
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  disabled?: boolean;
  loading?: boolean;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  onPress,
  icon,
  text,
  disabled,
  loading,
}) => {
  const { mode } = useTheme();

  return (
    <Button
      onPress={onPress}
      style={styles.button}
      bgColor={Colors[mode].background}
      disabled={disabled}
      borderColor={Colors[mode].borderColor}
      borderWidth={BORDER_WIDTH.sm}
      loading={loading}
      icon={
        <Ionicons
          name={icon}
          size={ICON_SIZE.sm}
          color={Colors[mode].text}
          style={styles.icon}
        />
      }
    >
      <ThemedText type="default" style={authStyles.buttonText}>
        {text}
      </ThemedText>
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    marginBottom: MARGIN.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  icon: {
    marginRight: MARGIN.md,
  },
});

export default AuthButton;
