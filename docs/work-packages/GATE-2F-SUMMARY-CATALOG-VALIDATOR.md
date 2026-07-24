# Gate 2F — Summary-catalog validator

Status: Completed  
Gate: 2 — Compiler Foundation  
Updated: 2026-07-23

## OBJECTIVE

Convert an unknown JSON-like value into one exact, fresh `SummaryCatalog` or canonically ordered validation issues, preserving authored message/part order and literal text without performing summary resolution.

## SOURCE OF TRUTH

- `docs/ARCHITECTURE.md`, especially semantic summary rendering and exact locale catalogs
- `docs/RECIPE-SCHEMA.md`, especially `SummaryCatalog`, typed parts, no locale fallback, and validation stages
- `docs/EVALUATION.md`, especially summary agreement and missing-locale-message failure
- `docs/DECISIONS.md`, especially ADR-002, ADR-017, ADR-018, and ADR-019
- Gate 2C prompt-surface literal/variant behavior and Gate 2E summary-spec boundaries
- `src/domain/authored.ts`, `src/domain/results.ts`, `src/domain/primitives.ts`, and the safe input reader

## IN SCOPE

- Pure `validateSummaryCatalog(unknown)` with exact catalog, message, and message-part allowlists.
- Required nonempty locale, immutable version, message IDs, and value-part names.
- Literal parts copied byte-for-byte, including empty and placeholder-looking text.
- Exact `literal`/`value` discriminators and branch fields.
- Local duplicate message-ID rejection at every later occurrence.
- Fresh deep construction; authored message/part order preserved; canonical issues.
- Allowed files: `package.json`; `src/domain/summary-catalog-validation.ts` and `index.ts`; `tests/domain/summary-catalog-validation.test.ts`; this contract and `PROJECT-STATE.md`.

## OUT OF SCOPE

- Summary-item selection, condition evaluation, locale selection/fallback, catalog/spec message coverage, value-name equality, value substitution, text joining, presentation provenance, profiles, reviews, pairs, recipes, policy, compiler, prompt rendering, snapshots, UI, or model evaluation.

## ACCEPTANCE

- Wrong/unsafe root, messages array, message record, parts array, and part record shapes fail closed without getter reads.
- Locale/version/message ID/value name are nonempty strings; literal text may be empty and is never trimmed, parsed, normalized, interpolated, or given implicit whitespace.
- Known cross-variant fields and truly unknown fields produce one issue each.
- Duplicate message IDs fail locally; repeated value-part names within one message remain valid authored repetition.
- Empty message and part arrays are structurally valid; coverage/completeness remains a later exact catalog/spec check.
- Successful values are deeply detached and preserve every authored array order.
- Existing 103 tests, typechecks, build, issue ordering, and domain-boundary scans remain green.

## VERIFICATION

From the workspace root:

```text
pnpm run test:summary-catalog
pnpm test
pnpm typecheck
pnpm build
rg -n "preact|window|document|localStorage|sessionStorage|fetch|XMLHttpRequest|WebSocket|navigator|location|Date\\.|new Date|Math\\.random|crypto\\.random|Intl|eval\\(|Function\\(" src/domain
```

Inspect exact literal equality, duplicate paths, deep detachment, empty-array acceptance, and issue equality across reordered record keys.

## STOP CONDITIONS

- A rule requires selected `SummaryItemSpec` values, interface locale choice, or another artifact.
- Validation would add locale fallback, resolve names, substitute values, join text, or create presentation provenance.
- Empty catalog/message policy requires a release-completeness decision rather than structural validation.
- Existing accepted prompt-surface or spec behavior changes unexpectedly.

## HANDOFF

Files changed:

- `package.json`
- `src/domain/summary-catalog-validation.ts`
- `src/domain/index.ts`
- `tests/domain/summary-catalog-validation.test.ts`
- this package contract and `PROJECT-STATE.md`

Implemented pure `validateSummaryCatalog(unknown)` with exact catalog/message/part shapes, local duplicate message detection, byte-preserved literals, repeatable value names, and fresh order-preserving reconstruction. It performs no message selection, locale fallback, name matching, substitution, text joining, or presentation-provenance work.

Verification:

- Focused summary-catalog tests: 14/14 passed.
- Full tests: 117/117 passed.
- Application and DOM-free domain typechecks: passed.
- Vite production build: passed.
- Production domain scan: no Preact, DOM, storage, network, clock, randomness, locale, `eval`, or dynamic `Function` dependency.
- Independent read-only review: passed with no P1/P2 findings. The reviewer could not launch the focused command because its shell lacked bundled Node on `PATH`; the lead's exact focused and full runs provide execution evidence.

Current hashes:

- `summary-catalog-validation.ts`: `B735AA83C9F488EEF0DBFFC5FF62A8A62D96FCCE41589623E7D5A82287245B48`
- `summary-catalog-validation.test.ts`: `E2C5AA0EF70104A8423C0BD163238BF2BAB979837D382C0FE43741FB9E887A71`
- `index.ts`: `935FE90F8BFFD63438B1B740FA684AD386B4D287A4CEC886422E1D87F2AF0656`

No product or test failure occurred. One review-side command was environment-blocked as described above; no evidence claim relies on that blocked command.

The package remained within the preferred work-package range and did not absorb coverage checks, selection, profiles, review evidence, pairs, recipes, policy, compiler, or UI.

Next eligible work: write a bounded `CompilerPolicy` validator contract. Authored catalog values remain blocked.
