import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { loginAdmin } from "@/lib/admin.functions";
import { setAdminSession } from "@/hooks/useAdminAuth";
import { useAdminLang } from "@/hooks/useAdminLang";
import { ADMIN_LANGS } from "@/lib/admin-i18n";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const nav = useNavigate();
  const { lang, setLang, t, isRTL } = useAdminLang();
  const login = useServerFn(loginAdmin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  // If already signed in (token present), go to dashboard.
  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage.getItem("mla.admin.token")) {
      nav({ to: "/admin" });
    }
  }, [nav]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await login({ data: { email, password } });
      setAdminSession(r.token, r.email);
      toast.success(t("loginSuccess"));
      nav({ to: "/admin" });
    } catch {
      toast.error(t("invalidCredentials"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background grid place-items-center px-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-3">
          <div className="inline-flex items-center gap-1 bg-card border border-border rounded-full p-1">
            <Globe className="h-3.5 w-3.5 mx-2 text-muted-foreground" />
            {ADMIN_LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-3 py-1 text-xs rounded-full transition ${
                  lang === l.code ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-elegant">
          <div className="flex items-center gap-3 mb-6">
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg">{t("loginTitle")}</h1>
              <p className="text-xs text-muted-foreground">{t("loginSubtitle")}</p>
            </div>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
              />
            </div>
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t("signIn")}
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-xs text-primary hover:underline"
              >
                {t("forgotPassword")}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{t("forgotTitle")}</DialogTitle>
            <DialogDescription>{t("forgotBody")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setForgotOpen(false)}>{t("close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
