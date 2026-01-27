<template>
  <div class="space-y-8">
    
    <div class="bg-white rounded-xl shadow-md p-6 border-t-4 border-indigo-500">
      <h2 class="text-xl font-bold text-gray-800 mb-6">📝 {{ isEditing ? 'تعديل بيانات العقد' : 'توقيع عقد جديد' }}</h2>
      <form @submit.prevent="saveContract" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">المستأجر</label>
          <select v-model="form.tenant_id" required class="input-field" :disabled="isEditing">
            <option disabled value="">اختر المستأجر...</option>
            <option v-for="t in tenants" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>
        <div class="md:row-span-3">
          <label class="block text-sm font-medium text-gray-700 mb-2">الوحدات المشمولة</label>
          <div class="border rounded-xl p-3 h-[250px] overflow-y-auto bg-gray-50 space-y-2">
            <label v-for="u in allUnitsForSelection" :key="u.id" class="flex items-center gap-3 p-3 rounded-lg border bg-white hover:border-indigo-500 cursor-pointer" :class="{'ring-2 ring-indigo-500 bg-indigo-50': form.selected_units.includes(u.id)}">
              <input type="checkbox" :value="u.id" v-model="form.selected_units" class="w-5 h-5 text-indigo-600 rounded" />
              <div class="flex-1">
                <div class="font-bold text-gray-800">{{ u.name }}</div>
                <div class="text-xs text-gray-500">{{ u.type }} - {{ Number(u.price).toLocaleString() }} ريال</div>
              </div>
            </label>
          </div>
          <p class="text-xs text-gray-500 mt-2">مختار: {{ form.selected_units.length }} وحدة</p>
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
          <input v-model="form.amount" type="number" required class="input-field" />
        </div>
        <div v-if="!isEditing">
          <label class="block text-sm font-medium text-gray-700 mb-1">نظام الدفعات</label>
          <select v-model="form.frequency" required class="input-field bg-indigo-50">
            <option value="1">دفعة واحدة (سنوي)</option>
            <option value="2">دفعتين (كل 6 أشهر)</option>
            <option value="4">4 دفعات (ربع سنوي)</option>
            <option value="12">12 دفعة (شهري)</option>
          </select>
        </div>
        <div class="md:col-span-2 mt-4 flex gap-2">
          <button type="submit" :disabled="loading" class="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-bold shadow-md">
            {{ loading ? 'جاري المعالجة...' : (isEditing ? 'حفظ التعديلات' : 'توقيع العقد 🚀') }}
          </button>
          <button v-if="isEditing" @click="cancelEdit" type="button" class="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-bold">إلغاء</button>
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
            <th class="px-6 py-3 text-right">الوحدات</th>
            <th class="px-6 py-3 text-right">الفترة</th>
            <th class="px-6 py-3 text-right">القيمة</th>
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
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 font-sans">{{ c.start_date }} <br> ⬇ <br> {{ c.end_date }}</td>
            <td class="px-6 py-4 text-green-600 font-bold text-lg">{{ Number(c.amount).toLocaleString() }}</td>
            <td class="px-6 py-4 flex justify-center gap-2">
              
              <button @click="openContractPDF(c)" class="bg-gray-100 text-gray-600 hover:bg-gray-200 p-2 rounded-full border border-gray-300 transition" title="طباعة العقد">
                📄
              </button>

              <button @click="renewContract(c)" class="bg-green-50 text-green-600 hover:bg-green-100 p-2 rounded-full border border-green-200 transition" title="تجديد العقد">
                🔄
              </button>

              <button @click="editContract(c)" class="text-blue-600 hover:bg-blue-100 p-2 rounded-full">✏️</button>
              <button @click="deleteContract(c.id)" class="text-red-600 hover:bg-red-100 p-2 rounded-full">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ContractPDF 
      v-if="showContractModal" 
      :isOpen="showContractModal" 
      :contract="selectedContract" 
      @close="showContractModal = false" 
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { createClient } from '@supabase/supabase-js'
import ContractPDF from '~/components/ContractPDF.vue'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)
const loading = ref(false)
const tenants = ref([])
const units = ref([])
const contracts = ref([])
const isEditing = ref(false)
const editingId = ref(null)
const originalUnitIds = ref([])

const showContractModal = ref(false)
const selectedContract = ref(null)

const form = ref({ tenant_id: '', selected_units: [], start_date: '', end_date: '', amount: '', frequency: '1' })

const allUnitsForSelection = computed(() => units.value.filter(u => u.status === 'شاغرة' || originalUnitIds.value.includes(u.id)))

const fetchData = async () => {
  const { data: t } = await supabase.from('tenants').select('id, name, phone, email')
  tenants.value = t || []
  
  const { data: u } = await supabase.from('units').select('id, name, type, price, status, electricity_meter')
  units.value = u || []
  
  const { data: c } = await supabase.from('contracts').select(`
    *, 
    tenants (name, phone, email), 
    contract_units (
      id, units (id, name, type, electricity_meter)
    )
  `).order('created_at', { ascending: false })
  
  contracts.value = c || []
}

const openContractPDF = (c) => {
  selectedContract.value = c
  showContractModal.value = true
}

const renewContract = async (oldContract) => {
  if (!confirm(`هل تريد تجديد العقد للمستأجر "${oldContract.tenants?.name}" لسنة إضافية؟`)) return
  loading.value = true
  try {
    const oldEnd = new Date(oldContract.end_date)
    const newStart = new Date(oldEnd)
    newStart.setDate(newStart.getDate() + 1)
    const newEnd = new Date(newStart)
    newEnd.setFullYear(newEnd.getFullYear() + 1)
    newEnd.setDate(newEnd.getDate() - 1)

    const { data: newContract, error: cErr } = await supabase.from('contracts').insert([{
      tenant_id: oldContract.tenant_id,
      start_date: newStart.toISOString().split('T')[0],
      end_date: newEnd.toISOString().split('T')[0],
      amount: oldContract.amount,
      status: 'ساري'
    }]).select().single()
    if (cErr) throw cErr

    if (oldContract.contract_units && oldContract.contract_units.length > 0) {
      const links = oldContract.contract_units.map(cu => ({ 
        contract_id: newContract.id, 
        unit_id: cu.units.id 
      }))
      await supabase.from('contract_units').insert(links)
    }

    const parts = 2 
    const totalAmount = Number(oldContract.amount)
    
    // 👇 حساب دقيق للفواتير للتجديد (نفس المنطق الجديد)
    const baseAmount = Math.floor(totalAmount / parts) // القيمة الصحيحة للدفعة
    const remainder = totalAmount % parts // الباقي
    
    let d = new Date(newStart)
    const invs = []
    
    for (let i = 0; i < parts; i++) {
      // نضيف الباقي كله للدفعة الأخيرة
      const currentAmount = (i === parts - 1) ? (baseAmount + remainder) : baseAmount
      
      invs.push({
        contract_id: newContract.id,
        tenant_id: oldContract.tenant_id,
        due_date: d.toISOString().split('T')[0],
        amount: currentAmount,
        status: 'غير مدفوع'
      })
      d.setMonth(d.getMonth() + (12 / parts))
    }
    
    await supabase.from('invoices').insert(invs)

    alert('✅ تم تجديد العقد بنجاح!')
    fetchData()
  } catch (e) {
    alert('خطأ: ' + e.message)
  } finally {
    loading.value = false
  }
}

const saveContract = async () => {
  if (form.value.selected_units.length === 0) { alert('يجب اختيار وحدة!'); return }
  loading.value = true
  try {
    if (isEditing.value) {
      await supabase.from('contracts').update({ tenant_id: form.value.tenant_id, start_date: form.value.start_date, end_date: form.value.end_date, amount: form.value.amount }).eq('id', editingId.value)
      if (originalUnitIds.value.length > 0) await supabase.from('units').update({ status: 'شاغرة' }).in('id', originalUnitIds.value)
      await supabase.from('contract_units').delete().eq('contract_id', editingId.value)
      const newLinks = form.value.selected_units.map(uid => ({ contract_id: editingId.value, unit_id: uid }))
      await supabase.from('contract_units').insert(newLinks)
      await supabase.from('units').update({ status: 'مؤجرة' }).in('id', form.value.selected_units)
      alert('تم التحديث!')
    } else {
      const { data: contract, error: cErr } = await supabase.from('contracts').insert([{ tenant_id: form.value.tenant_id, start_date: form.value.start_date, end_date: form.value.end_date, amount: form.value.amount }]).select().single()
      if (cErr) throw cErr
      const links = form.value.selected_units.map(uid => ({ contract_id: contract.id, unit_id: uid }))
      await supabase.from('contract_units').insert(links)
      await supabase.from('units').update({ status: 'مؤجرة' }).in('id', form.value.selected_units)
      
      // 👇👇 تعديل الحسابات الدقيقة للفواتير 👇👇
      const totalAmount = Number(form.value.amount)
      const parts = Number(form.value.frequency)
      
      const baseAmount = Math.floor(totalAmount / parts) // القيمة الصحيحة بدون كسور
      const remainder = totalAmount % parts // الباقي (الهللات أو الريالات)
      
      let d = new Date(form.value.start_date)
      const invs = []
      
      for (let i = 0; i < parts; i++) {
        // إذا كانت الدفعة الأخيرة، نضيف عليها الباقي لضمان تطابق المجموع
        const currentAmount = (i === parts - 1) ? (baseAmount + remainder) : baseAmount
        
        invs.push({ 
          contract_id: contract.id, 
          tenant_id: form.value.tenant_id, 
          due_date: d.toISOString().split('T')[0], 
          amount: currentAmount, 
          status: 'غير مدفوع' 
        })
        
        d.setMonth(d.getMonth() + (12 / parts)) 
      }
      // 👆👆 نهاية التعديل 👆👆

      await supabase.from('invoices').insert(invs)
      alert('تم التوقيع!')
    }
    cancelEdit(); fetchData()
  } catch (e) { alert(e.message) } finally { loading.value = false }
}

const editContract = (c) => {
  const currentUnits = c.contract_units ? c.contract_units.map(cu => cu.units?.id) : []
  originalUnitIds.value = currentUnits
  form.value = { ...c, selected_units: currentUnits }
  isEditing.value = true; editingId.value = c.id; window.scrollTo({ top: 0, behavior: 'smooth' })
}
const cancelEdit = () => { form.value = { tenant_id: '', selected_units: [], start_date: '', end_date: '', amount: '', frequency: '1' }; isEditing.value = false; editingId.value = null; originalUnitIds.value = [] }
const deleteContract = async (id) => {
  if (!confirm('حذف العقد؟')) return
  const { data: links } = await supabase.from('contract_units').select('unit_id').eq('contract_id', id)
  const ids = links.map(x => x.unit_id)
  if (ids.length) await supabase.from('units').update({ status: 'شاغرة' }).in('id', ids)
  await supabase.from('invoices').delete().eq('contract_id', id)
  await supabase.from('contracts').delete().eq('id', id)
  fetchData()
}
onMounted(() => fetchData())
</script>

<style scoped>
.input-field { @apply w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white h-[45px]; }
</style>