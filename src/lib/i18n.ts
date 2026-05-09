export type Lang = "ar" | "fr" | "en";

export const LANG_LIST: { code: Lang; name: string; rtl: boolean }[] = [
  { code: "ar", name: "العربية", rtl: true },
  { code: "fr", name: "Français", rtl: false },
  { code: "en", name: "English", rtl: false },
];

export const DEFAULT_LANG: Lang = "ar";

export const I18N = {
  ar: {
    appName: "المساعد القانوني المغربي",
    tagline: "إجابات بسيطة على إجراءاتك القانونية",
    placeholder: "اكتب سؤالك القانوني هنا...",
    send: "إرسال",
    suggestionsLabel: "أمثلة على أسئلة:",
    trackCase: "تتبع ملفي القضائي",
    closeTrack: "إغلاق",
    fallback:
      "عذرًا، لم أتمكن من إيجاد إجابة دقيقة لسؤالك. تم حفظ سؤالك وسيقوم فريقنا بمراجعته قريبًا.",
    welcome:
      "مرحبًا! أنا مساعدك القانوني. اطرح سؤالك حول الإجراءات الإدارية أو القانونية بالمغرب.",
    confidence: "درجة الثقة",
    steps: "الخطوات",
    adminLogin: "دخول المسؤول",
    embedNote:
      "إذا لم يظهر التتبع أدناه، افتح الموقع الرسمي مباشرة:",
    openExternal: "فتح في نافذة جديدة",
    poweredBy: "خدمة معلوماتية حكومية محلية — لا تستخدم الذكاء الاصطناعي",
  },
  fr: {
    appName: "Assistant Juridique Marocain",
    tagline: "Des réponses simples à vos démarches légales",
    placeholder: "Écrivez votre question juridique ici...",
    send: "Envoyer",
    suggestionsLabel: "Exemples de questions :",
    trackCase: "Suivre mon dossier",
    closeTrack: "Fermer",
    fallback:
      "Désolé, je n'ai pas trouvé de réponse précise à votre question. Elle a été enregistrée et sera examinée par notre équipe.",
    welcome:
      "Bonjour ! Je suis votre assistant juridique. Posez votre question sur les démarches administratives ou légales au Maroc.",
    confidence: "Niveau de confiance",
    steps: "Étapes",
    adminLogin: "Connexion admin",
    embedNote:
      "Si le suivi ne s'affiche pas ci-dessous, ouvrez le site officiel :",
    openExternal: "Ouvrir dans un nouvel onglet",
    poweredBy: "Service informatif local — sans intelligence artificielle",
  },
  en: {
    appName: "Moroccan Legal Assistant",
    tagline: "Simple answers to your legal procedures",
    placeholder: "Type your legal question here...",
    send: "Send",
    suggestionsLabel: "Try asking:",
    trackCase: "Track my case",
    closeTrack: "Close",
    fallback:
      "Sorry, I couldn't find a precise answer to your question. It has been saved and will be reviewed by our team.",
    welcome:
      "Hello! I'm your legal assistant. Ask about administrative or legal procedures in Morocco.",
    confidence: "Confidence",
    steps: "Steps",
    adminLogin: "Admin login",
    embedNote: "If the tracker doesn't load below, open the official site:",
    openExternal: "Open in new tab",
    poweredBy: "Local government info service — no AI used",
  },
} as const;

export const SUGGESTIONS: Record<Lang, string[]> = {
  ar: [
    "كيف أحصل على البطاقة الوطنية؟",
    "كيف أطلب عقد الازدياد؟",
    "كيف أحصل على جواز السفر؟",
  ],
  fr: [
    "Comment obtenir la carte d'identité ?",
    "Comment demander un acte de naissance ?",
    "Comment obtenir un passeport ?",
  ],
  en: [
    "How do I get a national ID card?",
    "How do I request a birth certificate?",
    "How do I get a passport?",
  ],
};

export function pickLocalized(
  field: Record<string, string> | null | undefined,
  lang: Lang,
): string {
  if (!field) return "";
  return field[lang] || field.ar || field.fr || field.en || "";
}
