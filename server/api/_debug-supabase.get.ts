export default defineEventHandler(() => {
  const cfg = useRuntimeConfig()
  return {
    hasUrl: Boolean(cfg.public.supabase?.url),
    hasKey: Boolean(cfg.public.supabase?.key),
    urlStartsWithHttps: (cfg.public.supabase?.url || '').startsWith('https://'),
  }
})
