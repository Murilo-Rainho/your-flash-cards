import { useCallback, useMemo, useState } from 'react';

import { buildClozeContent, type ClozeContent } from '@/domain/cloze/clozeContent';

import {
  insertClozeBlank,
  reconcileClozeAnswers,
  removeClozeBlank,
  rewriteClozeBlankHint,
  type ClozeEditorState,
} from '../services/clozeEditorOps';

export type { ClozeEditorState } from '../services/clozeEditorOps';

export type ClozeEditor = ClozeEditorState & {
  /** Conteúdo estruturado derivado (enviado ao serviço e ao preview de revisão). */
  content: ClozeContent;
  setSentence: (sentence: string) => void;
  /** Envolve o trecho [start, end) da frase em `{}`, criando uma lacuna com aquele texto como dica. */
  markBlank: (start: number, end: number) => void;
  changeBlankHint: (blankIndex: number, hint: string) => void;
  removeBlank: (blankIndex: number) => void;
  addAnswer: (blankIndex: number) => void;
  changeAnswer: (blankIndex: number, answerIndex: number, value: string) => void;
  removeAnswer: (blankIndex: number, answerIndex: number) => void;
  reset: (next: ClozeEditorState) => void;
};

export function useClozeEditor(initial: ClozeEditorState): ClozeEditor {
  const [state, setState] = useState<ClozeEditorState>(initial);
  const { sentence, answers } = state;

  const setSentence = useCallback((next: string) => {
    setState((current) => ({
      sentence: next,
      answers: reconcileClozeAnswers(current.answers, next),
    }));
  }, []);

  const markBlank = useCallback((start: number, end: number) => {
    setState((current) => insertClozeBlank(current, start, end));
  }, []);

  const changeBlankHint = useCallback((blankIndex: number, hint: string) => {
    setState((current) => ({
      ...current,
      sentence: rewriteClozeBlankHint(current.sentence, blankIndex, hint),
    }));
  }, []);

  const removeBlank = useCallback((blankIndex: number) => {
    setState((current) => removeClozeBlank(current, blankIndex));
  }, []);

  const addAnswer = useCallback((blankIndex: number) => {
    setState((current) => ({
      ...current,
      answers: current.answers.map((blankAnswers, index) =>
        index === blankIndex ? [...blankAnswers, ''] : blankAnswers,
      ),
    }));
  }, []);

  const changeAnswer = useCallback((blankIndex: number, answerIndex: number, value: string) => {
    setState((current) => ({
      ...current,
      answers: current.answers.map((blankAnswers, index) =>
        index === blankIndex
          ? blankAnswers.map((answer, position) => (position === answerIndex ? value : answer))
          : blankAnswers,
      ),
    }));
  }, []);

  const removeAnswer = useCallback((blankIndex: number, answerIndex: number) => {
    setState((current) => ({
      ...current,
      answers: current.answers.map((blankAnswers, index) =>
        index === blankIndex
          ? blankAnswers.filter((_, position) => position !== answerIndex)
          : blankAnswers,
      ),
    }));
  }, []);

  const reset = useCallback((next: ClozeEditorState) => {
    setState(next);
  }, []);

  const content = useMemo(() => buildClozeContent(sentence, answers), [sentence, answers]);

  return {
    sentence,
    answers,
    content,
    setSentence,
    markBlank,
    changeBlankHint,
    removeBlank,
    addAnswer,
    changeAnswer,
    removeAnswer,
    reset,
  };
}
