# PhraseGarden release workflow

Status: accepted working procedure
Updated: 2026-08-19

## Goal and authority boundary

The goal is a usable, byte-qualified public release. Work advances one bounded
package at a time; passing a development package does not itself establish
release readiness.

Local implementation, tests, builds, inspection, hashing, local branches, and
local commits are permitted within an approved package. These remain separate
future authorization boundaries:

1. **Verify-only CI write:** push one exact source candidate to one named remote
   branch so a named, hash-pinned workflow can run with read-only contents
   permission and no deployment.
2. **Publication:** push or promote only the exact approved source and named
   public surfaces. Authorization must name the repository, source SHA, version,
   each included tag or release asset, Pages target, and rollback artifact.
   Omitted surfaces are not implied; the Preview 7 plan includes Pages but no
   tag or GitHub Release.

Neither authorization implies the other. No package may infer permission for a
remote write from the release goal.

## Ordered packages

Only the first eligible row is active. A package that exceeds 700 net lines or
crosses unrelated owners stops and splits before more implementation.

| Order | Package | Budget | Exit |
|---:|---|---:|---|
| 1 | `G3.5` Advanced disclosure | 300–500 | Existing settings use one modality-aware disclosure; no semantic or prompt-byte change |
| 2 | `G3-X` Gate 3 qualification | evidence only | Full Gate 3 automated and required manual evidence passes on one fingerprint |
| 3 | `G4.1` ownership formats and pure codecs | 450–650 | Closed, bounded, versioned records and migrations |
| 4 | `G4.2` local repository adapter | 300–500 | Explicit, recoverable PhraseGarden-only storage |
| 5 | `G4.3` save/library/clear UI | 500–700 | Accessible local ownership journey |
| 6 | `G4.4` JSON import/export | 400–650 | Fail-closed, byte-tested file round trips |
| 7 | `G4.5` URL-fragment sharing | 450–650 | Exact privacy allowlist and request-boundary proof |
| 8 | `G4-X` Gate 4 qualification | evidence only | Ownership, recovery, migration, and privacy matrix passes |
| 9 | `G5.1` UI-locale foundation | 500–700 | Complete typed English catalog; prompt bytes unchanged |
| 10 | `G5.2` Japanese interface | 500–700 | Complete Japanese catalog with explicit review claim |
| 11 | `G5.3` i18n/accessibility hardening | 400–650 | IME, bidi, CJK, grapheme, zoom, motion, and AT evidence |
| 12 | `G5.4` durable offline | 350–550 | Atomic same-origin cache, upgrade, and rollback behavior |
| 13 | `G5.5` CSP/privacy/output hardening | 350–550 | No unintended request or release-output disclosure |
| 14 | `G5-X` Gate 5 qualification | evidence only | Frozen bilingual accessibility/offline/privacy matrix passes |
| 15 | `G6.1` release claims and governance | 400–650 | Claims, suite, contribution rules, licenses, and identity are exact |
| 16 | `G6.2` moderated usability qualification | evidence only | Separately authorized, predeclared, data-minimized protocol passes |
| 17 | `G6.3` RC freeze and package | 350–600 | Candidate manifest and distributable bytes are frozen and qualified |
| 18 | `G6.4` independent RC review | read only | No open P1/P2/P3; claims do not exceed exact evidence |
| 19 | Publication and production qualification | external write | Exact approved bytes publish and final public bytes requalify |

Gate 4 identity/collision semantics, Japanese author/reviewer and locale policy,
service-worker activation, stable support-tier contract, stable version, human
reviewer governance, usability-data collection, optional model evaluation, and
the exact publication plan are just-in-time decisions. They do not block
`G3.5`.

## Package execution

Each implementation package follows this sequence:

1. Write the package contract and stable acceptance IDs.
2. Confirm the source checkpoint, exact owned paths, protected paths, budget,
   and stop conditions.
3. Map every acceptance ID to construction, validation, tests or manual
   evidence, privacy class, and maximum release claim.
4. Implement the smallest responsible layer.
5. Run focused deterministic checks before full suites, builds, browsers,
   screenshots, assistive technology, external transport, or model work.
6. Capture each failure exactly, classify it, add a negative/regression case,
   and repair the owning layer.
7. Reach quiescence, freeze the candidate fingerprint, then obtain independent
   read-only review without mutating candidate bytes.
8. Update the resume cursor and create an explicit local checkpoint.
9. Stop. The next row does not begin implicitly.

Qualification packages never repair. A failure invalidates that qualification
fingerprint and returns to a separately contracted development package.

Every checkpoint and freeze uses a fail-closed index allowlist. Stage only the
exact paths named in the package contract—never a repository-wide convenience
stage. Before committing, compare the complete cached path list byte-for-byte
with the expected sorted set, fail on every missing or unexpected path, run the
cached diff check, and record the staged diff/tree fingerprint. Unrelated dirty
or untracked work remains unstaged. A release freeze additionally confirms the
expected source parent and protected-path state before its commit can become a
candidate.

## Progress states

```text
READY → CONTRACTED → BASELINED → IMPLEMENTING
→ CHEAP_CHECKS_GREEN → EXPENSIVE_CHECKS_GREEN → QUIESCENT
→ FROZEN (qualification only) → INDEPENDENT_REVIEW → HANDOFF → READY

failure: CAPTURE → CLASSIFY → REPAIR_n
impasse: RETURN_DESK → BLOCKED_USER | BLOCKED_EXTERNAL | BLOCKED_TRANSPORT
frozen mutation: FROZEN → INVALIDATED → DEVELOPMENT
```

Progress requires at least one of:

- an acceptance ID closes with new evidence;
- an open failure count decreases;
- a captured failure gains a responsible-layer classification;
- a blocker gains one exact owner and required artifact; or
- the candidate advances state with a new immutable fingerprint.

Commands run, screenshots refreshed, clauses added, CSS changed, or test counts
increased are not progress by themselves.

## Freeze, build, and same-byte promotion

The active Preview 7 procedure derives complete committed-source identity with
the pinned release adapter. Preview 3 through Preview 6 adapters remain
available for historical verification:

```text
python -B scripts/preview7-package.py freeze-source --source-commit <S7>
python -B scripts/preview7-package.py verify-source --source-commit <S7>
```

`S7` is exact 40-lowercase-SHA-1 `HEAD` in a physical standalone repository.
The first command exclusively creates the fixed ignored
`artifacts/release/preview7-source-manifest.json`; the second reconstructs and
byte-compares it without rewriting. The canonical closed JSON binds `S7`, its
tree, and every regular `100644` blob by portable path, mode, length, and
SHA-256. It is derived from size/type-preflighted and typed-rehashed Git
objects. Exact index and bounded raw-worktree checks are equality gates only.

The source tool rejects non-HEAD or abbreviated identity, dirty gates,
nonignored untracked paths, alternate/partial/common object storage, local
configuration indirection, unsupported modes or paths, and every fixed budget:
512 files, 512 trees, depth 32, 8 MiB per blob, 32 MiB total blobs, 1 MiB
manifest, and 1 MiB Git response/configuration. It makes no release,
linguistic-review, or public-byte claim. A source manifest becomes candidate
evidence only after its exact bytes and source commit pass the named source
qualification; any source mutation requires a new manifest and qualification.

Before release-candidate qualification, freeze and hash source, compiler,
profiles, packs, recipes, authored surfaces, catalogs, builder, validators,
tests, fixtures and ledger snapshot, rubric/configuration, and model settings
if any. The complete-tree source manifest is that source inventory;
hand-maintained path lists are not. Qualification records reference its hash. A
schema-1 release manifest records declared source `S7` and hashes distributable
bytes only. The exact seven-path packaging commit has sole parent `S7`; its
release-evidence record binds the source-manifest hash and qualification
results alongside that manifest, archive, and checksum append. Tool stdout is
diagnostic, not qualification evidence. No deterministic layer thereby proves
that a human review occurred or that a linguistic conclusion is true.

The Preview 7 release build happens once. Tests, archive creation, checksum
generation, independent review, draft-asset capture, and promotion all consume
those exact bytes. Pages CI extracts, verifies, tests, and deploys the exact
checked-in archive; it must not silently rebuild a second deployment artifact.
Any byte mismatch stops publication.

The required Preview 7 sequence is: exact uncommitted source set → `S7` →
source qualification → one build → deterministic stage → independent review →
same-byte promotion → exact `P7` packaging child → Pages run → public-byte
comparison. The workflow's official GitHub Actions remain pinned by immutable
commit SHA and use their Node 24-backed releases; that infrastructure update
does not change product behavior or establish any later step in this sequence.

After publication, download each release asset through its final unauthenticated
public URL and each Pages asset through its public URL. Record path, length, and
SHA-256 independently from draft/upload transport. A mismatch is an incident;
do not regenerate, replace, delete, retag, or redeploy without a new decision.

## First service-worker release

Current production has no service worker. `G5.4` must either omit the worker or
qualify all of these before publication:

- upgrade from the exact current no-worker production;
- successful candidate install and activation;
- server rollback while an existing client remains worker-controlled;
- rollback-manifest detection by the candidate worker;
- atomic candidate-cache removal and unregister/relinquish behavior;
- reload into byte-qualified rollback bytes;
- offline behavior during each transition; and
- both clean-client and previously controlled-client rollback.

Redeploying old server bytes alone is not accepted as rollback evidence.

## Publication stop rule

Publication begins only after the user confirms the exact plan. Any changed
source SHA, version, workflow, included tag or asset name/hash/length, Pages
target, rollback artifact, permission, or transmitted data class voids that
authorization and returns the plan for confirmation.
