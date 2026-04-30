import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * GitHub project Pages uses https://<owner>.github.io/<repo>/ — Vite must use base `/<repo>/`.
 * Prefer VITE_BASE_PATH when set. Otherwise, on GitHub Actions use GITHUB_REPOSITORY so the
 * base stays correct even when publish-charts is dispatched from another repo (where
 * github.event.repository.name would be wrong for the umbrella site).
 */
function viteBase(): string {
  const explicit = process.env.VITE_BASE_PATH?.trim();
  if (explicit) return explicit.replace(/\/?$/, '/');
  if (process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_REPOSITORY?.includes('/')) {
    const repo = process.env.GITHUB_REPOSITORY.split('/')[1];
    if (repo) return `/${repo}/`;
  }
  return '/';
}

const base = viteBase();

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
