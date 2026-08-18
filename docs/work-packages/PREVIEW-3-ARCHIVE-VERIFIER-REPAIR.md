# Preview 3 archive-verifier repair

## Objective

Restore one observable release invariant: the bytes accepted by packaging mode
are the exact seven regular-file blobs committed at `HEAD`, and a rejected
archive leaves no partial extraction that can trap a retry.

This is a forward development repair after checkpoint `83558bd`; it does not
reinterpret or erase the earlier review result.

## Source of truth

- The reproduced failures recorded in the 2026-08-17 independent review
- `docs/work-packages/PREVIEW-3-PUBLICATION.md`
- `docs/work-packages/PREVIEW-3-SAME-BYTE-PIPELINE.md`
- `docs/RELEASE-WORKFLOW.md`
- ADR-028 and ADR-029
- The exact seven packaging paths in `PACKAGING_PATHS`

## In scope

Exactly these package-owned paths:

```text
docs/DECISIONS.md
docs/PROJECT-STATE.md
docs/TRACEABILITY.md
docs/work-packages/PREVIEW-3-ARCHIVE-VERIFIER-REPAIR.md
scripts/verify-release-archive.py
tests/release/test_verify_release_archive.py
```

The repair:

- binds every packaging path to its exact regular-file `HEAD` blob;
- parses bounded UTF-8 JSON with duplicate-key and nonstandard-number rejection;
- requires exact JSON scalar types;
- constrains archive paths to a portable ASCII subset and rejects normalized or
  case-insensitive collisions;
- streams file hashes and bounds ledger, manifest, and physical ZIP inputs;
- rejects prepended ZIP payloads and non-regular filesystem metadata; and
- validates every member before creating an atomic fresh extraction.

## Out of scope

- `.github/workflows/pages.yml` and `scripts/release-audit.mjs`
- action-reference lookup, Pages policy, CI, remote refs, and deployment
- actual Preview 3 ZIP, manifest, checksum additions, or release evidence
- language profiles, pair packs, tier changes, compiler, recipes, UI, and Gate 4+
- rewriting, amending, reverting, or pushing checkpoint `83558bd`

## Acceptance

| ID | Observable evidence |
|---|---|
| `P3-AR-01` | A real temporary Git repository proves a clean exact seven-path packaging commit passes and coherent dirty replacements fail. |
| `P3-AR-02` | Duplicate JSON keys, nonstandard constants, boolean/float schema versions, and numeric `sourceMaps` fail closed. |
| `P3-AR-03` | Non-ASCII, Unicode-equivalent, traversal, reserved, and case-colliding paths fail before extraction. |
| `P3-AR-04` | Oversized ledger, manifest, physical ZIP, and prepended ZIP payloads fail before unbounded reads or decompression. |
| `P3-AR-05` | Symlink, FIFO, socket, device, and directory metadata fail; regular or unspecified file metadata may pass. |
| `P3-AR-06` | A late member failure leaves the requested output absent; the corrected retry can use the same output path. |
| `P3-AR-07` | Existing checksum, parent, exact-delta, archive-member, and nine historical-target guarantees remain green. |
| `P3-AR-08` | Focused tests, full Vitest, both typechecks, Vite build, forbidden-domain scan, diff hygiene, and independent read-only review pass. |

Development fixtures are synthetic and development-only. Their success is
regression evidence, not independent publication qualification.

## Verification

Run from the repository root with bytecode disabled:

```text
python -B -m unittest tests/release/test_verify_release_archive.py
pnpm test
pnpm exec tsc -p tsconfig.json --noEmit
pnpm exec tsc -p tsconfig.domain.json --noEmit
pnpm build
git diff --check
```

Also verify the exact six-path package allowlist, a comfortably sub-700 net
line delta, all historical checksum targets, zero forbidden domain references,
and no generated Python cache.

## Stop conditions

Stop on a failing regression, inability to bind filesystem bytes to exact Git
blobs without filters, an input bound too small for the existing qualified
artifacts, a required non-ASCII release filename, partial output after a
validation failure, unexpected baseline failure, package growth near the
700-line cliff, or any need to mutate the two preserved Pages-policy files.

## Handoff

Record exact files, diff size, focused/full checks, historical checksum result,
independent verdict, limitations, and the next eligible Pages-policy or
language-expansion package in `PROJECT-STATE.md` and `TRACEABILITY.md`. Then
checkpoint only these six paths. Do not freeze, build release artifacts, push,
or publish from this package.
