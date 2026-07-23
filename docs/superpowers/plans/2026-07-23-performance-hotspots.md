# Performance Hotspots Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the measured Learn list and Dashboard scroll hotspots without changing app behavior or adding dependencies.

**Architecture:** Keep the current Expo Router and React Native structure. Fix the two measured hotspots in place: pass stable per-item progress into Learn list items, remove duplicated Dashboard game status fetches, and reduce avoidable draw work where it is obviously expensive.

**Tech Stack:** Expo Router, React Native, TypeScript, Supabase, Redux, React Native Animated, existing ESLint/Jest tooling.

## Global Constraints

- Do not add dependencies.
- Do not change visible UI or navigation behavior.
- Use `React.memo`, `useMemo`, and `useCallback` only where they reduce a measured or obvious render path.
- Keep hook dependencies correct.
- Treat full-project `tsc`, full lint, and Jest infra failures as existing build-health issues unless touched files introduce new errors.
- Report measured improvements only when measured; otherwise report expected impact.

---

### Task 1: Learn Item Progress Props

**Files:**
- Modify: `app/learn/index.tsx`

**Interfaces:**
- Consumes: existing `WordList`, `knownUnknownMap`, `handleListSelect`
- Produces: `WordListItem` props `{ list, progress, onPress, t }`

- [x] **Step 1: Change `WordListItem` to receive only its own progress**

Replace the item renderer with:

```tsx
const renderWordListItem = useCallback(({ item }: { item: WordList }) => (
  <WordListItem
    list={item}
    progress={knownUnknownMap[item.id]}
    onPress={handleListSelect}
    t={t}
  />
), [handleListSelect, knownUnknownMap, t]);
```

Replace `WordListItem` props with:

```tsx
const WordListItem = memo(({ list, progress, onPress, t }: {
  list: WordList;
  progress?: { biliyorum: number; bilmiyorum: number };
  onPress: (id: number) => void;
  t: (key: string) => string;
}) => {
  const known = progress?.biliyorum || 0;
  const unknown = progress?.bilmiyorum || 0;
  const remaining = Math.max(0, list.total_words - unknown - known);
  const markedWords = known + unknown;
  const statusText = markedWords > 0
    ? `%${list.total_words > 0 ? Math.round((markedWords / list.total_words) * 100) : 0}`
    : t('learnIndex.notStarted');
```

- [x] **Step 2: Remove per-render inline progress calculations**

Use `known`, `unknown`, `remaining`, and `statusText` in JSX.

- [x] **Step 3: Update memo comparison**

Use:

```tsx
}, (prevProps, nextProps) => (
  prevProps.list.id === nextProps.list.id &&
  prevProps.list.total_words === nextProps.list.total_words &&
  prevProps.list.description === nextProps.list.description &&
  prevProps.list.image === nextProps.list.image &&
  prevProps.progress?.biliyorum === nextProps.progress?.biliyorum &&
  prevProps.progress?.bilmiyorum === nextProps.progress?.bilmiyorum
));
```

- [x] **Step 4: Verify**

Run: `npx eslint app/learn/index.tsx`

Expected: `0 errors`; existing warnings are acceptable if unrelated.

### Task 2: Learn Draw Cost Trim

**Files:**
- Modify: `app/learn/index.tsx`

**Interfaces:**
- Consumes: existing styles
- Produces: same UI with less Android shadow/elevation work

- [x] **Step 1: Move shadow/elevation from gradient child to card wrapper**

Use the existing `listItem` wrapper for elevation and leave `gradientContainer` focused on layout.

- [x] **Step 2: Remove nested card shadow**

Remove shadow/elevation from `progressContainer`; keep background, padding, and border radius.

- [x] **Step 3: Verify**

Run: `npx eslint app/learn/index.tsx`

Expected: `0 errors`.

### Task 3: Dashboard Duplicate Game Status Fetch

**Files:**
- Modify: `components/screen/dashboard/DailyActivitiesSection.tsx`

**Interfaces:**
- Consumes: existing Supabase query and focus refresh behavior
- Produces: one shared `fetchGameStatus` callback used by focus refresh and initial mount

- [x] **Step 1: Extract shared callback**

Create:

```tsx
const fetchGameStatus = useCallback(async () => {
  if (!user?.id) return;

  const { data, error } = await supabase
    .from('UserGameRequestDates')
    .select('wordguess, wordmatching, wordguess_remaining, wordmatching_remaining')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Oyun durumu getirilemedi:', error);
    return;
  }

  setGameStatus({
    wordguess: {
      remaining: data.wordguess_remaining || 0,
      lastPlayed: data.wordguess
    },
    wordmatching: {
      remaining: data.wordmatching_remaining || 0,
      lastPlayed: data.wordmatching
    }
  });
}, [user?.id]);
```

- [x] **Step 2: Use it from focus and mount**

`useFocusEffect(useCallback(() => { fetchGameStatus(); }, [fetchGameStatus]));`

`useEffect(() => { fetchGameStatus(); }, [fetchGameStatus]);`

- [x] **Step 3: Fix stale translation dependency**

`dailyContent` must depend on `t`.

- [x] **Step 4: Verify**

Run: `npx eslint components/screen/dashboard/DailyActivitiesSection.tsx`

Expected: `0 errors`; existing warnings acceptable if unrelated.

### Task 4: Final Verification

**Files:**
- Modify: none

**Interfaces:**
- Consumes: touched files
- Produces: verification report

- [x] **Step 1: Run targeted lint**

Run:

```bash
npx eslint app/learn/index.tsx components/screen/dashboard/DailyActivitiesSection.tsx
```

Expected: `0 errors`.

- [x] **Step 2: Run full TypeScript**

Run:

```bash
npx tsc --noEmit --pretty false
```

Expected: May fail on existing project-wide type debt; report first unrelated files.

- [x] **Step 3: Report**

Summarize changed files, expected impact, and any verification blockers.
