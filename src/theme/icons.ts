/**
 * Camada de inversão de dependência para ícones.
 *
 * O app referencia ícones por NOMES SEMÂNTICOS (ex.: `'add'`, `'review'`), nunca
 * pelo nome cru da biblioteca de ícones. Assim, ao trocar de lib de ícones no
 * futuro (ex.: @expo/vector-icons → lucide), basta atualizar o mapeamento abaixo
 * e o componente de ícone — nenhuma tela precisa mudar.
 *
 * Nenhuma biblioteca de ícones é importada aqui de propósito: a fundação ainda
 * não depende de nenhuma. O valor de cada entrada será o identificador da lib
 * escolhida quando o componente `Icon` for criado.
 */
export const icons = {
  // semantic name -> identificador na biblioteca de ícones (a definir)
} as const;

export type IconName = keyof typeof icons;
