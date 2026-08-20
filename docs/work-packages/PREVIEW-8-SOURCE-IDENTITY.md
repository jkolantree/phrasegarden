# Preview 8 release-source identity

Status: source contract; no package or public authority
Version target: `0.1.0-preview.8`
Updated: 2026-08-20

## Objective

Give the bilingual product checkpoint one closed Preview 8 release identity
and a no-build Pages selector, while preserving compiler, prompt, pair-pack,
tier, privacy, dependency, checked-in Preview 1–7 artifacts and checksum rows,
closed release specifications, and existing Git history.

## Source of truth

- Product parent: `f0583569aa2441fb6d34d4c40a6e3e0e0233d363`, tree
  `ba5d9d1799da39a2915a47a5d2559a64df850226`
- Preview 7 ledger: 2,188 bytes, SHA-256
  `FE11EEA9DC696BC04FA63E7D9E56D95077EAAFBFB3B881C83EAB8EC029DA241A`
- Preview 7 ZIP: 187,305 bytes, SHA-256
  `715ED188561505D1531FA903EC85EE742A34AE0A6646C9E61190D0D79FFD9513`
- Preview 7 manifest: 976 bytes, SHA-256
  `87296B9F800D3821437F9C15EB461522D5D790CB07EF5EA540E60C896F2E46BA`

## Exact source allowlist

The source checkpoint changes exactly these 31 paths relative to the product
parent:

```text
.github/workflows/pages.yml
CONTRIBUTING.md
README.md
docs/ACCESSIBILITY.md
docs/ARCHITECTURE.md
docs/DECISIONS.md
docs/DESIGN-CONTRACT.md
docs/LIMITATIONS.md
docs/PRIVACY.md
docs/PRODUCT.md
docs/PROJECT-STATE.md
docs/PUBLICATION-MANIFEST.md
docs/RELEASE-NOTES.md
docs/RELEASE-WORKFLOW.md
docs/work-packages/PREVIEW-8-SOURCE-IDENTITY.md
package.json
scripts/preview8-package.py
scripts/preview8-verify-release-archive.py
scripts/release_packager.py
src/app/App.tsx
src/locales/summary-ja.ts
src/locales/ui-catalog.ts
src/locales/ui-en.ts
src/locales/ui-ja.ts
src/ui/styles.css
tests/app/locale-catalogs.test.ts
tests/app/ui-copy.test.ts
tests/e2e/preview.spec.ts
tests/release/release-audit.test.ts
tests/release/test_release_packager.py
tests/release/test_verify_release_archive.py
```

## Acceptance

- `package.json`, the immutable `preview8` specification, both literal adapters,
  active workflow paths, and current release-document claims use
  `0.1.0-preview.8` exactly; historical release identities remain untouched.
- Preview 8 binds the exact Preview 7 ledger, ZIP, and manifest above. Every
  Preview 1–7 checked-in artifact and checksum row, every Preview 3–7 closed
  specification, and existing Git history remain unchanged; current
  explanatory documents may change only through this exact source allowlist.
- Pages monitors exact Preview 7 predecessor and Preview 8 active paths, invokes
  only the Preview 8 verifier, extracts the checked-in archive, and contains no
  build command. Existing immutable Action SHAs and permissions remain exact.
- The English catalog is the `source-interface` and makes no human-review
  claim. Only the Japanese catalog is `public-unreviewed-preview`; the
  generated prompt remains English, and support tiers do not change.
- Focused release tests, release-policy tests, full deterministic tests, both
  typechecks, one build, release audit, browser/axe journeys, domain scan, and
  independent source review pass on one unchanged source identity.

## Release sequence

```text
exact 31-path source delta → S8 → complete-tree manifest → qualification
→ one build → deterministic stage → independent review → same-byte promotion
→ exact seven-path P8 child → committed-package verification
→ separately authorized Pages action → public-byte comparison
```

The exact seven later packaging paths are:

```text
SHA256SUMS
docs/PROJECT-STATE.md
docs/TRACEABILITY.md
docs/evidence/releases/0.1.0-preview.8.md
docs/work-packages/PREVIEW-8-PUBLICATION.md
release/phrasegarden-0.1.0-preview.8-pages-manifest.json
release/phrasegarden-0.1.0-preview.8-pages.zip
```

They are not source-package output.

## Stop conditions

Stop on any missing or extra source path; any checked-in Preview 1–7 artifact,
checksum row, closed specification, Git-history, or dependency drift; wrong
predecessor identity; a compiler, prompt, pair, tier, or privacy change; a
failed check; a second build, stage, or promotion; a review overclaim; remote
drift; or any push, deployment, tag, or GitHub Release without a new exact
authorization.
