<template>
  <div class="space-y-8">
    
    <div class="bg-white rounded-xl shadow-md overflow-hidden p-6 border-t-4 border-indigo-500">
      <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span>👤</span> {{ isEditing ? 'تعديل بيانات مستأجر' : 'إضافة مستأجر جديد' }}
      </h2>

      <form @submit.prevent="saveTenant" class="flex gap-4 items-end flex-wrap">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
          <input v-model="form.name" type="text" required class="input-field" placeholder="الاسم الرباعي" />
        </div>
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">الجوال</label>
          <input v-model="form.phone" type="text" class="input-field" placeholder="05xxxxxxxx" />
        </div>
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">الإيميل</label>
          <input v-model="form.email" type="email" class="input-field" placeholder="اختياري" />
        </div>
        
        <div class="flex gap-2">
          <button type="submit" :disabled="loading" class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-bold h-[42px] min-w-[100px]">
            {{ loading ? '...' : (isEditing ? 'حفظ التعديلات' : 'إضافة') }}
          </button>
          
          <button v-if="isEditing" @click="cancelEdit" type="button" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-bold h-[42px]">
            إلغاء
          </button>
        </div>
      </form>
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
              <th class="px-6 py-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="tenant in tenants" :key="tenant.id" class="hover:bg-indigo-50 transition-colors">
              <td class="px-6 py-4 font-bold text-gray-800">{{ tenant.name }}</td>
              <td class="px-6 py-4 text-gray-600 text-right" dir="ltr">{{ tenant.phone }}</td>
              <td class="px-6 py-4 text-gray-500">{{ tenant.email || '-' }}</td>
              <td class="px-6 py-4 flex justify-center gap-3">
                <button @click="editTenant(tenant)" class="text-blue-600 hover:bg-blue-100 p-2 rounded-full" title="تعديل">✏️</button>
                <button @click="deleteTenant(tenant.id)" class="text-red-600 hover:bg-red-100 p-2 rounded-full" title="حذف">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)
const loading = ref(false)
const tenants = ref([])
const form = ref({ name: '', phone: '', email: '' })
const isEditing = ref(false)
const editingId = ref(null)

const fetchTenants = async () => {
  const { data } = await supabase.from('tenants').select('*').order('created_at', { ascending: false })
  tenants.value = data || []
}

const saveTenant = async () => {
  loading.value = true
  let error = null
  
  if (isEditing.value) {
    const { error: updateError } = await supabase.from('tenants').update(form.value).eq('id', editingId.value)
    error = updateError
  } else {
    const { error: insertError } = await supabase.from('tenants').insert([form.value])
    error = insertError
  }

  if (error) alert('خطأ: ' + error.message)
  else {
    cancelEdit()
    fetchTenants()
  }
  loading.value = false
}

const editTenant = (tenant) => {
  form.value = { name: tenant.name, phone: tenant.phone, email: tenant.email }
  isEditing.value = true
  editingId.value = tenant.id
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  form.value = { name: '', phone: '', email: '' }
  isEditing.value = false
  editingId.value = null
}

const deleteTenant = async (id) => {
  if (!confirm('تنبيه: سيتم حذف المستأجر وجميع العقود المرتبطة به! هل أنت متأكد؟')) return
  const { error } = await supabase.from('tenants').delete().eq('id', id)
  if (error) alert('لا يمكن الحذف: توجد بيانات مرتبطة.')
  else fetchTenants()
}

onMounted(() => fetchTenants())
</script>

<style scoped>
.input-field {
  @apply w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none h-[42px];
}
</style>