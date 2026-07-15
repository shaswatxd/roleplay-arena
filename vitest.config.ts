import { defineConfig, mergeConfig } from 'vite'
import { defineConfig as defineVitestConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

export default mergeConfig(
  defineConfig(viteConfig),
  defineVitestConfig({
    test: {
      include: ['src/**/*.test.ts'],
    },
  })
)
