import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  assetsInclude: ['**/*.glb'],
  base: '/',
  server: {
    // 갤러리 업로드·삭제 함수(functions/api)는 Cloudflare 에서만 돌아서, 로컬에서는 배포된 사이트로 넘긴다
    proxy: {
      '/api': { target: 'https://shintanjin.or.kr', changeOrigin: true },
    },
  },
}))
