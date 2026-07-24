# PhraseGarden project state

Updated: 2026-07-24

## Resume cursor

| Field | Current value |
|---|---|
| `activePackage` | `G3.5-ADVANCED-DISCLOSURE` |
| `state` | `COMPLETED_LOCAL` |
| `candidateFingerprint` | `G3-ADV-CORE-2` SHA-256 `6B14FE99E5C91914873564CB6EC039AD437743CD787B4EC08A2BA35A206C0FBB`, based on checkpoint `e29342674c28b80be9cbc894abd2e5df17a7a1b1`; process core remains `PC-CORE-2` SHA-256 `BAAB01174082D20C7D4357E06F3695265CAD08DD9954ED16CBA9DA0AA2515887` |
| `closedAcceptanceIds` | `PC-01`–`PC-10` and `G3-ADV-01`–`G3-ADV-09` verified; `G3-ADV-CORE-2` independent review PASS with zero open P1/P2/P3 |
| `nextKnownBlocker` | none within `G3.5`; Gate 3 Preview publication qualification is separately active by explicit user authorization |
| `lastCompletedCheck` | renewed explicit authorization cleared the transport blocker; exact seven-path checkpoint staging is in progress with implementation core unchanged |
| `retryCounters` | process package: command 2, review repair 2, receipt correction 1, formatting repair 1; `G3.5`: command 5, implementation repair 0, review repair 1 |
| `frozenManifestHash` | not frozen; no release-candidate qualification has begun |
| `exactNextAction` | finish the exact local checkpoint, then qualify and publish only `0.1.0-preview.3` under the user's explicit release authorization |
| `forbiddenUntil` | no Gate 4+ work; publication must use the exact qualified Preview 3 source, tag, assets, Pages target, and rollback artifact |

## Current product state

PhraseGarden `0.1.0-preview.2` is the immutable public pre-release at
<https://jkolantree.github.io/phrasegarden/>. Tag `v0.1.0-preview.2` resolves
to exact package commit `6e55e8d142c748de181cd5136076d576d0994e19`.
It includes Written Translator and Live Voice Coach.

The local `release/next` branch adds the independently reviewed Gate 3
Interpreter slice at commit
`c2e6104e3b47ef180d5e27da5147d31b59ee4ebf`. It is unpublished, unpackaged,
undeployed, and not release-qualified.

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
| Gate 3 Preview publication qualification | active by authorization | bounded to `0.1.0-preview.3`; no Gate 4+ feature work |
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

No new visual ideation, assistive-technology session, packaging, model
evaluation, prospective-fixture use, remote CI, network write, release, or
deployment was performed. Deterministic checks preceded the one warranted full
browser run.

## Exact next eligible action

Complete the exact seven-path local checkpoint, then contract and execute only
the minimum Preview 3 qualification, packaging, publication, and public-byte
verification authorized by the user. Do not begin Gate 4 or claim stable
release readiness.
