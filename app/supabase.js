import { createClient } from '@supabase/supabase-js'

// سنضع الروابط مباشرة هنا لنضمن العمل 100% ونرتاح من مشاكل الـ env
const supabaseUrl = 'https://grrnpabudbkuxgipjrwm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdycm5wYWJ1ZGJrdXhnaXBqcndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4OTI0ODAsImV4cCI6MjA4MzQ2ODQ4MH0.Trs4OMwTwTo-Ik4_E3Vg6AB1iLFk4ASc25_oDy91vsk'

export const supabase = createClient(supabaseUrl, supabaseKey)