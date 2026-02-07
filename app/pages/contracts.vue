<template>
  <div class="space-y-8 font-sans text-slate-800" dir="rtl">
    
    <div 
      class="bg-white rounded-xl shadow-sm p-6 border-t-4 transition-colors duration-300"
      :class="isEditing ? 'border-amber-400' : 'border-indigo-500'"
    >
      <div class="mb-6">
        <h2 class="text-xl font-extrabold text-slate-900 mb-1 flex items-center gap-2">
          <span>{{ isEditing ? '✏️' : '📝' }}</span>
          {{ isEditing ? 'تعديل بيانات العقد' : 'توقيع عقد جديد' }}
        </h2>
        <p class="text-sm text-slate-500">
          {{ isEditing ? 'تنبيه: تعديل البيانات المالية قد يتطلب مراجعة الفواتير يدوياً.' : 'قم باختيار المستأجر والوحدات، وحدد نظام الدفعات المناسب.' }}
        </p>
      </div>

      <form @submit.prevent="saveContract" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1.5">المستأجر</label>
            <select v-model="form.tenant_id" required class="input-field" :disabled="isEditing">
              <option disabled value="">اختر المستأجر...</option>
              <option v-for="t in tenants" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">تاريخ البداية</label>
              <input v-model="form.start_date" type="date" required class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">تاريخ النهاية</label>
              <input v-model="form.end_date" type="date" required class="input-field" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">قيمة العقد</label>
              <div class="relative">
                <input v-model="form.amount" type="number" required class="input-field pl-12 font-bold text-slate-800 tabular-nums" placeholder="0.00" />
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">SAR</span>
              </div>
            </div>
            <div v-if="!isEditing">
              <label class="block text-sm font-bold text-slate-700 mb-1.5">الدفعات</label>
              <select v-model="form.frequency" required class="input-field bg-slate-50 text-slate-700">
                <option value="1">سنوي (دفعة واحدة)</option>
                <option value="2">نصف سنوي (دفعتين)</option>
                <option value="4">ربع سنوي (4 دفعات)</option>
                <option value="12">شهري (12 دفعة)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="md:row-span-2 flex flex-col h-full">
          <label class="block text-sm font-bold text-slate-700 mb-2 flex justify-between items-center">
            <span>الوحدات المشمولة</span>
            <span class="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">{{ form.selected_units.length }} مختار</span>
          </label>
          
          <div class="border border-slate-200 rounded-xl p-2 h-[280px] overflow-y-auto bg-slate-50 space-y-2 flex-1 scrollbar-thin">
            <label 
              v-for="u in allUnitsForSelection" 
              :key="u.id" 
              class="group flex items-center gap-3 p-3 rounded-xl border bg-white cursor-pointer transition-all duration-200 hover:shadow-sm"
              :class="form.selected_units.includes(u.id) ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300'"
            >
              <input type="checkbox" :value="u.id" v-model="form.selected_units" class="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 transition" />
              <div class="flex-1">
                <div class="font-bold text-slate-800 text-sm">{{ u.name }}</div>
                <div class="flex justify-between items-center mt-1">
                  <span class="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{{ u.type }}</span>
                  <span class="text-xs font-bold text-emerald-600 tabular-nums dir-ltr">{{ Number(u.price).toLocaleString() }} ريال</span>
                </div>
              </div>
            </label>
            
            <div v-if="allUnitsForSelection.length === 0" class="text-center p-8 text-slate-400 text-sm">
              لا توجد وحدات متاحة حالياً
            </div>
          </div>
        </div>

        <div class="md:col-span-2 flex gap-3 pt-2">
          <button 
            type="submit" 
            :disabled="loading" 
            class="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 font-bold shadow-md shadow-indigo-200 transition active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="loading" class="animate-spin">⏳</span>
            {{ loading ? 'جاري المعالجة...' : (isEditing ? 'حفظ التعديلات' : 'توقيع العقد وإصدار الفواتير 🚀') }}
          </button>
          
          <button 
            v-if="isEditing" 
            @click="cancelEdit" 
            type="button" 
            class="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl hover:bg-slate-200 font-bold transition border border-slate-200"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200 min-h-[300px]">
      <div class="p-4 border-b bg-slate-50 flex justify-between items-center sticky top-0 z-10">
        <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span>🗂️</span> أرشيف العقود <span class="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">{{ contracts.length }}</span>
        </h2>
        <button @click="fetchData" class="text-indigo-600 text-sm font-bold hover:underline flex items-center gap-1">
          <span>🔄</span> تحديث
        </button>
      </div>
      
      <div class="overflow-x-auto max-h-[600px]">
        <table class="min-w-full divide-y divide-slate-100">
          <thead class="bg-slate-50/90 backdrop-blur sticky top-0 z-10 shadow-sm text-slate-500 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th class="px-6 py-3 text-right">المستأجر</th>
              <th class="px-6 py-3 text-right">الوحدات</th>
              <th class="px-6 py-3 text-right">الفترة</th>
              <th class="px-6 py-3 text-right">القيمة الإجمالية</th>
              <th class="px-6 py-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 bg-white">
            <tr v-for="c in contracts" :key="c.id" class="transition-colors odd:bg-white even:bg-slate-50/40 hover:bg-indigo-50/30 group">
              
              <td class="px-6 py-4">
                <div class="font-bold text-slate-800">{{ c.tenants?.name }}</div>
                <div class="text-xs text-slate-400 mt-0.5 font-mono">#{{ c.id.slice(0,6) }}</div>
              </td>

              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1.5">
                  <span v-for="cu in c.contract_units" :key="cu.id" class="bg-white text-slate-600 px-2 py-1 rounded text-xs font-bold border border-slate-200 shadow-sm flex items-center gap-1">
                    <span class="text-indigo-500">🏠</span> {{ cu.units?.name }}
                  </span>
                </div>
              </td>

              <td class="px-6 py-4">
                <div class="text-sm text-slate-600 flex flex-col gap-0.5">
                  <span class="font-mono tabular-nums">{{ c.start_date }}</span>
                  <span class="text-[10px] text-slate-400 text-center font-bold">إلى</span>
                  <span class="font-mono tabular-nums">{{ c.end_date }}</span>
                </div>
              </td>

              <td class="px-6 py-4 text-right">
                <div class="text-emerald-700 font-extrabold text-lg tabular-nums tracking-tight dir-ltr">
                  {{ Number(c.amount).toLocaleString() }} <span class="text-xs font-medium text-slate-400">SAR</span>
                </div>
              </td>

              <td class="px-6 py-4">
                <div class="flex justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button @click="openContractPDF(c)" class="icon-btn" title="طباعة العقد">📄</button>
                  <button @click="renewContract(c)" class="icon-btn icon-success" title="تجديد العقد">🔄</button>
                  <button @click="editContract(c)" class="icon-btn icon-info" title="تعديل">✏️</button>
                  <button @click="deleteContract(c.id)" class="icon-btn icon-danger" title="حذف">🗑️</button>
                </div>
              </td>
            </tr>
            <tr v-if="contracts.length === 0">
              <td colspan="5" class="p-10 text-center text-slate-400">
                <span class="text-4xl block mb-2 opacity-50">📂</span>
                لا توجد عقود مسجلة حتى الآن
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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

const supabase = createClient(import.meta.env.NUXT_PUBLIC_SUPABASE_URL, import.meta.env.NUXT_PUBLIC_SUPABASE_KEY)
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
    
    // منطق التقسيم الدقيق
    const baseAmount = Math.floor(totalAmount / parts) 
    const remainder = totalAmount % parts
    
    let d = new Date(newStart)
    const invs = []
    
    for (let i = 0; i < parts; i++) {
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
  if (form.value.selected_units.length === 0) { alert('يجب اختيار وحدة واحدة على الأقل!'); return }
  loading.value = true
  try {
    if (isEditing.value) {
      await supabase.from('contracts').update({ tenant_id: form.value.tenant_id, start_date: form.value.start_date, end_date: form.value.end_date, amount: form.value.amount }).eq('id', editingId.value)
      if (originalUnitIds.value.length > 0) await supabase.from('units').update({ status: 'شاغرة' }).in('id', originalUnitIds.value)
      await supabase.from('contract_units').delete().eq('contract_id', editingId.value)
      const newLinks = form.value.selected_units.map(uid => ({ contract_id: editingId.value, unit_id: uid }))
      await supabase.from('contract_units').insert(newLinks)
      await supabase.from('units').update({ status: 'مؤجرة' }).in('id', form.value.selected_units)
      alert('تم تحديث البيانات بنجاح')
    } else {
      const { data: contract, error: cErr } = await supabase.from('contracts').insert([{ tenant_id: form.value.tenant_id, start_date: form.value.start_date, end_date: form.value.end_date, amount: form.value.amount }]).select().single()
      if (cErr) throw cErr
      const links = form.value.selected_units.map(uid => ({ contract_id: contract.id, unit_id: uid }))
      await supabase.from('contract_units').insert(links)
      await supabase.from('units').update({ status: 'مؤجرة' }).in('id', form.value.selected_units)
      
      const totalAmount = Number(form.value.amount)
      const parts = Number(form.value.frequency)
      
      const baseAmount = Math.floor(totalAmount / parts) 
      const remainder = totalAmount % parts
      
      let d = new Date(form.value.start_date)
      const invs = []
      
      for (let i = 0; i < parts; i++) {
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

      await supabase.from('invoices').insert(invs)
      alert('✅ تم توقيع العقد وإصدار الفواتير!')
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
  if (!confirm('⚠️ تحذير: حذف العقد سيحذف جميع الفواتير والسجلات المرتبطة به.\nهل أنت متأكد؟')) return
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
.input-field {
  @apply w-full h-[45px] rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm;
}

/* Scrollbar أنيق للقوائم */
.scrollbar-thin::-webkit-scrollbar { width: 6px; }
.scrollbar-thin::-webkit-scrollbar-track { background: #f1f5f9; }
.scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

/* أزرار الإجراءات */
.icon-btn { @apply p-2 rounded-full border transition bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:shadow-sm; }
.icon-success { @apply hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50; }
.icon-info { @apply hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50; }
.icon-danger { @apply hover:text-red-700 hover:border-red-200 hover:bg-red-50; }
</style>