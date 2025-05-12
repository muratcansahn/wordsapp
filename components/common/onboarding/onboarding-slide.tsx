import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Onboarding1 from '@/assets/svg/onboarding/Onboarding1';
import Onboarding2 from '@/assets/svg/onboarding/Onboarding2';
import Onboarding3 from '@/assets/svg/onboarding/Onboarding3';
import { OnboardingItem } from '@/app/(no-auth)/onboarding';

interface OnboardingSlideProps {
  item: OnboardingItem;
  index: number;
  scrollX: any;
  isActive: boolean;
}

const OnboardingSlide: React.FC<OnboardingSlideProps> = ({ item, isActive }) => {
  const screenWidth = Dimensions.get('window').width;
  const cardSize = screenWidth * 0.8;

  let SvgComponent = null;
  if (item.id === '1') SvgComponent = <Onboarding1 width={cardSize} height={cardSize} isActive={isActive} />;
  else if (item.id === '2') SvgComponent = <Onboarding2 width={cardSize} height={cardSize} isActive={isActive} />;
  else if (item.id === '3') SvgComponent = <Onboarding3 width={cardSize} height={cardSize} isActive={isActive} />;

  return (
    <View style={styles.centerContainer}>
      {SvgComponent}
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: Dimensions.get('window').width,
    height: '100%',
    paddingHorizontal: 4,
    overflow: 'hidden', // Taşan içeriğin gizlenmesini sağlar
  },
});

export default OnboardingSlide;
