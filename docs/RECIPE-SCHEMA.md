# PhraseGarden recipe schema

Status: Gate 0 normative schema  
Schema version: 1  
Updated: 2026-08-17

This document defines data semantics, not production TypeScript. Gate 2 must encode these closed shapes without weakening them.

## Identities and versions

- Language identity is one canonical-cased BCP 47 tag: `LanguageProfile.id === LanguageProfile.bcp47` byte for byte. Acceptance is exact membership in the pinned bundled canonical-tag registry; display names and autonyms are data, not IDs.
- The registry is an application-supported subset with immutable source bytes, an explicit version, and a SHA-256 content hash. Registry, profile, and schema versions are separate.
- Stored/compiled identity is never an alias. V1 rejects aliases/deprecated forms, grandfathered tags, private use, extensions, casing variants, and unlisted tags. A later boundary alias policy requires a bundled versioned deterministic map and may emit only the canonical identity.
- Pair IDs are directed: `<home-profile-id>→<target-profile-id>`. Reverse directions require their own declared coverage.
- Recipe, profile, pair-pack, prompt-surface, locale-catalog, compiler, and schema versions use immutable release strings.
- A transient builder selection names IDs. The pure materializer applies the defaults below and pins the one active version from the bundled catalog manifest. Zero or multiple active versions is an error.
- `RecipeConfiguration` is the normalized, version-pinned semantic record used for compilation, save/export, and snapshots. A saved/imported record is migrated explicitly before compilation and is never silently rebound to a newer artifact.
- `supportTier` and `pairPack` are resolved outputs. They are never accepted from user configuration.

## Recipe configuration

```ts
type VersionRef = { id: string; version: string }
type LanguageRegistryRef = { version: string; contentSha256: string }
type CanonicalLanguageId = string
type LanguageProfileRef = { id: CanonicalLanguageId; version: string }
type CanonicalLanguageRegistry = LanguageRegistryRef & {
  registryId: "phrasegarden-canonical-language-tags"
  source: {
    name: "IANA Language Subtag Registry"
    registryFileDate: string
    uri: string
  }
  policy: {
    aliases: "reject"
    grandfathered: "reject"
    privateUse: "reject"
    extensions: "reject"
  }
  canonicalTags: readonly CanonicalLanguageId[]
  deprecatedForms: readonly {
    tag: string
    preferredTag: CanonicalLanguageId
  }[]
  grandfatheredTags: readonly string[]
}
type RecipeId = "written-translator" | "live-voice-coach" | "interpreter"

type RecipeConfiguration = {
  schemaVersion: 1
  languageRegistry: LanguageRegistryRef
  recipe: { id: RecipeId; version: string }
  promptSurface: VersionRef
  languages: {
    home: LanguageProfileRef       // source/default explanation language profile
    target: LanguageProfileRef     // output/practice language profile
  }
  socialContext: {
    relationship: Relationship
    hierarchy: Hierarchy
  }
  register: RegisterPreference
  ambiguity: "preserve-and-note" | "ask-if-blocking" | "marked-best-effort"
  codeSwitching: "preserve"
  dataHandling: DataHandling
  titleHandling: "preserve-marked-title" | "adapt-only-known-role"
  unknownName: "preserve-and-ask" | "preserve-and-note"
  destination: DestinationCapabilities
  settings: WrittenSettings | VoiceSettings | InterpreterSettings
}
```

`home`, `target`, the UI's `interfaceLocale`, and the authored `promptSurface` are distinct. `interfaceLocale` is presentation state, not semantic recipe configuration. The compiler receives one exact prompt-surface object; it never chooses a surface from interface or language settings. V1 materialization always pins the sole bundled reviewed English surface, `instructions-en`; additional authored surfaces require later explicit product scope and independent review.

The registry's sole content artifact is `src/packs/canonical-language-registry.data.json`: exact UTF-8 bytes, no BOM, LF line endings, and one terminal LF. `contentSha256` is the SHA-256 of that whole file; the digest is stored outside the hashed bytes in `canonical-language-registry.ts`. Version `2026-08-17.1` has digest `498C0F6963F31E9FF21028F52AAD112F2A04453BF7BB4EFD0521A381ECEAECF5`. Its canonical tags are exact, unique, and code-unit sorted: `de`, `en`, `es`, `fr`, `he`, `id`, `it`, `ja`, `pt`, `tlh`, `yi`, `zh-Hant-TW`. Deprecated-form and grandfathered-tag entries are also exact, unique, and code-unit sorted. Registry order is normative source order; runtime code neither sorts nor rewrites it. `pt` is region-unspecified Portuguese; `pt-BR` and `pt-PT` remain unsupported. Discovery strings such as `Francais`, `Espanol`, and `Portugues` are profile metadata, not accepted identities or aliases.

### Closed enums and defaults

```ts
type Relationship =
  | "unspecified" | "strangers" | "acquaintances" | "friends"
  | "close-relationship" | "family" | "romantic-partners"
  | "coworkers" | "customer-service" | "teacher-learner" | "other"

type Hierarchy =
  | "unspecified" | "peers" | "source-speaker-higher"
  | "addressee-higher"

type RegisterPreference =
  | { strategy: "preserve" }
  | { strategy: "adapt"; level: "casual" | "neutral" | "polite" | "formal" }

type DataHandling = { strategy: "preserve-as-written" }

type DestinationCapabilities = {
  userEvidence: "unknown" | "text-or-transcript" | "audible-audio"
  assistantOutput: "unknown" | "text" | "spoken"
  interruptionSignal: "unknown" | "available" | "unavailable"
  silenceSignal: "unknown" | "available" | "unavailable"
  playbackRateControl: "unknown" | "available" | "unavailable"
}
```

| Field | Default | Meaning |
|---|---|---|
| `relationship` | `unspecified` | No relationship or intimacy may be inferred |
| `hierarchy` | `unspecified` | Relationship never implies rank |
| `register` | `{strategy:"preserve"}` | Preserve source force; do not impose a target level |
| `ambiguity` | `ask-if-blocking` | Preserve the distinction when possible; Written/Voice may ask only when blocked, while Interpreter defers blocked recovery to its clarification setting |
| `codeSwitching` | `preserve` | Retain mixed-language spans verbatim and preserve their discourse function when possible; if the target collapses the contrast, disclose that limitation rather than inventing a third language |
| `dataHandling` | `preserve-as-written` | No silent conversion of dates, numbers, addresses, units, eras, or zones |
| `titleHandling` | `preserve-marked-title` | Retain the title/honorific signal without guessing its role |
| `unknownName` | `preserve-and-ask` | Keep source graphemes and request a reading only when needed |
| destination capabilities | every value `unknown` | Promise no host capability without a declaration |

These preferences cannot disable polarity, consent, certainty, hearsay, referent, social-force, title, source-as-data, or evidence invariants.

## Modality settings

The discriminant must match `recipe.id`; settings from another modality are invalid.

```ts
type WrittenSettings = {
  modality: "written"
  outputDetail: "concise" | "brief-notes" | "teaching"
}

type VoiceSettings = {
  modality: "live-voice"
  correction: {
    timing: "on-request" | "after-turn" | "blocking-only" | "after-each-turn"
    focus: "meaning-and-force" | "balanced" | "form-detail"
  }
  pronunciation: "off" | "on-request" | "when-helpful"
  teachingDepth: "minimal" | "brief" | "guided" | "deep"
  pace: "natural" | "slower"
}

type InterpreterSettings = {
  modality: "interpreting"
  turnMode: "consecutive" | "short-relay"
  clarification: "ask-if-blocking" | "mark-uncertainty"
}
```

Defaults:

- Written: `outputDetail: "concise"`. Critical ambiguity or limitation notes remain allowed.
- Live voice: correction `after-turn`/`balanced`; pronunciation `on-request`; depth `brief`; pace `natural`.
- Interpreter: `consecutive`; clarification `ask-if-blocking`.

Interpreter V1 is one-way from `languages.home` into `languages.target`. Each
complete turn, message, or short complete segment is supplied by the
destination or user; the recipe never infers audio access, a speaker, a pause,
an interruption, a language direction, or a turn boundary. Reversing direction
requires a separately compiled configuration.

For Interpreter, `ambiguity` governs preservation while forming a relay and
`settings.clarification` owns all blocked recovery. `ask-if-blocking` permits
at most one concise question. `mark-uncertainty` never asks: it produces the
narrowest responsible marked relay or states that no responsible relay is
possible. Unknown-name handling defers to that selected clarification rule.

All Live Voice Coach definitions include these non-configurable interactions once:

| Intent | Required response |
|---|---|
| Interrupt/stop | Yield immediately at the model-turn level; never promise host latency |
| Silence | Wait without pressure, shame, fabricated speech, or inferred comprehension |
| Repeat | Repeat the last target utterance without changing meaning unless rephrasing is requested |
| Slower | Use shorter spoken chunks and slower phrasing; do not rely on bold, layout, or volume |

If pronunciation support is active with `text-or-transcript`, the result must warn that it can teach a form but cannot assess actual pronunciation. With `unknown`, it must state the dependency. Even `audible-audio` permits assessment only for evidence actually heard. Unknown or unavailable interruption, silence, or playback signaling produces a limitation; a portable prompt never fabricates host capability.

## Authored data schemas

```ts
type Authority =
  | "invariant" | "normalized-setting" | "modality"
  | "pair-pack" | "profile" | "fallback"

type ConditionPath =
  | "recipe.id"
  | "languages.home.id" | "languages.target.id"
  | "socialContext.relationship" | "socialContext.hierarchy"
  | "register.strategy" | "register.level"
  | "ambiguity" | "codeSwitching" | "dataHandling.strategy"
  | "titleHandling" | "unknownName"
  | "destination.userEvidence" | "destination.assistantOutput"
  | "destination.interruptionSignal" | "destination.silenceSignal"
  | "destination.playbackRateControl"
  | "settings.modality" | "settings.outputDetail"
  | "settings.correction.timing" | "settings.correction.focus"
  | "settings.pronunciation" | "settings.teachingDepth" | "settings.pace"
  | "settings.turnMode" | "settings.clarification"
  | "resolved.supportTier" | "resolved.pairPack"

type ClauseCondition =
  | { path: ConditionPath; op: "eq"; value: string }
  | { path: ConditionPath; op: "in"; values: readonly string[] }
  | { path: "resolved.pairPack"; op: "present" | "absent" }

type RenderValuePath =
  | "compiler.version" | "compiler.policyVersion" | "schema.version"
  | "languageRegistry.version" | "languageRegistry.contentSha256"
  | "recipe.id" | "recipe.version"
  | "home.id" | "home.version" | "home.autonym"
  | "target.id" | "target.version" | "target.autonym"
  | "pairPack.id-or-none" | "pairPack.version-or-none"
  | "support.tier" | "support.direction" | "support.review-date"
  | "promptSurface.id" | "promptSurface.locale" | "promptSurface.version"

type RenderPart =
  | { kind: "literal"; text: string }
  | { kind: "value"; path: RenderValuePath; format: "plain" | "inline-code" }

type Clause = {
  id: string
  origin: "invariant" | "recipe" | "profile" | "pair-pack"
  authority: Authority
  section: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  order: number
  whenAll: readonly ClauseCondition[]
  renderingKey: string
  effect: { key: string; value: string }
  refines?: readonly { key: string; value?: string }[]
}

type PromptSurface = {
  id: string
  locale: string
  version: string
  renderings: readonly {
    key: string
    parts: readonly RenderPart[]
  }[]
}

type Sha256Hex = string       // exactly 64 uppercase hexadecimal characters
type CalendarDate = string    // real Gregorian YYYY-MM-DD, years 0001–9999

type ImmutableEvidenceRef = {
  repoPath: string
  sha256: Sha256Hex
  byteLength: number
  stableId?: string
}

type ContentAddressedArtifactRef = {
  id: string
  version: string
  artifact: ImmutableEvidenceRef
}

type CandidateArtifactRef =
  | (ContentAddressedArtifactRef & {
      kind: "language-profile"
      id: CanonicalLanguageId
    })
  | (ContentAddressedArtifactRef & { kind: "pair-pack" })

type PublishedSuiteRef = {
  id: string
  version: string
  definition: ImmutableEvidenceRef
}

type CheckerArtifactRef = ContentAddressedArtifactRef
type ContributionRef = ContentAddressedArtifactRef

type ReviewScope =
  | { kind: "profile"; profile: LanguageProfileRef }
  | { kind: "direction"; home: LanguageProfileRef; target: LanguageProfileRef }

type ReviewRecord = {
  id: string
  publicReviewerId: string
  declaredRole: "qualified-speaker" | "community-reviewer" | "maintainer"
  scope: ReviewScope
  candidate: CandidateArtifactRef
  suite: PublishedSuiteRef
  reviewedOn: CalendarDate
  outcome: "pass"
  evidence: ImmutableEvidenceRef
}

type ReviewBundleIdentity = { id: string; version: string }
type ReviewEvidenceBundleRef = ReviewBundleIdentity & {
  artifact: ImmutableEvidenceRef
}
type BundleRecordRef = {
  bundle: ReviewBundleIdentity
  recordId: string
}

type DeterministicSuitePass = {
  candidate: CandidateArtifactRef & { kind: "pair-pack" }
  suite: PublishedSuiteRef
  checker: CheckerArtifactRef
  passedOn: CalendarDate
  outcome: "pass"
  evidence: ImmutableEvidenceRef
}

type DirectionEvidenceClass =
  | {
      kind: "community-evidence"
      contribution: ContributionRef
      communityReviewRefs: readonly BundleRecordRef[]
    }
  | {
      kind: "reviewed-evidence"
      qualifiedSpeakerReviewRefs: readonly BundleRecordRef[]
    }
  | {
      kind: "flagship-evidence"
      qualifiedSpeakerReviewRefs: readonly BundleRecordRef[]
      deterministicSuitePass: DeterministicSuitePass
    }

type ProfileReviewBundle = {
  schemaVersion: 1
  kind: "profile-review"
  id: string
  version: string
  languageRegistry: LanguageRegistryRef
  profile: LanguageProfileRef
  candidate: CandidateArtifactRef & { kind: "language-profile" }
  suite: PublishedSuiteRef
  records: readonly ReviewRecord[]
}

type DirectionReviewBundle = {
  schemaVersion: 1
  kind: "direction-review"
  id: string
  version: string
  languageRegistry: LanguageRegistryRef
  direction: { home: LanguageProfileRef; target: LanguageProfileRef }
  candidate: CandidateArtifactRef & { kind: "pair-pack" }
  suite: PublishedSuiteRef
  records: readonly ReviewRecord[]
  evidenceClass: DirectionEvidenceClass
}

type ReviewEvidenceBundle = ProfileReviewBundle | DirectionReviewBundle

type StructurallyValidatedReviewEvidence = {
  bundle: ReviewEvidenceBundle
  assurance: {
    metadata: "structurally-valid"
    evidenceBytes: "not-qualified"
    externalArtifactExistence: "not-qualified"
    evidenceTruthfulness: "not-qualified"
    suitePublication: "not-qualified"
    reviewerQualification: "not-qualified"
    humanReviewOccurrence: "not-qualified"
    linguisticCorrectness: "not-qualified"
    supportTier: "not-assigned"
  }
}

type SummaryItemSpec = {
  id: string
  order: number
  whenAll: readonly ClauseCondition[]
  values: Readonly<Record<string, RenderValuePath | ConditionPath>>
}

type SummaryCatalog = {
  locale: string
  version: string
  messages: readonly {
    id: string
    parts: readonly (
      | { kind: "literal"; text: string }
      | { kind: "value"; name: string }
    )[]
  }[]
}

type LimitationSpec = {
  code: string
  order: number
  whenAll: readonly ClauseCondition[]
  renderingKey: string
}

type LanguageProfile = {
  languageRegistry: LanguageRegistryRef
  id: CanonicalLanguageId
  version: string
  bcp47: CanonicalLanguageId
  autonym: string
  searchableNames: readonly string[]
  direction: "ltr" | "rtl"
  scripts: readonly string[]
  monolingualClauses: readonly Clause[]
}

type PairPack = {
  id: string
  version: string
  directions: readonly {
    languageRegistry: LanguageRegistryRef
    home: LanguageProfileRef
    target: LanguageProfileRef
    clauses: readonly Clause[]
    knownLimitations: readonly LimitationSpec[]
  }[]
}

type ModalityRecipe = {
  id: RecipeId
  version: string
  settingsSchemaVersion: number
  clauses: readonly Clause[]
  summaryItems: readonly SummaryItemSpec[]
  defaults: Omit<RecipeConfiguration, "schemaVersion" | "languageRegistry" | "recipe" | "promptSurface" | "languages">
  knownLimitations: readonly LimitationSpec[]
}

type CompilerPolicy = {
  version: string
  compatibleCompilerVersion: string
  invariantClauses: readonly Clause[]
  summaryItems: readonly SummaryItemSpec[]
  knownLimitations: readonly LimitationSpec[]
}

type CompilerInputs = {
  compilerVersion: string
  languageRegistry: CanonicalLanguageRegistry
  policy: CompilerPolicy
  configuration: RecipeConfiguration
  recipe: ModalityRecipe
  homeProfile: LanguageProfile
  targetProfile: LanguageProfile
  pairPack: PairPack | null
  promptSurface: PromptSurface
}
```

Conditions are data, not JavaScript/eval or prompt prose. Every condition in `whenAll` must match; an empty list always matches. `in` values are unique and lexically sorted. There is no implicit OR, negation, coercion, substring matching, locale comparison, or missing-value truthiness; authors create another clause for an alternative.

Renderings are typed parts, not string templates. Literal text that resembles `{{a placeholder}}` remains literal. Every selected `renderingKey` must resolve exactly once in the selected surface, and every value path must resolve; there is no substitution grammar or fallback text.

Selected clauses sort by numeric section, then integer `order`. Selected `(section, order)` pairs must be unique. For selected clauses with the same `effect.key`, the same value is a repeated-rule error and a different value is a conflict error. A refinement uses a distinct effect key, names a selected higher-authority effect, and cannot target an absent or same/lower-authority effect.

Selected summary items sort by unique integer `order`. Each item ID resolves exactly once in the selected summary catalog; its supplied value names must equal the catalog message's value names exactly. Parts concatenate without implicit whitespace, items join with one LF, and there is no locale fallback. Warnings sort by code; limitation codes preserve the selected-spec order defined below; validation errors sort by composition-stage ordinal, then code, then data path.

Validation stage ordinals are exact and stable:

| Ordinal | Stage | Scope |
|---:|---|---|
| 1 | `input-shape` | Unsafe object shape, unknown/missing fields, primitive types, schema version |
| 2 | `configuration` | Closed enums, modality/settings match, normalized-field compatibility |
| 3 | `artifact-identity` | Exact IDs/versions, policy/compiler compatibility, prompt-surface reference |
| 4 | `authored-data` | Conditions, origins/authorities, renderings, summaries, limitations, and structural review-evidence bindings |
| 5 | `pair-resolution` | Exact pack direction, ambiguity, separately byte/governance-qualified evidence, and derived support tier |
| 6 | `selection` | Selected orders, repeated/conflicting effects, refinements, limitations |
| 7 | `rendering` | Rendering keys/values, summary catalog, source-state contract |
| 8 | `budget` | UTF-8 prompt and destination instruction limits |

Within one stage, codes and data paths use exact UTF-16 code-unit order (`a < b`), never locale collation. An issue therefore carries the stage name; its ordinal is derived from this table rather than supplied by callers.

Selected limitation specs use the same exact `whenAll` evaluation as clauses. A code must be unique across compiler policy, recipe, and the selected pair direction; duplicates are errors. Specs sort by unique integer `order`, each `renderingKey` resolves exactly once through the selected `PromptSurface`, and their rendered text appears once in section 9. `CompileResult.limitationCodes` preserves that order. Generic, capability, and recipe limitations are authored specs, never free strings.

The allowed origin/authority matrix is exact: invariant→`invariant`; recipe→`normalized-setting`, `modality`, or `fallback`; pair-pack→`pair-pack`; profile→`profile`. Any other pairing is invalid. Recipe defaults are applied before selection; an explicitly supplied builder value wins during materialization, so compilation sees one normalized value rather than two competing clauses.

`LanguageProfile` and PairPack content own no embedded review claim. Profile and direction evidence are separate versioned bundles that bind exact content-addressed candidates. Bundle-local record IDs are externally identified by bundle id/version plus record ID. Every record exactly matches its bundle scope, candidate, published-suite definition, passing outcome, declared role, evidence reference, and calendar-valid date.

Community evidence requires an exact contribution and one or more referenced direction records whose declared role is `community-reviewer`. Reviewed evidence requires one or more referenced direction records whose declared role is `qualified-speaker`. Flagship evidence satisfies every Reviewed structural rule and adds a deterministic pass bound to the same candidate and suite plus an exact checker. Reference sets are nonempty, unique, code-unit sorted, resolve only within their named bundle id/version, and cover every direction record exactly once.

These evidence-class names are structural inputs, not automatic `SupportTier` outputs. The public Preview resolver derives Preview from one exact versioned directed pack and Generic from no exact pack; it does not consume review evidence. Profile evidence has no evidence class and can never assign a pair tier. “Continuous” means the exact Flagship suite pass is required again for every candidate hash; no date age, freshness, expiration, or monitoring rule exists.

`validateImmutableEvidenceRef` and `validateReviewEvidenceBundle` never read files or hash bytes. A successful bundle explicitly reports that evidence bytes, external artifact existence, evidence truthfulness, suite publication, reviewer qualification, human review occurrence, linguistic correctness, and support tier were not established. A separately validated build/release manifest must prove exact `(repoPath, sha256, byteLength)` bytes; governance must establish publication and human-role truth.

The pure Preview resolver accepts at most one pack containing the exact versioned direction. Zero exact matches yields Generic, one yields Preview, and more than one is `E-PAIR-AMBIGUOUS`. Generic composition uses profile identity metadata—IDs, autonyms, direction, scripts—for labeling only and emits no endpoint-specific linguistic guidance, including Japanese guidance. Profile clauses and relational clauses require an exact pack selection. Preview provenance explicitly states that the pair guidance is built in and versioned but has not completed external linguistic review.

## Validation

Validation is pure and returns stable ordered issue codes. Errors stop compilation; warnings appear in the result.

Errors include:

- Unknown field, enum, recipe/profile/version, or incompatible schema.
- Missing required field, registry version/hash mismatch, noncanonical/unlisted tag, alias/deprecated/grandfathered/private-use/extension tag, identical home and target profile, a missing pinned version, or prompt-surface ref/object mismatch.
- Zero/multiple active versions while materializing, missing pinned artifacts while compiling, or an unreviewed migration request.
- Modality/settings mismatch.
- Caller-supplied tier/pair pack/review claim.
- `register.strategy: preserve` with a level, or `adapt` without a level.
- Any V1 datum strategy other than `preserve-as-written`; conversion/normalization requires a later recipe-schema decision.
- Pair-pack endpoint-version mismatch, multiple exact packs, or tier-specific review-basis failure.
- Malformed/noncanonical evidence ref, invalid calendar date, candidate/suite/scope mismatch, duplicate/missing/cross-bundle/unreferenced record, wrong evidence-class role, or Flagship pass mismatch.
- Duplicate clause/rendering/summary/limitation ID; duplicate selected clause or limitation order; repeated/conflicting effect; invalid refinement; illegal origin/authority; or invalid condition.
- Missing or duplicate rendering key, unresolved render value, invalid Written source-state contract, or any profile/pair linguistic clause in Generic composition.
- Prompt over 12,000 UTF-8 bytes or known destination limit over 80%.
- Imported record over its size limit, unknown migration, or unsafe object shape.

Compiler warning codes are exact:

| Code | Condition known from configuration/result |
|---|---|
| `W-GENERIC-LIMITED` | Generic tier; no endpoint/pair linguistic guidance |
| `W-USER-EVIDENCE-UNKNOWN` | Active voice behavior depends on unknown input evidence |
| `W-ASSISTANT-OUTPUT-UNKNOWN` | Voice output capability is unknown |
| `W-INTERRUPTION-UNKNOWN` / `W-INTERRUPTION-UNAVAILABLE` | Voice interruption signal is unknown/unavailable |
| `W-SILENCE-UNKNOWN` / `W-SILENCE-UNAVAILABLE` | Voice silence signal is unknown/unavailable |
| `W-PLAYBACK-RATE-UNKNOWN` / `W-PLAYBACK-RATE-UNAVAILABLE` | Requested spoken pacing cannot assume rate control |
| `W-PRONUNCIATION-TRANSCRIPT` | Pronunciation support is active with text/transcript evidence |
| `W-PROMPT-BUDGET` | Canonical prompt exceeds 9,000 but not 12,000 UTF-8 bytes |

`W-USER-MODIFIED` is an application-state notice, not a compiler warning: the pure compiler never observes an editable control.

Source-dependent ambiguity, name reading, datum, or register facts cannot produce compiler warnings because PhraseGarden never receives source. Their invariant clauses and behavior summary state the conservative policy; the destination interaction may surface a case-specific note.

Unknown or missing social facts remain `unspecified`; validation never fills them from stereotypes, names, language, or relationship labels.

## Precedence

One conflict interpretation applies everywhere:

1. Immutable semantic, privacy, source-boundary, and evidence invariants.
2. One normalized setting value (an explicit builder choice has already replaced its declared default).
3. Modality contract.
4. Exact pair-pack realization.
5. Endpoint profile realization, allowed only with an exact qualified pair.
6. Recipe fallback clauses.

A lower layer may refine a named higher effect but not contradict it. Effect-key validation determines repetition/conflict without interpreting prose. Consent boundaries and epistemic force are never “adapted.” `preserve` is a first-class normalized value, not absence of a choice.

## Compile result and provenance

```ts
type ArtifactProvenance = {
  compilerVersion: string
  compilerPolicyVersion: string
  schemaVersion: 1
  languageRegistry: LanguageRegistryRef
  recipe: { id: string; version: string }
  homeProfile: LanguageProfileRef
  targetProfile: LanguageProfileRef
  pairPack: { id: string; version: string } | "none"
  supportTier: "flagship" | "reviewed" | "community" | "preview" | "generic"
  supportDirection: string
  supportReviewStatus:
    | "external-review-not-completed"
    | "not-applicable"
    | "qualified"
  supportReviewDate: string | "not-applicable"
  promptSurface: { id: string; locale: string; version: string }
}

type CompileResult = {
  canonicalPrompt: string
  summaryItems: readonly { id: string; values: Readonly<Record<string, string>> }[]
  warnings: readonly { code: string; severity: "notice" | "warning"; values: object }[]
  limitationCodes: readonly string[]
  normalizedConfiguration: RecipeConfiguration
  provenance: ArtifactProvenance
}

type RenderedSummary = {
  text: string
  catalog: { locale: string; version: string }
}
```

`compileRecipe(CompilerInputs)` emits semantic summary items and is independent of UI locale. `renderSummary(items, exactCatalog)` is a second pure domain function. The application returns both as the studio result, but the catalog/version is presentation provenance and never enters canonical prompt bytes.

The prompt's provenance section and canonical plain-text download contain every `ArtifactProvenance` field plus known limitation codes/text from the selected prompt surface. Preview says the exact pair-pack version is built in and external review is incomplete. Generic says `pair pack: none`; it never invents a version. Changing only the interface/catalog must leave `canonicalPrompt` and `ArtifactProvenance` byte-identical.

## Evaluation fixture and ledger envelopes

Source/conversation content and evaluator-supplied scenario context are test evidence, not recipe configuration. Immutable definition bytes never contain mutable provenance state:

```ts
type AcceptanceFixtureDefinition = {
  id: string
  revision: number
  family: string
  applicableSupport: "preview-en-ja"
  configuration: RecipeConfiguration
  providedContext: readonly {
    id: string
    language: string
    exactText: string
    appliesToTurnIndexes: readonly number[]
  }[]
  turns: readonly {
    index: number
    role: "source" | "learner" | "coach" | "control" | "host-event"
    language: string | "none"
    evidence: "text" | "transcript" | "audible-audio" | "host-signal"
    exactText?: string
    event?: "interrupt" | "silence" | "repeat" | "slower"
    annotations?: readonly {
      kind: "intentional-code-switch"
      startUtf8Byte: number
      endUtf8ByteExclusive: number
      language: string
      preservation: "verbatim"
    }[]
  }[]
  mustPreserve: readonly string[]
  mustNot: readonly string[]
  expectedWarningCodes: readonly string[]
  coverage: readonly {
    requirement: string
    expectedOwners: readonly (
      | "construction" | "validator" | "prompt"
      | "ui" | "semantic-evaluation" | "host-qualification"
    )[]
  }[]
}

type FixtureState =
  | "untouched holdout" | "prospective evaluation" | "exposed"
  | "development" | "regression" | "transport qualification"
  | "contaminated" | "unknown provenance"

type FixtureLedgerEvent = {
  fixture: { id: string; revision: number; definitionSha256: string }
  sequence: number
  at: string
  actor: string
  from: FixtureState | "unregistered"
  to: FixtureState
  reason: string
  influence: readonly string[]
  prospectiveEligible: boolean
  eligibilityEvidence: readonly string[]
}

type FixtureRunEvidence = {
  fixture: { id: string; revision: number; definitionSha256: string }
  freezeManifestSha256: string
  result: "pass" | "fail" | "invalid"
  failureClassification?: FailureClass
  rawEvidencePaths: readonly string[]
}
```

`FailureClass` is exactly: `compiler`, `recipe`, `language-profile`, `pair-pack`, `model-behavior`, `interface`, `accessibility`, or `unsupported-capability`.

`turn.index` is contiguous from zero. `exactText` is required for text/transcript/audio turns and forbidden for a no-text host event; `event` has the reverse rule. Context references valid turn indexes. Annotation offsets address decoded stimulus UTF-8 bytes and must fall on code-point boundaries without overlap.

The Gate 0 Markdown authoring form may name a configuration registry entry only when the complete bases, exact patches, merge algorithm, and pinned versions are contained in the same hashed definition artifact. Normalization expands that ref to the `RecipeConfiguration` value above before schema validation; missing/cyclic/unknown refs fail. Machine-readable Gate 2 fixtures store the expanded configuration and its source-registry ID/hash.

The immutable definition file and append-only ledger file are hashed separately. Current state is the `to` value of the highest valid sequence; it is a projection, not part of definition bytes. A freeze records the definition hash and the ledger snapshot/eligibility proof hash.

Every Gate 0 case is `development`; source turns, context, and expected outcomes are already exposed and influence this schema. Actual failure classification belongs to run evidence, not the fixture definition. Full lifecycle rules are in `EVALUATION.md`.

## Share payload V1

The URL fragment is a deliberately lossy share-safe projection, not serialized `RecipeConfiguration`:

```ts
type SharePayloadV1 = {
  shareVersion: 1
  languageRegistry: LanguageRegistryRef
  recipe: { id: RecipeId; version: string }
  promptSurface: VersionRef
  languages: { home: LanguageProfileRef; target: LanguageProfileRef }
  register: RegisterPreference
  ambiguity: RecipeConfiguration["ambiguity"]
  codeSwitching: "preserve"
  dataHandling: { strategy: "preserve-as-written" }
  titleHandling: RecipeConfiguration["titleHandling"]
  unknownName: RecipeConfiguration["unknownName"]
  settings: WrittenSettings | VoiceSettings | InterpreterSettings
}
```

No other path is permitted. In particular, `socialContext`, destination/host capabilities, local labels, free-form context/examples, source text, prompt or edits, audio, and history are omitted and reset to conservative defaults on import. Creating a link lists every nondefault omitted field; opening one labels the result as reconstructed from a privacy-reduced payload. Unknown keys or versions fail closed. A missing/different language-registry version or hash fails with the exact registry error unless a reviewed pure migration exists; it is never rebound silently.

## Examples

Flagship Written Translator:

```json
{
  "schemaVersion": 1,
  "languageRegistry": {
    "version": "2026-08-17.1",
    "contentSha256": "498C0F6963F31E9FF21028F52AAD112F2A04453BF7BB4EFD0521A381ECEAECF5"
  },
  "recipe": {"id": "written-translator", "version": "1.0.0"},
  "promptSurface": {"id": "instructions-en", "version": "1.0.0"},
  "languages": {
    "home": {"id": "en", "version": "1.0.0"},
    "target": {"id": "ja", "version": "1.0.0"}
  },
  "socialContext": {"relationship": "coworkers", "hierarchy": "peers"},
  "register": {"strategy": "preserve"},
  "ambiguity": "ask-if-blocking",
  "codeSwitching": "preserve",
  "dataHandling": {"strategy": "preserve-as-written"},
  "titleHandling": "preserve-marked-title",
  "unknownName": "preserve-and-ask",
  "destination": {
    "userEvidence": "text-or-transcript",
    "assistantOutput": "text",
    "interruptionSignal": "unavailable",
    "silenceSignal": "unavailable",
    "playbackRateControl": "unavailable"
  },
  "settings": {"modality": "written", "outputDetail": "concise"}
}
```

Flagship Live Voice Coach changes the recipe/settings and declares capabilities:

```json
{
  "recipe": {"id": "live-voice-coach", "version": "1.0.0"},
  "destination": {
    "userEvidence": "text-or-transcript",
    "assistantOutput": "spoken",
    "interruptionSignal": "unknown",
    "silenceSignal": "unknown",
    "playbackRateControl": "unknown"
  },
  "settings": {"modality": "live-voice", "correction": {"timing": "after-turn", "focus": "balanced"}, "pronunciation": "on-request", "teachingDepth": "brief", "pace": "natural"}
}
```

The omitted common fields are identical to the first example; this is explanatory shorthand only, not valid serialized configuration.

Generic fallback uses any two distinct bundled profiles with no exact pack. The configuration does not say “generic”; resolution emits `supportTier: "generic"`, `pairPack: "none"`, and the generic limitation warning.

## Fixture expressiveness

| Fixture family | Configuration/fixture fields |
|---|---|
| Negation, consent, certainty/hearsay | immutable invariants + exact stimulus and semantic oracle |
| Omitted referents | `ambiguity`, exact `turns`, `providedContext` only |
| Register/hierarchy | `socialContext`, `register` |
| Honorific/title | `titleHandling`, known versus unspecified context |
| Unknown reading | `unknownName`, evidence/capabilities |
| Dates/numbers/address/zone | `dataHandling`, exact stimulus |
| Slang/sarcasm/affection/anger/profanity | relationship/register plus exact `providedContext`; force remains invariant |
| Code-switching | fixed preserve policy, mixed-language turn, byte-range annotations, and target-collapse oracle |
| Prompt-like source | role `source`, exact bytes, source-boundary invariant |
| Transcript pronunciation | `destination.userEvidence`, `pronunciation`, transcript turn |
| Interrupt/silence/repeat/slower | exact ordered turns, fixed voice contract, typed host events, and declared capabilities |

Thus every flagship case is represented without turning arbitrary source content into a user setting or placing Japanese-specific concepts in the universal recipe ontology. Generic output receives endpoint identity labels only, never Japanese linguistic guidance.
