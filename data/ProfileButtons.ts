import {
  Pencil,
  CreditCard,
  Sun,
  Bell,
  HelpCircle,
  Settings,
  LucideIcon,
} from 'lucide-react-native';

type MenuItem = {
  icon: LucideIcon;
  text: string;
  route: string;
};

export const menuItems: MenuItem[] = [
  {
    icon: Pencil,
    text: 'profile.editProfile',
    route: '/profile',
  },
  {
    icon: CreditCard,
    text: 'profile.subscription',
    route: '/profile',
  },
  {
    icon: Sun,
    text: 'profile.theme',
    route: '/settings/theme',
  },
  {
    icon: Bell,
    text: 'profile.notifications',
    route: '/settings/notifications',
  },
  {
    icon: HelpCircle,
    text: 'profile.help',
    route: '/settings/help',
  },
  {
    icon: Settings,
    text: 'profile.settings',
    route: '/settings',
  },
];
