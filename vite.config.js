import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  server:{
    port: 3000,
    proxy: {
      '/root': {
        target: 'https://firm-retina-435112-j9.uc.r.appspot.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/root/, ''),
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
})
