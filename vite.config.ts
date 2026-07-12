import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
      ],
      manifest: {
        name: 'Reset90',
        short_name: 'Reset90',
        description:
          'Reset90 — 90 dias de disciplina, corpo e mente. Recomece de verdade.',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        // Mantém a sessão no mesmo contexto do atalho após OAuth
        start_url: '/?source=pwa',
        scope: '/',
        lang: 'pt-BR',
        id: '/',
        categories: ['health', 'lifestyle', 'fitness'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        // Não interceptar callback OAuth / APIs — evita “deslogar” no atalho
        navigateFallbackDenylist: [/^\/api\//, /^\/auth\/callback/],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ url }) =>
              url.hostname.includes('supabase.co') ||
              url.pathname.includes('/auth/v1/'),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    port: 5173,
    strictPort: false,
    // Encaminha /api/* para o Vercel Dev (rode npm run dev:api em outro terminal)
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
