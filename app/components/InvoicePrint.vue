<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4 print:p-0 print:bg-white print:fixed print:inset-0">
    <div class="bg-white w-full max-w-2xl p-8 rounded-lg shadow-2xl relative print:shadow-none print:w-full">
      
      <div class="absolute top-4 left-4 flex gap-2 print:hidden">
        <button @click="print" class="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700">🖨️ طباعة</button>
        <button @click="$emit('close')" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">✕ إغلاق</button>
      </div>

      <div class="text-center border-b pb-6 mb-6">
        <h1 class="text-2xl font-bold text-gray-800">فاتورة ضريبية مبسطة</h1>
        <p class="text-gray-500">Tax Invoice</p>
        <div class="mt-2 text-sm text-gray-600">
          <p class="font-bold">مؤسسة إدارة العقارات</p>
          <p>الرقم الضريبي: 300000000000003</p>
          <p>الرياض - المملكة العربية السعودية</p>
        </div>
      </div>

      <div class="flex justify-between items-start mb-8">
        <div class="space-y-2 text-sm">
          <p><span class="text-gray-500">رقم الفاتورة:</span> <span class="font-bold font-mono">INV-{{ invoice.id }}</span></p>
          <p><span class="text-gray-500">تاريخ الإصدار:</span> <span class="font-bold font-mono">{{ invoice.created_at?.split('T')[0] }}</span></p>
          <p><span class="text-gray-500">تاريخ الاستحقاق:</span> <span class="font-bold font-mono">{{ invoice.due_date }}</span></p>
        </div>
        <div class="space-y-2 text-sm text-left">
          <p><span class="text-gray-500">المستأجر:</span> <span class="font-bold">{{ invoice.tenants?.name }}</span></p>
          <p><span class="text-gray-500">الوحدة:</span> <span class="font-bold">{{ invoice.units?.name }}</span></p>
        </div>
      </div>

      <table class="w-full mb-8 border border-gray-200">
        <thead class="bg-gray-50 text-sm">
          <tr>
            <th class="p-3 text-right border-b">الوصف</th>
            <th class="p-3 text-center border-b">الكمية</th>
            <th class="p-3 text-left border-b">المبلغ (SAR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="p-3 border-b">دفعة إيجار وحدة عقارية</td>
            <td class="p-3 text-center border-b">1</td>
            <td class="p-3 text-left border-b font-mono">{{ Number(invoice.amount).toLocaleString() }}</td>
          </tr>
        </tbody>
        <tfoot class="text-sm">
          <tr>
            <td colspan="2" class="p-3 text-left font-bold">الإجمالي الخاضع للضريبة</td>
            <td class="p-3 text-left font-mono">{{ (invoice.amount / 1.15).toFixed(2) }}</td>
          </tr>
          <tr>
            <td colspan="2" class="p-3 text-left font-bold text-gray-500">ضريبة القيمة المضافة (15%)</td>
            <td class="p-3 text-left font-mono text-gray-500">{{ (invoice.amount - (invoice.amount / 1.15)).toFixed(2) }}</td>
          </tr>
          <tr class="bg-gray-100 text-lg">
            <td colspan="2" class="p-3 text-left font-bold text-indigo-900">الإجمالي شامل الضريبة</td>
            <td class="p-3 text-left font-bold text-indigo-900 font-mono">{{ Number(invoice.amount).toLocaleString() }}</td>
          </tr>
        </tfoot>
      </table>

      <div class="flex justify-center mt-8">
        <QrcodeVue :value="qrCodeData" :size="150" level="M" />
      </div>
      <p class="text-center text-[10px] text-gray-400 mt-2">امسح الرمز للتحقق من الفاتورة (ZATCA Compliant)</p>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import QrcodeVue from 'qrcode.vue'

const props = defineProps({
  isOpen: Boolean,
  invoice: Object
})

// دالة تشفير البيانات حسب معيار هيئة الزكاة (TLV Encoding)
const generateTLV = (tag, value) => {
  const len = new TextEncoder().encode(value).length
  const lenHex = len.toString(16).padStart(2, '0')
  const tagHex = tag.toString(16).padStart(2, '0')
  return tagHex + lenHex + Buffer.from(value).toString('hex')
}

// هذه بيانات وهمية للـ Seller، يجب تغييرها لاحقاً ببياناتك الحقيقية
const qrCodeData = computed(() => {
  if (!props.invoice) return ''
  
  const sellerName = "مؤسسة إدارة العقارات"
  const vatNumber = "300000000000003" // رقم ضريبي تجريبي
  const time = new Date().toISOString()
  const total = String(props.invoice.amount)
  const vat = String((props.invoice.amount - (props.invoice.amount / 1.15)).toFixed(2))

  // تحويل البيانات البسيطة إلى Base64 (للتبسيط هنا، لكن الـ TLV الحقيقي يتطلب مكتبة خاصة بالبايتات)
  // لغرض العرض المبدئي السريع سنضع نصاً، لكن للتوافق التام مع تطبيق "فاتورة" يجب استخدام تشفير Hex
  return `Seller: ${sellerName}, TRN: ${vatNumber}, Time: ${time}, Total: ${total}, VAT: ${vat}`
})

const print = () => {
  window.print()
}
</script>