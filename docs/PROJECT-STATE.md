# PhraseGarden project state

Updated: 2026-08-18

## Resume cursor

| Field | Current value |
|---|---|
| `activePackage` | `PREVIEW-3-PUBLICATION` local packaging |
| `state` | `PACKAGING_COMMIT_BOUNDARY` |
| `candidateFingerprint` | source `58890218721c16e2226d42d6bc6ccd98622ae30c`, tree `802c0952bcaa5855aa47dadb2f423fb34f5150c3`, source manifest `73629B908E38AF22E8601F6C83D8FEA69EA6DF675DD8D5BD35EE2C04459148E2`, archive `48C2A6CE0233C1BE66018E4C8A3915040DB5ADCBCFF3C40BA33B534F8E21DAFA`, release manifest `C72862B522305104CC135C00FC31CC47881D8F9DCC6232B77CE027738D9D3B5F`, appended ledger `E65D2D74EF7374B65E12B7898F54D83164093C267B090D0E4E7EC95B578DEA2A`, and reviewed seven-content fingerprint `16CC7104E4BE9CA7ACBBA09027768280645280E3D98EE2D1D1878E9780C0AE66`; this administrative closure changes only state records and requires a final narrow rebind before staging |
| `closedAcceptanceIds` | prior IDs plus `CSC-01`–`CSC-06` and local evidence for `P3-01`–`P3-05`, `P3-07`, `P3-08`, and local `P3-12`; `P3-06` has reviewed implementation evidence and `P3-09`–`P3-11` remain public boundaries |
| `nextKnownBlocker` | zero-finding rebind of this state-only closure, then packaging-commit verification of the containing exact seven-path, sole-parent commit; exact-value publication confirmation remains separate |
| `lastCompletedCheck` | exact `S2`: 312/312 Vitest, 45/45 Python release tests, dual typechecks, zero domain matches, one byte-identical build, pre/post audits, 12/12 sequential Edge/axe, 9/9 historical checksums, 3/3 staged ZIP binding, source reverify, direct screenshot inspection, two independent source/package PASSes, focused packaging-record regression 24/24, and two independent repaired seven-content PASSes |
| `retryCounters` | Preview 3: archive returns 2 and consolidated redesign 1; Generic cohort: snapshot transition repair 1; beginner journey: viewport repair 1 and semantic-language repair 1; Pages policy: scanner repair 1, review returns 6, assertion repair 1, line-counter repair 1, CSP redesign 2; mobile select: two fixture-driven repairs, now development-only; commit-stable claims: temporal root-cause repair 1 and test-typing repair 1; packaging evidence: remote-preflight boundary repair 1 |
| `frozenManifestHash` | source manifest 27,655 bytes, 143 files, SHA-256 `73629B908E38AF22E8601F6C83D8FEA69EA6DF675DD8D5BD35EE2C04459148E2`; release manifest 976 bytes, SHA-256 `C72862B522305104CC135C00FC31CC47881D8F9DCC6232B77CE027738D9D3B5F` |
| `exactNextAction` | after a zero-finding narrow rebind of this closure, stage and commit only the seven-path allowlist; treat that commit as `P` only if its sole parent is `S2` and the packaging-commit verifier passes, then perform remote preflight and present exact publication values for confirmation |
| `forbiddenUntil` | no Gate 4+ work; publication must use the exact qualified Preview 3 source, tag, assets, Pages target, and rollback artifact |

## Current product state

The last public state qualified by repository evidence before Preview 3
publication work was PhraseGarden `0.1.0-preview.2` at
<https://jkolantree.github.io/phrasegarden/>. Its immutable tag resolves to
package commit `6e55e8d142c748de181cd5136076d576d0994e19`. Current public status requires
fresh remote evidence rather than inference from this source document.

The local `release/next` branch adds the independently reviewed Gate 3
Interpreter at `c2e6104`, process controls at `e293426`, and progressive
Advanced settings at `e96f4b5`, and the independently reviewed Preview 3
source claims at `aa75e60`, returned archive checkpoint `83558bd`, and archive
repair at `70858f1`. Generic catalog checkpoint `db85ed4` adds five
identity-only profiles; beginner-journey checkpoint `3c2a606` clarifies their
presentation. Pages checkpoint `4d9002f` hardens deployment policy; validator
checkpoint `d6cb448` removes an asset-order assumption; mobile checkpoint
`7fb32c7` makes complete default choices visible at 320 px. The target
identity is `0.1.0-preview.3`. This checkpoint aligns its bounded public
claims and accessibility evidence. Source-manifest core checkpoint
`e421e0a3248d9d7c1730929697920f8b757b8792` and regression checkpoint
`06cc7cb032ec7798accb8757d10a21df75fcefdb` add complete-tree identity tooling
without creating evidence bytes. Package core
`cc61a60205c04bd34709acb0fa6b071802de0526` and regression checkpoint
`7a58f7cff087e49bce73ce827bff7ce8cbbbb11c` add deterministic same-byte staging/promotion with the
returned failures preserved. B3 claim alignment received independent exact-byte
semantic and security PASSes. Source `9bc73b96a48d2ca96f0b4460da860afe954a3eb8`
was locally frozen and qualified, but its derived seven-path package was
returned when final review found that two public timing claims would become
false at commit time. Those source/package bytes are regression evidence only
and cannot become `P`. The exact twelve-path repair replaces the timing claims
with version-bound evidence language and preserves the failure in a
deterministic release regression. This repair checkpoint itself establishes no
replacement source freeze, package, publication, or deployment; later status
must come from the version-bound evidence that owns that boundary.

Replacement source `58890218721c16e2226d42d6bc6ccd98622ae30c` is locally
frozen and qualified. Its one build is byte-identical to the returned build,
and its exact archive, manifest, and append-only ledger are promoted locally
after two independent source/package PASSes. The containing commit qualifies as
packaging commit `P` only under the exact review, sole-parent, seven-path, and
verifier conditions in the cursor above. This source row does not establish
publication or deployment.

Detailed proof is preserved outside this cursor:

- [Preview 1 release evidence](evidence/releases/0.1.0-preview.1.md)
- [Preview 2 release evidence](evidence/releases/0.1.0-preview.2.md)
- [Preview 3 local packaging evidence](evidence/releases/0.1.0-preview.3.md)
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
| Preview 3 same-byte packager | completed locally | `cc61a60205c04bd34709acb0fa6b071802de0526` core plus `7a58f7cff087e49bce73ce827bff7ce8cbbbb11c` regressions; 25/25 focused within 45/45 Python release tests, independent B1/B2 PASSes, and two B3 content PASSes |
| Preview 3 frozen source and package | returned | `S=9bc73b96a48d2ca96f0b4460da860afe954a3eb8`; archive `48C2A6CE0233C1BE66018E4C8A3915040DB5ADCBCFF3C40BA33B534F8E21DAFA`; final product/language review returned P2 on commit-unstable limitations wording, so no `P` was created |
| Preview 3 commit-stable claims | completed locally | checkpoint `58890218721c16e2226d42d6bc6ccd98622ae30c`; exact twelve paths, closed old→stable regression mapping, 312/312, dual typechecks, and two independent final PASSes |
| Preview 3 replacement source and package | packaging-commit boundary | `S2=58890218721c16e2226d42d6bc6ccd98622ae30c`; source manifest `73629B90…148E2`; one qualified byte-identical build; archive `48C2A6CE…DAFA`; release manifest `C72862B5…3B5F`; ledger `E65D2D74…EA2A`; source/package and repaired seven-content reviews PASS; final state-only rebind then `P` verifier |
| Gates 4–6 | skipped by order | no implementation begun |
| External linguistic review | deferred | Preview labels state the limitation |
| Model/prospective evaluation | skipped | no model calls and no prospective fixtures consumed |
| Remote release work | external evidence boundary | push, tag, release, Pages, and CI-write state must be established from version-bound public evidence; this source row makes no current-state claim |

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
evidence is reused only where its exact bytes remain bound. The returned source
manifest and release package were created only after tooling development closed
and remain local regression evidence; neither may be promoted. No model,
moderated-user, assistive-technology, remote, or public evaluation was added.

## Exact next eligible action

After a zero-finding narrow rebind of the final state-only closure, stage and
commit only the exact seven-path allowlist. Treat the containing commit as `P`
only if its sole parent is source
`58890218721c16e2226d42d6bc6ccd98622ae30c` and the packaging-commit verifier
passes. Then perform fresh remote preflight and present the exact publication
values for confirmation. Do not begin Gate 4 or claim stable release readiness.
