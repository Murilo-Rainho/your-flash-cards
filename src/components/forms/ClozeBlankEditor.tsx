import { Pressable, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/common/Icon';
import { IconButton } from '@/components/common/IconButton';
import type { StringCatalog } from '@/strings/types';
import { useTheme } from '@/theme/useTheme';

type ClozeFieldsStrings = StringCatalog['cards']['clozeFields'];

type ClozeBlankEditorProps = {
  index: number;
  hint: string;
  answers: string[];
  strings: ClozeFieldsStrings;
  disabled?: boolean;
  onChangeHint: (value: string) => void;
  onRemoveBlank: () => void;
  onAddAnswer: () => void;
  onChangeAnswer: (answerIndex: number, value: string) => void;
  onRemoveAnswer: (answerIndex: number) => void;
};

/**
 * Blank editor: hint (text in braces) and list of accepted answers (≥ 1,
 * the first is primary). Dumb UI — all strings and callbacks come via props.
 */
export function ClozeBlankEditor({
  index,
  hint,
  answers,
  strings,
  disabled = false,
  onChangeHint,
  onRemoveBlank,
  onAddAnswer,
  onChangeAnswer,
  onRemoveAnswer,
}: ClozeBlankEditorProps) {
  const { colors } = useTheme();

  const inputStyle = {
    borderColor: colors.border,
    backgroundColor: colors.background,
    color: colors.textPrimary,
  };

  return (
    <View
      style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      className="gap-3 rounded-xl border p-4"
    >
      <View className="flex-row items-center justify-between">
        <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
          {`${strings.blankLabel} ${index + 1}`}
        </Text>
        <IconButton
          icon="delete"
          tone="danger"
          accessibilityLabel={strings.removeBlankA11y}
          onPress={onRemoveBlank}
          disabled={disabled}
        />
      </View>

      <View className="gap-2">
        <Text style={{ color: colors.textSecondary }} className="text-xs font-medium">
          {strings.hintLabel}
        </Text>
        <TextInput
          value={hint}
          onChangeText={onChangeHint}
          placeholder={strings.hintPlaceholder}
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          underlineColorAndroid="transparent"
          editable={!disabled}
          style={inputStyle}
          className="rounded-xl border px-4 py-3 text-base"
        />
      </View>

      <View className="gap-2">
        <Text style={{ color: colors.textSecondary }} className="text-xs font-medium">
          {strings.answersLabel}
        </Text>
        {answers.map((answer, answerIndex) => (
          <View key={answerIndex} className="flex-row items-center gap-2">
            <TextInput
              value={answer}
              onChangeText={(value) => onChangeAnswer(answerIndex, value)}
              placeholder={strings.answerPlaceholder}
              placeholderTextColor={colors.textSecondary}
              selectionColor={colors.primary}
              cursorColor={colors.primary}
              underlineColorAndroid="transparent"
              editable={!disabled}
              autoCapitalize="none"
              autoCorrect={false}
              style={inputStyle}
              className="flex-1 rounded-xl border px-4 py-3 text-base"
            />
            <IconButton
              icon="close"
              tone="textSecondary"
              accessibilityLabel={strings.removeAnswerA11y}
              onPress={() => onRemoveAnswer(answerIndex)}
              disabled={disabled}
            />
          </View>
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={strings.addAnswer}
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={onAddAnswer}
          className="flex-row items-center gap-2 self-start py-1 active:opacity-70"
        >
          <Icon name="add" size={16} tone="primary" />
          <Text style={{ color: colors.primary }} className="text-sm font-semibold">
            {strings.addAnswer}
          </Text>
        </Pressable>
        <Text style={{ color: colors.textSecondary }} className="text-xs">
          {strings.primaryAnswerHint}
        </Text>
      </View>
    </View>
  );
}
