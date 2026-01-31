<template>
  <div class="space-y-8 relative font-sans text-slate-800" dir="rtl">
    
    <div class="flex flex-col gap-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">💸 سجل التحصيل اليومي</h1>
          <p class="text-slate-500 text-sm mt-1">تتبع التدفقات النقدية والعمليات البنكية بدقة</p>
        </div>
        <button @click="openModal" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm shadow-indigo-200 transition active:scale-95 flex items-center gap-2">
          <span>+</span> تسجيل دفعة جديدة
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-slate-500 mb-1">إجمالي التحصيل (الكل)</p>
            <p class="text-2xl font-bold text-slate-900 tabular-nums">{{ totalCollected.toLocaleString() }} <span class="text-xs font-normal text-slate-400">ريال</span></p>
          </div>
          <div class="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">💰</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-slate-500 mb-1">تحصيل اليوم</p>
            <p class="text-2xl font-bold text-indigo-900 tabular-nums">{{ todayCollected.toLocaleString() }} <span class="text-xs font-normal text-slate-400">ريال</span></p>
          </div>
          <div class="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">📅</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-slate-500 mb-1">عدد العمليات</p>
            <p class="text-2xl font-bold text-slate-900 tabular-nums">{{ payments.length }}</p>
          </div>
          <div class="h-10 w-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xl">🧾</div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
      <div class="overflow-x-auto max-h-[600px]">
        <table class="min-w-full divide-y divide-slate-100">
          <thead class="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th class="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">الإيصال</th>
              <th class="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">المستأجر / العقد</th>
              <th class="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">التاريخ</th>
              <th class="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">المبلغ</th>
              <th class="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">طريقة الدفع</th>
              <th class="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">حالة العقد</th>
              <th class="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 bg-white">
            <tr v-for="payment in payments" :key="payment.id" class="hover:bg-slate-50/80 transition-colors group">
              <td class="px-6 py-4 text-xs font-mono text-slate-400">#{{ payment.receipt_number }}</td>
              
              <td class="px-6 py-4">
                <div class="font-bold text-slate-800 text-sm">{{ payment.tenants?.name }}</div>
                <div class="text-xs text-indigo-500 mt-0.5 font-mono">عقد: {{ payment.contracts?.id?.slice(0,8) }}...</div>
              </td>
              
              <td class="px-6 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">
                {{ new Date(payment.payment_date).toLocaleDateString('ar-SA') }}
              </td>
              
              <td class="px-6 py-4 text-right dir-ltr">
                <span class="text-emerald-700 font-bold text-base tabular-nums tracking-tight">+ {{ Number(payment.amount_paid).toLocaleString() }}</span>
              </td>
              
              <td class="px-6 py-4">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border" 
                  :class="getMethodBadge(payment.payment_method)">
                  {{ payment.payment_method }}
                </span>
              </td>
              
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500" 
                         :class="getProgressColor(payment.contract_id)"
                         :style="`width: ${calculateProgress(payment.contract_id)}%`">
                    </div>
                  </div>
                  <span class="text-[10px] font-bold text-slate-400 tabular-nums">
                    متبقي {{ calculateRemaining(payment.contract_id).toLocaleString() }}
                  </span>
                </div>
              </td>
              
              <td class="px-6 py-4 text-center">
                <button 
                  @click="deletePayment(payment)" 
                  class="text-slate-300 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100" 
                  title="حذف وتراجع"
                >
                  <span class="text-lg">🗑️</span>
                </button>
              </td>
            </tr>
            <tr v-if="payments.length === 0">
              <td colspan="7" class="p-12 text-center text-slate-400 bg-slate-50/30">
                <span class="text-4xl block mb-2 opacity-50">📭</span>
                لا توجد عمليات تحصيل مسجلة بعد.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="closeModal"></div>
      
      <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 relative z-10">
        <div class="bg-indigo-600 p-5 flex justify-between items-center text-white">
          <h3 class="text-lg font-bold flex items-center gap-2">
            <span>📥</span> تسجيل تحصيل جديد
          </h3>
          <button @click="closeModal" class="hover:bg-indigo-700 p-1.5 rounded-full transition bg-white/10 hover:bg-white/20">✕</button>
        </div>
        
        <form @submit.prevent="submitPayment" class="p-6 space-y-6">
          
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1.5">اختر العقد / المستأجر</label>
            <select v-model="form.contract_id" @change="onContractSelect" required class="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-slate-700 transition">
              <option disabled value="">-- اختر من القائمة --</option>
              <option v-for="c in contracts" :key="c.id" :value="c.id">
                {{ c.tenants?.name }} | إجمالي: {{ Number(c.amount).toLocaleString() }}
              </option>
            </select>
          </div>

          <div v-if="selectedContractStats" class="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center">
            <div>
              <span class="block text-[10px] font-bold text-slate-400 uppercase">قيمة العقد</span>
              <span class="font-bold text-slate-800 text-sm tabular-nums">{{ selectedContractStats.total.toLocaleString() }}</span>
            </div>
            <div>
              <span class="block text-[10px] font-bold text-slate-400 uppercase">تم تحصيله</span>
              <span class="font-bold text-emerald-600 text-sm tabular-nums">{{ selectedContractStats.paid.toLocaleString() }}</span>
            </div>
            <div>
              <span class="block text-[10px] font-bold text-slate-400 uppercase">المتبقي</span>
              <span class="font-bold text-rose-600 text-sm tabular-nums">{{ selectedContractStats.remaining.toLocaleString() }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">المبلغ المحصل</label>
              <div class="relative">
                <input 
                  v-model="form.amount_paid" 
                  type="number" 
                  step="0.01" 
                  class="w-full border border-slate-300 rounded-xl p-3 pr-4 pl-12 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-bold text-emerald-700 text-lg tabular-nums transition"
                  placeholder="0.00" 
                  required 
                />
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">SAR</span>
              </div>
              
              <div v-if="selectedContractStats && form.amount_paid > selectedContractStats.remaining" class="mt-2 flex items-start gap-2 bg-blue-50 text-blue-700 p-2.5 rounded-lg border border-blue-100 text-xs font-bold">
                <span class="text-base">💡</span>
                <p>يوجد فائض: <span class="tabular-nums underline decoration-blue-300">{{ (form.amount_paid - selectedContractStats.remaining).toLocaleString() }}</span> سيضاف للرصيد</p>
              </div>
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">تاريخ التحصيل</label>
              <input v-model="form.payment_date" type="date" required class="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-700 transition" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">طريقة الدفع</label>
              <select v-model="form.payment_method" class="w-full border border-slate-300 rounded-xl p-3 bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition">
                <option>تحويل بنكي</option>
                <option>نقدي</option>
                <option>شبكة</option>
                <option>شيك</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">ملاحظات (اختياري)</label>
              <input v-model="form.notes" type="text" class="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="..." />
            </div>
          </div>

          <button 
            type="submit" 
            :disabled="loading"
            class="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="loading" class="animate-spin">⌛</span>
            {{ loading ? 'جاري الحفظ...' : 'تأكيد وحفظ الدفعة ✅' }}
          </button>

        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { createClient } from '@supabase/supabase-js'
import { useRoute } from 'vue-router'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)
const route = useRoute()

const payments = ref([])
const contracts = ref([])
const showModal = ref(false)
const loading = ref(false)

const form = ref({
  contract_id: '',
  tenant_id: '', 
  amount_paid: '',
  payment_date: new Date().toISOString().split('T')[0],
  payment_method: 'تحويل بنكي',
  notes: ''
})

const selectedContractStats = ref(null)

// دالة لجلب ألوان الشارات
const getMethodBadge = (method) => {
  const styles = {
    'تحويل بنكي': 'bg-blue-50 text-blue-700 border-blue-200',
    'نقدي': 'bg-amber-50 text-amber-700 border-amber-200',
    'شبكة': 'bg-violet-50 text-violet-700 border-violet-200',
    'شيك': 'bg-slate-50 text-slate-700 border-slate-200'
  }
  return styles[method] || styles['شيك']
}

// دالة ألوان شريط التقدم
const getProgressColor = (contractId) => {
  const percent = calculateProgress(contractId)
  if (percent >= 100) return 'bg-emerald-500' // مكتمل
  if (percent > 50) return 'bg-blue-500' // جيد
  if (percent > 20) return 'bg-amber-400' // متوسط
  return 'bg-rose-500' // قليل
}

const fetchData = async () => {
  const { data: pData } = await supabase
    .from('payments')
    .select(`*, contracts(id, amount), tenants(name)`)
    .order('created_at', { ascending: false })
  payments.value = pData || []

  const { data: cData } = await supabase
    .from('contracts')
    .select(`*, tenants(id, name)`)
    .eq('status', 'ساري') 
  contracts.value = cData || []
}

// حساب إجمالي التحصيل
const totalCollected = computed(() => {
  return payments.value.reduce((sum, p) => sum + Number(p.amount_paid), 0)
})

// حساب تحصيل اليوم فقط
const todayCollected = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return payments.value
    .filter(p => p.payment_date === today)
    .reduce((sum, p) => sum + Number(p.amount_paid), 0)
})

const onContractSelect = () => {
  const contract = contracts.value.find(c => c.id === form.value.contract_id)
  if (!contract) return

  form.value.tenant_id = contract.tenants.id

  const previousPayments = payments.value
    .filter(p => p.contract_id === contract.id)
    .reduce((sum, p) => sum + Number(p.amount_paid), 0)

  selectedContractStats.value = {
    total: contract.amount,
    paid: previousPayments,
    remaining: Math.max(0, contract.amount - previousPayments)
  }
}

const submitPayment = async () => {
  loading.value = true
  try {
    const contract = contracts.value.find(c => c.id === form.value.contract_id)
    const paidAmount = Number(form.value.amount_paid)
    let remainingToAllocate = paidAmount 
    
    const previousPaid = payments.value
      .filter(p => p.contract_id === form.value.contract_id)
      .reduce((sum, p) => sum + Number(p.amount_paid), 0)
    
    const remainingContract = contract.amount - previousPaid
    let balanceToAdd = 0
    let confirmMsg = '✅ تم تسجيل الدفعة وتحديث الفواتير بنجاح!'

    if (paidAmount > remainingContract) {
      balanceToAdd = paidAmount - remainingContract
      if(!confirm(`⚠️ المبلغ المدفوع (${paidAmount}) أكبر من المتبقي في العقد (${remainingContract}).\n\nسيتم سداد جميع الفواتير، وإضافة الفارق (${balanceToAdd}) كرصيد للمستأجر.\n\nهل توافق؟`)) {
        loading.value = false
        return
      }
      confirmMsg = `✅ تم السداد وإضافة ${balanceToAdd} ريال لرصيد المستأجر.`
    }

    const { error: payError } = await supabase.from('payments').insert([form.value])
    if (payError) throw payError

    const { data: unpaidInvoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('contract_id', form.value.contract_id)
      .neq('status', 'مدفوع') 
      .order('due_date', { ascending: true })

    if (unpaidInvoices) {
      for (const inv of unpaidInvoices) {
        if (remainingToAllocate <= 0) break 

        const alreadyPaid = inv.paid_amount || 0
        const needed = inv.amount - alreadyPaid

        if (remainingToAllocate >= needed) {
          await supabase.from('invoices').update({
            status: 'مدفوع',
            paid_amount: inv.amount,
            payment_date: form.value.payment_date,
            payment_method: form.value.payment_method
          }).eq('id', inv.id)
          remainingToAllocate -= needed
        } else {
          await supabase.from('invoices').update({
            status: 'مدفوع جزئياً',
            paid_amount: alreadyPaid + remainingToAllocate,
            payment_date: form.value.payment_date,
            payment_method: form.value.payment_method
          }).eq('id', inv.id)
          remainingToAllocate = 0
        }
      }
    }

    if (balanceToAdd > 0) {
      const { data: tenant } = await supabase.from('tenants').select('balance').eq('id', form.value.tenant_id).single()
      const currentBalance = Number(tenant?.balance || 0)
      
      await supabase.from('tenants').update({ 
        balance: currentBalance + balanceToAdd 
      }).eq('id', form.value.tenant_id)
    }
    
    alert(confirmMsg)
    closeModal()
    fetchData() 
  } catch (e) {
    alert('خطأ: ' + e.message)
  } finally {
    loading.value = false
  }
}

const deletePayment = async (payment) => {
  if(!confirm(`⚠️ تحذير هام!\n\nأنت على وشك حذف دفعة بقيمة (${Number(payment.amount_paid).toLocaleString()}) ريال.\n\nسيقوم النظام بـ:\n1. إلغاء سداد الفواتير المرتبطة بهذه الدفعة أولاً.\n2. خصم أي مبلغ متبقي (الفائض) من رصيد المستأجر.\n\nهل أنت متأكد تماماً؟`)) return
  
  loading.value = true
  try {
    let amountToRevert = Number(payment.amount_paid)

    const { data: paidInvoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('contract_id', payment.contract_id)
      .gt('paid_amount', 0)
      .order('due_date', { ascending: false })

    if (paidInvoices) {
      for (const inv of paidInvoices) {
        if (amountToRevert <= 0) break

        const deduction = Math.min(inv.paid_amount, amountToRevert)
        
        const newPaid = inv.paid_amount - deduction
        let newStatus = 'غير مدفوع'
        if (newPaid > 0 && newPaid < inv.amount) newStatus = 'مدفوع جزئياً'
        else if (newPaid >= inv.amount) newStatus = 'مدفوع'

        await supabase.from('invoices').update({
          paid_amount: newPaid,
          status: newStatus,
          payment_date: newPaid === 0 ? null : inv.payment_date,
          payment_method: newPaid === 0 ? null : inv.payment_method
        }).eq('id', inv.id)

        amountToRevert -= deduction
      }
    }

    if (amountToRevert > 0) {
      const { data: tenant } = await supabase.from('tenants').select('balance').eq('id', payment.tenant_id).single()
      const currentBalance = Number(tenant?.balance || 0)
      
      await supabase.from('tenants').update({ 
        balance: currentBalance - amountToRevert 
      }).eq('id', payment.tenant_id)
    }

    const { error } = await supabase.from('payments').delete().eq('id', payment.id)
    if (error) throw error

    alert('✅ تم حذف الدفعة وتصحيح الحسابات (الفواتير والرصيد) بنجاح.')
    fetchData()

  } catch (e) {
    alert('حدث خطأ أثناء الحذف: ' + e.message)
  } finally {
    loading.value = false
  }
}

const calculateRemaining = (contractId) => {
  const contract = contracts.value.find(c => c.id === contractId) || payments.value.find(p => p.contract_id === contractId)?.contracts
  if (!contract) return 0
  const totalPaid = payments.value.filter(p => p.contract_id === contractId).reduce((sum, p) => sum + Number(p.amount_paid), 0)
  return Math.max(0, contract.amount - totalPaid)
}

const calculateProgress = (contractId) => {
  const contract = contracts.value.find(c => c.id === contractId) || payments.value.find(p => p.contract_id === contractId)?.contracts
  if (!contract) return 0
  const totalPaid = payments.value.filter(p => p.contract_id === contractId).reduce((sum, p) => sum + Number(p.amount_paid), 0)
  return Math.min(100, (totalPaid / contract.amount) * 100)
}

const openModal = () => { showModal.value = true }
const closeModal = () => { 
  showModal.value = false; 
  selectedContractStats.value = null; 
  form.value = { contract_id: '', tenant_id: '', amount_paid: '', payment_date: new Date().toISOString().split('T')[0], payment_method: 'تحويل بنكي', notes: '' }
}

onMounted(async () => {
  await fetchData()
  
  if (route.query.contractId) {
    const targetId = route.query.contractId
    const exists = contracts.value.find(c => c.id === targetId)
    
    if (exists) {
      form.value.contract_id = targetId
      onContractSelect()
      showModal.value = true
    }
  }
})
</script>