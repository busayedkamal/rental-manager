<template>
  <div class="space-y-8 font-sans text-slate-800" dir="rtl">
    
    <div class="flex flex-col md:flex-row justify-between items-end gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">📊 لوحة القيادة</h1>
        <p class="text-slate-500 mt-1 text-sm font-medium">نظرة شمولية على الأداء المالي والتشغيلي للعقارات</p>
      </div>
      
      <button 
        @click="loadStats" 
        :disabled="loading"
        class="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <span v-if="loading" class="animate-spin text-lg">⏳</span>
        <span v-else class="text-lg">🔄</span>
        <span>{{ loading ? 'جاري التحديث...' : 'تحديث البيانات' }}</span>
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">التحصيل (الكاش)</div>
          <div class="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl ring-1 ring-emerald-100">💰</div>
        </div>
        <div v-if="loading" class="h-8 w-24 bg-slate-200 rounded animate-pulse"></div>
        <div v-else class="text-2xl font-extrabold text-slate-900 tabular-nums tracking-tight dir-ltr text-right">
          {{ formatMoney(stats.collected) }}
        </div>
        <div class="mt-2 text-[10px] font-bold text-slate-400">إجمالي المدفوعات المسجلة</div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">الديون المستحقة</div>
          <div class="h-10 w-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-xl ring-1 ring-rose-100">📉</div>
        </div>
        <div v-if="loading" class="h-8 w-24 bg-slate-200 rounded animate-pulse"></div>
        <div v-else class="text-2xl font-extrabold text-rose-600 tabular-nums tracking-tight dir-ltr text-right">
          {{ formatMoney(stats.pending) }}
        </div>
        <div class="mt-2 text-[10px] font-bold text-slate-400">فواتير واجبة السداد حالياً</div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">نسبة الإشغال</div>
          <div class="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl ring-1 ring-blue-100">🏢</div>
        </div>
        
        <div v-if="loading" class="space-y-2">
          <div class="h-6 w-16 bg-slate-200 rounded animate-pulse"></div>
          <div class="h-2 w-full bg-slate-100 rounded animate-pulse"></div>
        </div>
        
        <div v-else>
          <div class="flex items-end justify-between mb-2">
            <span class="text-2xl font-extrabold text-slate-900 tabular-nums">{{ stats.occupiedUnits }}</span>
            <span class="text-xs font-bold text-slate-400 mb-1">من أصل {{ stats.totalUnits }} وحدة</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              class="h-full rounded-full transition-all duration-1000 ease-out" 
              :class="occupancyColor"
              :style="{ width: stats.occupancyRate + '%' }"
            ></div>
          </div>
          <div class="mt-2 text-right text-xs font-bold" :class="occupancyTextColor">{{ stats.occupancyRate }}% معدل إشغال</div>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">قاعدة العملاء</div>
          <div class="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xl ring-1 ring-purple-100">👥</div>
        </div>
        <div v-if="loading" class="h-8 w-20 bg-slate-200 rounded animate-pulse"></div>
        <div v-else class="text-2xl font-extrabold text-slate-900 tabular-nums">
          {{ stats.tenantsCount }} <span class="text-sm font-medium text-slate-400">مستأجر</span>
        </div>
        <div class="mt-2 text-[10px] font-bold text-slate-400">نشط في النظام</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
        <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
            <span class="text-emerald-500">📥</span> آخر عمليات الدفع المستلمة
          </h3>
          <NuxtLink to="/collections" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline">عرض الكل</NuxtLink>
        </div>
        
        <div class="overflow-x-auto flex-1">
          <table class="min-w-full text-sm text-left">
            <thead class="bg-slate-50 text-xs text-slate-500 uppercase font-bold sticky top-0">
              <tr>
                <th class="p-3 text-right">المستأجر</th>
                <th class="p-3 text-left">التاريخ</th>
                <th class="p-3 text-left">المبلغ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="loading" v-for="n in 3" :key="n">
                <td class="p-4"><div class="h-4 w-24 bg-slate-100 rounded animate-pulse"></div></td>
                <td class="p-4"><div class="h-4 w-20 bg-slate-100 rounded animate-pulse"></div></td>
                <td class="p-4"><div class="h-4 w-16 bg-slate-100 rounded animate-pulse"></div></td>
              </tr>
              
              <tr v-else v-for="inv in recentPaid" :key="inv.id" class="hover:bg-emerald-50/30 transition-colors group">
                <td class="p-3 text-right">
                  <div class="font-bold text-slate-800 text-xs">{{ inv.tenants?.name }}</div>
                  <div class="text-[10px] text-slate-400 font-mono mt-0.5">{{ inv.units?.name }}</div>
                </td>
                <td class="p-3">
                  <span class="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600 ring-1 ring-inset ring-slate-200 tabular-nums">
                    {{ formatDate(inv.payment_date || inv.updated_at) }}
                  </span>
                </td>
                <td class="p-3 font-bold text-emerald-600 tabular-nums text-xs">+ {{ formatMoney(inv.paid_amount || 0) }}</td>
              </tr>
              
              <tr v-if="!loading && recentPaid.length === 0">
                <td colspan="3" class="p-8 text-center text-slate-400 text-xs">لا توجد عمليات دفع حديثة</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
        <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
            <span class="text-rose-500">⚠️</span> متابعة التحصيل (الأكثر استحقاقاً)
          </h3>
          <span v-if="unpaidInvoices.length" class="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 ring-1 ring-inset ring-rose-200">
            {{ unpaidInvoices.length }} فاتورة
          </span>
        </div>
        
        <div class="overflow-x-auto flex-1">
          <table class="min-w-full text-sm text-left">
            <thead class="bg-slate-50 text-xs text-slate-500 uppercase font-bold sticky top-0">
              <tr>
                <th class="p-3 text-right">المستأجر</th>
                <th class="p-3 text-right">الاستحقاق</th>
                <th class="p-3 text-left">المطلوب</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="loading" v-for="n in 3" :key="n">
                <td class="p-4"><div class="h-4 w-24 bg-slate-100 rounded animate-pulse"></div></td>
                <td class="p-4"><div class="h-4 w-20 bg-slate-100 rounded animate-pulse"></div></td>
                <td class="p-4"><div class="h-4 w-16 bg-slate-100 rounded animate-pulse"></div></td>
              </tr>

              <tr v-else v-for="inv in unpaidInvoices" :key="inv.id" class="hover:bg-rose-50/30 transition-colors">
                <td class="p-3 text-right">
                  <div class="font-bold text-slate-800 text-xs">{{ inv.tenants?.name }}</div>
                  <div class="text-[10px] text-slate-400 font-mono mt-0.5">{{ inv.units?.name }}</div>
                </td>
                <td class="p-3 text-right">
                  <div class="flex flex-col gap-1 items-end">
                    <span class="font-mono text-xs text-slate-600 font-bold">{{ inv.due_date }}</span>
                    <span v-if="isOverdue(inv.due_date)" class="inline-flex items-center rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 ring-1 ring-inset ring-rose-200">
                      متأخر
                    </span>
                    <span v-else class="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
                      قريباً
                    </span>
                  </div>
                </td>
                <td class="p-3 font-bold text-rose-600 text-xs tabular-nums text-left">
                  {{ formatMoney(inv.amount - (inv.paid_amount || 0)) }}
                </td>
              </tr>

              <tr v-if="!loading && unpaidInvoices.length === 0">
                <td colspan="3" class="p-12 text-center flex flex-col items-center justify-center">
                  <span class="text-3xl mb-2 opacity-50">🎉</span>
                  <span class="text-slate-500 text-xs font-bold">ممتاز! لا توجد ديون حالية.</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// استخدام العميل المدمج (أكثر أماناً)
import { supabase } from '@/supabase' // استيراد الملف اليدوي

const loading = ref(false)
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

// تنسيق العملة
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const formatMoney = (val) => currencyFormatter.format(Number(val || 0))

// تنسيق التاريخ
const formatDate = (dateStr) => {
  if(!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-CA')
}

// ألوان شريط الإشغال
const occupancyColor = computed(() => {
  const r = stats.value.occupancyRate
  if (r >= 90) return 'bg-emerald-500'
  if (r >= 60) return 'bg-blue-500'
  return 'bg-amber-500'
})

const occupancyTextColor = computed(() => {
  const r = stats.value.occupancyRate
  if (r >= 90) return 'text-emerald-600'
  if (r >= 60) return 'text-blue-600'
  return 'text-amber-600'
})

const isOverdue = (dateString) => {
  return new Date(dateString) < new Date(new Date().setHours(0, 0, 0, 0))
}

const loadStats = async () => {
  loading.value = true
  
  try {
    // 1. الوحدات
    const { data: units } = await supabase.from('units').select('status')
    if (units) {
      stats.value.totalUnits = units.length
      stats.value.occupiedUnits = units.filter(u => u.status === 'مؤجرة').length
      stats.value.occupancyRate = units.length ? Math.round((stats.value.occupiedUnits / units.length) * 100) : 0
    }

    // 2. الفواتير
    const { data: invoices } = await supabase
      .from('invoices')
      .select(`*, tenants(name), units(name)`)
    
    if (invoices) {
      const today = new Date()
      today.setHours(0,0,0,0)
      
      const dueSoonLimit = new Date(today)
      dueSoonLimit.setDate(today.getDate() + 60) // نظرة مستقبلية لشهرين

      // أ. المحصل
      stats.value.collected = invoices.reduce((sum, i) => sum + (Number(i.paid_amount) || 0), 0)

      // ب. الديون (المتأخرة + القريبة)
      stats.value.pending = invoices.reduce((sum, i) => {
        if (i.status === 'مدفوع' || (Number(i.paid_amount) >= Number(i.amount))) return sum
        if (new Date(i.due_date) > dueSoonLimit) return sum 
        return sum + (Number(i.amount || 0) - (Number(i.paid_amount) || 0))
      }, 0)
      
      // ج. جدول آخر المدفوعات
      recentPaid.value = invoices
        .filter(i => (Number(i.paid_amount) || 0) > 0)
        .sort((a, b) => {
          const dateA = new Date(a.payment_date || a.updated_at || a.created_at)
          const dateB = new Date(b.payment_date || b.updated_at || b.created_at)
          return dateB - dateA 
        })
        .slice(0, 5)

      // د. جدول الديون
      unpaidInvoices.value = invoices
        .filter(i => {
          if (i.status === 'مدفوع' || (Number(i.paid_amount) >= Number(i.amount))) return false
          const dueDate = new Date(i.due_date)
          return dueDate <= dueSoonLimit
        })
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        .slice(0, 6)
    }

    // 3. عدد المستأجرين
    const { count } = await supabase.from('tenants').select('*', { count: 'exact', head: true })
    stats.value.tenantsCount = count || 0

  } catch (e) {
    console.error('Error loading stats:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => loadStats())
</script>