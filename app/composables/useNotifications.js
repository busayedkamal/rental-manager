import { ref } from 'vue'
import { createClient } from '@supabase/supabase-js'

export const useNotifications = () => {
  const supabase = createClient(import.meta.env.NUXT_PUBLIC_SUPABASE_URL, import.meta.env.NUXT_PUBLIC_SUPABASE_KEY)
  const alerts = ref([])
  const loading = ref(false)
  const hasUnread = ref(false)

  // دالة تنسيق رقم الهاتف للواتساب (حذف الصفر واضافة 966)
  const formatPhoneForWa = (phone) => {
    if (!phone) return ''
    let p = phone.toString().replace(/\D/g, '') // حذف أي رموز
    if (p.startsWith('0')) p = p.substring(1)
    if (!p.startsWith('966')) p = '966' + p
    return p
  }

  const fetchNotifications = async () => {
    loading.value = true
    alerts.value = []
    
    const today = new Date()
    const nextMonth = new Date(); nextMonth.setDate(today.getDate() + 30)
    const todayStr = today.toISOString().split('T')[0]
    const nextMonthStr = nextMonth.toISOString().split('T')[0]

    try {
      // 1️⃣ تنبيه انتهاء العقود (خلال 30 يوم)
      const { data: expiringContracts } = await supabase
        .from('contracts')
        .select('*, tenants(name, phone)')
        .eq('status', 'ساري')
        .lte('end_date', nextMonthStr) // أقل من أو يساوي تاريخ بعد شهر
        .gte('end_date', todayStr) // أكبر من أو يساوي اليوم (لم ينتهِ بعد)

      if (expiringContracts) {
        expiringContracts.forEach(c => {
          alerts.value.push({
            id: `contract-${c.id}`,
            type: 'expiry',
            icon: '⏳',
            color: 'text-orange-600 bg-orange-50',
            title: 'عقد ينتهي قريباً',
            desc: `عقد ${c.tenants?.name} ينتهي بتاريخ ${c.end_date}`,
            actionLabel: 'تذكير بالتجديد',
            actionLink: `https://wa.me/${formatPhoneForWa(c.tenants?.phone)}?text=${encodeURIComponent(`مرحباً ${c.tenants?.name}،\nنود تذكيركم بأن عقد الإيجار الخاص بكم ينتهي بتاريخ ${c.end_date}.\nيرجى التواصل معنا لترتيب إجراءات التجديد.\n\nإدارة العقارات`)}`
          })
        })
      }

      // 2️⃣ تنبيه الدفعات المستحقة (اليوم أو متأخرة)
      const { data: dueInvoices } = await supabase
        .from('invoices')
        .select('*, tenants(name, phone), units(name)')
        .neq('status', 'مدفوع') // غير مدفوعة
        .lte('due_date', todayStr) // تاريخها اليوم أو قبل

      if (dueInvoices) {
        dueInvoices.forEach(inv => {
          const isLate = new Date(inv.due_date) < new Date(todayStr)
          alerts.value.push({
            id: `inv-${inv.id}`,
            type: 'payment',
            icon: isLate ? '🚨' : '💰',
            color: isLate ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50',
            title: isLate ? 'دفعة متأخرة' : 'دفعة مستحقة اليوم',
            desc: `المستأجر: ${inv.tenants?.name} | المبلغ: ${Number(inv.amount).toLocaleString()}`,
            actionLabel: 'إرسال مطالبة',
            actionLink: `https://wa.me/${formatPhoneForWa(inv.tenants?.phone)}?text=${encodeURIComponent(`مرحباً ${inv.tenants?.name}،\nنود تذكيركم بوجود دفعة إيجار مستحقة للوحدة (${inv.units?.name})\nبتاريخ: ${inv.due_date}\nالمبلغ المطلوب: ${inv.amount} ريال.\n\nيرجى السداد في أقرب وقت.`)}`
          })
        })
      }

      // 3️⃣ تنبيه الوحدات الشاغرة
      const { data: vacantUnits } = await supabase
        .from('units')
        .select('*')
        .eq('status', 'شاغرة')
      
      if (vacantUnits && vacantUnits.length > 0) {
        // نجمعها في تنبيه واحد لعدم الإزعاج
        alerts.value.push({
          id: 'vacant-summary',
          type: 'vacancy',
          icon: '🔑',
          color: 'text-gray-600 bg-gray-100',
          title: 'وحدات شاغرة',
          desc: `يوجد ${vacantUnits.length} وحدات شاغرة حالياً تحتاج للتسويق.`,
          actionLabel: null, // لا يوجد واتساب
          internalLink: '/units'
        })
      }

      hasUnread.value = alerts.value.length > 0

    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  return { alerts, loading, hasUnread, fetchNotifications }
}