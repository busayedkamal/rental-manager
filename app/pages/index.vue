<template>
  <div class="min-h-screen bg-white font-sans text-right" dir="rtl">
    
    <header class="bg-white shadow-sm fixed w-full top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-2">
            <span class="text-3xl">🏢</span>
            <span class="text-2xl font-bold text-indigo-600">مدير العقارات</span>
          </div>
          <nav class="hidden md:flex space-x-8 space-x-reverse items-center">
            <a href="#" class="text-gray-600 hover:text-indigo-600 font-medium">الرئيسية</a>
            <a href="#available-units" class="text-gray-600 hover:text-indigo-600 font-medium">وحدات متاحة</a>
            <a href="#features" class="text-gray-600 hover:text-indigo-600 font-medium">المميزات</a>
            <a href="https://maps.app.goo.gl/2wK7b9rdcZTCmfAa9" target="_blank" class="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-1">
              <span>📍</span> الموقع
            </a>
          </nav>
          <NuxtLink to="/login" class="bg-indigo-600 text-white px-5 py-2 rounded-full font-bold hover:bg-indigo-700 transition">
            دخول المسؤول 🔒
          </NuxtLink>
        </div>
      </div>
    </header>

    <section class="pt-32 pb-20 bg-gradient-to-b from-indigo-900 to-indigo-800 text-white relative overflow-hidden">
      <div class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        <div>
          <h1 class="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            راحتك تبدأ من هنا.<br/>
            <span class="text-indigo-300">تابع إيجارك بلمسة.</span>
          </h1>
          <p class="text-lg text-indigo-100 mb-8 max-w-lg leading-relaxed">
            منصة متكاملة تخدم الملاك والمستأجرين. تتبع عقودك، سدد دفعاتك، وتواصل مع الإدارة بكل سهولة وشفافية.
          </p>
          <div class="flex gap-4">
            <a href="#available-units" class="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg">
              تصفح الوحدات 🔑
            </a>
          </div>
        </div>

        <div class="bg-white text-gray-800 p-8 rounded-3xl shadow-2xl max-w-md w-full mx-auto">
          <div class="text-center mb-6">
            <div class="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
              📱
            </div>
            <h3 class="text-2xl font-bold">مستأجر حالي؟</h3>
            <p class="text-gray-500 text-sm">سجل دخولك برقم الجوال والرمز السري</p>
          </div>

          <form @submit.prevent="handleTenantLogin" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">رقم الجوال</label>
              <input 
                v-model="loginPhone" 
                type="tel" 
                placeholder="05xxxxxxxx" 
                class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-left focus:ring-2 focus:ring-indigo-500 outline-none transition"
                dir="ltr"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">رمز الدخول (PIN)</label>
              <input 
                v-model="loginPin" 
                type="password" 
                placeholder="****" 
                maxlength="6"
                class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center tracking-widest text-lg focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold"
                dir="ltr"
                required
              />
            </div>

            <button 
              type="submit" 
              :disabled="loginLoading"
              class="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex justify-center items-center gap-2 shadow-lg hover:shadow-indigo-500/30"
            >
              <span v-if="loginLoading">جاري التحقق...</span>
              <span v-else>🚀 دخول إلى لوحتي</span>
            </button>

            <p v-if="loginError" class="text-red-500 text-sm text-center font-bold bg-red-50 py-2 rounded-lg animate-pulse">
              {{ loginError }}
            </p>
          </form>
        </div>

      </div>
    </section>

    <section class="py-16 bg-white" id="available-units">
      <div class="container mx-auto px-4">
        
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">وحدات مميزة بانتظارك 🔑</h2>
          <p class="text-gray-500 max-w-2xl mx-auto">
            تصفح أحدث الوحدات العقارية الشاغرة والمتاحة للإيجار الفوري.
          </p>
        </div>

        <div v-if="loading" class="text-center py-16">
          <div class="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p class="text-gray-400">جاري تحميل العروض...</p>
        </div>
        
        <div v-else-if="vacantUnits.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="unit in vacantUnits" 
            :key="unit.id" 
            class="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
          >
            <div class="h-48 bg-indigo-50 flex items-center justify-center relative overflow-hidden">
              <div class="text-6xl group-hover:scale-110 transition-transform duration-300">
                {{ getUnitIcon(unit.type) }}
              </div>
              <span class="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm animate-pulse">
                متاح للإيجار
              </span>
            </div>

            <div class="p-6">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h3 class="text-xl font-bold text-gray-800">{{ unit.name }}</h3>
                  <p class="text-sm text-gray-500 mt-1">{{ unit.type }}</p>
                </div>
                <div class="text-indigo-600 font-bold text-lg bg-indigo-50 px-3 py-1 rounded-lg">
                  {{ Number(unit.price).toLocaleString() }} <span class="text-xs">ريال/سنة</span>
                </div>
              </div>

              <div class="flex gap-4 mt-4 text-sm text-gray-400 border-t pt-4 border-gray-50">
                <div class="flex items-center gap-1">
                  <span>⚡</span> <span>عداد مستقل</span>
                </div>
                <div class="flex items-center gap-1">
                  <span>🛡️</span> <span>عقد إلكتروني</span>
                </div>
              </div>

              <div class="mt-6 flex gap-3">
                <a 
                  :href="getWhatsAppLink(unit)" 
                  target="_blank"
                  class="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-green-100 shadow-lg"
                >
                  <span>💬</span> واتساب
                </a>
                <a 
                  :href="`tel:${ownerPhone}`"
                  class="flex-1 bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-600 hover:text-indigo-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <span>📞</span> اتصال
                </a>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <div class="text-5xl mb-4">🏠</div>
          <h3 class="text-xl font-bold text-gray-600">لا توجد وحدات متاحة حالياً</h3>
          <p class="text-gray-400 mt-2">جميع الوحدات مشغولة، يرجى التحقق لاحقاً.</p>
        </div>

      </div>
    </section>

    <section id="features" class="py-20 bg-gray-50 text-center">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="flex flex-col items-center"><div class="text-6xl text-teal-800 mb-4">🏅</div><h3 class="text-2xl font-bold text-teal-900 mb-3">كفاءة</h3><p class="text-gray-500 text-sm leading-relaxed max-w-xs">نولي أهمية قصوى لحفظ سرية معلوماتك وحماية مصالحك بأعلى معايير الأمان.</p></div>
          <div class="flex flex-col items-center"><div class="text-6xl text-teal-800 mb-4">⏱️</div><h3 class="text-2xl font-bold text-teal-900 mb-3">بساطة</h3><p class="text-gray-500 text-sm leading-relaxed max-w-xs">سلاسة وسهولة الاستخدام لخدماتنا الإلكترونية، كل الأدوات التي تحتاجها في مكان واحد.</p></div>
          <div class="flex flex-col items-center"><div class="text-6xl text-teal-800 mb-4">🗺️</div><h3 class="text-2xl font-bold text-teal-900 mb-3">سهولة الوصول</h3><p class="text-gray-500 text-sm leading-relaxed max-w-xs">منصة إلكترونية مبتكرة تتيح لك سهولة الوصول ومتابعة عقاراتك من أي مكان.</p></div>
          <div class="flex flex-col items-center"><div class="text-6xl text-teal-800 mb-4">💬</div><h3 class="text-2xl font-bold text-teal-900 mb-3">الدعم</h3><p class="text-gray-500 text-sm leading-relaxed max-w-xs">فريق دعم العملاء متاح دائماً للرد على استفساراتك ومساعدتك في كل مرحلة.</p></div>
        </div>
      </div>
    </section>

    <footer class="bg-slate-900 text-white py-12 mt-auto">
      <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
        <div><div class="flex items-center gap-2 justify-center md:justify-start mb-4"><span class="text-3xl">🏢</span><h3 class="text-xl font-bold">مدير العقارات</h3></div><p class="text-slate-400 text-sm leading-relaxed">منصة متكاملة لإدارة الأملاك العقارية، تهدف لتسهيل عملية التأجير والتحصيل للملاك والمستأجرين بكل كفاءة وشفافية.</p></div>
        <div><h4 class="font-bold text-lg mb-4 text-indigo-400">تواصل معنا</h4><div class="space-y-3"><a href="tel:0505933925" class="block text-slate-300 hover:text-white transition flex items-center justify-center md:justify-start gap-2"><span>📞</span> 0505933925</a><a href="https://wa.me/966505933925" target="_blank" class="block text-slate-300 hover:text-white transition flex items-center justify-center md:justify-start gap-2"><span>💬</span> واتساب مباشر</a></div></div>
        <div><h4 class="font-bold text-lg mb-4 text-indigo-400">الموقع</h4><p class="text-slate-400 text-sm mb-4">يمكنك الوصول لموقع العقار مباشرة عبر الخرائط:</p><a href="https://maps.app.goo.gl/2wK7b9rdcZTCmfAa9" target="_blank" class="inline-block bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 mx-auto md:mx-0 w-fit"><span>📍</span> عرض على خرائط جوجل</a></div>
      </div>
      <div class="border-t border-slate-800 mt-10 pt-6 text-center text-slate-500 text-sm">© 2026 جميع الحقوق محفوظة لمنصة مدير العقارات.</div>
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'vue-router'

definePageMeta({ layout: false })

import { supabase } from '@/supabase' // استيراد الملف اليدوي
const router = useRouter()

const vacantUnits = ref([])
const loading = ref(true)
const ownerPhone = '966505933925' 

const loginPhone = ref('')
const loginPin = ref('') // 👈 متغير الرمز السري الجديد
const loginLoading = ref(false)
const loginError = ref('')

const handleTenantLogin = async () => {
  loginLoading.value = true
  loginError.value = ''
  
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('id')
      .eq('phone', loginPhone.value)
      .eq('pin_code', loginPin.value) // 👈 التحقق من الرمز السري هنا
      .single()

    if (error || !data) {
      loginError.value = 'بيانات الدخول غير صحيحة! تأكد من رقم الجوال والرمز السري.'
    } else {
      router.push(`/portal/${data.id}`)
    }
  } catch (e) {
    loginError.value = 'حدث خطأ في الاتصال.'
  } finally {
    loginLoading.value = false
  }
}

const fetchVacantUnits = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .order('price', { ascending: true })
      .limit(100)
    
    if (error) throw error

    if (data) {
      vacantUnits.value = data.filter(u => u.status && u.status.includes('شاغ'))
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

const getUnitIcon = (type) => {
  if (!type) return '🏠'
  if (type.includes('محل')) return '🏪'
  if (type.includes('شقة')) return '🏢'
  if (type.includes('فيلا')) return '🏡'
  return '🏠'
}

const getWhatsAppLink = (unit) => {
  const message = `السلام عليكم، مهتم بالعقار: ${unit.name} (${unit.type}) بسعر ${unit.price}`
  return `https://wa.me/${ownerPhone}?text=${encodeURIComponent(message)}`
}

onMounted(() => {
  fetchVacantUnits()
})
</script>