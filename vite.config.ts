import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('three')) {
              return 'three-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            if (id.includes('uuid')) {
              return 'utils-vendor';
            }
            // Other node_modules
            return 'vendor';
          }
          // Component chunks for code splitting
          if (id.includes('components/CurriculumView')) {
            return 'curriculum';
          }
          if (id.includes('components/LandingPage') || id.includes('components/ColorBends')) {
            return 'landing';
          }
          if (id.includes('components/FeatureGuide')) {
            return 'guide';
          }
          if (id.includes('components/CommandReference')) {
            return 'command-ref';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild', // Use esbuild (faster, built-in) instead of terser
  },
});
