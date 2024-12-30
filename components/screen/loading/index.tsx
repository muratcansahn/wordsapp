import { StyleSheet } from 'react-native';
import React from 'react';
import { ThemedView } from '@/components/common/view';
import LoaderLucide from '@/components/common/loader/loader-2';

const LoadingScreen = () => {
  return (
    <ThemedView style={styles.container}>
      <LoaderLucide size={24} />
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
