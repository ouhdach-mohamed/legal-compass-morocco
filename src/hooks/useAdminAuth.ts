// Admin auth hook backed by a localStorage token (config-file auth).
// On mount it asks the server to validate the token; on failure it redirects
// to /admin/login (when redirectIfNotAdmin is true).
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { checkIsAdmin } from "@/lib/admin.functions";

const TOKEN_KEY = "mla.admin.token";
const EMAIL_KEY = "mla.admin.email";

export function adminSignOut() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(EMAIL_KEY);
}

export function setAdminSession(token: string, email: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(EMAIL_KEY, email);
}

export function useAdminAuth(redirectIfNotAdmin = true) {
  const navigate = useNavigate();
  const check = useServerFn(checkIsAdmin);
  const [state, setState] = useState<{
    loading: boolean;
    isAdmin: boolean;
    userId: string | null;
    email: string | null;
  }>({ loading: true, isAdmin: false, userId: null, email: null });

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const token = typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : null;
      if (!token) {
        if (!cancelled) {
          setState({ loading: false, isAdmin: false, userId: null, email: null });
          if (redirectIfNotAdmin) navigate({ to: "/admin/login" });
        }
        return;
      }
      try {
        const r = await check();
        if (cancelled) return;
        setState({
          loading: false,
          isAdmin: r.isAdmin,
          userId: r.userId,
          email: r.email ?? window.localStorage.getItem(EMAIL_KEY),
        });
        if (redirectIfNotAdmin && !r.isAdmin) navigate({ to: "/admin/login" });
      } catch {
        if (cancelled) return;
        adminSignOut();
        setState({ loading: false, isAdmin: false, userId: null, email: null });
        if (redirectIfNotAdmin) navigate({ to: "/admin/login" });
      }
    };
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectIfNotAdmin]);

  return state;
}
