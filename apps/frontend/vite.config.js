import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.PRODUCT_API_PROXY_URL || 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});

