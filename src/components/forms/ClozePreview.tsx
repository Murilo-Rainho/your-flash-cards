import { Text, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';

/** Segmento estrutural (compatível com `ClozeSegment`, sem acoplar a UI ao domínio). */
type PreviewSegment = { kind: 'text'; text: string } | { kind: 'blank'; hint?: string };

type ClozePreviewProps = {
  label: string;
  segments: ReadonlyArray<PreviewSegment>;
  emptyText: string;
};

/**
 * Prévia da frase do cloze como aparecerá na revisão: texto comum com a dica de cada lacuna
 * destacada entre `{chaves}`. Lacunas sem dica viram `____`.
 */
export function ClozePreview({ label, segments, emptyText }: ClozePreviewProps) {
  const { colors } = useTheme();
  const hasContent = segments.some(
    (segment) => segment.kind === 'blank' || segment.text.trim().length > 0,
  );

  return (
    <View className="gap-2">
      <Text style={{ color: colors.textSecondary }} className="text-xs font-medium">
        {label}
      </Text>
      <View
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
        className="rounded-xl border px-4 py-3"
      >
        {hasContent ? (
          <Text style={{ color: colors.textPrimary }} className="text-base">
            {segments.map((segment, index) =>
              segment.kind === 'text' ? (
                <Text key={index}>{segment.text}</Text>
              ) : (
                <Text key={index} style={{ color: colors.primary }} className="font-semibold">
                  {segment.hint ? `{${segment.hint}}` : '____'}
                </Text>
              ),
            )}
          </Text>
        ) : (
          <Text style={{ color: colors.textSecondary }} className="text-sm">
            {emptyText}
          </Text>
        )}
      </View>
    </View>
  );
}
