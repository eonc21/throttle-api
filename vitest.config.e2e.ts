import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    name: 'e2e',
    globals: true,
    env: { RATE_LIMIT_STORE: 'memory' },
    root: './',
    include: ['**/*.e2e-spec.ts'],
    exclude: [...configDefaults.exclude, '.claude/**'],
  },
});
