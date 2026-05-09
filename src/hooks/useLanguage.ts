import { useEffect, useState, useCallback } from "react";
import { DEFAULT_LANG, LANG_LIST, type Lang } from "@/lib/i18n";

const KEY = "mla.lang";

export function useLanguage() {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    const stored = (typeof window !== "undefined"
      ? (localStorage.getItem(KEY) as Lang | null)
      : null);
    if (stored && LANG_LIST.some((l) => l.code === stored)) {
      setLangState(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const meta = LANG_LIST.find((l) => l.code === lang)!;
    document.documentElement.lang = lang;
    document.documentElement.dir = meta.rtl ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem(KEY, l);
  }, []);

  return { lang, setLang };
}
