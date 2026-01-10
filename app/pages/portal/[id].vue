<template>
  <div v-if="loading" class="min-h-screen flex items-center justify-center bg-gray-50 text-indigo-600">
    <div class="flex flex-col items-center gap-2">
      <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p>جاري تحميل بياناتك...</p>
    </div>
  </div>

  <div v-else-if="!tenant" class="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4 text-center p-4">
    <div class="text-6xl mb-2">🚫</div>
    <h1 class="text-2xl font-bold text-gray-800">عفواً، الرابط غير صحيح</h1>
    <p class="text-gray-500">تأكد من الرابط أو تواصل مع إدارة العقار.</p>
    <NuxtLink to="/" class="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 mt-4 shadow-lg transition">
      العودة للصفحة الرئيسية 🏠
    </NuxtLink>
  </div>

  <div v-else class="min-h-screen bg-gray-50 font-sans" dir="rtl">
    
    <nav class="bg-white shadow-sm border-b px-4 py-3 sticky top-0 z-20">
      <div class="max-w-6xl mx-auto flex justify-between items-center">
        
        <div class="flex items-center gap-3">
          
          <NuxtLink to="/" class="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 group" title="خروج للصفحة الرئيسية">
            <span class="group-hover:-translate-x-1 transition-transform">🏠</span>
            <span class="hidden sm:inline">الرئيسية</span>
          </NuxtLink>

          <div class="h-6 w-px bg-gray-300 hidden sm:block"></div>

          <div class="flex items-center gap-2">
            <span class="bg-indigo-600 text-white p-1.5 rounded-lg text-lg hidden sm:block">👤</span>
            <div>
              <h1 class="text-lg font-bold text-gray-800 leading-tight">لوحة المستأجر</h1>
              <span class="text-[10px] text-gray-500 block leading-tight" dir="ltr">Rental Dashboard</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 md:gap-4">
          <span class="text-sm font-bold text-gray-700 hidden md:block">أهلاً، {{ tenant.name }} 👋</span>
          <div class="text-xs px-3 py-1 rounded-full font-bold border"
            :class="activeContract ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'">
            {{ activeContract ? 'عقد ساري ✅' : 'لا يوجد عقد' }}
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      
      <div v-if="overdueAmount > 0" class="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg flex flex-col md:flex-row justify-between items-center shadow-sm gap-4 animate-pulse-slow">
        <div class="flex items-center gap-3">
          <span class="text-2xl">⚠️</span>
          <div>
            <h3 class="font-bold text-red-800">تنبيه: يوجد دفعات مستحقة!</h3>
            <p class="text-sm text-red-600">إجمالي المبلغ المتأخر: <b class="text-lg">{{ formatMoney(overdueAmount) }}</b></p>
          </div>
        </div>
        <a href="https://wa.me/966500000000" target="_blank" class="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 shadow-sm w-full md:w-auto text-center transition">
          تواصل للسداد فوراً 📞
        </a>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div class="space-y-6">
          
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
              <span>📄</span> تفاصيل العقد
            </h2>
            <div v-if="activeContract" class="space-y-3 text-sm">
              <div class="flex justify-between items-center">
                <span class="text-gray-500">الوحدة:</span>
                <span class="font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">
                  {{ activeContract.units?.name }} ({{ activeContract.units?.type }})
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">بداية العقد:</span>
                <span dir="ltr" class="font-mono text-gray-700">{{ activeContract.start_date }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">نهاية العقد:</span>
                <span dir="ltr" class="font-mono text-gray-700">{{ activeContract.end_date }}</span>
              </div>
              <div class="flex justify-between items-center pt-2 border-t mt-2">
                <span class="text-gray-500">قيمة العقد:</span>
                <span class="font-bold text-indigo-600 text-base">{{ formatMoney(activeContract.amount) }}</span>
              </div>
            </div>
            <div v-else class="text-center text-gray-400 py-8 bg-gray-50 rounded-lg border border-dashed">
              لا يوجد عقد نشط حالياً
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>💰</span> ملخص مالي
            </h2>
            <div class="grid grid-cols-2 gap-4 text-center">
              <div class="bg-green-50 p-3 rounded-xl border border-green-100">
                <div class="text-xs text-green-600 mb-1 font-bold">تم سداده</div>
                <div class="font-bold text-green-800 text-lg">{{ formatMoney(totalPaid) }}</div>
              </div>
              <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div class="text-xs text-gray-600 mb-1 font-bold">المتبقي</div>
                <div class="font-bold text-gray-800 text-lg">{{ formatMoney(totalRemaining) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 space-y-6">
          
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-5 border-b flex justify-between items-center bg-gray-50/50">
              <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span>📊</span> جدول الدفعات
              </h2>
            </div>
            
            <div v-if="invoices.length > 0" class="overflow-x-auto">
              <table class="w-full text-sm text-right">
                <thead class="bg-gray-50 text-gray-500 font-medium border-b">
                  <tr>
                    <th class="p-4 whitespace-nowrap">تاريخ الاستحقاق</th>
                    <th class="p-4 whitespace-nowrap">المبلغ</th>
                    <th class="p-4 whitespace-nowrap">الحالة</th>
                    <th class="p-4 whitespace-nowrap">المدفوع</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="inv in invoices" :key="inv.id" class="hover:bg-indigo-50/30 transition-colors">
                    <td class="p-4 font-mono text-gray-600" :class="{'text-red-600 font-bold': isOverdue(inv)}">
                      {{ inv.due_date }}
                    </td>
                    <td class="p-4 font-bold text-gray-800">{{ formatMoney(inv.amount) }}</td>
                    <td class="p-4">
                      <span class="px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1"
                        :class="{
                          'bg-green-100 text-green-700 border border-green-200': inv.status === 'مدفوع',
                          'bg-yellow-100 text-yellow-800 border border-yellow-200': inv.status === 'مدفوع جزئياً',
                          'bg-red-100 text-red-700 border border-red-200': inv.status === 'غير مدفوع' && isOverdue(inv),
                          'bg-gray-100 text-gray-600 border border-gray-200': inv.status === 'غير مدفوع' && !isOverdue(inv)
                        }">
                        {{ isOverdue(inv) && inv.status !== 'مدفوع' ? '⚠️ متأخر' : inv.status }}
                      </span>
                    </td>
                    <td class="p-4 text-gray-500">
                      <div v-if="inv.paid_amount > 0">
                        <span class="text-green-600 font-bold block">{{ formatMoney(inv.paid_amount) }}</span>
                        <span v-if="inv.payment_date" class="text-[10px] text-gray-400 font-mono">{{ inv.payment_date }}</span>
                      </div>
                      <div v-else class="text-gray-300">-</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="p-10 text-center flex flex-col items-center gap-2">
              <span class="text-4xl">📭</span>
              <p class="text-gray-500">لا توجد فواتير مسجلة لهذا العقد حالياً.</p>
            </div>
          </div>

          <div class="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 class="font-bold text-indigo-900 text-lg">هل تحتاج مساعدة؟ 🤔</h3>
              <p class="text-sm text-indigo-700 mt-1">يمكنك التواصل مع الإدارة مباشرة لطلبات الصيانة أو الاستفسارات.</p>
            </div>
            <a href="https://wa.me/" target="_blank" class="bg-white text-green-600 px-5 py-2.5 rounded-lg font-bold border border-green-200 hover:bg-green-50 flex items-center gap-2 shadow-sm transition transform hover:-translate-y-0.5">
               <span>💬</span> <span>تواصل واتساب</span>
            </a>
          </div>

        </div>
      </div>
    </main>
    
    <footer class="text-center py-6 text-gray-400 text-xs border-t mt-8 bg-white">
      نظام مدير العقارات - جميع الحقوق محفوظة
    </footer>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { createClient } from '@supabase/supabase-js'

// إخفاء القائمة الجانبية (Layout)
definePageMeta({
  layout: false
})

const route = useRoute()
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)

const loading = ref(true)
const tenant = ref(null)
const activeContract = ref(null)
const invoices = ref([])

// التنسيق المالي
const formatMoney = (val) => Number(val).toLocaleString() + ' SAR'

// التحقق من التأخير
const isOverdue = (inv) => {
  if (['مدفوع', 'مدفوع جزئياً'].includes(inv.status)) return false
  return new Date(inv.due_date) < new Date()
}

// المجاميع المالية
const overdueAmount = computed(() => {
  return invoices.value
    .filter(i => isOverdue(i) && !['مدفوع'].includes(i.status))
    .reduce((sum, i) => sum + (i.amount - (i.paid_amount || 0)), 0)
})

const totalPaid = computed(() => invoices.value.reduce((sum, i) => sum + (i.paid_amount || 0), 0))
const totalRemaining = computed(() => invoices.value.reduce((sum, i) => sum + (i.amount - (i.paid_amount || 0)), 0))

const loadTenantData = async () => {
  const tenantId = route.params.id
  
  if (!tenantId) {
    loading.value = false
    return
  }

  try {
    // 1. جلب بيانات المستأجر
    const { data: t, error: tError } = await supabase.from('tenants').select('*').eq('id', tenantId).single()
    if (tError || !t) throw new Error('Tenant not found')
    tenant.value = t

    // 2. جلب العقد النشط
    const { data: contracts } = await supabase
      .from('contracts')
      .select('*, units(name, type)')
      .eq('tenant_id', tenantId)
      .eq('status', 'ساري') // تأكد أن الحالة في قاعدة البيانات مطابقة (ساري/منتهي)
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (contracts && contracts.length > 0) {
      activeContract.value = contracts[0]
    }

    // 3. جلب الفواتير
    const { data: invs } = await supabase
      .from('invoices')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('due_date', { ascending: true })
    
    invoices.value = invs || []

  } catch (e) {
    console.error(e)
    tenant.value = null 
  } finally {
    loading.value = false
  }
}

onMounted(() => loadTenantData())
</script>