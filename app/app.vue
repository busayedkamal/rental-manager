<template>
  <div v-if="$route.path !== '/login'" class="min-h-screen bg-gray-100 font-sans flex" dir="rtl">
    
    <aside class="w-64 bg-slate-900 text-white flex flex-col shadow-xl sticky top-0 h-screen">
      <div class="p-6 text-center border-b border-slate-700">
        <h1 class="text-2xl font-bold text-white">مدير العقارات 🏢</h1>
        <p class="text-slate-400 text-xs mt-1">نسخة المدير (Admin)</p>
      </div>
      
      <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
        <NuxtLink to="/" class="nav-item" active-class="active">📊 لوحة القيادة</NuxtLink>
        <NuxtLink to="/tenants" class="nav-item" active-class="active">👥 المستأجرين</NuxtLink>
        <NuxtLink to="/units" class="nav-item" active-class="active">🏢 الوحدات العقارية</NuxtLink>
        <NuxtLink to="/contracts" class="nav-item" active-class="active">📝 العقود والإيجارات</NuxtLink>
        <NuxtLink to="/finance" class="nav-item" active-class="active">💰 المالية والتحصيل</NuxtLink>
      </nav>

      <div class="p-4 border-t border-slate-700">
        <button @click="logout" class="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded transition">
          <span>تسجيل خروج</span>
          <span>🚪</span>
        </button>
      </div>
    </aside>

    <main class="flex-1 p-8 overflow-y-auto h-screen">
      <NuxtPage />
    </main>
  </div>

  <div v-else>
    <NuxtPage />
  </div>
</template>

<script setup>
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)

const logout = async () => {
  const confirmLogout = confirm('هل أنت متأكد من تسجيل الخروج؟')
  if (confirmLogout) {
    await supabase.auth.signOut()
    // إعادة تحميل الصفحة لتفعيل الحارس وتحويلك للدخول
    window.location.href = '/login'
  }
}
</script>

<style>
.nav-item {
  @apply block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200 font-medium;
}
.active {
  @apply bg-indigo-600 text-white shadow-lg;
}
</style>