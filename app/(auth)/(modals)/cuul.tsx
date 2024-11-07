import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/common/typography';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/common/view';
import { Image } from 'expo-image';
import ShareBottomSheet from '@/components/common/modal/bottomsheet/ShareBottomSheet';
import {
  BORDER_RADIUS,
  FLEX,
  FONT_SIZE,
  ICON_SIZE,
  MARGIN,
  PADDING,
  Z_INDEX,
} from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';

export default function ShareModal() {
  const colors = ['#FAFF00', '#000'];
  const viewShotRef = useRef<ViewShot | null>(null);

  const CuulShareScreen = () => (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.gradientBackground]}
      >
        <ViewShot ref={viewShotRef} style={styles.spotifyContainer}>
          <View style={styles.cardContainer}>
            <Image
              source={require('@/assets/logos/cuul.png')}
              style={styles.logo}
            />
            <Image
              source={require('@/assets/share/woman.jpg')}
              style={styles.albumCover}
              contentFit="cover"
            />
            <LinearGradient
              colors={['rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.userInfo}
            >
              <ThemedText style={styles.userFullName}>Valeria</ThemedText>
              <ThemedText style={styles.username}>@valeria</ThemedText>
            </LinearGradient>
          </View>
          <View style={styles.footer}>
            <Ionicons
              name="chevron-down"
              size={ICON_SIZE.xs}
              color={'#B2DE10'}
            />
            <ThemedText
              style={styles.link}
              numberOfLines={2}
              lightColor={Colors.light.white}
              darkColor={Colors.dark.white}
            >
              https://cuul.app/@valeria
            </ThemedText>
          </View>
        </ViewShot>
      </LinearGradient>
    </ThemedView>
  );

  return (
    <>
      <CuulShareScreen />
      <ShareBottomSheet ref={viewShotRef} colors={colors} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: FLEX.one,
  },
  spotifyContainer: {
    alignItems: 'center',
  },
  gradientBackground: {
    aspectRatio: 9 / 16,
    flex: 0.83,
    margin: MARGIN.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'center',
  },
  cardContainer: {
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: '100%',
    aspectRatio: 9 / 16,
    height: '83%',
  },
  albumCover: {
    borderRadius: BORDER_RADIUS.sm,
    aspectRatio: 9 / 16,
  },
  logo: {
    width: ICON_SIZE.md,
    height: ICON_SIZE.md,
    borderRadius: BORDER_RADIUS.sm,
    position: 'absolute',
    top: MARGIN.lg,
    left: MARGIN.lg,
    zIndex: Z_INDEX.one,
  },
  userFullName: {
    fontSize: FONT_SIZE.lg,
    color: 'white',
    fontWeight: 'bold',
  },
  username: {
    color: '#eee',
    fontSize: FONT_SIZE.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: MARGIN.lg,
  },
  userInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: PADDING.md,
    borderBottomLeftRadius: BORDER_RADIUS.sm,
    borderBottomRightRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  link: {
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
