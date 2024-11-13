import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
     proxy: {
       '/api': {
         target: 'https://pro-api.coinmarketcap.com', 
         changeOrigin: true, 
         rewrite: (path) => path.replace(/^\/api/, ''), 
         headers: { 
          'X-CMC_PRO_API_KEY': '5d015bee-a30f-489d-a1ca-6d77f642a9d8', 
          'Accept': 'application/json', 
        }, 
      }, 
    }, 
  },
});
