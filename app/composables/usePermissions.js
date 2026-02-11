// app/composables/usePermissions.js

// 👇 هذه الاستيرادات ضرورية لإسكات الخطوط الحمراء في المحرر
import { computed } from 'vue'
import { useState } from '#app'
import { supabase } from '~/supabase' // سيعمل الآن بعد نقل الملف

export const usePermissions = () => {
  
  // 2. حالة الدور (State)
  const userRole = useState('userRole', () => 'viewer')

  // 3. دالة تحديث الدور
  const setRole = (role) => {
    userRole.value = role
  }

  // 4. الصلاحيات المحسوبة
  const canDelete = computed(() => userRole.value === 'admin')
  const canEdit = computed(() => ['admin', 'manager'].includes(userRole.value))
  const isViewer = computed(() => userRole.value === 'viewer')

  // 5. دالة تسجيل النشاطات
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

  return { 
    userRole, 
    setRole, 
    canDelete, 
    canEdit, 
    isViewer, 
    logAction 
  }
}