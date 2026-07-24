# Gate 2C — Prompt-surface validator

Status: Completed  
Gate: 2 — Compiler Foundation  
Updated: 2026-07-23

## OBJECTIVE

Convert an unknown JSON-like value into one exact, fresh `PromptSurface` or canonically ordered validation issues, while extracting the already-proven record inspection boundary into reusable domain infrastructure with no change to configuration-validator behavior.

## SOURCE OF TRUTH

- `docs/ARCHITECTURE.md`, especially composition steps 1, 7, and 10
- `docs/RECIPE-SCHEMA.md`, especially identities, `RenderPart`, `PromptSurface`, typed rendering, and validation stages
- `docs/EVALUATION.md`, especially placeholder-like literal and stable-order invariants
- `docs/DECISIONS.md`, especially ADR-001, ADR-002, ADR-017, and ADR-018
- Gate 2B validator behavior and regressions
- `src/domain/authored.ts`, `src/domain/results.ts`, and `src/domain/primitives.ts`

## IN SCOPE

- Internal fail-closed inspection for plain records and dense JSON-like arrays using own data-property descriptors.
- Refactor Gate 2B to consume the shared record reader without changing its public result bytes or issue ordering.
- Pure `validatePromptSurface(unknown)` with exact root, rendering, and render-part allowlists.
- Required nonempty prompt-surface identity, locale, version, and rendering keys.
- Literal parts preserved byte-for-byte, including placeholder-like text.
- Exact discriminated value parts using closed render-value paths and formats.
- Duplicate rendering-key rejection, stable array order, fresh deep construction, canonical issues, and focused negative fixtures.
- Allowed files: `package.json`; `src/domain/validation-input.ts`, `configuration-validation.ts`, `prompt-surface-validation.ts`, and `index.ts`; `tests/domain/configuration-validation.test.ts` and `prompt-surface-validation.test.ts`; this contract, ADR-018, and `PROJECT-STATE.md`.

## OUT OF SCOPE

- Language profiles, canonical BCP 47 qualification, clauses or conditions, review records or bases, pair packs, modality recipes, compiler policy, summary catalogs, cross-artifact reference matching, rendering selection, canonical prompt generation, snapshots, UI, persistence, network, or model evaluation.

## ACCEPTANCE

- Null, primitive, array-as-record, record-as-array, unsafe prototype/key, symbol, accessor, non-enumerable known field, unknown field, throwing/revoked proxy, sparse array, and extra array-property inputs fail closed without invoking getters.
- Existing configuration fixtures and exact issue ordering remain unchanged.
- A successful prompt surface is a fresh exact object and retains rendering and part order.
- IDs, locale, version, and rendering keys are nonempty; duplicate rendering keys fail at `authored-data`.
- Literal `{{placeholder-like}}`, fenced, Japanese, bidi, combining-mark, astral, CRLF, and empty text remain literal data with no parsing, normalization, trimming, interpolation, or implicit whitespace.
- Value parts accept only the closed `RenderValuePath` and `RenderValueFormat` sets.
- Results do not depend on key insertion order, locale, clock, randomness, exception text, Preact, DOM, browser state, or network access.

## VERIFICATION

From the workspace root:

```text
pnpm run test:prompt-surface
pnpm test
pnpm typecheck
pnpm build
rg -n "preact|window|document|localStorage|sessionStorage|fetch|XMLHttpRequest|WebSocket|navigator|location|Date\\.|new Date|Math\\.random|crypto\\.random|Intl" src/domain
```

Compare the pre-refactor Gate 2B canonical issue fixture and all 36 existing tests. Inspect prompt-surface success values for deep input detachment and exact literal equality.

## STOP CONDITIONS

- Reuse would change any accepted Gate 2B issue, stage, path, or success shape.
- Supporting a non-JSON object/array form would require a product or import-format decision.
- Locale canonicalization, cross-artifact identity, clause validation, rendering, or compiler behavior would enter this package.
- A baseline test fails for a reason that cannot be isolated without expanding scope.

## HANDOFF

Files changed:

- `package.json`
- `src/domain/validation-input.ts`
- `src/domain/configuration-validation.ts`
- `src/domain/prompt-surface-validation.ts`
- `src/domain/index.ts`
- `tests/domain/prompt-surface-validation.test.ts`
- ADR-018, this package contract, and `PROJECT-STATE.md`

Implemented a shared descriptor-only reader for safe records and exact dense arrays, refactored configuration validation onto the record reader, and added pure `validatePromptSurface(unknown)`. Successful surfaces are reconstructed through exact allowlists; literal text is copied unchanged; value parts use closed paths/formats; duplicate rendering keys fail at every later occurrence.

Verification:

- Focused prompt-surface tests: 26/26 passed.
- Full tests: 62/62 passed.
- Application and DOM-free domain typechecks: passed.
- Vite production build: passed.
- Production domain scan: no Preact, DOM, storage, network, clock, randomness, navigator, location, or locale dependency.
- Existing Gate 2B fixtures and canonical issue tests remained green.
- Independent read-only review: passed with no P1/P2 findings.

Current hashes:

- `validation-input.ts`: `38038B7BAC3DF74B5FA8CDF4108EC218C07D077DF56AC0DE712D54DB6DA14559`
- `configuration-validation.ts`: `AED1AC636DD2F1E1CC7D3019A841ADBF276C8318839EB2086577F1D77C73B650`
- `prompt-surface-validation.ts`: `9E7D6157D5C27C7B856F524CDF89EAC78F3CD12254323602CAF9EEDE5143081A`
- `prompt-surface-validation.test.ts`: `5D96B7202F96920F633137FAF4D97F5F1C239D5B3DE80FC5DE5C8898A306251E`

Development failures preserved and classified:

- **Tests:** the first throwing-descriptor fixture used an empty Proxy, so its descriptor trap could not run. The exact fixture now has one own field and permanently exercises that trap.
- **Validator:** self-audit found that multiple symbol keys could produce repeated path-identical issues. Records and arrays now emit one stable symbol issue per container; two-symbol regressions preserve the correction.
- **Evidence transport:** the bundled fallback runner could not execute `pnpm exec vitest` directly. A focused package script now provides the exact reproducible command; this did not affect product code.

Limitation: this package exceeded the preferred net-line guideline because the fail-closed record/array matrix and its hostile-Proxy tests are one security boundary. It did not absorb clause, profile, review, pair, recipe, policy, compiler, or UI behavior.

Next eligible work: write a bounded validator contract for authored conditions and rule/spec records. English/Japanese authored data remains blocked until its complete validator chain passes.
