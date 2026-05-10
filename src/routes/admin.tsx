import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  Inbox,
  LogOut,
  Scale,
  Settings,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/chat/ThemeToggle";
import { adminSignOut } from "@/hooks/useAdminAuth";
import { useAdminLang } from "@/hooks/useAdminLang";
import { ADMIN_LANGS, type AdminTKey } from "@/lib/admin-i18n";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV: { to: string; tKey: AdminTKey; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/admin", tKey: "navDashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/procedures", tKey: "navProcedures", icon: FileText },
  { to: "/admin/questions", tKey: "navQuestions", icon: Inbox },
  { to: "/admin/settings", tKey: "navSettings", icon: Settings },
];

function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isLogin = path === "/admin/login";
  const nav = useNavigate();
  const { lang, setLang, t, isRTL } = useAdminLang();

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <Link to="/admin" className="flex items-center gap-2 font-bold">
            <div className="grid place-items-center h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
              <Scale className="h-4 w-4" />
            </div>
            <span>{t("appTitle")}</span>
          </Link>
          {!isLogin && (
            <nav className="flex items-center gap-1 flex-wrap">
              {NAV.map((item) => {
                const active = item.exact ? path === item.to : path.startsWith(item.to);
                return (
                  <Button
                    key={item.to}
                    asChild
                    variant={active ? "secondary" : "ghost"}
                    size="sm"
                  >
                    <Link to={item.to} className="gap-2">
                      <item.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{t(item.tKey)}</span>
                    </Link>
                  </Button>
                );
              })}
              <div className="inline-flex items-center gap-1 bg-secondary/40 border border-border rounded-full p-0.5 mx-1">
                <Globe className="h-3.5 w-3.5 mx-1.5 text-muted-foreground" />
                {ADMIN_LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={`px-2.5 py-0.5 text-xs rounded-full transition ${
                      lang === l.code ? "bg-primary text-primary-foreground" : "hover:bg-background"
                    }`}
                    aria-label={l.label}
                  >
                    {l.code.toUpperCase()}
                  </button>
                ))}
              </div>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  adminSignOut();
                  nav({ to: "/admin/login" });
                }}
                title={t("signOut")}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </nav>
          )}
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6 w-full">
        <Outlet />
      </main>
    </div>
  );
}
