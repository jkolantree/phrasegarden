# PhraseGarden project state

Updated: 2026-07-24

## Resume cursor

| Field | Current value |
|---|---|
| `activePackage` | `PREVIEW-3-SOURCE-CLAIMS` |
| `state` | `QUIESCENT_AWAITING_REVIEW` |
| `candidateFingerprint` | product base `e96f4b51a3bc49102acd66361b1a88d38f40e472`, tree `82d7c972a6272dd4ad66abdbf09b1e92196cf3ef`; Preview 3 source is not frozen yet |
| `closedAcceptanceIds` | `PC-01`–`PC-10`, Interpreter, and `G3-ADV-01`–`G3-ADV-09` verified; `P3-01`–`P3-12` active |
| `nextKnownBlocker` | independent review and exact checkpoint of the source-claims subpackage |
| `lastCompletedCheck` | source claims: focused Playwright/axe 2/2, 277/277 Vitest, dual typechecks, zero forbidden-domain matches, screenshot and diff inspection pass |
| `retryCounters` | process package: command 2, review repair 2, receipt correction 1, formatting repair 1; `G3.5`: command 5, implementation repair 0, review repair 1; Preview 3: command 2, review repair 1, process split 1 |
| `frozenManifestHash` | not frozen; Preview 3 source and distributable manifests do not yet exist |
| `exactNextAction` | review and checkpoint source claims, then review and checkpoint the separately bounded same-byte pipeline |
| `forbiddenUntil` | no Gate 4+ work; publication must use the exact qualified Preview 3 source, tag, assets, Pages target, and rollback artifact |

## Current product state

PhraseGarden `0.1.0-preview.2` is the immutable public pre-release at
<https://jkolantree.github.io/phrasegarden/>. Tag `v0.1.0-preview.2` resolves
to exact package commit `6e55e8d142c748de181cd5136076d576d0994e19`.
It includes Written Translator and Live Voice Coach.

The local `release/next` branch adds the independently reviewed Gate 3
Interpreter at `c2e6104`, process controls at `e293426`, and progressive
Advanced settings at `e96f4b5`. The proposed package identity is
`0.1.0-preview.3`; it is not yet frozen, packaged, published, or deployed.

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
| Preview 3 source claims and accessibility | current candidate | bounded contract; focused checks green, independent review pending |
| Preview 3 same-byte pipeline | next package | implementation remains unstaged until source-claims checkpoint |
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

No new visual ideation, manual assistive-technology session, model evaluation,
prospective-fixture use, remote CI, network write, release, or deployment has
been performed for Preview 3. Existing local automated evidence is reused only
where its exact bytes remain bound.

## Exact next eligible action

Pass independent review and checkpoint the source-claims package, then review
and checkpoint the same-byte pipeline package. Only after both checkpoints
combine cleanly may the source be frozen, built once, and packaged by exact
bytes. Do not begin Gate 4 or claim stable release readiness.
