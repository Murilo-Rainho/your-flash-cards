import { Pressable, Text, View } from 'react-native';

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
  return (
    <View className="gap-3 rounded-xl border border-border bg-surface p-4">
      <Text className="text-base font-semibold text-textPrimary">{title}</Text>
      {description ? <Text className="text-sm text-textSecondary">{description}</Text> : null}
      {action ? (
        action.variant === 'secondary' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel ?? action.label}
            onPress={action.onPress}
            className="items-center rounded-xl border border-border bg-background px-4 py-3 active:bg-surface"
          >
            <Text className="text-base font-semibold text-textPrimary">{action.label}</Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel ?? action.label}
            onPress={action.onPress}
            className="items-center rounded-xl bg-primary px-4 py-3 active:opacity-90"
          >
            <Text className="text-base font-bold text-background">{action.label}</Text>
          </Pressable>
        )
      ) : null}
    </View>
  );
}
