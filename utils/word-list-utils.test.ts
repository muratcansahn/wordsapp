import { expect, test } from '@jest/globals';
import { buildWordItems } from './word-list-utils';

test('buildWordItems joins words, translations, and statuses by word id', () => {
  const result = buildWordItems(
    [
      { id: 1, name: 'apple' },
      { id: 2, name: 'water' },
    ],
    [
      {
        word_id: 2,
        mean: 'su',
        example_translated: 'Su ic.',
        example_original: 'Drink water.',
      },
      {
        word_id: 1,
        mean: 'elma',
        example_translated: 'Bir elma ye.',
        example_original: 'Eat an apple.',
      },
    ],
    [
      { word_id: 1, status: 1 },
      { word_id: 2, status: 2 },
    ]
  );

  expect(result).toEqual([
    {
      id: 1,
      text: 'apple',
      translation: 'elma',
      example: 'Bir elma ye.',
      example_original: 'Eat an apple.',
      status: 1,
    },
    {
      id: 2,
      text: 'water',
      translation: 'su',
      example: 'Su ic.',
      example_original: 'Drink water.',
      status: 2,
    },
  ]);
});
