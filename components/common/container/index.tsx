import React from 'react';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { FLEX } from '@/constants/AppConstants';
const Container = ({
  children,
  style,
  edges,
  bgColor,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: Edge[];
  bgColor?: string;
}) => {
  return (
    <SafeAreaView
      style={[
        styles.container,
        style,
        {
          backgroundColor: bgColor,
        },
      ]}
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: FLEX.one,
  },
});

export default Container;
