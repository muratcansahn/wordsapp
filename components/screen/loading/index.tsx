import { StyleSheet } from 'react-native';
import React from 'react';
import { ThemedView } from '@/components/common/view';
import Loader from '@/components/common/loader/native-loader';

const LoadingScreen = () => {
  return (
    <ThemedView style={styles.container}>
      <Loader />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingScreen;
