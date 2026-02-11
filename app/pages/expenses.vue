<template>
  <div class="space-y-8 font-sans text-slate-800" dir="rtl">
    
    <div class="flex flex-col md:flex-row justify-between items-end gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">💸 المصروفات التشغيلية</h1>
        <p class="text-slate-500 mt-1 text-sm font-medium">تسجيل فواتير الخدمات، الصيانة، والرواتب</p>
      </div>
      
      <div class="bg-rose-50 text-rose-700 px-5 py-3 rounded-xl border border-rose-100 flex flex-col items-end min-w-[200px]">
        <span class="text-xs font-bold uppercase tracking-wider text-rose-500">إجمالي المصروفات</span>
        <span class="text-2xl font-extrabold tabular-nums dir-ltr tracking-tight">{{ formatMoney(totalExpenses) }}</span>
      </div>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 class="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
        <span>📝</span> تسجيل مصروف جديد
      </h3>
      <form @submit.prevent="addExpense" class="flex gap-4 items-end flex-wrap">
        
        <div class="flex-1 min-w-[250px]">
          <label class="text-xs font-bold text-slate-500 uppercase mb-1.5 block">بند الصرف</label>
          <input v-model="form.title" type="text" class="input-field" placeholder="مثال: فاتورة كهرباء المبنى أ" required>
        </div>

        <div class="w-full md:w-[180px]">
          <label class="text-xs font-bold text-slate-500 uppercase mb-1.5 block">المبلغ</label>
          <div class="relative">
            <input v-model="form.amount" type="number" class="input-field pl-10 font-bold text-rose-600" placeholder="0.00" required>
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">SAR</span>
          </div>
        </div>

        <div class="w-full md:w-[200px]">
          <label class="text-xs font-bold text-slate-500 uppercase mb-1.5 block">التصنيف</label>
          <select v-model="form.category" class="input-field">
            <option>خدمات وفواتير</option>
            <option>صيانة وإصلاحات</option>
            <option>رواتب وعمالة</option>
            <option>تسويق وإعلان</option>
            <option>نثريات</option>
          </select>
        </div>

        <div class="w-full md:w-[160px]">
          <label class="text-xs font-bold text-slate-500 uppercase mb-1.5 block">التاريخ</label>
          <input v-model="form.expense_date" type="date" class="input-field" required>
        </div>

        <button type="submit" :disabled="loading" class="bg-rose-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-rose-700 transition shadow-sm shadow-rose-200 h-[45px] flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
          <span v-if="loading" class="animate-spin text-lg">⏳</span>
          <span>تسجيل</span>
        </button>
      </form>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
      <div v-if="pending && !expenses.length" class="p-12 text-center text-slate-400">
        <div class="animate-spin text-2xl mb-2">⏳</div>
        <p>جاري تحميل البيانات...</p>
      </div>

      <table v-else class="min-w-full divide-y divide-slate-100">
        <thead class="bg-slate-50 text-xs text-slate-500 uppercase font-bold tracking-wider">
          <tr>
            <th class="px-6 py-4 text-right">البند</th>
            <th class="px-6 py-4 text-right">التصنيف</th>
            <th class="px-6 py-4 text-right">التاريخ</th>
            <th class="px-6 py-4 text-right">المبلغ</th>
            <th class="px-6 py-4 text-center">إجراءات</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50 bg-white">
          <tr v-for="exp in expenses" :key="exp.id" class="hover:bg-rose-50/30 transition-colors group">
            
            <td class="px-6 py-4 font-bold text-slate-800">{{ exp.title }}</td>
            
            <td class="px-6 py-4">
              <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                {{ exp.category }}
              </span>
            </td>
            
            <td class="px-6 py-4 text-slate-500 text-sm font-mono tabular-nums">
              {{ exp.expense_date }}
            </td>
            
            <td class="px-6 py-4 font-extrabold text-rose-600 dir-ltr text-right tabular-nums tracking-tight">
              - {{ formatMoney(exp.amount) }}
            </td>
            
            <td class="px-6 py-4 text-center">
              <button 
                @click="deleteExpense(exp.id)" 
                :disabled="busy[exp.id]"
                class="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="حذف"
              >
                <span v-if="busy[exp.id]" class="animate-spin">⏳</span>
                <span v-else>🗑️</span>
              </button>
            </td>
          </tr>
          <tr v-if="expenses.length === 0">
            <td colspan="5" class="p-12 text-center text-slate-400">
              <span class="text-4xl block mb-2 opacity-50">💸</span>
              سجل المصروفات نظيف.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

import { supabase } from '@/supabase' // استيراد الملف اليدوي
const loading = ref(false)
const busy = reactive({}) // حالة الحذف لكل صف

const form = ref({ 
  title: '', 
  amount: '', 
  category: 'خدمات وفواتير', 
  expense_date: new Date().toISOString().split('T')[0] 
})

// جلب البيانات (SSR Friendly)
const { data: expenses, pending, refresh } = await useAsyncData('expenses-list', async () => {
  const { data } = await supabase
    .from('expenses')
    .select('*')
    .order('expense_date', { ascending: false })
  return data || []
})

// الحسابات
const totalExpenses = computed(() => {
  return (expenses.value || []).reduce((sum, e) => sum + Number(e.amount || 0), 0)
})

const formatMoney = (val) => new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 0 }).format(Number(val))

// إضافة مصروف
const addExpense = async () => {
  loading.value = true
  try {
    const { error } = await supabase.from('expenses').insert([form.value])
    if (error) throw error
    
    // إعادة تعيين النموذج وتحديث البيانات
    form.value.title = ''
    form.value.amount = ''
    await refresh()
  } catch (e) {
    alert('خطأ: ' + e.message)
  } finally {
    loading.value = false
  }
}

// حذف مصروف
const deleteExpense = async (id) => {
  if (!confirm('حذف هذا السجل؟')) return
  
  busy[id] = true
  try {
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) throw error
    await refresh()
  } catch (e) {
    alert('خطأ: ' + e.message)
  } finally {
    busy[id] = false
  }
}
</script>

<style scoped>
.input-field {
  @apply w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all shadow-sm h-[45px];
}
</style>