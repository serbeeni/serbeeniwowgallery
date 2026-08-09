import { defineConfig } from 'vite'

/**
 * The build target is a Tumblr theme: one JS file and one CSS file with stable names,
 * served from a CDN and referenced by `theme/theme.html`.
 *
 * `react`/`react-dom` are aliased onto `preact/compat` so the bundle stays ~15KB instead of
 * ~190KB. Nothing under `src/` knows about Preact — the source is plain React + TypeScript.
 */
export default defineConfig({
  resolve: {
    alias: {
      'react-dom/client': 'preact/compat/client',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
      react: 'preact/compat',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    sourcemap: true,
    lib: {
      entry: 'src/main.tsx',
      name: 'SerbeeniTheme',
      formats: ['iife'],
      fileName: () => 'theme.js',
      cssFileName: 'theme',
    },
  },
})
