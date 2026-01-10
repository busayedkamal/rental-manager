<template>
  <div class="min-h-screen bg-gray-50 p-10 font-sans" dir="rtl">
    
    <div class="max-w-4xl mx-auto space-y-8">
      
      <div class="bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span>👤</span> إضافة مستأجر جديد
        </h2>

        <form @submit.prevent="addTenant" class="flex gap-4 items-end flex-wrap">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
            <input v-model="form.name" type="text" required class="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="الاسم الرباعي" />
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">الجوال</label>
            <input v-model="form.phone" type="text" class="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="05xxxxxxxx" />
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">الإيميل</label>
            <input v-model="form.email" type="email" class="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="اختياري" />
          </div>
          <button type="submit" :disabled="loading" class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-bold h-[42px]">
            {{ loading ? '...' : 'حفظ' }}
          </button>
        </form>
        
        <p v-if="successMsg" class="mt-3 text-green-600 font-bold text-sm">✅ {{ successMsg }}</p>
      </div>

      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h2 class="text-lg font-bold text-gray-700">📋 سجل المستأجرين ({{ tenants.length }})</h2>
          <button @click="fetchTenants" class="text-indigo-600 text-sm hover:underline">🔄 تحديث</button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
              <tr>
                <th class="px-6 py-3 text-right">الاسم</th>
                <th class="px-6 py-3 text-right">الجوال</th>
                <th class="px-6 py-3 text-right">الإيميل</th>
                <th class="px-6 py-3 text-right">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="tenant in tenants" :key="tenant.id" class="hover:bg-indigo-50 transition-colors">
                <td class="px-6 py-4 font-bold text-gray-800">{{ tenant.name }}</td>
                <td class="px-6 py-4 text-gray-600 text-right" dir="ltr">{{ tenant.phone }}</td>
                <td class="px-6 py-4 text-gray-500">{{ tenant.email || '-' }}</td>
                <td class="px-6 py-4 text-gray-400 text-sm">
                  {{ new Date(tenant.created_at).toLocaleDateString('ar-SA') }}
                </td>
              </tr>
              <tr v-if="tenants.length === 0">
                <td colspan="4" class="p-8 text-center text-gray-400">
                  لا يوجد بيانات حتى الآن.. ابدأ بالإضافة! 🚀
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { createClient } from '@supabase/supabase-js'

// الاتصال بقاعدة البيانات
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)

// المتغيرات
const loading = ref(false)
const successMsg = ref('')
const tenants = ref([]) // مصفوفة لتخزين البيانات القادمة من السحابة
const form = ref({ name: '', phone: '', email: '' })

// 1. دالة جلب البيانات (Read)
const fetchTenants = async () => {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false }) // الأحدث في الأعلى

    if (error) throw error
    tenants.value = data
  } catch (e) {
    console.error('Error fetching:', e.message)
  }
}

// 2. دالة الإضافة (Create)
const addTenant = async () => {
  loading.value = true
  successMsg.value = ''
  
  try {
    const { error } = await supabase.from('tenants').insert([form.value])
    if (error) throw error

    successMsg.value = 'تمت الإضافة بنجاح!'
    form.value = { name: '', phone: '', email: '' } // تصفير النموذج
    
    // تحديث الجدول فوراً لظهور الاسم الجديد
    await fetchTenants() 
    
  } catch (e) {
    alert('خطأ: ' + e.message)
  } finally {
    loading.value = false
  }
}

// تشغيل جلب البيانات عند فتح الصفحة
onMounted(() => {
  fetchTenants()
})
</script>