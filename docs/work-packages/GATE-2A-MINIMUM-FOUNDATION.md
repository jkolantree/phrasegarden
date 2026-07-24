# Gate 2A — Minimum foundation

Status: Completed  
Gate: 2 — Compiler Foundation  
Updated: 2026-07-23

## OBJECTIVE

Create a reproducible minimum TypeScript/Vite/Preact/Vitest environment and the browser-free domain type/primitive foundation required by later validation and compilation packages.

## SOURCE OF TRUTH

- `docs/ARCHITECTURE.md`
- `docs/RECIPE-SCHEMA.md`
- `docs/EVALUATION.md`
- `docs/DECISIONS.md`, especially ADR-001 through ADR-006 and ADR-011
- `docs/DESIGN-CONTRACT.md` only for the rule that no complete UI is built in Gate 2

## IN SCOPE

- Minimum package manifest, lockfile, TypeScript configuration, Vite configuration, and Vitest configuration.
- A minimal static shell proving the application environment builds; it contains no product journey.
- `src/domain` types for configurations, artifacts, clauses, render parts, summaries, warnings, limitations, validation results, compiler results, provenance, reviews, and evaluation coverage.
- Pure helpers for canonical comparison, typed condition evaluation, deterministic ordering, and UTF-8 byte measurement.
- Unit tests for the foundation's closed enums, conditions, ordering, and byte counts.

## OUT OF SCOPE

- Full configuration/artifact validation, language profiles, pair packs, prompt surfaces, recipes, compiler policy data, prompt compilation, snapshots, complete UI, persistence, sharing, service worker, Playwright, axe, deployment, model calls, and model evaluation.

## ACCEPTANCE

- `src/domain` imports no Preact, DOM, storage, network, clock, randomness, or browser global.
- Every Gate 0 closed enum and discriminated recipe configuration is representable.
- Conditions implement exact all-of semantics with no coercion, fallback, implicit OR, or dynamic evaluation.
- UTF-8 prompt-budget helpers count bytes rather than JavaScript code units.
- Stable comparison helpers can order future issues, clauses, summaries, warnings, and limitations without locale- or engine-dependent behavior.
- The minimal shell builds without presenting later-gate functionality.

## VERIFICATION

From the workspace root:

```text
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
rg -n "preact|window|document|localStorage|fetch|XMLHttpRequest|WebSocket|Date\\(|Math\\.random|crypto\\.random" src/domain
```

Compare test output to the acceptance list and inspect `dist` only as disposable build evidence. Generated dependency/build directories are never hand-edited.

## STOP CONDITIONS

- Package resolution cannot be completed reproducibly.
- Gate 0 schemas contradict executable TypeScript without a product decision.
- A dependency would replace a smaller deterministic implementation or enter the domain layer.
- Existing user work appears unexpectedly or the package would require later-gate behavior.

## HANDOFF

Files changed: minimum package/config/static shell; `src/domain` configuration, authored-data, result, evaluation, and primitive modules; one foundation test module; lockfile and ignore rules.

Resolved versions: Preact 10.29.7; TypeScript 7.0.2; Vite 8.1.5; Vitest 4.1.10; Preact preset 2.10.6; Babel core 7.29.7; Node types 24.13.3. Lockfile SHA-256: `1AAA373ED5DF03729C487AB12D4897FD8E8EA962D77C9ACBE17B9445EC9FE1E9`.

Verification:

- Frozen install: passed.
- Tests: 12/12 passed.
- Application and DOM-free domain typechecks: passed.
- Vite production build: passed; no source map emitted.
- Domain ambient/import scan: no Preact, DOM, storage, network, clock, randomness, navigator, or location reference.
- npm advisory audit: no known vulnerabilities.
- Independent review: two rounds of P2 coverage findings repaired; final review passed.

The first test invocation failed because the bundled `pnpm` child process could not find bundled Node on `PATH`; rerunning with the explicit bundled Node directory passed. This was execution-environment setup, not a product test failure.

Limitation: the package exceeded the preferred net-line guideline because it transcribed the full closed Gate 0 type surface and exact enum/path regression sets. Validation and compiler logic remained split into later packages rather than expanding this one further.

Next eligible package: Gate 2B — Recipe Configuration Validator.
