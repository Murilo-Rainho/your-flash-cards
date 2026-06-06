import { useCallback, useRef, useState } from 'react';
import {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const FLIP_DURATION_MS = 420;
const PERSPECTIVE = 1000;

type UseFlipAnimationParams = {
  /** Força o swap instantâneo (acessibilidade/testes). Se omitido, lê o sistema. */
  reduceMotion?: boolean;
  /** Disparado ao chegar no verso (estado ANSWER). */
  onFlipped?: () => void;
};

/**
 * Animação de flip 3D (reanimated v4).
 *
 * Usa duas faces absolutas que giram em `rotateY` com `perspective`. O verso é
 * contra-rotacionado (180°→360°) para o texto não ficar espelhado, e a visibilidade
 * é trocada por opacidade no ponto de 90° — abordagem robusta no Android do Expo Go
 * (não depende de `backfaceVisibility`). Respeita "reduzir movimento".
 */
export function useFlipAnimation({ reduceMotion, onFlipped }: UseFlipAnimationParams = {}) {
  const progress = useSharedValue(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const systemReduceMotion = useReducedMotion();
  const onFlippedRef = useRef(onFlipped);
  onFlippedRef.current = onFlipped;

  const prefersReducedMotion = reduceMotion ?? systemReduceMotion;

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: PERSPECTIVE },
      { rotateY: `${interpolate(progress.value, [0, 1], [0, 180])}deg` },
    ],
    opacity: progress.value < 0.5 ? 1 : 0,
  }));

  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: PERSPECTIVE },
      { rotateY: `${interpolate(progress.value, [0, 1], [180, 360])}deg` },
    ],
    opacity: progress.value >= 0.5 ? 1 : 0,
  }));

  const handleArrived = useCallback(() => {
    setIsFlipped(true);
    onFlippedRef.current?.();
  }, []);

  const flip = useCallback(() => {
    if (prefersReducedMotion) {
      progress.value = 1;
      handleArrived();
      return;
    }

    progress.value = withTiming(
      1,
      { duration: FLIP_DURATION_MS, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(handleArrived)();
        }
      },
    );
  }, [handleArrived, prefersReducedMotion, progress]);

  // Reset instantâneo (sem flip-back animado): ao trocar de card, o próximo já deve
  // aparecer na frente — a transição visual entre cards fica por conta de outra animação.
  const reset = useCallback(() => {
    progress.value = 0;
    setIsFlipped(false);
  }, [progress]);

  return { isFlipped, frontAnimatedStyle, backAnimatedStyle, flip, reset };
}

export type FlipAnimation = ReturnType<typeof useFlipAnimation>;
