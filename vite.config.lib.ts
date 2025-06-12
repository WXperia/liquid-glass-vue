import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

import dts from 'vite-plugin-dts'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    dts({
      rollupTypes: true,
      include: ['src/lib/**/*'],
      exclude: ['env.d.ts', 'src/**/*.test.ts', 'src/**/*.spec.ts', 'src/**/__tests__/**/*'],
      insertTypesEntry: true,
      copyDtsFiles: false,
      tsconfigPath: './tsconfig.app.json',
    }),
  ],
  build: {
    lib: {
      entry: 'src/lib/index.ts',
      formats: ['es', 'cjs'],
      // 输出文件名
      fileName: 'index',
    },
    minify: false,
    cssMinify: false,
    rollupOptions: {
      // 确保外部化那些你不想打包进库的依赖
      external: ['vue'],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
