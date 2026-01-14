<template>
  <div class="min-h-screen bg-white font-sans text-right" dir="rtl">
    
    <header class="bg-white/90 backdrop-blur-md shadow-sm fixed w-full top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <div class="flex items-center gap-2">
            <span class="text-4xl">🏢</span>
            <div>
              <span class="text-xl font-bold text-gray-900 block">مدير العقارات</span>
              <span class="text-xs text-gray-500">نظام إدارة الأملاك الذكي</span>
            </div>
          </div>
          
          <div v-if="loadingUser" class="text-gray-400 text-sm">...</div>
          
          <NuxtLink v-else-if="user" to="/dashboard" class="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold hover:bg-indigo-100 transition border border-indigo-200">
            <span>📊</span>
            <span>لوحة التحكم</span>
          </NuxtLink>

          <NuxtLink v-else to="/login" class="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-bold transition">
            <span>🔐</span>
            <span class="hidden md:inline">دخول الإدارة</span>
          </NuxtLink>
        </div>
      </div>
    </header>

    <section class="pt-32 pb-20 bg-gradient-to-br from-indigo-900 to-slate-900 text-white min-h-[600px] flex items-center relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div class="max-w-7xl mx-auto px-4 w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        
        <div class="space-y-6">
          <h1 class="text-4xl md:text-6xl font-extrabold leading-tight">
            راحتك تبدأ من هنا. <br>
            <span class="text-indigo-400">تابع إيجارك بلمسة.</span>
          </h1>
          <p class="text-lg text-gray-300 max-w-lg leading-relaxed">
            منصة متكاملة تخدم الملاك والمستأجرين. تتبع عقودك، سدد دفعاتك، وتواصل مع الإدارة بكل سهولة وشفافية.
          </p>
          <div class="flex gap-4 pt-4">
            <a href="#features" class="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-bold border border-white/30 transition">تعرف على الخدمات</a>
          </div>
        </div>

        <div class="bg-white text-gray-800 p-8 rounded-2xl shadow-2xl border-4 border-white/20 backdrop-blur-sm">
          <div class="text-center mb-6">
            <div class="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📱</div>
            <h2 class="text-2xl font-bold text-gray-900">مستأجر حالي؟</h2>
            <p class="text-gray-500 text-sm mt-1">أدخل رقم جوالك المسجل للدخول إلى لوحتك</p>
          </div>

          <form @submit.prevent="handleTrack" class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">رقم الجوال</label>
              <input 
                v-model="phone" 
                type="tel" 
                placeholder="مثال: 0500000000" 
                class="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-left font-sans text-lg transition"
                required
              />
            </div>
            
            <button 
              type="submit" 
              :disabled="loading" 
              class="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {{ loading ? 'جاري البحث...' : 'دخول إلى لوحتي 🚀' }}
            </button>

            <p v-if="errorMsg" class="text-red-500 text-sm text-center font-bold bg-red-50 p-2 rounded-lg animate-pulse">
              {{ errorMsg }}
            </p>
          </form>
        </div>

      </div>
    </section>

    <section id="features" class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold text-gray-900 mb-12">لماذا تستخدم منصتنا؟</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition">
            <div class="text-4xl mb-4">💳</div>
            <h3 class="text-xl font-bold mb-2">دفع إلكتروني آمن</h3>
            <p class="text-gray-500">سدد إيجارك عبر التحويل أو البطاقة وسجل الدفع فوراً.</p>
          </div>
          <div class="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition">
            <div class="text-4xl mb-4">🔔</div>
            <h3 class="text-xl font-bold mb-2">تنبيهات ذكية</h3>
            <p class="text-gray-500">لن تفوتك أي دفعة مع نظام التنبيهات المسبق.</p>
          </div>
          <div class="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition">
            <div class="text-4xl mb-4">📄</div>
            <h3 class="text-xl font-bold mb-2">عقودك في جيبك</h3>
            <p class="text-gray-500">وصول دائم لتفاصيل العقد وتاريخ الانتهاء.</p>
          </div>
        </div>
      </div>
    </section>

    <footer class="bg-slate-900 text-slate-400 py-8 text-center border-t border-slate-800">
      <p>© 2026 نظام مدير العقارات. جميع الحقوق محفوظة.</p>
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { createClient } from '@supabase/supabase-js'

definePageMeta({
  layout: false
})

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)
const phone = ref('')
const loading = ref(false)
const errorMsg = ref('')

// متغيرات للتحقق من المستخدم (للزر العلوي)
const user = ref(null)
const loadingUser = ref(true)

// دالة البحث عن المستأجر (للنموذج)
const handleTrack = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('id')
      .eq('phone', phone.value)
      .single()

    if (error || !data) {
      errorMsg.value = 'عفواً، رقم الجوال هذا غير مسجل لدينا.'
    } else {
      // توجيه المستأجر لصفحته الخاصة
      navigateTo(`/portal/${data.id}`)
    }
  } catch (e) {
    errorMsg.value = 'حدث خطأ في الاتصال، حاول مرة أخرى.'
  } finally {
    loading.value = false
  }
}

// التحقق من حالة الدخول عند فتح الصفحة
onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  user.value = session?.user || null
  loadingUser.value = false
})
</script>