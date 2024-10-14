import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
 
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    coverage: {
      exclude: ['./.config.', './next-env.d.ts', './src/app/layout.tsx', './.next/**'],
    },
  },
})