<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 relative" dir="rtl">
    
    <div class="absolute inset-0 z-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

    <div class="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-4 border-indigo-600 z-10 relative">
      
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">مدير العقارات 🏢</h1>
        <p class="text-gray-500 mt-2">تسجيل دخول الإدارة والملاك</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
          <input v-model="email" type="email" required class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="admin@example.com" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
          <input v-model="password" type="password" required class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="••••••••" />
        </div>

        <button type="submit" :disabled="loading" class="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg disabled:opacity-50">
          {{ loading ? 'جاري التحقق...' : 'دخول 🔐' }}
        </button>

        <p v-if="errorMsg" class="text-red-500 text-sm text-center font-bold bg-red-50 p-2 rounded animate-pulse">{{ errorMsg }}</p>
      </form>

      <div class="mt-8 pt-6 border-t border-gray-100 text-center">
        <p class="text-gray-500 text-sm mb-3">لست المدير؟</p>
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold hover:underline transition">
          <span>🏠</span>
          <span>العودة للصفحة الرئيسية</span>
        </NuxtLink>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { createClient } from '@supabase/supabase-js'

definePageMeta({
  layout: false
})

const supabase = createClient(import.meta.env.NUXT_PUBLIC_SUPABASE_URL, import.meta.env.NUXT_PUBLIC_SUPABASE_KEY)
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
    // نجاح الدخول -> تحويل للوحة التحكم
    window.location.href = '/dashboard'
  }
  loading.value = false
}
</script>