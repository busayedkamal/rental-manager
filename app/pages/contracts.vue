<template>
  <div class="space-y-8">
    
    <div class="bg-white rounded-xl shadow-md p-6 border-t-4 border-indigo-500">
      <h2 class="text-xl font-bold text-gray-800 mb-6">📝 {{ isEditing ? 'تعديل بيانات العقد' : 'توقيع عقد جديد' }}</h2>
      
      <form @submit.prevent="saveContract" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">المستأجر</label>
          <select v-model="form.tenant_id" required class="input-field" :disabled="isEditing">
            <option disabled value="">اختر المستأجر...</option>
            <option v-for="t in tenants" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">الوحدة</label>
          <select v-model="form.unit_id" required class="input-field" :disabled="isEditing">
            <option disabled value="">اختر الوحدة...</option>
            <option v-for="u in units" :key="u.id" :value="u.id">
              {{ u.name }} ({{ u.type }}) - {{ u.status }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية</label>
          <input v-model="form.start_date" type="date" required class="input-field" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ النهاية</label>
          <input v-model="form.end_date" type="date" required class="input-field" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">قيمة العقد</label>
          <input v-model="form.amount" type="number" required class="input-field" placeholder="SAR" />
        </div>
        
        <div v-if="!isEditing">
          <label class="block text-sm font-medium text-gray-700 mb-1">نظام الدفعات (للفواتير)</label>
          <select v-model="form.frequency" required class="input-field bg-indigo-50">
            <option value="1">دفعة واحدة (سنوي)</option>
            <option value="2">دفعتين (كل 6 أشهر)</option>
            <option value="4">4 دفعات (ربع سنوي)</option>
            <option value="12">12 دفعة (شهري)</option>
          </select>
        </div>

        <div class="md:col-span-2 mt-4 flex gap-2">
          <button type="submit" :disabled="loading" class="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-bold shadow-md transition-all active:scale-95">
            {{ loading ? 'جاري المعالجة...' : (isEditing ? 'حفظ التعديلات' : 'توقيع وإصدار الفواتير 🚀') }}
          </button>
          <button v-if="isEditing" @click="cancelEdit" type="button" class="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-bold">
            إلغاء
          </button>
        </div>
      </form>
    </div>

    <div class="bg-white rounded-xl shadow-md overflow-hidden">
      <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h2 class="text-lg font-bold text-gray-700">أرشيف العقود ({{ contracts.length }})</h2>
        <button @click="fetchData" class="text-indigo-600 text-sm hover:underline">تحديث</button>
      </div>
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
          <tr>
            <th class="px-6 py-3 text-right">المستأجر / الوحدة</th>
            <th class="px-6 py-3 text-right">الفترة</th>
            <th class="px-6 py-3 text-right">القيمة</th>
            <th class="px-6 py-3 text-right">الحالة</th>
            <th class="px-6 py-3 text-center">إجراءات</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="c in contracts" :key="c.id" class="hover:bg-indigo-50">
            <td class="px-6 py-4">
              <div class="font-bold">{{ c.tenants?.name }}</div>
              <div class="text-xs text-gray-500">{{ c.units?.name }}</div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ c.start_date }} <br> {{ c.end_date }}</td>
            <td class="px-6 py-4 text-green-600 font-bold">{{ Number(c.amount).toLocaleString() }}</td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 rounded text-xs bg-green-100 text-green-800 border border-green-200">{{ c.status }}</span>
            </td>
            <td class="px-6 py-4 flex justify-center gap-3">
              <button @click="editContract(c)" class="text-blue-600 hover:bg-blue-100 p-2 rounded-full">✏️</button>
              <button @click="deleteContract(c.id, c.unit_id)" class="text-red-600 hover:bg-red-100 p-2 rounded-full">🗑️</button>
            </td>
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
const loading = ref(false)
const tenants = ref([])
const units = ref([])
const contracts = ref([])
const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  tenant_id: '',
  unit_id: '',
  start_date: '',
  end_date: '',
  amount: '',
  frequency: '1'
})

const fetchData = async () => {
  const { data: t } = await supabase.from('tenants').select('id, name')
  tenants.value = t || []
  const { data: u } = await supabase.from('units').select('id, name, type, status')
  units.value = u || []
  const { data: c } = await supabase.from('contracts').select(`*, tenants (name), units (name)`).order('created_at', { ascending: false })
  contracts.value = c || []
}

const saveContract = async () => {
  loading.value = true
  
  if (isEditing.value) {
    // تحديث البيانات الأساسية فقط (بدون الفواتير)
    const { error } = await supabase.from('contracts').update({
      start_date: form.value.start_date,
      end_date: form.value.end_date,
      amount: form.value.amount
    }).eq('id', editingId.value)
    
    if (error) alert(error.message)
    else {
      cancelEdit()
      fetchData()
    }
    loading.value = false
    return
  }

  // إضافة جديد (نفس الكود السابق)
  try {
    const { data: contractData, error: contractError } = await supabase
      .from('contracts')
      .insert([{
        tenant_id: form.value.tenant_id,
        unit_id: form.value.unit_id,
        start_date: form.value.start_date,
        end_date: form.value.end_date,
        amount: form.value.amount
      }])
      .select().single()

    if (contractError) throw contractError

    await supabase.from('units').update({ status: 'مؤجرة' }).eq('id', form.value.unit_id)

    const contractId = contractData.id
    const totalAmount = Number(form.value.amount)
    const parts = Number(form.value.frequency)
    const amountPerInvoice = totalAmount / parts
    let currentDate = new Date(form.value.start_date)
    const invoices = []

    for (let i = 0; i < parts; i++) {
      invoices.push({
        contract_id: contractId,
        tenant_id: form.value.tenant_id,
        unit_id: form.value.unit_id,
        due_date: currentDate.toISOString().split('T')[0],
        amount: amountPerInvoice,
        status: 'غير مدفوع'
      })
      currentDate.setMonth(currentDate.getMonth() + (12 / parts))
    }

    const { error: invoiceError } = await supabase.from('invoices').insert(invoices)
    if (invoiceError) throw invoiceError

    alert(`✅ تم التوقيع بنجاح وتم إصدار ${parts} فاتورة!`)
    cancelEdit()
    fetchData()

  } catch (e) {
    alert('خطأ: ' + e.message)
  } finally {
    loading.value = false
  }
}

const editContract = (c) => {
  form.value = { ...c } // نسخ البيانات
  isEditing.value = true
  editingId.value = c.id
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  form.value = { tenant_id: '', unit_id: '', start_date: '', end_date: '', amount: '', frequency: '1' }
  isEditing.value = false
  editingId.value = null
}

const deleteContract = async (id, unitId) => {
  if (!confirm('هل أنت متأكد؟ سيتم حذف جميع الفواتير المرتبطة بهذا العقد!')) return
  
  loading.value = true
  // 1. حذف الفواتير أولاً
  await supabase.from('invoices').delete().eq('contract_id', id)
  
  // 2. حذف العقد
  const { error } = await supabase.from('contracts').delete().eq('id', id)
  
  if (error) {
    alert('حدث خطأ أثناء الحذف: ' + error.message)
  } else {
    // 3. إعادة الوحدة لحالة "شاغرة"
    await supabase.from('units').update({ status: 'شاغرة' }).eq('id', unitId)
    fetchData()
  }
  loading.value = false
}

onMounted(() => fetchData())
</script>

<style scoped>
.input-field {
  @apply w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white h-[45px];
}
</style>