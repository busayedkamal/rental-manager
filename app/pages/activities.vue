<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
      <span>🕵️‍♂️</span> سجل النشاطات والعمليات
    </h1>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 text-gray-500">
          <tr>
            <th class="p-4 text-right">المستخدم</th>
            <th class="p-4 text-right">العملية</th>
            <th class="p-4 text-right">الهدف</th>
            <th class="p-4 text-right">التفاصيل</th>
            <th class="p-4 text-right">التوقيت</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50">
            <td class="p-4 font-bold text-gray-700">{{ log.user_email }}</td>
            <td class="p-4">
              <span class="px-2 py-1 rounded text-xs font-bold"
                :class="{
                  'bg-red-100 text-red-700': log.action_type.includes('حذف'),
                  'bg-blue-100 text-blue-700': log.action_type.includes('تعديل'),
                  'bg-green-100 text-green-700': log.action_type.includes('إضافة')
                }">
                {{ log.action_type }}
              </span>
            </td>
            <td class="p-4 text-gray-600">{{ log.target }}</td>
            <td class="p-4 text-gray-500">{{ log.details }}</td>
            <td class="p-4 text-gray-400 dir-ltr text-right">
              {{ new Date(log.created_at).toLocaleString('ar-SA') }}
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="logs.length === 0" class="p-8 text-center text-gray-400">سجل النشاطات نظيف حتى الآن ✨</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)
const logs = ref([])

const fetchLogs = async () => {
  const { data } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50) // آخر 50 عملية فقط
  logs.value = data || []
}

onMounted(() => fetchLogs())
</script>