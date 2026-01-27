<template>
  <div class="relative" ref="container">
    <button @click="isOpen = !isOpen" class="relative p-2 text-gray-500 hover:text-indigo-600 transition rounded-full hover:bg-gray-100">
      <span class="text-2xl">🔔</span>
      <span v-if="alerts.length > 0" class="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">
        {{ alerts.length }}
      </span>
    </button>

    <div v-if="isOpen" class="absolute left-0 mt-3 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden origin-top-left">
      <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h3 class="font-bold text-gray-800">التنبيهات</h3>
        <button @click="refresh" class="text-xs text-indigo-600 hover:underline">🔄 تحديث</button>
      </div>

      <div class="max-h-[400px] overflow-y-auto">
        <div v-if="loading" class="p-6 text-center text-gray-400">جاري التحميل...</div>
        
        <div v-else-if="alerts.length === 0" class="p-8 text-center text-gray-400 flex flex-col items-center">
          <span class="text-3xl mb-2">✨</span>
          <p>لا توجد تنبيهات جديدة، كل شيء تحت السيطرة!</p>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div v-for="alert in alerts" :key="alert.id" class="p-4 hover:bg-gray-50 transition flex gap-3 items-start">
            <div :class="`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${alert.color}`">
              {{ alert.icon }}
            </div>
            <div class="flex-1">
              <h4 class="font-bold text-gray-800 text-sm">{{ alert.title }}</h4>
              <p class="text-gray-500 text-xs mt-1 leading-relaxed">{{ alert.desc }}</p>
              
              <div class="mt-3 flex gap-2">
                <a v-if="alert.actionLink" :href="alert.actionLink" target="_blank" class="bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition w-fit">
                  <span>💬</span> {{ alert.actionLabel }}
                </a>
                <NuxtLink v-if="alert.internalLink" :to="alert.internalLink" @click="isOpen = false" class="bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold transition w-fit">
                  معاينة
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotifications } from '~/composables/useNotifications'

const isOpen = ref(false)
const container = ref(null)
const { alerts, loading, fetchNotifications } = useNotifications()

const refresh = async () => {
  await fetchNotifications()
}

// إغلاق القائمة عند النقر خارجها
const handleClickOutside = (event) => {
  if (container.value && !container.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  fetchNotifications()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

