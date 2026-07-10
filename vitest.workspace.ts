import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    test: {
      name: 'unit',
      include: ['test/unit/**/*.test.ts'],
      environment: 'jsdom',
    },
  },
  {
    test: {
      name: 'browser',
      include: ['test/browser/**/*.test.ts'],
      browser: {
        enabled: true,
        provider: 'playwright',
        instances: [
          { browser: 'chromium' },
          { browser: 'firefox' },
          { browser: 'webkit' }
        ]
      }
    },
  },
]);
