import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/admin.functions";

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
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        if (!cancelled) {
          setState({ loading: false, isAdmin: false, userId: null, email: null });
          if (redirectIfNotAdmin) navigate({ to: "/admin/login" });
        }
        return;
      }
      try {
        const r = await check();
        if (!cancelled) {
          setState({
            loading: false,
            isAdmin: r.isAdmin,
            userId: r.userId,
            email: sess.session.user.email ?? null,
          });
          if (redirectIfNotAdmin && !r.isAdmin) {
            navigate({ to: "/admin/login" });
          }
        }
      } catch {
        if (!cancelled) {
          setState({ loading: false, isAdmin: false, userId: null, email: null });
          if (redirectIfNotAdmin) navigate({ to: "/admin/login" });
        }
      }
    };
    run();
    const { data: sub } = supabase.auth.onAuthStateChange(() => run());
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [check, navigate, redirectIfNotAdmin]);

  return state;
}
