# Gate 2B — Recipe configuration validator

Status: Completed  
Gate: 2 — Compiler Foundation  
Updated: 2026-07-23

## OBJECTIVE

Implement one pure fail-closed boundary that converts an unknown JSON-like value into an exact, freshly constructed `RecipeConfiguration` or deterministically ordered validation issues.

## SOURCE OF TRUTH

- `docs/RECIPE-SCHEMA.md`, especially Recipe Configuration, Validation, and ADR-017's stage table
- `docs/ARCHITECTURE.md`
- `docs/EVALUATION.md`
- `docs/DECISIONS.md`, especially ADR-001, ADR-002, ADR-005, ADR-006, and ADR-017
- Gate 2A domain types and primitives

## IN SCOPE

- Plain-record and safe-key checks with exact allowlists at every configuration level.
- Required fields, primitive types, schema version, nonempty immutable references, all closed configuration enums, register shape, capability shape, and modality/settings discrimination.
- Rejection of identical home/target IDs and caller-supplied tier, pair-pack, review, or unknown claims through the root allowlist.
- Fresh canonical object construction with no retained unknown properties or input mutation.
- Deterministic issues using the fixed stage → code → path ordering.
- Unit tests for valid Written, Voice, and Interpreter configurations plus negative fixtures for every rule family.

## OUT OF SCOPE

- Catalog lookup, active-version materialization, profile BCP 47 qualification, artifact identity/version matching, prompt surfaces, authored clauses, review bases, pair resolution, migrations, imported-record size limits, compilation, prompts, summaries, snapshots, or UI.

## ACCEPTANCE

- Unknown, missing, inherited, accessor-bearing, array, null, unsafe-key, and wrong-primitive inputs fail closed without invoking getters.
- No validation result depends on key insertion order, locale, clock, randomness, or exception text.
- Every successful value is a fresh exact object whose modality matches its recipe ID.
- `register: preserve` rejects `level`; `adapt` requires one valid level.
- V1 rejects any code-switching or datum strategy outside the sole allowed values.
- Errors are complete enough to repair independent sibling fields in one pass and remain canonically sorted.

## VERIFICATION

```text
pnpm test -- tests/domain/configuration-validation.test.ts
pnpm test
pnpm typecheck
pnpm build
rg -n "preact|window|document|localStorage|fetch|XMLHttpRequest|WebSocket|Date\\(|Math\\.random|crypto\\.random|Intl\\." src/domain
```

## STOP CONDITIONS

- Exact raw-object behavior requires a user-facing product or privacy decision.
- Full BCP 47 or artifact qualification would leak into this configuration-only package.
- A validator would coerce, infer, default, migrate, retain unknown data, invoke getters, or depend on runtime locale.
- An unexpected baseline failure cannot be isolated without expanding scope.

## HANDOFF

Files changed:

- `src/domain/configuration-validation.ts`
- `src/domain/index.ts`
- `tests/fixtures/configurations.ts`
- `tests/domain/configuration-validation.test.ts`

Implemented one pure `validateRecipeConfiguration(unknown)` boundary. It inspects own data-property descriptors without invoking getters; rejects arrays, unsafe prototypes and keys, symbols, accessors, non-enumerable known fields, unknown fields, missing fields, invalid primitives/enums, unpinned versions, invalid register shapes, identical language IDs, and recipe/modality conflicts; and returns a freshly constructed exact configuration only when no issue exists.

Verification:

- Tests: 36/36 passed.
- Application and DOM-free domain typechecks: passed.
- Vite production build: passed.
- Domain scan: no Preact, DOM, storage, network, clock, randomness, navigator, location, or locale dependency in production domain code.
- Regression evidence includes throwing and revoked proxies, getter avoidance, insertion-order independence, unknown-key exact-once behavior, sibling issue collection, non-mutation, fresh output, all three modalities, and fixed stage ordering.
- Independent read-only review: passed after two findings were repaired. The repaired failures remain permanent regressions.

Gate 2B closure hashes:

- `configuration-validation.ts`: `B881CE6E58A96C334110FE33D0CF5B4EF0F155298807831B2B10BC975E3AB98B`
- `configurations.ts`: `F9B3BB87C60A055FD9ABC5E425F17FBFCF80D7346A1C4B4D8618CBE7B9EDBAD0`
- `configuration-validation.test.ts`: `BC485995BC8D2E2EF6E3C293E4BF82509F52448A3A5D35EF372AC8467F1187C2`

Known limitation: this package exceeded the preferred net-line guideline because fail-closed descriptor inspection, every nested configuration allowlist, three modality discriminators, and the negative regression matrix form one security boundary. Catalog qualification, BCP 47 checks, migrations, authored artifacts, pair resolution, and compilation remain deliberately absent.

Next eligible work: write a bounded authored-artifact validator package contract. Do not add authored catalog values or compiler behavior until their validators pass.
