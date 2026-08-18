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

`G3-ADV-BASE-1` is product/process checkpoint
`e29342674c28b80be9cbc894abd2e5df17a7a1b1` with baseline SHA-256
`9D316789A241142C827D9583718A1D60B2201CE7F33FBCA4E68B435A4D9BF9CF`
for `App.tsx`,
`4E83A9651684CB3DE68D21A65D45F1E2E07824DC4C810E0D6F7266C9289F1166`
for `styles.css`, and
`31C99D5A4CA213EFED79EB6208173D8D897D79CCAEF28AC84DEDFF3464C8044E`
for `preview.spec.ts`. Nineteen existing field IDs were unique and protected
semantic paths had zero diff.

`G3-ADV-CORE-1` is the exact ordered manifest below. Each line is
`path<TAB>byte-length<TAB>uppercase-SHA-256<LF>`; the concatenated manifest is
UTF-8 without BOM or CR and has one terminal LF.

```text
docs/DECISIONS.md	32009	3F51E61A40E804950623E14AD71F179DAEC937AE40C61DC5268D1CDF64B92914
docs/work-packages/GATE-3-ADVANCED-DISCLOSURE.md	5290	36165FD0E8638F5CAFB4E77AB8ED7A54CE6DC0383639797842E2D4465638CFFF
src/app/App.tsx	61853	C486C3B15990827EB3FFE2511FAE895405CED3497EB33AAC9DA3A05AD8A90417
src/ui/styles.css	23700	7F1602DC13494CDD69919FEA28F80F0B465743C01D728451250C5B80C2465B13
tests/e2e/preview.spec.ts	37570	F98CCB83EE9FD3E51EBB783D9044B9B588460DAD12ACF76A7949E59474235893
```

Manifest SHA-256:
`3E215A0645702168EFC3D10D05F1B071B9DD11E18167243DAD550CABF78B2423`.
`PROJECT-STATE.md` and this matrix are administrative receipts outside that
core so they can report its evidence without a self-hash claim.

Independent review of `G3-ADV-CORE-1` passed the implementation, focused
browser cases, 277/277 Vitest, both typechecks, build/audit, scope, and
protected-path checks, but withheld its verdict for one P3 contract failure:
the package source list omitted governing ADR-027. `G3-ADV-CORE-2` changes only
that line by adding ADR-027; it does not reinterpret the failed review.

```text
docs/DECISIONS.md	32009	3F51E61A40E804950623E14AD71F179DAEC937AE40C61DC5268D1CDF64B92914
docs/work-packages/GATE-3-ADVANCED-DISCLOSURE.md	5299	3011832DDCAA4E1BFC6D94C1C953845BFA276C13CF30977C6BF9F56AD1EECB17
src/app/App.tsx	61853	C486C3B15990827EB3FFE2511FAE895405CED3497EB33AAC9DA3A05AD8A90417
src/ui/styles.css	23700	7F1602DC13494CDD69919FEA28F80F0B465743C01D728451250C5B80C2465B13
tests/e2e/preview.spec.ts	37570	F98CCB83EE9FD3E51EBB783D9044B9B588460DAD12ACF76A7949E59474235893
```

`G3-ADV-CORE-2` manifest SHA-256:
`6B14FE99E5C91914873564CB6EC039AD437743CD787B4EC08A2BA35A206C0FBB`.

Independent re-review reconstructed `G3-ADV-CORE-1`, proved that all four
non-contract core blobs were identical, and verified the exact one-line source
pointer repair. `G3-ADV-CORE-2` received PASS with zero open P1/P2/P3.
The review also confirmed the seven authorized paths, zero protected-path
diff, and accurate no-release/no-Gate-3-exit claim. This is package-level
verification only; it is not linguistic review or release qualification.

| ID | User outcome | Owner/check | Privacy | Maximum claim | Binding; failure / repair | State / next blocker |
|---|---|---|---|---|---|---|
| `G3-ADV-01` | Optional complexity is behind one native `Advanced settings` disclosure. | `one Advanced settings disclosure exposes the exact modality field map`; keyboard case | `not applicable` | progressive disclosure exists | `G3-ADV-CORE-2`; interface 0 | verified / none |
| `G3-ADV-02` | Relationship, register, and the selected tool's core controls stay visible. | exact three-modality field-map assertions | `omitted` from persistence/sharing; memory-only | common choices remain immediately available | `G3-ADV-CORE-2`; interface 0 | verified / none |
| `G3-ADV-03` | Hierarchy is advanced for every modality. | exact three-modality field-map assertions | `omitted` from persistence/sharing; memory-only | hierarchy is optional and hidden initially | `G3-ADV-CORE-2`; interface 0 | verified / none |
| `G3-ADV-04` | Ambiguity and name/title behavior are advanced only where applicable. | Written/Voice/Interpreter field-map assertions | `omitted` from persistence/sharing; memory-only | irrelevant controls are absent | `G3-ADV-CORE-2`; interface 0 | verified / none |
| `G3-ADV-05` | Voice destination capabilities are advanced and never imply detection. | Voice field-map/default assertions and unchanged explanatory copy | `omitted` from persistence/sharing; memory-only | user declarations only | `G3-ADV-CORE-2`; unsupported-capability 0 | verified / none |
| `G3-ADV-06` | Opening or closing the disclosure cannot change effective settings. | `direct creation and the unchanged optional-settings path compile identical bytes` | `omitted` from persistence/sharing; memory-only | UI organization only | `G3-ADV-CORE-2`; interface 0 | verified / none |
| `G3-ADV-07` | Direct and Builder paths produce identical prompt, summary, warnings, and provenance for identical settings. | full artifact-bundle equality in the direct/Builder test | `omitted` from network transmission | deterministic equivalence | `G3-ADV-CORE-2`; interface 0 | verified / none |
| `G3-ADV-08` | No enum, clause, rendering, prompt text, summary semantics, or artifact version changes. | protected-path diff; 277/277 Vitest snapshots | `not applicable` | no product-semantics change | `G3-ADV-CORE-2`; compiler 0 | verified / none |
| `G3-ADV-09` | Disclosure works by keyboard, screen reader semantics, 320 px, and 200%/400% reflow. | 11/11 sequential Playwright/axe; inspected desktop and 320 px closed/open screenshots | `not applicable` | tested accessibility on named matrix only | `G3-ADV-CORE-2`; accessibility 0 | verified / none |

Gate 3.5 passes its bounded contract. No Gate 3 exit, release, publication,
deployment, or linguistic-review claim follows from this package.

The first local-checkpoint staging request was rejected before execution
because the Codex `.git` write approval service reported its usage limit.
Read-only inspection confirmed zero staged paths and the same exact seven
authorized unstaged paths. This transport blocker does not alter
`G3-ADV-CORE-2` or its independent PASS, but Gate 3 exit remains ineligible
until the local checkpoint succeeds.

Resolution: the user's later explicit release authorization permitted the
same exact seven-path staging request. The containing local commit is the
Gate 3.5 checkpoint; the rejected attempt remains recorded rather than being
silently removed.

## Preview 3 qualification and publication

Source: ADR-028 and
`docs/work-packages/PREVIEW-3-PUBLICATION.md`.

The first source review withheld PASS for one P2: the archive verifier checked
only checksum entries present and did not require the supplied Preview 3 ZIP
and manifest to appear in `SHA256SUMS`. The exact failure is preserved.
Repair 1 requires both exact repository-relative entries and adds permanent
negative tests for missing archive, missing manifest, and mismatched digest.

The repaired combined source review then withheld PASS for one P3 process
failure: 761 net lines exceeded the accepted 700-line stop rule. The work is
therefore split into separately reviewed and checkpointed source-claims and
same-byte-pipeline packages. No acceptance criterion or negative test is
removed.

The first bounded source-claims review then withheld PASS for two P3
documentation-control failures: the umbrella's exact source union omitted
both subpackage contracts, and the bottom resume cursor skipped the required
pipeline checkpoint. Repair 2 corrected only those two controls. Re-review
passed with zero open P1/P2/P3 on exact staged fingerprint
`c4cf32696e838036a3fe80516a481edf0280f430a9d8b680244992aab98bafaf`;
checkpoint `aa75e60040ad2eeb5b55223fa83ff87b71031eaf` preserves the exact 13
reviewed paths.

The pre-stage same-byte audit then returned the pipeline with one P1, four P2,
and three P3 findings: manual dispatch was not main-only; packaging identity
did not constrain one parent and seven paths; the parent checksum ledger could
be deleted; Windows-drive and case-colliding paths were host-dependent;
actions used movable tags; the post-browser audit followed symlinks; archive
decompression was unbounded; and permanent negative coverage was incomplete.
The projected repaired package crossed 700 net lines, so process split 2
creates separately reviewed archive-bindings and Pages-policy checkpoints
without removing an invariant or negative case.

The first archive check batch stopped because bundled `pnpm` could not find
bundled Node; the exact pinned-path rerun passed. Safety/usage controls blocked
a synthetic retry, cache deletion, and remote action-ref read without
workaround. Twelve archive regressions and all nine old checksums passed; the
cache stays unstaged and Pages policy stays blocked on exact action refs.

Checkpoint `83558bd` then preserved those six paths and removed the generated
cache. A later adversarial review superseded the earlier PASS by reproducing
dirty-worktree acceptance plus strict-JSON, path, physical-size, special-mode,
and partial-output failures. ADR-029 and
`PREVIEW-3-ARCHIVE-VERIFIER-REPAIR.md` preserve that return. Two repair reviews
found further resource-bound bypasses; the consolidated repair now caps every
ledger target, sizes the parent Git blob before reading it, streams bounded ZIP
members, binds all seven worktree files to exact `100644` HEAD blobs, and
extracts only after full validation. Its core received an independent PASS
with zero open P1/P2/P3: 20/20 focused tests, 277/277 Vitest, dual typechecks,
Vite build, nine historical checksums, and zero forbidden-domain matches.
This is development verification pending the exact six-path checkpoint, not a
source freeze or publication qualification.

| ID | Outcome and owner | Maximum claim | State / next blocker |
|---|---|---|---|
| `P3-01` | Package, README, notes, and public inventory use `0.1.0-preview.3`; compiler/artifact versions remain unchanged. | prerelease identity only | verified / full source freeze |
| `P3-02` | `preview.spec.ts` adds Written/Voice Advanced-open axe, Voice Review axe, and 320 px Voice-open overflow coverage. | named automated accessibility evidence | verified / full source run |
| `P3-03` | Full deterministic, type, domain, one-build, audit, and sequential browser checks bind one clean source commit. | local source qualification | open / source freeze |
| `P3-04` | Desktop and 320 px closed/open screenshots receive direct visual inspection. | named viewport evidence | open / source freeze |
| `P3-05` | ZIP, manifest, original `dist`, and fresh extraction match exactly. | local release-byte identity | verified implementation / repair checkpoint |
| `P3-06` | Pages verifies and deploys the checked-in ZIP without rebuilding. | same-byte deployment procedure | returned / Pages-policy repair |
| `P3-07` | `SHA256SUMS` preserves nine old targets and adds exactly two required Preview 3 targets; missing/mismatched bindings fail closed. | local checksum-ledger enforcement | verified implementation / repair checkpoint |
| `P3-08` | Independent frozen-source and package review has zero open P1/P2/P3. | reviewed local package | open / review |
| `P3-09` | Confirmed main, tag, prerelease assets, and Pages target receive exact authorized bytes. | remote publication identity | open / exact confirmation |
| `P3-10` | Unauthenticated asset and Pages downloads match every local length/hash. | captured public-byte identity | open / publication |
| `P3-11` | Named production product, accessibility, privacy, CSP, and runtime-request smoke journeys pass. | production checks on named matrix | open / publication |
| `P3-12` | Preview 2 remains immutable rollback; stronger completion/review claims remain absent. | bounded prerelease claim | implemented / final review |
