import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import ViewShot from 'react-native-view-shot';
import { FontAwesome6 } from '@expo/vector-icons';
import { ThemedText } from '@/components/common/typography';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/common/view';
import ShareBottomSheet from '@/components/common/modal/bottomsheet/ShareBottomSheet';
import {
  LOGO_SIZE,
  MARGIN,
  PADDING,
  BORDER_RADIUS,
  FONT_SIZE,
  Z_INDEX,
  FLEX,
  ICON_SIZE,
} from '@/constants/AppConstants';
import { Colors } from '@/constants/Colors';

export default function ShareModal() {
  const viewShotRef = useRef<ViewShot>(null);
  const colors = ['#7209b7', '#000'];

  const SpotifyShareScreen = () => (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1.0 }}
        style={[styles.gradientBackground]}
      >
        <ViewShot ref={viewShotRef} style={styles.spotifyContainer}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
          />
          <View style={styles.cardContainer}>
            <Image
              source={{
                uri: 'https://i.scdn.co/image/ab67616d00001e02c31d3c870a3dbaf7b53186cc',
              }}
              style={styles.albumCover}
              contentFit="contain"
            />
            <View>
              <ThemedText
                style={styles.songTitle}
                lightColor={Colors.light.white}
                darkColor={Colors.dark.white}
                type="title"
              >
                Gangsta's Paradise
              </ThemedText>
              <ThemedText
                style={styles.artistName}
                lightColor={Colors.light.white}
                darkColor={Colors.dark.white}
              >
                Coolio, L.V.
              </ThemedText>
              <View style={styles.spotifyLogoContainer}>
                <FontAwesome6
                  name="spotify"
                  size={ICON_SIZE.xs}
                  color={Colors.light.white}
                />
                <ThemedText
                  style={styles.spotifyText}
                  lightColor={Colors.light.white}
                  darkColor={Colors.dark.white}
                >
                  Spotify
                </ThemedText>
              </View>
            </View>
          </View>
          <View style={styles.footer}>
            <ThemedText
              style={styles.withLove}
              numberOfLines={2}
              lightColor={Colors.light.white}
              darkColor={Colors.dark.white}
            >
              With ❤️, developed for Ship Mobile Fast
            </ThemedText>
          </View>
        </ViewShot>
      </LinearGradient>
    </ThemedView>
  );

  return (
    <>
      <SpotifyShareScreen />
      <ShareBottomSheet ref={viewShotRef} colors={colors} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: FLEX.one,
  },

  spotifyLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: MARGIN.lg,
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
    padding: PADDING.md,
    zIndex: Z_INDEX.one,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  albumCover: {
    width: 200,
    height: 200,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: MARGIN.sm,
  },
  logo: {
    width: LOGO_SIZE.sm,
    height: LOGO_SIZE.sm,
    marginBottom: MARGIN.lg,
  },
  songTitle: {
    fontSize: FONT_SIZE.lg,
  },
  artistName: {
    fontSize: FONT_SIZE.sm,
  },
  spotifyLogo: {
    marginRight: MARGIN.sm,
  },
  shareOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: MARGIN.sm,
  },
  footer: {
    marginTop: MARGIN.md,
    alignItems: 'center',
  },
  spotifyText: {
    fontSize: FONT_SIZE.sm,
    marginLeft: MARGIN.md,
  },
  withLove: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginTop: MARGIN.lg,
  },
});
