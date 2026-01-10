<template>
  <div class="space-y-6 relative">
    
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-800">💰 المالية والتحصيل</h1>
      <button @click="fetchInvoices" class="text-indigo-600 hover:underline">🔄 تحديث</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white p-4 rounded-xl shadow border-r-4 border-indigo-500">
        <div class="text-gray-500 text-sm">إجمالي الفواتير</div>
        <div class="text-2xl font-bold">{{ invoices.length }}</div>
      </div>
      <div class="bg-white p-4 rounded-xl shadow border-r-4 border-red-500">
        <div class="text-gray-500 text-sm">مستحقات (غير مدفوعة)</div>
        <div class="text-2xl font-bold text-red-600">{{ totalUnpaid.toLocaleString() }} ريال</div>
      </div>
      <div class="bg-white p-4 rounded-xl shadow border-r-4 border-green-500">
        <div class="text-gray-500 text-sm">تم تحصيله</div>
        <div class="text-2xl font-bold text-green-600">{{ totalPaid.toLocaleString() }} ريال</div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
          <tr>
            <th class="px-6 py-3 text-right">معلومات</th>
            <th class="px-6 py-3 text-right">تاريخ الاستحقاق</th>
            <th class="px-6 py-3 text-right">المبلغ</th>
            <th class="px-6 py-3 text-right">الحالة</th>
            <th class="px-6 py-3 text-center">إجراء</th>
            <th class="px-6 py-3 text-center">تعديل</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="inv in invoices" :key="inv.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="font-bold text-gray-800">{{ inv.tenants?.name }}</div>
              <div class="text-xs text-gray-500">{{ inv.units?.name }}</div>
            </td>
            <td class="px-6 py-4" :class="isOverdue(inv) ? 'text-red-600 font-bold' : ''">
              {{ inv.due_date }}
            </td>
            <td class="px-6 py-4 font-bold">{{ Number(inv.amount).toLocaleString() }}</td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 rounded text-xs"
                :class="inv.status === 'مدفوع' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                {{ inv.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <button 
                v-if="inv.status !== 'مدفوع'"
                @click="payInvoice(inv.id)"
                :disabled="loadingId === inv.id"
                class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 shadow disabled:opacity-50"
              >
                {{ loadingId === inv.id ? '...' : 'استلام 💵' }}
              </button>
              <span v-else class="text-green-600 text-xl">✅</span>
            </td>
            <td class="px-6 py-4 text-center flex justify-center gap-2">
              <button @click="openEditModal(inv)" class="text-blue-600 hover:bg-blue-100 p-2 rounded-full">✏️</button>
              <button @click="deleteInvoice(inv.id)" class="text-red-600 hover:bg-red-100 p-2 rounded-full">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div class="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6">
        <h3 class="text-lg font-bold mb-4 border-b pb-2">تعديل الفاتورة</h3>
        <form @submit.prevent="saveInvoiceEdit" class="space-y-4">
          <div>
            <label class="block text-sm text-gray-600">تاريخ الاستحقاق</label>
            <input v-model="editForm.due_date" type="date" class="w-full border p-2 rounded" required>
          </div>
          <div>
            <label class="block text-sm text-gray-600">المبلغ</label>
            <input v-model="editForm.amount" type="number" class="w-full border p-2 rounded" required>
          </div>
          <div>
            <label class="block text-sm text-gray-600">الحالة</label>
            <select v-model="editForm.status" class="w-full border p-2 rounded">
              <option>غير مدفوع</option>
              <option>مدفوع</option>
            </select>
          </div>
          <div class="flex gap-2 mt-4">
            <button type="submit" class="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 font-bold">حفظ</button>
            <button @click="showModal = false" type="button" class="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300">إلغاء</button>
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
const loadingId = ref(null)
const showModal = ref(false)
const editForm = ref({})

// حساب المجاميع
const totalUnpaid = computed(() => invoices.value.filter(i => i.status !== 'مدفوع').reduce((sum, i) => sum + i.amount, 0))
const totalPaid = computed(() => invoices.value.filter(i => i.status === 'مدفوع').reduce((sum, i) => sum + i.amount, 0))

const fetchInvoices = async () => {
  const { data } = await supabase.from('invoices').select(`*, tenants(name), units(name)`).order('due_date', { ascending: true })
  invoices.value = data || []
}

const payInvoice = async (id) => {
  if (!confirm('هل تم استلام المبلغ نقداً/تحويل؟')) return
  loadingId.value = id
  await supabase.from('invoices').update({ status: 'مدفوع' }).eq('id', id)
  loadingId.value = null
  fetchInvoices()
}

const isOverdue = (inv) => {
  if (inv.status === 'مدفوع') return false
  return new Date(inv.due_date) < new Date()
}

// فتح نافذة التعديل
const openEditModal = (inv) => {
  editForm.value = { id: inv.id, due_date: inv.due_date, amount: inv.amount, status: inv.status }
  showModal.value = true
}

// حفظ التعديلات
const saveInvoiceEdit = async () => {
  const { error } = await supabase.from('invoices').update({
    due_date: editForm.value.due_date,
    amount: editForm.value.amount,
    status: editForm.value.status
  }).eq('id', editForm.value.id)

  if (error) alert(error.message)
  else {
    showModal.value = false
    fetchInvoices()
  }
}

// حذف فاتورة فردية
const deleteInvoice = async (id) => {
  if (!confirm('حذف هذه الفاتورة؟ لن يمكنك التراجع.')) return
  await supabase.from('invoices').delete().eq('id', id)
  fetchInvoices()
}

onMounted(() => fetchInvoices())
</script>