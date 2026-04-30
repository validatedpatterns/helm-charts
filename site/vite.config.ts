import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub project Pages serves at /<repo>/; set VITE_BASE_PATH in CI (e.g. /helm-charts/).
const base = (process.env.VITE_BASE_PATH ?? '/').replace(/\/?$/, '/');

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    proxy: {
      '/index.yaml': {
        target: 'https://charts.validatedpatterns.io',
        changeOrigin: true,
      },
    },
    fs: {
      allow: ['.', '..'],
    },
  },
});
