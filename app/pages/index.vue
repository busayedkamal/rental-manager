<template>
  <div class="space-y-8">
    
    <div class="flex justify-between items-end">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">📊 لوحة المعلومات</h1>
        <p class="text-gray-500 mt-1">نظرة عامة على أداء عقاراتك</p>
      </div>
      <button @click="loadStats" class="text-indigo-600 hover:underline text-sm font-bold">🔄 تحديث البيانات</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      
      <div class="bg-white p-6 rounded-xl shadow-sm border-r-4 border-green-500">
        <div class="text-gray-500 text-sm mb-1">تم تحصيله (الكاش)</div>
        <div class="text-2xl font-bold text-green-700">{{ formatMoney(stats.collected) }}</div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border-r-4 border-red-500">
        <div class="text-gray-500 text-sm mb-1">ديون مستحقة (لم تدفع)</div>
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
        <div class="p-4 border-b bg-gray-50 font-bold text-gray-700">💰 آخر عمليات الدفع</div>
        <table class="min-w-full text-sm">
          <tbody class="divide-y divide-gray-100">
            <tr v-for="inv in recentPaid" :key="inv.id" class="hover:bg-gray-50">
              <td class="p-4 text-gray-600">{{ inv.tenants?.name }}</td>
              <td class="p-4 text-gray-500">{{ inv.units?.name }}</td>
              <td class="p-4 font-bold text-green-600 text-left" dir="ltr">+ {{ formatMoney(inv.amount) }}</td>
            </tr>
            <tr v-if="recentPaid.length === 0">
              <td colspan="3" class="p-6 text-center text-gray-400">لا توجد عمليات دفع حديثة</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div class="p-4 border-b bg-gray-50 font-bold text-gray-700 flex justify-between">
          <span>🔑 وحدات شاغرة (للتأجير فوراً)</span>
          <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">{{ vacantUnits.length }} وحدة</span>
        </div>
        <div class="p-4">
          <div v-if="vacantUnits.length > 0" class="flex flex-wrap gap-2">
            <span v-for="u in vacantUnits" :key="u.id" class="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg border border-gray-200 text-sm font-medium">
              {{ u.name }} ({{ u.type }})
            </span>
          </div>
          <p v-else class="text-center text-gray-400 py-4">ما شاء الله! العقار ممتلئ بالكامل 👏</p>
        </div>
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
const vacantUnits = ref([])

const formatMoney = (val) => Number(val).toLocaleString() + ' SAR'

const loadStats = async () => {
  // 1. جلب الوحدات لحساب الإشغال
  const { data: units } = await supabase.from('units').select('status, name, type')
  if (units) {
    stats.value.totalUnits = units.length
    stats.value.occupiedUnits = units.filter(u => u.status === 'مؤجرة').length
    stats.value.occupancyRate = units.length ? Math.round((stats.value.occupiedUnits / units.length) * 100) : 0
    vacantUnits.value = units.filter(u => u.status === 'شاغرة')
  }

  // 2. جلب الفواتير لحساب الماليات
  const { data: invoices } = await supabase.from('invoices').select('amount, status, created_at, tenants(name), units(name)')
  if (invoices) {
    stats.value.collected = invoices.filter(i => i.status === 'مدفوع').reduce((sum, i) => sum + i.amount, 0)
    stats.value.pending = invoices.filter(i => i.status !== 'مدفوع').reduce((sum, i) => sum + i.amount, 0)
    
    // آخر 5 مدفوعات
    recentPaid.value = invoices
      .filter(i => i.status === 'مدفوع')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // الأحدث أولاً
      .slice(0, 5)
  }

  // 3. عدد المستأجرين
  const { count } = await supabase.from('tenants').select('*', { count: 'exact', head: true })
  stats.value.tenantsCount = count || 0
}

onMounted(() => loadStats())
</script>