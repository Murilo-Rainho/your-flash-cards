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
  /** Forces instant swap (accessibility/tests). If omitted, reads from the system. */
  reduceMotion?: boolean;
  /** Fired when the back face is reached (ANSWER state). */
  onFlipped?: () => void;
};

/**
 * 3D flip animation (reanimated v4).
 *
 * Uses two absolutely positioned faces rotating on `rotateY` with `perspective`. The back is
 * counter-rotated (180°→360°) so text is not mirrored, and visibility switches via opacity at
 * 90° — a robust approach on Android Expo Go (does not rely on `backfaceVisibility`). Respects
 * reduce motion.
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

  // Instant reset (no animated flip-back): when switching cards, the next one should
  // already show the front — visual transition between cards is handled elsewhere.
  const reset = useCallback(() => {
    progress.value = 0;
    setIsFlipped(false);
  }, [progress]);

  return { isFlipped, frontAnimatedStyle, backAnimatedStyle, flip, reset };
}

export type FlipAnimation = ReturnType<typeof useFlipAnimation>;
