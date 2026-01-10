<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100" dir="rtl">
    <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-t-4 border-indigo-600">
      
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">مدير العقارات 🏢</h1>
        <p class="text-gray-500 mt-2">سجل دخولك للمتابعة</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
          <input v-model="email" type="email" required class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="admin@example.com" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
          <input v-model="password" type="password" required class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" />
        </div>

        <button type="submit" :disabled="loading" class="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50">
          {{ loading ? 'جاري التحقق...' : 'دخول 🔐' }}
        </button>

        <p v-if="errorMsg" class="text-red-500 text-sm text-center font-bold bg-red-50 p-2 rounded">{{ errorMsg }}</p>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { createClient } from '@supabase/supabase-js'

// لكي تظهر صفحة الدخول بدون القائمة الجانبية
definePageMeta({
  layout: false
})

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''
  
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  if (error) {
    errorMsg.value = 'بيانات الدخول غير صحيحة!'
  } else {
    // نجاح الدخول -> تحويل للصفحة الرئيسية
    window.location.href = '/'
  }
  loading.value = false
}
</script>