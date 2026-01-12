<template>
  <div class="space-y-8">
    
    <div class="bg-white rounded-xl shadow-md p-6 border-t-4 border-indigo-500">
      <h2 class="text-xl font-bold text-gray-800 mb-6">📝 {{ isEditing ? 'تعديل بيانات العقد' : 'توقيع عقد جديد (متعدد الوحدات)' }}</h2>
      
      <form @submit.prevent="saveContract" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">المستأجر</label>
          <select v-model="form.tenant_id" required class="input-field" :disabled="isEditing">
            <option disabled value="">اختر المستأجر...</option>
            <option v-for="t in tenants" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>

        <div class="md:row-span-3">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            الوحدات المشمولة بالعقد 
            <span class="text-xs text-gray-400 font-normal">(يمكنك اختيار أكثر من وحدة)</span>
          </label>
          
          <div class="border rounded-xl p-3 h-[250px] overflow-y-auto bg-gray-50 space-y-2">
            <div v-if="availableUnits.length === 0" class="text-center text-gray-400 text-sm py-4">
              لا توجد وحدات شاغرة حالياً
            </div>
            
            <label 
              v-for="u in availableUnits" 
              :key="u.id" 
              class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:border-indigo-500 cursor-pointer transition shadow-sm"
              :class="{'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50': form.selected_units.includes(u.id)}"
            >
              <input 
                type="checkbox" 
                :value="u.id" 
                v-model="form.selected_units" 
                class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                :disabled="isEditing" 
              />
              <div class="flex-1">
                <div class="font-bold text-gray-800">{{ u.name }}</div>
                <div class="text-xs text-gray-500 flex justify-between">
                  <span>{{ u.type }}</span>
                  <span class="text-indigo-600">{{ Number(u.price).toLocaleString() }} ريال</span>
                </div>
              </div>
            </label>
          </div>
          <p class="text-xs text-gray-500 mt-2 text-left" dir="ltr">
            Selected: {{ form.selected_units.length }} unit(s)
          </p>
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
          <label class="block text-sm font-medium text-gray-700 mb-1">قيمة العقد الإجمالية</label>
          <input v-model="form.amount" type="number" required class="input-field" placeholder="المبلغ الكلي للوحدات المختارة" />
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
            <th class="px-6 py-3 text-right">المستأجر</th>
            <th class="px-6 py-3 text-right">الوحدات المؤجرة</th>
            <th class="px-6 py-3 text-right">الفترة</th>
            <th class="px-6 py-3 text-right">القيمة الإجمالية</th>
            <th class="px-6 py-3 text-right">الحالة</th>
            <th class="px-6 py-3 text-center">إجراءات</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="c in contracts" :key="c.id" class="hover:bg-indigo-50">
            <td class="px-6 py-4 font-bold text-gray-800">{{ c.tenants?.name }}</td>
            
            <td class="px-6 py-4 text-sm">
              <div class="flex flex-wrap gap-1">
                <span v-for="cu in c.contract_units" :key="cu.id" class="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold border border-indigo-200">
                  🏠 {{ cu.units?.name }}
                </span>
                <span v-if="!c.contract_units || c.contract_units.length === 0" class="text-gray-400 text-xs">لا يوجد وحدات</span>
              </div>
            </td>

            <td class="px-6 py-4 text-sm text-gray-500 font-mono">{{ c.start_date }} <br> ⬇ <br> {{ c.end_date }}</td>
            <td class="px-6 py-4 text-green-600 font-bold text-lg">{{ Number(c.amount).toLocaleString() }}</td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 rounded text-xs bg-green-100 text-green-800 border border-green-200">{{ c.status }}</span>
            </td>
            <td class="px-6 py-4 flex justify-center gap-3">
              <button @click="editContract(c)" class="text-blue-600 hover:bg-blue-100 p-2 rounded-full" title="تعديل">✏️</button>
              <button @click="deleteContract(c.id)" class="text-red-600 hover:bg-red-100 p-2 rounded-full" title="حذف وإنهاء">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
  selected_units: [], // مصفوفة للوحدات المختارة
  start_date: '',
  end_date: '',
  amount: '',
  frequency: '1'
})

// فلترة الوحدات الشاغرة فقط لتظهر في القائمة
const availableUnits = computed(() => {
  if (isEditing.value) return units.value // عند التعديل نعرض الكل
  return units.value.filter(u => u.status === 'شاغرة')
})

const fetchData = async () => {
  const { data: t } = await supabase.from('tenants').select('id, name')
  tenants.value = t || []
  
  const { data: u } = await supabase.from('units').select('id, name, type, price, status')
  units.value = u || []
  
  // جلب العقود مع الوحدات المرتبطة بها (علاقة معقدة قليلاً)
  const { data: c } = await supabase
    .from('contracts')
    .select(`
      *, 
      tenants (name), 
      contract_units (
        id, units (name)
      )
    `)
    .order('created_at', { ascending: false })
  
  contracts.value = c || []
}

const saveContract = async () => {
  if (form.value.selected_units.length === 0) {
    alert('⚠️ يجب اختيار وحدة واحدة على الأقل!')
    return
  }

  loading.value = true
  
  if (isEditing.value) {
    // تعديل البيانات المالية والوقت فقط
    const { error } = await supabase.from('contracts').update({
      start_date: form.value.start_date,
      end_date: form.value.end_date,
      amount: form.value.amount
    }).eq('id', editingId.value)
    
    if (error) alert(error.message)
    else { cancelEdit(); fetchData(); }
    loading.value = false
    return
  }

  // --- عملية إنشاء عقد جديد ---
  try {
    // 1. إنشاء العقد الرئيسي
    // نستخدم الوحدة الأولى كـ "وحدة رئيسية" للمرجع فقط، لكن الاعتماد الكلي على جدول contract_units
    const primaryUnitId = form.value.selected_units[0] 

    const { data: contractData, error: contractError } = await supabase
      .from('contracts')
      .insert([{
        tenant_id: form.value.tenant_id,
        unit_id: primaryUnitId, // للتوافق مع النظام القديم
        start_date: form.value.start_date,
        end_date: form.value.end_date,
        amount: form.value.amount
      }])
      .select().single()

    if (contractError) throw contractError

    const contractId = contractData.id

    // 2. ربط الوحدات بالعقد في الجدول الجديد
    const contractUnitsInserts = form.value.selected_units.map(uid => ({
      contract_id: contractId,
      unit_id: uid
    }))
    const { error: linkError } = await supabase.from('contract_units').insert(contractUnitsInserts)
    if (linkError) throw linkError

    // 3. تحديث حالة جميع الوحدات المختارة إلى "مؤجرة"
    const { error: unitUpdateError } = await supabase
      .from('units')
      .update({ status: 'مؤجرة' })
      .in('id', form.value.selected_units)
    if (unitUpdateError) throw unitUpdateError

    // 4. توليد الفواتير (فاتورة واحدة مجمعة)
    const totalAmount = Number(form.value.amount)
    const parts = Number(form.value.frequency)
    const amountPerInvoice = totalAmount / parts
    let currentDate = new Date(form.value.start_date)
    const invoices = []

    for (let i = 0; i < parts; i++) {
      invoices.push({
        contract_id: contractId,
        tenant_id: form.value.tenant_id,
        unit_id: primaryUnitId, // نربط الفاتورة بالوحدة الرئيسية
        due_date: currentDate.toISOString().split('T')[0],
        amount: amountPerInvoice,
        status: 'غير مدفوع'
      })
      currentDate.setMonth(currentDate.getMonth() + (12 / parts))
    }

    const { error: invoiceError } = await supabase.from('invoices').insert(invoices)
    if (invoiceError) throw invoiceError

    alert(`✅ تم توقيع العقد لـ ${form.value.selected_units.length} وحدات بنجاح!`)
    cancelEdit()
    fetchData()

  } catch (e) {
    alert('حدث خطأ: ' + e.message)
  } finally {
    loading.value = false
  }
}

const editContract = (c) => {
  // استخراج معرفات الوحدات لهذا العقد
  const unitIds = c.contract_units ? c.contract_units.map(cu => cu.units?.id) : [] // تصحيح الوصول للـ ID

  form.value = { 
    ...c,
    selected_units: unitIds // تعبئة الوحدات المختارة
  }
  isEditing.value = true
  editingId.value = c.id
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  form.value = { tenant_id: '', selected_units: [], start_date: '', end_date: '', amount: '', frequency: '1' }
  isEditing.value = false
  editingId.value = null
}

const deleteContract = async (id) => {
  if (!confirm('⚠️ هل أنت متأكد من حذف العقد؟\nسيتم حذف الفواتير وإعادة جميع الوحدات المرتبطة به إلى "شاغرة".')) return
  
  loading.value = true
  
  // 1. يجب أن نعرف الوحدات المرتبطة لإعادتها شاغرة قبل حذف العقد
  const { data: linkedUnits } = await supabase.from('contract_units').select('unit_id').eq('contract_id', id)
  const unitIdsToFree = linkedUnits.map(x => x.unit_id)

  // 2. حذف الفواتير
  await supabase.from('invoices').delete().eq('contract_id', id)
  
  // 3. حذف العقد (سيحذف contract_units تلقائياً بسبب cascade)
  const { error } = await supabase.from('contracts').delete().eq('id', id)
  
  if (!error && unitIdsToFree.length > 0) {
    // 4. تحرير الوحدات
    await supabase.from('units').update({ status: 'شاغرة' }).in('id', unitIdsToFree)
  }
  
  fetchData()
  loading.value = false
}

onMounted(() => fetchData())
</script>

<style scoped>
.input-field {
  @apply w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white h-[45px];
}
</style>