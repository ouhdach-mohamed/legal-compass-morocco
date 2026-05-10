// Admin-panel language state. Persists to localStorage and applies dir=rtl
// on the document root when Arabic is active. Defaults to Arabic.
import { useCallback, useEffect, useState } from "react";
import {
  ADMIN_I18N,
  ADMIN_LANGS,
  DEFAULT_ADMIN_LANG,
  type AdminLang,
  type AdminTKey,
} from "@/lib/admin-i18n";

const KEY = "mla.admin.lang";

export function useAdminLang() {
  const [lang, setLangState] = useState<AdminLang>(DEFAULT_ADMIN_LANG);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(KEY) as AdminLang | null;
    if (stored && ADMIN_LANGS.some((l) => l.code === stored)) {
      setLangState(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const meta = ADMIN_LANGS.find((l) => l.code === lang)!;
    document.documentElement.lang = lang;
    document.documentElement.dir = meta.rtl ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((l: AdminLang) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem(KEY, l);
  }, []);

  const t = useCallback(
    (key: AdminTKey) => ADMIN_I18N[lang][key] ?? ADMIN_I18N.ar[key] ?? key,
    [lang],
  );

  const isRTL = ADMIN_LANGS.find((l) => l.code === lang)?.rtl ?? false;

  return { lang, setLang, t, isRTL };
}
