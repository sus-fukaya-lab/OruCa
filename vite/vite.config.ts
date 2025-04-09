import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    host:"0.0.0.0",
    port:4000,
    strictPort: true,
    watch:{
      usePolling:true,
      interval:1000
    },
    proxy: {
      '/api': {
        target: 'http://api:3000', // Docker Composeのサービス名
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // WebSocketのプロキシ設定
      '/socket': {
        target: 'ws://api:3000',  // WebSocket接続先を指定
        ws: true,  // WebSocketプロキシを有効化
        changeOrigin: true,
        rewriteWsOrigin: true,
      },
    },
  }
})
