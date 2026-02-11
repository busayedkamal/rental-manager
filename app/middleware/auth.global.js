// 👇 1. التصحيح: الاستيراد في أعلى الملف
import { supabase } from '~/supabase' 

export default defineNuxtRouteMiddleware(async (to, from) => {
  // بما أننا ألغينا الـ SSR، هذا الكود يعمل في المتصفح فقط
  if (process.server) return

  // 2. جلب الجلسة الحالية
  const { data: { session } } = await supabase.auth.getSession()

  // 3. قائمة الصفحات العامة
  const publicPages = ['/', '/login']
  const isPublicPage = publicPages.includes(to.path) || to.path.startsWith('/portal')

  // 4. سيناريو الحماية: غير مسجل ويحاول دخول صفحة خاصة
  if (!session && !isPublicPage) {
    return navigateTo('/login')
  }

  // 5. سيناريو التوجيه: مسجل ويحاول دخول صفحة الدخول
  if (session && to.path === '/login') {
    return navigateTo('/dashboard')
  }
})