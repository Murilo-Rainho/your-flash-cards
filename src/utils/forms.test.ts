import { describe, expect, it } from '@jest/globals';

import type { FieldValues, UseFormSetError } from 'react-hook-form';

import { applyFieldErrors } from './forms';

describe('applyFieldErrors', () => {
  it('calls setError once per non-empty message', () => {
    const setError = jest.fn();

    applyFieldErrors(setError as unknown as UseFormSetError<FieldValues>, {
      name: 'Obrigatorio',
      description: undefined,
      baseLanguage: 'Idioma invalido',
    });

    expect(setError).toHaveBeenCalledTimes(2);
    expect(setError).toHaveBeenCalledWith('name', { message: 'Obrigatorio' });
    expect(setError).toHaveBeenCalledWith('baseLanguage', { message: 'Idioma invalido' });
  });

  it('does nothing when there are no errors', () => {
    const setError = jest.fn();

    applyFieldErrors(setError as unknown as UseFormSetError<FieldValues>, {});

    expect(setError).not.toHaveBeenCalled();
  });
});
