import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';

type StateCardAction = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  variant?: 'primary' | 'secondary';
};

type StateCardProps = {
  title: string;
  description?: string;
  action?: StateCardAction;
};

/** Card de estado (vazio/erro) com ação opcional (ex.: "Tentar novamente"/"Criar coleção"). */
export function StateCard({ title, description, action }: StateCardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      className="gap-3 rounded-xl border p-4"
    >
      <Text style={{ color: colors.textPrimary }} className="text-base font-semibold">
        {title}
      </Text>
      {description ? (
        <Text style={{ color: colors.textSecondary }} className="text-sm">
          {description}
        </Text>
      ) : null}
      {action ? (
        action.variant === 'secondary' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel ?? action.label}
            onPress={action.onPress}
            style={{ borderColor: colors.border, backgroundColor: colors.background }}
            className="items-center rounded-xl border px-4 py-3 active:opacity-90"
          >
            <Text style={{ color: colors.textPrimary }} className="text-base font-semibold">
              {action.label}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel ?? action.label}
            onPress={action.onPress}
            style={{ backgroundColor: colors.primary }}
            className="items-center rounded-xl px-4 py-3 active:opacity-90"
          >
            <Text style={{ color: colors.background }} className="text-base font-bold">
              {action.label}
            </Text>
          </Pressable>
        )
      ) : null}
    </View>
  );
}
