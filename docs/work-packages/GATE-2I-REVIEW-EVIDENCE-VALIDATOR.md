# Gate 2I — Review-evidence semantics and validator

Status: Completed  
Gate: 2 — Compiler Foundation  
Updated: 2026-07-23

## OBJECTIVE

Define and implement the pure deterministic evidence contract needed by future profile-review and directed-pair claims, proving only closed metadata structure and exact internal bindings—never byte existence, reviewer qualification, review occurrence, linguistic truth, or support tier.

## SOURCE OF TRUTH

- The user's Gate 2I authorization dated 2026-07-23
- `docs/ARCHITECTURE.md`, especially artifact boundaries and language/tier resolution
- `docs/RECIPE-SCHEMA.md`, especially review evidence, validation order, and PairPack separation
- `docs/EVALUATION.md`, especially evidence claims, artifact bytes, and the invariant matrix
- `docs/DECISIONS.md`, especially ADR-002, ADR-012, ADR-017 through ADR-019, ADR-021, and ADR-022
- Gate 2B/H safe-input, language-identity, deterministic issue-order, and fresh-reconstruction behavior

## IN SCOPE

- Consolidated review schema: immutable evidence/artifact refs, exact profile/pair-pack candidates, published-suite refs, declared reviewer roles, bundle-local record refs, profile and direction bundles, Community/Reviewed/Flagship evidence variants, and deterministic suite-pass records.
- Pure `validateImmutableEvidenceRef(unknown)` and `validateReviewEvidenceBundle(unknown, registry)`.
- Canonical repository-relative paths; exact uppercase SHA-256; nonnegative safe byte lengths; optional stable evidence IDs.
- Real calendar `YYYY-MM-DD` validation without `Date`, `Intl`, locale, time zone, or current-time comparisons.
- Closed profile/direction scope and candidate variants; exact registry, candidate, scope, suite, checker, contribution, record-reference, outcome, and evidence binding.
- Bundle-local record IDs referenced through exact bundle id/version; duplicates, missing references, cross-bundle refs, and unreferenced records fail.
- Direction evidence classes:
  - Community: exact contribution and one or more referenced `community-reviewer` direction records.
  - Reviewed: one or more referenced `qualified-speaker` direction records.
  - Flagship: every Reviewed rule plus one deterministic suite pass for the same candidate/suite and an exact checker.
- Structural-only success assurance that explicitly withholds byte, human, linguistic, and tier claims.
- Remove review evidence from `PairDirection`; candidate PairPack and evidence bundle remain separate to avoid cyclic identity.
- Synthetic negative/unit fixtures labeled `development`.
- Allowed files: `package.json`; the Gate 0 contracts, project state, this package; `src/domain/authored.ts`, `index.ts`, new `review-evidence.ts` and `review-evidence-validation.ts`; existing primitive tests; new review fixtures/tests.

## OUT OF SCOPE

- Authored profiles or evidence, actual pair packs, byte-manifest/file qualification, reviewer governance, public qualification claims, tier assignment/resolution, recipes, compiler composition, sharing, UI, browser automation, model/scorer evaluation, prospective fixtures, deployment, or release.
- Filesystem reads, hash computation, URL fetches, clocks, expiry/freshness rules, or normalization inside `src/domain`.
- Determining whether a suite is genuinely published, a reviewer exists/is qualified, a review occurred, evidence is truthful, conclusions are correct, or referenced bytes exist.

## ACCEPTANCE

- Every record binds one exact scope, candidate artifact, suite definition, evidence ref, declared role, passing outcome, and calendar-valid date.
- Profile candidates are `language-profile`; direction candidates are `pair-pack`. Profile scope/candidate identity and every record/bundle binding match exactly.
- Evidence paths reject absolute/drive paths, backslashes, traversal, empty/dot segments, leading/trailing slash, query/fragment/control material, and noncanonical segment characters.
- Every discriminated variant has exact keys; unknown fields and unsafe records/arrays fail closed.
- SHA-256 is exactly 64 uppercase hex. Byte length is a safe integer from zero through `Number.MAX_SAFE_INTEGER`.
- Record IDs are nonempty, bundle-local, unique across the bundle, and referenced through the exact bundle id/version. Reference arrays are nonempty, unique, and code-unit sorted.
- Every direction record is referenced exactly once; missing, cross-bundle, duplicate, unreferenced, wrong-role, wrong-scope, wrong-candidate, wrong-suite, or non-pass data fails in stable issue order.
- Community cannot satisfy Reviewed. Reviewed cannot satisfy Flagship without a suite pass bound to the exact current candidate/suite/checker/evidence.
- Profile bundles expose no evidence class or support-tier field. No validator success assigns a support tier.
- A structurally valid bundle returns `evidenceBytes`, `externalArtifactExistence`, `evidenceTruthfulness`, `suitePublication`, `reviewerQualification`, `humanReviewOccurrence`, `linguisticCorrectness`, and `supportTier` as not qualified/assigned.
- Existing 152 tests remain green.

## VERIFICATION

```text
pnpm run test:review-evidence
pnpm test
node_modules\.bin\tsc.CMD -p tsconfig.json --noEmit
node_modules\.bin\tsc.CMD -p tsconfig.domain.json --noEmit
pnpm build
rg -n "preact|window|document|localStorage|sessionStorage|fetch|XMLHttpRequest|WebSocket|navigator|location|Date\\.|new Date|Date\\(|Math\\.random|crypto\\.random|Intl|toLocale|eval\\(|Function\\(" src/domain
```

Inspect exact failures for path mutation/traversal, hash/length, suite/candidate mismatch, reversal, scope confusion, duplicate/cross-bundle/missing/unreferenced IDs, wrong role, promotion attempts, stale-candidate suite pass, invalid dates, extras, and valid-but-unqualified metadata.

## STOP CONDITIONS

- Role truth or reviewer competence would require a governance decision.
- Byte qualification would require domain filesystem/build access.
- Candidate identity cannot be resolved as exact kind/id/version/content hash.
- Published suite identity cannot bind immutable definition bytes.
- A schema cycle would place bundle identity inside the candidate it hashes.
- Any rule would claim code verified a human act, external byte existence, linguistic truth, or support tier.

## HANDOFF

| Item | State | Evidence |
|---|---|---|
| Contract and consolidated schema correction | Completed | ADR-022; `docs/RECIPE-SCHEMA.md`; inline pair review fields removed |
| Pure structural validator | Completed | `src/domain/review-evidence.ts`; `src/domain/review-evidence-validation.ts` |
| Focused validation | Completed | 96/96 tests passed |
| Full regression validation | Completed | 248/248 tests passed; the existing 152 remain green |
| Type and build validation | Completed | both TypeScript configurations and Vite production build passed |
| Forbidden-domain validation | Completed | zero `src/domain` matches for browser, network, storage, clock, randomness, ambient `Intl`, or dynamic-code patterns |
| Independent current-byte review | Completed | PASS; no P1/P2 findings; reviewer repeated the 96 focused tests |
| Failed checks | Failed: none | No focused, regression, type, build, scan, or review failure remains |
| Gate 2I blockers | Blocked: none | Candidate and suite identities were resolved without a second identity or hash cycle |
| Product/prompt behavior | Unchanged | No recipes, compiler composition, generated prompt, sharing, or UI changed |
| Synthetic evidence fixtures | Development-only | `tests/fixtures/review-evidence.ts` explicitly disclaims byte qualification and human review |
| Later pair/tier/evaluation work | Skipped | Outside authorization; no pair pack, resolver, tier assignment, model/prospective evaluation, deployment, or release work began |

Deterministic guarantees are limited to safe closed input, canonical reference shape, real calendar dates, stable issue order, fresh reconstruction, and exact internal registry/scope/candidate/suite/role/reference bindings.

Build-time/file qualification still must establish that referenced bytes exist and match each path/hash/length tuple. Human governance still must establish suite publication, evidence truthfulness, reviewer identity/qualification, review occurrence, and linguistic conclusions. A separately authorized later resolver must combine a byte- and governance-qualified exact direction with its candidate and derive one support tier; this package assigns none.

Gate 2I stops here. No pair-pack or tier-resolution package is authorized.
