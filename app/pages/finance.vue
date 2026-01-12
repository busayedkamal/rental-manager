<template>
  <div class="space-y-6 relative">
    
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">💰 سجل المدفوعات والتحصيل</h1>
        <p class="text-gray-500 text-sm mt-1">إدارة الفواتير، التحصيل، والتسويات</p>
      </div>
      <button @click="fetchInvoices" class="flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition font-bold">
        <span>🔄</span> تحديث البيانات
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white p-5 rounded-xl shadow-sm border-r-4 border-indigo-500">
        <div class="text-gray-500 text-sm font-medium">عدد الفواتير</div>
        <div class="text-3xl font-bold text-gray-800 mt-1">{{ invoices.length }}</div>
      </div>
      <div class="bg-white p-5 rounded-xl shadow-sm border-r-4 border-red-500">
        <div class="text-gray-500 text-sm font-medium">مستحقات (المتبقي)</div>
        <div class="text-3xl font-bold text-red-600 mt-1">{{ totalUnpaid.toLocaleString() }} <span class="text-sm">ريال</span></div>
      </div>
      <div class="bg-white p-5 rounded-xl shadow-sm border-r-4 border-green-500">
        <div class="text-gray-500 text-sm font-medium">تم تحصيله</div>
        <div class="text-3xl font-bold text-green-600 mt-1">{{ totalPaid.toLocaleString() }} <span class="text-sm">ريال</span></div>
      </div>
    </div>

    <div class="flex gap-2 overflow-x-auto pb-2">
      <button @click="currentFilter = 'all'" class="filter-btn" :class="currentFilter === 'all' ? 'active' : ''">📋 الكل</button>
      <button @click="currentFilter = 'overdue'" class="filter-btn" :class="currentFilter === 'overdue' ? 'active-red' : ''">⚠️ متأخرات</button>
      <button @click="currentFilter = 'pending'" class="filter-btn" :class="currentFilter === 'pending' ? 'active-orange' : ''">⏳ مستحق قريباً</button>
      <button @click="currentFilter = 'paid'" class="filter-btn" :class="currentFilter === 'paid' ? 'active-green' : ''">✅ مدفوع</button>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50 text-xs text-gray-500 uppercase font-medium">
          <tr>
            <th class="px-6 py-4 text-right">المستأجر / الوحدة</th>
            <th class="px-6 py-4 text-right">الاستحقاق</th>
            <th class="px-6 py-4 text-right">المبلغ (المطلوب / المدفوع)</th>
            <th class="px-6 py-4 text-right">الحالة</th>
            <th class="px-6 py-4 text-center">الإجراء المالي</th>
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

              <div v-else class="flex justify-center items-center gap-2">
                <span class="text-green-500 text-xl">✅</span>
                <button v-if="canEdit" @click="undoPayment(inv)" class="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded border border-red-200 transition" title="إلغاء الدفع">↩️ تراجع</button>
              </div>
              
              <button v-if="inv.status === 'مدفوع جزئياً' && canEdit" @click="undoPayment(inv)" class="mt-2 text-[10px] text-red-500 underline hover:text-red-700 block mx-auto">إلغاء المدفوع</button>
            </td>

            <td class="px-6 py-4 text-center">
              <div class="flex justify-center gap-2">
                <button @click="openInvoicePrint(inv)" class="text-gray-500 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-50 transition" title="طباعة الفاتورة">🖨️</button>
                
                <button 
                  v-if="canEdit" 
                  @click="openEditModal(inv)" 
                  class="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100" 
                  title="تعديل"
                >
                  ✏️
                </button>

                <button 
                  v-if="canDelete" 
                  @click="deleteInvoice(inv.id)" 
                  class="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-gray-100" 
                  title="حذف (للمالك فقط)"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <InvoicePrint 
      v-if="showPrintModal" 
      :isOpen="showPrintModal" 
      :invoice="selectedInvoice" 
      @close="showPrintModal = false" 
    />

    <div v-if="showPaymentModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" dir="rtl">
      <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div class="bg-indigo-600 p-4 flex justify-between items-center text-white">
          <h3 class="text-lg font-bold">💵 تسجيل دفعة مالية</h3>
          <button @click="showPaymentModal = false" class="hover:bg-indigo-700 p-1 rounded-full">✕</button>
        </div>
        <div class="p-6 space-y-4">
          <div class="bg-gray-50 p-3 rounded-lg border text-center text-sm text-gray-600">
            المبلغ المتبقي: <span class="font-bold text-red-600 text-lg block">{{ Math.trunc(paymentForm.remaining).toLocaleString() }} ريال</span>
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
        <h3 class="text-lg font-bold mb-4 border-b pb-2">تعديل الفاتورة</h3>
        <form @submit.prevent="saveInvoiceEdit" class="space-y-4">
          <div><label class="text-sm">تاريخ الاستحقاق</label><input v-model="editForm.due_date" type="date" class="w-full border p-2 rounded" required></div>
          <div><label class="text-sm">القيمة الأصلية</label><input v-model="editForm.amount" type="number" class="w-full border p-2 rounded" required></div>
          <div><label class="text-sm">المدفوع (للتصحيح)</label><input v-model="editForm.paid_amount" type="number" class="w-full border p-2 rounded"></div>
          <div class="flex gap-2 mt-4"><button type="submit" class="flex-1 bg-indigo-600 text-white py-2 rounded">حفظ</button><button @click="showEditModal = false" type="button" class="flex-1 bg-gray-100 text-gray-700 py-2 rounded">إلغاء</button></div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { createClient } from '@supabase/supabase-js'
import InvoicePrint from '~/components/InvoicePrint.vue'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)
const invoices = ref([])
const processing = ref(false)
const showPaymentModal = ref(false)
const showEditModal = ref(false)
const showPrintModal = ref(false)
const selectedInvoice = ref(null)
const currentFilter = ref('all')

const paymentForm = ref({ id: null, currentPaid: 0, totalDue: 0, remaining: 0, amountToPay: 0, payment_date: '', payment_method: 'تحويل بنكي' })
const editForm = ref({})

// ✅ تفعيل الصلاحيات
const { canDelete, canEdit, setRole } = usePermissions()

const totalUnpaid = computed(() => invoices.value.reduce((sum, i) => sum + (i.amount - (i.paid_amount || 0)), 0))
const totalPaid = computed(() => invoices.value.reduce((sum, i) => sum + (i.paid_amount || 0), 0))

const checkOverdue = (inv) => {
  if (['مدفوع'].includes(inv.status)) return false
  return new Date(inv.due_date) < new Date(new Date().setHours(0,0,0,0))
}
const isOverdue = (inv) => checkOverdue(inv)

const filteredInvoices = computed(() => {
  if (currentFilter.value === 'all') return invoices.value
  if (currentFilter.value === 'paid') return invoices.value.filter(i => i.status === 'مدفوع')
  if (currentFilter.value === 'overdue') return invoices.value.filter(i => i.status !== 'مدفوع' && checkOverdue(i))
  if (currentFilter.value === 'pending') return invoices.value.filter(i => i.status !== 'مدفوع' && !checkOverdue(i))
  return invoices.value
})

const fetchInvoices = async () => {
  const { data } = await supabase.from('invoices').select(`*, tenants(name), units(name)`).order('due_date', { ascending: true })
  invoices.value = data || []
}

// ✅ دالة جلب دور المستخدم الحالي
const loadUserRole = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile) setRole(profile.role)
  }
}

const openPaymentModal = (inv) => {
  const paid = Number(inv.paid_amount || 0)
  const total = Number(inv.amount)
  const remaining = Math.trunc(total - paid)
  paymentForm.value = { id: inv.id, currentPaid: paid, totalDue: total, remaining: remaining, amountToPay: remaining, payment_date: new Date().toISOString().split('T')[0], payment_method: 'تحويل بنكي' }
  showPaymentModal.value = true
}

const openInvoicePrint = (inv) => {
  selectedInvoice.value = inv
  showPrintModal.value = true
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

const undoPayment = async (inv) => {
  if (!confirm('هل تريد إلغاء الدفع وإعادة الفاتورة كـ "غير مدفوعة"؟\n\n(سيعود المبلغ كدين على المستأجر)')) return
  const { error } = await supabase.from('invoices').update({ status: 'غير مدفوع', paid_amount: 0, payment_date: null, payment_method: null }).eq('id', inv.id)
  if (error) alert('خطأ: ' + error.message)
  else fetchInvoices()
}

const openEditModal = (inv) => { editForm.value = { ...inv }; showEditModal.value = true }
const saveInvoiceEdit = async () => {
  let status = 'غير مدفوع'
  if (editForm.value.paid_amount >= editForm.value.amount) status = 'مدفوع'
  else if (editForm.value.paid_amount > 0) status = 'مدفوع جزئياً'
  const { error } = await supabase.from('invoices').update({ ...editForm.value, status: status }).eq('id', editForm.value.id)
  if (!error) { showEditModal.value = false; fetchInvoices() }
}

const deleteInvoice = async (id) => {
  if (!confirm('⚠️ تحذير: حذف الفاتورة نهائياً؟')) return
  await supabase.from('invoices').delete().eq('id', id)
  fetchInvoices()
}

onMounted(() => {
  loadUserRole() // ✅ تحميل الصلاحيات
  fetchInvoices()
})
</script>

<style scoped>
.filter-btn { @apply px-4 py-2 rounded-full text-sm font-bold transition-all border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 whitespace-nowrap; }
.filter-btn.active { @apply bg-gray-800 text-white border-gray-800; }
.filter-btn.active-red { @apply bg-red-600 text-white border-red-600; }
.filter-btn.active-orange { @apply bg-orange-500 text-white border-orange-500; }
.filter-btn.active-green { @apply bg-green-600 text-white border-green-600; }
</style>