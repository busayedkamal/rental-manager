<template>
  <div class="space-y-6 relative">
    
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">💰 سجل الاستحقاقات (الفواتير)</h1>
        <p class="text-gray-500 text-sm mt-1">متابعة الفواتير المستحقة وإدارتها</p>
      </div>
      <button @click="fetchInvoices" class="flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition font-bold">
        <span>🔄</span> تحديث البيانات
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white p-5 rounded-xl shadow-sm border-r-4 border-indigo-500">
        <div class="text-gray-500 text-sm font-medium">عدد الفواتير (الحالية)</div>
        <div class="text-3xl font-bold text-gray-800 mt-1">{{ currentStats.count }}</div>
      </div>
      <div class="bg-white p-5 rounded-xl shadow-sm border-r-4 border-red-500">
        <div class="text-gray-500 text-sm font-medium">مستحقات واجبة السداد</div>
        <div class="text-3xl font-bold text-red-600 mt-1">{{ currentStats.unpaid.toLocaleString() }} <span class="text-sm">ريال</span></div>
      </div>
      <div class="bg-white p-5 rounded-xl shadow-sm border-r-4 border-green-500">
        <div class="text-gray-500 text-sm font-medium">تم تحصيله (المسجل)</div>
        <div class="text-3xl font-bold text-green-600 mt-1">{{ currentStats.paid.toLocaleString() }} <span class="text-sm">ريال</span></div>
      </div>
    </div>

    <div class="flex gap-2 overflow-x-auto pb-2">
      <button @click="currentFilter = 'current'" class="filter-btn" :class="currentFilter === 'current' ? 'active' : ''">📋 السجل الجاري</button>
      <button @click="currentFilter = 'overdue'" class="filter-btn" :class="currentFilter === 'overdue' ? 'active-red' : ''">⚠️ متأخرات</button>
      <button @click="currentFilter = 'soon'" class="filter-btn" :class="currentFilter === 'soon' ? 'active-orange' : ''">⏳ مستحق قريباً</button>
      <button @click="currentFilter = 'paid'" class="filter-btn" :class="currentFilter === 'paid' ? 'active-green' : ''">✅ مدفوع</button>
      <button @click="currentFilter = 'future'" class="filter-btn" :class="currentFilter === 'future' ? 'active-gray' : ''">📅 استحقاق مستقبلي</button>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50 text-xs text-gray-500 uppercase font-medium select-none">
          <tr>
            <th @click="toggleSort('tenant')" class="px-6 py-4 text-right cursor-pointer hover:text-indigo-600 transition-colors">
              <div class="flex items-center justify-end gap-1">المستأجر / الوحدة <span v-if="sortKey === 'tenant'">{{ sortOrder === 'asc' ? '⬆️' : '⬇️' }}</span></div>
            </th>
            <th @click="toggleSort('due_date')" class="px-6 py-4 text-right cursor-pointer hover:text-indigo-600 transition-colors">
              <div class="flex items-center justify-end gap-1">الاستحقاق <span v-if="sortKey === 'due_date'">{{ sortOrder === 'asc' ? '⬆️' : '⬇️' }}</span></div>
            </th>
            <th @click="toggleSort('amount')" class="px-6 py-4 text-right cursor-pointer hover:text-indigo-600 transition-colors">
              <div class="flex items-center justify-end gap-1">المبلغ <span v-if="sortKey === 'amount'">{{ sortOrder === 'asc' ? '⬆️' : '⬇️' }}</span></div>
            </th>
            <th @click="toggleSort('status')" class="px-6 py-4 text-right cursor-pointer hover:text-indigo-600 transition-colors">
              <div class="flex items-center justify-end gap-1">الحالة <span v-if="sortKey === 'status'">{{ sortOrder === 'asc' ? '⬆️' : '⬇️' }}</span></div>
            </th>
            <th class="px-6 py-4 text-center">الإجراء المالي</th>
            <th class="px-6 py-4 text-center">خيارات</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="inv in sortedInvoices" :key="inv.id" class="hover:bg-gray-50 transition-colors">
            
            <td class="px-6 py-4">
              <div class="font-bold text-gray-800">{{ inv.tenants?.name }}</div>
              <div class="text-xs text-gray-500 mt-1">🏠 {{ inv.units?.name }}</div>
            </td>

            <td class="px-6 py-4">
              <div :class="getDateColor(inv)">{{ inv.due_date }}</div>
              <div v-if="getStatusLabel(inv)" class="text-[10px] mt-1 font-bold" :class="getDateColor(inv)">{{ getStatusLabel(inv) }}</div>
            </td>

            <td class="px-6 py-4">
              <div class="text-gray-800 font-bold">{{ Number(inv.amount).toLocaleString() }}</div>
              <div v-if="inv.paid_amount > 0" class="text-green-600 text-sm font-bold mt-1">✅ وصل: {{ Number(inv.paid_amount).toLocaleString() }}</div>
              <div v-if="inv.amount - inv.paid_amount > 0" class="text-gray-400 text-xs mt-1">متبقي: <span class="font-bold text-red-500">{{ Number(inv.amount - (inv.paid_amount || 0)).toLocaleString() }}</span></div>
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
            </td>

            <td class="px-6 py-4 text-center">
              <div v-if="inv.status !== 'مدفوع'">
                <NuxtLink 
                :to="{ path: '/collections', query: { contractId: inv.contract_id } }" 
               class="text-indigo-600 hover:text-indigo-800 text-xs font-bold hover:underline flex items-center justify-center gap-1 transition-all">
               <span>💸</span> اذهب للتحصيل
               </NuxtLink>
              </div>
              <div v-else class="flex justify-center items-center gap-2">
                <span class="text-green-500 text-xl">✅</span>
                <button v-if="canEdit" @click="undoPayment(inv)" class="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded border border-red-200 transition" title="إلغاء الدفع">↩️ تراجع</button>
              </div>
            </td>

            <td class="px-6 py-4 text-center">
              <div class="flex justify-center gap-2">
                <button @click="openInvoicePrint(inv)" class="text-gray-500 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-50 transition" title="طباعة الفاتورة">🖨️</button>
                <button @click="openEditModal(inv)" class="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100" title="تعديل">✏️</button>
                <button @click="deleteInvoice(inv.id)" class="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-gray-100" title="حذف الدفعة فقط">🗑️</button>
              </div>
            </td>
          </tr>
          <tr v-if="sortedInvoices.length === 0">
            <td colspan="6" class="p-8 text-center text-gray-400 bg-gray-50">لا توجد فواتير في هذا التصنيف حالياً ✨</td>
          </tr>
        </tbody>
      </table>
    </div>

    <InvoicePrint v-if="showPrintModal" :isOpen="showPrintModal" :invoice="selectedInvoice" @close="showPrintModal = false" />
    
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
import { usePermissions } from '~/composables/usePermissions'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)
const invoices = ref([])
const showEditModal = ref(false)
const showPrintModal = ref(false)
const selectedInvoice = ref(null)
const currentFilter = ref('current')
const editForm = ref({})

const { canDelete, canEdit, setRole } = usePermissions()

const sortKey = ref('due_date')
const sortOrder = ref('asc') 

const classifyInvoice = (inv) => {
  if (inv.status === 'مدفوع') return 'paid'
  const today = new Date(); today.setHours(0,0,0,0)
  const dueDate = new Date(inv.due_date)
  const twoMonthsLater = new Date(today); twoMonthsLater.setDate(today.getDate() + 60)
  if (dueDate < today) return 'overdue'
  if (dueDate <= twoMonthsLater) return 'soon'
  return 'future'
}

const currentStats = computed(() => {
  const relevantInvoices = invoices.value.filter(i => classifyInvoice(i) !== 'future')
  const unpaid = relevantInvoices.reduce((sum, i) => sum + (i.amount - (i.paid_amount || 0)), 0)
  const paid = relevantInvoices.reduce((sum, i) => sum + (i.paid_amount || 0), 0)
  return { count: relevantInvoices.length, unpaid, paid }
})

const getDateColor = (inv) => {
  const type = classifyInvoice(inv)
  if (type === 'paid') return 'text-green-600'
  if (type === 'overdue') return 'text-red-600 font-bold'
  if (type === 'soon') return 'text-orange-500 font-bold'
  return 'text-gray-400'
}

const getStatusLabel = (inv) => {
  const type = classifyInvoice(inv)
  if (type === 'overdue') return '⚠️ متأخر'
  if (type === 'soon') return '⏳ خلال شهرين'
  if (type === 'future') return '📅 مستقبلي'
  return ''
}

const filteredInvoices = computed(() => {
  return invoices.value.filter(inv => {
    const type = classifyInvoice(inv)
    if (currentFilter.value === 'current') return type !== 'future'
    if (currentFilter.value === 'overdue') return type === 'overdue'
    if (currentFilter.value === 'soon') return type === 'soon'
    if (currentFilter.value === 'future') return type === 'future'
    if (currentFilter.value === 'paid') return type === 'paid'
    return true
  })
})

const toggleSort = (key) => {
  if (sortKey.value === key) { sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc' } else { sortKey.value = key; sortOrder.value = 'asc' }
}

const sortedInvoices = computed(() => {
  let data = [...filteredInvoices.value]
  return data.sort((a, b) => {
    let modifier = sortOrder.value === 'asc' ? 1 : -1
    if (sortKey.value === 'tenant') { return (a.tenants?.name || '').localeCompare(b.tenants?.name || '') * modifier }
    if (sortKey.value === 'amount') return (a.amount - b.amount) * modifier
    if (sortKey.value === 'due_date') return (new Date(a.due_date) - new Date(b.due_date)) * modifier
    if (sortKey.value === 'status') return a.status.localeCompare(b.status) * modifier
    return 0
  })
})

const fetchInvoices = async () => {
  const { data } = await supabase.from('invoices').select(`*, tenants(name), units(name)`).order('due_date', { ascending: true }) 
  invoices.value = data || []
}

const loadUserRole = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile) setRole(profile.role)
  }
}

const undoPayment = async (inv) => {
  if (!confirm('هل تريد إلغاء الدفع وإعادة الفاتورة كـ "غير مدفوعة"؟')) return
  const { error } = await supabase.from('invoices').update({ status: 'غير مدفوع', paid_amount: 0, payment_date: null, payment_method: null }).eq('id', inv.id)
  if (error) alert('خطأ: ' + error.message)
  else fetchInvoices()
}

const openEditModal = (inv) => { editForm.value = { ...inv }; showEditModal.value = true }
const saveInvoiceEdit = async () => {
  let status = 'غير مدفوع'; if (editForm.value.paid_amount >= editForm.value.amount) status = 'مدفوع'; else if (editForm.value.paid_amount > 0) status = 'مدفوع جزئياً'
  const { error } = await supabase.from('invoices').update({ ...editForm.value, status: status }).eq('id', editForm.value.id)
  if (!error) { showEditModal.value = false; fetchInvoices() }
}
const openInvoicePrint = (inv) => { selectedInvoice.value = inv; showPrintModal.value = true }

// 👇 دالة الحذف الآمنة (تحذف الفاتورة فقط)
const deleteInvoice = async (id) => {
  if (!confirm('⚠️ تحذير: هل أنت متأكد من حذف هذه الدفعة (الفاتورة)؟\nلن يتم حذف العقد، فقط هذه الدفعة.')) return
  const { error } = await supabase.from('invoices').delete().eq('id', id)
  if (error) alert('حدث خطأ أثناء الحذف: ' + error.message)
  else fetchInvoices()
}

onMounted(() => { loadUserRole(); fetchInvoices() })
</script>

<style scoped>
.filter-btn { @apply px-4 py-2 rounded-full text-sm font-bold transition-all border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 whitespace-nowrap shadow-sm; }
.filter-btn.active { @apply bg-gray-800 text-white border-gray-800 ring-2 ring-gray-300; }
.filter-btn.active-red { @apply bg-red-600 text-white border-red-600 ring-2 ring-red-200; }
.filter-btn.active-orange { @apply bg-orange-500 text-white border-orange-500 ring-2 ring-orange-200; }
.filter-btn.active-green { @apply bg-green-600 text-white border-green-600 ring-2 ring-green-200; }
.filter-btn.active-gray { @apply bg-gray-500 text-white border-gray-500 ring-2 ring-gray-200; }
</style>