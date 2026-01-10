<template>
  <div class="space-y-6">
    
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
            <th class="px-6 py-3 text-right">المستأجر</th>
            <th class="px-6 py-3 text-right">الوحدة</th>
            <th class="px-6 py-3 text-right">تاريخ الاستحقاق</th>
            <th class="px-6 py-3 text-right">المبلغ</th>
            <th class="px-6 py-3 text-right">الحالة</th>
            <th class="px-6 py-3 text-center">إجراء</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="inv in invoices" :key="inv.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 font-bold">{{ inv.tenants?.name }}</td>
            <td class="px-6 py-4">{{ inv.units?.name }}</td>
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
                class="bg-green-600 text-white px-4 py-1 rounded text-sm hover:bg-green-700 shadow disabled:opacity-50"
              >
                {{ loadingId === inv.id ? '...' : 'استلام 💵' }}
              </button>
              <span v-else class="text-green-600 text-xl">✅</span>
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
const invoices = ref([])
const loadingId = ref(null)

// حساب المجاميع
const totalUnpaid = computed(() => invoices.value.filter(i => i.status !== 'مدفوع').reduce((sum, i) => sum + i.amount, 0))
const totalPaid = computed(() => invoices.value.filter(i => i.status === 'مدفوع').reduce((sum, i) => sum + i.amount, 0))

const fetchInvoices = async () => {
  const { data } = await supabase
    .from('invoices')
    .select(`*, tenants(name), units(name)`)
    .order('due_date', { ascending: true }) // الأقرب استحقاقاً في الأعلى
  invoices.value = data || []
}

const payInvoice = async (id) => {
  if (!confirm('هل أنت متأكد من استلام مبلغ هذه الفاتورة؟')) return
  
  loadingId.value = id
  const { error } = await supabase
    .from('invoices')
    .update({ status: 'مدفوع' }) // يمكن إضافة حقل تاريخ الدفع هنا مستقبلاً
    .eq('id', id)
  
  if (!error) {
    // تحديث الحالة محلياً
    const inv = invoices.value.find(i => i.id === id)
    if (inv) inv.status = 'مدفوع'
  }
  loadingId.value = null
}

const isOverdue = (inv) => {
  if (inv.status === 'مدفوع') return false
  return new Date(inv.due_date) < new Date()
}

onMounted(() => fetchInvoices())
</script>