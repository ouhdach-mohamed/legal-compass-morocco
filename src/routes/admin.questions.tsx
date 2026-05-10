import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { listUnanswered, updateUnanswered, listProcedures } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { pickLocalized } from "@/lib/i18n";
import { useAdminLang } from "@/hooks/useAdminLang";

export const Route = createFileRoute("/admin/questions")({
  component: QuestionsPage,
});

type Q = {
  id: string;
  language_code: string;
  raw_text: string;
  status: string;
  resolved_procedure_id: string | null;
  created_at: string;
};

type Proc = { id: string; slug: string; title: Record<string, string> };

function QuestionsPage() {
  const auth = useAdminAuth();
  const { t, lang: adminLang } = useAdminLang();
  const fnList = useServerFn(listUnanswered);
  const fnUpdate = useServerFn(updateUnanswered);
  const fnProcs = useServerFn(listProcedures);
  const [items, setItems] = useState<Q[] | null>(null);
  const [procs, setProcs] = useState<Proc[]>([]);
  const [filter, setFilter] = useState<"pending" | "all">("pending");

  const refresh = async () => {
    const [a, b] = await Promise.all([fnList(), fnProcs()]);
    setItems((a as { questions: Q[] }).questions);
    setProcs((b as { procedures: Proc[] }).procedures);
  };

  useEffect(() => { if (auth.isAdmin) refresh(); }, [auth.isAdmin]);

  if (auth.loading) return <Loader2 className="animate-spin mx-auto mt-12" />;
  if (!auth.isAdmin) return <p className="text-center mt-12">{t("notAuthorized")}</p>;
  if (!items) return <Loader2 className="animate-spin mx-auto mt-12" />;

  const filtered = filter === "pending" ? items.filter((q) => q.status === "pending") : items;

  const act = async (
    id: string,
    status: "resolved" | "ignored",
    resolved_procedure_id: string | null = null,
  ) => {
    await fnUpdate({ data: { id, status, resolved_procedure_id } });
    toast.success(status === "resolved" ? t("resolved") : t("ignored"));
    refresh();
  };

  const filterLabel = (f: "pending" | "all") => (f === "pending" ? t("pending") : t("all"));
  const statusLabel = (s: string) =>
    s === "pending" ? t("pending") : s === "resolved" ? t("resolved") : s === "ignored" ? t("ignored") : s;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{t("qTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("qSubtitle")}</p>
        </div>
        <div className="flex gap-1">
          {(["pending", "all"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "secondary" : "ghost"}
              onClick={() => setFilter(f)}
            >
              {filterLabel(f)}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl divide-y divide-border">
        {filtered.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground text-center">{t("nothingHere")}</p>
        )}
        {filtered.map((q) => (
          <div key={q.id} className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted">{q.language_code}</span>
              <span className="text-[11px] text-muted-foreground">
                {new Date(q.created_at).toLocaleString()}
              </span>
              <span className="text-[11px] ms-auto">
                {q.status === "pending" ? null : (
                  <span className="px-2 py-0.5 rounded-full bg-secondary">{statusLabel(q.status)}</span>
                )}
              </span>
            </div>
            <p
              className="text-sm"
              dir={q.language_code === "ar" ? "rtl" : "ltr"}
            >
              {q.raw_text}
            </p>
            {q.status === "pending" && (
              <div className="flex flex-wrap gap-2 items-center">
                <select
                  defaultValue=""
                  className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
                  onChange={(e) => {
                    if (e.target.value) act(q.id, "resolved", e.target.value);
                  }}
                >
                  <option value="">{t("linkToProcedure")}</option>
                  {procs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {pickLocalized(p.title, adminLang === "ar" ? "ar" : "en") || p.slug}
                    </option>
                  ))}
                </select>
                <Button size="sm" variant="outline" onClick={() => act(q.id, "resolved")}>
                  <Check className="h-3 w-3 me-1" /> {t("markResolved")}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => act(q.id, "ignored")}>
                  <X className="h-3 w-3 me-1" /> {t("ignore")}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
