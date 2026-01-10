<template>
  <div class="min-h-screen bg-white font-sans text-right" dir="rtl">
    
    <header class="bg-white shadow-sm fixed w-full top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-2">
            <span class="text-3xl">🏢</span>
            <span class="text-2xl font-bold text-indigo-600">مدير العقارات</span>
          </div>
          <nav class="hidden md:flex space-x-8 space-x-reverse">
            <a href="#" class="text-gray-600 hover:text-indigo-600 font-medium">الرئيسية</a>
            <a href="#services" class="text-gray-600 hover:text-indigo-600 font-medium">الخدمات</a>
            <a href="#testimonials" class="text-gray-600 hover:text-indigo-600 font-medium">آراء العملاء</a>
            <NuxtLink to="/tenant-portal" class="text-indigo-600 font-bold hover:text-indigo-800">لوحة المستأجر</NuxtLink>
          </nav>
          <NuxtLink to="/login" class="bg-indigo-600 text-white px-5 py-2 rounded-full font-bold hover:bg-indigo-700 transition">
            دخول الملاك
          </NuxtLink>
        </div>
      </div>
    </header>

    <section class="pt-32 pb-20 bg-gradient-to-b from-indigo-50 to-white text-center px-4">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          إدارة عقاراتك أصبحت <span class="text-indigo-600">أذكى وأسهل</span>
        </h1>
        <p class="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          نظام متكامل بالذكاء الاصطناعي لتتبع الإيجارات، إدارة العقود، وتحصيل المدفوعات. 
          راحة للملاك، وسهولة للمستأجرين.
        </p>
        <div class="flex justify-center gap-4">
          <button class="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:bg-indigo-700 hover:-translate-y-1 transition">
            ابدأ تجربتك المجانية 🚀
          </button>
          <button class="bg-white text-indigo-600 border border-indigo-200 px-8 py-4 rounded-xl text-lg font-bold shadow-sm hover:bg-gray-50 transition">
            تواصل معنا 📞
          </button>
        </div>
        
        <div class="mt-16 rounded-2xl overflow-hidden shadow-2xl border-4 border-white max-w-5xl mx-auto bg-gray-200 h-64 md:h-96 flex items-center justify-center text-gray-400">
          <p> [صورة بانر لواجهة النظام هنا] </p>
        </div>
      </div>
    </section>

    <section id="services" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900">خدمات متكاملة لإدارة سلسة</h2>
          <p class="text-gray-500 mt-2">كل ما تحتاجه في منصة واحدة</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="p-8 border rounded-2xl hover:shadow-xl transition text-center group hover:border-indigo-500">
            <div class="text-4xl mb-4 bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition">📊</div>
            <h3 class="text-xl font-bold mb-2">تتبع الإيجارات</h3>
            <p class="text-gray-500">لوحة تحكم شاملة لمراقبة الدفعات المستلمة والمتأخرة لحظة بلحظة.</p>
          </div>
          <div class="p-8 border rounded-2xl hover:shadow-xl transition text-center group hover:border-indigo-500">
            <div class="text-4xl mb-4 bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition">🔔</div>
            <h3 class="text-xl font-bold mb-2">تذكيرات ذكية</h3>
            <p class="text-gray-500">إشعارات آلية للمستأجرين بمواعيد السداد عبر الواتساب والبريد الإلكتروني.</p>
          </div>
          <div class="p-8 border rounded-2xl hover:shadow-xl transition text-center group hover:border-indigo-500">
            <div class="text-4xl mb-4 bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition">📝</div>
            <h3 class="text-xl font-bold mb-2">إدارة العقود</h3>
            <p class="text-gray-500">أرشفة إلكترونية لجميع العقود مع تنبيهات بمواعيد التجديد أو الانتهاء.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="testimonials" class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">ماذا يقول عملاؤنا؟</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="bg-white p-8 rounded-2xl shadow-sm">
            <p class="text-gray-600 mb-6 text-lg">"غيّر هذا النظام طريقتي في إدارة العقارات تماماً. لم أعد أقلق بشأن متابعة التحصيل، النظام يقوم بكل شيء!"</p>
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div>
                <h4 class="font-bold">أبو خالد</h4>
                <p class="text-sm text-gray-500">مالك عقارات</p>
              </div>
            </div>
          </div>
          <div class="bg-white p-8 rounded-2xl shadow-sm">
            <p class="text-gray-600 mb-6 text-lg">"كمستأجر، أحب الشفافية في لوحة التحكم. أعرف مواعيدي وأدفع بسهولة تامة."</p>
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div>
                <h4 class="font-bold">م. سارة أحمد</h4>
                <p class="text-sm text-gray-500">مستأجرة</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <footer class="bg-slate-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 class="text-xl font-bold mb-4">مدير العقارات 🏢</h3>
          <p class="text-slate-400">الحل الأمثل لإدارة الأملاك العقارية بكفاءة وذكاء.</p>
        </div>
        <div>
          <h4 class="font-bold mb-4">روابط سريعة</h4>
          <ul class="space-y-2 text-slate-400">
            <li><a href="#" class="hover:text-white">من نحن</a></li>
            <li><a href="#" class="hover:text-white">الأسعار</a></li>
            <li><a href="#" class="hover:text-white">المدونة</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold mb-4">الدعم</h4>
          <ul class="space-y-2 text-slate-400">
            <li><a href="#" class="hover:text-white">مركز المساعدة</a></li>
            <li><a href="#" class="hover:text-white">سياسة الخصوصية</a></li>
            <li><a href="#" class="hover:text-white">شروط الاستخدام</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold mb-4">تواصل معنا</h4>
          <p class="text-slate-400">info@rental-manager.com</p>
          <p class="text-slate-400">0500000000</p>
        </div>
      </div>
      <div class="text-center text-slate-600 mt-12 pt-8 border-t border-slate-800">
        © 2026 جميع الحقوق محفوظة لمنصة مدير العقارات.
      </div>
    </footer>

  </div>
</template>

<script setup>
// لكي تظهر صفحة الهبوط بدون القائمة الجانبية (Layout)
definePageMeta({
  layout: false
})
</script>