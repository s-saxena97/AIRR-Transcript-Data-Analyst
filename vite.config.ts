import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  define: {
    // Maps the Vercel environment variable GEMINI_API_KEY to process.env.API_KEY used in the code
    'process.env.API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || process.env.API_KEY)
  },
  server: {
    port: 3000,
  }
});