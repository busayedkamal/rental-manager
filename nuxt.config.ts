// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // 👇👇 هذا هو السطر السحري: نلغي الـ SSR ونحوله لتطبيق طرفي (مثل Vite)
  ssr: false, 
  
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase'],

  supabase: {
    // إعدادات بسيطة جداً
    redirect: false,
    // بما أننا ألغينا السيرفر، الكوكيز ستتم إدارتها في المتصفح
    clientOptions: {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    },
  },

  // نربط المفاتيح يدوياً لضمان وصولها للمتصفح
  runtimeConfig: {
    public: {
      supabase: {
        url: process.env.NUXT_PUBLIC_SUPABASE_URL,
        key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
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