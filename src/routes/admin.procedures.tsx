import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  listProcedures,
  upsertProcedure,
  deleteProcedure,
} from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { pickLocalized, type Lang } from "@/lib/i18n";
import { useAdminLang } from "@/hooks/useAdminLang";

export const Route = createFileRoute("/admin/procedures")({
  component: ProceduresPage,
});

type ProcedureRow = {
  id: string;
  slug: string;
  title: Record<string, string>;
  summary: Record<string, string>;
  is_active: boolean;
  category_id: string | null;
  procedure_steps: { id: string; step_order: number; content: Record<string, string> }[];
  keywords: { id: string; language_code: string; keyword: string; weight: number }[];
};

type Category = { id: string; slug: string; title: Record<string, string> };

function emptyForm(): FormState {
  return {
    id: undefined,
    slug: "",
    category_id: null,
    is_active: true,
    title: { ar: "", fr: "", en: "" },
    summary: { ar: "", fr: "", en: "" },
    steps: [{ order: 1, content: { ar: "", fr: "", en: "" } }],
    keywords: [],
  };
}

type FormState = {
  id?: string;
  slug: string;
  category_id: string | null;
  is_active: boolean;
  title: Record<Lang, string>;
  summary: Record<Lang, string>;
  steps: { order: number; content: Record<Lang, string> }[];
  keywords: { language_code: Lang; keyword: string; weight: number }[];
};

function ProceduresPage() {
  const auth = useAdminAuth();
  const { t, lang: adminLang } = useAdminLang();
  const fnList = useServerFn(listProcedures);
  const fnUpsert = useServerFn(upsertProcedure);
  const fnDelete = useServerFn(deleteProcedure);
  const [data, setData] = useState<{ procedures: ProcedureRow[]; categories: Category[] } | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    const d = await fnList();
    setData(d as unknown as typeof data);
  };

  useEffect(() => {
    if (auth.isAdmin) refresh();
  }, [auth.isAdmin]);

  if (auth.loading) return <Loader2 className="animate-spin mx-auto mt-12" />;
  if (!auth.isAdmin) return <p className="text-center mt-12">{t("notAuthorized")}</p>;
  if (!data) return <Loader2 className="animate-spin mx-auto mt-12" />;

  const startNew = () => { setForm(emptyForm()); setOpen(true); };
  const startEdit = (p: ProcedureRow) => {
    setForm({
      id: p.id,
      slug: p.slug,
      category_id: p.category_id,
      is_active: p.is_active,
      title: { ar: p.title?.ar ?? "", fr: p.title?.fr ?? "", en: p.title?.en ?? "" },
      summary: { ar: p.summary?.ar ?? "", fr: p.summary?.fr ?? "", en: p.summary?.en ?? "" },
      steps: p.procedure_steps
        .sort((a, b) => a.step_order - b.step_order)
        .map((s) => ({
          order: s.step_order,
          content: { ar: s.content?.ar ?? "", fr: s.content?.fr ?? "", en: s.content?.en ?? "" },
        })),
      keywords: p.keywords.map((k) => ({
        language_code: k.language_code as Lang,
        keyword: k.keyword,
        weight: k.weight,
      })),
    });
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      await fnUpsert({ data: form });
      toast.success(t("saved"));
      setOpen(false);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    await fnDelete({ data: { id } });
    toast.success(t("deleted"));
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("procTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("procSubtitle")}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={startNew}><Plus className="h-4 w-4 me-1" /> {t("newBtn")}</Button>
          </DialogTrigger>
          <ProcedureFormDialog
            form={form}
            setForm={setForm}
            categories={data.categories}
            saving={saving}
            onSave={save}
          />
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-2xl divide-y divide-border">
        {data.procedures.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground text-center">{t("noProcedures")}</p>
        )}
        {data.procedures.map((p) => (
          <div key={p.id} className="p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold truncate">
                  {pickLocalized(p.title, adminLang === "ar" ? "ar" : "en") || p.slug}
                </span>
                {!p.is_active && (
                  <span className="text-[10px] uppercase bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                    {t("inactive")}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {p.slug} · {p.procedure_steps.length} {t("steps")} · {p.keywords.length} {t("keywords")}
              </p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => startEdit(p)} title={t("edit")}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => remove(p.id)} title={t("delete")}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProcedureFormDialog({
  form, setForm, categories, saving, onSave,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  categories: Category[];
  saving: boolean;
  onSave: () => void;
}) {
  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm({ ...form, [k]: v });

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{form.id ? "Edit procedure" : "New procedure"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Slug</Label>
            <Input
              value={form.slug}
              onChange={(e) => update("slug", e.target.value.toLowerCase())}
              placeholder="national-id-card"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <select
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={form.category_id ?? ""}
              onChange={(e) => update("category_id", e.target.value || null)}
            >
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {pickLocalized(c.title, "en") || c.slug}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={form.is_active}
            onCheckedChange={(v) => update("is_active", v)}
            id="active"
          />
          <Label htmlFor="active">Active</Label>
        </div>

        <Tabs defaultValue="ar" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="ar">العربية</TabsTrigger>
            <TabsTrigger value="fr">Français</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>
          {(["ar", "fr", "en"] as Lang[]).map((lang) => (
            <TabsContent key={lang} value={lang} className="space-y-3">
              <div className="space-y-1.5">
                <Label>Title ({lang})</Label>
                <Input
                  dir={lang === "ar" ? "rtl" : "ltr"}
                  value={form.title[lang]}
                  onChange={(e) => update("title", { ...form.title, [lang]: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Summary ({lang})</Label>
                <Textarea
                  dir={lang === "ar" ? "rtl" : "ltr"}
                  rows={2}
                  value={form.summary[lang]}
                  onChange={(e) => update("summary", { ...form.summary, [lang]: e.target.value })}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Steps</Label>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                update("steps", [
                  ...form.steps,
                  { order: form.steps.length + 1, content: { ar: "", fr: "", en: "" } },
                ])
              }
            >
              <Plus className="h-3 w-3 me-1" /> Add step
            </Button>
          </div>
          <div className="space-y-3">
            {form.steps.map((s, i) => (
              <div key={i} className="border border-border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Step {i + 1}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() =>
                      update(
                        "steps",
                        form.steps.filter((_, j) => j !== i).map((x, j) => ({ ...x, order: j + 1 })),
                      )
                    }
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {(["ar", "fr", "en"] as Lang[]).map((lang) => (
                    <Textarea
                      key={lang}
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      rows={2}
                      placeholder={`Step content (${lang})`}
                      value={s.content[lang]}
                      onChange={(e) => {
                        const next = [...form.steps];
                        next[i] = { ...s, content: { ...s.content, [lang]: e.target.value } };
                        update("steps", next);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <KeywordsEditor
          keywords={form.keywords}
          onChange={(kw) => update("keywords", kw)}
        />
      </div>
      <DialogFooter>
        <Button onClick={onSave} disabled={saving || !form.slug}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function KeywordsEditor({
  keywords, onChange,
}: { keywords: FormState["keywords"]; onChange: (kw: FormState["keywords"]) => void }) {
  const [draft, setDraft] = useState<{ language_code: Lang; keyword: string; weight: number }>({
    language_code: "ar", keyword: "", weight: 2,
  });
  const add = () => {
    if (!draft.keyword.trim()) return;
    onChange([...keywords, { ...draft, keyword: draft.keyword.trim() }]);
    setDraft({ ...draft, keyword: "" });
  };
  return (
    <div>
      <Label className="mb-2 block">Keywords</Label>
      <div className="flex gap-2 items-end mb-2 flex-wrap">
        <select
          className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
          value={draft.language_code}
          onChange={(e) => setDraft({ ...draft, language_code: e.target.value as Lang })}
        >
          <option value="ar">AR</option><option value="fr">FR</option><option value="en">EN</option>
        </select>
        <Input
          className="flex-1 min-w-[160px]"
          placeholder="keyword"
          value={draft.keyword}
          onChange={(e) => setDraft({ ...draft, keyword: e.target.value })}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        />
        <Input
          type="number" min={1} max={10}
          className="w-20"
          value={draft.weight}
          onChange={(e) => setDraft({ ...draft, weight: Number(e.target.value) || 1 })}
        />
        <Button size="sm" variant="outline" onClick={add}>Add</Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {keywords.map((k, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-xs">
            <span className="font-mono uppercase opacity-60">{k.language_code}</span>
            {k.keyword}
            <span className="opacity-50">×{k.weight}</span>
            <button
              onClick={() => onChange(keywords.filter((_, j) => j !== i))}
              className="ms-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
