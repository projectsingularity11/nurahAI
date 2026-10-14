import type { Citation, Locale } from '../lib/models';
import { DAILY_HADITH } from '../data/hadith';
export interface AssistantReply { text: string; sources: Citation[]; refused?: boolean }
export interface AssistantService { respond: (message: string, locale: Locale) => Promise<AssistantReply> }
export const SCHOLAR_REFUSAL = 'This requires guidance from a qualified scholar.';
const SENSITIVE = /fatwa|ruling|halal|hara+m|permissib|allowed|forbidden|sin\b|sins\b|marri|divorc|inherit|medical|medicin|diagnos|treatment|contract|interest|riba|mortgage|apostasy|repent|punish|suicid|abortion|فتو[ىي]|حلال|حرام|حكم|يجوز|جائز|زواج|طلاق|ميراث|وراث|طب[يّ]|دواء|علاج|عقد|عقود|ربا|ذنب|ذنوب|كبائر|كبير[ةه]|ردة|توب[ةه]|عقاب|انتحار|إجهاض|اجهاض/i;
export function requiresScholar(message: string) {
  const normalized = message.normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640\u200B-\u200F\u202A-\u202E]/g, '');
  return SENSITIVE.test(normalized);
}
const policySource = (locale: Locale): Citation => ({ label: locale === 'ar' ? 'ضوابط نوراة' : 'Nurah AI guardrails', detail: locale === 'ar' ? 'أداة للتعلّم والتنظيم. ليست جهة إفتاء.' : 'Study and organization only. No personal religious rulings.' });
export const placeholderAssistant: AssistantService = {
  async respond(message, locale) {
    const ar = locale === 'ar';
    if (/intention|bukhari\s*1|نية|نيات|بخاري/i.test(message)) return {
      text: ar ? `مقتطف تجريبي موثّق من الحديث: ${DAILY_HADITH.arabic}` : `Sourced seed excerpt (paraphrased meaning): ${DAILY_HADITH.english}`,
      sources: [{ label: 'Sahih al-Bukhari 1', url: DAILY_HADITH.source_url, detail: ar ? 'عمر بن الخطاب · صحيح · مقتطف، وليس شرحًا فقهيًا' : 'Umar ibn al-Khattab · Sahih · excerpt, not a ruling' }],
    };
    if (/plan|habit|task|routine|organize|خطة|خطه|عادة|عادات|مهام|تنظيم|روتين/i.test(message)) return {
      text: ar ? 'خطة تنظيم تجريبية: اختر عادة صغيرة، وحدّد لها وقتًا مناسبًا، وسجّل إنجازها في «أنا». هذا اقتراح تنظيمي، وليس توصية دينية.' : 'Placeholder planning suggestion: choose one small habit, give it a realistic time, and record completion in Me. This is an organizational suggestion, not religious advice.',
      sources: [{ label: ar ? 'أداة تنظيم تجريبية' : 'Placeholder planning service', detail: ar ? 'لا يتضمن هذا الاقتراح ادعاءات دينية.' : 'No religious claim or external authority is used.' }],
    };
    return { text: ar ? 'المساعد حاليًا واجهة تجريبية. لا تتوفر مصادر معتمدة مسترجعة لهذا السؤال، لذا لا أستطيع تقديم إجابة دينية. جرّب طلب خطة عادة أو مقتطف حديث النيّات.' : 'This assistant is a placeholder. No approved retrieved sources are available for this question, so I cannot provide a religious answer. Try a habit plan or the sourced intentions hadith excerpt.', sources: [policySource(locale)] };
  },
};
export async function askAssistant(message: string, locale: Locale, service: AssistantService = placeholderAssistant): Promise<AssistantReply> {
  // This gate always runs before any pluggable service, independent of prompt instructions.
  if (requiresScholar(message)) return { text: locale === 'ar' ? `هذا يتطلب إرشادًا من عالم مؤهّل.\n${SCHOLAR_REFUSAL}` : SCHOLAR_REFUSAL, refused: true, sources: [policySource(locale)] };
  const reply = await service.respond(message, locale);
  if (!reply.sources.length) return { text: locale === 'ar' ? 'لا يمكن عرض إجابة دون لوحة مصادر.' : 'An answer without a source panel cannot be shown.', sources: [policySource(locale)] };
  return reply;
}
