import { Text } from 'react-native';

type FieldErrorProps = {
  message?: string;
};

/** Mensagem de erro de campo de formulário. Não renderiza nada quando vazio. */
export function FieldError({ message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return <Text className="text-sm text-danger">{message}</Text>;
}
