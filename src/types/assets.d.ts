/**
 * Module declarations for static assets imported via `import`.
 * Metro/Expo resolves the image to a numeric id (`ImageRequireSource`), accepted
 * by `Image source`. Expo only declares CSS modules by default, so we type images
 * here. Kept without top-level `import`/`export` to remain ambient/global.
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
