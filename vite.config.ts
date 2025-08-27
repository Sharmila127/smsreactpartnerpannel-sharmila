import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  base: '/partner/',   // (CloudFront path prefix)
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
