import type { StringCatalog } from '@/strings/types';

/**
 * Saudação por faixa horária para o cabeçalho da Home.
 *
 * Função pura: recebe strings e data por injeção para ser testável sem relógio/locale fixos.
 */
export function getGreeting(
  greetingStrings: StringCatalog['home']['greeting'],
  date: Date = new Date(),
): string {
  const hour = date.getHours();
  if (hour < 12) return greetingStrings.morning;
  if (hour < 18) return greetingStrings.afternoon;
  return greetingStrings.evening;
}
