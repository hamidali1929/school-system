import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    basicSsl(),
  ],
  build: {
    target: 'esnext',
    assetsDir: 'static',
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-framer': ['framer-motion'],
          'vendor-icons': ['lucide-react'],
          'vendor-firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          'vendor-utils': ['sweetalert2', 'clsx', 'tailwind-merge'],
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          'vendor-export': ['xlsx', 'jspdf', 'html2canvas']
        }
      }
    }
  },
  server: {
    host: true,
    watch: {
      ignored: ['**/android/**', '**/*.apk', '**/dist/**', '**/.git/**']
    },
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true
      },
      '/api/wa': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/wa/, '')
      }
    }
  }
})
