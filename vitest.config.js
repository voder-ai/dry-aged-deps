export default {
  test: {
    environment: 'node',
    globals: true,
    timeout: 60000,
  },
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    reportsDirectory: './coverage',
    lines: 80,
    statements: 80,
    functions: 80,
    branches: process.env.CI ? 90 : 80,
  },
};
