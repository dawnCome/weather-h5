import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      exclude: [
        'node_modules/**',
        'src/types/**',
        'src/test/**',
        '**/*.d.ts',
      ],
      thresholds: { lines: 80, branches: 75 },
    },
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
