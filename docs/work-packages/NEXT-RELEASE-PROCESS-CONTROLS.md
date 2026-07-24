# Next-release process controls

## Objective

PhraseGarden can resume toward an actual release from one compact, exact cursor
without re-auditing historical work or repeating a failed action without new
evidence.

## Source of truth

- The user-approved next-release workflow and Advanced Controls decision
- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`
- `docs/EVALUATION.md`
- `docs/DECISIONS.md`
- Interpreter checkpoint commit
  `c2e6104e3b47ef180d5e27da5147d31b59ee4ebf`
- The published Preview evidence currently held in `docs/PROJECT-STATE.md`

## In scope

- Compact `docs/PROJECT-STATE.md` into a current resume cursor.
- Move detailed Preview 1, Preview 2, and Interpreter evidence into versioned
  ledgers without weakening or upgrading any claim.
- Define the ordered local-to-release workflow and its external-write
  boundaries.
- Define stable acceptance traceability, progress states, retry budgets,
  Return Desk records, and exact resume rules.
- Add one durable ADR for this state/evidence discipline.

Owned paths:

- `docs/PROJECT-STATE.md`
- `docs/DECISIONS.md`
- `docs/RELEASE-WORKFLOW.md`
- `docs/TRACEABILITY.md`
- `docs/RETURN-DESK.md`
- `docs/evidence/releases/0.1.0-preview.1.md`
- `docs/evidence/releases/0.1.0-preview.2.md`
- `docs/evidence/candidates/gate-3-interpreter.md`
- this contract

## Out of scope

- Product, compiler, recipe, profile, pair-pack, locale, UI, or test changes
- Advanced Controls implementation
- Gate 4, Gate 5, or Gate 6 implementation
- CI/workflow edits, build regeneration, packaging, model evaluation, or
  prospective-fixture use
- Commit publication, push, tag, release, deployment, or any other remote write

## Acceptance

| ID | Observable requirement |
|---|---|
| `PC-01` | `PROJECT-STATE.md` exposes active package, state, candidate fingerprint, closed acceptance IDs, next blocker, last check, retry counters, freeze status, exact next action, and forbidden work. |
| `PC-02` | Detailed Preview 1, Preview 2, and Interpreter proof is preserved in named evidence ledgers and linked from the current cursor. |
| `PC-03` | Every next package has one owner, acceptance IDs, a line budget, cheap-to-expensive checks, stop conditions, and one next eligible package. |
| `PC-04` | Progress is defined by closed evidence, reduced failures, classified causes, resolved blockers, or an immutable state transition—not activity alone. |
| `PC-05` | Retry limits send repeated command, transport, fixture, layout, review, and invariant-family failures to the Return Desk. |
| `PC-06` | Qualification freezes are invalidated by candidate mutation; prospective failures receive no retry on the exposed set. |
| `PC-07` | Verify-only CI authorization and exact-byte publication authorization are separate future decisions. |
| `PC-08` | The first service-worker release cannot claim rollback until a previously controlled client returns to byte-qualified production bytes, or the release omits the worker. |
| `PC-09` | Release promotion uses the exact already-qualified build bytes and verifies final unauthenticated public bytes after publication. |
| `PC-10` | No owned file changes product behavior or strengthens a support, linguistic-review, privacy, accessibility, offline, evaluation, or release-readiness claim. |

## Verification

```text
git diff --check
git diff --name-only c2e6104 -- <owned paths>
link and required-field scan across the five process documents
evidence-preservation scan for Preview commits, run IDs, hashes, and verdicts
protected runtime/test/release/workflow path diff
documentation line-count and stale-next-action scan
independent read-only process and release-mechanics review
final status and diff fingerprint
```

No build, browser, model, network, or remote check is warranted because the
owned path set is documentation-only.

## Stop conditions

Stop if preserving an old record would require changing its claim; a current
fact conflicts with its immutable release evidence; any runtime, test, release,
or workflow path changes; the process implies remote authorization; or the
package grows beyond a coherent documentation-only change.

## Handoff

Record the exact owned paths, acceptance IDs, checks, independent verdict,
limitations, retry counters, candidate checkpoint, and one next eligible
action in `docs/PROJECT-STATE.md`. Create a local-only process checkpoint and
stop before Advanced Controls implementation.
