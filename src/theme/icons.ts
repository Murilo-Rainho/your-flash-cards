/**
 * Dependency-inversion layer for icons.
 *
 * The app references icons by SEMANTIC NAMES (e.g. `'add'`, `'review'`), never by raw
 * library glyph names. To swap icon libraries later (e.g. Feather → lucide), update
 * `IconFamily` and the mapping below — no screen changes required.
 *
 * Always render via `@/components/common/Icon`; never import the family directly in screens.
 */
import { Feather } from '@expo/vector-icons';

/** App icon family. Swapping the whole library = change here + the glyphs below. */
export const IconFamily = Feather;

/** semantic name -> glyph in the current library (Feather). */
export const icons = {
  home: 'home',
  settings: 'settings',
  menu: 'menu', // hamburger
  back: 'arrow-left',
  close: 'x', // ✕ (close modal/sheet)
  search: 'search',
  chevron: 'chevron-right',
  previous: 'chevron-left',
  next: 'chevron-right',
  play: 'play', // ▶ (play audio/recording)
  greeting: 'smile',
  add: 'plus',
  edit: 'edit-2', // ✏️
  delete: 'trash-2', // 🗑️
  tag: 'tag', // 🏷️
  review: 'zap', // ⚡
  done: 'check-circle', // ✅
  collection: 'book', // 📚
  deck: 'layers', // 🗂️
  card: 'edit-3', // ✏️
  import: 'download', // 📥
  export: 'upload', // 📤
  reviewedToday: 'trending-up', // 📈
  retention: 'target', // 🎯
  streak: 'activity', // 🔥 (Feather has no "fire")
  mastered: 'award', // 🏆 (Feather has no "trophy")
  tour: 'compass', // 🧭 (guided tour / onboarding)
  guide: 'book-open', // 📖 ("Why flashcards" page)
} as const;

export type IconName = keyof typeof icons;
