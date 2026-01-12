<template>
  <div class="space-y-8">
    
    <div class="bg-white rounded-xl shadow-md overflow-hidden p-6 border-t-4 border-indigo-500">
      <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span>👤</span> {{ isEditing ? 'تعديل بيانات مستأجر' : 'إضافة مستأجر جديد' }}
      </h2>

      <form @submit.prevent="saveTenant" class="flex gap-4 items-end flex-wrap">
        
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">اسم المستأجر / الجهة</label>
          <input v-model="form.name" type="text" required class="input-field" placeholder="مثال: مؤسسة التقنية" />
        </div>

        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">الشخص المسؤول (اختياري)</label>
          <input v-model="form.contact_person" type="text" class="input-field" placeholder="مثال: أ. محمد أحمد" />
        </div>

        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">الجوال</label>
          <input v-model="form.phone" type="text" class="input-field" placeholder="05xxxxxxxx" />
        </div>
        
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">الإيميل</label>
          <input v-model="form.email" type="email" class="input-field" placeholder="اختياري" />
        </div>
        
        <div class="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
          <button type="submit" :disabled="loading" class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-bold h-[42px] min-w-[120px] shadow-sm">
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
              <th class="px-6 py-3 text-right">الاسم / المسؤول</th>
              <th class="px-6 py-3 text-right">الجوال</th>
              <th class="px-6 py-3 text-right">بوابة المستأجر</th>
              <th class="px-6 py-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="tenant in tenants" :key="tenant.id" class="hover:bg-indigo-50 transition-colors">
              
              <td class="px-6 py-4">
  <NuxtLink :to="`/tenants/${tenant.id}`" class="group block cursor-pointer">
    <div class="font-bold text-gray-800 text-base group-hover:text-indigo-600 transition-colors flex items-center gap-2">
      {{ tenant.name }}
      <span class="text-xs text-gray-400 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100">↗ عرض التفاصيل</span>
    </div>
    <div v-if="tenant.contact_person" class="text-xs text-gray-500 mt-1 flex items-center gap-1">
      <span class="bg-gray-100 px-1 rounded">مسؤول:</span> {{ tenant.contact_person }}
    </div>
  </NuxtLink>
</td>

              <td class="px-6 py-4 text-gray-600 text-right" dir="ltr">{{ tenant.phone }}</td>
              
              <td class="px-6 py-4">
                <button @click="copyPortalLink(tenant.id)" class="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200 hover:bg-indigo-100 flex items-center gap-1 w-fit transition font-medium">
                  🔗 نسخ الرابط
                </button>
              </td>

              <td class="px-6 py-4 flex justify-center gap-3">
                <button @click="editTenant(tenant)" class="text-blue-600 hover:bg-blue-100 p-2 rounded-full transition" title="تعديل">✏️</button>
                <button @click="deleteTenant(tenant.id)" class="text-red-600 hover:bg-red-100 p-2 rounded-full transition" title="حذف">🗑️</button>
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
// تمت إضافة contact_person للنموذج
const form = ref({ name: '', phone: '', email: '', contact_person: '' })
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
  // تعبئة البيانات بما فيها المسؤول عند التعديل
  form.value = { 
    name: tenant.name, 
    phone: tenant.phone, 
    email: tenant.email, 
    contact_person: tenant.contact_person || '' 
  }
  isEditing.value = true
  editingId.value = tenant.id
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  form.value = { name: '', phone: '', email: '', contact_person: '' }
  isEditing.value = false
  editingId.value = null
}

const deleteTenant = async (id) => {
  if (!confirm('تنبيه: سيتم حذف المستأجر وجميع العقود المرتبطة به! هل أنت متأكد؟')) return
  const { error } = await supabase.from('tenants').delete().eq('id', id)
  if (error) alert('لا يمكن الحذف: توجد بيانات مرتبطة.')
  else fetchTenants()
}

const copyPortalLink = (id) => {
  const url = `${window.location.origin}/portal/${id}`
  navigator.clipboard.writeText(url)
  alert('تم نسخ رابط بوابة المستأجر! 📋')
}

onMounted(() => fetchTenants())
</script>

<style scoped>
.input-field {
  @apply w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none h-[42px] transition-shadow;
}
</style>