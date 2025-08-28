import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  base: './', 
  plugins: [react()],
  build: {
    outDir: 'dist',    // Output folder
    assetsDir: 'assets', // Folder for static assets
    rollupOptions: {
      output: {
        // Optional: split vendor files if needed
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
