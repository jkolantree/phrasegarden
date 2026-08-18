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

Child A1b adds permanent regressions from the exact reviewed A1a checkpoint;
its source hash must be inserted here before staging it:

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

Child A1c must replace `PREVIEW-3-PUBLICATION`'s stale manual source-path list
with this complete-tree manifest authority; A1a/A1b do not claim that repair.

Child B may extend only this tool and its tests plus the separately named
administrative contracts. It will create one fixed ignored staging directory,
one deterministic `ZIP_STORED` archive and closed manifest from one qualified
`dist`, and an exact two-line append to the parent checksum ledger. Promotion
will copy those already verified bytes to the three fixed packaging paths only,
without regeneration or overwrite. Its own contract, fixtures, budgets, and
independent review are required before any release bytes are generated.

## Out of scope

- Actual source freeze, build, archive, manifest, checksum, packaging commit,
  tag, push, GitHub release, Pages run, deployment, or public verification
- Product, compiler, profile, pair-pack, recipe, UI, or browser behavior
- Gate 4+, model/prospective evaluation, or new publication claims

## Handoff

Record exact paths, diff size, checks, independent verdict, limits, and next
eligible child in `PROJECT-STATE.md` and `TRACEABILITY.md`; checkpoint only the
active child's allowlist, then stop before advancing.
