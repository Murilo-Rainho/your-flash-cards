import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { PrimaryButton } from '@/components/common/PrimaryButton';
import { useTheme } from '@/theme/useTheme';
import { withAlpha } from '@/theme/createShadows';

import { AnswerFeedback } from './AnswerFeedback';
import { AnswerInput } from './AnswerInput';
import { FlashcardFace } from './FlashcardFace';
import { RatingButtons } from './RatingButtons';
import type { CheckedAnswer, FlashcardReviewProps } from './types';
import { useFlipAnimation } from './useFlipAnimation';

const FLIP_HEIGHT = 360;
const CARD_ENTER_DURATION_MS = 260;
const CARD_ENTER_OFFSET = 32;

/**
 * Card de revisão flutuante com animação de flip (§35).
 *
 * QUESTION (frente + afordância de resposta) → vira → ANSWER (verso + avaliação).
 * É 100% agnóstico: a diferença entre "Testar" (criação) e revisão real está apenas no
 * `onRate` passado pela feature.
 */
export function FlashcardReview({
  visible,
  cardKey,
  card,
  strings,
  onRate,
  onClose,
  onFlip,
  reduceMotion,
}: FlashcardReviewProps) {
  const { colors, shadows } = useTheme();
  const [typed, setTyped] = useState('');
  const [checked, setChecked] = useState<CheckedAnswer | null>(null);
  const [override, setOverride] = useState<boolean | null>(null);

  const systemReduceMotion = useReducedMotion();
  const prefersReducedMotion = reduceMotion ?? systemReduceMotion;

  const { isFlipped, frontAnimatedStyle, backAnimatedStyle, flip, reset } = useFlipAnimation({
    reduceMotion,
    onFlipped: onFlip,
  });

  // Animação de entrada do card (§35): cada novo card desliza + aparece. Entre cards apenas.
  const enter = useSharedValue(1);
  const prevCardKeyRef = useRef(cardKey);
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateX: interpolate(enter.value, [0, 1], [CARD_ENTER_OFFSET, 0]) }],
  }));

  // Ao abrir (ou trocar de card), sempre começa pela frente, com a resposta zerada;
  // e, quando o card muda dentro da sessão, dispara a animação de entrada.
  useEffect(() => {
    if (!visible) {
      return;
    }
    setTyped('');
    setChecked(null);
    setOverride(null);
    reset();

    const changed = prevCardKeyRef.current !== cardKey;
    prevCardKeyRef.current = cardKey;

    if (cardKey === undefined || !changed || prefersReducedMotion) {
      enter.value = 1;
      return;
    }

    enter.value = 0;
    enter.value = withTiming(1, {
      duration: CARD_ENTER_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [visible, cardKey, reset, enter, prefersReducedMotion]);

  const { answer } = card;
  const hasTyped = typed.trim().length > 0;

  const handleFlip = useCallback(() => {
    if (answer.kind === 'typing') {
      setChecked(answer.checkAnswer(typed));
    } else if (answer.kind === 'cloze' || answer.kind === 'listening') {
      // Cloze/Escuta: comparação só faz sentido quando o usuário digitou algo.
      setChecked(typed.trim() ? answer.checkAnswer(typed) : null);
    }
    flip();
  }, [answer, flip, typed]);

  // Escuta digitada e Escrita verificam; nos demais casos é só virar.
  const flipLabel =
    answer.kind === 'typing' || (answer.kind === 'listening' && hasTyped)
      ? strings.flipVerify
      : strings.flipCard;
  const allowOverride = answer.kind === 'typing' || answer.kind === 'listening';
  // Escuta e Pronúncia: ao virar, o verso reouve a própria gravação para comparar com o card.
  const showRecordedOnBack =
    (answer.kind === 'listening' || answer.kind === 'recording') &&
    !checked &&
    Boolean(answer.recordedUri);
  const effectiveCorrect = override ?? checked?.correct ?? false;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        accessibilityLabel={strings.closeKeyboardA11y}
        onPress={Keyboard.dismiss}
        style={[styles.backdrop, { backgroundColor: withAlpha(colors.textPrimary, 0.6) }]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.centered}
        >
          {/* Pressable interno "vazio" evita que toques no card fechem o teclado/repassem. */}
          <Pressable onPress={() => undefined} className="w-full">
            <Animated.View
              style={[{ backgroundColor: colors.background, ...shadows.lg }, cardAnimatedStyle]}
              className="w-full gap-4 rounded-2xl p-5"
            >
              <View className="flex-row items-center justify-between">
                <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold">
                  {isFlipped ? strings.howDidYouDo : strings.reviewCardTitle}
                </Text>
                {onClose ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={strings.closeA11y}
                    onPress={onClose}
                    className="h-8 w-8 items-center justify-center rounded-full active:opacity-90"
                  >
                    <Text style={{ color: colors.textSecondary }} className="text-lg">
                      ✕
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              <View style={styles.flipArea}>
                {/* FRENTE / QUESTION */}
                <Animated.View
                  style={[styles.face, frontAnimatedStyle]}
                  pointerEvents={isFlipped ? 'none' : 'auto'}
                >
                  <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                  >
                    {answer.kind === 'reveal' ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={strings.flipCard}
                        onPress={handleFlip}
                      >
                        <FlashcardFace
                          face={card.front}
                          emptyHint={strings.face.frontEmpty}
                          imageAccessibilityLabel={strings.face.imageA11y}
                        />
                      </Pressable>
                    ) : (
                      <View className="gap-4">
                        <FlashcardFace
                          face={card.front}
                          emptyHint={strings.face.frontEmpty}
                          imageAccessibilityLabel={strings.face.imageA11y}
                        />
                        <AnswerInput
                          answer={answer}
                          strings={strings.answer}
                          typed={typed}
                          onChangeTyped={setTyped}
                          disabled={isFlipped}
                        />
                      </View>
                    )}
                  </ScrollView>
                  <View className="pt-3">
                    <PrimaryButton
                      label={flipLabel}
                      accessibilityLabel={flipLabel}
                      onPress={handleFlip}
                    />
                  </View>
                </Animated.View>

                {/* VERSO / ANSWER */}
                <Animated.View
                  style={[styles.face, backAnimatedStyle]}
                  pointerEvents={isFlipped ? 'auto' : 'none'}
                >
                  <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                    <View className="gap-4">
                      <FlashcardFace
                        face={card.back}
                        emptyHint={strings.face.backEmpty}
                        imageAccessibilityLabel={strings.face.imageA11y}
                      />
                      {checked ? (
                        <AnswerFeedback
                          strings={strings}
                          correct={effectiveCorrect}
                          typed={typed}
                          expected={checked.expected}
                          onToggleOverride={
                            allowOverride ? () => setOverride(!effectiveCorrect) : undefined
                          }
                        />
                      ) : null}
                      {showRecordedOnBack &&
                      (answer.kind === 'listening' || answer.kind === 'recording') ? (
                        <View
                          style={{ borderColor: colors.border, backgroundColor: colors.surface }}
                          className="gap-2 rounded-xl border p-4"
                        >
                          <Text style={{ color: colors.textSecondary }} className="text-sm">
                            {strings.answer.compareRecording}
                          </Text>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={strings.answer.playMyRecording}
                            onPress={answer.onPlayRecording}
                            style={{
                              borderColor: colors.border,
                              backgroundColor: colors.background,
                            }}
                            className="flex-row items-center gap-2 self-start rounded-xl border px-4 py-3 active:opacity-90"
                          >
                            <Text className="text-base">▶</Text>
                            <Text
                              style={{ color: colors.textPrimary }}
                              className="text-base font-medium"
                            >
                              {strings.answer.playMyRecording}
                            </Text>
                          </Pressable>
                        </View>
                      ) : null}
                    </View>
                  </ScrollView>
                  <View className="pt-3">
                    <RatingButtons labels={strings.ratings} onRate={onRate} disabled={!isFlipped} />
                  </View>
                </Animated.View>
              </View>
            </Animated.View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  flipArea: {
    height: FLIP_HEIGHT,
  },
  face: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'column',
    backfaceVisibility: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
