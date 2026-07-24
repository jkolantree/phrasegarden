# Preview 3 source claims and accessibility coverage

## Objective

Identify the next public candidate as `0.1.0-preview.3`, describe its limits
honestly, and close the missing Advanced-open/Voice automated accessibility
coverage without changing compiler or prompt behavior.

## Source and owned paths

Source: ADR-028, `PREVIEW-3-PUBLICATION.md`, checkpoints `c2e6104` and
`e96f4b5`, and the Preview 2 public evidence.

```text
README.md
docs/ACCESSIBILITY.md
docs/DECISIONS.md
docs/LIMITATIONS.md
docs/PRODUCT.md
docs/PROJECT-STATE.md
docs/PUBLICATION-MANIFEST.md
docs/RELEASE-NOTES.md
docs/TRACEABILITY.md
docs/work-packages/PREVIEW-3-PUBLICATION.md
docs/work-packages/PREVIEW-3-SOURCE-CLAIMS.md
package.json
tests/e2e/preview.spec.ts
```

## Acceptance

- Package/public identity alone advances to `0.1.0-preview.3`; compiler,
  recipe, profile, pair-pack, prompt-surface, summary, and sample versions do
  not change.
- Written and Voice Advanced-open states and Voice Review pass axe; Voice-open
  at 320 px has no page overflow.
- Public-facing text says prerelease, preserves Preview/Generic and linguistic
  limitations, and makes no Gate 3 exit, stable, WCAG, or broad compatibility
  claim.
- Product/domain/source/release artifacts and all Gate 4+ paths remain
  unchanged.

## Verification and stop

Run focused browser/axe, full Vitest, dual typechecks, protected-path and stale
claim scans, screenshots, diff hygiene, and independent read-only review.
Stop on any prompt/domain/version drift, unsupported claim, accessibility
failure, unexpected path, or package growth above 700 net lines.

## Handoff

Commit only the exact owned paths. The next package is
`PREVIEW-3-SAME-BYTE-PIPELINE`; no release build or remote action occurs here.
