/**
 * Saudação por faixa horária para o cabeçalho da Home.
 *
 * Função pura: recebe a data por injeção (default `new Date()`) para ser testável
 * sem depender do relógio do ambiente.
 */
export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Bom dia 👋';
  if (hour < 18) return 'Boa tarde 👋';
  return 'Boa noite 👋';
}
