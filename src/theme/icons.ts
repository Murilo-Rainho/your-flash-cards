/**
 * Camada de inversão de dependência para ícones.
 *
 * O app referencia ícones por NOMES SEMÂNTICOS (ex.: `'add'`, `'review'`), nunca
 * pelo nome cru da biblioteca de ícones. Assim, ao trocar de lib de ícones no
 * futuro (ex.: Feather → lucide), basta atualizar `IconFamily` e o mapeamento
 * abaixo — nenhuma tela precisa mudar.
 *
 * Renderize sempre via o componente `@/components/common/Icon`, nunca importando
 * a família diretamente nas telas.
 */
import { Feather } from '@expo/vector-icons';

/** Família de ícones do app. Trocar a lib inteira = trocar aqui + os glyphs abaixo. */
export const IconFamily = Feather;

/** nome semântico -> glyph na biblioteca atual (Feather). */
export const icons = {
  home: 'home',
  settings: 'settings',
  menu: 'menu', // hamburger
  back: 'arrow-left',
  chevron: 'chevron-right',
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
  reviewedToday: 'trending-up', // 📈
  retention: 'target', // 🎯
  streak: 'activity', // 🔥 (Feather não tem "fire")
  mastered: 'award', // 🏆 (Feather não tem "trophy")
} as const;

export type IconName = keyof typeof icons;
