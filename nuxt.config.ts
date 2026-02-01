// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase'],

  supabase: {
    // 👇 العودة للربط اليدوي (لضمان قراءة المفاتيح)
    // يقرأ إما SUPABASE_URL أو NUXT_SUPABASE_URL (أيهما موجود)
    url: process.env.SUPABASE_URL || process.env.NUXT_SUPABASE_URL,
    key: process.env.SUPABASE_KEY || process.env.NUXT_SUPABASE_KEY,

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