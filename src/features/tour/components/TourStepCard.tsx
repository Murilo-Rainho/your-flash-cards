import { Text, View } from 'react-native';

import { Icon } from '@/components/common/Icon';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import type { TourStep } from '@/domain/tour/tourSteps';
import { withAlpha } from '@/theme/createShadows';
import { useTheme } from '@/theme/useTheme';

type TourStepCardProps = {
  step: TourStep;
  /** Acionado pela ação secundária "Abrir guia completo". */
  onOpenGuide: () => void;
};

/**
 * Conteúdo de um step do tour: ícone por tipo (educacional/interface), título e descrição
 * curta (i18n por id) e uma ação secundária opcional (ex.: abrir o guia completo).
 */
export function TourStepCard({ step, onOpenGuide }: TourStepCardProps) {
  const strings = useStrings();
  const { colors } = useTheme();

  const text = strings.tour.steps[step.id];
  const iconName = step.kind === 'interface' ? 'tour' : 'guide';

  return (
    <View className="gap-3">
      <View
        style={{ backgroundColor: withAlpha(colors.primary, 0.16) }}
        className="h-12 w-12 items-center justify-center rounded-full"
      >
        <Icon name={iconName} tone="primary" size={24} />
      </View>

      <Text style={{ color: colors.textPrimary }} className="text-xl font-bold">
        {text.title}
      </Text>
      <Text style={{ color: colors.textSecondary }} className="text-base leading-6">
        {text.description}
      </Text>

      {step.action === 'open-why-flashcards' ? (
        <SecondaryButton
          label={strings.tour.openGuide}
          icon="guide"
          onPress={onOpenGuide}
          compact
        />
      ) : null}
    </View>
  );
}
