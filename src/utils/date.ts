function padTwoDigits(value: number): string {
  return value.toString().padStart(2, '0');
}

function parseDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addLocalDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = padTwoDigits(date.getMonth() + 1);
  const day = padTwoDigits(date.getDate());

  return `${year}-${month}-${day}`;
}

export function countConsecutiveReviewDays(
  reviewedAtValues: readonly string[],
  now: Date = new Date(),
): number {
  const reviewedDays = new Set<string>();

  for (const reviewedAt of reviewedAtValues) {
    const date = parseDate(reviewedAt);
    if (date) {
      reviewedDays.add(toLocalDateKey(date));
    }
  }

  const today = startOfLocalDay(now);
  const yesterday = addLocalDays(today, -1);
  const firstDay = reviewedDays.has(toLocalDateKey(today)) ? today : yesterday;

  let streakDays = 0;
  let cursor = firstDay;

  while (reviewedDays.has(toLocalDateKey(cursor))) {
    streakDays += 1;
    cursor = addLocalDays(cursor, -1);
  }

  return streakDays;
}
