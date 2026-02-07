// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase'],

  supabase: {
    // 👇 سنضع القيم الحقيقية مباشرة (مؤقتاً) لنكسر دائرة الخطأ
    url: 'https://grrnpabudbkuxgipjrwm.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdycm5wYWJ1ZGJrdXhnaXBqcndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4OTI0ODAsImV4cCI6MjA4MzQ2ODQ4MH0.Trs4OMwTwTo-Ik4_E3Vg6AB1iLFk4ASc25_oDy91vsk',

    redirect: false,
    useSsrCookies: true,
    cookieOptions: {
      maxAge: 60 * 60 * 8,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },

  // ⚠️ هام جداً: نحتاج runtimeConfig لكي يرى المتصفح هذه القيم أيضاً
  runtimeConfig: {
    public: {
      supabase: {
        url: 'https://grrnpabudbkuxgipjrwm.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdycm5wYWJ1ZGJrdXhnaXBqcndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4OTI0ODAsImV4cCI6MjA4MzQ2ODQ4MH0.Trs4OMwTwTo-Ik4_E3Vg6AB1iLFk4ASc25_oDy91vsk',
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