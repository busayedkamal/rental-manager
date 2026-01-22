<template>
  <div class="space-y-6 relative font-sans" dir="rtl">
    
    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">💸 سجل التحصيل اليومي</h1>
        <p class="text-gray-500 text-sm mt-1">تتبع الدفعات النقدية والبنكية المرتبطة بالعقود</p>
      </div>
      
      <div class="flex gap-3">
        <div class="bg-green-50 border border-green-200 px-4 py-2 rounded-lg text-center">
          <span class="block text-xs text-green-600 font-bold">مجموع التحصيل (الكل)</span>
          <span class="block text-xl font-bold text-green-700">{{ totalCollected.toLocaleString() }} ريال</span>
        </div>
        <button @click="openModal" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition flex items-center gap-2">
          <span>+</span> تسجيل دفعة جديدة
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">رقم الإيصال</th>
            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">المستأجر / العقد</th>
            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">تاريخ التحصيل</th>
            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">مبلغ الدفعة</th>
            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">طريقة الدفع</th>
            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">المتبقي من العقد</th>
            <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">خيارات</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="payment in payments" :key="payment.id" class="hover:bg-gray-50 transition">
            <td class="px-6 py-4 text-sm text-gray-400">#{{ payment.receipt_number }}</td>
            <td class="px-6 py-4">
              <div class="font-bold text-gray-800">{{ payment.tenants?.name }}</div>
              <div class="text-xs text-indigo-600 mt-1">عقد رقم: {{ payment.contracts?.id?.slice(0,8) }}...</div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-700">
              📅 {{ payment.payment_date }}
            </td>
            <td class="px-6 py-4">
              <span class="text-green-700 font-bold text-lg">+ {{ Number(payment.amount_paid).toLocaleString() }}</span>
            </td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 rounded text-xs border" 
                :class="{
                  'bg-blue-50 text-blue-700 border-blue-200': payment.payment_method === 'تحويل بنكي',
                  'bg-yellow-50 text-yellow-700 border-yellow-200': payment.payment_method === 'نقدي',
                  'bg-purple-50 text-purple-700 border-purple-200': payment.payment_method === 'شبكة'
                }">
                {{ payment.payment_method }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <div class="h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full bg-green-500" :style="`width: ${calculateProgress(payment.contract_id)}%`"></div>
                </div>
                <span class="text-xs text-gray-500">{{ calculateRemaining(payment.contract_id).toLocaleString() }} متبقي</span>
              </div>
            </td>
            <td class="px-6 py-4 text-center">
              <button @click="deletePayment(payment)" class="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50" title="حذف السجل والتراجع عن التأثير المالي">🗑️</button>
            </td>
          </tr>
          <tr v-if="payments.length === 0">
            <td colspan="7" class="p-8 text-center text-gray-400">لا توجد عمليات تحصيل مسجلة بعد.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        <div class="bg-indigo-600 p-4 flex justify-between items-center text-white">
          <h3 class="text-lg font-bold">📥 تسجيل تحصيل جديد</h3>
          <button @click="closeModal" class="hover:bg-indigo-700 p-1 rounded-full">✕</button>
        </div>
        
        <form @submit.prevent="submitPayment" class="p-6 space-y-5">
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">اختر العقد / المستأجر</label>
            <select v-model="form.contract_id" @change="onContractSelect" required class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
              <option disabled value="">-- اختر من القائمة --</option>
              <option v-for="c in contracts" :key="c.id" :value="c.id">
                {{ c.tenants?.name }} | إجمالي: {{ Number(c.amount).toLocaleString() }}
              </option>
            </select>
          </div>

          <div v-if="selectedContractStats" class="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-3 gap-2 text-center">
            <div>
              <span class="block text-xs text-gray-500">قيمة العقد</span>
              <span class="font-bold text-gray-800">{{ selectedContractStats.total.toLocaleString() }}</span>
            </div>
            <div>
              <span class="block text-xs text-green-600">تم تحصيله</span>
              <span class="font-bold text-green-700">{{ selectedContractStats.paid.toLocaleString() }}</span>
            </div>
            <div>
              <span class="block text-xs text-red-500">المتبقي للسداد</span>
              <span class="font-bold text-red-600">{{ selectedContractStats.remaining.toLocaleString() }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">المبلغ المحصل</label>
              <input 
                v-model="form.amount_paid" 
                type="number" 
                step="0.01" 
                class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none font-bold text-green-700"
                placeholder="0.00" 
                required 
              />
              
              <p v-if="selectedContractStats && form.amount_paid > selectedContractStats.remaining" class="text-xs text-blue-600 mt-1 font-bold bg-blue-50 p-1 rounded">
                💡 يوجد فائض: {{ (form.amount_paid - selectedContractStats.remaining).toLocaleString() }} ريال سيضاف للرصيد
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ التحصيل</label>
              <input v-model="form.payment_date" type="date" required class="w-full border border-gray-300 rounded-lg p-2.5 outline-none" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">طريقة الدفع</label>
              <select v-model="form.payment_method" class="w-full border border-gray-300 rounded-lg p-2.5 bg-white outline-none">
                <option>تحويل بنكي</option>
                <option>نقدي</option>
                <option>شبكة</option>
                <option>شيك</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ملاحظات (اختياري)</label>
              <input v-model="form.notes" type="text" class="w-full border border-gray-300 rounded-lg p-2.5 outline-none" placeholder="..." />
            </div>
          </div>

          <button 
            type="submit" 
            :disabled="loading"
            class="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
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

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)

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

const totalCollected = computed(() => {
  return payments.value.reduce((sum, p) => sum + Number(p.amount_paid), 0)
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

    // 1. تسجيل الدفعة
    const { error: payError } = await supabase.from('payments').insert([form.value])
    if (payError) throw payError

    // 2. تحديث الفواتير
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

    // 3. تحديث الرصيد
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

// 👇 دالة الحذف الذكية (المعدلة: الفواتير أولاً ثم الرصيد)
const deletePayment = async (payment) => {
  if(!confirm(`⚠️ تحذير هام!\n\nأنت على وشك حذف دفعة بقيمة (${Number(payment.amount_paid).toLocaleString()}) ريال.\n\nسيقوم النظام بـ:\n1. إلغاء سداد الفواتير المرتبطة بهذه الدفعة أولاً.\n2. خصم أي مبلغ متبقي (الفائض) من رصيد المستأجر.\n\nهل أنت متأكد تماماً؟`)) return
  
  loading.value = true
  try {
    let amountToRevert = Number(payment.amount_paid) // المبلغ الذي نريد استرجاعه (مثلاً 15000)

    // 1️⃣ الخطوة الأولى (الأهم): استرجاع المبلغ من الفواتير المدفوعة
    // نجلب الفواتير التي تم الدفع فيها لهذا العقد
    const { data: paidInvoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('contract_id', payment.contract_id)
      .gt('paid_amount', 0) // فقط الفواتير التي دُفع فيها شيء
      .order('due_date', { ascending: false }) // نبدأ بالأحدث

    if (paidInvoices) {
      for (const inv of paidInvoices) {
        if (amountToRevert <= 0) break // انتهى المبلغ المطلوب استرجاعه

        // كم يمكننا أن نخصم من هذه الفاتورة؟ (إما كل المدفوع فيها، أو المتبقي من مبلغنا)
        const deduction = Math.min(inv.paid_amount, amountToRevert)
        
        const newPaid = inv.paid_amount - deduction
        let newStatus = 'غير مدفوع'
        if (newPaid > 0 && newPaid < inv.amount) newStatus = 'مدفوع جزئياً'
        else if (newPaid >= inv.amount) newStatus = 'مدفوع' // حالة نادرة لو بقي مبلغ

        // تحديث الفاتورة
        await supabase.from('invoices').update({
          paid_amount: newPaid,
          status: newStatus,
          // إذا أصبح المدفوع 0، نمسح بيانات الدفع
          payment_date: newPaid === 0 ? null : inv.payment_date,
          payment_method: newPaid === 0 ? null : inv.payment_method
        }).eq('id', inv.id)

        // نخصم ما استرجعناه من المبلغ الكلي
        amountToRevert -= deduction
      }
    }

    // 2️⃣ الخطوة الثانية: المبلغ المتبقي نخصمه من رصيد المستأجر (الفائض)
    // إذا بقي مبلغ في amountToRevert (مثلاً 3000)، فهذا يعني أنه كان فائضاً وتمت إضافته للرصيد
    if (amountToRevert > 0) {
      const { data: tenant } = await supabase.from('tenants').select('balance').eq('id', payment.tenant_id).single()
      const currentBalance = Number(tenant?.balance || 0)
      
      // نخصم المتبقي من الرصيد الحالي
      await supabase.from('tenants').update({ 
        balance: currentBalance - amountToRevert 
      }).eq('id', payment.tenant_id)
    }

    // 3️⃣ الخطوة الثالثة: حذف سجل الدفعة من الجدول
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

onMounted(() => fetchData())
</script>