import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // If already signed in, push them in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/admin" });
    });
  }, [nav]);

  const signIn = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    nav({ to: "/admin" });
  };

  const signUp = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + "/admin/login" },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      "Account created. If email confirmation is required, check your inbox. Then ask a system admin to grant you the admin role.",
    );
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-elegant">
        <div className="flex items-center gap-3 mb-6">
          <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Admin access</h1>
            <p className="text-xs text-muted-foreground">
              Sign in to manage procedures and questions.
            </p>
          </div>
        </div>
        <Tabs defaultValue="signin">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <form onSubmit={signIn} className="space-y-4 mt-4">
              <Field id="email-in" label="Email" type="email" value={email} onChange={setEmail} />
              <Field id="pw-in" label="Password" type="password" value={password} onChange={setPassword} />
              <Button type="submit" disabled={busy} className="w-full">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={signUp} className="space-y-4 mt-4">
              <Field id="email-up" label="Email" type="email" value={email} onChange={setEmail} />
              <Field id="pw-up" label="Password" type="password" value={password} onChange={setPassword} />
              <Button type="submit" disabled={busy} className="w-full">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
              </Button>
              <p className="text-[11px] text-muted-foreground">
                After creating your account, ask the project owner to grant you the admin role.
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Field({
  id, label, type, value, onChange,
}: { id: string; label: string; type: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} required />
    </div>
  );
}
