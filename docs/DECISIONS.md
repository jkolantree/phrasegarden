# PhraseGarden decision records

Status: Gate 0 source of durable decisions  
Updated: 2026-07-24

Changes supersede an ADR by adding a new record and linking both records. Existing rationale is not rewritten.

## ADR-001 — Static deterministic product

Status: Accepted  
Date: 2026-07-23  
Supersedes: none

**Context:** Prompt assembly, summaries, validation, storage, and sharing are mechanically decidable. Runtime model calls would weaken privacy, reproducibility, cost, and offline behavior.

**Decision:** Ship a TypeScript/Vite/Preact static application. The domain compiler is pure and receives all data explicitly. No backend, accounts, telemetry, ads, runtime AI, clock, randomness, storage, browser, or network dependency enters compilation.

**Rationale:** This makes canonical output reviewable, reproducible, portable, private, and testable.

**Consequences:** Translation quality is a property of prompts used in external tools, not a service PhraseGarden performs. Controlled pre-release model evaluation remains development evidence and is excluded from runtime.

## ADR-002 — Language, pair, and support identity are directed

Status: Accepted  
Date: 2026-07-23  
Supersedes: none

**Context:** Review quality and relational advice can differ by direction. Users must not self-assert quality.

**Decision:** A pair is the exact ordered home profile/version → target profile/version. Normalized saved configurations pin those versions. A pack direction repeats the exact endpoint refs and carries one tier-specific review basis. Zero exact packs resolves to `Generic`; multiple exact packs fail; imported/user settings cannot contain a tier claim.

**Rationale:** Directed provenance prevents reverse-direction and equal-quality implications.

**Consequences:** English↔Japanese can use one pack artifact with two independently declared directions. Generic provenance records `pairPack: none`.

## ADR-003 — “Any language pair” means bundled profiles

Status: Accepted  
Date: 2026-07-23  
Supersedes: none

**Context:** Arbitrary typed language names cannot provide canonical identity, autonym, script, direction, version, or honest limitations.

**Decision:** V1 generic generation accepts any two distinct, exact-version profiles in the bundled searchable catalog. A pure materializer pins the catalog manifest's single active version; custom identifiers are later work.

**Rationale:** The claim stays broad enough for generic composition without inventing language metadata.

**Consequences:** Adding a selectable language requires a versioned monolingual profile. Same-profile translation is invalid in V1.

## ADR-004 — Generic isolation forbids endpoint linguistic guidance

Status: Accepted  
Date: 2026-07-23  
Supersedes: none

**Context:** Gate 2 literally requires Generic pairs not to emit Japanese-specific guidance.

**Decision:** Generic composition may render profile identity metadata—ID, name, autonym, direction, and scripts—for labeling. It emits no profile or pair linguistic clause, including Japanese-specific guidance.

**Rationale:** This satisfies the conservative literal boundary and cannot imply endpoint expertise from a catalog entry.

**Consequences:** Generic output is less tailored. Tests reject every profile/pair linguistic origin; a Japanese endpoint does not make a pair reviewed or flagship.

## ADR-005 — Rule ownership, precedence, and conflict rejection

Status: Accepted  
Date: 2026-07-23  
Supersedes: none

**Context:** Concatenated prompt fragments can repeat or contradict rules.

**Decision:** Each clause has a unique ID, typed all-of conditions, origin, authority, numeric section/order, rendering key, effect key/value, and optional refinement link. Selected effects with the same key are repetition (same value) or conflict (different value) and stop compilation. Typed rendering parts have no placeholder grammar. Selected clauses sort by unique `(section, order)`. Known limitations are typed conditional code/order/rendering specs and render exactly once in section 9.

**Rationale:** This creates one interpretation without accidental last-writer-wins behavior.

**Consequences:** Pair packs realize valid choices but never weaken consent, meaning, evidence, or source boundaries. A conflict produces a typed error or bounded-preference warning.

## ADR-006 — Conservative linguistic defaults

Status: Accepted  
Date: 2026-07-23  
Supersedes: none

**Context:** Unspecified context makes “natural” output prone to invented referents, rank, intimacy, readings, and datum conversions.

**Decision:** Default to preserve register/code-switching/data, explicit `unspecified` social facts, ask-if-blocking ambiguity, preserve-and-ask unknown readings, and preserve marked titles. Explicit adaptation is bounded by higher meaning and consent invariants.

**Rationale:** Honest ambiguity is safer than a fluent fabrication.

**Consequences:** Some destination interactions ask a concise clarification or retain source forms. Summaries disclose these behaviors.

## ADR-007 — V1 prompt-surface scope

Status: Accepted  
Date: 2026-07-23  
Supersedes: none

**Context:** Interface, home, target, and generated-instruction language are separate. Runtime localization or unreviewed prompt translation would create semantic drift and multiply evaluation scope.

**Decision:** V1 ships one reviewed English generated-instruction surface. It is pinned explicitly as `instructions-en` and never inferred from interface, home, or target language. Runtime/model localization is prohibited.

**Rationale:** One English surface keeps the MVP prompt and evaluation scope controlled while preserving portability across interface and language settings. A Japanese surface would double authored snapshots and semantic evaluation and can be added later only with equivalent evidence.

**Consequences:** Gate 0 may close after verification. V1 exposes no prompt-surface selector; every normalized configuration pins `instructions-en`. Japanese interface copy must explain that the generated portable prompt remains English. A later surface is a versioned product addition, not localization fallback.

## ADR-008 — Canonical and edited prompts are distinct artifacts

Status: Accepted  
Date: 2026-07-23  
Supersedes: none

**Context:** Visibility/editability is required, but an edit breaks deterministic byte identity.

**Decision:** The application retains immutable compiler output separately. The first UI edit marks the working artifact `user-modified`; provenance identifies its source compilation but no longer claims exact regeneration. The compiler has no editing state. Regeneration is explicit.

**Rationale:** Users keep ownership without weakening provenance.

**Consequences:** Copy/download operate on the visibly selected canonical or edited artifact and label it. Tests compare captured bytes for each path.

## ADR-009 — Explicit local storage and allowlisted fragments

Status: Accepted  
Date: 2026-07-23  
Supersedes: none

**Context:** Local ownership is required, while relationship/context/prompt data can be sensitive and URL fragments can leak through client surfaces.

**Decision:** Before Gate 4, state is memory-only. Gate 4 uses explicit same-origin `localStorage` saves for validated versioned recipe records. Fragments use exactly `SharePayloadV1`; relationship/hierarchy, host capabilities, labels, free-form content, source, prompt/edit, audio, and history are omitted/reset.

**Rationale:** Small structured recipes do not justify a database or IndexedDB abstraction; explicit action and allowlists minimize surprise.

**Consequences:** Imports, quotas, migrations, fragments, and clearing are fail-closed and bounded as specified in `ARCHITECTURE.md`. Future sensitive local fields require a new decision and explicit opt-in.

## ADR-010 — Two offline milestones

Status: Accepted  
Date: 2026-07-23  
Supersedes: none

**Context:** Gate 3 requires operation after loading; Gate 5 introduces the service worker.

**Decision:** Gate 3 proves a loaded document continues after network loss with no runtime requests. Gate 5 adds reload/restart-capable, versioned same-origin caching.

**Rationale:** This satisfies both requirements without prebuilding a later gate.

**Consequences:** No cold-offline claim is made at Gate 3.

## ADR-011 — Prompt byte budget

Status: Accepted  
Date: 2026-07-23  
Supersedes: none

**Context:** Portable destinations have differing limits; no universal platform limit exists.

**Decision:** Canonical prompt text warns above 9,000 UTF-8 bytes and fails above 12,000. A known destination adapter uses the lower of 12,000 and 80% of its documented instruction limit.

**Rationale:** The fixed portable cap deters prompt accretion while the 80% rule protects known hosts.

**Consequences:** Limit changes are versioned behavior changes. Structural repeated failures trigger redesign before prose growth.

## ADR-012 — Fixture provenance and prospective evidence

Status: Accepted  
Date: 2026-07-23  
Supersedes: none

**Context:** Public cases that shape the candidate cannot later demonstrate independent performance.

**Decision:** All Gate 0 cases are `development`. Immutable definition bytes/hash, append-only ledger/current-state projection, and run evidence are separate artifacts. Selected holdouts require custody evidence and a frozen protocol. The first prospective failure stops the run and consumes the exposed set.

**Rationale:** Passing known cases and passing an untouched frozen evaluation are different claims.

**Consequences:** Negative/regression cases remain permanent. Transport qualification and scoring independence receive separate evidence records.

## ADR-013 — Interpreter remains in the ordered Gate 3 scope

Status: Accepted  
Date: 2026-07-23  
Supersedes: none

**Context:** Gate 3 explicitly orders Interpreter after Live Voice Coach, while the Gate 6 minimum list names Written Translator, Live Voice Coach, and generic compilation.

**Decision:** Treat the Gate 3 sequence as normative: Interpreter is implemented only after the prior slices pass and cannot be silently skipped when claiming Gate 3 completion. The Gate 6 list is a minimum, not an exclusive release list.

**Rationale:** This follows the explicit ordered instruction without prebuilding Interpreter in Gate 0.

**Consequences:** If Interpreter has not passed, Gate 3 remains incomplete and no release claim includes it.

## ADR-014 — GitHub Pages security claim is bounded

Status: Accepted  
Date: 2026-07-23  
Supersedes: none

**Context:** GitHub Pages does not provide project-controlled arbitrary response headers; HTML meta CSP lacks header-only directives.

**Decision:** Gate 5 uses and tests the strictest compatible meta CSP, same-origin assets, no application network calls, safe DOM rendering, and sanitized release output. It explicitly disclaims unavailable `frame-ancestors`, reporting, and other header-only protections.

**Rationale:** A precise limitation is more trustworthy than claiming a “strict CSP” the host cannot deliver fully.

**Consequences:** Stronger headers require a future hosting decision and user confirmation; they are not simulated with script.

## ADR-015 — Written Translator has no in-band command syntax

Status: Accepted  
Date: 2026-07-23  
Supersedes: none

**Context:** A command prefix would collide with literal source and was not defined by the brief. Prompt-like text must remain data.

**Decision:** In V1, the next destination-user message is source. A reply to a model-requested blocking clarification is context for the pending source; after output, the next message is new source. Recipe changes happen in PhraseGarden or a new destination session. No prefix, delimiter, or source escape exists.

**Rationale:** A simple state transition protects quoted/fenced/instruction-looking material without an underspecified control channel.

**Consequences:** Written Translator is intentionally not an in-band settings console. Live Voice Coach retains its separately defined semantic controls.

## ADR-016 — Woven Conversation is the visual target

Status: Accepted  
Date: 2026-07-23  
Supersedes: none

**Context:** Gate 1 produced exactly three independent concepts: Warm Garden, Woven Conversation, and Resonance Atlas. The user selected displayed concept 2 without requesting a blend or refinement.

**Decision:** Woven Conversation is the sole visual source for PhraseGarden. Its paired language rails, bilateral settings workspace, connective synthesis, linen/indigo/coral/teal palette, typography character, focus treatment, and motion character are fixed by `DESIGN-CONTRACT.md`.

**Rationale:** The direction makes PhraseGarden's core product claim legible: user intent and destination effect remain connected while private source content stays outside the builder. It is expressive without introducing gamification or a runtime model metaphor.

**Consequences:** Warm Garden and Resonance Atlas remain historical alternatives only. Later UI work cannot borrow from them unless the user explicitly reopens the decision. Gate-specific implementation must expose only functionality that exists at that gate, even where the concept image depicts later navigation.

## ADR-017 — Validation stage order is fixed

Status: Accepted  
Date: 2026-07-23  
Supersedes: none

**Context:** Gate 0 required validation issues to sort by composition-stage ordinal but did not enumerate the stages. Implementations could therefore emit different canonical issue orders.

**Decision:** Use the eight-stage order in `RECIPE-SCHEMA.md`: input-shape, configuration, artifact-identity, authored-data, pair-resolution, selection, rendering, and budget. Within a stage, sort code then data path by exact UTF-16 code-unit order.

**Rationale:** Error order is observable snapshot behavior and must not depend on caller-supplied numbers, locale collation, or implementation accident.

**Consequences:** Validation issues carry a closed stage name; code derives its ordinal. A regression fixture locks cross-stage, code, and path ordering.

## ADR-018 — JSON-like arrays are exact and dense

Status: Accepted  
Date: 2026-07-23  
Supersedes: none

**Context:** Authored artifacts arrive through JavaScript values even though their portable representation is JSON. JavaScript arrays can contain holes, accessors, symbols, inherited behavior, or extra properties that JSON cannot preserve faithfully.

**Decision:** Domain boundaries accept only arrays with `Array.prototype`, an ordinary own `length` data property, dense zero-based own enumerable data elements, and no symbols, accessors, unsafe keys, or extra string properties. Records continue to accept only `Object.prototype` or null prototypes and own enumerable data fields.

**Rationale:** The accepted runtime shape must have one unambiguous JSON representation and must be inspectable without invoking getters or retaining caller objects.

**Consequences:** Sparse, subclassed, cross-realm, decorated, or accessor-bearing arrays fail closed. Validators reconstruct fresh arrays; they never normalize those forms.

## ADR-019 — Semantic maps have canonical JSON key order

Status: Accepted  
Date: 2026-07-23  
Supersedes: none

**Context:** JavaScript record insertion order is observable in serialization even when a schema uses the record as an unordered semantic map. Caller insertion history must not change deterministic output or snapshots.

**Decision:** Validators reconstruct unordered semantic maps in canonical JSON object order: canonical array-index names sort numerically first, then all remaining names sort by exact UTF-16 code-unit order. Authored arrays remain ordered data and retain their declared order. No locale collation is used.

**Rationale:** This gives equivalent mappings one stable representation without treating author-controlled sequences as sets.

**Consequences:** Summary value maps and later unordered maps are canonicalized at validation boundaries without forbidding numeric placeholder names. Array reordering remains a semantic change.

## ADR-020 — Canonical language identity is registry-pinned

Status: Accepted  
Date: 2026-07-23  
Supersedes: none

**Context:** Profiles, pair directions, configurations, share payloads, and provenance cannot safely use a display name, an alias, or two independently canonicalized strings as language identity. Ambient `Intl`, host locale, network data, or a silently updated registry would make identical bytes environment-dependent.

**Decision:** `LanguageProfile.id` and `LanguageProfile.bcp47` are the same exact canonical-cased tag, byte for byte. Acceptance is exact membership in one bundled PhraseGarden canonical-tag registry whose immutable source bytes have an explicit version and SHA-256 content hash. Every identity-bearing profile, pair direction, normalized configuration, share payload, compiler input, and provenance record pins that exact registry reference. Profile version remains independent of language identity and registry version.

The initial policy rejects aliases and deprecated forms, grandfathered tags, private-use tags, extensions, casing variants, and unlisted tags. It performs no normalization. A later user/import boundary may accept an alias only through an explicit bundled, versioned deterministic map; the normalized value must be the sole stored and compiled identity. Registry changes require a reviewed versioned migration. A missing, unknown, or mismatched registry reference fails with a registry-version or registry-hash error unless an explicit pure migration exists.

**Rationale:** One pinned identity prevents split-brain profile, pair, configuration, sharing, and provenance records while remaining deterministic across runtimes. The PhraseGarden registry is an application-supported subset reviewed against the published IANA registry, not a claim that every registered tag has a bundled profile.

**Consequences:** Exact `en`, `ja`, and an explicitly listed language-script-region tag are representable without a second ID system. Valid but unlisted tags remain unsupported until a registry migration and, for selection, a bundled profile are added. Runtime code does not fetch or infer canonical tags.

## ADR-021 — Profile content and review evidence are separate artifacts

Status: Accepted for profile separation; pair-record consequence superseded by ADR-022  
Date: 2026-07-23  
Supersedes: none

**Context:** The original `LanguageProfile` shape nested `ReviewRecord[]`, but immutable evidence paths, published suites, candidate versions, record-ID scope, and clock-free date qualification are intentionally unresolved until the tier-review package. Accepting those claims in a bounded profile validator would imply validation that has not occurred.

**Decision:** `LanguageProfile` contains versioned language metadata and monolingual clauses only. Profile-review evidence, when implemented, is a separate versioned bundle with its own closed validator and exact profile scope. At Gate 2H, pair directions temporarily retained their existing review basis and records; ADR-022 subsequently removed those inline fields in favor of a separate direction bundle.

**Rationale:** Content validation can be complete without silently trusting evidence claims or inventing tier policy. Support tier remains a property of an exact directed pair, never of a monolingual profile.

**Consequences:** Removing profile-owned `reviewRecords` is a schema correction, not a demotion or deletion of review requirements. No profile may be advertised as reviewed until the separate evidence artifact and qualification rules pass.

## ADR-022 — Review evidence is separate, content-addressed, and structural-only

Status: Accepted  
Date: 2026-07-23  
Supersedes in part: ADR-002's inline review-basis consequence and ADR-021's inline pair-record consequence

**Context:** The original review shapes used mutable-looking paths, ambiguous `candidateVersion`, inline pair-direction records, and an unbound continuous-suite claim. They could not distinguish byte-different candidates with one version, prove exact evidence bindings, or separate metadata structure from human truth. Embedding a review-bundle hash inside the PairPack whose bytes that bundle reviews would also create a hash cycle.

**Decision:** Profile and direction review evidence are separate versioned bundle artifacts that stand beside their candidate. A profile bundle binds a content-addressed `language-profile` candidate; a direction bundle binds a content-addressed `pair-pack` candidate plus exact ordered profile refs. PairPack content contains no review bundle, basis, review date, or review record.

Every file/artifact reference uses a canonical repository-relative path, exact 64-character uppercase SHA-256, and nonnegative safe-integer byte length. Paths are validated but never normalized. A published suite is its ID/version plus the immutable reference to its definition bytes. Candidate, contribution, checker, run evidence, and review evidence are independently content-addressed.

Review-record IDs are bundle-local. Their external identity is `(bundle id, bundle version, record id)`; every internal record reference repeats the exact bundle id/version. Dates are real proleptic-Gregorian `YYYY-MM-DD` values for years 0001–9999 and are never compared with a clock.

A direction bundle declares exactly one structural evidence class: Community, Reviewed, or Flagship evidence. It is not a `SupportTier`. All records must be referenced exactly once by that class and match the bundle scope, candidate, suite, passing outcome, and required declared role. Flagship adds a deterministic suite pass for the same candidate and suite plus an exact checker artifact. “Continuous” means a new matching pass is required for each candidate hash; it does not mean monitoring, freshness, or expiration.

**Rationale:** This removes candidate and byte ambiguity without making the domain validator read files or infer human credibility. Keeping evidence outside candidate artifacts avoids circular hashes and lets a later resolver combine independently qualified artifacts.

**Consequences:** `validateReviewEvidenceBundle` can establish closed structure and exact internal bindings only. Its result explicitly says that bytes, external artifact existence, evidence truthfulness, suite publication, reviewer qualification, review occurrence, linguistic correctness, and support tier were not established. A separate build/release manifest must qualify referenced bytes; governance must establish publication, truthfulness, and human-role claims. Later pair resolution, not this validator, derives a tier from an exact PairPack plus separately qualified direction evidence. Generic remains absence of such a qualified direction.

## ADR-023 — Public Preview is a non-review support tier

Status: Accepted  
Date: 2026-07-23  
Supersedes in part: ADR-002's zero-pack tier consequence and ADR-022's deferred-resolver consequence for the public Preview only

**Context:** PhraseGarden now has authored, versioned English↔Japanese guidance to ship, but no external linguistic-review evidence. Treating that pack as Generic would prohibit its pair-specific clauses; treating it as Community, Reviewed, or Flagship would fabricate a review claim.

**Decision:** Add `preview` as a support tier. The current pure resolver derives Preview from exactly one version-matched directed pair pack and Generic from no exact pack; multiple matches fail. English→Japanese and Japanese→English are Preview. Preview provenance states `external-review-not-completed` and names the exact built-in pack version. Users and imported configurations never supply a tier. Generic remains pair-pack-free and excludes every profile/pair linguistic clause.

The existing review-evidence types and structural validator remain unchanged. A future separately authorized resolver may derive Community, Reviewed, or Flagship only from exact qualified evidence.

**Rationale:** Preview makes useful versioned pair guidance available without conflating authored content with human review or weakening Generic isolation.

**Consequences:** Public copy must not describe Preview as flagship, reviewed, community-reviewed, independently validated, production-proven, or qualified-speaker approved. Snapshot, provenance, and UI tests lock the distinction. No review date is invented.

## ADR-024 — Direct local creation with an informed-use Review handoff

Status: Accepted
Date: 2026-07-24
Supersedes: the mandatory Home-to-Builder step in the selected design contract

**Context:** The compiler already has safe, explicit defaults, but the public
flow required every visitor to open Builder before creating a prompt. That
extra decision screen obscured the product's purpose and delayed the first
useful result. Local compilation is deterministic, reversible, and sends
nothing; using the output in another tool is the consequential handoff.

**Decision:** Home exposes one primary `Create my prompt` action that compiles
the selected languages, modality, and current defaults. `Adjust optional
settings` remains a secondary path using the same configuration and compiler.
Review is the informed-use handoff: support tier and limitations appear before
Copy and Download, and the page states destination compatibility, paste order,
and destination privacy. A current artifact survives internal navigation. A
modified draft must be explicitly replaced, and the browser's native
before-unload protection covers refresh or close.

**Rationale:** The shortest path now produces value without hiding any
consequential claim or action. The same pure compiler remains authoritative,
so the shorter route introduces no alternate prompt semantics.

**Consequences:** Direct and optional-settings paths must produce byte-identical
canonical output for identical effective configurations. Session-only state is
not described as saved. PhraseGarden never sends or runs the result, and no
destination-tool compatibility or privacy guarantee is implied.

## ADR-025 — Interpreter is a one-way, host-bounded relay

Status: Accepted
Date: 2026-07-24
Supersedes: none

**Context:** The Gate 0 schema names Interpreter settings but does not state
whether one prompt mediates both directions, where turns come from, or how the
common ambiguity setting interacts with Interpreter clarification. The
compiler resolves exactly one directed pair realization. Treating that result
as bidirectional would silently apply only half the required pair guidance.
The destination-capability schema also cannot establish speaker identity,
audio access, pauses, interruptions, or turn boundaries.

**Decision:** Interpreter V1 is one-way from the exact configured home profile
to the exact configured target profile. Swapping languages and compiling a new
prompt creates the reverse direction. It operates on each complete turn,
message, or short complete segment that the destination actually supplies; it
never infers a speaker, language direction, audio evidence, pause, interruption,
or boundary.

`ambiguity` governs preservation while forming a relay. Interpreter
`clarification` owns all blocked recovery. `ask-if-blocking` permits at most
one concise question. `mark-uncertainty` never asks: it emits the narrowest
responsible marked relay or states that no responsible relay can be produced.
Unknown-name handling defers to the same clarification choice. Written and
Voice retain their existing blocking-question behavior through a
recipe-conditioned compiler-policy clause.

**Rationale:** One direction matches configuration, provenance, support tier,
and exact pack resolution without inventing reverse coverage. Host-bounded
turns make the same prompt usable with text, transcript, or audio-capable tools
without promising any capability PhraseGarden cannot verify. One clarification
owner prevents equal-authority instructions from contradicting each other.

**Consequences:** The compiler-policy, English prompt-surface, and English
summary-catalog artifacts advance independently. Published samples remain
immutable; current-byte tests record the exact declared transition. The UI
exposes only turn mode and Interpreter clarification, not the overlapping
common ambiguity or unknown-name controls. Bidirectional or simultaneous
interpreting requires a later explicit schema and pair-resolution decision.

## ADR-026 — Current state is a cursor, not the evidence archive

Status: Accepted
Date: 2026-07-24
Supersedes: the use of `PROJECT-STATE.md` as both live cursor and historical
release ledger

**Context:** The live state file grew to 337 lines because it carried detailed
proof for two published releases and an unpublished candidate. Resuming work
required rereading history, and activity could be mistaken for progress.
Recording a review verdict inside the reviewed candidate also changed the
reviewed bytes.

**Decision:** `PROJECT-STATE.md` contains only the current resume cursor,
durable boundaries, compact milestone state, known blockers, and exact next
action. Detailed release and candidate proof moves to named, versioned evidence
ledgers. Active requirements use stable IDs in `TRACEABILITY.md`. Work follows
the state machine, retry budgets, and Return Desk in `RELEASE-WORKFLOW.md` and
`RETURN-DESK.md`.

A candidate fingerprint identifies the product/source checkpoint under work;
administrative evidence can reference that checkpoint without pretending to be
part of its review. Qualification evidence uses layered manifests so an
attestation never claims to be included in the hash it cites. No review,
qualification, or publication state advances merely because commands ran.

**Rationale:** One small cursor makes the next safe action obvious, while
separate ledgers preserve negative results and immutable proof without turning
every package into a historical re-audit. Layered evidence removes self-hash
and post-review mutation ambiguity.

**Consequences:** Every package closes with one current-state update and one
local checkpoint. Repeated failures exhaust explicit budgets and return for a
decision instead of looping. Historical ledgers are corrected only by a new
append-only note that preserves the prior claim; published evidence is never
silently rewritten. Remote verification and publication remain separately
authorized actions.

## ADR-027 — Advanced Controls is presentation-only disclosure

Status: Accepted
Date: 2026-07-24
Supersedes: the current two-disclosure Builder arrangement

**Context:** Gate 3 requires Advanced Controls, while the current schema already
contains every approved setting and the Builder exposes nearly all of them at
once. Adding more settings would expand prompt behavior without a captured
failure; leaving two separate safeguard/capability disclosures would not meet
the selected design's one-disclosure contract.

**Decision:** Gate 3.5 adds no setting, enum, default, clause, rendering,
summary semantic, warning, provenance field, or version. Relationship,
register, and each modality's existing core controls stay visible. One native
`Advanced settings` disclosure owns hierarchy; applicable ambiguity,
title/honorific, and unknown-name handling; and Live Voice destination
capability declarations. Interpreter continues to omit ambiguity and
unknown-name controls under ADR-025.

**Rationale:** Progressive disclosure makes the Builder easier to scan without
creating a second configuration path or implying that uncommon social and host
facts are required.

**Consequences:** Opening or closing the disclosure is presentation state only.
Direct and Builder compilation remain byte-identical for identical settings.
Prompt snapshots, compiler data, summary semantics, and artifact versions must
not change. A field-map, keyboard, axe, reflow, and protected-path matrix binds
the package.

## ADR-028 — Preview 3 may publish verified Gate 3 increments

Status: Accepted
Date: 2026-07-24

**Context:** Interpreter and the progressive Advanced-settings presentation
are independently verified, while manual assistive-technology evidence and
Gates 4–6 remain incomplete. The user explicitly requested an immediate public
release. Treating that request as stable-release or Gate 3-exit evidence would
overclaim; withholding all prerelease publication would conflate the Preview
channel with later qualification.

**Decision:** Publish these Gate 3 increments only as
`0.1.0-preview.3`, marked as a GitHub prerelease. The release may claim the
named deterministic, browser, axe, visual, package, and public-byte evidence.
It must continue to disclose incomplete external linguistic review,
English-only interface, memory-only state, no cold-offline cache, and the
unfinished manual screen-reader, real-device IME, forced-colors, zoom, mobile,
offline, and broad browser/OS matrices. It may not claim Gate 3 exit, stable
readiness, WCAG conformance, Reviewed/Flagship status, or durable offline use.

The source is frozen before the one release build. The packaging commit may add
only release evidence and exact distributable bytes. Pages must deploy those
checked-in qualified bytes rather than a CI rebuild. Preview 2 remains the
immutable rollback target.

**Rationale:** A narrowly labeled prerelease gives users the reviewed product
improvements now while keeping later accessibility, ownership, localization,
offline, governance, and stable-release evidence honest.

**Consequences:** Preview 3 has its own bounded qualification and publication
contract. Any source, tag, asset, target, rollback, permission, or public-byte
change after exact authorization stops publication. Gates 4–6 remain
unstarted.

## ADR-029 — Release archives bind committed blobs before atomic extraction

Status: Accepted
Date: 2026-08-17
Supersedes: the archive-verifier qualification claim at checkpoint `83558bd`

**Context:** Independent adversarial review reproduced a packaging-mode pass
after the ZIP, manifest, and checksum ledger were coherently replaced only in
the worktree. It also found permissive JSON scalar equality, duplicate keys,
Unicode-equivalent paths, an unbounded physical ZIP prefix, special-file mode
metadata, and partial extraction left by a late validation failure. The earlier
focused suite did not exercise a real Git repository and could not establish
the intended same-byte claim.

**Decision:** Packaging mode requires every one of its seven allowed paths to
be a regular `100644` blob at `HEAD` and requires the unfiltered worktree bytes
to hash to that exact Git object before accepting the parent ledger. Manifest
JSON is size-bounded UTF-8 with unique keys, standard constants, closed fields,
and exact scalar types. Release member paths use a documented safe ASCII
subset; language content remains unrestricted inside files. Ledger and file
hashes stream through bounded chunks. Manifest, ledger, physical ZIP, member
count, and decompressed bytes have independent ceilings with release headroom.

ZIP members must begin at byte zero, match the closed manifest, use supported
compression, and carry only regular or unspecified file-type metadata. The
verifier reads and validates all bounded member bytes before it creates a
temporary sibling tree, then atomically renames that complete tree to the
fresh requested output. Any validation or write failure removes only that
verifier-owned temporary tree.

**Rationale:** A path allowlist identifies scope, not bytes. Binding unfiltered
worktree files to exact committed blobs closes that gap. Safe ASCII filenames
avoid host-dependent Unicode normalization without restricting multilingual
page content. Validate-then-rename makes a corrected retry possible without
manual cleanup and prevents partial output from being mistaken for qualified
bytes.

**Consequences:** Checkpoint `83558bd` remains development history, not a
source freeze. Its earlier PASS is superseded by the preserved reproduced
failures. Permanent synthetic regressions must cover clean and dirty real-Git
packaging commits, strict JSON, input budgets, ZIP prefix and metadata, and a
same-path retry after a late member failure. Pages policy, action pins, actual
artifact bytes, remote state, and publication remain separate packages.

## ADR-030 — The first Generic language cohort is an explicit registry migration

Status: Accepted
Date: 2026-08-17
Supersedes: Preview 3's assumption that the language-registry provenance stays
unchanged after source-claims checkpoint `aa75e60`

**Context:** The public catalog has seven canonical identities, while users
reasonably expect French, German, Italian, Spanish, and Portuguese. Adding only
display labels would violate ADR-020: selection, profiles, configuration,
pair references, compiler inputs, and provenance must use one exact bundled
identity. No qualified-speaker or direction-review evidence exists for the new
languages, and Portuguese has material regional varieties.

**Decision:** Advance the immutable registry to `2026-08-17.1`, content SHA-256
`498C0F6963F31E9FF21028F52AAD112F2A04453BF7BB4EFD0521A381ECEAECF5`,
reviewed against the IANA registry observed at `File-Date: 2026-08-08`. Add
exact primary tags `de`, `es`, `fr`, `it`, and `pt` in code-unit order. Each
gets one version `1.0.0` identity-only profile with its autonym, deterministic
search names, `Latn`, `ltr`, and no monolingual clause.

`pt` is Portuguese with region unspecified. It is not “neutral Portuguese” and
does not stand for Brazilian, European, African, or another regional variety.
`pt-BR` and `pt-PT` remain unsupported canonical identities. The ASCII forms
`Francais`, `Espanol`, and `Portugues` are search strings only; they are never
stored IDs or accepted aliases.

Existing profile, pair-pack, recipe, compiler-policy, and prompt-surface
versions do not advance because their own authored content is unchanged. Their
complete identity nevertheless changes through the mandatory registry
version/hash reference. Generated prompt provenance and therefore prompt bytes
advance explicitly. Old registry-bound configurations fail with the existing
version/hash errors; no silent migration or alias normalization is introduced.

Every one of the 132 distinct directions across three recipes is exercised.
Only the six English↔Japanese direction/recipe results remain Preview; the
other 390 are Generic with no pair pack, review claim, section 6, or endpoint
linguistic clause.

**Rationale:** A small exact cohort gives people useful selection without
turning a language list into a quality claim. Region-unspecified `pt` is an
honest language identity so long as no regional adequacy is implied. Composite
artifact identity lets unchanged authored profile content retain its version
while still making the registry transition visible and fail-closed.

**Consequences:** The earlier Preview 3 source-claims checkpoint remains valid
history but cannot be the final source freeze. Preview 3 must re-run source and
browser qualification on the clean descendant that contains this migration
and the separately reviewed beginner-facing presentation. No Flagship,
Reviewed, or Community tier is created; English↔Japanese remains Preview
pending real external linguistic evidence.

## ADR-031 — Public language presentation is authored, plain, and tier-aware

Status: Accepted
Date: 2026-08-17

**Context:** The exact language identities are machine-friendly by design, but
ordinary visitors should not need BCP-47 knowledge or prompt-engineering
vocabulary. Expanding to twelve profiles exposed technical codes in selectors,
generic tool descriptions that sounded like PhraseGarden performed the task,
and a Review page that did not immediately restate direction and tool.

**Decision:** Keep native selects and one explicit display catalog authored in
English-name order; never derive order or names from ambient `Intl`. Each option
uses the canonical tag only as its value and shows an authored English name plus
isolated autonym, with no flag or visible code. Home/target labels adapt to the
selected modality. Language changes announce the resulting English-readable
direction and compiler-derived tier. Review restates direction and tool before
support and handoff content.

PhraseGarden says it makes instructions to copy into another AI or language
tool, never asks for source text, and keeps direct creation primary. Generic is
described positively but exactly: general meaning-and-tone rules apply, while
the exact direction has no pair-specific guidance or independent language
review. Presentation never changes identity, prompt bytes, provenance, or tier.

**Rationale:** Authored display metadata is deterministic and understandable
without turning a language endpoint into a support claim. Native controls and
explicit bidi isolation preserve established keyboard and assistive-technology
behavior. Moving the primary action directly after tool choice keeps it in the
initial desktop viewport without hiding limitations.

**Consequences:** Adding a profile now requires an explicit display name/order
entry and presentation regression. Search and aliases remain later work; no
custom combobox is implied. Automated completion, axe, and reflow checks do not
prove the under-two-minute goal or human screen-reader comprehension, which
still require consented usability and manual assistive-technology evidence.

## ADR-032 — Pages verifies and deploys one immutable main-branch archive

Status: Accepted
Date: 2026-08-17

**Context:** The preserved Pages draft called a nonexistent verifier option,
allowed non-main dispatch, over-granted permissions, followed links, rebuilt
release bytes, and referenced five movable action tags.

**Decision:** Verification and deployment require `refs/heads/main`.
Verification gets only `contents: read`; deployment alone gets `pages: write`
and `id-token: write`. Checkout fetches the packaging commit and parent without
persisting credentials. Actions pin the official refs observed on 2026-08-17;
pnpm uses the peeled commit, not its annotated tag object.

Pages tests source/archive code, extracts with `--require-packaging-commit`,
audits the fresh `dist`, browser-tests it, re-audits it, and then uploads it;
there is no build. The audit uses bounded `lstat`/handle traversal, strict
manifest JSON and paths, and one exact release-document template with its CSP.

**Rationale:** Main guards, job-local permissions, exact commits, and audit
before/after browser checks bind upload to extracted rather than rebuilt bytes.

**Consequences:** Action updates require new ref evidence/tests. Docs-only
descendants neither masquerade as packaging commits nor deploy. This policy
package does not freeze source, create release bytes, deploy, or publish.

## ADR-033 — Source identity is a canonical manifest of one complete Git tree

Status: Accepted
Date: 2026-08-18

**Context:** A hand-maintained source-path union drifted as Preview 3 gained
reviewed packages. Git status, checkout filters, ignore indirection, alternate
object storage, and ambient configuration are also inadequate foundations for
an exact release-source claim.

**Decision:** `scripts/preview3-package.py freeze-source` derives one canonical
manifest from every regular `100644` blob in one exact 40-lowercase-SHA-1
`HEAD`. It preflights object type and size before content, rehashes typed
commit/tree/blob bytes, rejects nonportable or colliding paths and redirected
object/configuration sources, and enforces fixed file/tree/depth/byte budgets.
The index and bounded raw worktree are repeated equality gates; they never
become a second source authority.

The fixed ignored output is
`artifacts/release/preview3-source-manifest.json`. Its closed, canonical JSON
binds source commit, source tree, and path-sorted file mode, length, and SHA-256.
`verify-source` reconstructs those bytes and requires exact equality without
rewriting them. Both commands are clock-, locale-, randomness-, browser-,
application-storage-, and network-independent and assume a quiescent local
filesystem.

**Rationale:** Complete-tree derivation removes a fallible manual inventory and
makes source identity mechanically reproducible before build or packaging.
Separating derivation from worktree qualification prevents filters or ambient
Git policy from silently defining release bytes.

**Consequences:** Linked/common-directory repositories, executable files,
symlinks, submodules, nonportable names, dirty equality gates, and over-budget
trees stop this Preview 3 procedure. Checkpoints
`e421e0a3248d9d7c1730929697920f8b757b8792` and
`06cc7cb032ec7798accb8757d10a21df75fcefdb` bind the core and regression suite.
No real source manifest, package, freeze,
linguistic claim, or publication is created by those checkpoints; same-byte
staging and promotion remain a separately reviewed package.
