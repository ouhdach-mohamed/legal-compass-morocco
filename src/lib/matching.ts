// Pure helpers shared between client (light use) and server fn.
// No DB / secrets here — safe everywhere.
import type { Lang } from "./i18n";

const ARABIC_RE = /[\u0600-\u06FF]/;
const FRENCH_HINTS = /[àâçéèêëîïôûùüÿœæ]|\b(je|comment|pour|une|des|avec|carte|passeport)\b/i;

export function detectLanguage(text: string): Lang {
  if (ARABIC_RE.test(text)) return "ar";
  if (FRENCH_HINTS.test(text)) return "fr";
  return "en";
}

export function normalize(text: string, lang: Lang): string {
  let t = text.toLowerCase().trim();
  // Strip Latin diacritics
  t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (lang === "ar") {
    // Arabic normalization
    t = t.replace(/[\u064B-\u065F\u0670]/g, ""); // diacritics
    t = t.replace(/[إأآا]/g, "ا");
    t = t.replace(/ى/g, "ي");
    t = t.replace(/ة/g, "ه");
    t = t.replace(/ـ/g, "");
  }
  // Remove punctuation, keep Arabic + Latin letters + digits
  t = t.replace(/[^\p{L}\p{N}\s]/gu, " ");
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

const STOPWORDS: Record<Lang, Set<string>> = {
  ar: new Set([
    "في","من","الى","على","عن","هو","هي","ما","ماذا","كيف","هل",
    "ان","اذا","او","و","لا","نعم","انا","انت","يا","قد","كان","لكن",
  ]),
  fr: new Set([
    "le","la","les","un","une","des","de","du","et","ou","a","au","aux",
    "je","tu","il","elle","on","nous","vous","ils","est","pour","par",
    "comment","quoi","que","qui","ce","ces","mon","ma","mes","avec","sans",
    "dans","sur","mais","si","oui","non",
  ]),
  en: new Set([
    "the","a","an","of","and","or","to","in","on","is","are","i","you",
    "we","they","how","what","why","do","does","can","could","for","with",
    "my","your","this","that","these","those","at","by",
  ]),
};

export function tokenize(text: string, lang: Lang): string[] {
  return text
    .split(" ")
    .filter((t) => t.length > 1 && !STOPWORDS[lang].has(t));
}
