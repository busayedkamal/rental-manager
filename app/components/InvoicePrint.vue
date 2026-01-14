<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/80 z-[100] flex justify-center items-center p-4 print:p-0 print:bg-white print:block">
    
    <div class="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] print:shadow-none print:max-h-none print:w-full print:rounded-none">
      
      <div class="bg-gray-100 p-4 border-b flex justify-between items-center print:hidden shrink-0">
        <h3 class="font-bold text-gray-700 flex items-center gap-2">
          <span>🧾</span> معاينة الفاتورة
        </h3>
        <div class="flex gap-3">
          <button 
            @click="printNow" 
            class="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 font-bold transition flex items-center gap-2 shadow-sm"
          >
            <span>🖨️</span> طباعة
          </button>
          
          <button 
            @click="$emit('close')" 
            class="bg-white text-red-600 border border-gray-200 px-5 py-2 rounded-lg hover:bg-red-50 font-bold transition flex items-center gap-2 shadow-sm"
          >
            <span>✖️</span> إغلاق
          </button>
        </div>
      </div>

      <div class="p-8 overflow-y-auto flex-1 bg-white text-gray-900 print:p-0 print:overflow-visible" dir="rtl">
        
        <div class="flex justify-between items-start mb-8 pb-8 border-b-2 border-gray-100">
          <div>
            <h1 class="text-2xl font-bold text-indigo-900 mb-2">فاتورة ضريبية مبسطة</h1>
            <p class="text-gray-500 text-sm">Simplified Tax Invoice</p>
          </div>
          <div class="text-left text-sm text-gray-600 space-y-1">
            <h2 class="font-bold text-lg text-gray-800">مؤسسة إدارة العقارات</h2>
            <p>الرقم الضريبي: 300000000000003</p>
            <p>الرياض - المملكة العربية السعودية</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-8 mb-8">
          <div class="space-y-2">
            <div class="flex">
              <span class="text-gray-500 w-24">المستأجر:</span>
              <span class="font-bold">{{ invoice?.tenants?.name }}</span>
            </div>
            <div class="flex">
              <span class="text-gray-500 w-24">الوحدة:</span>
              <span class="font-bold">{{ invoice?.units?.name }}</span>
            </div>
          </div>
          <div class="space-y-2 text-left" dir="ltr">
            <div class="flex justify-end gap-4">
              <span class="font-bold font-sans">INV-{{ invoice?.id?.split('-')[0].toUpperCase() }}</span>
              <span class="text-gray-500">:رقم الفاتورة</span>
            </div>
            <div class="flex justify-end gap-4">
              <span class="font-sans">{{ new Date().toISOString().split('T')[0] }}</span>
              <span class="text-gray-500">:تاريخ الإصدار</span>
            </div>
            <div class="flex justify-end gap-4">
              <span class="font-sans">{{ invoice?.due_date }}</span>
              <span class="text-gray-500">:تاريخ الاستحقاق</span>
            </div>
          </div>
        </div>

        <table class="w-full mb-8 border border-gray-200 rounded-lg overflow-hidden">
          <thead class="bg-gray-50 text-gray-700 text-sm">
            <tr>
              <th class="p-3 text-right">الوصـف</th>
              <th class="p-3 text-center">الكمية</th>
              <th class="p-3 text-left">المبلغ (SAR)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-sm">
            <tr>
              <td class="p-4">دفعة إيجار وحدة عقارية</td>
              <td class="p-4 text-center">1</td>
              <td class="p-4 text-left font-bold" dir="ltr">{{ Number(invoice?.amount).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>

        <div class="flex justify-end mb-12">
          <div class="w-1/2 space-y-3">
            <div class="flex justify-between text-gray-600 text-sm">
              <span>الإجمالي الخاضع للضريبة</span>
              <span dir="ltr">{{ (Number(invoice?.amount) / 1.15).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-gray-600 text-sm">
              <span>ضريبة القيمة المضافة (15%)</span>
              <span dir="ltr">{{ (Number(invoice?.amount) - (Number(invoice?.amount) / 1.15)).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between font-bold text-lg text-indigo-900 border-t pt-2 mt-2">
              <span>الإجمالي شامل الضريبة</span>
              <span dir="ltr">{{ Number(invoice?.amount).toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-center mt-auto">
          <img 
            :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Seller:RealEstate|TaxNo:30000000003|Date:${invoice?.created_at}|Total:${invoice?.amount}|Tax:${(Number(invoice?.amount) - (Number(invoice?.amount) / 1.15)).toFixed(2)}`" 
            alt="QR Code"
            class="w-32 h-32 border p-2 rounded-lg"
          />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: Boolean,
  invoice: Object
})

const emit = defineEmits(['close'])

const printNow = () => {
  window.print()
}
</script>

<style scoped>
@media print {
  /* إخفاء كل شيء في الصفحة ما عدا نافذة الطباعة */
  body * {
    visibility: hidden;
  }
  .fixed, .fixed * {
    visibility: visible;
  }
  .fixed {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: white;
    padding: 0;
  }
  /* إخفاء الأزرار عند الطباعة */
  button {
    display: none !important;
  }
}
</style>