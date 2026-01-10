<template>
  <div class="min-h-screen bg-gray-100 font-sans flex" dir="rtl">
    
    <aside class="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
      <div class="p-6 text-center border-b border-slate-700">
        <h1 class="text-2xl font-bold text-white">مدير العقارات 🏢</h1>
        <p class="text-slate-400 text-xs mt-1">v1.0.0</p>
      </div>
      
      <nav class="flex-1 p-4 space-y-2">
      <NuxtLink to="/" class="nav-item" active-class="active">
    📊 لوحة القيادة
  </NuxtLink>
        <NuxtLink to="/tenants" class="nav-item" active-class="active">
          👥 المستأجرين
        </NuxtLink>
        <NuxtLink to="/units" class="nav-item" active-class="active">
          🏢 الوحدات العقارية
        </NuxtLink>
        <NuxtLink to="/contracts" class="nav-item" active-class="active">
    📝 العقود والإيجارات
  </NuxtLink>
  <NuxtLink to="/finance" class="nav-item" active-class="active">
  💰 المالية والتحصيل
</NuxtLink>
      </nav>
    </aside>

    <main class="flex-1 p-8 overflow-y-auto">
      <NuxtPage />
    </main>

  </div>
</template>

<style>
.nav-item {
  @apply block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200 font-medium;
}
.active {
  @apply bg-indigo-600 text-white shadow-lg;
}
</style>
