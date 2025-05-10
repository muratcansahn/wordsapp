import React from 'react';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, StyleProp, ViewStyle, Animated } from 'react-native';
import { FLEX } from '@/constants/AppConstants';
interface ContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: Edge[];
  bgColor?: string;
  backgroundImage?: any; // require(...) veya import ile gönderilecek görsel
}

const Container: React.FC<ContainerProps> = ({
  children,
  style,
  edges,
  bgColor,
  backgroundImage,
}) => {
  return (
    <SafeAreaView
      style={[
        styles.container,
        style,
        { backgroundColor: bgColor },
      ]}
      edges={edges}
    >
      {backgroundImage && (
        <>
          {/* Arka plan görseli */}
          <Animated.Image
            source={backgroundImage}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              resizeMode: 'cover',
              zIndex: 0,
              opacity: 0.98,
            }}
            blurRadius={1.5}
          />
        </>
      )}
      {/* İçerik */}
      <React.Fragment>
        {children}
      </React.Fragment>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: FLEX.one,
  },
});

export default Container;
