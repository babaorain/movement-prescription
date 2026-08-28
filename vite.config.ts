import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => assetInfo.name?.slice(-4) === '.css' ? 'assets/app.css' : 'assets/[name]-[hash][extname]',
      },
    },
  },
})
