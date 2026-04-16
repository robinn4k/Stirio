import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Deployed as a subpath of the main Stirio GitHub Pages site so the user
// can open the PoC directly at:
//   https://robinn4k.github.io/Stirio/games-r3f-demo/
// Build output is written to the repo-root `games-r3f-demo/` folder, which
// is committed and served statically by GH Pages alongside the vanilla SPA.
export default defineConfig({
  plugins: [react()],
  base: '/Stirio/games-r3f-demo/',
  build: {
    outDir: '../games-r3f-demo',
    emptyOutDir: true,
  },
  server: { port: 5173, host: true },
});
