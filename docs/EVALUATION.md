# PhraseGarden evaluation contract

Status: Gate 0 source of truth  
Updated: 2026-07-23

## Evidence boundaries

Deterministic tests prove compiler construction, not downstream translation quality. Model or host trials can provide controlled release evidence, but are never part of the shipped static application. Passing development fixtures shows repaired known behavior; it is not independent or prospective evidence.

Use `current candidate` and `next known blocker` until a frozen candidate passes its predetermined protocol. Reserve `final`, `complete`, and `release-ready` for that state.

## Invariant matrix

| Requirement | Construction | Validator/checker | Test/UI | Prompt or semantic evidence |
|---|---|---|---|---|
| Same frozen inputs produce same bytes | Pure compiler; canonical UTF-8/LF | Ban ambient time/random/browser/network | repeat/property and snapshot tests | not a model claim |
| One canonical language identity | Pinned bundled registry; `profile.id === profile.bcp47` | exact version/hash/casing/membership; reject aliases, grandfathered/private-use/extension/unlisted forms | profile/config/pair/share/provenance fixtures plus hostile-locale repeat | not a model claim |
| Review evidence is structural-only | Separate content-addressed profile/direction bundles | exact path/hash/length/date/scope/candidate/suite/role/reference binding; explicit unqualified assurance | synthetic development negatives and byte-manifest handoff checks | never proves reviewer, human act, truth, publication, or tier |
| Stable section order | Section enum and stable clause IDs | reject unknown/duplicate section IDs | exact snapshots | not a model claim |
| No unresolved variables | Typed rendering parts | reject missing/duplicate rendering key or value path | literal placeholder-lookalikes plus missing-rendering fixtures | not a model claim |
| One conflict interpretation | Authority and single owner per semantic key | reject equal-authority conflict/repetition | precedence matrix tests | downstream prompt contains winning rule once |
| Prompt budget | deterministic UTF-8 byte count | warn >9,000; reject >12,000 or >80% known limit | boundary tests | simplify before adding clauses |
| Honest support tier | exact directed-pack resolution; separate later evidence promotion | reject caller claims; one exact pack → Preview, none → Generic, multiple → error | tier/provenance snapshots and UI text | Preview states external review incomplete; no parity claim |
| Generic isolation | identity labels only; no profile/pair linguistic clause | reject profile/pair linguistic origins | origin-aware snapshots, including Japanese endpoint | no Japanese-specific or other endpoint guidance |
| Preserve meaning/social force | invariant clauses once | preferences cannot disable them | behavior summary agreement | flagship semantic cases |
| No invented social facts | explicit `unspecified` values | reject inferred/defaulted facts | configuration matrix | ambiguity/referent/register cases |
| Source remains data | next-turn/source role contract | reject invalid boundary | quoted/fenced/prompt-like cases | adversarial downstream trial |
| Voice is not visual-only | semantic control clauses | reject layout-only control | prompt scan; screenless turn scripts | host/model voice qualification |
| Pronunciation evidence is honest | capability-conditional clause | transcript/unknown warning | result/summary snapshots | no heard/accent claim without audio |
| Summary matches behavior | summary items from normalized config | missing locale item is error | locale snapshots and UI inspection | not independently rewritten |
| Provenance is complete | compiler emits all version records | missing/false tier/date is error | prompt/download snapshots | artifact hashes verify bytes |
| Sharing excludes sensitive data | allowlist serializer | reject unknown/oversized fields | fragment privacy tests | not a model claim |

Mechanically enforceable properties belong in construction, validation, tests, or UI. Prompt prose is used only where a downstream language model must behave semantically.

## Deterministic suite

Gate 2 must include:

- Frozen-input byte equality across repeated calls and supported runtimes.
- Exact registry source-byte hash, deep immutability, version/hash mismatch, canonical casing, deprecated alias, grandfathered/private-use/extension rejection, language-script-region acceptance, pair-reference agreement, and hostile `Intl`/locale/time-zone repeat tests.
- Review evidence path, hash, byte-length, real-date, candidate, suite, direction, bundle-local reference, role, Community/Reviewed/Flagship structure, and structural-only assurance matrices.
- Every section and precedence combination, including equal-authority rejection.
- Duplicate clause ID and semantic-key rejection.
- Placeholder-like literal source remains literal; missing rendering keys and value paths fail.
- Limitation condition, duplicate-code/order, missing-rendering, stable-order, and exactly-once section-9 cases.
- Validation issues ordered by the fixed eight-stage ordinal table, then exact code and data-path order, independent of locale.
- Boundary values at 9,000 and 12,000 UTF-8 bytes.
- Exact provenance for flagship, reverse flagship, and generic no-pack results.
- Generic pairs with Japanese as one endpoint proving that identity labels remain while every Japanese/profile and EN↔JA/pair linguistic clause is absent.
- Summary-item agreement with normalized configuration and warnings.
- Transcript/unknown/audio capability matrices.
- Quoted, fenced, bidi, combining-mark, astral, CRLF, and delimiter-looking input.
- A compiler-network test that makes network globals throw and a dependency check that keeps browser/network imports out of `src/domain`.

Compiler fixtures and snapshots are versioned development evidence. A snapshot update needs an explained behavior change; bulk acceptance is not review.

## Flagship danger suite

The initial exact definitions are in `fixtures/EN-JA-ACCEPTANCE.md`; their separate current-state record is `fixtures/PROVENANCE-LEDGER.md`. The definitions cover both directions across the suite and include:

- negation and scope;
- consent and refusal boundaries;
- certainty, conjecture, and hearsay;
- ambiguous or omitted referents;
- register and explicitly supplied hierarchy;
- honorific/title preservation;
- unknown name readings;
- dates, numbers, addresses, era notation, and time zones;
- slang, sarcasm, affection, anger, and profanity;
- intentional code-switching;
- prompt-like quoted/fenced source;
- transcript-only pronunciation limits; and
- separate voice interruption, silence, repeat, and slower turns.

Each row names exact stimulus, configuration delta, must/must-not outcomes, expected deterministic evidence, and responsible layer. These cases are public development fixtures, never holdouts.

## Fixture definitions and provenance ledger

Fixture definition bytes and provenance state are separate artifacts:

- An immutable definition file stores exact UTF-8 stimulus/context bytes and normalization policy; direction, modality, version-pinned configuration/capabilities, exact ordered turns, expected/prohibited outcomes, coverage owners, criticality, review applicability, and support applicability. A contained base/patch registry is valid only when its merge rule, complete bases, exact patches, IDs, and versions are all inside the same hashed definition artifact.
- Its SHA-256 is the permanent identifier for that `(fixtureId, revision)` definition. A change creates a new revision/file; it never overwrites prior bytes.
- A separate append-only ledger stores definition hash, origin, author/custodian, date, license/PII assertion, state transitions, derivations/influence, prospective eligibility, and eligibility evidence.
- Current state is derived from the highest valid ledger sequence. It is not stored inside or allowed to change the definition hash.
- Run records are a third artifact and carry the observed failure classification, frozen candidate, raw evidence, and result.

Allowed current states are exactly:

1. `untouched holdout`
2. `prospective evaluation`
3. `exposed`
4. `development`
5. `regression`
6. `transport qualification`
7. `contaminated`
8. `unknown provenance`

The user's list says “every fixture” and supplies these eight distinct labels; no ninth label may be invented. A fixture without adequate records defaults to `unknown provenance`.

State/history rules:

- `untouched holdout` requires recorded custody and non-exposure evidence. Builders cannot inspect its content.
- Selection under a frozen predeclared protocol changes it to `prospective evaluation`.
- Once its content/output is inspected or it influences a candidate, builder, validator, test, fixture, rubric, or scorer, it can never become untouched again. The run history remains evidence after the current state becomes `exposed`.
- A failure converted into a permanent negative case becomes `regression`; other repair-driving cases become `development`.
- `transport qualification` proves mechanics only. `contaminated` records a broken independence claim. Neither supports product quality.
- Definitions never overwrite prior revisions. Ledger transitions append sequence, actor, timestamp, reason, prior/new state, influence, and definition hash.
- Every Gate 0 fixture starts `development`, because its content shapes these contracts.

## Failure-directed development

For every observed failure:

1. Save exact input, output, configuration, versions, and raw evidence.
2. Classify it as `compiler`, `recipe`, `language-profile`, `pair-pack`, `model-behavior`, `interface`, `accessibility`, or `unsupported-capability`.
3. Add or revise an immutable negative/regression fixture.
4. Change only the smallest responsible layer named by the invariant matrix.
5. Run the fixed deterministic suite, then the relevant semantic development suite.
6. Preserve the negative fixture permanently.

After two candidate repairs driven by one fixture, it is development-only. After three failures in one invariant family, stop clause patching and perform a consolidated root-cause redesign. If instructions exceed 80% of a declared platform limit, simplify or move mechanical duties into code before adding rules.

Acceptance criteria, negative fixtures, validators, Return Desk behavior, rubrics, and thresholds never weaken merely to obtain a pass.

### Return Desk

The Return Desk is the fail-closed quarantine for a run or artifact that cannot advance: validation failure, provenance mismatch, critical semantic failure, incomplete capture, transport/extraction/decode failure, or scoring parse failure. It preserves original bytes/hashes, stage, reason, logs, and operator action; marks the result invalid or failed; and blocks promotion. It never silently repairs, regenerates, rescales, discards, or resumes the same frozen prospective run. A repair starts a development cycle and, when applicable, a new freeze.

## Prospective evaluation protocol

Before any prospective output is generated:

1. Freeze and SHA-256 hash the exact bytes for the canonical-language registry, prompt surfaces/instructions, compiler and compiler policy, profiles, pair packs, recipe definitions, summary locale catalogs, builder, validator, tests, all selected fixture definitions, the ledger eligibility snapshot, scoring rubric, scorer implementation/configuration, and model/host settings.
2. Record candidate/freeze IDs, eligible cases and selection method, trial counts, execution order, session-isolation rule, transport procedure, platform, pass criteria, critical failures, and stopping rule.
3. Prove every selected case was an eligible untouched holdout before selection. Public or development cases are ineligible.
4. Qualify upload, clean-session isolation, artifact capture, and scoring sequentially with transport-only cases.
5. Execute strict cases sequentially until those mechanics are stable; parallelism is then allowed only as predeclared.
6. Make no frozen-component change after viewing the first prospective output.

Any prospective failure stops the frozen run immediately. Preserve complete evidence, expose/reclassify the consumed cases, return to development, and require a new candidate freeze plus a new eligible prospective set. Never patch and continue consuming the same set.

Any external/paid model, host, upload, or scoring run also requires explicit user confirmation after naming provider, transmitted data class, retention/privacy terms known to the project, expected cost, and stopping budget. Gate 0 performs no such run.

## Scoring independence

Each scored run records:

- scorer implementation or model and exact version;
- full configuration and model settings;
- frozen rubric bytes/hash;
- all context supplied to the scorer;
- whether candidate repair history was hidden;
- complete raw scorer input/output and parsing result.

“Independent” is an evidence claim. A scorer that saw repair history, shares mutable prompt components, or lacks a frozen rubric is labeled accordingly. Human review records reviewer role, language competence, conflicts, instructions, and raw judgments.

Critical failures include reversed negation or consent, invented consent/referent/hierarchy/certainty, unsafe source-instruction execution, false pronunciation assessment, false tier/provenance, or failure to stop the prospective protocol.

## Artifact and transport evidence

Prefer direct filesystem or downloadable bytes and hash them locally. Record these stages separately:

1. generation;
2. UI download;
3. transport/upload;
4. extraction;
5. decoding;
6. local verification;
7. scoring.

A visible filename, UI label, or model statement is a claim, not byte evidence. Base64 verifies the exported payload after decoding but does not independently prove UI download-byte identity. A transport retry may re-extract a frozen artifact; it may not regenerate it.

Canonical prompt, clipboard, and download equivalence requires captured bytes from each applicable path. Packaging checks use exact release bytes, checksums, extraction, and rendered/readable inspection where relevant.

## Accessibility, internationalization, privacy, and release checks

Automated browser checks use Playwright plus axe, followed by manual evidence:

- keyboard-only completion and visible focus;
- named controls, headings, status announcements, and screen-reader completion;
- narrow mobile, 200%, and 400% zoom/reflow;
- English/Japanese `lang`, bidi isolation, CJK breaks, ruby fallback, grapheme/combining safety, and IME composition;
- reduced motion and non-color tier/warning communication;
- prompt inspection/edit/copy/download without a pointer.

Privacy/release checks assert no backend/runtime model dependency, third-party resource, tracker, beacon, WebSocket, unintended fetch, sensitive share-fragment field, unsafe import rendering, release source map, local path, or identifying asset metadata. Cold durable offline is tested only after Gate 5; Gate 3 tests a loaded session after network loss.

## Gate evidence

| Gate | Minimum evidence before exit |
|---|---|
| 0 | Contract cross-check; every fixture expressible; one composition interpretation; no hidden requirement |
| 1 | Exactly three coherent visual directions; user selection; one resulting design contract |
| 2 | Domain unit/snapshot suite and all required compiler checks |
| 3 | Ordered slice tests plus manual mobile, keyboard, screen-reader, 200%, and loaded-offline journeys |
| 4 | Storage/import/export/download/fragment round trips and privacy allowlist checks |
| 5 | Full accessibility, durable offline, CSP, request, asset, metadata, and release-output inspection |
| 6 | Frozen candidate protocol, bundle/checksum/license/governance/release-note checks; publication still requires confirmation |

No gate is complete because files exist or a build succeeds. Evidence, known gaps, and `PROJECT-STATE.md` must be current.

## Change reporting

Every evaluation handoff reports separately: product behavior; prompt/instruction; deterministic builder; validator/checker; tests; evaluation fixtures; scoring rubric; packaging; evidence transport.
