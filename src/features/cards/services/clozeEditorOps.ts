import { parseClozeTemplate } from '@/domain/cloze/clozeContent';

/**
 * Operações puras de autoria do cloze sobre a frase (com `{}`) e as respostas por lacuna.
 * Extraídas do hook `useClozeEditor` para ficarem testáveis sem React. Mantêm o alinhamento
 * entre a ordem das lacunas na frase e o array de respostas.
 */
export type ClozeEditorState = { sentence: string; answers: string[][] };

/** Remove chaves do texto da dica para evitar marcações aninhadas/inválidas. */
export function sanitizeClozeHint(value: string): string {
  return value.replace(/[{}]/g, '');
}

function blankCount(sentence: string): number {
  return parseClozeTemplate(sentence).blankRanges.length;
}

/**
 * Ajusta o array de respostas ao número de lacunas após uma edição livre da frase (best-effort,
 * por índice): trunca quando há menos lacunas, completa com uma resposta vazia quando há mais.
 */
export function reconcileClozeAnswers(answers: string[][], sentence: string): string[][] {
  const count = blankCount(sentence);

  if (answers.length === count) {
    return answers;
  }

  if (answers.length > count) {
    return answers.slice(0, count);
  }

  const next = [...answers];
  while (next.length < count) {
    next.push(['']);
  }
  return next;
}

/** Envolve o trecho [start, end) em `{}` (vira lacuna) e insere uma resposta vazia na ordem certa. */
export function insertClozeBlank(
  state: ClozeEditorState,
  start: number,
  end: number,
): ClozeEditorState {
  const { sentence, answers } = state;

  if (end <= start) {
    return state;
  }

  const safeStart = Math.max(0, Math.min(start, sentence.length));
  const safeEnd = Math.max(safeStart, Math.min(end, sentence.length));
  const hint = sanitizeClozeHint(sentence.slice(safeStart, safeEnd));
  const { blankRanges } = parseClozeTemplate(sentence);
  const insertIndex = blankRanges.filter((range) => range.start < safeStart).length;

  const nextAnswers = [...answers];
  nextAnswers.splice(insertIndex, 0, ['']);

  return {
    sentence: `${sentence.slice(0, safeStart)}{${hint}}${sentence.slice(safeEnd)}`,
    answers: nextAnswers,
  };
}

/** Reescreve a dica (conteúdo entre chaves) da lacuna `blankIndex`. */
export function rewriteClozeBlankHint(sentence: string, blankIndex: number, hint: string): string {
  const { blankRanges } = parseClozeTemplate(sentence);
  const range = blankRanges[blankIndex];

  if (!range) {
    return sentence;
  }

  return `${sentence.slice(0, range.start)}{${sanitizeClozeHint(hint)}}${sentence.slice(range.end)}`;
}

/** Desfaz a lacuna `blankIndex` (mantém o texto da dica como texto comum) e remove suas respostas. */
export function removeClozeBlank(state: ClozeEditorState, blankIndex: number): ClozeEditorState {
  const { sentence, answers } = state;
  const { blankRanges } = parseClozeTemplate(sentence);
  const range = blankRanges[blankIndex];

  if (!range) {
    return state;
  }

  const hintText = sentence.slice(range.start + 1, range.end - 1);

  return {
    sentence: `${sentence.slice(0, range.start)}${hintText}${sentence.slice(range.end)}`,
    answers: answers.filter((_, index) => index !== blankIndex),
  };
}
