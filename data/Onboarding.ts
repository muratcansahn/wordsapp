import { OnboardingItem } from '@/app/(no-auth)/onboarding';

//! IMPORTANT 🚨
//? If you want to change the title, description;
// Go to the: /i18n/locales/en-US/translation.json
// And change the text in the "onboarding" section.

export const onboardingData: OnboardingItem[] = [
  {
    id: '1',
    title: 'onboarding.title1',
    description: 'onboarding.desc1',
    lottie: require('@/assets/lotties/onboarding.json'),
    // If you want to use an image instead of a lottie, uncomment the following lines 👇
    // image: require('@/assets/images/logo.png'),
  },
  {
    id: '2',
    title: 'onboarding.title2',
    description: 'onboarding.desc2',
    lottie: require('@/assets/lotties/onboarding1.json'),
  },
  {
    id: '3',
    title: 'onboarding.title3',
    description: 'onboarding.desc3',
    lottie: require('@/assets/lotties/onboarding2.json'),
  },
  {
    id: '4',
    title: 'onboarding.title4',
    description: 'onboarding.desc4',
    lottie: require('@/assets/lotties/onboarding4.json'),
  },
  {
    id: '5',
    title: 'onboarding.title5',
    description: 'onboarding.desc5',
    lottie: require('@/assets/lotties/onboarding5.json'),
  },
];
