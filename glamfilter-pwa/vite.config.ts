import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Optional: Add server options, build options, etc. as needed later
  // server: {
  //   port: 3001, // Example: if you want to run multiple PWAs locally on different ports
  // },
  // build: {
  //   outDir: 'dist',
  // },
});
