import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { detectLanguage, normalize, tokenize } from "@/lib/matching";
import type { Lang } from "@/lib/i18n";

const CONFIDENCE_THRESHOLD = 0.35;
const MARGIN_THRESHOLD = 0.12;

export const matchQuestion = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ text: z.string().trim().min(1).max(2000) }).parse(d),
  )
  .handler(async ({ data }) => {
    const lang = detectLanguage(data.text) as Lang;
    const normalized = normalize(data.text, lang);
    const tokens = tokenize(normalized, lang);

    if (tokens.length === 0) {
      await supabaseAdmin.from("unanswered_questions").insert({
        language_code: lang,
        raw_text: data.text,
        normalized_text: normalized,
      });
      return { type: "unanswered" as const, lang };
    }

    // Fetch all keywords for this language
    const { data: keywords, error: kwErr } = await supabaseAdmin
      .from("keywords")
      .select("procedure_id, keyword, weight")
      .eq("language_code", lang);

    if (kwErr) throw kwErr;

    // Score procedures
    const scores = new Map<string, number>();
    let totalWeight = 0;
    for (const k of keywords ?? []) {
      const kw = normalize(k.keyword, lang);
      totalWeight += k.weight;
      // Token match OR phrase match in normalized
      const hit =
        tokens.includes(kw) ||
        (kw.includes(" ") && normalized.includes(kw));
      if (hit) {
        scores.set(
          k.procedure_id,
          (scores.get(k.procedure_id) ?? 0) + k.weight,
        );
      }
    }

    if (scores.size === 0) {
      await supabaseAdmin.from("unanswered_questions").insert({
        language_code: lang,
        raw_text: data.text,
        normalized_text: normalized,
      });
      return { type: "unanswered" as const, lang };
    }

    const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
    const [topId, topScore] = ranked[0];
    const secondScore = ranked[1]?.[1] ?? 0;

    // Confidence = top score / max possible per-procedure score (use top score / sum of keyword weights matching that procedure max)
    // Simpler: relative confidence vs token coverage
    const denom = Math.max(tokens.length, 3);
    const confidence = Math.min(1, topScore / (denom * 2));
    const margin = (topScore - secondScore) / Math.max(topScore, 1);

    if (confidence < CONFIDENCE_THRESHOLD || margin < MARGIN_THRESHOLD) {
      await supabaseAdmin.from("unanswered_questions").insert({
        language_code: lang,
        raw_text: data.text,
        normalized_text: normalized,
      });
      return { type: "unanswered" as const, lang, confidence };
    }

    const { data: proc } = await supabaseAdmin
      .from("legal_procedures")
      .select("id, slug, title, summary")
      .eq("id", topId)
      .eq("is_active", true)
      .maybeSingle();

    if (!proc) {
      return { type: "unanswered" as const, lang };
    }

    const { data: steps } = await supabaseAdmin
      .from("procedure_steps")
      .select("step_order, content")
      .eq("procedure_id", topId)
      .order("step_order", { ascending: true });

    return {
      type: "answer" as const,
      lang,
      confidence,
      procedure: {
        id: proc.id,
        slug: proc.slug,
        title: proc.title as Record<string, string>,
        summary: proc.summary as Record<string, string>,
      },
      steps: (steps ?? []).map((s) => ({
        order: s.step_order,
        content: s.content as Record<string, string>,
      })),
    };
  });
