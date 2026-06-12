import { extractExpectedClozeAnswer, normalizeStudyAnswer, parseClozeFront } from './cloze';

/**
 * Modelo estruturado de um card cloze (§9): a frase é uma sequência de segmentos de texto e
 * lacunas. Cada lacuna tem uma dica opcional (mostrada entre `{chaves}` na frente) e UMA OU
 * MAIS respostas aceitas (`answers[0]` é a primária, usada para compor o verso e o feedback).
 *
 * É a fonte da verdade do conteúdo cloze, persistida em `Card.cloze` (coluna `cloze_data`).
 * `Card.front`/`Card.back` continuam derivados deste modelo para exibição e compatibilidade.
 * TS puro (regra 01): sem React/Expo/infra.
 */
export type ClozeTextSegment = { kind: 'text'; text: string };
export type ClozeBlankSegment = { kind: 'blank'; hint?: string; answers: string[] };
export type ClozeSegment = ClozeTextSegment | ClozeBlankSegment;
export type ClozeContent = { segments: ClozeSegment[] };

export type ClozeValidationError = 'no-blanks' | 'blank-without-answer';
export type ClozeBlankAnswerCheck = {
  correct: boolean;
  /** Alternativa que deve aparecer primeiro no feedback: match quando acertou, primária quando errou. */
  expected: string;
  acceptedAnswers: string[];
  expectedIndex: number;
};

// Regex local (a cada chamada via matchAll, sem estado compartilhado de lastIndex).
const CLOZE_GAP_PATTERN = /\{([^{}]*)\}/g;

/** Posição (em caracteres) de cada `{...}` na frase, na ordem das lacunas. */
export type ClozeBlankRange = { start: number; end: number };

/**
 * Divide uma frase com marcações `{dica}` em segmentos (texto/lacuna), preservando o texto
 * exatamente como escrito (espaços inclusos). Cada `{...}` vira uma lacuna com `hint` = conteúdo
 * da chave (vazio vira `undefined`) e `answers` vazio (as respostas vivem fora da frase).
 * Também retorna as faixas de cada `{...}` para o editor reescrever a dica no lugar certo.
 */
export function parseClozeTemplate(sentence: string): {
  segments: ClozeSegment[];
  blankRanges: ClozeBlankRange[];
} {
  const segments: ClozeSegment[] = [];
  const blankRanges: ClozeBlankRange[] = [];
  let lastIndex = 0;

  for (const match of sentence.matchAll(CLOZE_GAP_PATTERN)) {
    const index = match.index ?? 0;
    const text = sentence.slice(lastIndex, index);

    if (text) {
      segments.push({ kind: 'text', text });
    }

    const hint = match[1] ?? '';
    segments.push({ kind: 'blank', hint: hint.trim() ? hint : undefined, answers: [] });
    blankRanges.push({ start: index, end: index + match[0].length });
    lastIndex = index + match[0].length;
  }

  const tail = sentence.slice(lastIndex);

  if (tail) {
    segments.push({ kind: 'text', text: tail });
  }

  return { segments, blankRanges };
}

/** Lacunas (na ordem) de um conteúdo cloze. */
export function getClozeBlanks(content: ClozeContent): ClozeBlankSegment[] {
  return content.segments.filter(
    (segment): segment is ClozeBlankSegment => segment.kind === 'blank',
  );
}

/**
 * Monta o `ClozeContent` final a partir da frase (com `{}`) e das respostas por lacuna,
 * alinhadas à ordem das lacunas parseadas. Respostas são aparadas e vazias descartadas.
 */
export function buildClozeContent(
  sentence: string,
  answersByBlank: readonly (readonly string[])[],
): ClozeContent {
  const { segments } = parseClozeTemplate(sentence);
  let blankIndex = 0;

  const merged = segments.map<ClozeSegment>((segment) => {
    if (segment.kind !== 'blank') {
      return segment;
    }

    const answers = (answersByBlank[blankIndex] ?? [])
      .map((answer) => answer.trim())
      .filter(Boolean);
    blankIndex += 1;
    return { kind: 'blank', hint: segment.hint, answers };
  });

  return { segments: merged };
}

/** Frase com a dica entre `{chaves}` por lacuna (grava em `Card.front` / exibe na revisão). */
export function composeClozeFront(content: ClozeContent): string {
  return content.segments
    .map((segment) => (segment.kind === 'text' ? segment.text : `{${segment.hint ?? ''}}`))
    .join('');
}

/** Frase completa com a resposta primária (`answers[0]`) por lacuna (grava em `Card.back`). */
export function composeClozeBack(content: ClozeContent): string {
  return content.segments
    .map((segment) => (segment.kind === 'text' ? segment.text : (segment.answers[0] ?? '')))
    .join('');
}

/**
 * Frase completa usando uma alternativa selecionada por lacuna. Se uma lacuna não tiver
 * seleção, cai na resposta primária — o mesmo fallback de `composeClozeBack`.
 */
export function composeClozeBackWithAnswers(
  content: ClozeContent,
  answersByBlank: readonly string[],
): string {
  let blankIndex = 0;

  return content.segments
    .map((segment) => {
      if (segment.kind === 'text') {
        return segment.text;
      }

      const selected = answersByBlank[blankIndex]?.trim();
      blankIndex += 1;
      return selected || segment.answers[0] || '';
    })
    .join('');
}

/** Respostas aceitas prontas para exibição/checagem: aparadas e sem vazios. */
export function getAcceptedClozeAnswers(answers: readonly string[]): string[] {
  return answers.map((answer) => answer.trim()).filter(Boolean);
}

export function checkClozeBlankAnswer(
  answers: readonly string[],
  typed: string,
): ClozeBlankAnswerCheck {
  const acceptedAnswers = getAcceptedClozeAnswers(answers);
  const normalizedTyped = normalizeStudyAnswer(typed);
  const matchedIndex = normalizedTyped
    ? acceptedAnswers.findIndex((answer) => normalizeStudyAnswer(answer) === normalizedTyped)
    : -1;
  const expectedIndex = matchedIndex >= 0 ? matchedIndex : 0;

  return {
    correct: matchedIndex >= 0,
    expected: acceptedAnswers[expectedIndex] ?? '',
    acceptedAnswers,
    expectedIndex,
  };
}

/**
 * Resposta correta para uma lacuna: a digitação normalizada bate com ALGUMA das respostas
 * aceitas (também normalizadas). Reusa a normalização canônica do projeto.
 */
export function checkClozeBlank(answers: readonly string[], typed: string): boolean {
  return checkClozeBlankAnswer(answers, typed).correct;
}

/** Valida o conteúdo cloze: ≥ 1 lacuna e cada lacuna com ≥ 1 resposta aceita. */
export function validateClozeContent(content: ClozeContent): ClozeValidationError | null {
  const blanks = getClozeBlanks(content);

  if (blanks.length === 0) {
    return 'no-blanks';
  }

  if (blanks.some((blank) => blank.answers.length === 0)) {
    return 'blank-without-answer';
  }

  return null;
}

export function serializeClozeContent(content: ClozeContent): string {
  return JSON.stringify(content);
}

/**
 * Desserializa o `cloze_data` persistido de forma defensiva: dados ausentes/corrompidos
 * retornam `null` (o chamador cai no bridge legado a partir de `front`/`back`).
 */
export function deserializeClozeContent(raw: string | null | undefined): ClozeContent | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !Array.isArray((parsed as { segments?: unknown }).segments)
    ) {
      return null;
    }

    const segments: ClozeSegment[] = [];

    for (const segment of (parsed as { segments: unknown[] }).segments) {
      if (typeof segment !== 'object' || segment === null) {
        return null;
      }

      const candidate = segment as {
        kind?: unknown;
        text?: unknown;
        hint?: unknown;
        answers?: unknown;
      };

      if (candidate.kind === 'text' && typeof candidate.text === 'string') {
        segments.push({ kind: 'text', text: candidate.text });
      } else if (candidate.kind === 'blank' && Array.isArray(candidate.answers)) {
        const answers = candidate.answers.filter(
          (answer): answer is string => typeof answer === 'string',
        );
        const hint = typeof candidate.hint === 'string' ? candidate.hint : undefined;
        segments.push({ kind: 'blank', hint, answers });
      } else {
        return null;
      }
    }

    return { segments };
  } catch {
    return null;
  }
}

/**
 * Reconstrói um `ClozeContent` (1 lacuna / 1 resposta) a partir de uma frente/verso legados.
 * Compatibilidade com cards cloze criados antes do suporte a múltiplas lacunas.
 */
export function clozeContentFromLegacy(front: string, back: string): ClozeContent {
  const parsed = parseClozeFront(front);

  if (!parsed) {
    return { segments: front ? [{ kind: 'text', text: front }] : [] };
  }

  const expected = extractExpectedClozeAnswer(front, back);
  const segments: ClozeSegment[] = [];

  if (parsed.before) {
    segments.push({ kind: 'text', text: parsed.before });
  }

  segments.push({
    kind: 'blank',
    hint: parsed.gap.trim() ? parsed.gap : undefined,
    answers: expected ? [expected] : [],
  });

  if (parsed.after) {
    segments.push({ kind: 'text', text: parsed.after });
  }

  return { segments };
}

/** Conteúdo cloze de um card: usa o estruturado (`card.cloze`) ou o bridge legado. */
export function resolveClozeContent(card: {
  front: string;
  back: string;
  cloze?: ClozeContent;
}): ClozeContent {
  return card.cloze ?? clozeContentFromLegacy(card.front, card.back);
}
