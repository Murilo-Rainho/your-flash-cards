import { Pressable, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { useTheme } from '@/theme/useTheme';

type TourActionsProps = {
  canGoBack: boolean;
  isLastStep: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
};

/** Rodapé de ações do step: Voltar / Próximo(ou Concluir) + Pular. */
export function TourActions({ canGoBack, isLastStep, onBack, onNext, onSkip }: TourActionsProps) {
  const strings = useStrings();
  const { colors } = useTheme();

  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        {canGoBack ? (
          <View className="flex-1">
            <SecondaryButton label={strings.common.back} icon="previous" onPress={onBack} compact />
          </View>
        ) : null}
        <View className="flex-1">
          <PrimaryButton
            label={isLastStep ? strings.tour.finish : strings.common.next}
            icon={isLastStep ? 'done' : 'next'}
            onPress={onNext}
            compact
          />
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={strings.tour.skip}
        onPress={onSkip}
        className="items-center py-1 active:opacity-70"
      >
        <Text style={{ color: colors.textSecondary }} className="text-sm font-medium">
          {strings.tour.skip}
        </Text>
      </Pressable>
    </View>
  );
}
