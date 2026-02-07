// تعريف المتغيرات في البداية لضمان التقاطها
// نحاول التقاط المتغير العام، ثم الخاص، ثم قيمة مؤقتة لمنع الانهيار
const dbUrl = process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://temp-placeholder.supabase.co'
const dbKey = process.env.NUXT_PUBLIC_SUPABASE_KEY || process.env.SUPABASE_KEY || 'temp-placeholder-key'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase'],

  supabase: {
    // نمرر القيم التي التقطناها بالأعلى
    url: dbUrl,
    key: dbKey,

    redirect: false,
    useSsrCookies: true,
    cookieOptions: {
      maxAge: 60 * 60 * 8,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },

  // نكررها في runtimeConfig لضمان وصولها للمتصفح
  runtimeConfig: {
    public: {
      supabase: {
        url: dbUrl,
        key: dbKey,
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