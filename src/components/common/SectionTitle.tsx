import { Text } from 'react-native';

import { useTheme } from '@/theme/useTheme';

type SectionTitleProps = {
  title: string;
};

/** Default section title (consistent visual hierarchy between sections). */
export function SectionTitle({ title }: SectionTitleProps) {
  const { colors } = useTheme();

  return (
    <Text style={{ color: colors.textPrimary }} className="text-xl font-bold">
      {title}
    </Text>
  );
}
