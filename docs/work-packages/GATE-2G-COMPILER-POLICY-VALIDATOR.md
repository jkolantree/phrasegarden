# Gate 2G — Compiler-policy validator

Status: Completed  
Gate: 2 — Compiler Foundation  
Updated: 2026-07-23

## OBJECTIVE

Convert an unknown JSON-like value into one exact, fresh `CompilerPolicy` or canonically ordered validation issues, enforcing its local artifact identity, child schemas, invariant-clause ownership, and container-local identities without selecting rules.

## SOURCE OF TRUTH

- `docs/ARCHITECTURE.md`, especially invariant authority, exact artifacts, and composition steps 1 and 5
- `docs/RECIPE-SCHEMA.md`, especially `CompilerPolicy`, clause/spec schemas, validation stages, and ownership matrix
- `docs/EVALUATION.md`, especially invariant construction and duplicate semantic-rule checks
- `docs/DECISIONS.md`, especially ADR-001, ADR-005, ADR-006, ADR-017, and ADR-018
- Gate 2D/E child-validator behavior and regressions
- `src/domain/authored.ts`, `src/domain/results.ts`, `src/domain/primitives.ts`, and the safe input reader

## IN SCOPE

- Pure `validateCompilerPolicy(unknown)` with an exact root and dense child arrays.
- Nonempty immutable policy version and compatible compiler version.
- Reuse of exact `Clause`, `SummaryItemSpec`, and `LimitationSpec` validators with deterministic nested issue paths.
- Every valid policy clause must be invariant-owned (`origin: invariant`, therefore `authority: invariant`).
- Container-local duplicate clause IDs, summary IDs, and limitation codes rejected at every later valid occurrence.
- Empty child arrays structurally valid; array order preserved; fresh deep construction; canonical issues.
- Allowed files: `package.json`; `src/domain/nested-validation.ts`, `compiler-policy-validation.ts`, and `index.ts`; `tests/domain/compiler-policy-validation.test.ts`; this contract and `PROJECT-STATE.md`.

## OUT OF SCOPE

- Compiler/policy compatibility resolution, catalog-global or resolved-graph ID scope, selected order/effect/refinement conflicts, condition evaluation, rendering-key resolution, limitation exactly-once rendering, profiles, review evidence, pairs, recipes, compiler inputs/output, prompt budgets, snapshots, UI, or model evaluation.

## ACCEPTANCE

- Wrong/unsafe root or child-array shapes fail closed; child issue stages/codes/paths are preserved under exact array-index prefixes.
- Valid children retain every Gate 2D/E invariant; no validator rule is copied as weaker policy-specific prose.
- Policy versions are nonempty strings and are not coerced, parsed as semver, upgraded, or compared in this package.
- Recipe/profile/pair-pack clauses are rejected as wrong policy ownership even when intrinsically valid.
- Duplicate local identities fail at each later valid occurrence; invalid children already fail and are never retained.
- Empty arrays are valid structure; release completeness and selected behavior are later checks.
- Successful policies are deeply detached and preserve child-array/child-internal order.
- Existing 117 tests, typechecks, build, issue ordering, and domain-boundary scans remain green.

## VERIFICATION

From the workspace root:

```text
pnpm run test:compiler-policy
pnpm test
pnpm typecheck
pnpm build
rg -n "preact|window|document|localStorage|sessionStorage|fetch|XMLHttpRequest|WebSocket|navigator|location|Date\\.|new Date|Math\\.random|crypto\\.random|Intl|eval\\(|Function\\(" src/domain
```

Inspect nested issue rebasing, every duplicate later path, ownership errors, empty-array success, deep detachment, and insertion-independent issues.

## STOP CONDITIONS

- A rule requires the selected compiler version, recipe, language profiles, pair pack, prompt surface, or artifact catalog.
- Local validation would decide a global ID scope or selected-rule conflict.
- Child reuse changes an accepted Gate 2D/E issue, path, stage, or success value.
- The package would evaluate conditions, select clauses/specs, resolve renderings, or generate prompt/summary text.

## HANDOFF

Files changed:

- `package.json`
- `src/domain/nested-validation.ts`
- `src/domain/compiler-policy-validation.ts`
- `src/domain/index.ts`
- `tests/domain/compiler-policy-validation.test.ts`
- this package contract and `PROJECT-STATE.md`

Implemented pure `validateCompilerPolicy(unknown)` and one internal nested-validation collector. Child validators remain authoritative; their issue fields are preserved while paths are rebased under policy array indexes. The container enforces invariant ownership and local duplicate IDs/codes, retains only fully valid children, and does no compatibility or selection work.

Verification:

- Focused compiler-policy tests: 11/11 passed.
- Full tests: 128/128 passed.
- Application and DOM-free domain typechecks: passed.
- Vite production build: passed.
- Production domain scan: no Preact, DOM, storage, network, clock, randomness, locale, `eval`, or dynamic `Function` dependency.
- All Gate 2D/E child regressions remained green through the full suite.
- Independent read-only review: passed with no P1/P2 findings. Its execution attempt was environment-blocked by missing bundled Node on `PATH`; the lead's focused/full runs provide execution evidence.

Current hashes:

- `nested-validation.ts`: `078336B54D6A201AB94C2E2CFE3E46B40226053460898C6D19957A8DE49FFE2F`
- `compiler-policy-validation.ts`: `A379780EAFCF81815E95A7E546421B20EFAFCD449A506692A550E7D8E602330C`
- `compiler-policy-validation.test.ts`: `54BD5C172BF64158CB891CC1389D14C685FDCCC53FC7A16D600FFA9B96F21AF6`
- `index.ts`: `987CBC762AE835DBA792DF2EBE345B6041038BAD92178C603B04E55EDC6F112C`

Development failure:

- **Validator diagnostics:** self-audit found the generic duplicate helper labeled limitation identity metadata as `id`. It now emits the actual field name (`code` for limitations, `id` otherwise), with an exact regression for `{ code, firstIndex }`.

The package remained within the preferred work-package range and did not absorb compatibility resolution, global identity, selection, profiles, reviews, pairs, recipes, compiler output, or UI.

Next known blocker: `LanguageProfile` validation needs the material language-identity decision recorded in `PROJECT-STATE.md`. No authored policy/profile values may be added before that decision.
