import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { FieldError } from '@/components/common/FieldError';
import { Icon } from '@/components/common/Icon';
import { withAlpha } from '@/theme/createShadows';
import { useTheme } from '@/theme/useTheme';

type ClozeSentenceFieldProps = {
  label: string;
  description: string;
  placeholder: string;
  markBlankLabel: string;
  markBlankHint: string;
  value: string;
  error?: string;
  disabled?: boolean;
  onChangeText: (value: string) => void;
  /** Turns selected sentence span [start, end) into a blank. */
  onMarkBlank: (start: number, end: number) => void;
};

/**
 * Cloze sentence field: the user writes the sentence, selects a span and taps
 * "Make blank" to wrap it in `{}` (the hint). Supports multiple blanks. Dumb UI:
 * selection is local; text transformation is the caller's responsibility (domain).
 */
export function ClozeSentenceField({
  label,
  description,
  placeholder,
  markBlankLabel,
  markBlankHint,
  value,
  error,
  disabled = false,
  onChangeText,
  onMarkBlank,
}: ClozeSentenceFieldProps) {
  const { colors, shadows } = useTheme();
  const [focused, setFocused] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const hasSelection = selection.end > selection.start;
  const canMark = !disabled && hasSelection;
  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;

  return (
    <View className="gap-2">
      <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
        {label}
      </Text>
      <Text style={{ color: colors.textSecondary }} className="text-sm">
        {description}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        selectionColor={colors.primary}
        selectionHandleColor={colors.primary}
        cursorColor={colors.primary}
        underlineColorAndroid="transparent"
        editable={!disabled}
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        multiline
        textAlignVertical="top"
        autoCapitalize="sentences"
        style={{
          minHeight: 96,
          borderColor,
          backgroundColor: colors.surface,
          color: colors.textPrimary,
          opacity: disabled ? 0.5 : 1,
          ...shadows.sm,
        }}
        className="rounded-2xl border px-4 py-3 text-base"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={markBlankLabel}
        accessibilityState={{ disabled: !canMark }}
        disabled={!canMark}
        onPress={() => onMarkBlank(selection.start, selection.end)}
        style={{
          borderColor: colors.primary,
          backgroundColor: withAlpha(colors.primary, 0.12),
          opacity: canMark ? 1 : 0.5,
        }}
        className="flex-row items-center gap-2 self-start rounded-xl border px-4 py-2 active:opacity-80"
      >
        <Icon name="add" size={16} tone="primary" />
        <Text style={{ color: colors.primary }} className="text-sm font-semibold">
          {markBlankLabel}
        </Text>
      </Pressable>
      <Text style={{ color: colors.textSecondary }} className="text-xs">
        {markBlankHint}
      </Text>
      <FieldError message={error} />
    </View>
  );
}
