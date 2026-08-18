# PhraseGarden project state

Updated: 2026-08-17

## Resume cursor

| Field | Current value |
|---|---|
| `activePackage` | `PREVIEW-3-ARCHIVE-VERIFIER-REPAIR` |
| `state` | `QUIESCENT_AWAITING_CHECKPOINT` |
| `candidateFingerprint` | checkpoint `83558bdc373a7e8ec8d1f18d6713f526c2aad505` is returned development history; its six-path forward repair has an independent core PASS and awaits its exact checkpoint |
| `closedAcceptanceIds` | `PC-01`–`PC-10`, Interpreter, `G3-ADV-01`–`G3-ADV-09`, `P3-01`–`P3-02`, and `P3-AR-01`–`P3-AR-08` verified; `P3-03`–`P3-12` remain active |
| `nextKnownBlocker` | exact six-path archive-repair checkpoint, then the authorized five-language Generic catalog package |
| `lastCompletedCheck` | archive repair: 20/20 focused, 277/277 Vitest, dual typechecks, Vite build, 9/9 historical checksums, zero forbidden-domain matches, and independent zero-P1/P2/P3 core PASS |
| `retryCounters` | process package: review repair 2; `G3.5`: review repair 1; Preview 3: process split 2, archive repair returns 2, consolidated resource-bound redesign 1 |
| `frozenManifestHash` | not frozen; Preview 3 source and distributable manifests do not yet exist |
| `exactNextAction` | checkpoint only the six archive-repair paths; then implement and review the separately bounded five-language Generic catalog before Pages policy and a new combined source qualification |
| `forbiddenUntil` | no Gate 4+ work; publication must use the exact qualified Preview 3 source, tag, assets, Pages target, and rollback artifact |

## Current product state

PhraseGarden `0.1.0-preview.2` is the last byte-qualified public pre-release at
<https://jkolantree.github.io/phrasegarden/>. Tag `v0.1.0-preview.2` resolves
to exact package commit `6e55e8d142c748de181cd5136076d576d0994e19`.
It includes Written Translator and Live Voice Coach.

The local `release/next` branch adds the independently reviewed Gate 3
Interpreter at `c2e6104`, process controls at `e293426`, and progressive
Advanced settings at `e96f4b5`, and the independently reviewed Preview 3
source claims at `aa75e60`, and the returned archive checkpoint at `83558bd`.
The archive repair is independently reviewed but not checkpointed. The proposed
package identity remains `0.1.0-preview.3`; its source is not frozen, packaged,
published, or deployed. Current remote/public state has not been freshly read.

Detailed proof is preserved outside this cursor:

- [Preview 1 release evidence](evidence/releases/0.1.0-preview.1.md)
- [Preview 2 release evidence](evidence/releases/0.1.0-preview.2.md)
- [Gate 3 Interpreter evidence](evidence/candidates/gate-3-interpreter.md)

## Durable boundaries

- Woven Conversation is the sole implemented visual direction.
- English→Japanese and Japanese→English derive Preview from one exact versioned
  directed pack. External linguistic review remains incomplete.
- Every other bundled direction derives Generic and receives no endpoint- or
  pair-specific linguistic clause.
- The compiler remains pure, deterministic, and independent of Preact,
  browser, network, storage, clock, randomness, ambient `Intl`, telemetry,
  backend, or runtime model calls.
- `LanguageProfile.id === LanguageProfile.bcp47`; identity is exact and
  registry-pinned. Profile version remains separate.
- Interface, home, target, and generated-instruction language remain distinct.
- The app never asks for source text. Current settings and prompt edits are
  memory-only.
- Home creates from current defaults; Builder adjusts optional settings; Review
  is the informed-use handoff and never sends or runs a prompt.
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
| Gate 2 deterministic foundation | completed | pure validators/compiler, seven profiles, Preview pack, Written and Voice |
| Published Preview 2 | completed | immutable release ledger and public-byte qualification |
| Gate 3 Interpreter | completed locally | `c2e6104`; 277/277 Vitest, 10/10 Edge/axe, dual typechecks, build/audit, independent PASS |
| Next-release process controls | completed | `PC-01`–`PC-10`, reviewed `PC-CORE-1`, normalized `PC-CORE-2`, and staged-byte transport PASS |
| Gate 3 Advanced Controls | completed locally | `G3-ADV-CORE-2`; 277/277 Vitest, 11/11 Edge/axe, dual typechecks, build/audit, protected paths unchanged, desktop/320 px closed/open screenshots, independent PASS |
| Preview 3 source claims and accessibility | completed locally | exact 13-path checkpoint `aa75e60`; focused checks and independent PASS |
| Preview 3 archive checkpoint | returned | `83558bd`; later adversarial review reproduced exact-byte, parsing, resource, metadata, and retry defects |
| Preview 3 archive repair | completed locally / awaiting checkpoint | 20/20 focused plus full deterministic/type/build checks and independent core PASS |
| Five-language Generic catalog | authorized next | `de`, `es`, `fr`, `it`, and region-unspecified `pt`; no pair pack or review-tier claim |
| Preview 3 Pages policy | deferred after catalog | immutable action refs and main-only deployment remain unresolved |
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

No new visual-ideation batch, manual assistive-technology session, model
evaluation, prospective-fixture use, remote CI, network write, release, or
deployment has been performed. Existing evidence is reused only where its
exact bytes remain bound.

## Exact next eligible action

Checkpoint only the six archive-repair paths. Then implement and review the
bounded five-language Generic catalog and beginner-facing clarification
package. Resolve Pages policy afterward. Only the clean combined descendant
may enter fresh source qualification. Do not begin Gate 4 or claim stable
release readiness.
