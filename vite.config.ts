/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
// @ts-expect-error the plugin file is JavaScript and has no declaration
import statsPlugin from './scripts/stats-plugin.mjs';

export default defineConfig({
  plugins: [react(), tailwindcss(), statsPlugin()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  // Статический билд можно положить и в подкаталог.
  base: './',
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
});
