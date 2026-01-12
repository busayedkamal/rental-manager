<template>
  <div class="space-y-6 relative">
    
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">💰 سجل المدفوعات والتحصيل</h1>
        <p class="text-gray-500 text-sm mt-1">تتبع التدفقات المالية وتفاصيل السداد</p>
      </div>
      <button @click="fetchInvoices" class="flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition font-bold">
        <span>🔄</span> تحديث البيانات
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white p-5 rounded-xl shadow-sm border-r-4 border-indigo-500">
        <div class="text-gray-500 text-sm font-medium">عدد الفواتير الكلي</div>
        <div class="text-3xl font-bold text-gray-800 mt-1">{{ invoices.length }}</div>
      </div>
      <div class="bg-white p-5 rounded-xl shadow-sm border-r-4 border-red-500">
        <div class="text-gray-500 text-sm font-medium">مستحقات (غير محصلة)</div>
        <div class="text-3xl font-bold text-red-600 mt-1">{{ totalUnpaid.toLocaleString() }} <span class="text-sm">ريال</span></div>
      </div>
      <div class="bg-white p-5 rounded-xl shadow-sm border-r-4 border-green-500">
        <div class="text-gray-500 text-sm font-medium">الإيرادات المحصلة</div>
        <div class="text-3xl font-bold text-green-600 mt-1">{{ totalPaid.toLocaleString() }} <span class="text-sm">ريال</span></div>
      </div>
    </div>

    <div class="flex gap-2 overflow-x-auto pb-2">
      <button 
        @click="currentFilter = 'all'" 
        class="px-4 py-2 rounded-full text-sm font-bold transition-all border"
        :class="currentFilter === 'all' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'"
      >
        📋 الكل
      </button>
      
      <button 
        @click="currentFilter = 'overdue'" 
        class="px-4 py-2 rounded-full text-sm font-bold transition-all border flex items-center gap-1"
        :class="currentFilter === 'overdue' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-red-50'"
      >
        ⚠️ متأخرات
        <span v-if="counts.overdue > 0" class="bg-white/20 text-xs px-1.5 py-0.5 rounded-full ml-1">{{ counts.overdue }}</span>
      </button>

      <button 
        @click="currentFilter = 'pending'" 
        class="px-4 py-2 rounded-full text-sm font-bold transition-all border flex items-center gap-1"
        :class="currentFilter === 'pending' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-orange-50'"
      >
        ⏳ مستحق قريباً
        <span v-if="counts.pending > 0" class="bg-white/20 text-xs px-1.5 py-0.5 rounded-full ml-1">{{ counts.pending }}</span>
      </button>

      <button 
        @click="currentFilter = 'paid'" 
        class="px-4 py-2 rounded-full text-sm font-bold transition-all border flex items-center gap-1"
        :class="currentFilter === 'paid' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-green-50'"
      >
        ✅ مدفوع
        <span v-if="counts.paid > 0" class="bg-white/20 text-xs px-1.5 py-0.5 rounded-full ml-1">{{ counts.paid }}</span>
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50 text-xs text-gray-500 uppercase font-medium">
          <tr>
            <th class="px-6 py-4 text-right">المستأجر / الوحدة</th>
            <th class="px-6 py-4 text-right">الاستحقاق</th>
            <th class="px-6 py-4 text-right">المبلغ (المطلوب / المدفوع)</th>
            <th class="px-6 py-4 text-right">الحالة</th>
            <th class="px-6 py-4 text-center">إجراءات الدفع</th>
            <th class="px-6 py-4 text-center">خيارات</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="inv in filteredInvoices" :key="inv.id" class="hover:bg-gray-50 transition-colors">
            
            <td class="px-6 py-4">
              <div class="font-bold text-gray-800">{{ inv.tenants?.name }}</div>
              <div class="text-xs text-gray-500 mt-1">🏠 {{ inv.units?.name }}</div>
            </td>

            <td class="px-6 py-4">
              <div :class="isOverdue(inv) ? 'text-red-600 font-bold' : 'text-gray-600'">
                {{ inv.due_date }}
              </div>
              <div v-if="isOverdue(inv)" class="text-[10px] text-red-500 mt-1">متأخر عن السداد</div>
            </td>

            <td class="px-6 py-4">
              <div class="text-gray-800 font-bold">{{ Number(inv.amount).toLocaleString() }} <span class="text-xs font-normal">إجمالي</span></div>
              <div v-if="inv.paid_amount > 0" class="text-green-600 text-sm font-bold mt-1">
                ✅ وصل: {{ Number(inv.paid_amount).toLocaleString() }}
              </div>
              <div v-if="inv.amount - inv.paid_amount > 0" class="text-red-500 text-xs mt-1">
                 متبقي: {{ Number(inv.amount - (inv.paid_amount || 0)).toLocaleString() }}
              </div>
            </td>

            <td class="px-6 py-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                :class="{
                  'bg-green-100 text-green-800 border-green-200': inv.status === 'مدفوع',
                  'bg-yellow-100 text-yellow-800 border-yellow-200': inv.status === 'مدفوع جزئياً',
                  'bg-red-100 text-red-800 border-red-200': inv.status === 'غير مدفوع'
                }">
                {{ inv.status }}
              </span>
              <div v-if="inv.payment_method" class="text-[10px] text-gray-400 mt-1">💳 {{ inv.payment_method }}</div>
            </td>

            <td class="px-6 py-4 text-center">
              <button 
                v-if="inv.status !== 'مدفوع'"
                @click="openPaymentModal(inv)"
                class="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-700 shadow-sm transition-transform active:scale-95 flex items-center gap-1 mx-auto"
              >
                <span>💵</span> 
                {{ inv.status === 'مدفوع جزئياً' ? 'سداد المتبقي' : 'تسجيل دفع' }}
              </button>
              <span v-else class="text-green-500 text-xl">✅</span>
            </td>

            <td class="px-6 py-4 text-center">
              <div class="flex justify-center gap-2">
                <button @click="openEditModal(inv)" class="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100">✏️</button>
                <button @click="deleteInvoice(inv.id)" class="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-gray-100">🗑️</button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredInvoices.length === 0">
            <td colspan="6" class="p-8 text-center text-gray-400">
              لا توجد فواتير في هذه القائمة حالياً.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showPaymentModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" dir="rtl">
      <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100">
        <div class="bg-indigo-600 p-4 flex justify-between items-center text-white">
          <h3 class="text-lg font-bold">💵 تسجيل دفعة مالية</h3>
          <button @click="showPaymentModal = false" class="hover:bg-indigo-700 p-1 rounded-full">✕</button>
        </div>
        <div class="p-6 space-y-4">
          <div class="bg-gray-50 p-3 rounded-lg border text-center text-sm text-gray-600">
            المبلغ المتبقي على المستأجر: <span class="font-bold text-red-600 text-lg block">{{ Number(paymentForm.remaining).toLocaleString() }} ريال</span>
          </div>
          <form @submit.prevent="confirmPayment" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">المبلغ المستلم الآن</label>
              <input v-model="paymentForm.amountToPay" type="number" step="0.01" class="w-full p-3 text-xl font-bold text-center text-indigo-700 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ السداد</label>
                <input v-model="paymentForm.payment_date" type="date" required class="w-full border p-2 rounded-lg outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">طريقة الدفع</label>
                <select v-model="paymentForm.payment_method" required class="w-full border p-2 rounded-lg outline-none bg-white">
                  <option value="تحويل بنكي">🏦 تحويل بنكي</option>
                  <option value="كاش">💵 كاش</option>
                  <option value="شبكة">💳 شبكة</option>
                </select>
              </div>
            </div>
            <button type="submit" :disabled="processing" class="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 font-bold shadow-lg transition mt-2">
              {{ processing ? 'جاري الحفظ...' : 'تأكيد وحفظ' }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div class="bg-white w-full max-w-sm rounded-xl shadow-lg p-6">
        <h3 class="text-lg font-bold mb-4 border-b pb-2">تعديل بيانات الفاتورة</h3>
        <form @submit.prevent="saveInvoiceEdit" class="space-y-4">
          <div>
            <label class="text-sm text-gray-600">تاريخ الاستحقاق</label>
            <input v-model="editForm.due_date" type="date" class="w-full border p-2 rounded mt-1" required>
          </div>
          <div>
            <label class="text-sm text-gray-600">قيمة الفاتورة الأصلية</label>
            <input v-model="editForm.amount" type="number" class="w-full border p-2 rounded mt-1" required>
          </div>
           <div>
            <label class="text-sm text-gray-600">إجمالي المدفوع (للتصحيح)</label>
            <input v-model="editForm.paid_amount" type="number" class="w-full border p-2 rounded mt-1">
          </div>
          <div class="flex gap-2 mt-4">
            <button type="submit" class="flex-1 bg-indigo-600 text-white py-2 rounded-lg">حفظ</button>
            <button @click="showEditModal = false" type="button" class="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg">إلغاء</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)
const invoices = ref([])
const processing = ref(false)
const showPaymentModal = ref(false)
const showEditModal = ref(false)
const currentFilter = ref('all') // الفلتر الافتراضي

const paymentForm = ref({ id: null, currentPaid: 0, totalDue: 0, remaining: 0, amountToPay: 0, payment_date: '', payment_method: 'تحويل بنكي' })
const editForm = ref({})

// الحسابات العامة
const totalUnpaid = computed(() => invoices.value.reduce((sum, i) => sum + (i.amount - (i.paid_amount || 0)), 0))
const totalPaid = computed(() => invoices.value.reduce((sum, i) => sum + (i.paid_amount || 0), 0))

// دالة مساعدة للتحقق من التأخير
const checkOverdue = (inv) => {
  if (['مدفوع'].includes(inv.status)) return false
  // نعتبره متأخراً إذا كان التاريخ قبل اليوم
  return new Date(inv.due_date) < new Date(new Date().setHours(0,0,0,0))
}

const isOverdue = (inv) => checkOverdue(inv)

// 🟢 القائمة المفلترة (قلب النظام الجديد)
const filteredInvoices = computed(() => {
  if (currentFilter.value === 'all') return invoices.value
  
  if (currentFilter.value === 'paid') {
    return invoices.value.filter(i => i.status === 'مدفوع')
  }
  
  if (currentFilter.value === 'overdue') {
    // المتأخر: غير مدفوع + تاريخه طاف
    return invoices.value.filter(i => i.status !== 'مدفوع' && checkOverdue(i))
  }
  
  if (currentFilter.value === 'pending') {
    // المستحق قريباً: غير مدفوع + تاريخه لم يطف بعد (اليوم أو مستقبلاً)
    return invoices.value.filter(i => i.status !== 'مدفوع' && !checkOverdue(i))
  }
  
  return invoices.value
})

// 🔢 عدادات التبويبات (لتظهر كأرقام صغيرة بجانب الزر)
const counts = computed(() => {
  return {
    paid: invoices.value.filter(i => i.status === 'مدفوع').length,
    overdue: invoices.value.filter(i => i.status !== 'مدفوع' && checkOverdue(i)).length,
    pending: invoices.value.filter(i => i.status !== 'مدفوع' && !checkOverdue(i)).length
  }
})

const fetchInvoices = async () => {
  const { data } = await supabase.from('invoices').select(`*, tenants(name), units(name)`).order('due_date', { ascending: true })
  invoices.value = data || []
}

// نوافذ الدفع والتعديل (كما هي)
const openPaymentModal = (inv) => {
  const paid = Number(inv.paid_amount || 0)
  const total = Number(inv.amount)
  const remaining = total - paid
  paymentForm.value = { id: inv.id, currentPaid: paid, totalDue: total, remaining: remaining, amountToPay: remaining, payment_date: new Date().toISOString().split('T')[0], payment_method: 'تحويل بنكي' }
  showPaymentModal.value = true
}

const confirmPayment = async () => {
  processing.value = true
  const newTotalPaid = Number(paymentForm.value.currentPaid) + Number(paymentForm.value.amountToPay)
  let newStatus = 'مدفوع'
  if (newTotalPaid < Number(paymentForm.value.totalDue)) newStatus = 'مدفوع جزئياً'
  const { error } = await supabase.from('invoices').update({ status: newStatus, paid_amount: newTotalPaid, payment_date: paymentForm.value.payment_date, payment_method: paymentForm.value.payment_method }).eq('id', paymentForm.value.id)
  if (error) alert(error.message)
  else { showPaymentModal.value = false; fetchInvoices() }
  processing.value = false
}

const openEditModal = (inv) => { editForm.value = { ...inv }; showEditModal.value = true }
const saveInvoiceEdit = async () => {
  let status = 'غير مدفوع'
  if (editForm.value.paid_amount >= editForm.value.amount) status = 'مدفوع'
  else if (editForm.value.paid_amount > 0) status = 'مدفوع جزئياً'
  const { error } = await supabase.from('invoices').update({ ...editForm.value, status: status }).eq('id', editForm.value.id)
  if (!error) { showEditModal.value = false; fetchInvoices() }
}
const deleteInvoice = async (id) => { if (!confirm('حذف السجل؟')) return; await supabase.from('invoices').delete().eq('id', id); fetchInvoices() }

onMounted(() => fetchInvoices())
</script>