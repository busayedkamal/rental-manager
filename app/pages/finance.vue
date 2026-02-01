<template>
  <div class="space-y-8 font-sans text-slate-800" dir="rtl">
    <div class="flex flex-col md:flex-row justify-between items-end gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">💰 سجل الاستحقاقات</h1>
        <p class="text-slate-500 mt-1 text-sm font-medium">إدارة الفواتير، متابعة الديون، وتاريخ السداد</p>
      </div>

      <button
        @click="refreshData"
        :disabled="pending"
        class="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <span v-if="pending" class="animate-spin text-lg">⏳</span>
        <span v-else class="text-lg">🔄</span>
        <span>{{ pending ? 'جاري التحديث...' : 'تحديث البيانات' }}</span>
      </button>
    </div>

    <div
      v-if="uiError"
      class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700 text-sm font-bold flex items-center gap-2"
      role="alert"
    >
      <span>⚠️</span> {{ uiError }}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">واجب السداد (ديون)</div>
          <div class="h-10 w-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-xl ring-1 ring-rose-100">📉</div>
        </div>
        <div dir="ltr" class="text-2xl font-extrabold text-rose-600 tabular-nums tracking-tight text-right">
          {{ formatMoney(currentStats.unpaid) }}
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">تم تحصيله (مدفوع)</div>
          <div class="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl ring-1 ring-emerald-100">💰</div>
        </div>
        <div dir="ltr" class="text-2xl font-extrabold text-emerald-600 tabular-nums tracking-tight text-right">
          {{ formatMoney(currentStats.paid) }}
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">عدد الفواتير</div>
          <div class="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl ring-1 ring-indigo-100">🧾</div>
        </div>
        <div class="text-2xl font-extrabold text-slate-900 tabular-nums">
          {{ currentStats.count }} <span class="text-sm font-medium text-slate-400">فاتورة</span>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-2 pb-2">
      <button
        v-for="filter in filters"
        :key="filter.key"
        @click="currentFilter = filter.key"
        class="px-4 py-2 rounded-lg text-sm font-bold transition-all border shadow-sm flex items-center gap-2"
        :class="currentFilter === filter.key ? filterStyles[filter.color] : filterStyles.base"
      >
        <span>{{ filter.icon }}</span> {{ filter.label }}
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200 min-h-[400px] flex flex-col">
      
      <div v-if="pending && invoices.length === 0" class="flex-1 flex flex-col items-center justify-center text-slate-400 p-12">
        <div class="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p>جاري تحميل البيانات...</p>
      </div>

      <div v-else class="overflow-x-auto flex-1">
        <table class="min-w-[900px] w-full divide-y divide-slate-100">
          <thead class="bg-slate-50/95 backdrop-blur sticky top-0 z-10 text-xs text-slate-500 uppercase font-bold tracking-wider select-none shadow-sm">
            <tr>
              <th @click="toggleSort('tenant')" class="px-6 py-4 text-right cursor-pointer hover:text-indigo-600 transition-colors">
                المستأجر / الوحدة <span v-if="sortKey === 'tenant'">{{ sortOrder === 'asc' ? '⬆️' : '⬇️' }}</span>
              </th>
              <th @click="toggleSort('due_date')" class="px-6 py-4 text-right cursor-pointer hover:text-indigo-600 transition-colors whitespace-nowrap">
                تاريخ الاستحقاق <span v-if="sortKey === 'due_date'">{{ sortOrder === 'asc' ? '⬆️' : '⬇️' }}</span>
              </th>
              <th @click="toggleSort('amount')" class="px-6 py-4 text-right cursor-pointer hover:text-indigo-600 transition-colors whitespace-nowrap">
                المبلغ <span v-if="sortKey === 'amount'">{{ sortOrder === 'asc' ? '⬆️' : '⬇️' }}</span>
              </th>
              <th @click="toggleSort('status')" class="px-6 py-4 text-right cursor-pointer hover:text-indigo-600 transition-colors whitespace-nowrap">
                الحالة <span v-if="sortKey === 'status'">{{ sortOrder === 'asc' ? '⬆️' : '⬇️' }}</span>
              </th>
              <th class="px-6 py-4 text-center whitespace-nowrap">إجراءات</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-50 bg-white">
            <tr
              v-for="inv in sortedInvoices"
              :key="inv.id"
              class="transition-colors odd:bg-white even:bg-slate-50/40 hover:bg-indigo-50/30 group"
            >
              <td class="px-6 py-4">
                <div class="font-bold text-slate-800 text-sm">{{ inv.tenants?.name || '—' }}</div>
                <div class="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
                  <span class="text-indigo-400">🏠</span> {{ inv.units?.name || '—' }}
                </div>
              </td>

              <td class="px-6 py-4">
                <div class="text-sm font-medium font-mono tabular-nums whitespace-nowrap" :class="getDateColor(inv)">
                  {{ inv.due_date }}
                </div>
                <div
                  v-if="getStatusLabel(inv)"
                  class="text-[10px] mt-1 font-bold inline-flex items-center gap-1"
                  :class="getDateColor(inv)"
                >
                  {{ getStatusLabel(inv) }}
                </div>
              </td>

              <td class="px-6 py-4">
                <div dir="ltr" class="text-slate-900 font-extrabold text-sm tabular-nums text-right whitespace-nowrap">
                  {{ formatMoney(inv.amount) }}
                </div>

                <div v-if="Number(inv.paid_amount) > 0 && inv.status !== 'مدفوع'" class="mt-1 text-xs space-y-0.5">
                  <div class="text-emerald-600 font-bold flex justify-end gap-1">
                    <span>مدفوع:</span> <span class="tabular-nums">{{ formatMoney(inv.paid_amount) }}</span>
                  </div>
                  <div class="text-rose-500 font-bold flex justify-end gap-1">
                    <span>متبقي:</span>
                    <span class="tabular-nums border-b border-rose-200">
                      {{ formatMoney(Number(inv.amount) - Number(inv.paid_amount || 0)) }}
                    </span>
                  </div>
                </div>
              </td>

              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm" :class="getStatusBadge(inv.status)">
                  {{ inv.status }}
                </span>
              </td>

              <td class="px-6 py-4">
                <div class="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <NuxtLink
                    v-if="inv.status !== 'مدفوع'"
                    :to="{ path: '/collections', query: { contractId: inv.contract_id } }"
                    class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold shadow-sm shadow-indigo-200 transition flex items-center gap-1"
                    title="تسجيل دفعة"
                  >
                    <span>💸</span> دفع
                  </NuxtLink>

                  <button
                    v-else-if="canEdit"
                    @click="undoPayment(inv)"
                    :disabled="busy[inv.id]"
                    class="text-xs bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 px-2 py-1.5 rounded-lg font-bold transition flex items-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
                    title="تراجع عن الدفع"
                  >
                    <span v-if="busy[inv.id]" class="animate-spin">⏳</span>
                    <span v-else>↩️</span>
                    تراجع
                  </button>

                  <div class="h-6 w-[1px] bg-slate-200 mx-1"></div>

                  <button @click="openInvoicePrint(inv)" class="icon-btn" title="طباعة" aria-label="طباعة">🖨️</button>

                  <button
                    v-if="canEdit"
                    @click="openEditModal(inv)"
                    class="icon-btn text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                    title="تعديل"
                    aria-label="تعديل"
                  >
                    ✏️
                  </button>

                  <button
                    v-if="canDelete"
                    @click="deleteInvoice(inv.id)"
                    :disabled="busy[inv.id]"
                    class="icon-btn text-rose-600 hover:bg-rose-50 hover:border-rose-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    title="حذف"
                    aria-label="حذف"
                  >
                    <span v-if="busy[inv.id]" class="animate-spin">⏳</span>
                    <span v-else>🗑️</span>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="sortedInvoices.length === 0">
              <td colspan="5" class="p-12 text-center">
                <div class="bg-slate-50 p-4 rounded-full w-fit mx-auto mb-3">
                  <span class="text-3xl opacity-50">📭</span>
                </div>
                <p class="text-slate-500 font-bold">لا توجد فواتير تطابق الفلتر الحالي</p>
                <button v-if="currentFilter !== 'current'" @click="currentFilter = 'current'" class="text-indigo-600 text-sm hover:underline mt-2">
                  العودة للسجل الجاري
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <InvoicePrint
      v-if="showPrintModal"
      :isOpen="showPrintModal"
      :invoice="selectedInvoice"
      @close="showPrintModal = false"
    />

    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="closeEditModal"></div>

      <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative z-10">
        <div class="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 class="font-bold text-slate-800">✏️ تعديل الفاتورة</h3>
          <button @click="closeEditModal" class="text-slate-400 hover:text-slate-600" aria-label="إغلاق">✕</button>
        </div>

        <form @submit.prevent="saveInvoiceEdit" class="p-6 space-y-4">
          <div>
            <label class="text-sm font-bold text-slate-700 mb-1 block">تاريخ الاستحقاق</label>
            <input v-model="editForm.due_date" type="date" class="input-field" required>
          </div>

          <div>
            <label class="text-sm font-bold text-slate-700 mb-1 block">القيمة الأصلية</label>
            <div class="relative">
              <input v-model.number="editForm.amount" type="number" class="input-field pl-10" required>
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">SAR</span>
            </div>
          </div>

          <div>
            <label class="text-sm font-bold text-slate-700 mb-1 block">المبلغ المدفوع (للتصحيح اليدوي)</label>
            <div class="relative">
              <input v-model.number="editForm.paid_amount" type="number" class="input-field pl-10">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">SAR</span>
            </div>
            <p class="text-xs text-amber-600 mt-1 bg-amber-50 p-1 rounded">⚠️ تغيير هذا الرقم يدوياً قد يؤثر على حسابات الصندوق.</p>
          </div>

          <div class="pt-2 flex gap-3">
            <button
              type="submit"
              :disabled="savingEdit"
              class="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-sm transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span v-if="savingEdit" class="animate-spin inline-block me-2">⏳</span>
              حفظ التعديلات
            </button>

            <button
              @click="closeEditModal"
              type="button"
              class="flex-1 bg-white text-slate-700 border border-slate-300 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition"
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
import { ref, computed, reactive, onMounted } from 'vue'
import InvoicePrint from '~/components/InvoicePrint.vue'
import { usePermissions } from '~/composables/usePermissions'

const supabase = useSupabaseClient()
const user = useSupabaseUser() // ✅ التعديل هنا: استخدام دالة نوكست الجاهزة

// الصلاحيات
const { canDelete, canEdit, setRole } = usePermissions()

// الحالة (State)
const showEditModal = ref(false)
const showPrintModal = ref(false)
const selectedInvoice = ref(null)
const currentFilter = ref('current')
const editForm = ref({})
const savingEdit = ref(false)
const busy = reactive({}) // حالة انشغال كل صف

// ثابت "اليوم"
const todayIso = useState('invoicesTodayIso', () => new Date().toISOString().slice(0, 10))

// الفلاتر
const filters = [
  { key: 'current', label: 'السجل الجاري', icon: '📋', color: 'indigo' },
  { key: 'overdue', label: 'متأخرات', icon: '⚠️', color: 'rose' },
  { key: 'soon', label: 'مستحق قريباً', icon: '⏳', color: 'amber' },
  { key: 'paid', label: 'مدفوع بالكامل', icon: '✅', color: 'emerald' },
  { key: 'future', label: 'استحقاق مستقبلي', icon: '📅', color: 'slate' },
]

const filterStyles = {
  base: 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
  indigo: 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-200',
  rose: 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-200',
  amber: 'bg-amber-500 text-white border-amber-500 ring-2 ring-amber-200',
  emerald: 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-200',
  slate: 'bg-slate-600 text-white border-slate-600 ring-2 ring-slate-200',
}

// تنسيق العملة
const moneyFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const formatMoney = (val) => moneyFormatter.format(Number(val || 0))

// دوال التاريخ
const addDaysIso = (iso, days) => {
  const d = new Date(iso + 'T00:00:00.000Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

// جلب البيانات (SSR)
const {
  data: invoicesRef,
  pending,
  refresh,
  error: fetchError,
} = await useAsyncData(
  'invoices:list',
  async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select('id, contract_id, due_date, amount, paid_amount, status, tenants(name), units(name)')
      .order('due_date', { ascending: true })

    if (error) throw error
    return data ?? []
  },
  { server: true, default: () => [] }
)

const invoices = computed(() => invoicesRef.value || [])
const uiError = computed(() => fetchError.value?.message || '')

// الترتيب
const sortKey = ref('due_date')
const sortOrder = ref('asc')
const toggleSort = (key) => {
  if (sortKey.value === key) sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

// التصنيف
const classifyInvoice = (inv) => {
  if (inv.status === 'مدفوع') return 'paid'
  const due = inv.due_date 
  const today = todayIso.value
  const soonLimit = addDaysIso(today, 60)

  if (due < today) return 'overdue'
  if (due <= soonLimit) return 'soon'
  return 'future'
}

// الإحصائيات الحالية
const currentStats = computed(() => {
  const relevant = invoices.value.filter(i => classifyInvoice(i) !== 'future')
  const unpaid = relevant.reduce((sum, i) => sum + (Number(i.amount || 0) - Number(i.paid_amount || 0)), 0)
  const paid = relevant.reduce((sum, i) => sum + Number(i.paid_amount || 0), 0)
  return { count: relevant.length, unpaid, paid }
})

// ألوان النصوص
const getDateColor = (inv) => {
  const type = classifyInvoice(inv)
  if (type === 'paid') return 'text-emerald-600 line-through opacity-70'
  if (type === 'overdue') return 'text-rose-600 font-bold'
  if (type === 'soon') return 'text-amber-600 font-bold'
  return 'text-slate-500'
}

// نصوص الحالة
const getStatusLabel = (inv) => {
  const type = classifyInvoice(inv)
  if (type === 'overdue') return '⚠️ متأخر'
  if (type === 'soon') return '⏳ خلال 60 يوم'
  return ''
}

// شارات الحالة (Badges)
const getStatusBadge = (status) => {
  if (status === 'مدفوع') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (status === 'مدفوع جزئياً') return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-rose-50 text-rose-700 border-rose-200'
}

// الفلترة
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

// الترتيب النهائي
const sortedInvoices = computed(() => {
  const data = [...filteredInvoices.value]
  const modifier = sortOrder.value === 'asc' ? 1 : -1

  return data.sort((a, b) => {
    if (sortKey.value === 'tenant') return (a.tenants?.name || '').localeCompare(b.tenants?.name || '') * modifier
    if (sortKey.value === 'amount') return (Number(a.amount || 0) - Number(b.amount || 0)) * modifier
    if (sortKey.value === 'due_date') return (a.due_date || '').localeCompare(b.due_date || '') * modifier
    if (sortKey.value === 'status') return (a.status || '').localeCompare(b.status || '') * modifier
    return 0
  })
})

const refreshData = () => refresh()

// تحميل الصلاحيات عند التركيب (Client Side) لتجنب تأخير الصفحة
onMounted(async () => {
  if (!user.value) return
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.value.id)
    .single()

  if (!error && profile?.role) setRole(profile.role)
})

const openInvoicePrint = (inv) => { selectedInvoice.value = inv; showPrintModal.value = true }

const openEditModal = (inv) => {
  editForm.value = {
    id: inv.id,
    due_date: inv.due_date,
    amount: Number(inv.amount || 0),
    paid_amount: Number(inv.paid_amount || 0),
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editForm.value = {}
}

const saveInvoiceEdit = async () => {
  if (!canEdit.value) return
  savingEdit.value = true
  try {
    const amount = Number(editForm.value.amount || 0)
    const paid = Number(editForm.value.paid_amount || 0)

    let status = 'غير مدفوع'
    if (paid >= amount && amount > 0) status = 'مدفوع'
    else if (paid > 0) status = 'مدفوع جزئياً'

    const { error } = await supabase
      .from('invoices')
      .update({
        due_date: editForm.value.due_date,
        amount,
        paid_amount: paid,
        status,
      })
      .eq('id', editForm.value.id)

    if (error) throw error

    closeEditModal()
    await refresh()
  } catch (e) {
    alert('حدث خطأ أثناء الحفظ: ' + (e.message || 'غير معروف'))
  } finally {
    savingEdit.value = false
  }
}

const undoPayment = async (inv) => {
  if (!canEdit.value) return
  if (!confirm('هل تريد إلغاء الدفع وإعادة الفاتورة كـ "غير مدفوعة"؟')) return

  busy[inv.id] = true
  try {
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'غير مدفوع', paid_amount: 0, payment_date: null, payment_method: null })
      .eq('id', inv.id)

    if (error) throw error
    await refresh()
  } catch (e) {
    alert('خطأ: ' + (e.message || 'غير معروف'))
  } finally {
    busy[inv.id] = false
  }
}

const deleteInvoice = async (id) => {
  if (!canDelete.value) return
  if (!confirm('⚠️ تحذير: هل أنت متأكد من حذف هذه الدفعة (الفاتورة)؟\nلن يتم حذف العقد، فقط هذه الدفعة.')) return

  busy[id] = true
  try {
    const { error } = await supabase.from('invoices').delete().eq('id', id)
    if (error) throw error
    await refresh()
  } catch (e) {
    alert('حدث خطأ أثناء الحذف: ' + (e.message || 'غير معروف'))
  } finally {
    busy[id] = false
  }
}
</script>

<style scoped>
.input-field {
  @apply w-full rounded-xl border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white transition-all shadow-sm;
}
.icon-btn {
  @apply p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition shadow-sm bg-white;
}
</style>