<template>
  <div class="space-y-8 font-sans text-slate-800" dir="rtl">
    
    <div class="flex flex-col md:flex-row justify-between items-end gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">👥 سجل المستأجرين</h1>
        <p class="text-slate-500 mt-1 text-sm font-medium">إدارة بيانات العملاء، العقود النشطة، والتواصل</p>
      </div>
      
      <div class="flex gap-3 w-full md:w-auto">
        <div class="relative flex-1 md:w-64">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="بحث بالاسم أو الجوال..." 
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
          >
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        </div>

        <button 
          @click="openModal()" 
          class="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-sm shadow-indigo-200 flex items-center gap-2 whitespace-nowrap"
        >
          <span>➕</span> مستأجر جديد
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200 min-h-[400px] flex flex-col">
      
      <div v-if="pending && !tenants.length" class="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
        <div class="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p>جاري تحميل البيانات...</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100">
          <thead class="bg-slate-50 text-xs text-slate-500 uppercase font-bold tracking-wider">
            <tr>
              <th class="px-6 py-4 text-right">المستأجر</th>
              <th class="px-6 py-4 text-right">معلومات الاتصال</th>
              <th class="px-6 py-4 text-right">رقم الهوية</th>
              <th class="px-6 py-4 text-center">تواصل</th>
              <th class="px-6 py-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 bg-white">
            <tr v-for="tenant in filteredTenants" :key="tenant.id" class="hover:bg-indigo-50/30 transition-colors group">
              
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                    {{ tenant.name.charAt(0) }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-900">{{ tenant.name }}</div>
                    <div class="text-xs text-slate-400">ID: #{{ tenant.id.toString().padStart(4, '0') }}</div>
                  </div>
                </div>
              </td>
              
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-slate-700 font-mono">{{ tenant.phone_number }}</div>
                <div v-if="tenant.email" class="text-xs text-slate-400 mt-0.5">{{ tenant.email }}</div>
              </td>
              
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  {{ tenant.id_number || '---' }}
                </span>
              </td>
              
              <td class="px-6 py-4 text-center">
                <a 
                  v-if="tenant.phone_number"
                  :href="`https://wa.me/${tenant.phone_number.replace('+', '').replace(/\s/g, '')}`" 
                  target="_blank"
                  class="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition border border-emerald-100"
                >
                  <span class="text-lg">💬</span> واتساب
                </a>
              </td>
              
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button 
                    @click="openModal(tenant)" 
                    class="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition"
                    title="تعديل"
                  >
                    ✏️
                  </button>
                  <button 
                    @click="deleteTenant(tenant.id)" 
                    :disabled="busy[tenant.id]"
                    class="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition disabled:opacity-50"
                    title="حذف"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
            
            <tr v-if="filteredTenants.length === 0">
              <td colspan="5" class="p-12 text-center text-slate-400">
                <span class="text-4xl block mb-2 opacity-50">👥</span>
                لا يوجد مستأجرين يطابقون البحث.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="closeModal"></div>
      
      <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10 transform transition-all scale-100">
        <div class="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 class="font-bold text-slate-800">{{ isEditing ? '✏️ تعديل بيانات مستأجر' : '➕ إضافة مستأجر جديد' }}</h3>
          <button @click="closeModal" class="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>
        
        <form @submit.prevent="saveTenant" class="p-6 space-y-4">
          <div>
            <label class="text-xs font-bold text-slate-500 uppercase mb-1.5 block">الاسم الكامل <span class="text-rose-500">*</span></label>
            <input v-model="form.name" type="text" class="input-field" required placeholder="مثال: محمد عبدالله">
          </div>
          
          <div>
            <label class="text-xs font-bold text-slate-500 uppercase mb-1.5 block">رقم الجوال <span class="text-rose-500">*</span></label>
            <input v-model="form.phone_number" type="tel" class="input-field dir-ltr text-right" required placeholder="9665xxxxxxxx">
            <p class="text-xs text-slate-400 mt-1">يفضل بالصيغة الدولية لعمل الواتساب</p>
          </div>
          
          <div>
            <label class="text-xs font-bold text-slate-500 uppercase mb-1.5 block">رقم الهوية</label>
            <input v-model="form.id_number" type="text" class="input-field" placeholder="اختياري">
          </div>

          <div>
            <label class="text-xs font-bold text-slate-500 uppercase mb-1.5 block">البريد الإلكتروني</label>
            <input v-model="form.email" type="email" class="input-field dir-ltr text-right" placeholder="example@mail.com">
          </div>

          <div class="pt-4 flex gap-3">
            <button 
              type="submit" 
              :disabled="saving"
              class="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-sm transition disabled:opacity-70 flex justify-center items-center gap-2"
            >
              <span v-if="saving" class="animate-spin">⏳</span>
              <span>حفظ البيانات</span>
            </button>
            <button 
              type="button" 
              @click="closeModal"
              class="flex-1 bg-white text-slate-700 border border-slate-300 py-3 rounded-xl font-bold hover:bg-slate-50 transition"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

const supabase = useSupabaseClient()
const searchQuery = ref('')
const showModal = ref(false)
const saving = ref(false)
const busy = reactive({})

const form = ref({
  id: null,
  name: '',
  phone_number: '',
  id_number: '',
  email: ''
})

const isEditing = computed(() => !!form.value.id)

// جلب البيانات
const { data: tenants, pending, refresh } = await useAsyncData('tenants-list', async () => {
  const { data } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
})

// البحث
const filteredTenants = computed(() => {
  if (!searchQuery.value) return tenants.value || []
  const q = searchQuery.value.toLowerCase()
  return (tenants.value || []).filter(t => 
    t.name.toLowerCase().includes(q) || 
    t.phone_number?.includes(q) ||
    t.id_number?.includes(q)
  )
})

// إدارة المودال
const openModal = (tenant = null) => {
  if (tenant) {
    form.value = { ...tenant } // وضع التعديل
  } else {
    form.value = { id: null, name: '', phone_number: '', id_number: '', email: '' } // وضع الإضافة
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

// الحفظ (إضافة أو تعديل)
const saveTenant = async () => {
  saving.value = true
  try {
    const payload = {
      name: form.value.name,
      phone_number: form.value.phone_number,
      id_number: form.value.id_number,
      email: form.value.email
    }

    if (isEditing.value) {
      // تحديث
      const { error } = await supabase
        .from('tenants')
        .update(payload)
        .eq('id', form.value.id)
      if (error) throw error
    } else {
      // إضافة جديد
      const { error } = await supabase
        .from('tenants')
        .insert([payload])
      if (error) throw error
    }

    await refresh()
    closeModal()
  } catch (e) {
    alert('حدث خطأ: ' + e.message)
  } finally {
    saving.value = false
  }
}

// الحذف
const deleteTenant = async (id) => {
  if (!confirm('⚠️ تحذير: حذف المستأجر قد يؤثر على العقود والفواتير المرتبطة به.\nهل أنت متأكد؟')) return
  
  busy[id] = true
  try {
    const { error } = await supabase.from('tenants').delete().eq('id', id)
    if (error) throw error
    await refresh()
  } catch (e) {
    alert('لا يمكن حذف المستأجر (غالباً بسبب وجود عقود مرتبطة به).')
  } finally {
    busy[id] = false
  }
}
</script>

<style scoped>
.input-field {
  @apply w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm;
}
</style>