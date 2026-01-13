<template>
  <div class="space-y-8">
    
    <div class="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      
      <div class="flex gap-4 text-sm">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-indigo-500"></span>
          <span class="text-gray-600 font-bold">{{ units.filter(u => u.status === 'مؤجرة').length }} مؤجرة</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-green-500"></span>
          <span class="text-gray-600 font-bold">{{ units.filter(u => u.status === 'شاغرة').length }} شاغرة</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-orange-400"></span>
          <span class="text-gray-600 font-bold">{{ units.filter(u => u.status === 'صيانة').length }} صيانة</span>
        </div>
      </div>

      <div class="flex bg-gray-100 p-1 rounded-lg">
        <button 
          @click="viewMode = 'grid'"
          class="px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2"
          :class="viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
        >
          <span>🗺️</span> مخطط المبنى
        </button>
        <button 
          @click="viewMode = 'table'"
          class="px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2"
          :class="viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
        >
          <span>📋</span> القائمة
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-md p-6 border-t-4 border-indigo-500">
      <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span>🏗️</span> {{ isEditing ? 'تعديل بيانات الوحدة' : 'إضافة وحدة جديدة' }}
      </h2>
      
      <form @submit.prevent="saveUnit" class="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">اسم الوحدة</label>
          <input v-model="form.name" type="text" required class="input-field" placeholder="مثال: شقة 101" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">النوع</label>
          <select v-model="form.type" class="input-field">
            <option>شقة</option>
            <option>محل تجاري</option>
            <option>فيلا</option>
            <option>مكتب</option>
            <option>استراحة</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">قيمة الإيجار السنوي</label>
          <div class="relative">
            <input v-model="form.price" type="number" required class="input-field pl-12" placeholder="0.00" />
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">SAR</span>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">رقم حساب الكهرباء ⚡</label>
          <input v-model="form.electricity_meter" type="text" class="input-field" placeholder="اختياري" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">رقم حساب الماء 💧</label>
          <input v-model="form.water_meter" type="text" class="input-field" placeholder="اختياري" />
        </div>
        <div v-if="isEditing">
          <label class="block text-sm font-medium text-gray-700 mb-1">حالة الوحدة</label>
          <select v-model="form.status" class="input-field">
            <option value="شاغرة">🟢 شاغرة</option>
            <option value="مؤجرة">🟣 مؤجرة</option>
            <option value="صيانة">🟠 صيانة</option>
          </select>
        </div>

        <div class="flex gap-2 w-full h-[42px]">
          <button type="submit" :disabled="loading" class="bg-indigo-600 text-white flex-1 rounded-lg hover:bg-indigo-700 font-bold shadow-sm transition">
            {{ loading ? '...' : (isEditing ? 'حفظ' : 'إضافة') }}
          </button>
           <button v-if="isEditing" @click="cancelEdit" type="button" class="bg-gray-100 text-gray-700 px-4 rounded-lg hover:bg-gray-200 font-bold border border-gray-200">
            إلغاء
          </button>
        </div>
      </form>
    </div>

    <div v-if="viewMode === 'grid'" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <div 
        v-for="unit in units" 
        :key="unit.id"
        class="relative group bg-white rounded-xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer overflow-hidden"
        :class="{
          'border-green-100 hover:border-green-400': unit.status === 'شاغرة',
          'border-indigo-100 hover:border-indigo-400': unit.status === 'مؤجرة',
          'border-orange-100 hover:border-orange-400': unit.status === 'صيانة'
        }"
        @click="editUnit(unit)"
      >
        <div class="h-2 w-full" 
          :class="{
            'bg-green-400': unit.status === 'شاغرة',
            'bg-indigo-500': unit.status === 'مؤجرة',
            'bg-orange-400': unit.status === 'صيانة'
          }">
        </div>

        <div class="p-4 text-center">
          <div class="text-3xl mb-2 opacity-80">
            {{ unit.type === 'محل تجاري' ? '🏪' : (unit.type === 'فيلا' ? '🏡' : '🏢') }}
          </div>
          
          <h3 class="font-bold text-gray-800 text-lg mb-1">{{ unit.name }}</h3>
          
          <p class="text-xs text-gray-500 font-mono mb-3 bg-gray-50 inline-block px-2 py-1 rounded">
            {{ Number(unit.price).toLocaleString() }} ريال
          </p>

          <div class="text-[10px] text-gray-400 space-y-1 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 left-0 right-0">
             <span v-if="unit.electricity_meter">⚡ {{ unit.electricity_meter }}</span>
          </div>
        </div>

        <div class="absolute top-3 left-3">
          <span v-if="unit.status === 'مؤجرة'" class="w-2 h-2 rounded-full bg-indigo-500 block animate-pulse"></span>
        </div>
      </div>
      
      <button @click="resetForm" class="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition min-h-[160px]">
        <span class="text-3xl mb-1">+</span>
        <span class="font-bold text-sm">وحدة جديدة</span>
      </button>
    </div>

    <div v-else class="bg-white rounded-xl shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
            <tr>
              <th class="px-6 py-3 text-right">الوحدة</th>
              <th class="px-6 py-3 text-right">العدادات</th>
              <th class="px-6 py-3 text-right">السعر</th>
              <th class="px-6 py-3 text-right">الحالة</th>
              <th class="px-6 py-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="unit in units" :key="unit.id" class="hover:bg-indigo-50 transition-colors">
              <td class="px-6 py-4">
                <div class="font-bold text-gray-800">{{ unit.name }}</div>
                <div class="text-xs text-gray-500 mt-0.5">{{ unit.type }}</div>
              </td>
              <td class="px-6 py-4">
                <div v-if="unit.electricity_meter" class="text-xs text-gray-600 flex items-center gap-1 mb-1">
                  <span class="text-yellow-500">⚡</span> {{ unit.electricity_meter }}
                </div>
                <div v-if="unit.water_meter" class="text-xs text-gray-600 flex items-center gap-1">
                  <span class="text-blue-400">💧</span> {{ unit.water_meter }}
                </div>
                <span v-if="!unit.electricity_meter && !unit.water_meter" class="text-gray-300 text-xs">-</span>
              </td>
              <td class="px-6 py-4 text-green-600 font-bold text-sm">{{ Number(unit.price).toLocaleString() }}</td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 rounded text-xs border font-medium" 
                  :class="{
                    'bg-green-100 text-green-800 border-green-200': unit.status === 'شاغرة',
                    'bg-indigo-100 text-indigo-800 border-indigo-200': unit.status === 'مؤجرة',
                    'bg-orange-100 text-orange-800 border-orange-200': unit.status === 'صيانة'
                  }">
                  {{ unit.status }}
                </span>
              </td>
              <td class="px-6 py-4 flex justify-center gap-3">
                <button @click="editUnit(unit)" class="text-blue-600 hover:bg-blue-100 p-2 rounded-full transition" title="تعديل">✏️</button>
                <button @click="deleteUnit(unit.id)" class="text-red-600 hover:bg-red-100 p-2 rounded-full transition" title="حذف">🗑️</button>
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
const units = ref([])
const loading = ref(false)
const viewMode = ref('grid') // الحالة الافتراضية: عرض المخطط

// إضافة الحقول الجديدة للنموذج
const form = ref({ 
  name: '', 
  type: 'شقة', 
  price: '',
  electricity_meter: '', 
  water_meter: '',
  status: 'شاغرة'
})

const isEditing = ref(false)
const editingId = ref(null)

const fetchUnits = async () => {
  // ترتيب الوحدات حسب الاسم ليكون العرض منطقياً في المخطط
  const { data } = await supabase.from('units').select('*').order('name', { ascending: true })
  units.value = data || []
}

const saveUnit = async () => {
  loading.value = true
  let error = null
  
  if (isEditing.value) {
    const { error: e } = await supabase.from('units').update(form.value).eq('id', editingId.value)
    error = e
  } else {
    // عند الإضافة، الحالة دائماً شاغرة افتراضياً
    const { error: e } = await supabase.from('units').insert([{...form.value, status: 'شاغرة'}])
    error = e
  }

  if (error) alert(error.message)
  else {
    cancelEdit()
    fetchUnits()
  }
  loading.value = false
}

const editUnit = (unit) => {
  form.value = { 
    name: unit.name, 
    type: unit.type, 
    price: unit.price,
    electricity_meter: unit.electricity_meter || '',
    water_meter: unit.water_meter || '',
    status: unit.status // السماح بتعديل الحالة يدوياً
  }
  isEditing.value = true
  editingId.value = unit.id
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const resetForm = () => {
  cancelEdit()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  form.value = { name: '', type: 'شقة', price: '', electricity_meter: '', water_meter: '', status: 'شاغرة' }
  isEditing.value = false
  editingId.value = null
}

const deleteUnit = async (id) => {
  if (!confirm('هل أنت متأكد من حذف هذه الوحدة؟')) return
  const { error } = await supabase.from('units').delete().eq('id', id)
  if (error) {
    alert('⚠️ لا يمكن حذف الوحدة لأنها مرتبطة بعقود مسجلة.')
  } else {
    fetchUnits()
  }
}

onMounted(() => fetchUnits())
</script>

<style scoped>
.input-field {
  @apply w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white h-[42px] transition-shadow;
}
</style>