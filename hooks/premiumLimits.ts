// Pure logic for premium gating decisions. Kept dependency-free (no hooks, no RN)
// so it can be unit tested directly with plain Jest.

/**
 * Free/normal users get access to only the first word list; premium unlocks all of them.
 *
 * @param listId - id of the word list the user tapped
 * @param firstListId - id of the first list in the currently-loaded list (e.g. `wordLists[0]?.id`)
 * @param isPremium - whether the user has an active premium entitlement
 */
export const isListAccessible = (
  listId: number,
  firstListId: number | undefined,
  isPremium: boolean
): boolean => {
  if (isPremium) return true;
  return listId === firstListId;
};
