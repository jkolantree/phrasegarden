# Release notes

## 0.1.0-preview.5 — a clearer path from choice to copy

Status: source target; package, publication, and deployment are version-bound

### Product behavior

- Leads with the outcome and one **Make my instructions** fast path instead of
  requiring people to understand prompt terminology or open a Builder first.
- Uses task-language labels for tools and language controls: Translate writing,
  Practice speaking, Translate a conversation, Text is in, Translate to,
  Explain in, Practice in, and Turn is in.
- Places optional relationship, tone, and detail controls first in Builder;
  complete protection detail remains available through progressive disclosure.
- Keeps the honest support and limitation summary before Copy while fitting the
  primary handoff into the first 320 × 900 Review viewport.
- Keeps the complete generated instructions visible, focusable, editable, and
  byte-identical for Copy and Download inside a bounded reading area.
- Moves focus into the editor and deliberately manages the discard-edits
  alertdialog.
- Labels `pt` visibly as Portuguese with region unspecified; canonical identity
  and generated instruction bytes are unchanged.

### Deterministic boundary

The compiler, profiles, pair pack, recipes, generated instruction surface,
support resolution, and prompt snapshots are unchanged. The English behavior
summary advances to `1.3.0` for plain-language task descriptions only. Preview 5 adds no
runtime model detection, model chooser, new language, backend, persistence,
telemetry, or linguistic-review claim.

### Evidence boundary

Source, package, Pages, accessibility, and public-byte outcomes are established
only by their version-bound verification records. This note does not promote
Preview English↔Japanese guidance to Reviewed or claim WCAG conformance.

## 0.1.0-preview.4 — desktop fold correction and closed release path

Status: source target; package, publication, and deployment are version-bound

### Product behavior

- Carries forward Preview 3's Interpreter, expanded Generic language catalog,
  beginner-facing journey, and optional Advanced settings without changing
  compiler, prompt, recipe, language, support-tier, privacy, or runtime
  semantics.
- Tightens wide/short Home spacing so the primary action remains within the
  locally reviewed 1280 × 720 initial viewport.

### Release tooling

- Uses closed Preview 3/4 release specifications, pinned package and verifier
  adapters, immutable Preview 3 predecessor bindings, and a main-only Pages
  selector that deploys no rebuilt bytes.
- Static policy and synthetic fixtures prove deterministic structure only;
  they do not establish a workflow run, artifact, deployment, or public byte.

### Evidence boundary

No Preview 4 source freeze, release package, tag, GitHub release, Pages
deployment, external English↔Japanese linguistic review, accessibility
conformance, or stable-readiness claim exists from this source record alone.
Preview 3 release assets are byte-qualified; its Pages run did not deploy, and
Preview 2 is the qualified Pages rollback. Preview 4 publication and deployment
status come only from its version-bound evidence and corresponding public state.

## 0.1.0-preview.3 — Interpreter, more language choices, and simpler setup

Status: prerelease record; publication status is version-bound

### Product behavior

- Adds a plain-language one-way Interpreter from the configured home language
  into the configured target language; reversing direction requires a new
  prompt after swapping languages.
- Adds complete-turn and short-relay controls plus ask-or-mark clarification
  behavior.
- Keeps the Review handoff synchronized with the selected complete-turn or
  short-relay unit.
- Keeps the modality channel-neutral and makes no audio, speaker, silence,
  interruption, or turn-boundary capability claim.
- Reorganizes existing uncommon relationship, ambiguity, name/title, and
  destination-capability controls behind one native **Advanced settings**
  disclosure. Defaults and effective prompt behavior are unchanged.
- Adds identity-only profiles for French, German, Italian, Spanish, and
  region-unspecified Portuguese. Every direction using them remains Generic;
  they add no endpoint-specific guidance, regional variety, or review claim.
- Explains up front that PhraseGarden makes reusable instructions rather than
  translating text itself, keeps direct creation prominent, and presents
  language names with autonyms instead of visible codes or flags.

### Deterministic compiler

- Adds Interpreter recipe `1.0.0`.
- Advances compiler policy to `1.1.0`, English prompt surface to `1.1.0`, and
  English summary catalog to `1.2.0`; the compiler implementation/version,
  English↔Japanese pair-pack authored clauses and version, and provenance
  schema are unchanged.
- Adds five identity-only language profiles at profile version `1.0.0` and
  advances the canonical registry to `2026-08-17.1`, SHA-256
  `498C0F6963F31E9FF21028F52AAD112F2A04453BF7BB4EFD0521A381ECEAECF5`.
  Provenance records that exact registry identity, and all new directions
  deterministically resolve to Generic.
- Preserves the published sample files and locks exact Preview 3 Interpreter
  prompt hashes for both Preview directions and a Generic direction.
- Makes pair-specific name and honorific guidance defer to the active name and
  clarification rules, so mark-uncertainty contains no ask-capable instruction.

### Publication state

- Interpreter and Advanced settings are committed and independently reviewed as
  product code. That review establishes no package, remote, release,
  deployment, or production claim; each is recorded only when its named
  qualification stage and version-bound evidence pass.

### Tests and QA

- Adds axe checks for Advanced-open Written and Voice Builder states and Voice
  Review, plus a 320 px Voice-open overflow regression.
- Runs twelve sequential Microsoft Edge journeys and captures a 2026-08-18 320 px
  Written Builder with Advanced settings closed alongside the open-state
  coverage.
- Pages extracts, verifies, tests, and deploys the exact checked-in qualified
  archive instead of rebuilding a second deployment artifact.

### Known limitations

External English↔Japanese linguistic review, Japanese interface localization,
cold-offline refresh, persistence, sharing, and the manual screen-reader,
real-device IME, forced-colors, actual-zoom, mobile, offline, and broad
browser/OS matrices remain incomplete. This prerelease does not claim Gate 3
exit, stable readiness, or WCAG conformance.

## 0.1.0-preview.2 — usability Preview update

Date: 2026-07-24

### Product behavior

- Replaced the mandatory Builder stop with direct prompt creation from Home;
  optional settings remain available when a visitor wants more control.
- Rewrote the main journey in plain language so visitors learn what the
  product makes, what their choices mean, and where the result goes.
- Kept primary actions visible in initial desktop and narrow mobile viewports.
- Added explicit destination handoff and modality-aware privacy guidance.
- Added visible Copy and Download outcomes.
- Preserved an edited prompt across app navigation, requires confirmation
  before replacement, and uses the browser's native warning before tab close
  or refresh.

### Deterministic compiler

- Unchanged. Compiler `0.1.0-preview.1`, recipes, profiles, pair pack,
  generated instructions, prompt snapshots, and canonical prompt bytes remain
  identical.

### Tests and QA

- Added complete interface-label coverage and direct-versus-optional canonical
  equality checks.
- Expanded sequential Playwright/axe coverage for first-viewport actions,
  Browser Back, edited-draft protection, visible handoff failures, and a real
  loaded-session offline path.
- Passed 271/271 unit and snapshot tests, both TypeScript configurations, the
  production build, release audit, deterministic-domain scan, and 9/9
  sequential Microsoft Edge browser journeys before packaging.
- An independent read-only review returned PASS with no open P1/P2/P3 finding
  against a quiescent 20-file fingerprint.

### Known limitations

Preview linguistic review, Interpreter, Japanese interface, offline refresh,
local persistence, sharing, and the manual assistive-technology matrix remain
deferred. See [LIMITATIONS.md](LIMITATIONS.md).

Versioned release:
<https://github.com/jkolantree/phrasegarden/releases/tag/v0.1.0-preview.2>

GitHub Pages:
<https://jkolantree.github.io/phrasegarden/>

## 0.1.0-preview.1 — public Preview

Date: 2026-07-23

### Product behavior

- Added the Woven Conversation home, builder, and generated-prompt review flow.
- Added English→Japanese and Japanese→English Preview generation.
- Added conservative Generic generation for every other bundled direction.
- Added Written Translator and Live Voice Coach controls and summaries.
- Added local copy, explicit local editing, regeneration confirmation, and
  exact UTF-8 plain-text download.

### Deterministic compiler

- Added exact version materialization, directed-pair resolution, pure
  compilation, stable section order, typed rendering, prompt budgets, warnings,
  limitations, and full provenance.
- Added the non-review `preview` tier without changing future review-evidence
  semantics.
- Preserved strict Generic isolation and rejected caller-supplied tier claims.

### Tests and QA

- Added five canonical prompt snapshots and compiler negative fixtures.
- Added prompt-artifact byte-boundary tests.
- Passed 270/270 unit and snapshot tests, both TypeScript configurations, the
  production build, release-byte audit, and a zero-match deterministic-domain
  API scan.
- Passed 4/4 sequential Microsoft Edge Playwright/axe journeys.
- Added sequential Playwright and axe journeys for Preview, Voice, Generic,
  editing, copy/download, keyboard, mobile, bidi, reduced motion, zoom/reflow,
  and runtime network isolation.
- Fixed Windows download newline rewriting by encoding explicit UTF-8 bytes.
- Fixed IME composition commits, keyboard skip-link focus, correction-focus
  summary synthesis, and a duplicate Preview notice in review.

### Known limitations

See [LIMITATIONS.md](LIMITATIONS.md). Most importantly, Preview pair guidance
has not completed external linguistic review; Generic has no pair-specific
guidance; there is no runtime AI, persistence, service worker, Japanese
interface, or completed assistive-technology matrix.

Public source:
<https://github.com/jkolantree/phrasegarden>

Versioned release:
<https://github.com/jkolantree/phrasegarden/releases/tag/v0.1.0-preview.1>

GitHub Pages:
<https://jkolantree.github.io/phrasegarden/>
