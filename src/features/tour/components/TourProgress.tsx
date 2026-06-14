import { Text, View } from 'react-native';

import { ProgressBar } from '@/components/common/ProgressBar';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { useTheme } from '@/theme/useTheme';

type TourProgressProps = {
  /** Posição 1-based do step atual. */
  current: number;
  total: number;
};

/** Indicador de progresso do tour: "Passo X de N" + barra temática. */
export function TourProgress({ current, total }: TourProgressProps) {
  const strings = useStrings();
  const { colors } = useTheme();

  const value = total > 0 ? (current / total) * 100 : 0;
  const label = `${strings.tour.stepCounterPrefix} ${current} ${strings.tour.stepCounterConnector} ${total}`;

  return (
    <View className="gap-2">
      <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold uppercase">
        {label}
      </Text>
      <ProgressBar value={value} accessibilityLabel={strings.tour.progressA11y} />
    </View>
  );
}
