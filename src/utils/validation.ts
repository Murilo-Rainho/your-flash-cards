import type { ZodIssue } from 'zod';

export type FieldErrors<Field extends string> = Partial<Record<Field, string>>;

export function mapZodFieldErrors<Field extends string>(
  issues: readonly ZodIssue[],
): FieldErrors<Field> {
  return issues.reduce<FieldErrors<Field>>((errors, issue) => {
    const field = issue.path[0];

    if (typeof field !== 'string') {
      return errors;
    }

    const fieldName = field as Field;

    if (!errors[fieldName]) {
      errors[fieldName] = issue.message;
    }

    return errors;
  }, {});
}
