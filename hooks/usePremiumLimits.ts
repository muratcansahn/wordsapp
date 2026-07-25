import { useRevenueCat } from '@/context/RevenueCatProvider';
import { isListAccessible } from '@/hooks/premiumLimits';

/**
 * Free/normal users get access to only the first word list; premium unlocks all of them.
 */
export const usePremiumLimits = () => {
  const { isPremium } = useRevenueCat();

  const canAccessList = (listId: number, firstListId: number | undefined) =>
    isListAccessible(listId, firstListId, isPremium);

  return { isPremium, canAccessList };
};
