# PhraseGarden architecture contract

Status: Gate 0 source of truth  
Updated: 2026-07-23

## Shape and dependency boundaries

PhraseGarden is a GitHub Pages-compatible static application built with TypeScript, Vite, and Preact. The shipped application has no server API and makes no model call.

```text
src/domain   pure types, normalization, validation, compilation, provenance
src/packs    versioned monolingual profiles and directional relational pair packs
src/recipes  versioned modality definitions and authored prompt clauses
src/locales  UI messages, behavior-summary renderings, accessibility labels
src/ui       stateless or local presentation components
src/app      interaction state, storage/share adapters, application composition
tests        fixtures, snapshots, browser/a11y, release/privacy checks
```

Dependencies point inward: `app → ui/domain/data`; `ui → domain types`; `domain → no Preact, DOM, storage, network, clock, randomness, or browser global`. Packs, recipes, prompt surfaces, and summary locale catalogs are immutable explicit inputs to their respective pure domain functions. Evaluation tooling is development-only and cannot enter the runtime bundle.

## Canonical transformation

```text
RecipeConfiguration
+ exact CanonicalLanguageRegistry
+ exact CompilerPolicy
+ exact LanguageProfile for each endpoint
+ zero or one exact-direction PairPack
+ exact ModalityRecipe
+ exact authored PromptSurface
→ CompileResult {
    canonicalPrompt,
    summaryItems,
    warnings,
    limitationCodes,
    provenance,
    normalizedConfiguration
  }

summaryItems + exact UI-locale SummaryCatalog
→ RenderedSummary { text, presentationProvenance }
```

`materializeSelection(selection, catalogManifest)`, `resolveArtifacts(configuration, catalogs)`, `compileRecipe(inputs)`, and `renderSummary(items, catalog)` are synchronous and pure. The materializer pins exactly one active recipe/profile/prompt-surface version and one exact bundled language-registry version/hash, then applies defaults. The resolver accepts exactly matching pinned artifacts and zero or one exact-direction pack; multiple matches fail. Frozen input bytes produce byte-identical output bytes. No function reads storage, infers locale, inspects a user agent, fetches, uses a clock, creates random IDs, or silently selects newer data.

### Composition algorithm

1. Parse the version-pinned configuration and exact artifacts with closed schemas; reject unknown keys and incompatible/missing versions.
2. Verify every identity-bearing artifact pins the supplied language-registry version/hash; then require `LanguageProfile.id === LanguageProfile.bcp47` and exact canonical-cased registry membership for profiles and endpoint refs. Verify defaults already materialized, explicit `unspecified` states, modality match, and exact endpoint objects.
3. Resolve zero/one exact versioned direction. Zero yields Generic/`pairPack: none`; one yields Preview for this candidate; multiple yields `E-PAIR-AMBIGUOUS`. Future evidence-qualified tier promotion is a separate resolver and is not inferred here.
4. Evaluate every typed clause condition by exact equality/membership; all conditions must match. No eval, coercion, OR, negation, substring, or locale comparison exists.
5. Validate the origin/authority matrix, unique IDs, unique selected `(section, order)`, and each effect/refinement link.
6. Group selected effects by key. Same key/same value is repetition; same key/different value is conflict. Either stops compilation; there is no last-writer-wins or prose interpretation.
7. Resolve each selected rendering key exactly once in the chosen authored prompt surface. Render typed literal/value parts only; no placeholder grammar or fallback exists.
8. Sort by numeric section and integer order, render with LF, and reject any pair/profile linguistic clause in Generic composition.
9. Select typed limitation specs by the same conditions, reject duplicate codes/orders, resolve each rendering exactly once into section 9, enforce the prompt budget, and derive stable summary items/warnings/limitation codes from the same normalized inputs.
10. Attach artifact provenance. Summary localization is a separate pure render whose catalog provenance never enters canonical prompt bytes.

### Authority and ownership

| Authority, highest first | Owns | Cannot be overridden by |
|---|---|---|
| Immutable semantic/privacy/capability invariants | no invention, consent and certainty preservation, source-as-data, evidence limits | any setting, recipe, profile, or pack |
| Normalized setting | one explicit choice, or its documented default after materialization | fallback or inferred context |
| Modality contract | written versus live procedure and interaction semantics | pair wording |
| Exact pair-pack realization | relational EN↔JA guidance for the selected direction | generic fallback or a monolingual profile |
| Endpoint profile realization | language-local rules only under an exact selected pack | unrelated pair guidance |
| Recipe fallback | conservative non-setting behavior | every authority above |

Pair packs and profiles are refinements, not competing instruction streams. A rule has one semantic owner and may be rendered once. When an explicit register request would weaken a refusal, change certainty, invent status, or otherwise violate a higher invariant, meaning wins and a warning explains that the preference was bounded.

### Fixed prompt section order

1. Identity and purpose
2. Language direction and support scope
3. Non-invention and meaning invariants
4. Modality procedure
5. Explicit context and selected controls
6. Exact pair guidance, when present
7. Output or turn-taking contract
8. Source-data and clarification boundary
9. Capability limitations and recovery behavior
10. Compiler and content provenance

Generic output omits section 6 and all profile/pair linguistic clauses. It may render endpoint IDs, names, and autonyms as identity labels, but no Japanese-specific or other endpoint-specific linguistic guidance. English↔Japanese realizations appear only from the exact versioned Preview direction and carry an explicit external-review limitation.

## Summary, prompt editing, and bytes

The domain emits semantic summary items with stable IDs and values. A pure locale renderer maps those items through a bundled locale catalog. Missing locale messages fail validation; UI components never compose substitute claims. Changing interface locale changes only presentation, not the canonical prompt or semantic summary.

The application retains the compiler's immutable canonical output separately from the editable textarea value. The first UI edit sets application state `artifactState: user-modified`; artifact provenance continues to identify the source compilation but the app removes any byte-equivalence claim and emits its own notice. The compiler never observes editing state. Regenerate is explicit and never silently overwrites edits.

Canonical prompt/download bytes are UTF-8 without BOM, LF line endings, and one terminal LF. The initial hard budget is 12,000 UTF-8 bytes; warning starts at 9,000 bytes. An export adapter with a known platform instruction limit uses the lower of 12,000 bytes and 80% of that documented limit. No platform limit is assumed for the generic portable download.

## Source and interaction boundary

PhraseGarden compiles instructions, not source text. Written Translator V1 is a source-state protocol with no in-band command prefix: after installation, the next user message is source data, including quoted, fenced, system-like, or prompt-like content. If the destination asks a blocking clarification, exactly the reply supplies context for the pending source; after output, the next message is new source. Behavior changes happen by regenerating/editing the portable prompt or starting a new destination session. Source-looking commands never gain authority and delimiter collision does not exist.

Live Voice Coach uses semantic control intents—interrupt, wait, repeat, slower—not typography. A portable prompt can prescribe model behavior but cannot guarantee host-level microphone interruption, silence timing, playback speed, or audio access. Declared capabilities and limitations are visible in the result.

## Language and tier resolution

V1 accepts two distinct entries from the bundled searchable language catalog; arbitrary user-entered identifiers are not accepted. One bundled, immutable PhraseGarden canonical-tag registry supplies the exact accepted identities. Its version and source-byte SHA-256 are pinned in profiles, pair directions, configurations, share payloads, compiler inputs, and provenance. The initial version rejects aliases/deprecated forms, grandfathered tags, private-use tags, extensions, casing variants, and unlisted tags. It uses no ambient `Intl`, network, clock, host locale, or environment canonicalizer.

`LanguageProfile.id` and `LanguageProfile.bcp47` are byte-identical. Profile version is independent. Regional/script variants can coexist only through separately listed canonical tags and versioned profiles and still must be distinct for a recipe that requires translation. Registry membership does not itself make a language selectable; a bundled profile is still required.

Pair identity is directed: canonical home tag, target tag, exact profile versions, and the exact registry reference. A relational pack lists every covered versioned direction separately but contains no review evidence. Profile and direction review bundles stand beside their content-addressed profile/PairPack candidates; this avoids a candidate↔evidence hash cycle.

Gate 2I validates only closed evidence metadata and exact internal scope/candidate/suite/record bindings. It never reads referenced bytes, proves external artifact existence or evidence truthfulness, checks a clock, validates suite publication or reviewer identity/competence, proves a human act, or assigns a support tier. Candidate, suite, checker, contribution, and evidence references use canonical repository-relative paths, exact hashes, and byte lengths. A later build/release manifest must qualify those bytes, governance must qualify publication, truthfulness, and reviewer-role claims, and a later resolver must combine the exact PairPack with its separately qualified direction bundle. Missing or mismatched candidate/suite/checker evidence invalidates structural qualification; elapsed-time “staleness” does not exist.

Imported settings cannot claim a tier or pair-pack ID. More than one matching pack fails. In this public candidate, one exact versioned direction derives Preview and zero derives Generic. Preview claims only built-in versioned guidance with external review incomplete; Generic carries no review claim and permits no endpoint/pair linguistic clauses. A later evidence resolver may promote an exact qualified direction without changing these evidence validators.

## State, persistence, and sharing

Before Gate 4, builder state is memory-only. Gate 4 adds:

- Explicit save only; no autosave of source content, audio, history, generated prompt, or edits.
- Versioned canonical JSON records in same-origin `localStorage`, validated before use, with an application cap of 256 KiB and a 16 KiB record cap.
- The exact field allowlist in `SharePayloadV1`; social context and destination capabilities are privacy-reset even when structured.
- JSON import/export as an explicit file action. Imports are capped at 64 KiB, reject unknown fields/versions, and migrate only through reviewed pure migrations. Missing or mismatched language-registry refs produce a clear registry-version/hash failure unless such a migration is explicitly defined.
- Clear-local-data that enumerates and removes PhraseGarden keys only.
- Quota, corruption, and migration failures that preserve existing bytes and give a recoverable export option.

Share links use a versioned URL fragment containing at most 4 KiB of canonical, base64url-encoded `SharePayloadV1`. Parsing is fail-closed and never executes content. Fragments are not sent in normal HTTP requests, but can appear in history, screenshots, clipboard managers, extensions, or synchronization; the UI states this. Relationship/hierarchy, host capabilities, free-form examples/details, prompt text, edits, audio, and learning history are omitted and reset by construction.

## Offline and release shape

All runtime assets are same-origin and bundled: no third-party fonts, CDN scripts, trackers, or remote images. Gate 3 proves that an already loaded session continues after network loss. Gate 5 adds a versioned service worker for reload/restart-capable offline use, atomic cache upgrades, stale-cache recovery, and same-origin app-shell assets only.

The release is a static `dist/` tree using relative/base-path-safe URLs, plus source, licenses, versioned downloadable bundle, checksums, release notes, support/review data, governance, contribution rules, and a GitHub Pages workflow. Publishing remains a separate confirmed action.

GitHub Pages cannot set arbitrary response headers. Gate 5 uses the strictest tested HTML meta CSP available and documents that `frame-ancestors`, CSP reporting, and some header-only protections cannot be supplied by meta policy. No stronger claim is made.

## Accessibility and internationalization

- Semantic HTML and native controls first; logical DOM order survives responsive layouts.
- Separate `lang` for page/interface and for language-specific names, examples, summaries, and prompt regions; `dir` is data-driven.
- `bdi`/Unicode isolation prevents mixed-direction labels from reordering surrounding UI.
- CJK line breaking, vertical metrics, ruby fallback, grapheme-safe limits, and combining marks are tested with real strings.
- Composition events protect IME input; validation never fires on incomplete composition.
- Keyboard focus is visible, not color-only, and returns predictably after dialogs/download notices.
- Status and copy feedback use restrained live regions; generated text remains selectable and editable.
- 200% and 400% zoom reflow without two-dimensional scrolling for the main journey.
- Motion is optional, nonessential, and disabled by `prefers-reduced-motion`.
- Tier and warning states use text plus structure/iconography, never color alone.

Automated axe/Playwright results support, but never replace, keyboard, screen-reader, zoom, IME, CJK, bidi, and reduced-motion inspection.

## Privacy and security boundaries

PhraseGarden never submits recipe content. Static hosts still receive ordinary asset requests. Sensitive text is rendered as text, never injected as HTML. URL fragments and imported JSON are untrusted; validators reject unknown keys, oversized input, dangerous numeric shapes, invalid Unicode policy, and incompatible versions. Bidi controls are preserved as data where meaningful but surfaced in import/review warnings.

Downloads use fixed media types, sanitized bounded filenames, and Blob URLs revoked after use. Clipboard failure is reported without destructive fallback. Gate 5 verifies a restrictive CSP, no unintended fetch/XHR/beacon/WebSocket requests, no source maps or local paths in release output, sanitized asset metadata, and controlled service-worker scope.
