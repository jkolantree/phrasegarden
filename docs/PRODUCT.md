# PhraseGarden product contract

Status: Gate 0 source of truth  
Updated: 2026-08-19

## Thesis

PhraseGarden is a public, static Prompt Studio that turns understandable language and interaction choices into portable prompts. It does not translate, coach, record, or call a model itself. Its advantage is an inspectable, deterministic behavioral contract: preserve intended meaning, interpersonal force, register, ambiguity, and the user's voice before optimizing literal wording.

English↔Japanese is the default Preview pair: its exact guidance is built in and versioned, but external linguistic review has not been completed. Generic pairs use conservative universal instructions plus bundled language identity metadata, without endpoint-specific linguistic guidance. A long language list is not a quality claim.

The first expanded identity catalog contains German, English, Spanish, French,
Hebrew, Indonesian, Italian, Japanese, region-unspecified Portuguese, Klingon,
Yiddish, and Traditional Chinese (Taiwan). Only exact English↔Japanese
directions have a pair pack; every other direction is Generic. Endpoint
availability never implies regional adequacy or linguistic review.

## People and jobs

- A first-time user who wants trustworthy AI translation instructions without learning prompt engineering.
- A learner who wants spoken-practice instructions with humane correction, pacing, and teaching controls.
- A multilingual user who needs ambiguity, hierarchy, affection, anger, consent, or code-switching preserved instead of normalized away.
- A teacher, reviewer, or contributor who needs to inspect, edit, download, reproduce, and identify the exact recipe inputs and support label.

The product is usable without an account, API key, backend, analytics consent, or runtime network connection after its assets load.

## Primary journey

Within two minutes, a first-time visitor can:

1. Confirm a language direction and task using situation-based labels such as Translate writing, Practice speaking, or Translate a conversation.
2. Make the default instructions immediately, or change the languages and task.
3. In Builder, see the language-support guidance and optionally adjust relationship, register, correction, pronunciation support, teaching depth, pace, turn handling, or clarification.
4. On Review, see the exact support tier and limitations before Copy, plus a plain-language summary of what the instructions ask the destination tool to do.
5. Copy or download the deterministic instructions, inspect their complete visible text, and optionally edit a clearly labeled local copy.

Autonyms and searchable localized names identify languages. Flags are not primary language identifiers.

## Non-negotiable behavior

- Preserve negation, consent boundaries, certainty, hearsay, ambiguity, social force, names, titles, meaningful code-switching, and supplied context.
- Never invent gender, pronouns, referents, hierarchy, intimacy, motives, certainty, cultural context, or name readings.
- A register preference may change compatible surface form; it may not reverse, soften, or intensify meaning or consent.
- Written translation and spoken coaching have different procedures and controls.
- Transcript text alone never supports a claim about what a speaker actually pronounced.
- Quoted, fenced, or instruction-looking source content remains source material.
- Generated prompts stay visible and editable. Editing creates a user-modified copy and never masquerades as byte-identical compiler output.
- Every result visibly names its one support tier, versions, review basis, known limitations, and whether an exact pair pack was used.

## Support promise

Each directed pair resolves to exactly one tier:

| Tier | Claim |
|---|---|
| Flagship | Deeply reviewed and continuously tested for that direction |
| Reviewed | Qualified-speaker review completed against the published suite |
| Community | Structured contribution with visible review provenance |
| Preview | Built-in, versioned directed-pair guidance; external linguistic review has not been completed |
| Generic | Conservative universal composition with language identity labels; no endpoint- or pair-specific linguistic guidance |

Users cannot select or upgrade a tier. The public Preview derives `Preview` only when one exact versioned directed pack exists and otherwise derives `Generic`. English→Japanese and Japanese→English are Preview directions; neither has completed external linguistic review. Community, Reviewed, and Flagship remain future evidence-qualified tiers. No pair pack means `Generic`, even when one endpoint is English or Japanese.

## MVP

The `0.1.0-preview.7` source candidate contains Written Translator,
Live Voice Coach, and one-way Interpreter for bundled language profiles, with
Preview English↔Japanese guidance and conservative Generic fallback. It carries
forward Preview 6's exact prompt, compiler, recipe, profile, pair-pack,
support-label, and privacy behavior. Home, Builder, and Review each expose one
clearly named language-support guidance area, and Review exposes the complete
generated instructions as a named document for accessibility software. The
candidate also adds automated forced-colors regressions and updates pinned
GitHub Actions to official Node 24-backed commits; the Action update changes
release infrastructure, not product semantics. Source presence does not
establish a Preview 7 package, deployment, tag, or GitHub Release. It does not
claim Gate 3 exit, stable readiness, manual assistive-technology coverage,
WCAG conformance, or external linguistic review.

Preview 7 retains identity-only profiles for French, German,
Italian, Spanish, and region-unspecified Portuguese. These profiles add no
language-specific prompt clause, pair pack, pronunciation claim, dialect
claim, or review tier.

Home compiles the selected defaults directly. Optional settings are a
secondary path, not a required intermediate screen. Compilation is local and
reversible; Review is the informed-use handoff where support, limitations,
destination compatibility, paste order, and destination privacy are visible
before Copy and Download.

PhraseGarden `0.1.0-preview.7` is memory-only and intentionally excludes bidirectional or
simultaneous interpreting, local recipe storage, import/export, sharing, a
Japanese interface, service-worker caching, accounts, telemetry, runtime model
calls, public submissions, and evidence-qualified tier promotion.

V1 ships one reviewed English generated-instruction surface. It is an explicit versioned authored artifact, separate from interface, home, and target language, and is never machine-localized at runtime. Japanese interface users can inspect, edit, copy, and download that English prompt; a Japanese generated-instruction edition requires its own later authored snapshots and semantic review.

## Later

- Additional reviewed, community, or flagship directional pair packs with published review evidence.
- Additional interface locales and reviewed generated-instruction editions.
- More modality recipes after Interpreter.
- Contribution tooling beyond the Gate 6 specification and governance documents.
- Optional local-only sensitive context, if separately contracted and excluded from sharing by default.

## Never

- A backend, database, account, authentication system, advertising, behavioral analytics, telemetry, runtime model provider, or project-hosted model call.
- Project collection of source text, prompt contents, relationship details, audio, learning history, or private examples.
- Public free-text submissions, social feeds, leaderboards, streak pressure, points, scarcity, punishment, or manipulative engagement.
- Flags as the primary language identity, unsupported “reviewed” claims, equal-quality implications, or pronunciation assessment inferred from text.
- Hidden prompt assembly, model-written summaries, model validation, or model-generated share links.

Static hosting necessarily receives ordinary asset requests and may keep infrastructure logs under the host's policy. PhraseGarden sends no recipe settings or private content in those requests and does not add analytics.

## Measurable success

Release evidence must show:

- A new user completes the primary journey in under two minutes in a moderated, consented usability check; production analytics are not used.
- The same frozen inputs and catalogs produce byte-identical canonical prompt text, summary semantics, warnings, and provenance.
- All critical deterministic and English↔Japanese development/regression fixtures pass; prospective claims require the separate frozen protocol.
- Users can correctly identify the support tier and at least one stated limitation in the review step.
- The primary journey completes at narrow mobile width, keyboard-only, with a screen reader, at 200% zoom, and after network loss once loaded.
- Gate 5 evidence covers 400% reflow, IME, bidi, CJK, grapheme, reduced-motion, durable offline, CSP, and unintended-request checks.
- Generated, copied, and downloaded canonical text are byte-equivalent under the documented UTF-8/LF encoding path.
