/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        // نضع Tajwal كأول خيار في قائمة الخطوط الأساسية
        sans: ['Tajwal', 'sans-serif'],
        // نعرف خطاً جديداً للعناوين
        heading: ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}