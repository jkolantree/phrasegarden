# PhraseGarden project state

Updated: 2026-07-24

## Resume cursor

| Field | Current value |
|---|---|
| `activePackage` | `G3.5-ADVANCED-DISCLOSURE` |
| `state` | `READY` |
| `candidateFingerprint` | product checkpoint `c2e6104e3b47ef180d5e27da5147d31b59ee4ebf`, tree `68b87eabf3bce25ee989d736787d259016072530`; normalized process core `PC-CORE-2` SHA-256 `BAAB01174082D20C7D4357E06F3695265CAD08DD9954ED16CBA9DA0AA2515887` |
| `closedAcceptanceIds` | `PC-01`–`PC-10` verified; semantic PASS transferred to `PC-CORE-2` through the independently qualified whitespace-only delta |
| `nextKnownBlocker` | the bounded `G3.5` package contract has not yet been written |
| `lastCompletedCheck` | staged-byte transport PASS: exact nine paths, cached diff clean, no unstaged work, old core reconstructed byte-for-byte, `PC-CORE-2` exact |
| `retryCounters` | process package closed at command 2, review repair cycle 2, administrative receipt correction 1, formatting repair 1; `G3.5` counters all 0 |
| `frozenManifestHash` | not frozen; no release-candidate qualification has begun |
| `exactNextAction` | write the bounded `G3.5` contract from `G3-ADV-01`–`G3-ADV-09`, baseline exact owned/protected paths, then stop if any semantic or version change is required |
| `forbiddenUntil` | no `G3.5` implementation before its contract and baseline pass; no Gate 4+ work before Gate 3 exit; no remote write without exact authorization |

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
| Gate 3 Advanced Controls | ready | approved semantics; bounded contract is the exact next action |
| Gate 3 exit qualification | blocked by order | begins only after Advanced Controls passes |
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

No new visual ideation, full browser rerun, assistive-technology session,
packaging, model evaluation, prospective-fixture use, remote CI, network write,
release, or deployment was performed for this documentation-only package.

## Exact next eligible action

Write the bounded `G3.5` Advanced disclosure contract using
`G3-ADV-01`–`G3-ADV-09`, then baseline its exact owned and protected paths.
Do not implement Gate 4 or perform any remote release action.
