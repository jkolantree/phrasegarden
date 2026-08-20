# PhraseGarden selected design contract

Status: Accepted Gate 1 visual target  
Direction: Woven Conversation  
Source: displayed concept 2  
Selected: 2026-07-23

## Source integrity

The visual source is `call_OtXkWpOXcd0MRy3nkREnZlDY.png`, a 1487 × 1058 PNG with SHA-256 `012423F5903421F34E97B2353FDD4DC4A4E63CEEC7EC5FCC19057DC14FA5E2D1`.

The source fixes visual hierarchy and character, not literal implementation markup or availability. Native semantic controls, gate scope, accessibility, exact product copy, and deterministic behavior override any ambiguous bitmap detail. The mock is selection evidence, not a production asset.

## Product expression

PhraseGarden is a bilateral workspace: what the user brings and how it should land stay visibly connected. Language rails identify direction; a connective synthesis explains behavior. The metaphor never implies that PhraseGarden receives private source text, scores translation quality, or calls a model.

Three adjectives govern every screen:

- **Connected:** related choices visibly converge on one behavior summary.
- **Candid:** support tier, limitations, privacy, and provenance are plain text.
- **Calm:** generous space and restrained rules replace dashboards, card grids, and gamification.

## Gate-aware availability

The complete direction specifies later surfaces, but each implementation gate exposes only working features:

| Capability | First eligible gate |
|---|---:|
| English → Japanese Written Translator builder, summary, prompt review, Copy, Download | Gate 3 first slice |
| Language swap | Gate 3 item 1 |
| Generic pairs | Gate 3 item 2 |
| Live Voice Coach | Gate 3 item 3 |
| Interpreter | Gate 3 item 4 |
| Advanced controls | Gate 3 item 5 |
| Save, Your recipes, library, import/export, fragments, clear data | Gate 4 |
| English/Japanese language-entry vertical | Approved next-preview source package; development-only until Japanese review |
| Additional interface locales and full locale hardening | Gate 5 |

Controls and navigation for a later gate are absent, not disabled or advertised.

## Information architecture

### Global shell

- Wordmark links to Homepage.
- Current-gate primary navigation follows the availability table.
- The header ends with precise, plain privacy status:
  `Session only · not saved`. Recipe choices, generated prompts, and local
  edits remain in memory only and disappear on refresh or close. This does not
  describe the ordinary asset request needed to load the hosted page.
- A prominent strip immediately below the header begins with `Start in your
  language`. Before semantic work it offers native-button actions presented as
  conspicuous text links: `English → 日本語` and `日本語 → English`. After work
  begins it is relabeled `Page language` and makes no preset claim.
- The active choice is conveyed by text, `aria-pressed`, border, and forced-
  colors focus/current treatment rather than color alone. Embedded language
  runs carry exact language attributes; the two actions remain at least 44 px.
- At 320 × 900 the strip reflows without horizontal scrolling and the direct
  creation action remains in the initial viewport. Informative copy is not
  hidden to recover height.
- Locale changes keep focus on the activated control and announce whether a
  fresh starting direction was applied or existing work was preserved.
- Header content remains usable at 400% zoom and wraps rather than truncates.

### Homepage

- Hero interaction is the paired language rail: textual language name plus autonym, no flags.
- The first paragraph explains that a prompt is a set of instructions to paste
  into another AI or language tool; users never enter source text here.
- Selecting the pair reveals its exact support tier and limitation statement.
- Tool choice follows immediately.
- One primary `Create my prompt` action compiles the selected safe defaults
  directly. `Adjust optional settings` is a secondary action into Builder.
  Returning from Builder or Review preserves any current prompt for the
  session.
- On narrow screens before any artifact exists, a compact Quick start repeats
  the current direction and tool above the detailed selectors and offers
  `Create with these choices`. It is an actual generation action, not another
  gate; the complete selectors remain immediately below.
- Privacy and portability are short proof statements, not feature cards.
- No source text field appears.

### Builder

- Pair header: Home rail, native Swap button, Target rail.
- Tool choice precedes settings.
- Desktop uses two meaningful columns:
  - `CONVERSATION CONTEXT (OPTIONAL) · {home autonym}` owns relationship and source-side preferences.
  - `HOW THE RESULT SHOULD SOUND (OPTIONAL) · {target autonym}` owns destination register and teaching preferences.
- Shared safeguards span both columns.
- A full-width summary titled `Your prompt asks the tool to` contains the
  plain-language behavior summary.
- The primary action follows the summary.
- Advanced settings use one native disclosure and appear only when their Gate 3 item is eligible.
- The builder never accepts source prose, relationship prose, audio, or prompt text.

### Generated-prompt Review

- The exact support tier, warnings, and known limitations appear before the
  handoff actions in reading and focus order and remain visible. At desktop
  widths, notices and handoff sit side by side so Copy is visible in the
  initial 1280 × 720 Review viewport; narrow layouts retain one-column order.
- A short handoff block says the destination must accept instructions, gives
  the paste order for the selected modality, and states that the destination's
  privacy policy applies.
- Copy and Download are adjacent primary peers in that handoff block and give
  restrained visible success or failure feedback.
- The behavior summary follows as three honest textual groups: `Keep`, `Change
  only when you ask`, and `Follow these choices`. The third group keeps
  selected operation and support behavior separate from preservation or
  adaptation claims.
- The English generated prompt uses one reading surface no wider than 68 characters per line.
- Editing creates a visibly labeled `Your edited copy`; immutable canonical output remains available for regeneration.
- Internal navigation preserves that edited copy. Any action that would replace
  it requires explicit confirmation; refresh or close receives the browser's
  native leave warning.
- Provenance is a disclosure after the prompt and includes every required version and limitation.

### Local Recipe Library

- Appears only in Gate 4.
- One semantic list/table with recipe name, home and target autonyms, tool, tier, version, and modified time.
- Language direction is also present in accessible text; colored rails are supplemental.
- Search and Import are supporting actions. Export belongs to each record and to a selected multi-record action only if later justified.
- Clear local data is separated, explicit, and confirmable.

## Responsive layout

| Range | Contract |
|---|---|
| `< 600 px` | One column. A current-choice Quick start action is visible in the initial 320 × 900 viewport, then language rails stack with persistent `HOME` and `TARGET` text. Summary appears before the Builder action. No connective gutter. |
| `600–959 px` | One column for settings with a compact horizontal pair header. Shared safeguards remain full width. |
| `≥ 960 px` | Maximum width 1280 px. Home places the language direction in a seven-column area and the selected support/tool/action in a five-column task area so the direct action is visible in the initial 1280 × 720 viewport. Builder uses 5 columns per language side around a 2-column connective gutter; its summary spans columns 3–10. |

Page gutters are 16 px, 24 px, and 40 px at the three ranges. Layout reflows by available CSS pixels so browser zoom triggers the same safe stacked states. Nothing requires horizontal page scrolling at 320 CSS px.

## Spacing and shape

- Spacing scale: 4, 8, 12, 16, 24, 32, 48, and 64 px.
- Minimum target size: 44 × 44 CSS px; adjacent targets retain at least 8 px separation.
- Control radius: 8 px. Surface radius: 12 px. Pills are reserved for compact status only.
- Base surface and spacing create hierarchy first; dividers second; tint third; borders fourth; shadow last.
- No card nesting. List rows remain rows, not separate floating cards.
- One low elevation may distinguish a sticky desktop summary; all other separation uses rules or tint.

## Color tokens

| Token | Value | Required use |
|---|---|---|
| Canvas | `#F7F3EA` | Main linen background |
| Surface | `#FFFEFB` | Inputs and reading surfaces |
| Ink | `#1B2340` | Primary text; 13.93:1 on Canvas |
| Muted ink | `#5A6175` | Secondary text; 5.57:1 on Canvas |
| Home indigo | `#3B4694` | Home rail/action; white is 8.43:1 |
| Target coral | `#A94145` | Target rail; white is 5.95:1 |
| Synthesis teal | `#0B6664` | Synthesis/action; white is 6.78:1 |
| Focus violet | `#6B31C8` | Focus outline; 6.54:1 on Canvas |
| Control edge | `#767C8F` | Essential control boundary; 3.76:1 on Canvas |
| Error | `#9F2D3B` | Error text/rule; 6.51:1 on Canvas |

Color never carries language identity, selection, support tier, warning, error, or focus by itself. Forced-color and high-contrast modes use system colors rather than preserving brand fills.

## Typography

- Candidate locally bundled families: `IBM Plex Sans` for Latin UI and `Noto Sans JP` for Japanese and mixed Japanese runs. No CDN or runtime font request.
- System fallback: `system-ui, "Yu Gothic UI", "Hiragino Kaku Gothic ProN", sans-serif`.
- Before Gate 3 UI implementation, verify exact font licenses, shipped weights, file sizes, Japanese glyph coverage, and fallback metrics.

| Role | Size / line height |
|---|---|
| Metadata | 14 px / 1.45 |
| UI and body | 16 px / 1.55 |
| Japanese UI/body | 16 px / 1.75 |
| Leading summary | 18 px / 1.55 |
| Section heading | 24 px / 1.25 |
| Page heading | `clamp(2rem, 4vw, 3.5rem)` / 1.08 |
| Prompt text | 16 px / 1.7 |

Japanese never inherits uppercase transformation, italics, or Latin tracking. Mixed-language spans receive exact `lang` attributes. CJK line breaking is natural; user-controlled strings use bidirectional isolation and grapheme-safe truncation only where truncation is unavoidable.

## Controls and interaction states

- Use native button, select, radio, checkbox, input, and `details` behavior wherever it satisfies the interaction.
- Default, hover, focus, selected, disabled, warning, and error remain distinguishable without motion or color.
- Keyboard focus is a 3 px Focus Violet outline with 3 px offset. It is never suppressed on pointer use if the browser exposes `:focus-visible`.
- Error messages identify the field, state the correction in text, and appear in a summary linked to invalid controls.
- Builder focus order follows visual/task order and does not jump between columns.
- No drag-only, hover-only, long-press-only, or precision-pointer interaction exists.
- Behavior-summary announcements use one polite live region updated after a committed selection, not on every navigation keystroke.

## Support-tier treatment

- Exact tier is always textual: `Flagship`, `Reviewed`, `Community`, `Preview`, or `Generic`.
- Preview says that this direction includes built-in guidance and independent
  language review is not complete. Generic says that only general guidance is
  used and no guidance was written for this exact direction.
- Evidence-qualified tiers supply their verified review date/evidence scope. The UI never fabricates a review date or treats Preview as review evidence.
- Home/target rails, tier colors, or decorative join marks never substitute for the text.

## Motion

- Default transitions: 140 ms maximum, standard ease-out, one-shot only.
- A changed setting may briefly emphasize its connected summary rule; no loop, parallax, celebration, or score-like animation.
- `prefers-reduced-motion: reduce` removes transforms and animated connection rules. Content and focus update instantly with identical information and state.
- Motion is never required to perceive compilation completion, warnings, or saved state.

## Accessibility and internationalization

- Every page has one `main`, one clear heading hierarchy, a skip link, native landmarks, and descriptive document title.
- Pair order and Swap result are announced in text. Structured autonyms remain
  searchable with exact language and direction metadata. Native select options
  use the localized public name, an isolated autonym, and `dir=auto` because
  native options cannot contain language-tagged child spans; manual
  assistive-technology qualification remains required.
- Zoom/reflow targets: 200% without loss; 400% at 1280 × 1024 without two-dimensional page scrolling.
- Screen-reader task order matches visual order in both bilateral and stacked layouts.
- IME composition never triggers compilation, validation, or keyboard shortcuts before `compositionend`.
- Ruby, if later used, remains optional supplementary annotation and does not duplicate essential text.
- Reduced motion, forced colors, increased text spacing, and platform focus preferences are respected.

## Implementation fidelity rule

Gate 3 UI work must compare its rendered Builder against the selected PNG at the same desktop aspect, then verify the contract at mobile widths and accessibility states. Visible differences are fixed unless they result from native semantics, gate-aware availability, accessibility, or explicit product truth. No unselected direction is used as a fallback.
