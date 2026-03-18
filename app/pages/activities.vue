<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <span>🕵️‍♂️</span> سجل النشاطات والعمليات
      </h1>
      <button 
        @click="refresh" 
        :disabled="pending"
        class="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center gap-1 disabled:opacity-50"
      >
        <span v-if="pending">⏳ جارِ التحديث...</span>
        <span v-else>🔄 تحديث</span>
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 min-h-[300px]">
      
      <div v-if="pending && !logs?.length" class="p-12 text-center text-gray-400 flex flex-col items-center">
        <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-2"></div>
        <p>جاري تحميل السجل...</p>
      </div>

      <div v-else-if="error" class="p-12 text-center">
        <div class="text-red-500 text-5xl mb-4">⚠️</div>
        <h3 class="text-gray-800 font-bold mb-2">حدث خطأ أثناء تحميل البيانات</h3>
        <p class="text-gray-500 text-sm mb-4">{{ error.message }}</p>
        <button @click="refresh" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
          إعادة المحاولة
        </button>
      </div>

      <template v-else>
        <table v-if="logs && logs.length > 0" class="min-w-full text-sm">
          <thead class="bg-gray-50 text-gray-500">
            <tr>
              <th class="p-4 text-right font-medium">المستخدم</th>
              <th class="p-4 text-right font-medium">العملية</th>
              <th class="p-4 text-right font-medium">الهدف</th>
              <th class="p-4 text-right font-medium">التفاصيل</th>
              <th class="p-4 text-right font-medium">التوقيت</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50 transition-colors">
              <td class="p-4 font-bold text-gray-700">{{ log.user_email }}</td>
              <td class="p-4">
                <span 
                  class="px-2.5 py-1 rounded-md text-xs font-bold border"
                  :class="getBadgeClass(log.action_type)"
                >
                  {{ log.action_type }}
                </span>
              </td>
              <td class="p-4 text-gray-600">{{ log.target }}</td>
              <td class="p-4 text-gray-500 max-w-xs truncate" :title="log.details">{{ log.details }}</td>
              <td class="p-4 text-gray-400 dir-ltr text-right font-mono text-xs">
                {{ formatDate(log.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="p-12 text-center text-gray-400 flex flex-col items-center">
          <span class="text-4xl mb-2">✨</span>
          <p>سجل النشاطات نظيف حتى الآن</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
// استخدام العميل المدمج في Nuxt (أكثر أماناً وموثوقية)
import { supabase as client } from '~/supabase'

// دالة تنسيق التاريخ (خارج الـ Template لتحسين الأداء)
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('ar-SA', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// دالة تحديد الألوان
const getBadgeClass = (action) => {
  if (!action) return 'bg-gray-100 text-gray-600 border-gray-200'
  if (action.includes('حذف')) return 'bg-red-50 text-red-700 border-red-100'
  if (action.includes('تعديل')) return 'bg-blue-50 text-blue-700 border-blue-100'
  if (action.includes('إضافة') || action.includes('جديد')) return 'bg-green-50 text-green-700 border-green-100'
  return 'bg-gray-50 text-gray-700 border-gray-200'
}

// استخدام useAsyncData لجلب البيانات (يدعم SSR ويمنع الـ Layout Shift)
const { data: logs, pending, error, refresh } = await useAsyncData('activity-logs', async () => {
  const { data, error } = await client
    .from('activity_logs')
    .select('id, user_email, action_type, target, details, created_at') // تحديد الأعمدة المطلوبة فقط
    .order('created_at', { ascending: false })
    .limit(50)
  
  if (error) throw error
  return data
})
</script>