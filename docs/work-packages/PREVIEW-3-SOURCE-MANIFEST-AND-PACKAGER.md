# Preview 3 source manifest and package generator

## Objective

Create one deterministic, bounded path from an exact clean source commit to
locally staged Preview 3 release bytes without letting worktree filters,
ambient state, regeneration, or transport reinterpret the candidate.

This umbrella is implemented as two separately reviewed checkpoints. Child A
owns committed-source identity. Child B later owns archive staging and exact
promotion. Neither child freezes a release candidate, creates public assets,
or authorizes a remote write.

## Source of truth

- `docs/RELEASE-WORKFLOW.md`
- `docs/work-packages/PREVIEW-3-PUBLICATION.md`
- `docs/work-packages/PREVIEW-3-SAME-BYTE-PIPELINE.md`
- ADR-029 and ADR-032
- Archive verifier checkpoint `70858f1`
- Pages-policy checkpoint `4d9002f`

## Child A — committed-source manifest

### In scope and checkpoint split

Child A1a implements and reviews the core from base
`fde72854c7c0d0439f0ac71e1c69a6b23a2052b9`:

```text
docs/work-packages/PREVIEW-3-SOURCE-MANIFEST-AND-PACKAGER.md
scripts/preview3-package.py
```

Child A1b adds permanent regressions from exact reviewed A1a checkpoint
`e421e0a3248d9d7c1730929697920f8b757b8792`:

```text
docs/work-packages/PREVIEW-3-SOURCE-MANIFEST-AND-PACKAGER.md
tests/release/test_preview3_package.py
```

Child A1c records the combined bound result without changing implementation:

```text
docs/DECISIONS.md
docs/PROJECT-STATE.md
docs/RELEASE-WORKFLOW.md
docs/TRACEABILITY.md
docs/work-packages/PREVIEW-3-PUBLICATION.md
```

Each checkpoint independently stays below the 650-net-line stop cliff.

`freeze-source --source-commit <S>` reconstructs every regular `100644` blob
in exact 40-lowercase-SHA-1 commit `S` through Git object reads and exclusively creates ignored
local evidence at `artifacts/release/preview3-source-manifest.json`.
`verify-source` independently reconstructs the same canonical bytes and
requires exact equality. Manifest content derives only from size/type-preflighted
and rehashed raw Git commit/tree/blob objects; local alternates and
partial-clone fetching reject.
Both commands require the repository root with a physical `.git` directory, exact
lowercase full `HEAD` commit, exact tree, no nonignored untracked path from
`git ls-files --others --exclude-standard -z`, and
worktree, portable case-insensitively unique ASCII paths, and fixed budgets:
512 files, 512 trees, depth 32, 8 MiB per blob, 32 MiB total blobs, 1 MiB manifest, and 1 MiB per
Git control response or local config file. The tool forces no-replace/no-lazy-fetch Git behavior,
rejects repository-redirecting Git environment, strips tracing environment, rejects local/worktree
config includes and external excludes, disables fsmonitor, and accepts
no checkout filter execution, host sorting, or Git abbreviation. Exact index records/flags and
bounded raw worktree files must byte-match the committed tree even when status
or clean filters conceal a change. `GIT_OPTIONAL_LOCKS=0` prevents refresh writes.

The closed root is `schemaVersion: 1`,
`kind: "phrasegarden-source-freeze"`, `sourceCommit`, `sourceTree`, and
path-sorted `files`. Each record is exactly `path`, `mode: "100644"`,
nonnegative integer `bytes`, and 64-uppercase-hex `sha256`. Serialization uses
`json.dumps(..., ensure_ascii=True, indent=2, separators=(",", ": "))`, UTF-8
without BOM, LF-only, and one terminal LF.

### Acceptance

| ID | Observable evidence |
|---|---|
| `SM-01` | Manifest identity is exact full lowercase commit/tree plus every committed regular-file blob length and SHA-256. |
| `SM-02` | Manifest construction depends only on verified Git objects; worktree/index and committed ignore policy are equality gates only. Allowed local reads are exact repository metadata/objects, index, raw tracked files, root `.gitignore`, and the fixed evidence path—never clock, locale services, network, randomness, application storage, filters, or alternate object stores. |
| `SM-03` | Dirty tracked, staged, or nonignored untracked state; non-HEAD or malformed commit; unexpected mode/type; unsafe/colliding path; and every exceeded budget fail closed. |
| `SM-04` | Freeze and verify share pre/post `lstat` physical-prefix checks and opened-file identity checks. They assume no hostile concurrent filesystem mutation and fail on detected drift. Freeze creates exclusively and never deletes or overwrites; a caught partial write remains blocking evidence. Verify bounded-reads one regular file, never rewrites, and rejects every byte mismatch. |
| `SM-05` | Focused tests, full tests, both typechecks, build, release checks, domain scan, diff/cache hygiene, line budget, and independent read-only review pass. |

### Verification

The only source commands are:

```text
python -B scripts/preview3-package.py freeze-source --source-commit <S>
python -B scripts/preview3-package.py verify-source --source-commit <S>
```

Run `python -B -m unittest tests/release/test_preview3_package.py`, the existing
archive and release-audit suites, full Vitest, both TypeScript typechecks, Vite
build, forbidden-domain scan, `git diff --check`, exact path accounting, and an
independent frozen-byte review. Do not run `freeze-source` against the real
repository during this development child.

### Stop conditions

Stop on inability to rehash exact Git objects without filters; required executable,
symlink, submodule, non-ASCII, or over-budget source content; a required public
manifest or eighth packaging path; source-identity ambiguity; baseline failure;
scope drift; or Git-style additions-minus-deletions at or above 650 lines from
the active checkpoint's recorded base.

## Child B — same-byte staging and promotion

Child B starts at `ba886b41780780644c1dbbe115ef1cb8281e8026` and owns this contract,
`scripts/preview3-package.py`, and its test. B1 freezes core, B2 adds returned-failure regressions, and B3 fixes claims.

```text
python -B scripts/preview3-package.py {stage-package|verify-package|promote-package} --source-commit <S>
```

Every command byte-verifies the source manifest at clean `HEAD == S`; no other option exists. The already built
`dist` is externally qualified. This tool proves byte structure, never that a build, test, or review occurred.

The ignored stage contains exactly `SHA256SUMS` and, under `release/`, the Preview 3 manifest and ZIP.
Closed schema 1 records fixed release/build identity, `S`, and sorted `dist` paths, lengths, and uppercase SHA-256.
The later seven-path commit/evidence record binds its reported source-manifest hash and qualification evidence;
schema 1 itself claims neither qualification nor package commit.

The exact `dist` is `index.html`, plus CSS/JS names with lowercase prefix/extensions and a case-sensitive hash.
The canonical ZIP is sorted `ZIP_STORED`, no ZIP64/directories, fixed epoch, Unix/version 2.0, regular `100644`,
zero flags/attributes, and empty extras/comments. Limits: 64 files, 128 entries, depth 16, 5 MiB release,
5 MiB + 256 KiB ZIP, 256 KiB manifest, and 64 KiB ledger.

Stage creation is exclusive, fsynced, re-read, and retained after failure. Read-only verification requires exact
stage, source, `dist`, canonical manifest/ZIP, and source ledger plus archive-then-manifest lines. Promotion first
verifies, exclusively creates final archive/manifest, then appends both lines in one write. It copies only staged
bytes, never regenerates or replaces output; partial results block retry. The seven-path commit remains separate.
Detected mutation fails closed; hostile concurrent filesystem mutation outside these barriers is out of scope.

### Child B acceptance

| ID | Observable evidence |
|---|---|
| `PB-01` | Fixed CLI and paths; exact source manifest, `S`, root ledger, and current three-file `dist` bind one candidate. |
| `PB-02` | Release-manifest schema/serialization and every ZIP metadata byte are deterministic across locale, timezone, creation order, and ambient Git state. |
| `PB-03` | Unsafe, colliding, extra, missing, nonregular, reparse, mutable, or over-budget inputs and unknown staging entries fail closed. |
| `PB-04` | Stage is exclusive and retained on partial failure; verify is read-only; archive/manifest promotion is exclusive; ledger preserves every parent byte. |
| `PB-05` | Promotion writes only exact staged bytes, invokes no staging command, and retains partial output as blocking evidence. |
| `PB-06` | A synthetic stage-to-promotion seven-path commit passes the existing archive/package verifier; all fixtures remain development/regression evidence. |
| `PB-07` | Focused tests, all Python release tests, full Vitest, both typechecks, build/audit, historical checksums, domain scan, diff/cache hygiene, budget, and independent review pass. |

### B2 returned-failure regressions

B2 starts at `cc61a60205c04bd34709acb0fa6b071802de0526` and may change only this
contract and `tests/release/test_preview3_package.py`; production bytes stay
unchanged. Permanent development/regression cases cover the exact structural
statement, archive/manifest path case variants, a hardlinked root ledger,
prewrite stage drift, and postwrite stage/source-input drift. They must prove
fail-closed timing and retained blocking evidence, not claim hostile-filesystem
security beyond the declared barriers. Focused/full deterministic checks,
diff/cache hygiene, exact path/line accounting, and independent review must
pass before its local checkpoint.

Run no real stage/promotion during development. Stop on identity ambiguity, schema 2/eighth-path need, ledger
preservation failure, unsupported `dist`, drift, baseline failure, or net change at/above 650. Closure is separate.

## Out of scope

- Actual source freeze, build, archive, manifest, checksum, packaging commit,
  tag, push, GitHub release, Pages run, deployment, or public verification
- Product, compiler, profile, pair-pack, recipe, UI, or browser behavior
- Gate 4+, model/prospective evaluation, or new publication claims

## Handoff

Record exact paths, diff size, checks, independent verdict, limits, and next
eligible child in `PROJECT-STATE.md` and `TRACEABILITY.md`; checkpoint only the
active child's allowlist, then stop before advancing.
