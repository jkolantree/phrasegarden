# PhraseGarden release traceability

Status: active matrix
Updated: 2026-08-18

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
Checkpoint `70858f1c4157af3340cea6c95f50cf9fd387ffbf` preserves the exact
six-path repair after that independent PASS. It is not a source freeze or
publication qualification.

### Generic language cohort 1

Source: ADR-030 and `GENERIC-LANGUAGE-COHORT-1.md`. Registry
`2026-08-17.1` is 1,203 UTF-8/LF bytes with SHA-256
`498C0F6963F31E9FF21028F52AAD112F2A04453BF7BB4EFD0521A381ECEAECF5`.
The five new profiles are identity-only development artifacts. Independent
review passed with zero open P1/P2/P3 after 31/31 profile tests, 26/26 compiler
tests, 285/285 full Vitest, both typechecks, Vite build, protected-path and
checksum checks, and all 396 direction/recipe compilations. This proves
deterministic structure and Generic isolation, not linguistic review or
regional adequacy.
Checkpoint `db85ed4a09f2e960ce0f6a31f84844b6e719bdf6` preserves those exact
twelve paths after the independent PASS. It is not a source freeze.

| ID | Outcome and owner | Maximum claim | State / next blocker |
|---|---|---|---|
| `GLC-01` | Registry bytes/version/source/hash agree. | deterministic registry identity | verified / `db85ed4` |
| `GLC-02` | Twelve profiles share exact canonical identity and registry binding. | structural profile validity | verified / `db85ed4` |
| `GLC-03` | Five new NFC autonyms and identity-only `Latn`/`ltr` profiles. | endpoint identity metadata only | verified / `db85ed4` |
| `GLC-04` | Regional, alias, casing, private, extension, and unlisted forms reject. | fail-closed accepted-ID boundary | verified / `db85ed4` |
| `GLC-05` | 396 compilations partition into 6 Preview and 390 Generic. | deterministic tier resolution only | verified / `db85ed4` |
| `GLC-06` | Generic has no pack, review claim, section 6, or endpoint clause. | conservative Generic isolation | verified / `db85ed4` |
| `GLC-07` | Authored versions stay separate; registry provenance advances. | explicit version transition | verified / `db85ed4` |
| `GLC-08` | Domain, samples, releases, checksums, and review evidence stay unchanged. | protected-byte preservation | verified / `db85ed4` |
| `GLC-09` | Old registry refs fail; no alias or silent migration exists. | exact current-registry acceptance | verified / `db85ed4` |
| `GLC-10` | Focused/full/type/build/scan/review gates pass. | local development verification | verified / `db85ed4` |

### Preview 3 beginner-facing journey

Source: ADR-031 and `PREVIEW-3-BEGINNER-JOURNEY.md`. The direct-create flow is
preserved. One authored UI catalog presents all twelve exact identities in
English-name order with autonyms, bidi isolation, native selects, and no
visible codes or flags. The first 1280×720 Generic run preserved a real failure:
the primary action ended 53 px below the viewport. Moving the action directly
after tool choice fixed the interface layer without hiding support or changing
compiler output.

Focused UI copy passed 3/3; full Vitest passed 287/287; both typechecks and the
Vite build passed; all 12 sequential Edge/axe journeys passed. Fresh Generic
Home and Review screenshots at 1280×720 and 320×900 were inspected with no
clipping or page overflow. Copy/download bytes, Generic isolation, exact
direction announcements, and 200%/400%-equivalent reflow passed. Independent
review returned one semantic-language defect: authored English direction names
in Review inherited the selected language tag/direction. English names now use
`lang="en"`/`dir="ltr"`; only the autonym receives its exact language and
direction, with a permanent Italian→German regression. Final handoff review
passed with zero open P1/P2/P3. The exact twelve-path checkpoint remains.

| ID | Outcome and owner | Maximum claim | State / next blocker |
|---|---|---|---|
| `BJ-01`–`BJ-03` | Plain explanation, task-specific tool copy, and modality-specific direction labels. | beginner-facing interface behavior | verified / checkpoint |
| `BJ-04`–`BJ-05` | Exact native option order, names/autonyms, isolation, and English interface identity. | deterministic accessible presentation | verified / checkpoint |
| `BJ-06`–`BJ-08` | Exact Generic explanation, Review direction/tool, and live direction/tier announcements. | visible and announced support context | verified / checkpoint |
| `BJ-09`–`BJ-10` | Named Generic/Preview journeys, regional boundary, copy/download, and no Japanese leakage. | tested browser behavior | verified / checkpoint |
| `BJ-11` | Desktop/mobile screenshots, axe, keyboard, overflow, and reflow checks. | named automated and visual evidence | verified / checkpoint |
| `BJ-12` | Deterministic layers, prompt/provenance snapshots, and historical artifacts stay unchanged. | protected-byte preservation | verified / checkpoint |

### Preview 3 Pages policy

Source: ADR-032 and `PREVIEW-3-PAGES-POLICY.md`. Official major-tag refs were
read once on 2026-08-17. Checkout, setup-node, upload-pages-artifact, and
deploy-pages were lightweight refs at the recorded commits. The pnpm `v4` ref
was annotated; policy pins its peeled commit
`b906affcce14559ad1aafd4ab0e942779e9f58b1`, not tag object `f40ffcd...`.

An invalid scanner result preceded six review returns: loose JSON/input plus
CSP, head, and body-tokenizer/resource families; a blank-line counter reported
665 rather than Git-style net 707. Those bytes are superseded.
The consolidated boundary binds the exact release tree and canonical HTML bytes,
including CSP and local assets; bounded UTF-8 reads and suffix case-folding
preserve all failures. Focused 22/22, archive 20/20, full Vitest 309/309, both
typechecks, build/audit/scans, and nine checksums pass. Independent final review
passed with zero open P1/P2/P3 on this exact checkpoint after an adversarial
canonical-document mutation matrix. No CI or release ran.

| ID | Outcome and owner | Maximum claim | State / next blocker |
|---|---|---|---|
| `PP-01`–`PP-03` | Exact official-ref commits, two main guards, least privilege, two-commit-depth checkout, no persisted credential. | static workflow policy | verified / this checkpoint |
| `PP-04`–`PP-06` | Source/archive checks, exact extraction, audit/browser/audit/upload order, no build, permanent policy scan. | same-byte procedure construction | verified / this checkpoint |
| `PP-07`–`PP-08` | Bounded `lstat`/handle boundary, strict closed JSON, portable paths, exact tree/document/CSP bytes, and adversarial negatives. | deterministic local audit behavior | verified / this checkpoint |
| `PP-09` | Focused 22/22, archive 20/20, full 309/309, type/build/audit/checksum/diff gates and independent mutation review pass. | local development verification | verified / this checkpoint |
| `PP-10` | Product/release bytes and PhraseGarden remote state stay unchanged; source remains unfrozen. | mutation boundary | verified / this checkpoint |

### Release-audit asset order

Source: `PREVIEW-3-RELEASE-AUDIT-ASSET-ORDER.md`. The first mobile-label build
produced `assets/index-DSFT2Fh6.js` before
`assets/index-F3dKZlAp.css` in ASCII order. The audit rejected that valid Vite
shape because it treated sorted positions as file types. Checkpoint `d6cb448`
selects exactly one closed-shape CSS path and one closed-shape JavaScript path
independently while preserving sorted manifests, exact canonical HTML, three
files/four entries, and all resource bounds. Focused 23/23, full 311/311,
archive 20/20, both typechecks, the real JS-first output, and independent
duplicate/missing/extra/case/reference probes pass. This repairs validator
logic; it does not qualify a release build.

| ID | Outcome and owner | Maximum claim | State / next blocker |
|---|---|---|---|
| `AO-01`–`AO-02` | One CSS and one JavaScript path are selected by exact shape and bound into canonical HTML. | deterministic release-audit behavior | verified / `d6cb448` |
| `AO-03`–`AO-04` | JS-first positive plus duplicate, missing, extra, case, and reference negatives. | failure-directed regression coverage | verified / `d6cb448` |
| `AO-05` | Focused/full/archive/type/current-output/diff/review checks pass. | local validator verification | verified / `d6cb448` |

### Mobile select clarity

Source: `PREVIEW-3-MOBILE-SELECT-CLARITY.md`. Exact returned development capture
`1C296CD3D17069AD0DE2FB46CB00256C02A5DEBDB1DB9633C3BECEEE210FCAEC`
showed the endings of `Keep the original tone and formality`
and `Translation first, minimal notes` clipped inside native selects at 320 px.
The first repair, `Translation first · few notes`, still clipped in capture
`57E13F8F2FCB3DE3DA8DF95AAB72032802A4636E981A7E5702322EC314A508A2`;
after two fixture-driven repairs, the screenshot is permanently development-only.
Checkpoint `7fb32c7` uses `Keep original tone` and
`Translation + few notes` for the same exact configuration values. Independent
review of the fresh 159,846-byte, 320×3820 full-page capture from a 320×900
viewport, SHA-256
`EC9A957719EDF1CEAF6FE4816B2D58C00BCAEEF50D7BB056258239D9073A849E`,
found both complete labels readable with no page-boundary clipping, overlap, or
visible overflow. Focused 4/4, full 311/311, dual-typecheck build, identical
pre/post audits, zero domain matches, and 12/12 Edge/axe journeys pass.

| ID | Outcome and owner | Maximum claim | State / next blocker |
|---|---|---|---|
| `MSC-01`–`MSC-02` | Shorter labels preserve exact `preserve`/`concise` values and plain meaning. | interface display copy only | verified / `7fb32c7` |
| `MSC-03` | Fresh full-page 320 px capture shows both values complete and Advanced closed. | named visual development evidence | verified / `7fb32c7` |
| `MSC-04`–`MSC-05` | Exact scope protects prompt behavior; full local and independent review checks pass. | local repair verification | verified / `7fb32c7` |

### Preview 3 claims and accessibility evidence

Source: `PREVIEW-3-CLAIMS-ACCESSIBILITY.md`. Review found two pre-freeze claim
defects: Preview 3 notes still said profiles were unchanged after five
identity-only additions, and accessibility documentation said eleven browser
journeys while source defined twelve. The same review found that the old
`builder-written-mobile-320-closed.png` was not generated by current source and
could not qualify a future candidate. A first package review then returned the
clipped selected values recorded above instead of weakening the visual claim.

The bounded repair names French, German, Italian, Spanish, and
region-unspecified Portuguese only as identity-only Generic profiles, explains
the beginner-facing presentation, corrects the journey count, and describes the
current full-page Written Builder capture from a 320×900 viewport while
Advanced settings are closed. Focused 4/4, full Vitest 311/311, both typechecks,
20/20 archive tests, 23/23 release-audit tests, one development build, identical
pre/post release audits, zero forbidden-domain matches, and 12/12 sequential
Edge/axe journeys pass. The exact final capture and its visual findings are
bound in the mobile-select checkpoint above. This is development evidence, not
the later frozen-source visual qualification. Independent semantic and
UX/accessibility reviews passed the substantive claim/evidence bytes. Only
PROJECT-STATE, TRACEABILITY, and the package contract then changed to record
completion; the final seven-path closure received a separate administrative
rebind.

| ID | Outcome and owner | Maximum claim | State / next blocker |
|---|---|---|---|
| `CA-01`–`CA-03` | Preview 3 profile/registry, five-language Generic, and beginner-presentation claims match current source. | bounded public description | verified / this checkpoint |
| `CA-04`–`CA-06` | Exact 12-journey count plus current inspected full-page closed-Advanced capture from a 320×900 viewport. | named development accessibility evidence | verified / this checkpoint |
| `CA-07` | Exact seven owned paths change only public/evidence documentation. | protected-byte preservation | verified / this checkpoint |
| `CA-08` | Focused/full/type/archive/domain/build/audit/browser/diff and independent review checks pass. | local development verification | verified / this checkpoint |

### Preview 3 deterministic source manifest

Source: ADR-033 and `PREVIEW-3-SOURCE-MANIFEST-AND-PACKAGER.md`. Core checkpoint
`e421e0a3248d9d7c1730929697920f8b757b8792` binds the reviewed contract and
implementation; regression checkpoint
`06cc7cb032ec7798accb8757d10a21df75fcefdb` binds the exact A1a parent and the
permanent synthetic development fixtures. Each checkpoint received independent
semantic and security PASS verdicts on its own exact bytes. The combined local
run passed 16/16 focused
tests within 36/36 Python release tests, 311/311 Vitest, both typechecks, Vite
build, 23/23 release-audit tests, current-dist audit, all nine historical
checksums, the forbidden-domain scan, and diff/cache hygiene. No real source
manifest, release package, remote write, or public evidence was created.

| ID | Outcome and owner | Maximum claim | State / next blocker |
|---|---|---|---|
| `SM-01` | Exact HEAD/tree and every regular source blob bind one closed canonical manifest. | deterministic local source construction | verified / `S` |
| `SM-02` | Rehashed Git objects are authority; index/raw checkout are repeated equality gates under closed ambient inputs. | source-identity procedure | verified / `S` |
| `SM-03` | Dirty state, unsupported modes/paths, indirection, and every fixed budget fail closed. | bounded validator behavior | verified / `S` |
| `SM-04` | Freeze creates exclusively; verify never rewrites; physical-prefix and file-identity drift checks preserve blocking evidence. | quiescent local file boundary | verified / `S` |
| `SM-05` | Focused/full/type/build/release/domain/hygiene checks and exact-byte independent reviews pass. | reviewed local tooling | verified / `S` |

### Preview 3 same-byte package tooling

Source: `PREVIEW-3-SOURCE-MANIFEST-AND-PACKAGER.md`. Core checkpoint
`cc61a60205c04bd34709acb0fa6b071802de0526` deterministically constructs,
stages, verifies, and promotes one schema-1 manifest, canonical stored ZIP, and
exact ledger append. Independent adversarial review returned an external
hardlink mutation, future-path case variants, stage drift, and overclaiming
manifest prose; the repaired exact core received semantic and security PASSes.

Regression checkpoint `7a58f7cff087e49bce73ce827bff7ce8cbbbb11c` permanently preserves those failures as
development-only cases. Its final bytes passed 25/25 focused within 45/45
Python release tests and independent semantic/security review. The unchanged
product baseline passed 311/311 Vitest, both typechecks, Vite build, 23/23
release-audit tests, current-dist audit, nine historical checksums, zero domain
matches, and diff/cache hygiene during this package. Neither checkpoint created
a real source manifest, package, qualification record, or public byte.

The six-document B3 claim-alignment content freeze received independent
semantic and security PASSes on its exact bytes. This completion-only state
update creates no source manifest, package, qualification record, or public
evidence.

| ID | Outcome and owner | Maximum claim | State / next blocker |
|---|---|---|---|
| `PB-01`–`PB-03` | Exact source evidence, committed ignores, three-file dist, canonical manifest/ZIP, and fixed budgets bind one candidate. | deterministic package construction | verified / exact package |
| `PB-04`–`PB-05` | Exclusive stage/finals, single-link one-write ledger append, and pre/post drift barriers retain partial failure evidence. | bounded same-byte promotion | verified / exact package |
| `PB-06` | Synthetic seven-path commit passes the existing archive/package verifier; returned attacks remain regression fixtures. | development compatibility evidence | verified development / actual `P` verifier |
| `PB-07` | Focused/full/release/product/hygiene checks and independent B1/B2 reviews pass. | reviewed local tooling | verified / exact package |

### Preview 3 returned local package

Source `9bc73b96a48d2ca96f0b4460da860afe954a3eb8`, tree
`e6822feef6ef99097e979b6ad2a6da9259e157bd`, and the 27,443-byte source
manifest `A12CE50BCB511E7AFDFF69909F3A502F6EE553C32D9E10A4889AD879139C6FA4`
bind the one qualified build. Its exact archive is 179,217 bytes /
`48C2A6CE0233C1BE66018E4C8A3915040DB5ADCBCFF3C40BA33B534F8E21DAFA`;
its release manifest is 976 bytes /
`A1828D387743903F6DD9ABF18E680E858FC2F6CF1DB194C8065C2F6F277409DC`;
the 1,244-byte appended ledger is
`6623FD24D1DAD70A147B307E64A1807BC5C77C9348FAE28B0CDBD772A0B2C08D`.
The returned release-evidence draft was not committed. The replacement record
below was regenerated from the replacement source and package.

Qualification passed 311/311 Vitest, 45/45 Python release tests, both
typechecks, zero forbidden-domain matches, one build, byte-identical pre/post
audits, 12/12 sequential Edge/axe journeys, 9/9 historical checksums, direct
desktop/320 px closed/open inspection, exact source reverification, and a 3/3
fresh extraction. Independent security and product/language/UX reviews of the
exact source and staged package returned zero open P1/P2/P3. A later exact
seven-path product/language review returned P2: `docs/LIMITATIONS.md` said the
version was “not yet packaged,” which would become false when that candidate
became `P`. The candidate is retained as development/regression evidence only;
it was not committed, published, or deployed. A consolidated audit found the
same temporal-status failure family in README, Product, Publication Manifest,
Release Notes, Accessibility, Privacy, and Project State. The exact twelve-path
`PREVIEW-3-COMMIT-STABLE-CLAIMS` repair owns version-bound wording and permanent
negatives before a new source manifest, qualification, build, and package.

The exact twelve-path repair became replacement source
`58890218721c16e2226d42d6bc6ccd98622ae30c` (`S2`) after its substantive and
state-only reviews returned PASS with zero open P1/P2/P3. Its closed regression
maps every returned timing phrase to one stable positive anchor. The initial
direct deterministic run passed 24/24 focused release-audit tests, 312/312
Vitest tests, both TypeScript configurations, zero forbidden-domain matches,
and diff/cache hygiene. The final source qualification then reran the complete
release boundary described below.

### Preview 3 replacement frozen local package

Replacement source `S2=58890218721c16e2226d42d6bc6ccd98622ae30c`, tree
`802c0952bcaa5855aa47dadb2f423fb34f5150c3`, and the 27,655-byte, 143-file
source manifest
`73629B908E38AF22E8601F6C83D8FEA69EA6DF675DD8D5BD35EE2C04459148E2`
bind the exact source used for the one release build. The build produced the
same distributable bytes as the returned candidate, so the 179,217-byte archive
retains SHA-256
`48C2A6CE0233C1BE66018E4C8A3915040DB5ADCBCFF3C40BA33B534F8E21DAFA`.
The replacement 976-byte release manifest is
`C72862B522305104CC135C00FC31CC47881D8F9DCC6232B77CE027738D9D3B5F`;
the 1,244-byte append-only ledger is
`E65D2D74EF7374B65E12B7898F54D83164093C267B090D0E4E7EC95B578DEA2A`.
The identical archive hash is protected-byte evidence, not reuse of the
returned manifest or ledger.

Qualification on exact `S2` passed 312/312 Vitest, 45/45 Python release tests,
both typechecks, zero forbidden-domain matches, one 53-module build,
byte-identical pre/post release audits, 12/12 sequential Microsoft Edge/axe
journeys, 9/9 historical checksums, source reverification, direct inspection of
the 18 current screenshots, and exact 3/3 staged ZIP binding. Independent
security/release and product/language/UX reviews of the frozen source and staged
package each returned PASS with zero open P1/P2/P3.

The first exact seven-path packaging-evidence candidate was returned because it
incorrectly made remote preflight a condition of local package-commit identity.
The causal repair keeps `P` local and moves remote preflight after `P`, before
publication confirmation. Both independent reviewers returned PASS with zero
open P1/P2/P3 on the repaired seven-content fingerprint
`16CC7104E4BE9CA7ACBBA09027768280645280E3D98EE2D1D1878E9780C0AE66`,
defined as SHA-256 over the sorted seven `path|SHA-256` UTF-8/LF lines. This
administrative closure changes only Project State, Traceability, the release
evidence, and the publication contract; those final state-only bytes require a
narrow zero-finding rebind before staging.

The archive, replacement manifest, and appended ledger are promoted only to
the local release paths. The containing seven-path commit qualifies as package
commit `P` only if its exact bytes receive the required precommit review, its
sole parent is `S2`, its changed paths match the closed allowlist, and the
packaging-commit verifier passes. This section makes no claim that a push, tag,
GitHub prerelease, Pages deployment, or public verification has occurred.

### Commit-stable claims acceptance

| ID | Outcome and owner | Maximum claim | State / next blocker |
|---|---|---|---|
| `CSC-01` | Public wording owner: `README.md`, `docs/ACCESSIBILITY.md`, `docs/LIMITATIONS.md`, `docs/PRIVACY.md`, `docs/PRODUCT.md`, `docs/PROJECT-STATE.md`, `docs/PUBLICATION-MANIFEST.md`, and `docs/RELEASE-NOTES.md` remove the captured timing-dependent release claims. | commit- and publication-stable documentation | verified / `S2` |
| `CSC-02` | Release-state owner: the same public documents delegate package, publication, and deployment status to version-bound evidence and corresponding public state. | claim-authority separation | verified / `S2` |
| `CSC-03` | Interpreter owner: `docs/LIMITATIONS.md` and `docs/RELEASE-NOTES.md` separate product-code review from package, publication, deployment, and linguistic-review evidence. | bounded Interpreter claim | verified / `S2` |
| `CSC-04` | Regression owner: `tests/release/release-audit.test.ts` preserves every exact returned phrase and requires the positive version-bound replacements. | deterministic documentation regression | verified / 24/24 focused and 312/312 full |
| `CSC-05` | Protected-byte owner: the replacement source manifest and one build must show no product, prompt, language, support, runtime, or distributable-byte change. | exact nonbehavior-change evidence | verified / source manifest and byte-identical build |
| `CSC-06` | Qualification owner: the contract requires full deterministic, type, Python, audit, browser, source-reverify, package, and independent-review evidence on the replacement source. | reviewed replacement source/package | verified / exact `S2` qualification and two PASSes |

### Preview 3 acceptance

| ID | Outcome and owner | Maximum claim | State / next blocker |
|---|---|---|---|
| `P3-01` | Package, README, notes, and public inventory use `0.1.0-preview.3`; authored artifact versions remain unchanged while registry version/hash/provenance advances. | prerelease identity only | verified / `S2` |
| `P3-02` | `preview.spec.ts` adds Written/Voice Advanced-open axe, Voice Review axe, and 320 px Voice-open overflow coverage. | named automated accessibility evidence | verified / 12/12 exact-source run |
| `P3-03` | Full deterministic, type, domain, one-build, audit, and sequential browser checks bind one clean source commit. | local source qualification | verified / exact `S2` qualification |
| `P3-04` | Desktop and 320 px closed/open screenshots receive direct visual inspection. | named viewport evidence | verified / 18 exact-source screenshots |
| `P3-05` | ZIP, manifest, original `dist`, and fresh extraction match exactly. | local release-byte identity | verified / exact replacement package |
| `P3-06` | Pages verifies and deploys the checked-in ZIP without rebuilding. | same-byte deployment procedure | implementation verified; Preview 3 execution returned before upload/deploy |
| `P3-07` | `SHA256SUMS` preserves nine old targets and adds exactly two required Preview 3 targets; missing/mismatched bindings fail closed. | local checksum-ledger enforcement | verified / exact append-only ledger |
| `P3-08` | Independent frozen-source and package review has zero open P1/P2/P3. | reviewed local package | verified source/package and repaired seven-content / final closure rebind, then `P` verifier |
| `P3-09` | Confirmed main, tag, prerelease assets, and Pages target receive exact authorized bytes. | remote publication identity | partial: main/tag/release assets exact; Pages deploy skipped after browser failure |
| `P3-10` | Unauthenticated asset and Pages downloads match every local length/hash. | captured public-byte identity | partial: 3/3 final release assets exact; no Preview 3 Pages deployment to qualify |
| `P3-11` | Named production product, accessibility, privacy, CSP, and runtime-request smoke journeys pass. | production checks on named matrix | returned: Linux Chromium Generic Home action bottom `728.9375 > 720`; production smoke not reached |
| `P3-12` | Preview 2 remains immutable rollback; stronger completion/review claims remain absent. | bounded prerelease claim | verified: Preview 3 remains prerelease and Preview 2 rollback identity unchanged |

### Preview 4 desktop-fold correction

Preview 3 publication evidence is recorded separately in
`docs/evidence/releases/0.1.0-preview.3-publication.md`. The failed input,
observation, and historical record are permanent development/regression
evidence. The product may be repaired against that evidence, but later success
cannot serve as untouched or independent release evidence.

| ID | Outcome and owner | Maximum claim | State / next blocker |
|---|---|---|---|
| `P4-FOLD-01` | Short, wide Home-layout owner: `src/ui/styles.css` reserves at least 24 CSS pixels below the Generic primary action at `1280 x 720`. | development layout behavior | verified locally: 48.78125 px Edge headroom / exact-byte review |
| `P4-FOLD-02` | Regression owner: the publication record preserves exact `728.9375 > 720`; `tests/e2e/preview.spec.ts` retains the original at-or-above-fold assertion and adds a separate 24 px safety invariant. | permanent failure plus development regression coverage | verified locally / exact-byte review |
| `P4-FOLD-03` | Default Preview and Interpreter desktop states retain their existing fold assertions. | named desktop browser coverage | verified / 12/12 local Edge/axe |
| `P4-FOLD-04` | Mobile, keyboard, bidi, reduced-motion, zoom/reflow, and axe journeys remain enabled. | named browser/accessibility coverage | verified / 12/12 local Edge/axe |
| `P4-FOLD-05` | No compiler, prompt, language, tier, privacy, public identity, or existing Preview 1–3 archive, manifest, ledger-prefix, tag, or public-asset bytes change in this package. Future Preview 4 distributable bytes are intentionally not claimed unchanged. | bounded development correction | verified / exact seven-path diff and immutable public identities |
| `P4-FOLD-06` | The prior substantive seven-path freeze, including the public-state transition regression, receives independent UI and release review; the current Project/Trace state-only closure inherits no substantive verdict and is bound only by a separate administrative rebind. | reviewed development checkpoint | verified / two substantive PASSes plus separate administrative rebind, zero open P1/P2/P3 |

### Preview 4 closed release tooling

Source: ADR-035 and `PREVIEW-4-RELEASE-TOOLING.md`. The fixed local
candidate extracts one shared engine, retains a pinned Preview 3 adapter, and
adds a pinned Preview 4 adapter with committed-version and predecessor-ledger
bindings. Synthetic fixtures are development/regression evidence only.

| ID | Deterministic owner | State / next blocker |
|---|---|---|
| `P4-RT-01`–`P4-RT-07` | Shared engine, closed specs, adapters, and cross-version negatives. | six unchanged substantive files retain exact-byte PASS |
| `P4-RT-08` | Full gates, exact accounting, and independent frozen-byte review. | checkpoint `c245244400858d759176b4d0679c343b700a5fde` |

### Preview 4 archive-verifier foundation

Source: ADR-036 and `PREVIEW-4-ARCHIVE-VERIFIER.md`. Pinned adapters select closed
specs; generic extraction stays nonqualifying. Three Git-boundary returns caused
one consolidated bounded typed-object/path redesign with P3 differentials.
Fixtures are regression evidence only.

| ID | Deterministic owner | State / next blocker |
|---|---|---|
| `P4-AV-01`–`P4-AV-04` | Pinned adapters, raw manifest/argument identity, and Preview 3 differentials. | checkpoint `3fc477d86e66dbfcf3485b71beccfcadfb9a7291` |
| `P4-AV-05`–`P4-AV-07` | Exact child, physical typed Git objects/paths, Preview 4 source version, ledger, predecessor, and append. | checkpoint `3fc477d86e66dbfcf3485b71beccfcadfb9a7291` |
| `P4-AV-08`–`P4-AV-12` | Existing archive/resource boundary, compatibility consumers, hostile Git negatives, and bounded claims. | two substantive PASSes plus separate administrative rebind; net 639 |

### Preview 4 Pages selector

Source: ADR-037 and `PREVIEW-4-PAGES-SELECTOR.md`. The local candidate pins
Pages to the Preview 4 adapter and artifact identity while retaining Preview 3
artifact paths only as monitored predecessor dependencies. Static policy is not
workflow execution or deployment evidence.

| ID | Deterministic owner | State / next blocker |
|---|---|---|
| `P4-PS-01`–`P4-PS-03` | Exact Preview 4 adapter, archive, manifest, command/package-script allowlists, audits, and no-build order. | four unchanged substantive files retain two exact-byte PASSes |
| `P4-PS-04`–`P4-PS-07` | Immutable actions, main-only authority, full non-partial history, exact active/predecessor triggers, and checkpoint order. | 34/34 focused, 322/322 full Vitest, 28/28 within 56/56 Python, dual typechecks |
| `P4-PS-08` | Scope, protected paths, deterministic checks, accounting, independent review, and bounded claims. | checkpoint `93e74f508cad465d0b1652c2ca4478fd62424fb8` |

### Preview 4 source identity

Source: `PREVIEW-4-PUBLICATION.md`. This package advances only the source and
target-release identity. Preview 3 public assets, its failed Pages run, and the
Preview 2 Pages rollback remain separate historical evidence.

| ID | Deterministic owner | State / next blocker |
|---|---|---|
| `P4-SI-01`–`P4-SI-03` | Exact package/source identity, unchanged authored artifacts, and unchanged tier/review limits. | completed locally; `S4` checkpoint eligibility is conditional on exact-hash administrative PASS |
| `P4-SI-04`–`P4-SI-07` | Public-state, accessibility, synthetic-evidence, and pinned-workflow claim separation. | 34/34 focused within 322/322 full Vitest |
| `P4-SI-08`–`P4-SI-10` | Regressions, exact thirteen-path scope, full local gates, two reviews, and no release output. | repaired fingerprint `4C76985A…8293` received product/language/accessibility and release/security PASSes; ten unchanged substantive paths retain them; Project/Trace/contract carry no substantive verdict and become checkpoint-eligible only under separate exact-hash administrative PASS; when satisfied, the next action is the exact `S4` checkpoint; no Preview 4 artifact |
