# PhraseGarden release traceability

Status: active matrix
Updated: 2026-07-24

No acceptance requirement may exist only in narrative prose. Each active
package gives every observable requirement one stable ID and one responsible
construction or evidence owner.

## Row contract

Each row records:

- stable requirement ID and exact source;
- sole package/gate owner and plain user-visible outcome;
- construction owner and deterministic validator/checker;
- automated test or named manual evidence;
- prompt effect/rendering key when applicable;
- privacy class: stored, shared, omitted, transmitted, or not applicable;
- maximum release claim permitted by the evidence;
- candidate fingerprint or immutable evidence reference;
- failure family and repair count;
- state: `open`, `implemented`, `verified`, `qualified`, or `returned`; and
- exactly one next known blocker while not qualified.

Development and regression fixtures can verify known behavior but cannot be
relabeled as prospective evidence.

## Process-control package

Binding `PC-CORE-1` is the exact product parent
`c2e6104e3b47ef180d5e27da5147d31b59ee4ebf` plus the canonical process-core
manifest SHA-256 recorded below. The core covers ADR-026, the workflow, Return
Desk, three evidence ledgers, and the package contract. The administrative
cursor and this matrix are bound by the independent full-path review
fingerprint recorded at handoff; they are not included in their own hash.

Build each `PC-CORE-N` manifest from this exact ordered path list:

```text
docs/DECISIONS.md
docs/RELEASE-WORKFLOW.md
docs/RETURN-DESK.md
docs/evidence/candidates/gate-3-interpreter.md
docs/evidence/releases/0.1.0-preview.1.md
docs/evidence/releases/0.1.0-preview.2.md
docs/work-packages/NEXT-RELEASE-PROCESS-CONTROLS.md
```

For each path, hash its direct filesystem bytes with SHA-256, format the byte
length as unpadded decimal and the digest as 64 uppercase hexadecimal
characters, then emit
`path<TAB>byte-length<TAB>SHA-256<LF>`. Concatenate in the listed order as UTF-8
without BOM or CR, including exactly one terminal LF. `PC-CORE-N` is the
uppercase SHA-256 of those manifest bytes.

`PC-CORE-1`: `695EC067F5F31E99E31B15AC6CBCA93CE899E7F1DE65746214BDC65617581AE3`

Independent receipt: PASS with no open P1/P2/P3 on the exact nine-path
pre-receipt fingerprint
`614C99D1D2B7094691D839F12127D0D942540FE2B15C28EF16702BCE06F16237`.
This paragraph and the state transitions below are the administrative receipt;
they do not claim inclusion in the cited fingerprint or alter `PC-CORE-1`.

The first complete cached diff check then failed closed on Markdown trailing
spaces in six added status lines. `PC-CORE-2` removes exactly two trailing
ASCII spaces from each affected core status line in `RELEASE-WORKFLOW.md`,
`RETURN-DESK.md`, and the three evidence ledgers; no other core byte changes.
The same two-byte formatting correction in this matrix is outside the core.
`PC-CORE-1` remains the independently reviewed semantic input and is not
reinterpreted.

`PC-CORE-2`: `BAAB01174082D20C7D4357E06F3695265CAD08DD9954ED16CBA9DA0AA2515887`

Transport receipt: PASS on exact staged paths with cached diff fingerprint
`2f48a5e3bf4423140ffa68bf4e564618dfe01122` and full pre-receipt manifest
`A6DAF481CF2D57413E7666EBDCE37C0C1FB7ADEB29642A7906EDAA2A29948966`.
All five affected core blobs reconstructed their exact `PC-CORE-1` lengths and
hashes by restoring only the ten removed ASCII spaces. The semantic PASS
therefore transfers only across that proven formatting delta.

| ID | Source and outcome | Owner and check | Privacy / maximum claim | Binding; failure / repair | State / next blocker |
|---|---|---|---|---|---|
| `PC-01` | Contract: one exact resume cursor | `PROJECT-STATE.md`; 10-field scan | `not applicable`; cursor completeness only | `PC-CORE-2` + receipts; process/review 2 | verified / none |
| `PC-02` | Contract: old proof remains findable | three ledgers; old/new immutable-ID and claim review | `not applicable`; preservation only | `PC-CORE-2`; evidence-loss 0 | verified / none |
| `PC-03` | Contract: bounded packages and fail-closed checkpoints | workflow; procedure and staged-allowlist review | `not applicable`; process definition only | `PC-CORE-2`; process/review 1 | verified / none |
| `PC-04` | Contract: activity cannot masquerade as progress | workflow; state/progress review | `not applicable`; operational definition only | `PC-CORE-2`; process 0 | verified / none |
| `PC-05` | Contract: repeated failures return with evidence | Return Desk; retry/mandatory-return scan | `omitted`; Return Desk records exclude private source text | `PC-CORE-2`; process 0 | verified / none |
| `PC-06` | Contract: frozen/prospective evidence fails closed | evaluation + workflow; mutation/prospective review | `not applicable`; no evaluation-result claim | `PC-CORE-2`; evaluation 0 | verified / none |
| `PC-07` | Contract: CI write and publication need separate authority | workflow; authorization-boundary review | `not applicable`; no authority granted | `PC-CORE-2`; authority 0 | verified / none |
| `PC-08` | Contract: first-worker rollback covers controlled clients | workflow; eight-transition review | `not applicable`; required future test contract only | `PC-CORE-2`; offline 0 | verified / none |
| `PC-09` | Contract: promote and recapture the same bytes | workflow; build/public-byte boundary review | `transmitted`; future public artifacts only, exact-byte procedure only | `PC-CORE-2`; transport 0 | verified / none |
| `PC-10` | Contract: nine documentation paths only | contract + Git; exact path/protected diff | `not applicable`; documentation-only scope | `PC-CORE-2`; scope 0 | verified / none |

These rows may become `verified` only after the package checks pass, and
`qualified` only if a later release protocol explicitly requires and provides
that stronger evidence.

## `G3.5` Advanced disclosure

Source: `PRODUCT.md` primary journey, `RECIPE-SCHEMA.md` existing settings,
`DESIGN-CONTRACT.md` Builder disclosure, ADR-024, ADR-025, and the user's
approved UI-only interpretation.

| ID | User outcome | Owner/check | Privacy | Maximum claim | State / next blocker |
|---|---|---|---|---|---|
| `G3-ADV-01` | Optional complexity is behind one native `Advanced settings` disclosure. | `src/app/App.tsx`; UI/keyboard test | `not applicable` | progressive disclosure exists | open / package contract |
| `G3-ADV-02` | Relationship, register, and the selected tool's core controls stay visible. | field map; modality UI test | `omitted` from persistence/sharing; memory-only | common choices remain immediately available | open / package contract |
| `G3-ADV-03` | Hierarchy is advanced for every modality. | field map; modality UI test | `omitted` from persistence/sharing; memory-only | hierarchy is optional and hidden initially | open / package contract |
| `G3-ADV-04` | Ambiguity and name/title behavior are advanced only where applicable. | field map; Written/Voice/Interpreter matrix | `omitted` from persistence/sharing; memory-only | irrelevant controls are absent | open / package contract |
| `G3-ADV-05` | Voice destination capabilities are advanced and never imply detection. | Voice-only field map; copy test | `omitted` from persistence/sharing; memory-only | user declarations only | open / package contract |
| `G3-ADV-06` | Opening or closing the disclosure cannot change effective settings. | normalized-config equality test | `omitted` from persistence/sharing; memory-only | UI organization only | open / package contract |
| `G3-ADV-07` | Direct and Builder paths produce identical prompt, summary, warnings, and provenance for identical settings. | artifact byte/equality tests | `omitted` from network transmission | deterministic equivalence | open / package contract |
| `G3-ADV-08` | No enum, clause, rendering, prompt text, summary semantics, or artifact version changes. | protected semantic-path diff and snapshots | `not applicable` | no product-semantics change | open / package contract |
| `G3-ADV-09` | Disclosure works by keyboard, screen reader semantics, 320 px, and 200%/400% reflow. | native-details test, axe, manual viewport checks | `not applicable` | tested accessibility on named matrix only | open / package contract |

The package must fill exact test names, candidate fingerprint, repair counts,
and evidence references before handoff.
