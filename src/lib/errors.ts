const arabicErrors: Record<string, string> = {
  "Location permission denied. Enable it in settings or enter coordinates below.":
    "رُفض إذن الموقع. فعّله في الإعدادات أو أدخل الإحداثيات أدناه.",
  "Location is unavailable. Try again outdoors, or enter your coordinates manually.":
    "الموقع غير متاح. حاول في مكان مفتوح أو أدخل الإحداثيات يدويًا.",
  "Enter a latitude from −90 to 90 and a longitude from −180 to 180.":
    "أدخل خط عرض من −٩٠ إلى ٩٠ وخط طول من −١٨٠ إلى ١٨٠.",
  "Prayer times are unavailable for these coordinates and date. Consult your local mosque (high-latitude conditions may apply).":
    "مواقيت الصلاة غير متاحة لهذا الموقع والتاريخ. راجع مسجدك المحلي، فقد تؤثر ظروف خطوط العرض العالية.",
  "No prayer times available.": "لا تتوفر مواقيت صلاة.",
  "Prayer calculation failed.": "تعذّر حساب مواقيت الصلاة.",
  "Qur’an provider is unavailable. Retry or read a previously cached surah.":
    "مزوّد القرآن غير متاح. حاول مجددًا أو اقرأ سورة مخزّنة سابقًا.",
  "Qur’an provider could not be reached. Check your connection or read a previously cached surah.":
    "تعذّر الاتصال بمزوّد القرآن. تحقّق من اتصالك أو اقرأ سورة مخزّنة سابقًا.",
  "Qur’an provider returned an invalid response.":
    "أعاد مزوّد القرآن استجابة غير صالحة. حاول مرة أخرى.",
  "The requested Qur’an editions are unavailable.":
    "نسخ القرآن المطلوبة غير متاحة حاليًا.",
  "Verse alignment or audio validation failed.":
    "تعذّر التحقق من تطابق الآيات أو الصوت. لم يُعرض محتوى غير متحقق منه.",
  "Invalid surah number.": "رقم السورة غير صالح.",
  "Audio playback failed. Check your connection and try again.":
    "فشل تشغيل الصوت. تحقّق من اتصالك وحاول مرة أخرى.",
  "Audio could not be loaded. Check your connection and try again.":
    "تعذّر تحميل الصوت. تحقّق من اتصالك وحاول مرة أخرى.",
  "Local storage could not be loaded. Changes may not persist.":
    "تعذّر تحميل التخزين المحلي. قد لا تبقى تغييراتك محفوظة.",
  "Sync failed. Your changes remain on this device; retry when connected.":
    "فشلت المزامنة. تغييراتك محفوظة على هذا الجهاز؛ حاول عند الاتصال.",
  "Invalid login credentials":
    "بيانات الدخول غير صحيحة. تحقّق من البريد الإلكتروني وكلمة المرور.",
  "Email not confirmed": "أكّد بريدك الإلكتروني قبل تسجيل الدخول.",
};
export function localizedError(message: string, arabic: boolean): string {
  if (!arabic || /[\u0600-\u06FF]/.test(message)) return message;
  return (
    arabicErrors[message] ??
    "تعذّر إكمال العملية. تحقّق من اتصالك وبياناتك وحاول مرة أخرى. تبقى تغييراتك المحلية على الجهاز."
  );
}
