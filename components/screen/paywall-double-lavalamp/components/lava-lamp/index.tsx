import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/hooks/theme/useTheme';
import { ANIMATION_DURATION } from '@/constants/AppConstants';

interface BlobProps {
  color: string;
  size: number;
  index: number;
}

const Blob: React.FC<BlobProps> = React.memo(({ color, size, index }) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const translateY = useSharedValue(Math.random() * screenHeight);
  const translateX = useSharedValue(Math.random() * screenWidth);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const animDuration = useCallback(
    (base: number) => base + Math.random() * 1000,
    []
  );

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(Math.random() * screenHeight, {
        duration: animDuration(ANIMATION_DURATION.D50),
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      -1,
      true
    );

    translateX.value = withRepeat(
      withTiming(Math.random() * screenWidth, {
        duration: animDuration(ANIMATION_DURATION.D50),
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      -1,
      true
    );

    scale.value = withRepeat(
      withTiming(1 + Math.random() * 0.5, {
        duration: animDuration(ANIMATION_DURATION.D50),
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      -1,
      true
    );

    rotate.value = withRepeat(
      withTiming(Math.PI * 2, {
        duration: animDuration(ANIMATION_DURATION.D50),
        easing: Easing.linear,
      }),
      -1,
      true
    );

    // Boyut/ekran değişince yeni sonsuz döngüler başlatılmadan önce eskilerini
    // iptal ediyoruz; unmount'ta da UI thread'de çalışmaya devam etmesinler.
    return () => {
      cancelAnimation(translateY);
      cancelAnimation(translateX);
      cancelAnimation(scale);
      cancelAnimation(rotate);
    };
  }, [
    size,
    screenWidth,
    screenHeight,
    animDuration,
    translateY,
    translateX,
    scale,
    rotate,
  ]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
      { rotate: `${rotate.value}rad` },
    ],
    backgroundColor: color,
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: size / 1.5,
    opacity: 1,
    zIndex: index,
  }));

  return <Animated.View style={animatedStyle} />;
});

interface LavaLampProps {
  blobCount?: number;
  colors?: string[];
  minBlobSize?: number;
}

const LavaLamp: React.FC<LavaLampProps> = ({
  blobCount = 15,
  colors = ['#6633ff', '#4e00ff'],
  minBlobSize = 40,
}) => {
  const { mode } = useTheme();
  // You can use this color array to change the color of the blobs
  // const colors = useCallback(
  //   () => [Colors[mode].primary, `${Colors[mode].primary}10`],
  //   [mode]
  // );
  const renderBlob = useCallback(
    (index: number) => (
      <Blob
        key={index}
        // TODO: Uncomment this to use the color array
        // color={colors()[index % colors().length]}
        color={colors[index % colors.length]}
        size={minBlobSize + index * 50}
        index={index}
      />
    ),
    [colors, minBlobSize]
  );

  return (
    <View style={styles.container}>
      {Array.from({ length: blobCount }).map((_, index) => renderBlob(index))}
      <BlurView intensity={100} style={styles.blurView} tint={mode} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    backgroundColor: '#000033',
  },
  blurView: {
    flex: 1,
    zIndex: 999,
  },
});

export default React.memo(LavaLamp);
