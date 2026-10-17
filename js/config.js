// إعدادات الاتصال بمشروع Supabase الخاص بمداد (مشروع مستقل تماماً عن PQCS).
// المفتاح anon / publishable عام بطبيعته وآمن في المتصفح؛ الحماية تأتي من RLS في مخطط midad.
// لا تضع هنا أبداً مفتاح service_role أو secret.
window.MIDAD_CONFIG = {
  url: 'https://YOUR-PROJECT-REF.supabase.co',
  anonKey: 'YOUR-ANON-KEY',
  schema: 'midad'
};
