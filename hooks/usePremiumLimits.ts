import { useRevenueCat } from '@/context/RevenueCatProvider';

const FREE_CUSTOM_LIST_LIMIT = 2;

export const usePremiumLimits = () => {
  const { isPremium } = useRevenueCat();

  const customListLimit = isPremium ? Infinity : FREE_CUSTOM_LIST_LIMIT;

  const canCreateCustomList = (currentCount: number) => currentCount < customListLimit;

  return { isPremium, customListLimit, canCreateCustomList };
};
