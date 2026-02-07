// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase'],

  // 1️⃣ إعدادات Supabase للموديول (لحل مشكلة البناء والتحذيرات)
  supabase: {
    // نقرأ من متغيرات البيئة القياسية أو متغيرات NUXT
    url: process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.SUPABASE_KEY || process.env.NUXT_PUBLIC_SUPABASE_KEY,

    redirect: false,
    useSsrCookies: true,
    cookieOptions: {
      maxAge: 60 * 60 * 8,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },

  // 2️⃣ إعدادات التشغيل (لضمان وصول المتصفح للمفاتيح)
  runtimeConfig: {
    public: {
      supabase: {
        url: process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL,
        key: process.env.SUPABASE_KEY || process.env.NUXT_PUBLIC_SUPABASE_KEY,
      }
    }
  },

  app: {
    head: {
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