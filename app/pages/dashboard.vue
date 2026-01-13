<template>
  <div class="space-y-8">
    
    <div class="flex justify-between items-end">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">📊 لوحة المعلومات</h1>
        <p class="text-gray-500 mt-1">نظرة عامة على الأداء المالي والتشغيلي</p>
      </div>
      <button @click="loadStats" class="text-indigo-600 hover:underline text-sm font-bold flex items-center gap-1">
        <span>🔄</span> تحديث البيانات
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      
      <div class="bg-white p-6 rounded-xl shadow-sm border-r-4 border-green-500">
        <div class="text-gray-500 text-sm mb-1">تم تحصيله (الكاش)</div>
        <div class="text-2xl font-bold text-green-700">{{ formatMoney(stats.collected) }}</div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border-r-4 border-teal-500">
        <div class="text-gray-500 text-sm mb-1">صافي الربح (بعد المصروفات)</div>
        <div class="text-2xl font-bold" :class="stats.netProfit >= 0 ? 'text-teal-700' : 'text-red-600'">
          {{ formatMoney(stats.netProfit) }}
        </div>
        <div class="text-xs text-gray-400 mt-1">مصروفات: {{ formatMoney(stats.expenses) }}</div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border-r-4 border-red-500">
        <div class="text-gray-500 text-sm mb-1">ديون مستحقة (حالياً)</div>
        <div class="text-2xl font-bold text-red-600">{{ formatMoney(stats.pending) }}</div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border-r-4 border-blue-500">
        <div class="flex justify-between items-center mb-1">
          <div class="text-gray-500 text-sm">نسبة الإشغال</div>
          <div class="text-xs font-bold text-blue-600">{{ stats.occupancyRate }}%</div>
        </div>
        <div class="text-2xl font-bold text-gray-800 mb-2">{{ stats.occupiedUnits }} <span class="text-sm text-gray-400 font-normal">من أصل {{ stats.totalUnits }}</span></div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-blue-600 h-2 rounded-full transition-all duration-1000" :style="{ width: stats.occupancyRate + '%' }"></div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border-r-4 border-purple-500">
        <div class="text-gray-500 text-sm mb-1">عدد المستأجرين النشطين</div>
        <div class="text-2xl font-bold text-purple-700">{{ stats.tenantsCount }} 👤</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div class="p-4 border-b bg-gray-50 font-bold text-gray-700 flex items-center gap-2">
          <span>💰</span> آخر عمليات الدفع المستلمة
        </div>
        <table class="min-w-full text-sm">
          <tbody class="divide-y divide-gray-100">
            <tr v-for="inv in recentPaid" :key="inv.id" class="hover:bg-green-50/50 transition-colors">
              <td class="p-4">
                <div class="font-bold text-gray-700">{{ inv.tenants?.name }}</div>
                <div class="text-xs text-gray-400">{{ inv.units?.name }}</div>
              </td>
              <td class="p-4 text-gray-500 text-left" dir="ltr">
                <span class="text-xs bg-gray-100 px-2 py-1 rounded">{{ new Date(inv.payment_date || inv.updated_at).toLocaleDateString('en-CA') }}</span>
              </td>
              <td class="p-4 font-bold text-green-600 text-left" dir="ltr">+ {{ formatMoney(inv.paid_amount || inv.amount) }}</td>
            </tr>
            <tr v-if="recentPaid.length === 0">
              <td colspan="3" class="p-6 text-center text-gray-400">لا توجد عمليات دفع حديثة</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div class="p-4 border-b bg-gray-50 font-bold text-gray-700 flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span>⚠️</span> متابعة التحصيل (الأكثر استحقاقاً)
          </div>
          <span class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">{{ unpaidInvoices.length }} فاتورة</span>
        </div>
        
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 text-gray-500 font-normal">
            <tr>
              <th class="p-3 text-right font-normal">المستأجر</th>
              <th class="p-3 text-right font-normal">تاريخ الاستحقاق</th>
              <th class="p-3 text-left font-normal">المبلغ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="inv in unpaidInvoices" :key="inv.id" class="hover:bg-gray-50 transition-colors">
              <td class="p-4">
                <div class="font-bold text-gray-800">{{ inv.tenants?.name }}</div>
                <div class="text-xs text-gray-500">{{ inv.units?.name }}</div>
              </td>
              <td class="p-4">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-gray-700">{{ inv.due_date }}</span>
                  <span v-if="isOverdue(inv.due_date)" class="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">متأخر</span>
                  <span v-else class="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">قريباً</span>
                </div>
              </td>
              <td class="p-4 font-bold text-gray-700 text-left" dir="ltr">
                {{ formatMoney(inv.amount - (inv.paid_amount || 0)) }}
              </td>
            </tr>
            <tr v-if="unpaidInvoices.length === 0">
              <td colspan="3" class="p-8 text-center flex flex-col items-center">
                <span class="text-4xl mb-2">🎉</span>
                <span class="text-gray-500">ممتاز! لا توجد ديون أو مستحقات قريبة.</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)

const stats = ref({
  collected: 0,
  pending: 0,
  expenses: 0,
  netProfit: 0,
  totalUnits: 0,
  occupiedUnits: 0,
  occupancyRate: 0,
  tenantsCount: 0
})

const recentPaid = ref([])
const unpaidInvoices = ref([])

const formatMoney = (val) => Number(val).toLocaleString() + ' SAR'

const isOverdue = (dateString) => {
  return new Date(dateString) < new Date(new Date().setHours(0, 0, 0, 0))
}

const loadStats = async () => {
  // 1. المصروفات
  const { data: expensesData } = await supabase.from('expenses').select('amount')
  const totalExpenses = expensesData ? expensesData.reduce((sum, e) => sum + Number(e.amount), 0) : 0
  stats.value.expenses = totalExpenses

  // 2. الوحدات
  const { data: units } = await supabase.from('units').select('status')
  if (units) {
    stats.value.totalUnits = units.length
    stats.value.occupiedUnits = units.filter(u => u.status === 'مؤجرة').length
    stats.value.occupancyRate = units.length ? Math.round((stats.value.occupiedUnits / units.length) * 100) : 0
  }

  // 3. الفواتير (جلب وتحليل ذكي)
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, amount, paid_amount, status, due_date, payment_date, created_at, updated_at, tenants(name), units(name)')
  
  if (invoices) {
    const today = new Date()
    today.setHours(0,0,0,0)
    
    // تاريخ بعد 3 أشهر من الآن (لتجاهل المستحقات البعيدة جداً مثل 2030 من الإحصائيات الحالية)
    const futureThreshold = new Date(today)
    futureThreshold.setMonth(today.getMonth() + 3)

    // --- حساب الإحصائيات ---
    // المحصل: كل ما تم دفعه (بغض النظر عن التاريخ)
    const collectedTotal = invoices.reduce((sum, i) => sum + (Number(i.paid_amount) || 0), 0)
    stats.value.collected = collectedTotal
    stats.value.netProfit = collectedTotal - totalExpenses

    // المتبقي (الديون): نحسب فقط الديون الحالية أو القريبة (نستثني العقود المستقبلية البعيدة)
    stats.value.pending = invoices.reduce((sum, i) => {
      // إذا كان مدفوع بالكامل، لا نحسبه
      if (i.status === 'مدفوع') return sum
      
      // إذا كان تاريخ الاستحقاق بعيداً جداً (أكثر من 3 أشهر)، لا نعتبره ديناً حالياً
      if (new Date(i.due_date) > futureThreshold) return sum

      return sum + (Number(i.amount) - (Number(i.paid_amount) || 0))
    }, 0)
    
    // --- الجدول الأيمن: آخر عمليات الدفع ---
    // نرتب حسب تاريخ الدفع (payment_date) إذا وجد، أو تاريخ التحديث
    recentPaid.value = invoices
      .filter(i => (Number(i.paid_amount) || 0) > 0) // فقط الفواتير التي تم دفع جزء منها
      .sort((a, b) => {
        const dateA = new Date(a.payment_date || a.updated_at)
        const dateB = new Date(b.payment_date || b.updated_at)
        return dateB - dateA // الأحدث أولاً
      })
      .slice(0, 5)

    // --- الجدول الأيسر: متابعة التحصيل (المتعثرة والقريبة) ---
    unpaidInvoices.value = invoices
      .filter(i => {
        if (i.status === 'مدفوع') return false // نستبعد المدفوع
        const dueDate = new Date(i.due_date)
        // نريد فقط: المتأخرات (قبل اليوم) + المستحقات القريبة (خلال 3 أشهر)
        // ونستبعد فواتير 2030 وما بعدها
        return dueDate <= futureThreshold
      })
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date)) // الأقدم استحقاقاً أولاً (المتأخرات تظهر في الأعلى)
      .slice(0, 6)
  }

  // 4. المستأجرين
  const { count } = await supabase.from('tenants').select('*', { count: 'exact', head: true })
  stats.value.tenantsCount = count || 0
}

onMounted(() => loadStats())
</script>