import React, { ReactNode } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { ThemedText } from './typography';
import { BORDER_RADIUS, PADDING, MARGIN } from '@/constants/AppConstants';

interface PopupProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  position?: 'bottom' | 'center' | 'top';
  bgColor?: string;
  title?: string;
}

export function Popup({
  visible,
  onClose,
  children,
  position = 'bottom',
  bgColor = '#FFFFFF',
}: PopupProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View 
              style={[
                styles.container, 
                { backgroundColor: bgColor },
                position === 'bottom' && styles.bottomPosition,
                position === 'center' && styles.centerPosition,
                position === 'top' && styles.topPosition,
              ]}
            >
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width,
    padding: PADDING.md,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    maxHeight: height * 0.8,
  },
  bottomPosition: {
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    width: width,
  },
  centerPosition: {
    borderRadius: BORDER_RADIUS.md,
    width: width * 0.9,
    margin: MARGIN.md,
  },
  topPosition: {
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
    width: width,
    position: 'absolute',
    top: 0,
  }
});
