import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  envPrefix: 'VITE_',
  server: {
    historyApiFallback: true
  },
  preview: {
    historyApiFallback: true
  }
});
