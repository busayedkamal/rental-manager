// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase'],

  // ✅ Supabase SSR (مناسب لـ Vercel + Universal Rendering)
  supabase: {
    // اجعل SSR يقرأ/يكتب الجلسة عبر cookies (مهم لـ SSR كامل)
    useSsrCookies: true,

    // أنت تتحكم بالحماية عبر middleware بدل التحويل التلقائي
    redirect: false,

    // ✅ مهم للإنتاج على HTTPS + التطوير على HTTP
    cookieOptions: {
      maxAge: 60 * 60 * 8, // 8 ساعات (غيّرها حسب احتياجك)
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },

  // 👇 إعدادات الخطوط
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
