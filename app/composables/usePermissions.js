// app/composables/usePermissions.js
import { createClient } from '@supabase/supabase-js'

export const usePermissions = () => {
  // 1. إنشاء العميل يدوياً (لأنك لا تستخدم وحدة Nuxt الجاهزة)
  const supabase = createClient(import.meta.env.NUXT_PUBLIC_SUPABASE_URL, import.meta.env.NUXT_PUBLIC_SUPABASE_KEY)
  
  // 2. حالة الدور (State) - مشترك بين كل الصفحات
  const userRole = useState('userRole', () => 'viewer')

  // 3. دالة تحديث الدور
  const setRole = (role) => {
    userRole.value = role
  }

  // 4. الصلاحيات المحسوبة (Computed)
  const canDelete = computed(() => userRole.value === 'admin') // المالك فقط
  const canEdit = computed(() => ['admin', 'manager'].includes(userRole.value)) // المالك والمدير
  const isViewer = computed(() => userRole.value === 'viewer') // المشاهد فقط

  // 5. دالة تسجيل النشاطات (Audit Logs)
  const logAction = async (action, target, details) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      await supabase.from('activity_logs').insert([{
        user_email: user?.email || 'Unknown',
        action_type: action,
        target: target,
        details: details
      }])
    } catch (e) {
      console.error('Failed to log action:', e)
    }
  }

  // إرجاع الأدوات
  return { 
    userRole, 
    setRole, 
    canDelete, 
    canEdit, 
    isViewer, 
    logAction 
  }
}