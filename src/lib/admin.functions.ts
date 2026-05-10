import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin, supabaseAdmin } from "@/lib/admin.server";
import {
  readAdminConfig,
  verifyAdminCredentials,
  writeAdminConfig,
} from "@/lib/admin-config.server";

// ---------- Local admin auth (config-file based) ----------

// Validates a (email, password) pair against config/admin.config.json.
// Returns a base64 token the client stores in localStorage.
export const loginAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ email: z.string().email(), password: z.string().min(1) }).parse(d),
  )
  .handler(async ({ data }) => {
    const ok = await verifyAdminCredentials(data.email, data.password);
    if (!ok) throw new Response("Invalid credentials", { status: 401 });
    const token = Buffer.from(`${data.email}:${data.password}`, "utf8").toString("base64");
    return { token, email: data.email };
  });

// Used by the client to verify the localStorage token is still valid.
export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return { isAdmin: true, userId: context.userId, email: context.adminEmail };
  });

// Returns the currently configured admin email (used to prefill settings).
export const getAdminAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const cfg = await readAdminConfig();
    return { email: cfg.email };
  });

// Updates email and/or password in the config file. Requires the current
// password to confirm the change. Returns a fresh token for the client.
export const updateAdminCredentials = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        currentPassword: z.string().min(1),
        newEmail: z.string().email(),
        newPassword: z.string().min(4).optional().or(z.literal("")),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const cfg = await readAdminConfig();
    if (cfg.password !== data.currentPassword) {
      throw new Response("Current password is incorrect", { status: 400 });
    }
    const next = {
      email: data.newEmail,
      password: data.newPassword && data.newPassword.length > 0 ? data.newPassword : cfg.password,
    };
    await writeAdminConfig(next);
    const token = Buffer.from(`${next.email}:${next.password}`, "utf8").toString("base64");
    return { token, email: next.email, previousEmail: context.adminEmail };
  });

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const [procs, unanswered, byLang, topProcs] = await Promise.all([
      supabaseAdmin.from("legal_procedures").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("unanswered_questions")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabaseAdmin.from("unanswered_questions").select("language_code"),
      supabaseAdmin.from("legal_procedures").select("id, title, slug").limit(50),
    ]);

    const langCounts: Record<string, number> = { ar: 0, fr: 0, en: 0 };
    for (const r of byLang.data ?? []) {
      langCounts[r.language_code] = (langCounts[r.language_code] ?? 0) + 1;
    }

    return {
      proceduresCount: procs.count ?? 0,
      pendingCount: unanswered.count ?? 0,
      questionsByLang: langCounts,
      procedures: topProcs.data ?? [],
    };
  });

export const listProcedures = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("legal_procedures")
      .select(
        "id, slug, title, summary, is_active, category_id, procedure_steps(id, step_order, content), keywords(id, language_code, keyword, weight)",
      )
      .order("created_at", { ascending: false });
    if (error) throw error;
    const { data: cats } = await supabaseAdmin
      .from("legal_categories")
      .select("id, slug, title");
    return { procedures: data ?? [], categories: cats ?? [] };
  });

const procedureSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  category_id: z.string().uuid().nullable(),
  is_active: z.boolean(),
  title: z.object({ ar: z.string(), fr: z.string(), en: z.string() }),
  summary: z.object({ ar: z.string(), fr: z.string(), en: z.string() }),
  steps: z
    .array(
      z.object({
        order: z.number().int().min(1),
        content: z.object({
          ar: z.string(),
          fr: z.string(),
          en: z.string(),
        }),
      }),
    )
    .max(20),
  keywords: z
    .array(
      z.object({
        language_code: z.enum(["ar", "fr", "en"]),
        keyword: z.string().min(1).max(80),
        weight: z.number().int().min(1).max(10),
      }),
    )
    .max(200),
});

export const upsertProcedure = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => procedureSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const payload = {
      slug: data.slug,
      category_id: data.category_id,
      is_active: data.is_active,
      title: data.title,
      summary: data.summary,
    };
    let procId = data.id;
    if (procId) {
      const { error } = await supabaseAdmin
        .from("legal_procedures")
        .update(payload)
        .eq("id", procId);
      if (error) throw error;
    } else {
      const { data: ins, error } = await supabaseAdmin
        .from("legal_procedures")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw error;
      procId = ins.id;
    }

    // Replace steps + keywords (simple approach)
    await supabaseAdmin.from("procedure_steps").delete().eq("procedure_id", procId);
    await supabaseAdmin.from("keywords").delete().eq("procedure_id", procId);

    if (data.steps.length) {
      const { error } = await supabaseAdmin.from("procedure_steps").insert(
        data.steps.map((s) => ({
          procedure_id: procId!,
          step_order: s.order,
          content: s.content,
        })),
      );
      if (error) throw error;
    }
    if (data.keywords.length) {
      const { error } = await supabaseAdmin.from("keywords").insert(
        data.keywords.map((k) => ({
          procedure_id: procId!,
          language_code: k.language_code,
          keyword: k.keyword,
          weight: k.weight,
        })),
      );
      if (error) throw error;
    }
    return { id: procId };
  });

export const deleteProcedure = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("legal_procedures")
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const listUnanswered = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("unanswered_questions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return { questions: data ?? [] };
  });

export const updateUnanswered = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "resolved", "ignored"]),
        resolved_procedure_id: z.string().uuid().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("unanswered_questions")
      .update({
        status: data.status,
        resolved_procedure_id: data.resolved_procedure_id ?? null,
      })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
