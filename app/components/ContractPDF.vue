<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/80 z-[60] flex justify-center items-center p-4 overflow-y-auto">
    <div class="bg-gray-100 w-full max-w-4xl rounded-lg shadow-2xl relative">
      
      <div class="bg-indigo-900 text-white p-4 flex justify-between items-center rounded-t-lg sticky top-0 z-10">
        <h3 class="font-bold text-lg">📄 معاينة العقد الإلكتروني</h3>
        <div class="flex gap-2">
          <button @click="downloadPDF" :disabled="generating" class="bg-white text-indigo-900 px-4 py-2 rounded hover:bg-indigo-50 font-bold transition flex items-center gap-2">
            {{ generating ? 'جاري التحميل...' : '⬇️ تحميل PDF' }}
          </button>
          <button @click="$emit('close')" class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white font-bold">إغلاق</button>
        </div>
      </div>

      <div id="contract-content" class="bg-white p-12 text-black text-right shadow-lg mx-auto my-8 max-w-[210mm] min-h-[297mm]" style="font-family: 'Times New Roman', serif;">
        
        <div class="text-center border-b-2 border-black pb-6 mb-8">
          <h1 class="text-3xl font-bold mb-2">عقد إيجار وحدة عقارية</h1>
          <p class="text-gray-500">Rental Lease Agreement</p>
          <p class="mt-2 font-sans text-sm">رقم العقد: CNT-{{ contract.id }}</p>
        </div>

        <div class="mb-8 space-y-4">
          <h2 class="text-xl font-bold underline mb-4">أولاً: أطراف العقد</h2>
          <p class="leading-loose">
            <strong>الطرف الأول (المؤجر):</strong> مؤسسة إدارة العقارات، سجل تجاري رقم (1010000000).<br>
            <strong>الطرف الثاني (المستأجر):</strong> السيد/السادة <strong>{{ contract.tenants?.name }}</strong>، 
            رقم الجوال ({{ contract.tenants?.phone }})
            <span v-if="contract.tenants?.email">، البريد الإلكتروني ({{ contract.tenants?.email }})</span>.
          </p>
        </div>

        <div class="mb-8 space-y-4">
          <h2 class="text-xl font-bold underline mb-4">ثانياً: بيانات العين المؤجرة</h2>
          <table class="w-full border border-black text-center">
            <thead class="bg-gray-100 border-b border-black">
              <tr>
                <th class="p-2 border-l border-black">اسم الوحدة</th>
                <th class="p-2 border-l border-black">النوع</th>
                <th class="p-2">عداد الكهرباء</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cu in contract.contract_units" :key="cu.id">
                <td class="p-2 border-l border-black border-t border-black">{{ cu.units?.name }}</td>
                <td class="p-2 border-l border-black border-t border-black">{{ cu.units?.type }}</td>
                <td class="p-2 border-t border-black font-sans">{{ cu.units?.electricity_meter || '---' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mb-8 space-y-4">
          <h2 class="text-xl font-bold underline mb-4">ثالثاً: المدة والقيمة الإيجارية</h2>
          <ul class="list-disc list-inside leading-loose mr-4">
            <li>تبدأ مدة هذا العقد من تاريخ <strong>{{ contract.start_date }}</strong> وتنتهي بتاريخ <strong>{{ contract.end_date }}</strong>.</li>
            <li>القيمة الإيجارية السنوية المتفق عليها هي <strong>{{ Number(contract.amount).toLocaleString() }} ريال سعودي</strong>.</li>
            <li>يلتزم الطرف الثاني بسداد الإيجار وفق الدفعات المجدولة في النظام.</li>
          </ul>
        </div>

        <div class="mt-20 flex justify-between px-10">
          <div class="text-center">
            <p class="font-bold mb-4">الطرف الأول (المؤجر)</p>
            <p class="text-gray-400">........................</p>
          </div>
          <div class="text-center">
            <p class="font-bold mb-4">الطرف الثاني (المستأجر)</p>
            <p class="text-gray-400">........................</p>
          </div>
        </div>

        <div class="mt-20 text-center text-xs text-gray-400 border-t pt-4">
          تم إصدار هذا العقد إلكترونياً عبر نظام مدير العقارات بتاريخ {{ new Date().toLocaleDateString('ar-SA') }}
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  contract: Object
})
const emit = defineEmits(['close'])

const generating = ref(false)

const downloadPDF = async () => {
  if (process.client) {
    generating.value = true
    const html2pdf = (await import('html2pdf.js')).default
    const element = document.getElementById('contract-content')
    
    const opt = {
      margin:       10,
      filename:     `contract-${props.contract.id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }

    await html2pdf().set(opt).from(element).save()
    generating.value = false
  }
}
</script>