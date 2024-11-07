import { Feather } from '@expo/vector-icons';
import { ICON_SIZE } from '@/constants/AppConstants';
import { type IconProps } from '@expo/vector-icons/build/createIconSet';
import { type ComponentProps } from 'react';

export function TabBarIcon({
  style,
  ...rest
}: IconProps<ComponentProps<typeof Feather>['name']>) {
  return (
    <Feather
      size={ICON_SIZE.sm}
      style={[{ marginBottom: -3 }, style]}
      {...rest}
    />
  );
}
