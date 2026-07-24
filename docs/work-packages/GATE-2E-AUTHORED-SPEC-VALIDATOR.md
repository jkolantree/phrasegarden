# Gate 2E — Authored spec validator

Status: Completed  
Gate: 2 — Compiler Foundation  
Updated: 2026-07-23

## OBJECTIVE

Convert unknown JSON-like values into exact, fresh `SummaryItemSpec` and `LimitationSpec` records or canonically ordered validation issues, reusing the Gate 2D condition grammar and canonicalizing only the unordered summary-value map.

## SOURCE OF TRUTH

- `docs/ARCHITECTURE.md`, especially semantic summaries and composition step 9
- `docs/RECIPE-SCHEMA.md`, especially `SummaryItemSpec`, `LimitationSpec`, conditions, selected-spec rules, and validation stages
- `docs/EVALUATION.md`, especially summary agreement and limitation exactly-once invariants
- `docs/DECISIONS.md`, especially ADR-005, ADR-006, ADR-017, ADR-018, and ADR-019
- Gate 2D clause-condition behavior and regressions
- `src/domain/authored.ts`, `src/domain/primitives.ts`, `src/domain/results.ts`, and the safe input reader

## IN SCOPE

- Internal reuse of one condition-array reader with no accepted Gate 2D behavior change.
- Safe dynamic-record inspection for summary value maps; unsafe keys, symbols, accessors, and non-enumerable values fail closed.
- Pure `validateSummaryItemSpec(unknown)` and `validateLimitationSpec(unknown)` boundaries.
- Nonempty summary ID, limitation code, rendering key, and summary value names.
- Safe-integer orders, exact all-of conditions, and closed summary mapping values from `RenderValuePath | ConditionPath`.
- Fresh construction; authored condition order preserved; unordered summary value keys reconstructed in canonical JSON object order.
- Allowed files: `package.json`; `src/domain/validation-input.ts`, `clause-validation.ts`, `spec-validation.ts`, and `index.ts`; `tests/domain/clause-validation.test.ts` and `spec-validation.test.ts`; this contract, ADR-019, and `PROJECT-STATE.md`.

## OUT OF SCOPE

- Summary catalogs/messages, container or selected ID/order uniqueness, duplicate limitation codes, condition evaluation, selected rendering-key resolution, summary value-name/catalog matching, profile/pair/recipe/policy containers, artifact graph resolution, prompt rendering, budgets, snapshots, UI, or model evaluation.

## ACCEPTANCE

- Both spec roots use exact allowlists, reject missing/unknown/coerced fields, and produce fresh exact values.
- Dynamic value maps accept plain or null-prototype records, reject every non-JSON-like field shape, and do not invoke getters.
- Empty value maps are valid; present value names are nonempty and map only to closed condition/render-value paths.
- Equivalent value maps with different input insertion order produce byte-equivalent key order and identical results: canonical array-index names numerically first, then all other names in exact UTF-16 code-unit order.
- Order accepts only finite safe integers and is never inferred from container position.
- The exact Gate 2D condition grammar and authored condition order remain unchanged.
- No uniqueness, selection, catalog lookup, rendering, warning, summary text, or limitation text is produced.
- Existing 87 tests, issue ordering, typechecks, build, and domain-boundary scans remain green.

## VERIFICATION

From the workspace root:

```text
pnpm run test:spec
pnpm test
pnpm typecheck
pnpm build
rg -n "preact|window|document|localStorage|sessionStorage|fetch|XMLHttpRequest|WebSocket|navigator|location|Date\\.|new Date|Math\\.random|crypto\\.random|Intl|eval\\(|Function\\(" src/domain
```

Compare exact success objects for map-key canonicalization, condition-order preservation, optional/prototype detachment, and exact failures across repeated/reordered input.

## STOP CONDITIONS

- A rule requires a summary catalog, selected container, rendering surface, or artifact graph.
- Canonical map construction would alter array order or semantic values.
- Condition reuse changes an accepted Gate 2D issue, path, stage, or success value.
- The package would evaluate conditions, select specs, resolve renderings, or emit user-facing text.

## HANDOFF

Files changed:

- `package.json`
- `src/domain/validation-input.ts`
- `src/domain/clause-validation.ts`
- `src/domain/spec-validation.ts`
- `src/domain/index.ts`
- `tests/domain/spec-validation.test.ts`
- ADR-019, this package contract, and `PROJECT-STATE.md`

Implemented safe dynamic-record inspection, internal condition-array reuse, pure `validateSummaryItemSpec(unknown)`, and pure `validateLimitationSpec(unknown)`. Summary mapping values are limited to closed paths, reconstructed as a fresh semantic map, and canonically ordered without altering authored condition arrays.

Verification:

- Focused spec tests: 16/16 passed.
- Full tests: 103/103 passed.
- Application and DOM-free domain typechecks: passed.
- Vite production build: passed.
- Production domain scan: no Preact, DOM, storage, network, clock, randomness, locale, `eval`, or dynamic `Function` dependency.
- All 25 Gate 2D focused regressions remained green through the full suite.
- Independent read-only review: passed with no P1/P2 findings.

Current hashes:

- `spec-validation.ts`: `CF5BA34B0E5C18E601DB9F833FD1B4C9839312BA469FB1370FB2FFC2BCDF0976`
- `spec-validation.test.ts`: `78011BB5827C49D90F63D205A62EBE3019AA995C1FC20A6B0B52309CDB0E4595`
- `validation-input.ts`: `01020127A9A87CE4812A28C68A40E7E16600AB54DE8531FE9D37233DC060848D`
- `clause-validation.ts`: `569759E4DE088C64127E2D6335AE0F9C873225D5750CD2577F497F614E72D828`

Development failure:

- **Architecture contract:** exact code-unit ordering for every object key is not representable for canonical integer-like property names because JavaScript/JSON enumerate those keys numerically. Before implementation, ADR-019 and this contract were corrected to canonical JSON object order; the fixture with `"2"`, `"10"`, `"a"`, and `"b"` permanently proves insertion-independent bytes.

The package remained within the preferred work-package range and did not absorb catalogs, selection, profiles, reviews, pairs, recipes, policy, compiler, or UI.

Next eligible work: write a bounded `SummaryCatalog` validator contract. Authored catalog values remain blocked until that local surface passes.
