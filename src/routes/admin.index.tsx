import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Inbox, Languages, Loader2 } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { getDashboardStats } from "@/lib/admin.functions";
import { pickLocalized } from "@/lib/i18n";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const auth = useAdminAuth();
  const fn = useServerFn(getDashboardStats);
  const [data, setData] = useState<Awaited<ReturnType<typeof fn>> | null>(null);

  useEffect(() => {
    if (!auth.isAdmin) return;
    fn().then(setData).catch(console.error);
  }, [auth.isAdmin, fn]);

  if (auth.loading) return <Center><Loader2 className="animate-spin" /></Center>;
  if (!auth.isAdmin) return <NotAdmin email={auth.email} />;
  if (!data) return <Center><Loader2 className="animate-spin" /></Center>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of legal content and user questions.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={FileText} label="Procedures" value={data.proceduresCount} />
        <StatCard icon={Inbox} label="Pending questions" value={data.pendingCount} />
        <StatCard icon={Languages} label="Languages" value={3} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Questions by language">
          <div className="space-y-3">
            {(["ar", "fr", "en"] as const).map((l) => {
              const total = Object.values(data.questionsByLang).reduce((a, b) => a + b, 0) || 1;
              const v = data.questionsByLang[l] ?? 0;
              const pct = (v / total) * 100;
              return (
                <div key={l}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold uppercase">{l}</span>
                    <span className="text-muted-foreground">{v}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card title="Procedures">
          <ul className="space-y-2 text-sm max-h-64 overflow-y-auto">
            {data.procedures.map((p) => (
              <li key={p.id} className="flex justify-between border-b border-border pb-2 last:border-0">
                <span>{pickLocalized(p.title as Record<string, string>, "en")}</span>
                <span className="text-xs text-muted-foreground">{p.slug}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="grid place-items-center min-h-[40vh] text-muted-foreground">{children}</div>;
}

function NotAdmin({ email }: { email: string | null }) {
  return (
    <div className="max-w-md mx-auto mt-12 bg-card border border-border rounded-2xl p-6">
      <h2 className="font-bold mb-2">Not authorized</h2>
      <p className="text-sm text-muted-foreground mb-3">
        You are signed in{email ? ` as ${email}` : ""}, but you don't have the admin role yet.
      </p>
      <p className="text-xs text-muted-foreground">
        The project owner must grant your account the admin role from the database.
      </p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: number }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="grid place-items-center h-9 w-9 rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 text-3xl font-bold">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-soft">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}
