<template>
  <div class="space-y-6">
    
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">💸 المصروفات التشغيلية</h1>
        <p class="text-gray-500 text-sm">تسجيل فواتير الخدمات والصيانة والرواتب</p>
      </div>
      <div class="bg-red-50 text-red-700 px-4 py-2 rounded-xl font-bold border border-red-100">
        إجمالي المصروفات: {{ totalExpenses.toLocaleString() }} ريال
      </div>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <form @submit.prevent="addExpense" class="flex gap-4 items-end flex-wrap">
        <div class="flex-1 min-w-[200px]">
          <label class="text-sm font-medium text-gray-700 block mb-1">بند الصرف</label>
          <input v-model="form.title" type="text" class="input-field" placeholder="مثال: فاتورة كهرباء المبنى" required>
        </div>
        <div class="w-[150px]">
          <label class="text-sm font-medium text-gray-700 block mb-1">المبلغ</label>
          <input v-model="form.amount" type="number" class="input-field" placeholder="0.00" required>
        </div>
        <div class="w-[150px]">
          <label class="text-sm font-medium text-gray-700 block mb-1">التصنيف</label>
          <select v-model="form.category" class="input-field">
            <option>خدمات وفواتير</option>
            <option>صيانة وإصلاحات</option>
            <option>رواتب وعمالة</option>
            <option>نثريات</option>
          </select>
        </div>
        <div class="w-[150px]">
          <label class="text-sm font-medium text-gray-700 block mb-1">التاريخ</label>
          <input v-model="form.expense_date" type="date" class="input-field" required>
        </div>
        <button type="submit" :disabled="loading" class="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 h-[42px]">
          {{ loading ? '...' : 'تسجيل -' }}
        </button>
      </form>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
          <tr>
            <th class="px-6 py-3 text-right">البند</th>
            <th class="px-6 py-3 text-right">التصنيف</th>
            <th class="px-6 py-3 text-right">التاريخ</th>
            <th class="px-6 py-3 text-right">المبلغ</th>
            <th class="px-6 py-3 text-center">حذف</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="exp in expenses" :key="exp.id" class="hover:bg-red-50/30">
            <td class="px-6 py-4 font-bold text-gray-800">{{ exp.title }}</td>
            <td class="px-6 py-4"><span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{{ exp.category }}</span></td>
            <td class="px-6 py-4 text-gray-500 text-sm font-mono">{{ exp.expense_date }}</td>
            <td class="px-6 py-4 font-bold text-red-600 dir-ltr text-right">- {{ Number(exp.amount).toLocaleString() }}</td>
            <td class="px-6 py-4 text-center">
              <button @click="deleteExpense(exp.id)" class="text-gray-400 hover:text-red-600">🗑️</button>
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
const expenses = ref([])
const loading = ref(false)
const form = ref({ title: '', amount: '', category: 'خدمات وفواتير', expense_date: new Date().toISOString().split('T')[0] })

const totalExpenses = computed(() => expenses.value.reduce((sum, e) => sum + Number(e.amount), 0))

const fetchExpenses = async () => {
  const { data } = await supabase.from('expenses').select('*').order('expense_date', { ascending: false })
  expenses.value = data || []
}

const addExpense = async () => {
  loading.value = true
  const { error } = await supabase.from('expenses').insert([form.value])
  if (!error) {
    form.value.title = ''; form.value.amount = ''
    fetchExpenses()
  }
  loading.value = false
}

const deleteExpense = async (id) => {
  if (!confirm('حذف هذا المصروف؟')) return
  await supabase.from('expenses').delete().eq('id', id)
  fetchExpenses()
}

onMounted(() => fetchExpenses())
</script>

<style scoped>
.input-field { @apply w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-red-500 outline-none h-[42px]; }
</style>