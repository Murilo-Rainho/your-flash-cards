/**
 * Declarações de módulo para assets estáticos importados via `import`.
 * O Metro/Expo resolve a imagem para um id numérico (`ImageRequireSource`), aceito
 * por `Image source`. O Expo só declara módulos CSS por padrão, então tipamos
 * imagens aqui. Mantido sem `import`/`export` no topo para permanecer ambiente/global.
 */
declare module '*.png' {
  const value: number;
  export default value;
}

declare module '*.jpg' {
  const value: number;
  export default value;
}

declare module '*.jpeg' {
  const value: number;
  export default value;
}

declare module '*.webp' {
  const value: number;
  export default value;
}
