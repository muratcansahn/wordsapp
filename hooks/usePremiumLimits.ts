import { useCallback } from 'react';
import { useRevenueCat } from '@/context/RevenueCatProvider';
import { isListAccessible } from '@/hooks/premiumLimits';

/**
 * Free/normal users get access to only the first word list; premium unlocks all of them.
 * `isReady` mirrors RevenueCat's own init flag: callers must wait for it before
 * trusting `isPremium` for a redirect decision, otherwise a paying user can be
 * bounced to the paywall during the init window (isPremium defaults to false).
 */
export const usePremiumLimits = () => {
  const { isPremium, isReady } = useRevenueCat();

  const canAccessList = useCallback(
    (listId: number, firstListId: number | undefined) =>
      isListAccessible(listId, firstListId, isPremium),
    [isPremium]
  );

  return { isPremium, isReady, canAccessList };
};
