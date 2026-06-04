import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

import type { FieldErrors } from '@/utils/validation';

/**
 * Aplica os erros por campo de um serviço (`FieldErrors`) ao `setError` do react-hook-form.
 * Ignora entradas sem mensagem.
 */
export function applyFieldErrors<Field extends string, TFieldValues extends FieldValues>(
  setError: UseFormSetError<TFieldValues>,
  fieldErrors: FieldErrors<Field>,
): void {
  const entries = Object.entries(fieldErrors) as Array<[string, string | undefined]>;

  for (const [field, message] of entries) {
    if (message) {
      setError(field as Path<TFieldValues>, { message });
    }
  }
}
