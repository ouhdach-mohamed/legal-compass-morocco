import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FileText, Inbox, LogOut, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/chat/ThemeToggle";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/procedures", label: "Procedures", icon: FileText },
  { to: "/admin/questions", label: "Unanswered", icon: Inbox },
];

function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isLogin = path === "/admin/login";

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="ltr">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/admin" className="flex items-center gap-2 font-bold">
            <div className="grid place-items-center h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
              <Scale className="h-4 w-4" />
            </div>
            <span>Admin Console</span>
          </Link>
          {!isLogin && (
            <nav className="flex items-center gap-1">
              {NAV.map((item) => {
                const active = item.exact
                  ? path === item.to
                  : path.startsWith(item.to);
                return (
                  <Button
                    key={item.to}
                    asChild
                    variant={active ? "secondary" : "ghost"}
                    size="sm"
                  >
                    <Link to={item.to} className="gap-2">
                      <item.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </Link>
                  </Button>
                );
              })}
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/admin/login";
                }}
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
