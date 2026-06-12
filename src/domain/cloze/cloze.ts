export type ParsedClozeFront = {
  before: string;
  gap: string;
  after: string;
};

const CLOZE_GAP_PATTERN = /\{([^{}]*)\}/g;

/**
 * Lê uma frase legada de cloze (1 lacuna no formato `{texto}`) e separa os trechos.
 * Mantido como base do "bridge" de cards antigos — ver `clozeContentFromLegacy`.
 */
export function parseClozeFront(front: string): ParsedClozeFront | null {
  const matches = [...front.matchAll(CLOZE_GAP_PATTERN)];

  if (matches.length !== 1) {
    return null;
  }

  const match = matches[0];
  const gap = match[1] ?? '';

  if (!gap.trim()) {
    return null;
  }

  const before = front.slice(0, match.index);
  const after = front.slice(match.index + match[0].length);

  return { before, gap, after };
}

/**
 * Extrai a resposta de uma frase legada comparando frente (`{dica}`) e verso completo.
 * Usado apenas para reconstruir o `ClozeContent` de cards antigos.
 */
export function extractExpectedClozeAnswer(front: string, back: string): string | null {
  const parsed = parseClozeFront(front);

  if (!parsed) {
    return null;
  }

  const { before, after } = parsed;

  if (!back.startsWith(before) || !back.endsWith(after)) {
    return null;
  }

  const expected = back.slice(before.length, back.length - after.length);

  if (!expected.trim()) {
    return null;
  }

  return expected;
}

/**
 * Normalização canônica de respostas digitadas (cloze/escrita/escuta): remove espaços nas
 * pontas, baixa caixa, descarta pontuação (preserva letras acentuadas e números) e colapsa
 * espaços internos. É a referência de comparação de respostas em todo o app.
 */
export function normalizeStudyAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}
