# PhraseGarden project state

Updated: 2026-08-18

## Resume cursor

| Field | Current value |
|---|---|
| `activePackage` | `PREVIEW-3-SOURCE-MANIFEST-AND-PACKAGER` Child A |
| `state` | `COMPLETED_LOCAL_CHECKPOINT` |
| `candidateFingerprint` | source-manifest core `e421e0a3248d9d7c1730929697920f8b757b8792` plus regressions `06cc7cb032ec7798accb8757d10a21df75fcefdb`; exact implementation and test bytes received separate independent PASS verdicts |
| `closedAcceptanceIds` | prior IDs plus `SM-01`–`SM-05` verified for deterministic construction tooling; `P3-01` and `P3-03`–`P3-12` still require combined qualification, packaging, or publication as named |
| `nextKnownBlocker` | separately reviewed same-byte package staging and promotion tooling before one clean source qualification |
| `lastCompletedCheck` | source tooling: 16/16 focused within 36/36 Python release tests, 311/311 Vitest, dual typechecks, Vite build, 23/23 release audit, current-dist audit, 9/9 historical checksums, zero domain matches, diff/cache hygiene, and independent semantic/security PASSes for both A1a and A1b |
| `retryCounters` | Preview 3: archive returns 2 and consolidated redesign 1; Generic cohort: snapshot transition repair 1; beginner journey: viewport repair 1 and semantic-language repair 1; Pages policy: scanner repair 1, review returns 6, assertion repair 1, line-counter repair 1, CSP redesign 2; mobile select: two fixture-driven repairs, now development-only |
| `frozenManifestHash` | not frozen; tooling exists, but no Preview 3 source or distributable manifest has been generated |
| `exactNextAction` | implement Child B same-byte package staging and exact promotion; then exclusively create one manifest from the clean source commit and qualify that exact commit/manifest once |
| `forbiddenUntil` | no Gate 4+ work; publication must use the exact qualified Preview 3 source, tag, assets, Pages target, and rollback artifact |

## Current product state

PhraseGarden `0.1.0-preview.2` is the last byte-qualified public pre-release at
<https://jkolantree.github.io/phrasegarden/>. Tag `v0.1.0-preview.2` resolves
to exact package commit `6e55e8d142c748de181cd5136076d576d0994e19`.
It includes Written Translator and Live Voice Coach.

The local `release/next` branch adds the independently reviewed Gate 3
Interpreter at `c2e6104`, process controls at `e293426`, and progressive
Advanced settings at `e96f4b5`, and the independently reviewed Preview 3
source claims at `aa75e60`, returned archive checkpoint `83558bd`, and archive
repair at `70858f1`. Generic catalog checkpoint `db85ed4` adds five
identity-only profiles; beginner-journey checkpoint `3c2a606` clarifies their
presentation. Pages checkpoint `4d9002f` hardens deployment policy; validator
checkpoint `d6cb448` removes an asset-order assumption; mobile checkpoint
`7fb32c7` makes complete default choices visible at 320 px. The proposed
identity remains `0.1.0-preview.3`. This checkpoint aligns its bounded public
claims and accessibility evidence. Source-manifest core checkpoint
`e421e0a3248d9d7c1730929697920f8b757b8792` and regression checkpoint
`06cc7cb032ec7798accb8757d10a21df75fcefdb` add complete-tree identity tooling
without creating evidence bytes. The source is not frozen, packaged,
published, or deployed. PhraseGarden remote/public state has not been freshly
read.

Detailed proof is preserved outside this cursor:

- [Preview 1 release evidence](evidence/releases/0.1.0-preview.1.md)
- [Preview 2 release evidence](evidence/releases/0.1.0-preview.2.md)
- [Gate 3 Interpreter evidence](evidence/candidates/gate-3-interpreter.md)

## Durable boundaries

- Woven Conversation is the sole implemented visual direction.
- English→Japanese and Japanese→English derive Preview from one exact versioned
  directed pack. External linguistic review remains incomplete.
- Twelve exact profiles are bundled. Every non-English↔Japanese direction
  derives Generic and receives no endpoint- or pair-specific linguistic clause.
- `pt` is region-unspecified Portuguese; regional Portuguese identities and
  adequacy claims remain unsupported.
- The compiler remains pure, deterministic, and independent of Preact,
  browser, network, storage, clock, randomness, ambient `Intl`, telemetry,
  backend, or runtime model calls.
- `LanguageProfile.id === LanguageProfile.bcp47`; identity is exact and
  registry-pinned. Profile version remains separate.
- Interface, home, target, and generated-instruction language remain distinct.
- One authored presentation catalog orders English names deterministically and
  shows autonyms without flags or visible language codes; canonical tags remain
  control values and technical provenance.
- The app never asks for source text. Current settings and prompt edits are
  memory-only.
- Home creates from current defaults; Builder adjusts optional settings; Review
  is the informed-use handoff and never sends or runs a prompt.
- Pages policy derives no release bytes: main-only CI verifies and twice audits
  one checked-in archive, uses pinned action commits, and grants deployment
  permissions only to the deploy job.
- Canonical output and user-modified copies remain distinct artifacts.
- Review evidence is a separate structural artifact. No validator proves a
  human act, reviewer qualification, linguistic truth, or support tier.
- Interpreter is one-way and host-bounded. It never infers speaker, direction,
  audio, pause, interruption, silence, or turn boundaries.
- Interpreter `mark-uncertainty` never asks. `ask-if-blocking` permits at most
  one concise blocking question.
- The approved Advanced Controls interpretation is UI organization only:
  existing settings, defaults, prompt behavior, summaries, provenance, and
  artifact versions must remain unchanged.

## Milestones

| Item | State | Evidence |
|---|---|---|
| Gate 0 contracts | completed | product, architecture, recipe, evaluation, decisions, and fixture contracts |
| Gate 1 visual target | completed | Woven Conversation design contract |
| Gate 2 deterministic foundation | completed | pure validators/compiler, twelve profiles, Preview pack, Written and Voice |
| Published Preview 2 | completed | immutable release ledger and public-byte qualification |
| Gate 3 Interpreter | completed locally | `c2e6104`; 277/277 Vitest, 10/10 Edge/axe, dual typechecks, build/audit, independent PASS |
| Next-release process controls | completed | `PC-01`–`PC-10`, reviewed `PC-CORE-1`, normalized `PC-CORE-2`, and staged-byte transport PASS |
| Gate 3 Advanced Controls | completed locally | `G3-ADV-CORE-2`; 277/277 Vitest, 11/11 Edge/axe, dual typechecks, build/audit, protected paths unchanged, desktop/320 px closed/open screenshots, independent PASS |
| Preview 3 source claims and accessibility | completed locally | exact 13-path checkpoint `aa75e60`; focused checks and independent PASS |
| Preview 3 archive checkpoint | returned | `83558bd`; later adversarial review reproduced exact-byte, parsing, resource, metadata, and retry defects |
| Preview 3 archive repair | completed locally | checkpoint `70858f1`; 20/20 focused plus full checks and independent PASS |
| Five-language Generic catalog | completed locally | checkpoint `db85ed4`; `de`, `es`, `fr`, `it`, region-unspecified `pt`; 396 matrix and independent PASS |
| Beginner-facing language journey | completed locally | checkpoint `3c2a606`; 3/3 focused UI, 287/287 Vitest, 12/12 Edge/axe, screenshots, independent PASS |
| Preview 3 Pages policy | completed locally | checkpoint `4d9002f`; five immutable pins, main-only least privilege, strict bounded audit, full local gates, adversarial mutation matrix, independent PASS |
| Release-audit asset order | completed locally | checkpoint `d6cb448`; exact CSS/JavaScript path-shape binding, JS-first regression, 23/23 focused, independent PASS |
| Mobile select clarity | completed locally | checkpoint `7fb32c7`; two complete default labels at 320 px, 4/4 focused, 311/311 full, 12/12 Edge/axe, independent visual PASS |
| Preview 3 claims and accessibility | completed locally | checkpoint `fde72854c7c0d0439f0ac71e1c69a6b23a2052b9`; four substantive documents retain semantic/UX PASSes; final PROJECT/TRACE/contract status closure separately rebound |
| Preview 3 source-manifest tooling | completed locally | `e421e0a3248d9d7c1730929697920f8b757b8792` core plus `06cc7cb032ec7798accb8757d10a21df75fcefdb` regressions; 16/16 focused, full local gates, and independent A1a/A1b PASSes; no manifest generated |
| Gates 4–6 | skipped by order | no implementation begun |
| External linguistic review | deferred | Preview labels state the limitation |
| Model/prospective evaluation | skipped | no model calls and no prospective fixtures consumed |
| Remote release work | unchanged | no push, tag, release, Pages, or CI write for the local candidate |

## Known limitations and next release decisions

- The interface and generated instruction surface are English-only.
- No local library, import/export, sharing, service worker, or cold-offline
  refresh exists. An already loaded page works without runtime network calls.
- Manual screen-reader, real IME, and forced-colors Gate 3 exit evidence is not
  yet complete.
- Hosted infrastructure may keep ordinary asset-request logs; PhraseGarden
  sends no recipe settings or source content.
- Before Gate 4: decide record ID, local modified-time meaning, update/rename,
  and import-collision policy.
- Before Japanese UI: decide author/reviewer claim, default locale, and whether
  an explicit locale choice persists.
- Before durable offline: decide activation behavior and pass the first-worker
  rollback matrix in `RELEASE-WORKFLOW.md`.
- Before stable release: reconcile the original four tiers with the accepted
  Preview tier, choose release identity, and define human reviewer governance.
- Moderated usability evidence, any model evaluation, verify-only CI, and
  publication each require their own just-in-time contract or authorization.

## Credit-expensive work deliberately avoided

No new visual-ideation batch, manual assistive-technology or moderated usability
session, model evaluation, prospective-fixture use, remote CI, network write,
release, or deployment has been performed. Five official action refs were read
once; no PhraseGarden remote write or public-state claim was made. Existing
evidence is reused only where its exact bytes remain bound. No real source
manifest or release package was generated during tooling development.

## Exact next eligible action

Implement and independently review Child B same-byte package staging and exact
promotion. Then exclusively create one manifest from the clean source commit
and qualify that exact commit/manifest once. Do not begin Gate 4 or claim stable
release readiness.
