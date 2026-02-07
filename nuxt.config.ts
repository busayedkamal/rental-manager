// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // استدعاء الموديول فقط
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase'],

  // إعدادات Supabase (بدون مفاتيح!)
  supabase: {
    // ⚠️ لا تضع url ولا key هنا، الموديول سيقرأ NUXT_PUBLIC_SUPABASE_URL تلقائياً من Vercel
    redirect: false,
    useSsrCookies: true,
    cookieOptions: {
      maxAge: 60 * 60 * 8,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
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