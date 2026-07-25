import { expect, test } from '@jest/globals';
import { isListAccessible } from './premiumLimits';

test('free user can access only the first list', () => {
  expect(isListAccessible(1, 1, false)).toBe(true);
  expect(isListAccessible(2, 1, false)).toBe(false);
  expect(isListAccessible(3, 1, false)).toBe(false);
});

test('premium user can access every list', () => {
  expect(isListAccessible(1, 1, true)).toBe(true);
  expect(isListAccessible(2, 1, true)).toBe(true);
  expect(isListAccessible(9999, 1, true)).toBe(true);
});

test('handles an undefined firstListId (list not loaded yet) as inaccessible for free users', () => {
  expect(isListAccessible(1, undefined, false)).toBe(false);
});
