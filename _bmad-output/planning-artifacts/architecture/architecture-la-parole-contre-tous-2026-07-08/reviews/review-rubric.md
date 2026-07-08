---
type: architecture-spine-review
reviews: ARCHITECTURE-SPINE.md (architecture-la-parole-contre-tous-2026-07-08)
created: 2026-07-08
---

# Review — ARCHITECTURE-SPINE.md vs. "good spine" rubric

## Verdict

Solid, terse, well-structured spine that fixes most of the real divergence points for a two-beginner-developer build — but it ships with one data-model gap that will actively cause the two builders to invent incompatible schemas (read/unread tracking), one implicit security assumption that should be an explicit Rule (RLS/anon-key defense-in-depth), one deliberately-unpinned dependency (TypeScript) plus no in-document version-verification marker, and a missing operational-envelope item (backups/DR for sensitive minor mental-health data). Fix these four and the spine is ready.

---

## 1. Real divergence points — fixed vs. missed

Covered well: single codebase vs. Wix (AD-1), stack lock (AD-2), write boundary via Server Actions (AD-3), data-access boundary (AD-4), session/recovery-code mechanism (AD-5), danger-keyword detection location (AD-6), single Telegram channel (AD-7), organizer auth (AD-8), anti-brute-force (AD-9), environments (AD-10). These are exactly the kind of "two devs would otherwise build it two different ways" decisions a spine should nail down, and each is bound to concrete FRs.

**Missed divergence point (significant):** FR-5 requires "un indicateur clair des messages non lus/non traités," and AD-7 / FR-15 requires the relance cron to know "si aucun organisateur n'a ouvert la Conversation sous 4h." Neither the `CONVERSATION` nor `MESSAGE` entity in the ER diagram (lines 143–158) carries any read/opened/last-seen field. Nothing in the Capability Map or Deferred section flags this either. Two independent builders each implementing FR-5 and FR-15 will each invent their own tracking scheme (e.g., one adds `last_read_at` to `CONVERSATION`, the other adds a per-organizer `read_receipts` join table) — a direct, concrete schema divergence the spine exists to prevent. This should be closed with an explicit column (or small table) in the Structural Seed, not left implicit.

No other real gaps found at this altitude — testing/CI conventions and UI component-library choice were considered but judged sub-initiative (team-process / presentation-layer, not structural divergence risks given only two devs and one repo).

## 2. AD Rule enforceability

Nine of ten ADs have a Rule that is mechanically checkable and that genuinely blocks its stated "Prevents." One exception:

**AD-4 — incomplete, not vague, but under-specified.** The Rule forbids a browser Supabase client for `conversations`/`messages` and mandates the service-role key server-side. It does **not** say anything about Row Level Security state on those tables. Supabase auto-exposes every table via PostgREST unless RLS is enabled with a deny-by-default policy; disabling browser access "by convention" (no client instantiated) is not the same guarantee as disabling it at the database layer. If either dev later adds any `NEXT_PUBLIC_SUPABASE_ANON_KEY` client for an unrelated reason (easy beginner mistake), these tables become reachable from the anon key with no additional gate, because there's no RLS backstop. The AD should add a one-line Rule: "RLS enabled with default-deny policies on `conversations`/`messages`/`recovery_attempts`, regardless of the service-role bypass, as defense in depth" — otherwise the Prevents claim ("un client Supabase exposé... donnerait un accès direct aux Conversations") is not actually guaranteed by the stated Rule.

All other Rules (AD-1, 2, 3, 5, 6, 7, 8, 9, 10) are specific enough that a reviewer could mechanically check compliance in a PR.

## 3. Deferred — anything that should have been fixed?

Reviewed each Deferred item; all six are legitimately deferrable (product/legal decisions, or genuinely low-blast-radius choices with an explicit fallback already decided). None of them create build-time divergence between the two developers as currently deferred.

**However, something is missing from Deferred that probably shouldn't be silent:** there is no mention anywhere (decided or deferred) of Postgres backup/restore or disaster-recovery posture, despite the data being sensitive mental-health information about minors (PRD §10 explicitly flags UK GDPR special-category status). Supabase's free tier has limited/no point-in-time recovery. This is a real operational-envelope item (see §5 below) that the spine silently skips rather than deciding or deferring with a flag.

## 4. Version pinning / verified-current

Partially fails. Next.js (16.2.10 LTS), @supabase/supabase-js (2.110.1), Tailwind (4.3.2) are pinned to specific versions. Two problems:

- **TypeScript is explicitly left unpinned**: "dernière stable (fournie par le starter Next.js)" — a floating reference by design, which undercuts the stated purpose of the Stack table (a fixed, shared baseline for both builders). At minimum this should pin whatever version the starter resolves to at project-init time.
- **No verified-current marker in the spine itself.** The companion `.memlog.md` (lines 12–13, 17) notes "(vérifié web, juillet 2026)" for the Vercel/Supabase tier limits and versions — but that provenance note lives only in the memlog, not in ARCHITECTURE-SPINE.md. A reader of the spine alone (its intended standalone audience per its own purpose: build-substrate) cannot tell these numbers were checked vs. asserted from training data. Per the rubric's own separation of concerns (rationale in memlog, decisions in spine), the *decision* to pin these exact versions belongs in the spine, but the verification provenance/date is exactly the kind of fact that should be at least footnoted in the Stack table (e.g., "verified 2026-07") so the document is self-certifying without cross-referencing the memlog.

## 5. Structural dimension coverage (initiative altitude)

Deployment & environments: covered (AD-10). Infra/provider strategy: covered (AD-2, Stack table). Operations — partially covered: notification/alerting operational behavior is covered (AD-7, FR-15 relance), secrets management is covered (Consistency Conventions, "Config & secrets" row). **Backups/DR is not covered at all — not decided, not deferred, not flagged as an open question.** Given the data sensitivity (self-harm disclosures from minors) this is the one operational-envelope item that should not be silently absent; it doesn't need a full plan, but it needs at minimum a Deferred line with an accepted-risk statement, the same treatment given to the Telegram-fallback and staging-environment items.

Monitoring/error-observability (e.g., what happens when a Vercel function throws, how errors surface to the two devs) is also absent, but is a lower-severity omission — Vercel's default function logs plausibly suffice for two-person scale and this is more implementation-detail than structural-divergence risk.

## 6. Terseness / structure

Passes. The document is table- and AD-block-driven with two Mermaid diagrams (layer graph, structural seed graph, ER diagram) and a source tree; each AD's "Prevents"/"Rule" pair is 1–3 sentences and directly load-bearing, not a rationale essay. Extended rationale (why Telegram over WhatsApp, why Supabase free tier suffices, version-verification notes) correctly lives in `.memlog.md` rather than the spine. No section reads as a rationale dump.

## 7. Placeholders / TODOs / empty sections

None found. `companions: []` is an intentional empty array (no companion docs needed for this scope), not a leftover placeholder. All ten AD sections, Consistency Conventions, Stack, Structural Seed, Capability Map, and Deferred are fully populated.

---

## Summary of required fixes

1. Add read/opened-tracking to the data model (ER diagram + a Rule, likely folded into AD-7 or a new AD) so FR-5 and FR-15 have one shared mechanism instead of two independently-invented ones.
2. Extend AD-4's Rule to mandate RLS-enabled/default-deny on `conversations`, `messages`, `recovery_attempts` as defense in depth, not just "no browser client by convention."
3. Pin TypeScript to a concrete version; add a verified-current footnote/date to the Stack table itself (not only the memlog).
4. Add a Deferred line for Postgres backup/DR posture with an explicit accepted-risk statement, consistent with how the Telegram-fallback and staging-environment risks are already handled.
