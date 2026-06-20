import { Text } from 'react-native';

import { useTheme } from '@/theme/useTheme';

type FieldErrorProps = {
  message?: string;
};

/** Form field error message. Renders nothing when empty. */
export function FieldError({ message }: FieldErrorProps) {
  const { colors } = useTheme();

  if (!message) {
    return null;
  }

  return (
    <Text style={{ color: colors.danger }} className="text-sm">
      {message}
    </Text>
  );
}
