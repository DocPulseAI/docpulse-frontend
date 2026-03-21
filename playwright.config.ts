import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // 1 retry locally catches transient cross-browser flakiness; 2 retries on CI
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    // WebKit is excluded — it crashes on Windows (STATUS_STACK_BUFFER_OVERRUN)
    // Run on CI Linux where WebKit is stable if needed
  ],

  // Always boot a fresh Vite server so consecutive runs don't fail
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: false,
    env: {
      VITE_API_URL: 'http://127.0.0.1:8001',
    },
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});

