import type { StringCatalog } from '@/strings/types';

/**
 * Time-of-day greeting for the Home header.
 *
 * Pure function: receives strings and date by injection for testing without fixed clock/locale.
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
