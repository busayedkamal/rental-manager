// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase'],

  // ✅ إعدادات Supabase
  supabase: {
    // 👇 (هام جداً) إجبار المكتبة على قراءة المفاتيح من ملف البيئة
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,

    // تفعيل الكوكيز لضمان استمرار الجلسة
    useSsrCookies: true,

    // إيقاف التوجيه التلقائي (لأننا نستخدم middleware خاص)
    redirect: false,

    // إعدادات الكوكيز للأمان
    cookieOptions: {
      maxAge: 60 * 60 * 8, // 8 ساعات
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },

  // 👇 إعدادات الخطوط والتصميم
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