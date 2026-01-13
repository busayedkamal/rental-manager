<template>
  <div v-if="loading" class="text-center p-10 text-gray-500">جاري تحميل الملف...</div>
  
  <div v-else class="space-y-6">
    
    <div class="bg-white rounded-xl shadow-sm border-t-4 border-indigo-600 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div class="flex items-center gap-4">
        <div class="bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center text-3xl">👤</div>
        <div>
          <h1 class="text-2xl font-bold text-gray-800">{{ tenant.name }}</h1>
          <p class="text-gray-500 flex items-center gap-2 mt-1">
            <span>📱 {{ tenant.phone }}</span>
            <span v-if="tenant.email" class="text-gray-300">|</span>
            <span v-if="tenant.email">📧 {{ tenant.email }}</span>
          </p>
          <p v-if="tenant.contact_person" class="text-sm text-indigo-600 mt-1 font-bold bg-indigo-50 px-2 py-1 rounded w-fit">
            المسؤول: {{ tenant.contact_person }}
          </p>
        </div>
      </div>
      
      <div class="bg-gray-50 px-6 py-4 rounded-xl border border-gray-200 text-center min-w-[200px]">
        <div class="text-sm text-gray-500 mb-1">رصيد المحفظة</div>
        <div class="text-3xl font-bold dir-ltr" 
             :class="walletBalance >= 0 ? 'text-green-600' : 'text-red-600'">
          {{ formatMoney(walletBalance) }}
        </div>
        <div class="text-xs mt-1" :class="walletBalance >= 0 ? 'text-green-500' : 'text-red-400'">
          {{ walletBalance >= 0 ? 'رصيد دائن (له)' : 'مبالغ مستحقة (عليه)' }}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <div class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 class="font-bold text-gray-800 mb-4 border-b pb-2">🏠 العقد الحالي والوحدة</h3>
          
          <div v-if="activeContract" class="space-y-4 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">الوحدة:</span>
              <span class="font-bold">{{ activeContract.units?.name }} ({{ activeContract.units?.type }})</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">مدة العقد:</span>
              <span dir="ltr">{{ activeContract.start_date }} ➝ {{ activeContract.end_date }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">قيمة الإيجار:</span>
              <span class="font-bold">{{ formatMoney(activeContract.amount) }}</span>
            </div>
            
            <div class="bg-blue-50 p-3 rounded-lg mt-4 space-y-2 border border-blue-100">
              <div class="flex items-center gap-2 text-blue-800">
                <span>⚡ عداد الكهرباء:</span>
                <span class="font-bold font-mono">{{ activeContract.units?.electricity_meter || 'غير مسجل' }}</span>
              </div>
              <div class="flex items-center gap-2 text-blue-800">
                <span>💧 عداد الماء:</span>
                <span class="font-bold font-mono">{{ activeContract.units?.water_meter || 'غير مسجل' }}</span>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center text-gray-400 py-4">
            لا يوجد عقد نشط حالياً
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex flex-col gap-2">
          <a :href="`tel:${tenant.phone}`" class="block w-full text-center bg-green-50 text-green-700 py-2 rounded-lg hover:bg-green-100 font-bold transition">
            📞 اتصال
          </a>
          <a :href="`https://wa.me/966${tenant.phone.slice(1)}`" target="_blank" class="block w-full text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-bold transition">
            💬 واتساب
          </a>
        </div>

        <div class="mt-6">
          <DocumentsManager :tenantId="tenant.id" />
        </div>

      </div>

      <div class="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 class="font-bold text-gray-800">📜 كشف الحساب المالي</h3>
          <span class="text-xs bg-gray-200 px-2 py-1 rounded">عدد العمليات: {{ invoices.length }}</span>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50 text-gray-500">
              <tr>
                <th class="p-3 text-right">الاستحقاق</th>
                <th class="p-3 text-right">المطلوب</th>
                <th class="p-3 text-right">المدفوع</th>
                <th class="p-3 text-right">تاريخ السداد</th>
                <th class="p-3 text-right">الرصيد/الحالة</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="inv in invoices" :key="inv.id" class="hover:bg-gray-50 group">
                <td class="p-3 font-mono text-gray-600">{{ inv.due_date }}</td>
                <td class="p-3 font-bold">{{ formatMoney(inv.amount) }}</td>
                <td class="p-3 text-green-600 font-bold">
                  <span v-if="inv.paid_amount > 0">✅ {{ formatMoney(inv.paid_amount) }}</span>
                  <span v-else class="text-gray-300">-</span>
                </td>
                
                <td class="p-3">
                  <div v-if="editingDateId === inv.id" class="flex items-center gap-1">
                    <input type="date" v-model="tempDate" class="w-full border rounded px-1 py-0.5 text-xs bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                    <button @click="savePaymentDate(inv.id)" class="text-green-600 hover:bg-green-100 p-1 rounded">💾</button>
                    <button @click="editingDateId = null" class="text-red-500 hover:bg-red-100 p-1 rounded">✕</button>
                  </div>
                  
                  <div v-else class="flex items-center justify-between gap-2">
                    <span v-if="inv.payment_date" class="bg-gray-100 text-gray-600 font-mono text-xs px-2 py-1 rounded border">
                      {{ inv.payment_date }}
                    </span>
                    <span v-else class="text-gray-300 text-xs">-</span>
                    
                    <button @click="enableDateEdit(inv)" class="text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" title="تعديل التاريخ">
                      ✏️
                    </button>
                  </div>
                </td>

                <td class="p-3">
                  <span v-if="inv.paid_amount >= inv.amount" class="text-green-600 text-xs font-bold">خالص</span>
                  <span v-else-if="inv.paid_amount > 0" class="text-orange-500 text-xs font-bold">
                    باقي {{ formatMoney(inv.amount - inv.paid_amount) }}
                  </span>
                  <span v-else class="text-red-500 text-xs font-bold">غير مدفوع</span>
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50 font-bold">
              <tr>
                <td class="p-3 text-right">الإجمالي</td>
                <td class="p-3">{{ formatMoney(totals.required) }}</td>
                <td class="p-3 text-green-600">{{ formatMoney(totals.paid) }}</td>
                <td class="p-3"></td>
                <td class="p-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { createClient } from '@supabase/supabase-js'
import DocumentsManager from '~/components/DocumentsManager.vue'

const route = useRoute()
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)

const loading = ref(true)
const tenant = ref({})
const activeContract = ref(null)
const invoices = ref([])

// متغيرات التعديل الجديدة 👇
const editingDateId = ref(null)
const tempDate = ref('')

const formatMoney = (val) => Number(val).toLocaleString()

// حسابات المحفظة
const totals = computed(() => {
  const required = invoices.value.reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
  const paid = invoices.value.reduce((sum, inv) => sum + Number(inv.paid_amount || 0), 0)
  return { required, paid }
})

const walletBalance = computed(() => totals.value.paid - totals.value.required)

const loadData = async () => {
  const id = route.params.id
  
  // 1. بيانات المستأجر
  const { data: t } = await supabase.from('tenants').select('*').eq('id', id).single()
  tenant.value = t

  // 2. العقد النشط
  const { data: c } = await supabase
    .from('contracts')
    .select('*, units(*)') 
    .eq('tenant_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
  
  if (c && c.length > 0) activeContract.value = c[0]

  // 3. الفواتير
  const { data: inv } = await supabase
    .from('invoices')
    .select('*')
    .eq('tenant_id', id)
    .order('due_date', { ascending: false }) 
  
  invoices.value = inv || []
  loading.value = false
}

// 👇 دوال تعديل التاريخ الجديدة
const enableDateEdit = (inv) => {
  editingDateId.value = inv.id
  tempDate.value = inv.payment_date || new Date().toISOString().split('T')[0] // التاريخ الحالي افتراضياً
}

const savePaymentDate = async (id) => {
  if (!tempDate.value) return // منع الحفظ إذا كان فارغاً
  
  const { error } = await supabase
    .from('invoices')
    .update({ payment_date: tempDate.value })
    .eq('id', id)

  if (error) {
    alert('خطأ في التحديث: ' + error.message)
  } else {
    // تحديث البيانات محلياً وإغلاق وضع التعديل
    await loadData()
    editingDateId.value = null
  }
}

onMounted(() => loadData())
</script>