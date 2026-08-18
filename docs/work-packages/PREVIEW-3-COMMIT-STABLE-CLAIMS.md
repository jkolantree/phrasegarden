# Preview 3 commit-stable public claims

Status: source-repair checkpoint boundary after substantive PASSes

## OBJECTIVE

Make every public release-status statement remain true before and after the
local Preview 3 packaging commit and later publication, without changing
product behavior or weakening any publication, deployment, linguistic-review,
or accessibility boundary.

## SOURCE OF TRUTH

- `docs/LIMITATIONS.md`
- `README.md`
- `docs/ACCESSIBILITY.md`
- `docs/PRODUCT.md`
- `docs/PRIVACY.md`
- `docs/PUBLICATION-MANIFEST.md`
- `docs/RELEASE-NOTES.md`
- `docs/RELEASE-WORKFLOW.md`
- Returned candidate identities recorded in `docs/PROJECT-STATE.md` and
  `docs/TRACEABILITY.md`
- `docs/work-packages/PREVIEW-3-PUBLICATION.md`
- Independent product/language review return on 2026-08-18: the exact phrases
  “it is not yet packaged or published” and “has not yet been packaged” become
  false when the containing seven-path package commit exists.
- Consolidated root-cause audit: `README.md`, `docs/PRODUCT.md`,
  `docs/PROJECT-STATE.md`, `docs/PUBLICATION-MANIFEST.md`, and
  `docs/RELEASE-NOTES.md` contained the same timing-dependent failure family
  across the later publication transition.

## IN SCOPE

Exact owned source paths:

```text
README.md
docs/ACCESSIBILITY.md
docs/LIMITATIONS.md
docs/PRIVACY.md
docs/PRODUCT.md
docs/PROJECT-STATE.md
docs/PUBLICATION-MANIFEST.md
docs/RELEASE-NOTES.md
docs/TRACEABILITY.md
docs/work-packages/PREVIEW-3-COMMIT-STABLE-CLAIMS.md
docs/work-packages/PREVIEW-3-PUBLICATION.md
tests/release/release-audit.test.ts
```

- Replace workspace-timing claims with version-bound evidence language.
- Replace “current,” “still,” and “proposed” release-state labels whose truth
  would flip during the authorized publication sequence.
- Keep Interpreter code review separate from package, publication, deployment,
  and linguistic-review evidence.
- Preserve the exact returned phrases as a permanent regression input.
- Retire the returned package candidate and require a new source manifest,
  qualification, one build, package, and exact-byte review.

## OUT OF SCOPE

- UI, compiler, recipe, profile, pack, registry, prompt, or runtime behavior
- Support-tier promotion or new linguistic-review evidence
- Gate 4+, service workers, accounts, sharing, telemetry, or model calls
- Reusing the returned source manifest, release manifest, archive, or ledger
- Push, tag, GitHub release, Pages deployment, or public verification

## ACCEPTANCE

- `CSC-01`: Public release-status documents contain none of the exact returned
  temporal claims captured by the regression fixture.
- `CSC-02`: Packaging, publication, and deployment status is delegated to the
  version-bound release-evidence record instead of inferred from workspace
  timing.
- `CSC-03`: Interpreter wording says code review alone establishes none of
  package, publication, deployment, or linguistic-review status.
- `CSC-04`: A deterministic release regression recognizes every exact returned
  phrase and rejects each one in its owning public document.
- `CSC-05`: No product, prompt, authored language, support, or runtime bytes
  change; the rebuilt three-file distributable remains byte-identical.
- `CSC-06`: The exact twelve-path repair receives focused/full tests, dual
  typechecks, build/audit/browser qualification on one replacement source,
  source reverification, diff/cache hygiene, and independent read-only review.

## VERIFICATION

1. Run the focused release-audit test, then the full Vitest and Python release
   suites with the bundled runtimes.
2. Run both TypeScript configurations and the forbidden-domain scan.
3. Freeze and reverify one replacement source manifest from the exact clean
   repair commit.
4. Build once; compare every distributable path, byte length, and SHA-256 with
   the returned build before continuing.
5. Run the release audit, twelve sequential Edge/axe journeys, post-browser
   audit, historical checksums, source reverification, and fresh extraction.
6. Obtain independent security and product/language/UX review on the exact new
   source and package bytes.

## STOP CONDITIONS

- The repair requires an eighth packaging path or a verifier-policy expansion.
- Any product, prompt, language, support, runtime, or distributable byte changes
  unexpectedly.
- A required check fails for a cause other than this exact claim repair.
- A proposed wording implies packaging, publication, deployment, review, or
  public-byte evidence that does not exist.
- The exact owned-source boundary or candidate bytes drift during review.

## HANDOFF

Report the exact source and package commits, changed paths, replacement source
manifest, test/build/browser results, distributable and release-asset hashes,
independent reviews, remaining public-write boundary, and the one exact next
action. Do not publish from this package without the separate exact-value
confirmation required by `docs/RELEASE-WORKFLOW.md`.

## LOCAL PRE-CHECKPOINT EVIDENCE

- Focused release audit: 24/24 passed with the bundled Node runner.
- Full Vitest: 13 files, 312/312 passed.
- Python release-security suite: 45/45 passed on the superseded six-path
  variant; the exact twelve-path candidate awaits the replacement-source run.
- Both TypeScript configurations passed.
- Forbidden `src/domain` dependency scan: zero matches.
- `git diff --check`, exact twelve-path scope, empty index, and cache hygiene
  pass.
- An initial `pnpm exec vitest` wrapper attempt found no executable and ran zero
  tests; it is an invalid launcher attempt, not product evidence.
- The first expanded-fixture typecheck failed because an unclosed tuple made a
  path possibly undefined. Closing the test-data tuple repaired the test layer;
  both final typechecks pass.
- No build or browser run occurred before the replacement source checkpoint.

## REVIEW CLOSURE

Independent security/release and product/language/UX reviews of the exact
twelve-path substantive freeze returned PASS with zero open P1/P2/P3. The
public documents, deterministic regression, and publication contract remain
byte-identical. The final closure changes only `docs/PROJECT-STATE.md`,
`docs/TRACEABILITY.md`, and this contract. Those state-only bytes require a
narrow exact-byte rebind before staging.

The containing commit becomes replacement source `S2` only if its sole parent
is `9bc73b96a48d2ca96f0b4460da860afe954a3eb8`, its changed paths equal the exact
twelve-path allowlist, the substantive review identities remain unchanged, and
the state-only rebind has zero findings. This checkpoint creates no source
manifest, distributable, package, public release, or deployment evidence.
