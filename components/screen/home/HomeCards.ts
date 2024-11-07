export const features: {
  id: string;
  icon: string;
  route: string;
  name: string;
}[] = [
  {
    id: '1',
    icon: 'cart',
    route: '(modals)/paywall',
    name: 'home.inAppPurchases',
  },
  {
    id: '2',
    icon: 'cash',
    route: '(features)/admob',
    name: 'home.admob',
  },
  {
    id: '3',
    icon: 'notifications',
    route: 'settings/notifications',
    name: 'home.notifications',
  },
  {
    id: '4',
    icon: 'language',
    name: 'home.language',
    route: 'settings/language',
  },
  {
    id: '5',
    icon: 'settings',
    name: 'home.settings',
    route: 'settings',
  },

  {
    id: '6',
    icon: 'share-social',
    name: 'home.socialSharing',
    route: '(features)/social-sharing',
  },
  {
    id: '7',
    icon: 'color-palette',
    route: 'settings/theme',
    name: 'home.theme',
  },
];
