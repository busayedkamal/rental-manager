<template>
  <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
    <h3 class="font-bold text-gray-800 flex items-center gap-2">
      <span>📂</span> أرشفة المستندات
    </h3>

    <div v-if="documents.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="doc in documents" :key="doc.id" class="relative group border rounded-lg p-2 hover:border-indigo-500 transition">
        
        <a :href="doc.file_url" target="_blank" class="block h-24 overflow-hidden rounded bg-gray-50">
           <img v-if="isImage(doc.file_url)" :src="doc.file_url" class="w-full h-full object-cover" />
           <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-2xl">📄</div>
        </a>

        <p class="text-xs text-gray-600 mt-2 truncate">{{ doc.file_name }}</p>
        <span class="text-[10px] bg-gray-100 px-1 rounded">{{ doc.file_type }}</span>

        <button @click="deleteFile(doc)" class="absolute top-1 left-1 bg-red-500 text-white w-6 h-6 rounded-full text-xs opacity-0 group-hover:opacity-100 transition shadow-md">✕</button>
      </div>
    </div>
    <div v-else class="text-center text-gray-400 py-4 text-sm border-2 border-dashed rounded-lg">
      لا توجد مستندات مرفوعة
    </div>

    <div class="flex gap-2 items-end pt-4 border-t">
      <div class="flex-1">
        <label class="text-xs font-bold text-gray-500 mb-1 block">نوع المستند</label>
        <select v-model="newFileType" class="w-full border p-2 rounded-lg text-sm bg-gray-50">
          <option>هوية / إقامة</option>
          <option>سجل تجاري</option>
          <option>صورة العقد</option>
          <option>إيصال تحويل</option>
          <option>أخرى</option>
        </select>
      </div>
      <div class="flex-1">
        <label class="text-xs font-bold text-gray-500 mb-1 block">اختر ملف</label>
        <input type="file" @change="handleFileSelect" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
      </div>
      <button @click="uploadFile" :disabled="uploading || !selectedFile" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold h-[38px] disabled:opacity-50">
        {{ uploading ? '...' : 'رفع 📤' }}
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { createClient } from '@supabase/supabase-js'

const props = defineProps({ tenantId: String }) // يجب تمرير رقم المستأجر لهذا المكون
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)

const documents = ref([])
const uploading = ref(false)
const selectedFile = ref(null)
const newFileType = ref('هوية / إقامة')

const isImage = (url) => url.match(/\.(jpeg|jpg|gif|png)$/) != null

const fetchDocuments = async () => {
  if (!props.tenantId) return
  const { data } = await supabase.from('documents').select('*').eq('tenant_id', props.tenantId)
  documents.value = data || []
}

const handleFileSelect = (event) => {
  selectedFile.value = event.target.files[0]
}

const uploadFile = async () => {
  if (!selectedFile.value || !props.tenantId) return
  uploading.value = true

  try {
    // 1. رفع الملف للـ Storage
    const fileExt = selectedFile.value.name.split('.').pop()
    const fileName = `${props.tenantId}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, selectedFile.value)
    if (uploadError) throw uploadError

    // 2. الحصول على الرابط العام
    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath)

    // 3. حفظ الرابط في قاعدة البيانات
    await supabase.from('documents').insert([{
      tenant_id: props.tenantId,
      file_name: selectedFile.value.name,
      file_url: publicUrl,
      file_type: newFileType.value
    }])

    selectedFile.value = null
    fetchDocuments()
    alert('تم رفع المستند بنجاح ✅')

  } catch (e) {
    alert('فشل الرفع: ' + e.message)
  } finally {
    uploading.value = false
  }
}

const deleteFile = async (doc) => {
  if (!confirm('حذف المستند؟')) return
  
  // حذف من الداتابيس
  await supabase.from('documents').delete().eq('id', doc.id)
  
  // (اختياري: حذف من الستورج أيضاً لتوفير المساحة)
  // const path = doc.file_url.split('/').pop()
  // await supabase.storage.from('documents').remove([path])

  fetchDocuments()
}

onMounted(() => fetchDocuments())
</script>