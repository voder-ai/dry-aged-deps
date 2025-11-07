export default {
  test: {
    environment: 'node',
    globals: true,
  },
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    reportsDirectory: './coverage',
    lines: 80,
    statements: 80,
    functions: 80,
    branches: 80,
  },
};
