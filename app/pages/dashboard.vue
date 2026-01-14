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

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <div class="bg-white p-6 rounded-xl shadow-sm border-r-4 border-green-500">
        <div class="text-gray-500 text-sm mb-1">تم تحصيله (الكاش)</div>
        <div class="text-2xl font-bold text-green-700">{{ formatMoney(stats.collected) }}</div>
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
              <td class="p-4 font-bold text-green-600 text-left" dir="ltr">+ {{ formatMoney(inv.paid_amount || 0) }}</td>
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
                <div class="flex flex-col gap-1">
                  <span class="font-sans text-gray-700 font-bold">{{ inv.due_date }}</span>
                  <span v-if="isOverdue(inv.due_date)" class="w-fit text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">متأخر</span>
                  <span v-else class="w-fit text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">مستحق قريباً</span>
                </div>
              </td>
              <td class="p-4 font-bold text-gray-700 text-left" dir="ltr">
                {{ formatMoney(inv.amount - (inv.paid_amount || 0)) }}
              </td>
            </tr>
            <tr v-if="unpaidInvoices.length === 0">
              <td colspan="3" class="p-8 text-center flex flex-col items-center">
                <span class="text-4xl mb-2">🎉</span>
                <span class="text-gray-500">ممتاز! لا توجد ديون حالية أو قريبة.</span>
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
  totalUnits: 0,
  occupiedUnits: 0,
  occupancyRate: 0,
  tenantsCount: 0
})

const recentPaid = ref([])
const unpaidInvoices = ref([])

const formatMoney = (val) => Number(val || 0).toLocaleString() + ' SAR'

const isOverdue = (dateString) => {
  return new Date(dateString) < new Date(new Date().setHours(0, 0, 0, 0))
}

const loadStats = async () => {
  console.log('بدء تحديث البيانات...') 

  // 1. الوحدات
  const { data: units } = await supabase.from('units').select('status')
  if (units) {
    stats.value.totalUnits = units.length
    stats.value.occupiedUnits = units.filter(u => u.status === 'مؤجرة').length
    stats.value.occupancyRate = units.length ? Math.round((stats.value.occupiedUnits / units.length) * 100) : 0
  }

  // 2. الفواتير
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select(`*, tenants(name), units(name)`)
  
  if (error) {
    console.error('خطأ في جلب الفواتير:', error)
  }

  if (invoices) {
    console.log(`تم جلب ${invoices.length} فاتورة`)

    const today = new Date()
    today.setHours(0,0,0,0)
    
    const dueSoonLimit = new Date(today)
    dueSoonLimit.setDate(today.getDate() + 60) // بعد شهرين

    // --- حساب الإحصائيات ---
    
    // أ. المحصل (كل ما تم دفعه)
    const collectedTotal = invoices.reduce((sum, i) => sum + (Number(i.paid_amount) || 0), 0)
    stats.value.collected = collectedTotal

    // ب. المتبقي (الديون) - نستثني المستقبلية البعيدة (أكثر من شهرين)
    stats.value.pending = invoices.reduce((sum, i) => {
      // 1. إذا الفاتورة مدفوعة بالكامل، تجاهلها
      if (i.status === 'مدفوع' || (Number(i.paid_amount) >= Number(i.amount))) return sum
      
      // 2. إذا التاريخ بعيد جداً (مستقبلي)، تجاهلها من حساب الديون الحالية
      if (new Date(i.due_date) > dueSoonLimit) return sum 

      // 3. اجمع المتبقي
      return sum + (Number(i.amount || 0) - (Number(i.paid_amount) || 0))
    }, 0)
    
    // --- الجدول الأيمن: آخر عمليات الدفع ---
    recentPaid.value = invoices
      .filter(i => (Number(i.paid_amount) || 0) > 0)
      .sort((a, b) => {
        const dateA = new Date(a.payment_date || a.updated_at || a.created_at)
        const dateB = new Date(b.payment_date || b.updated_at || b.created_at)
        return dateB - dateA 
      })
      .slice(0, 5)

    // --- الجدول الأيسر: متابعة التحصيل ---
    unpaidInvoices.value = invoices
      .filter(i => {
        // 1. استبعاد المدفوع
        if (i.status === 'مدفوع' || (Number(i.paid_amount) >= Number(i.amount))) return false
        
        // 2. التحقق من التاريخ (متأخر أو قريب)
        const dueDate = new Date(i.due_date)
        return dueDate <= dueSoonLimit
      })
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 6)
  }

  // 3. عدد المستأجرين
  const { count } = await supabase.from('tenants').select('*', { count: 'exact', head: true })
  stats.value.tenantsCount = count || 0
}

onMounted(() => loadStats())
</script>