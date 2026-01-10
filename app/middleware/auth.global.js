import { createClient } from '@supabase/supabase-js'

export default defineNuxtRouteMiddleware(async (to, from) => {
  // تخطي هذه الخطوة إذا كنا على السيرفر (نريد التحقق في المتصفح فقط)
  if (process.server) return

  // إعداد الاتصال للتحقق من الجلسة
  const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)
  
  // هل يوجد مستخدم مسجل حالياً؟
  const { data: { session } } = await supabase.auth.getSession()

  // 1. إذا لم يكن مسجلاً، ويحاول الذهاب لأي صفحة غير صفحة الدخول -> اطرده للدخول
  if (!session && to.path !== '/login') {
    return navigateTo('/login')
  }

  // 2. إذا كان مسجلاً بالفعل، ويحاول الذهاب لصفحة الدخول -> حوله للرئيسية
  if (session && to.path === '/login') {
    return navigateTo('/')
  }
})