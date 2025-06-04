import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Explicitly set the public directory
  publicDir: 'public',
  
  // Optimize dependencies
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  
  // Build configuration to ensure static assets are copied
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure all static files from public/ are copied to dist/
    copyPublicDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  
  // Explicitly include common static file types
  assetsInclude: [
    '**/*.png', 
    '**/*.jpg', 
    '**/*.jpeg', 
    '**/*.gif', 
    '**/*.svg', 
    '**/*.ico',
    '**/*.webp',
    '**/*.avif'
  ],
  
  // Development server configuration
  server: {
    port: 3000,
    host: true, // Allow external connections
    cors: true,
  },
  
  // Preview server configuration (for production preview)
  preview: {
    port: 4173,
    host: true,
  },
  
  // Base path configuration (useful for deployments)
  base: '/',
});