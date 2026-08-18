# Preview 3 mobile select clarity

Status: active failure-directed repair

## OBJECTIVE

Keep the complete default tone and detail choices visibly readable inside their
native selects at 320 px without changing configuration values, prompt bytes,
summaries, defaults, or compiler behavior.

## SOURCE OF TRUTH

- `docs/DESIGN-CONTRACT.md`
- `docs/PRODUCT.md`
- `src/locales/ui-en.ts`
- `tests/e2e/preview.spec.ts`
- Returned capture
  `artifacts/screenshots/builder-written-mobile-320-closed.png`, 159,779 bytes,
  SHA-256
  `1C296CD3D17069AD0DE2FB46CB00256C02A5DEBDB1DB9633C3BECEEE210FCAEC`
- Independent return: selected values `Keep the original tone and formality`
  and `Translation first, minimal notes` lose their endings at 320 px

## IN SCOPE

Exact owned paths:

- `docs/work-packages/PREVIEW-3-MOBILE-SELECT-CLARITY.md`
- `src/locales/ui-en.ts`
- `tests/app/ui-copy.test.ts`
- `tests/e2e/preview.spec.ts`

Use shorter plain-English display labels for the same two exact configuration
values. Keep the current 320 px closed-Advanced screenshot and page-overflow
assertion as the visual regression boundary.

## OUT OF SCOPE

- Configuration values, defaults, summaries, prompt rendering, compiler,
  profiles, pair packs, registry, support resolution, or provenance
- Custom select widgets, responsive layout redesign, font or spacing changes
- Public-claim documentation, source freeze, packaging, or publication

## ACCEPTANCE

- `MSC-01`: `preserve` and `concise` keep their exact values and meanings while
  their complete selected labels are visibly readable at 320 px.
- `MSC-02`: The replacement labels are plain English, unambiguous, and locked by
  a focused UI-copy regression.
- `MSC-03`: A fresh full-page screenshot from a 320×900 viewport shows both
  complete labels, Advanced settings closed, no page-boundary clipping or
  overlap, and the same Woven Conversation hierarchy.
- `MSC-04`: Prompt snapshots, summaries, defaults, support results, copy and
  download bytes, and runtime privacy behavior remain unchanged.
- `MSC-05`: Exact four-path scope, focused/full tests, both typechecks, one
  development build, release audit, 12 sequential Edge/axe journeys, diff
  check, and independent read-only review pass.

## VERIFICATION

1. Run `tests/app/ui-copy.test.ts`, then the full Vitest suite.
2. Run both TypeScript configurations.
3. Require zero forbidden-domain matches in `src/domain`.
4. Run one development build and the release audit.
5. Start from an empty screenshot directory and run the exact sequential Edge
   lane against that existing `dist`.
6. Re-run the audit and require exact pre/post output equality.
7. Inspect the fresh 320 px closed-Advanced screenshot directly and record its
   dimensions, length, SHA-256, and verdict.
8. Check exact owned paths, index, cache, net lines, and `git diff --check`.
9. Obtain an independent P1/P2/P3 review on exact bytes.

## STOP CONDITIONS

- A complete label still truncates in the fresh 320 px capture.
- The repair requires a custom control or changes configuration/prompt meaning.
- Any protected compiler, artifact, support, or release byte changes.
- A required check fails outside this exact package.
- The package approaches 500 net lines.

## HANDOFF

Report exact files and checkpoint identity; old and new labels; test counts;
fresh screenshot identity and visual verdict; protected behavior; independent
review; and the still-open claims/accessibility package. Then resume that
package without weakening its visual acceptance.
