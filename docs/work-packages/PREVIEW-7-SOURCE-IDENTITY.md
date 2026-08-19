# Preview 7 source identity package

Status: source contract; no package or public authority
Version target: `0.1.0-preview.7`
Updated: 2026-08-19

## Objective

Identify one bounded Preview 7 source candidate that improves accessibility
semantics and release infrastructure without changing prompts, language
behavior, support tiers, privacy, or product scope.

## Source of truth

- Current workspace bytes on the exact source path allowlist below
- Version target `0.1.0-preview.7`
- Preview 6 checksum ledger: 1,952 bytes, SHA-256
  `82CBC32E5606F827765983271B248CD7C4788DFE57AB703FD1B94A55432B9C4E`
- Preview 6 Pages ZIP: 186,851 bytes, SHA-256
  `6A2DC1E364F42B64D54034E734233CB09A9166A01F9C6591D182AB40CA81EA55`
- Preview 6 manifest: 976 bytes, SHA-256
  `B9753A9286D3C8E662ABB7A9244817BFA7EAA2382B262794816527C765074F7E`
- Preview 6 is the exact immutable Pages predecessor. It has no tag or GitHub
  Release.

## Exact source allowlist

The Preview 7 source candidate contains exactly these 23 changed or new paths,
in ordinal path order:

```text
.github/workflows/pages.yml
README.md
docs/ACCESSIBILITY.md
docs/LIMITATIONS.md
docs/PRIVACY.md
docs/PRODUCT.md
docs/PROJECT-STATE.md
docs/PUBLICATION-MANIFEST.md
docs/RELEASE-NOTES.md
docs/RELEASE-WORKFLOW.md
docs/work-packages/POST-P6-NODE24-ACCESSIBILITY.md
docs/work-packages/PREVIEW-7-SOURCE-IDENTITY.md
package.json
scripts/preview7-package.py
scripts/preview7-verify-release-archive.py
scripts/release_packager.py
src/app/App.tsx
src/ui/SupportStatus.tsx
src/ui/styles.css
tests/e2e/preview.spec.ts
tests/release/release-audit.test.ts
tests/release/test_release_packager.py
tests/release/test_verify_release_archive.py
```

Any missing or unexpected path invalidates this source contract and requires a
new reviewed allowlist before `S7` can be created.

## In scope

- One named language-support guidance region on Home, Builder, and Review
- One focusable, named document containing the complete generated instructions
- Automated forced-colors regression coverage without exact-color overfitting
- Official GitHub Action commits whose releases use Node 24
- Preview 7 source, package-adapter, and public-document identity

## Out of scope

- Prompt, compiler, recipe, language profile, canonical registry, pair-pack,
  support-tier, or privacy-semantic changes
- A new language, dialect claim, pair-specific clause, or tier promotion
- A manual screen-reader, real-device IME, manual forced-colors, WCAG,
  moderated-usability, or external linguistic-review claim
- Packaging, committing, pushing, deploying, tagging, or creating a GitHub
  Release through this documentation package

## Acceptance

- Every public/source document treats Preview 7 as a source candidate and
  separates Git, package, deployment, tag, and GitHub Release authority.
- Preview 6 remains the exact immutable Pages predecessor; its ledger, ZIP, and
  manifest identity above is not rewritten.
- English↔Japanese remains Preview because external linguistic review is
  incomplete. Every other direction remains Generic. Portuguese remains
  region-unspecified `pt`, not `pt-BR` or `pt-PT`.
- The complete prompt remains visible, editable, copied, and downloaded in
  full. Named document semantics do not alter its bytes.
- The Builder's named support guidance is visible and does not move support,
  limitation, or handoff truth out of logical order.
- The Node 24 Action update is described only as pinned release
  infrastructure. It makes no product, runtime, or review claim.
- No document claims a Preview 7 package, deployment, tag, GitHub Release,
  public-byte match, manual assistive-technology pass, WCAG conformance, or
  completed linguistic review.

## Verification

Before `S7`, compare the complete changed-path set byte-for-byte with the exact
allowlist above, inspect the complete diff, and run the focused accessibility,
release-policy, typecheck, build, domain, privacy, and sequential browser gates
named by the owning implementation contract. Independent review must bind the
same quiescent bytes. Documentation-only checks are targeted text and diff
checks; they do not substitute for the complete 23-path source qualification.

## Release sequence

```text
exact source candidate
→ exact S7 checkpoint and complete-tree source manifest
→ source qualification
→ one production build
→ deterministic stage from those exact bytes
→ independent read-only review
→ same-byte promotion
→ exact seven-path P7 packaging child with sole parent S7
→ Pages extracts, verifies, tests, and deploys the checked-in archive
→ unauthenticated public-byte comparison
```

No step borrows authority from an earlier one. Any source or built-byte change
invalidates downstream candidate evidence and returns to the owning step.

## Stop conditions

- The changed-path set differs from the exact allowlist.
- Preview 6 predecessor bytes or the Pages-only/no-tag boundary conflict with
  qualified evidence.
- A change touches prompt semantics, language identity, pair guidance, support
  resolution, privacy behavior, or public scope.
- A check fails, an independent reviewer returns a P1/P2/P3 finding, or the
  exact public bytes cannot be recovered and compared.

## Handoff

This package establishes source documentation only. If no external source
review and Git checkpoint exist, the next eligible action is to reconcile and
freeze the 23-path candidate as `S7`. Package, publication, and public-byte
claims always remain separately evidenced stages.
