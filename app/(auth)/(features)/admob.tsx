import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/common/typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import ShinyButton from '@/components/common/buttons/shiny-button';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
// import { useAdmob } from '@/hooks/useAdmob';
import {
  BORDER_RADIUS,
  BUTTON_HEIGHT,
  FLEX,
  FONT_SIZE,
  ICON_SIZE,
  MARGIN,
  PADDING,
} from '@/constants/AppConstants';
import Container from '@/components/common/container';
// import { admobConfig } from '@/services/admob/admobConfig';
interface AdmobProps {
  id: string;
  name: string;
  color: string;
  icon?: React.ReactNode;
  onPress?: () => void;
}

export default function Admob() {
  const { mode } = useTheme();
  // const { showInterstitial, showRewarded, showAppOpen } = useAdmob();

  const options: AdmobProps[] = [
    {
      id: 'banner',
      name: 'Banner Ads',
      color: '#00ff4e',
      icon: (
        <MaterialCommunityIcons
          name="google-ads"
          size={ICON_SIZE.sm}
          color="#00ff4e"
        />
      ),
    },
    {
      id: 'interstitial',
      name: 'Interstitial Ads',
      color: '#Ff0000',
      icon: (
        <MaterialCommunityIcons
          name="google-ads"
          size={ICON_SIZE.sm}
          color="#Ff0000"
        />
      ),
      onPress: () => {
        // showInterstitial();
      },
    },
    {
      id: 'rewarded',
      name: 'Rewarded Ads',
      color: '#007aff',
      icon: (
        <MaterialCommunityIcons
          name="google-ads"
          size={ICON_SIZE.sm}
          color="#007aff"
        />
      ),
      onPress: () => {
        // showRewarded();
      },
    },
    {
      id: 'appOpen',
      name: 'App Open Ads',
      color: '#ff8900',
      icon: (
        <MaterialCommunityIcons
          name="google-ads"
          size={ICON_SIZE.sm}
          color="#ff8900"
        />
      ),
      onPress: () => {
        // showAppOpen();
      },
    },
  ];

  return (
    <Container edges={['bottom']} bgColor={Colors[mode].background}>
      <ScrollView style={styles.contentContainer}>
        <ThemedText type="title" style={styles.title}>
          Admob
        </ThemedText>
        <ThemedText type="default" style={styles.subtitle}>
          Make money with your app
        </ThemedText>
        {options.map((option, index) => (
          <ShinyButton
            key={option.id}
            onPress={option.onPress}
            bgColor={Colors[mode].backgroundOpacity}
            icon={option.icon}
            title={option.name}
            height={BUTTON_HEIGHT.lg}
            borderRadius={BORDER_RADIUS.md}
            buttonColor={option.color}
            buttonStyle={{
              marginBottom: MARGIN.lg,
            }}
          />
        ))}
      </ScrollView>
      {/* <BannerAd
        unitId={admobConfig.bannerAdUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdLoaded={() => {
          console.log('Banner Ad Loaded');
        }}
      /> */}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: FLEX.one,
  },
  contentContainer: {
    paddingVertical: PADDING.xxl,
    paddingHorizontal: PADDING.lg,
  },
  title: {
    marginBottom: MARGIN.lg,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.light.placeholderColor,
    marginBottom: MARGIN.lg,
    textAlign: 'center',
    fontSize: FONT_SIZE.sm,
  },
});
