import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true, // Allows using describe, it, expect, etc., without importing them
    environment: 'jsdom', // Simulates a browser environment for tests
    // Optional: if you have global setup (e.g., for mocks, plugins) you can add:
    // setupFiles: './tests/setup.js', 
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'], // Pattern for test files
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'json', 'html'],
    },
  },
}); 