import { useCallback, useEffect, useState } from 'react';
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
import Animated from 'react-native-reanimated';

import { PrimaryButton } from '@/components/common/PrimaryButton';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { useTheme } from '@/theme/useTheme';
import { withAlpha } from '@/theme/createShadows';

import { AnswerFeedback } from './AnswerFeedback';
import { AnswerInput } from './AnswerInput';
import { FlashcardFace } from './FlashcardFace';
import { RatingButtons } from './RatingButtons';
import type { CheckedAnswer, FlashcardReviewProps } from './types';
import { useFlipAnimation } from './useFlipAnimation';

const FLIP_HEIGHT = 360;

/**
 * Card de revisão flutuante com animação de flip (§35).
 *
 * QUESTION (frente + afordância de resposta) → vira → ANSWER (verso + avaliação).
 * É 100% agnóstico: a diferença entre "Testar" (criação) e revisão real está apenas no
 * `onRate` passado pela feature.
 */
export function FlashcardReview({
  visible,
  card,
  onRate,
  onClose,
  onFlip,
  reduceMotion,
}: FlashcardReviewProps) {
  const { colors, shadows } = useTheme();
  const strings = useStrings();
  const [typed, setTyped] = useState('');
  const [checked, setChecked] = useState<CheckedAnswer | null>(null);
  const [override, setOverride] = useState<boolean | null>(null);

  const { isFlipped, frontAnimatedStyle, backAnimatedStyle, flip, reset } = useFlipAnimation({
    reduceMotion,
    onFlipped: onFlip,
  });

  // Ao abrir, sempre começa pela frente, com a resposta zerada.
  useEffect(() => {
    if (!visible) {
      return;
    }
    setTyped('');
    setChecked(null);
    setOverride(null);
    reset();
  }, [visible, reset]);

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
      ? strings.review.flipVerify
      : strings.review.flipCard;
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
        accessibilityLabel="Fechar teclado"
        onPress={Keyboard.dismiss}
        style={[styles.backdrop, { backgroundColor: withAlpha(colors.textPrimary, 0.6) }]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.centered}
        >
          {/* Pressable interno "vazio" evita que toques no card fechem o teclado/repassem. */}
          <Pressable onPress={() => undefined} className="w-full">
            <View
              style={{ backgroundColor: colors.background, ...shadows.lg }}
              className="w-full gap-4 rounded-2xl p-5"
            >
              <View className="flex-row items-center justify-between">
                <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold">
                  {isFlipped ? strings.review.howDidYouDo : strings.review.reviewCardTitle}
                </Text>
                {onClose ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Fechar"
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
                        accessibilityLabel="Virar card"
                        onPress={handleFlip}
                      >
                        <FlashcardFace face={card.front} emptyHint="Frente sem conteúdo" />
                      </Pressable>
                    ) : (
                      <View className="gap-4">
                        <FlashcardFace face={card.front} emptyHint="Frente sem conteúdo" />
                        <AnswerInput
                          answer={answer}
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
                      <FlashcardFace face={card.back} emptyHint="Sem verso" />
                      {checked ? (
                        <AnswerFeedback
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
                            Ouça sua resposta e compare com o card.
                          </Text>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Ouvir minha gravação"
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
                              Ouvir minha gravação
                            </Text>
                          </Pressable>
                        </View>
                      ) : null}
                    </View>
                  </ScrollView>
                  <View className="pt-3">
                    <RatingButtons onRate={onRate} disabled={!isFlipped} />
                  </View>
                </Animated.View>
              </View>
            </View>
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
