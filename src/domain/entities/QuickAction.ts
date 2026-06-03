/**
 * QuickAction — ação rápida exibida no FAB da Home.
 *
 * TS puro: `icon` é um identificador/emoji e `route` é apenas uma string, preenchida
 * quando a navegação existir (fora de escopo nesta versão). Sem imports de UI.
 */
export type QuickAction = {
  id: string;
  label: string;
  icon: string;
  route?: string;
  disabled?: boolean;
};
