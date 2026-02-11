// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false, // وضع المتصفح فقط (مثل Vite)
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // ❌ حذفنا '@nuxtjs/supabase' من هنا
  modules: ['@nuxtjs/tailwindcss'],

  app: {
    head: {
      title: 'مدير العقارات',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Tajwal:wght@400;500;700&display=swap',
        },
      ],
    },
  },
})