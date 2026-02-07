import { createClient } from '@supabase/supabase-js'

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.server) return

  const supabase = createClient(import.meta.env.NUXT_PUBLIC_SUPABASE_URL, import.meta.env.NUXT_PUBLIC_SUPABASE_KEY)
  const { data: { session } } = await supabase.auth.getSession()

  // 1. قائمة الصفحات العامة (المسموح للجميع بدخولها)
  // تشمل: الرئيسية، تسجيل الدخول، وصفحات بوابة المستأجرين
  const publicPages = ['/', '/login']
  const isPublicPage = publicPages.includes(to.path) || to.path.startsWith('/portal')

  // 2. إذا لم يكن مسجلاً، ويحاول دخول صفحة محمية (مثل /dashboard) -> اطرده للدخول
  if (!session && !isPublicPage) {
    return navigateTo('/login')
  }

  // 3. إذا كان مسجلاً (المدير)، ويحاول دخول صفحة الدخول -> حوله للوحة التحكم
  if (session && to.path === '/login') {
    return navigateTo('/dashboard')
  }
})