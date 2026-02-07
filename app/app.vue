<template>
  <div v-if="!isPublicPage" class="min-h-screen bg-gray-50 font-sans flex" dir="rtl">
    
    <aside class="w-64 bg-slate-900 text-white flex flex-col shadow-xl sticky top-0 h-screen z-20">
      <div class="p-6 text-center border-b border-slate-700">
        <h1 class="text-2xl font-bold text-white">مدير العقارات 🏢</h1>
        <p class="text-slate-400 text-xs mt-1">لوحة التحكم (Admin)</p>
      </div>
      
      <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
        <NuxtLink to="/dashboard" class="nav-item" active-class="active">📊 لوحة القيادة</NuxtLink>
        <NuxtLink to="/tenants" class="nav-item" active-class="active">👥 المستأجرين</NuxtLink>
        <NuxtLink to="/units" class="nav-item" active-class="active">🏢 الوحدات العقارية</NuxtLink>
        <NuxtLink to="/contracts" class="nav-item" active-class="active">📝 العقود والإيجارات</NuxtLink>
        
        <div class="pt-4 pb-2 text-xs text-slate-500 font-bold px-2">الإدارة المالية</div>
        <NuxtLink to="/finance" class="nav-item" active-class="active">💰 الاستحقاقات (الفواتير)</NuxtLink>
        <NuxtLink to="/collections" class="nav-item" active-class="active">💸 سجل التحصيل (الفعلي)</NuxtLink>
      </nav>

      <div class="p-4 border-t border-slate-700">
        <button @click="logout" class="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded transition">
          <span>تسجيل خروج</span>
          <span>🚪</span>
        </button>
      </div>
    </aside>

    <main class="flex-1 h-screen overflow-y-auto flex flex-col">
      
      <header class="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <h2 class="text-xl font-bold text-gray-800">مرحباً بك 👋</h2>
        
        <div class="flex items-center gap-4">
          <NotificationBell />
          
          <div class="h-8 w-[1px] bg-gray-300 mx-2"></div>
          
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs border border-indigo-200">
              M
            </div>
            <span class="text-sm font-bold text-gray-700">المدير العام</span>
          </div>
        </div>
      </header>

      <div class="p-8 flex-1">
        <NuxtPage />
      </div>
    </main>
  </div>

  <div v-else>
    <NuxtPage />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
// ❌ حذفنا استيراد createClient لأنه غير ضروري
import NotificationBell from '~/components/NotificationBell.vue'

// ✅ نستخدم الكومبوزابل الجاهز من Nuxt بدلاً من الإنشاء اليدوي
const supabase = useSupabaseClient()
const route = useRoute()

const isPublicPage = computed(() => {
  return ['/', '/login'].includes(route.path) || route.path.startsWith('/portal')
})

const logout = async () => {
  if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
    await supabase.auth.signOut()
    window.location.href = '/'
  }
}
</script>

<style>
:root {
  --font-heading: 'Cairo', sans-serif;
  --font-body: 'Tajwal', sans-serif;
}

body {
  font-family: var(--font-body);
  font-weight: 400;
  line-height: 1.6;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading) !important;
  font-weight: 700;
}

.nav-item {
  @apply block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200 font-medium flex items-center gap-2;
  font-family: var(--font-body);
}
.active {
  @apply bg-indigo-600 text-white shadow-lg;
}
</style>