import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Popup } from './Popup';
import { useTheme } from '@/hooks/theme/useTheme';
import { Colors } from '@/constants/Colors';
import { BORDER_RADIUS, FONT_SIZE, MARGIN, PADDING } from '@/constants/AppConstants';
import { Ionicons } from '@expo/vector-icons';
import Loader from './loader/native-loader';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  confirmButtonColor?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  icon,
  iconColor,
  confirmButtonColor,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const { mode } = useTheme();
  const styles = createStyles(mode, confirmButtonColor);

  return (
    <Popup 
      visible={visible} 
      onClose={onCancel}
      position="center"
      title={title}
    >
      <View style={styles.container}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` || Colors[mode].primary + '20' }]}>
            <Ionicons
              name={icon}
              size={30}
              color={iconColor || Colors[mode].primary}
            />
          </View>
        )}
        
        {typeof message === 'string' ? (
          <Text style={styles.message}>{message}</Text>
        ) : (
          <View style={styles.messageContainer}>
            {message}
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={onCancel}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>{cancelText}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.confirmButton]} 
            onPress={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader size="small" />
            ) : (
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Popup>
  );
};

const createStyles = (mode: 'light' | 'dark', confirmButtonColor?: string) => StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: PADDING.md,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: MARGIN.md,
  },
  message: {
    fontSize: FONT_SIZE.lg,
    color: mode === 'dark' ? Colors.dark.text : Colors.light.text,
    textAlign: 'center',
    marginBottom: MARGIN.lg,
    paddingHorizontal: PADDING.sm,
  },
  messageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: MARGIN.lg,
    paddingHorizontal: PADDING.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: MARGIN.xl,
  },
  button: {
    flex: 1,
    paddingVertical: PADDING.sm,
    paddingHorizontal: PADDING.md,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: MARGIN.xs,
  },
  cancelButton: {
    backgroundColor: mode === 'dark' ? '#2C3E50' : '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: confirmButtonColor || Colors[mode].primary,
  },
  cancelButtonText: {
    color: mode === 'dark' ? '#FFFFFF' : '#333333',
    fontSize: FONT_SIZE.lg,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
});
