import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.*'],
    environment: 'node',
    watch: false,
    reporters: 'default',
  },
})
