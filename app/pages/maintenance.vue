<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">🛠️ تذاكر الصيانة</h1>
        <p class="text-gray-500 text-sm">متابعة طلبات الإصلاح من المستأجرين</p>
      </div>
      <button @click="fetchTickets" class="text-indigo-600 hover:underline">🔄 تحديث</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 h-fit">
        <h3 class="font-bold text-gray-700 mb-4 flex justify-between">
          <span>🆕 طلبات جديدة</span>
          <span class="bg-white px-2 rounded text-sm shadow-sm">{{ newTickets.length }}</span>
        </h3>
        <div class="space-y-3">
          <div v-for="t in newTickets" :key="t.id" class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
            <div class="flex justify-between items-start">
              <h4 class="font-bold text-gray-800">{{ t.title }}</h4>
              <span v-if="t.priority === 'طاريء'" class="text-[10px] bg-red-100 text-red-600 px-2 rounded-full">🔥 طاريء</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ t.tenants?.name }} - {{ t.units?.name }}</p>
            <p class="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">{{ t.description }}</p>
            <div class="mt-3 pt-3 border-t flex justify-end">
              <button @click="updateStatus(t.id, 'جاري العمل')" class="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition">
                بدء العمل ➡️
              </button>
            </div>
          </div>
          <div v-if="newTickets.length === 0" class="text-center text-gray-400 text-sm py-4">لا توجد طلبات جديدة</div>
        </div>
      </div>

      <div class="bg-indigo-50 p-4 rounded-xl border border-indigo-100 h-fit">
        <h3 class="font-bold text-indigo-800 mb-4 flex justify-between">
          <span>⚙️ جاري العمل</span>
          <span class="bg-white px-2 rounded text-sm shadow-sm">{{ inProgressTickets.length }}</span>
        </h3>
        <div class="space-y-3">
          <div v-for="t in inProgressTickets" :key="t.id" class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-indigo-500">
            <h4 class="font-bold text-gray-800">{{ t.title }}</h4>
            <p class="text-xs text-gray-500 mt-1">{{ t.tenants?.name }}</p>
            <div class="mt-3 pt-3 border-t flex justify-between items-center">
              <span class="text-xs text-indigo-600 animate-pulse">جاري التنفيذ...</span>
              <button @click="updateStatus(t.id, 'مكتمل')" class="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition">
                تم الإصلاح ✅
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-green-50 p-4 rounded-xl border border-green-100 h-fit">
        <h3 class="font-bold text-green-800 mb-4 flex justify-between">
          <span>✅ مكتملة</span>
          <span class="bg-white px-2 rounded text-sm shadow-sm">{{ doneTickets.length }}</span>
        </h3>
        <div class="space-y-3 opacity-75">
          <div v-for="t in doneTickets" :key="t.id" class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
            <h4 class="font-bold text-gray-800 line-through">{{ t.title }}</h4>
            <p class="text-xs text-gray-500 mt-1">تم الإنجاز بتاريخ: {{ t.created_at.split('T')[0] }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { createClient } from '@supabase/supabase-js'

import { supabase } from '@/supabase' // استيراد الملف اليدوي
const tickets = ref([])

// تصنيف التذاكر حسب الحالة
const newTickets = computed(() => tickets.value.filter(t => t.status === 'جديد'))
const inProgressTickets = computed(() => tickets.value.filter(t => t.status === 'جاري العمل'))
const doneTickets = computed(() => tickets.value.filter(t => t.status === 'مكتمل'))

const fetchTickets = async () => {
  const { data } = await supabase
    .from('maintenance_tickets')
    .select(`*, tenants(name), units(name)`)
    .order('created_at', { ascending: false })
  tickets.value = data || []
}

const updateStatus = async (id, status) => {
  await supabase.from('maintenance_tickets').update({ status }).eq('id', id)
  fetchTickets() // تحديث الشاشة لنقل البطاقة للعمود الجديد
}

onMounted(() => fetchTickets())
</script>