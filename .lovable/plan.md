
# Moroccan Legal Assistant Chatbot — Build Plan

A non-AI, deterministic legal info chatbot for Moroccan citizens. Citizens chat in Arabic / French / English, the system matches their question against a curated keyword index, and returns predefined procedures step-by-step. If confidence is low, the question is logged for admins — never guessed.

## Stack mapping (Laravel/MySQL → Lovable)

| Original | Lovable equivalent |
|---|---|
| Laravel REST API | TanStack Start `createServerFn` |
| MySQL | Lovable Cloud (Postgres) |
| Laravel Auth (admin) | Supabase Auth + `user_roles` table + `has_role()` |
| Separate React frontend | `/` route (citizen chat) |
| Separate React admin-panel | `/admin/*` routes behind admin role guard |
| `ChatMatchingService.php` | `src/lib/matching.server.ts` |

No PHP, no MySQL, no external AI — pure deterministic keyword scoring in Postgres + TS.

## Database schema (Postgres)

- `languages` — code (ar/fr/en), name, rtl, is_default
- `legal_categories` — id, slug, translations (jsonb: {ar,fr,en})
- `legal_procedures` — id, category_id, slug, title (jsonb), summary (jsonb), is_active
- `procedure_steps` — id, procedure_id, order, content (jsonb)
- `keywords` — id, procedure_id, language_code, keyword (text, normalized), weight
- `unanswered_questions` — id, language_code, raw_text, normalized_text, created_at, status (pending/resolved/ignored), resolved_procedure_id
- `user_roles` — id, user_id, role (enum: admin) — separate table per security best practice
- `app_role` enum

RLS:
- `legal_*` and `keywords` tables: public read, admin-only write
- `unanswered_questions`: anyone may insert; only admins may read/update/delete
- `user_roles`: only admins can read/manage; `has_role()` SECURITY DEFINER function for checks

## Matching engine (`matching.server.ts`)

```text
input → detectLanguage(text)         (Arabic script → ar; French diacritics/stopwords → fr; else en)
      → normalize(text, lang)        (lowercase, strip diacritics, Arabic alif/ya/ta-marbuta normalization, remove punctuation)
      → tokenize → remove stopwords
      → fetch all keywords WHERE language_code = lang
      → score each procedure: Σ (keyword.weight) for matching tokens
                            + bonus for multi-word phrase hits
      → top procedure score / total possible → confidence 0..1
      → if confidence ≥ 0.45 AND top beats #2 by ≥ 0.15 → return procedure
      → else: insert into unanswered_questions, return fallback message in detected lang
```

Single server function `matchQuestion({ text })` returns either `{ type: 'answer', procedure, steps, confidence }` or `{ type: 'unanswered', message }`.

## Routes

```text
/                         Citizen chat (ChatPage)
/admin/login              Admin sign-in
/admin                    Dashboard (stats: total procedures, questions by language, top procedures, unanswered count)
/admin/procedures         List + create/edit/delete procedures, steps, and keywords (all 3 langs in one form)
/admin/questions          Unanswered questions queue: view, link to existing procedure, mark resolved/ignored
```

Admin routes live under `_authenticated/admin/` layout that checks `has_role(admin)` via `beforeLoad`.

## Frontend pieces

- `ChatPage` — header (logo + LanguageSelector + ThemeToggle), chat window, input, "Track My Case" button
- `MessageBubble` — user / bot variants, RTL-aware
- `Suggestions` — shows top categories as quick prompts
- `TrackCasePanel` — collapsible iframe to `https://www.mahakim.ma/#/suivi/dossier-suivi` rendered below chat (no redirect)
- `useLanguage` — localStorage-persisted, switches `dir="rtl"` on `<html>` for `ar`
- `useTheme` — light/dark toggle, persists, applies `.dark` class

UI strings in a small `i18n.ts` dict (ar/fr/en) for button labels, placeholders, fallback messages — *not* legal content.

## Design system

Government-trustworthy, minimal: deep blue primary (Moroccan official tone), cream surface in light mode, slate in dark. Accent crimson (sparingly, Moroccan flag inspired). Cairo for Arabic, Inter for Latin. Generous spacing, subtle elevation, rounded `lg`. All tokens in `src/styles.css` as oklch — no hardcoded colors in components.

## Build order

1. Enable Lovable Cloud
2. Create migrations (enum, tables, RLS, `has_role`, seed languages + a few starter procedures in 3 langs)
3. Design system tokens + base layout
4. Citizen chat UI + `matchQuestion` server fn + Track My Case
5. Admin auth (login, role guard, signup-blocked-by-default — first admin promoted via SQL)
6. Admin dashboard, procedures CRUD, unanswered questions queue
7. Verify build, smoke test chat with seed data

## Notes / caveats for you

- **First admin**: after signup, you'll need me to insert a row into `user_roles` for that user (one SQL call). I'll show you how.
- **Track My Case iframe**: `mahakim.ma` may set `X-Frame-Options: DENY`. If embedding is blocked by their server, the panel will appear blank — in that case I'll fall back to a clearly-labeled "Open in new tab" button. I'll detect this after first build.
- **Seed data**: I'll add ~3 example procedures (e.g. national ID card, birth certificate, civil status copy) in all three languages so the chat is demoable immediately. You can replace via admin panel.
- **Scope size**: this is a big first pass. I'll build it in one go but expect iteration on copy, more procedures, and admin UX polish afterward.

Ready to build on your approval.
