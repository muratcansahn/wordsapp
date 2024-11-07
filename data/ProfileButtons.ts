import { Ionicons } from '@expo/vector-icons';

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  route: string;
};

export const menuItems: MenuItem[] = [
  {
    icon: 'pencil',
    text: 'profile.editProfile',
    route: '/profile',
  },
  {
    icon: 'card',
    text: 'profile.subscription',
    route: '/profile',
  },
  {
    icon: 'sunny',
    text: 'profile.theme',
    route: '/settings/theme',
  },
  {
    icon: 'notifications',
    text: 'profile.notifications',
    route: '/settings/notifications',
  },
  {
    icon: 'help-circle',
    text: 'profile.help',
    route: '/settings/help',
  },
  {
    icon: 'settings',
    text: 'profile.settings',
    route: '/settings',
  },
];
