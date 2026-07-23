export interface WordItem {
  id: number;
  text: string;
  translation: string;
  example: string;
  example_original: string;
  status: number;
}

type WordRow = {
  id: number;
  name: string;
};

type TranslationRow = {
  word_id: number;
  mean?: string | null;
  example_translated?: string | null;
  example_original?: string | null;
};

type StatusRow = {
  word_id: number;
  status?: number | null;
};

export function buildWordItems(
  words: WordRow[] = [],
  translations: TranslationRow[] = [],
  statuses: StatusRow[] = []
): WordItem[] {
  const translationByWordId = new Map(translations.map((item) => [item.word_id, item]));
  const statusByWordId = new Map(statuses.map((item) => [item.word_id, item.status ?? 0]));

  return words.map((word) => {
    const translation = translationByWordId.get(word.id);

    return {
      id: word.id,
      text: word.name,
      translation: translation?.mean || '',
      example: translation?.example_translated || '',
      example_original: translation?.example_original || '',
      status: statusByWordId.get(word.id) || 0,
    };
  });
}
