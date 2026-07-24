# Gate 2D — Authored clause validator

Status: Completed  
Gate: 2 — Compiler Foundation  
Updated: 2026-07-23

## OBJECTIVE

Convert an unknown JSON-like value into one exact, fresh `Clause` or canonically ordered validation issues, including the complete intrinsic grammar for typed all-of conditions and the fixed origin/authority matrix.

## SOURCE OF TRUTH

- `docs/ARCHITECTURE.md`, especially composition steps 4–6 and authority ownership
- `docs/RECIPE-SCHEMA.md`, especially `ClauseCondition`, `Clause`, condition semantics, validation stages, and origin/authority matrix
- `docs/EVALUATION.md`, especially duplicate semantic-rule and deterministic-order invariants
- `docs/DECISIONS.md`, especially ADR-002, ADR-005, ADR-006, ADR-017, and ADR-018
- `src/domain/authored.ts`, `src/domain/primitives.ts`, `src/domain/results.ts`, and the Gate 2C safe input reader

## IN SCOPE

- Pure `validateClause(unknown)` with exact record/array allowlists and fresh deep construction.
- `eq`, `in`, `present`, and `absent` condition discriminators; all closed condition paths; exact branch fields.
- Nonempty `eq` values; nonempty `in` arrays containing nonempty strings in strict unique UTF-16 code-unit order.
- Empty `whenAll` as an intentional always-match conjunction.
- Nonempty clause ID, rendering key, effect key/value, refinement key, and present refinement value.
- Closed origin, authority, section, safe-integer order, effect shape, optional refinement shape, and exact origin/authority matrix.
- Canonical issues and hostile nested record/array regressions inherited through the shared reader.
- Allowed files: `package.json`; `src/domain/clause-validation.ts` and `index.ts`; `tests/domain/clause-validation.test.ts`; this contract and `PROJECT-STATE.md`.

## OUT OF SCOPE

- Container ownership, catalog-global or resolved-graph ID scope, clause selection, selected `(section, order)` uniqueness, effect repetition/conflict, refinement-target existence/authority, condition evaluation, rendering-key resolution, summary/limitation specs, profiles, reviews, pairs, recipes, policy, compiler inputs, prompt rendering, budgets, snapshots, UI, or model evaluation.

## ACCEPTANCE

- Every closed condition path and legal operator shape succeeds; wrong discriminators, wrong branch fields, coercion, empty values, empty `in`, duplicates, or code-unit-unsorted `in` values fail deterministically.
- Conditions remain data: the validator performs no evaluation, locale comparison, substring matching, OR, negation, fallback, or dynamic code execution.
- Every legal authority pair across the four clause origins succeeds and every illegal pair fails at `authored-data`.
- Section accepts only integers 1–10; order accepts only finite safe integers and is not silently rounded, defaulted, or constrained by array position.
- `refines` may be absent or a dense array of exact records; present optional values are nonempty strings.
- A successful clause is deeply detached, preserves condition/refinement order, and omits absent optional fields.
- Existing 62 tests, issue ordering, and domain-boundary scans remain green.

## VERIFICATION

From the workspace root:

```text
pnpm run test:clause
pnpm test
pnpm typecheck
pnpm build
rg -n "preact|window|document|localStorage|sessionStorage|fetch|XMLHttpRequest|WebSocket|navigator|location|Date\\.|new Date|Math\\.random|crypto\\.random|Intl|eval\\(|Function\\(" src/domain
```

Inspect exact positive values for deep detachment and optional-field omission. Compare exact negative issue arrays across reordered object keys and repeated runs.

## STOP CONDITIONS

- A rule requires catalog/container ownership or selected-graph knowledge to decide.
- Condition validation would need to infer a value domain from a runtime configuration.
- Clause validation would perform condition evaluation, effect conflict resolution, refinement target resolution, rendering, or prompt construction.
- Existing accepted validator behavior changes unexpectedly or the package cannot remain structurally local.

## HANDOFF

Files changed:

- `package.json`
- `src/domain/clause-validation.ts`
- `src/domain/index.ts`
- `tests/domain/clause-validation.test.ts`
- this package contract and `PROJECT-STATE.md`

Implemented pure `validateClause(unknown)`. It reconstructs exact conditions, effects, refinements, and clause metadata; enforces every intrinsic condition grammar rule and every legal origin/authority pair; and deliberately performs no evaluation, selection, conflict/refinement resolution, container ownership, or rendering.

Verification:

- Focused clause tests: 25/25 passed.
- Full tests: 87/87 passed.
- Application and DOM-free domain typechecks: passed.
- Vite production build: passed.
- Production domain scan: no Preact, DOM, storage, network, clock, randomness, locale, `eval`, or dynamic `Function` dependency.
- Independent read-only review: passed with no P1/P2 findings.

Current hashes:

- `clause-validation.ts`: `515D00E71512A20744F7ADD677662CEDCC60F06FB3753FC673DE4D1126D2541A`
- `clause-validation.test.ts`: `2A4785D5E2DFC9A8E2FE2868C630C3A69E7C43314EFF6E110436F0300676EFE3`
- `index.ts`: `99A06DA4F93FDDFF3808B4E7EAE554AFB4481EDC5B98686C87E1A0156780F552`

Development failure:

- **Tests:** the first key-insertion-order fixture declared invalid keys before a spread that overwrote them, and strict TypeScript rejected the duplicate/mistyped construction. The fixture now builds the alternate insertion order explicitly, remains a permanent ordering regression, and no product behavior changed.

Limitation: production plus negative-test lines exceeded the preferred package guideline. The package still owns one coherent grammar boundary and did not absorb summary/limitation specs, container identity scope, selection, profiles, reviews, pairs, recipes, policy, compiler, or UI.

Next eligible work: write the spec-record validator contract for `SummaryItemSpec` and `LimitationSpec`. Authored catalog values remain blocked.
