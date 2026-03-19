import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  webServer: {
    // Build once, then serve the built bundle for deterministic E2E runs.
    command: 'npm run build && npm run preview -- --port 4173 --host 0.0.0.0',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
});

