import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth, setAdminSession } from "@/hooks/useAdminAuth";
import { useAdminLang } from "@/hooks/useAdminLang";
import { getAdminAccount, updateAdminCredentials } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const auth = useAdminAuth();
  const { t, isRTL } = useAdminLang();
  const getAccount = useServerFn(getAdminAccount);
  const update = useServerFn(updateAdminCredentials);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!auth.isAdmin) return;
    getAccount()
      .then((r) => {
        setNewEmail(r.email);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [auth.isAdmin, getAccount]);

  if (auth.loading || !loaded) return <Loader2 className="animate-spin mx-auto mt-12" />;
  if (!auth.isAdmin) return <p className="text-center mt-12">{t("notAuthorized")}</p>;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await update({
        data: { currentPassword, newEmail, newPassword: newPassword || undefined },
      });
      setAdminSession(r.token, r.email);
      toast.success(t("credsUpdated"));
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/current password/i.test(msg)) toast.error(t("currentPwWrong"));
      else toast.error(t("updateFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center gap-3">
        <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 text-primary">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("settingsTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("settingsSubtitle")}</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-soft">
        <div className="space-y-1.5">
          <Label htmlFor="newEmail">{t("newEmail")}</Label>
          <Input
            id="newEmail"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            dir="ltr"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="newPassword">{t("newPassword")}</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••"
            dir="ltr"
          />
          <p className="text-[11px] text-muted-foreground">{t("newPasswordHint")}</p>
        </div>
        <div className="space-y-1.5 border-t border-border pt-4">
          <Label htmlFor="currentPassword">{t("currentPassword")}</Label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            dir="ltr"
          />
        </div>
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t("updateCreds")}
        </Button>
      </form>
    </div>
  );
}
