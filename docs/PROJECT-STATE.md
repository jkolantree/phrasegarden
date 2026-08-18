# PhraseGarden project state

Updated: 2026-08-17

## Resume cursor

| Field | Current value |
|---|---|
| `activePackage` | `PREVIEW-3-BEGINNER-JOURNEY` |
| `state` | `QUIESCENT_AWAITING_CHECKPOINT` |
| `candidateFingerprint` | Generic catalog checkpoint `db85ed4a09f2e960ce0f6a31f84844b6e719bdf6`; twelve-path beginner presentation has an independent PASS and awaits its exact checkpoint |
| `closedAcceptanceIds` | `PC-01`–`PC-10`, Interpreter, `G3-ADV-01`–`G3-ADV-09`, `P3-02`, `P3-AR-01`–`P3-AR-08`, `GLC-01`–`GLC-10`, and `BJ-01`–`BJ-12` verified; `P3-01` and `P3-03`–`P3-12` require combined qualification |
| `nextKnownBlocker` | exact twelve-path beginner-journey checkpoint, then the separately bounded Pages-policy repair |
| `lastCompletedCheck` | Beginner journey: 3/3 focused UI, 287/287 full Vitest, dual typechecks, Vite build, 12/12 sequential Edge/axe, visual/copy/download/reflow checks, and independent PASS |
| `retryCounters` | Preview 3: archive returns 2 and consolidated redesign 1; Generic cohort: snapshot transition repair 1; beginner journey: initial-viewport repair 1 and semantic-language review repair 1 |
| `frozenManifestHash` | not frozen; Preview 3 source and distributable manifests do not yet exist |
| `exactNextAction` | checkpoint only the twelve beginner-journey paths; then contract and repair Pages policy |
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
identity-only profiles. The working tree adds the bounded beginner-facing
presentation but has not checkpointed it. The proposed identity remains
`0.1.0-preview.3`; its source is not frozen, packaged, published, or deployed.
Current remote/public state has not been freshly read.

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
| Beginner-facing language journey | completed locally / awaiting checkpoint | 3/3 focused UI, 287/287 Vitest, 12/12 Edge/axe, dual typechecks/build, desktop/mobile screenshots, copy/download/reflow, independent PASS |
| Preview 3 Pages policy | deferred after presentation | immutable action refs and main-only deployment remain unresolved |
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
release, or deployment has been performed. Existing evidence is reused only
where its exact bytes remain bound.

## Exact next eligible action

Checkpoint only the twelve beginner-journey paths. Resolve Pages policy
afterward. Only the clean combined descendant may enter fresh source
qualification. Do not begin Gate 4 or claim stable release readiness.
