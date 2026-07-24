# PhraseGarden Return Desk

Status: accepted process control
Updated: 2026-07-24

The Return Desk is the mandatory destination when another attempt would repeat
an unchanged action, consume ineligible evidence, exceed authority, or hide an
unresolved decision. It is a useful stop, not a failed release.

## Retry budgets

| Failure family | Allowed response |
|---|---|
| Identical command or transport failure | One exact retry after one documented environment correction; then Return Desk |
| One fixture drives candidate repairs | After two repairs, mark it development-only |
| One invariant family keeps failing | At three failures, stop clause/patch growth and redesign the owning layer |
| One layout criterion | After two CSS/screenshot attempts, inspect DOM, measurements, and root cause before another edit |
| Independent review | After two repair/re-review cycles, return to the contract or owning-layer design |
| Prospective evaluation | Zero retries after output exposure; stop, preserve, reclassify, and require a new freeze and eligible set |
| Prompt length | At 80% of a destination limit, add no instruction clause; simplify or enforce mechanically |
| Package size | Above 700 net lines, stop and split before more edits |
| Snapshot mismatch | Never bulk-accept; identify the behavior and version transition first |

## Required return record

```text
returnId:
activePackage:
candidateFingerprint:
state: BLOCKED_USER | BLOCKED_EXTERNAL | BLOCKED_TRANSPORT
failedAcceptanceIds:
exactFailure:
classification:
attemptsAndCorrections:
preservedEvidence:
unchangedProtectedState:
decisionOrArtifactNeeded:
safeOptions:
recommendedOption:
nextActionAfterResolution:
forbiddenActions:
```

Every return names one concrete blocker. If several symptoms share one cause,
consolidate them. If they do not, open separate records rather than describing
the package as generally stuck.

Return records use public identifiers, hashes, issue codes, bounded redacted
descriptions, and references to access-controlled evidence. They never copy
user source text, generated or edited prompt contents, relationship details,
private examples, audio, learning history, credentials, or secret material.

## Mandatory returns

Return instead of guessing when:

- a choice changes product semantics, architecture, privacy, public identity,
  support claims, data collection, or publication scope;
- the exact source/candidate/evidence identity is ambiguous;
- evidence bytes require filesystem, build, transport, or governance
  qualification outside a pure validator;
- a frozen candidate changed after output or review was viewed;
- the same transport remains unqualified after its one corrected retry;
- the next action needs a remote write or a new external permission;
- package ownership overlaps unrelated user work or protected release bytes;
- a requested claim would say code proved human review, linguistic truth,
  privacy of a destination, accessibility not manually inspected, or bytes not
  captured; or
- the line budget or repeated-failure budget is exhausted.

## Forbidden loops

- no repeated repository-wide scan without new bytes or a narrower hypothesis;
- no full browser suite before focused semantic/unit checks pass;
- no rerun of an unchanged failure merely to see whether it clears;
- no prompt clause appended to repair a structural invariant;
- no screenshot styling without an acceptance ID and measured delta;
- no snapshot update before semantic review;
- no development use or relabeling of prospective cases;
- no continuation after a prospective failure;
- no package regeneration to repair extraction or transport;
- no self-review described as independent;
- no qualification package that also repairs its candidate; and
- no later-gate implementation before the current gate's exit evidence passes.

## Resume rule

Resume only when the named decision or artifact exists. Re-baseline the exact
candidate, preserve the original return record, reset only the retry counter
whose cause was resolved, and perform the exact next action recorded there.
Time passing, a new session, or a different agent does not reset a retry budget.
