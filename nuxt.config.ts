// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase'],

  supabase: {
    redirect: false,
    useSsrCookies: true,
    // ❌ لا تضع url و key هنا، دعنا نعتمد على runtimeConfig
    cookieOptions: {
      maxAge: 60 * 60 * 8,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },

  runtimeConfig: {
    public: {
      supabase: {
        // 👇 الخدعة هنا: وضع قيمة مبدئية غير فارغة لتجاوز فحص البناء
        // سيقوم Vercel باستبدالها تلقائياً بـ NUXT_PUBLIC_SUPABASE_URL عند التشغيل
        url: process.env.SUPABASE_URL || 'https://example.com', 
        key: process.env.SUPABASE_KEY || 'example-key'
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