<template>
  <div class="space-y-8">
    
    <div class="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500">
      <h2 class="text-xl font-bold text-gray-800 mb-6">🏢 إضافة وحدة عقارية</h2>
      
      <form @submit.prevent="addUnit" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">اسم الوحدة</label>
          <input v-model="form.name" type="text" required class="input-field" placeholder="مثال: شقة 101" />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">النوع</label>
          <select v-model="form.type" class="input-field">
            <option>شقة</option>
            <option>محل تجاري</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">السعر السنوي</label>
          <input v-model="form.price" type="number" required class="input-field" placeholder="SAR" />
        </div>

        <button type="submit" :disabled="loading" class="bg-blue-600 text-blue w-full py-2 rounded-lg hover:bg-blue-700 font-bold h-[42px] shadow-sm transition-colors">
          {{ loading ? '...' : 'إضافة' }}
        </button>
        
      </form>
    </div>

    <div class="bg-white rounded-xl shadow-md overflow-hidden">
      <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h2 class="text-lg font-bold text-gray-700">قائمة العقارات ({{ units.length }})</h2>
        <button @click="fetchUnits" class="text-blue-600 text-sm hover:underline">🔄 تحديث</button>
      </div>
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
          <tr>
            <th class="px-6 py-3 text-right">الوحدة</th>
            <th class="px-6 py-3 text-right">النوع</th>
            <th class="px-6 py-3 text-right">السعر</th>
            <th class="px-6 py-3 text-right">الحالة</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="unit in units" :key="unit.id" class="hover:bg-blue-50 transition-colors">
            <td class="px-6 py-4 font-bold text-gray-800">{{ unit.name }}</td>
            <td class="px-6 py-4 text-gray-600">{{ unit.type }}</td>
            <td class="px-6 py-4 text-green-600 font-bold">{{ Number(unit.price).toLocaleString() }} ريال</td>
            <td class="px-6 py-4">
              <span 
                class="px-2 py-1 rounded text-xs border"
                :class="unit.status === 'شاغرة' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'"
              >
                {{ unit.status }}
              </span>
            </td>
          </tr>
          <tr v-if="units.length === 0">
            <td colspan="4" class="p-8 text-center text-gray-400">لا توجد وحدات مضافة بعد.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)
const units = ref([])
const loading = ref(false)
const form = ref({ name: '', type: 'شقة', price: '' })

const fetchUnits = async () => {
  const { data } = await supabase.from('units').select('*').order('created_at', { ascending: false })
  units.value = data || []
}

const addUnit = async () => {
  loading.value = true
  const { error } = await supabase.from('units').insert([form.value])
  if (error) {
    alert(error.message)
  } else {
    form.value = { name: '', type: 'شقة', price: '' }
    fetchUnits()
  }
  loading.value = false
}

onMounted(() => fetchUnits())
</script>

<style scoped>
.input-field {
  @apply w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white h-[42px];
}
</style>