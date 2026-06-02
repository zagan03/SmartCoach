import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/__tests__/**/*.test.ts'],
    // Suppress pg connection errors during tests (db not available in CI)
    reporters: ['verbose'],
  },
});
