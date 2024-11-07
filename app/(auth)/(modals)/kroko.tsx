import React, { useRef } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/theme/useTheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/common/typography';
import { ThemedView } from '@/components/common/view';
import ShareBottomSheet from '@/components/common/modal/bottomsheet/ShareBottomSheet';
import { LinearGradient } from 'expo-linear-gradient';
import {
  AVATAR_SIZE,
  BORDER_RADIUS,
  FLEX,
  FONT_SIZE,
  ICON_SIZE,
  MARGIN,
  PADDING,
} from '../../../constants/AppConstants';

export default function ShareModal() {
  const viewShotRef = useRef<ViewShot | null>(null);
  const { mode } = useTheme();
  const colors = ['#ff4e00', '#ff8900', '#000'];

  const KrokoShareScreen = () => (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientBackground}
      >
        <ViewShot ref={viewShotRef} style={styles.viewShotContainer}>
          <ThemedView style={styles.cardContainer}>
            <View style={styles.header}>
              <Image
                source={require('@/assets/logos/kroko.png')}
                style={styles.profilePhoto}
              />
              <View style={styles.userInfo}>
                <ThemedText type="defaultSemiBold" style={styles.username}>
                  Kroko
                </ThemedText>
                <ThemedText type="default" style={styles.postTime}>
                  2s
                </ThemedText>
              </View>
              <Ionicons
                name="ellipsis-horizontal"
                size={ICON_SIZE.sm}
                color={Colors[mode].text}
                style={styles.moreIcon}
              />
            </View>
            <ThemedText style={styles.postContent}>
              How cool is that?
            </ThemedText>
            <View style={styles.postActions}>
              <Ionicons
                name="heart-outline"
                size={ICON_SIZE.sm}
                color={Colors[mode].text}
                style={styles.actionIcon}
              />
              <Ionicons
                name="chatbubble-outline"
                size={ICON_SIZE.sm}
                color={Colors[mode].text}
                style={styles.actionIcon}
              />
              <Ionicons
                name="paper-plane-outline"
                size={ICON_SIZE.sm}
                color={Colors[mode].text}
                style={styles.actionIcon}
              />
            </View>
            <ThemedText type="default" style={styles.likesCount}>
              42 likes
            </ThemedText>
          </ThemedView>
          <View style={styles.footer}>
            <Ionicons
              name="chevron-down"
              size={ICON_SIZE.xs}
              color={Colors[mode].white}
            />
            <ThemedText
              type="defaultSemiBold"
              numberOfLines={2}
              style={styles.footerText}
              lightColor={Colors.light.white}
              darkColor={Colors.dark.white}
            >
              https://kroko.social/@kroko
            </ThemedText>
          </View>
        </ViewShot>
      </LinearGradient>
    </ThemedView>
  );

  return (
    <>
      <KrokoShareScreen />
      <ShareBottomSheet ref={viewShotRef} colors={colors} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: FLEX.one,
  },
  gradientBackground: {
    aspectRatio: 9 / 16,
    flex: 0.83,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'center',
    marginBottom: MARGIN.lg,
  },
  viewShotContainer: {
    width: '90%',
    padding: PADDING.sm,
  },
  cardContainer: {
    borderRadius: BORDER_RADIUS.sm,
    padding: PADDING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: MARGIN.lg,
  },
  profilePhoto: {
    width: AVATAR_SIZE.xs,
    height: AVATAR_SIZE.xs,
    borderRadius: BORDER_RADIUS.md,
    marginRight: MARGIN.md,
  },
  userInfo: {
    flex: FLEX.one,
  },
  username: {
    fontSize: FONT_SIZE.md,
  },
  postTime: {
    fontSize: FONT_SIZE.sm,
  },
  moreIcon: {
    marginLeft: 'auto',
  },
  postContent: {
    fontSize: FONT_SIZE.lg,
    marginBottom: MARGIN.lg,
  },
  postActions: {
    flexDirection: 'row',
    marginBottom: MARGIN.lg,
  },
  actionIcon: {
    marginRight: MARGIN.xl,
  },
  likesCount: {
    fontSize: FONT_SIZE.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: MARGIN.lg,
  },
  footerText: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
  },
});
