import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  // GitHub Pages serves this project site from /Pakistan_IW-Tracker/, not the domain root.
  // Without this, every built asset reference (JS bundle, CSS) is emitted as a root-absolute
  // path (`/assets/...`), which 404s on Pages — meaning NONE of the app's JS or CSS actually
  // loads there, even though it works fine locally (`npm run dev`/`preview` serve from root).
  base: '/Pakistan_IW-Tracker/',
  build: {
    outDir: 'dist',
  },
  test: {
    environment: 'jsdom',
  },
});
