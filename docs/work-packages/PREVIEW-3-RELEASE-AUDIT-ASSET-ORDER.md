# Preview 3 release-audit asset order

Status: active failure-directed validator repair

## OBJECTIVE

Make the release audit identify the one hashed CSS asset and one hashed
JavaScript asset by exact path shape rather than by their incidental
lexicographic hash order.

## SOURCE OF TRUTH

- `docs/work-packages/PREVIEW-3-PAGES-POLICY.md`
- `scripts/release-audit.mjs`
- `tests/release/release-audit.test.ts`
- Exact failing Vite output:
  `assets/index-DSFT2Fh6.js`, `assets/index-F3dKZlAp.css`, and `index.html`
- Exact failure: `dist: unexpected release output shape` and
  `index.html: does not match canonical release document`

## IN SCOPE

Exact owned paths:

- `docs/work-packages/PREVIEW-3-RELEASE-AUDIT-ASSET-ORDER.md`
- `scripts/release-audit.mjs`
- `tests/release/release-audit.test.ts`

Classify the failure as validator/checker logic. Preserve sorted manifest
records, but select the CSS and JavaScript identities independently by their
closed path patterns before constructing the exact canonical document.

## OUT OF SCOPE

- Broadening the three-file/four-entry release tree
- Weakening canonical HTML, CSP, path, type, byte, symlink, or resource checks
- UI, compiler, build, archive-verifier, workflow, packaging, or publication
  changes

## ACCEPTANCE

- `AO-01`: Exactly one `assets/index-*.css`, exactly one
  `assets/index-*.js`, and exact `index.html` are required regardless of which
  asset path sorts first.
- `AO-02`: The canonical HTML binds its stylesheet and script to those exact
  independently identified paths.
- `AO-03`: A permanent positive regression places the JavaScript path before
  the stylesheet path in ASCII order and passes with an exact manifest.
- `AO-04`: Duplicate, missing, extra, case-variant, unsafe, and malformed paths
  retain fail-closed behavior.
- `AO-05`: Focused release-audit tests, archive tests, full Vitest, current
  output audit, diff check, exact three-path scope, and independent review pass.

## VERIFICATION

Run the focused release-audit suite, the 20 archive-verifier tests, full Vitest,
both typechecks, current `dist` audit, exact scope/net/diff/cache checks, and an
independent read-only P1/P2/P3 review. Do not rebuild or regenerate `dist` in
this validator package.

## STOP CONDITIONS

- Repair requires accepting more than the exact three release files.
- Any canonical document, CSP, path, resource, or input budget is weakened.
- Current output still fails or a prior negative becomes accepted.
- Package exceeds 300 net lines.

## HANDOFF

Report exact files, failing and passing asset order, focused/full counts,
current-output audit, unchanged negative families, independent verdict, and the
still-open mobile-select and claims packages. Then stop before source freeze.
