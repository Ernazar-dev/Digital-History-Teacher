import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: ['tests/global-setup.ts'],
    setupFiles: ['tests/setup.ts'],
    // Integratsion testlar bitta test bazasini ishlatadi — fayllar ketma-ket bajariladi
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 120000,
  },
});
