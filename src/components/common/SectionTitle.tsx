import { Text } from 'react-native';

import { useTheme } from '@/theme/useTheme';

type SectionTitleProps = {
  title: string;
};

/** Título de seção padrão (hierarquia visual consistente entre seções). */
export function SectionTitle({ title }: SectionTitleProps) {
  const { colors } = useTheme();

  return (
    <Text style={{ color: colors.textPrimary }} className="text-xl font-bold">
      {title}
    </Text>
  );
}
