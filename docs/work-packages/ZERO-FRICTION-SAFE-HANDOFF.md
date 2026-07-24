# Zero-friction entry and safe handoff

## Objective

A first-time visitor can create the default portable prompt from the first
screen without passing through a mandatory builder step, understand exactly
where to use it, receive visible action feedback, and never lose a locally
edited prompt without an explicit warning.

## Source of truth

- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN-CONTRACT.md` — Woven Conversation
- `docs/PRIVACY.md`
- `docs/EVALUATION.md`
- `docs/work-packages/PLAIN-LANGUAGE-USABILITY-PASS.md`
- Current compiler, prompt-artifact, UI-copy, and browser regression tests
- The 2026-07-23 public-flow gap audit

## In scope

- Direct prompt generation from Home using the selected languages, tool, and
  safe defaults
- A clearly secondary path to optional relationship, tone, correction,
  pronunciation, and teaching settings
- Session-only wording that distinguishes private local processing from
  durable saving
- Explicit destination-tool compatibility, paste order, and privacy handoff
- Visible Copy and Download success/failure feedback
- Preservation across internal navigation, plus confirmation before a modified
  prompt is replaced or discarded
- Browser-leave protection while a modified prompt exists
- Actual loaded-session offline completion
- Focused copy, state-transition, accessibility, and browser regressions
- The minimum design-contract correction needed for the shorter flow

## Out of scope

- Compiler, recipes, profiles, pair guidance, support resolution, generated
  prompt wording, provenance structure, or canonical prompt bytes
- Local persistence, recipe library, JSON import/export, share fragments, or
  service-worker caching; these remain later separately verified packages
- Japanese interface or Japanese generated-instruction edition
- Interpreter
- External linguistic review, model trials, prospective evaluation, moderated
  usability evidence, or manual assistive-technology claims
- Publication, deployment, remote writes, accounts, telemetry, or runtime AI

## Acceptance

- Home has one primary `Create my prompt` action and no mandatory
  `Open/Continue to builder` step.
- At the default 1280 × 720 desktop test viewport, that action is visible
  without scrolling.
- At 320 × 900 before first generation, a compact Quick start exposes the
  current direction/tool and a real create action without hiding the complete
  selectors below.
- `Adjust optional settings` remains available and opens the existing Builder.
- Direct and adjusted generation produce the exact same canonical bytes when
  their effective configurations are identical.
- Home states that choices live only in the current tab and disappear on
  refresh or close.
- Review explains, before the prompt surface, that the destination must accept
  instructions; the prompt is pasted first; source text is sent next; and the
  destination's privacy policy applies.
- At the default 1280 × 720 desktop test viewport, Review exposes Copy without
  scrolling while support and limitations remain visible first in reading
  order.
- Copy and Download produce restrained visible status text as well as
  assistive-technology feedback.
- A modified prompt remains reachable across internal navigation, cannot be
  replaced by a new generation without explicit confirmation, and receives
  the browser's native warning before refresh or close.
- Canceling the discard path preserves the exact edited text.
- Generic and Preview labels and limitations remain exact and honest.
- The primary loaded page can complete direct Written generation, Copy, and
  Download after the browser context is switched offline.
- Keyboard order, IME handling, 320 px layout, 200%/400%-equivalent reflow,
  exact prompt/download bytes, axe, and no-runtime-network checks remain green.

## Verification

```text
focused Vitest UI and prompt-artifact tests
full Vitest suite
both TypeScript configurations
Vite production build
release audit
sequential Microsoft Edge Playwright/axe journeys
forbidden-domain scan
git diff --check
desktop Home, optional Builder, Review, and 320 px Review inspection
independent read-only current-byte review
```

## Stop conditions

Stop on any required compiler-semantic, prompt-byte, support-tier, language
identity, privacy-architecture, or selected-visual-direction change; on an
unexpected baseline failure; before fabricating human evidence; or before any
commit, push, publication, deployment, or remote write.

## Handoff

Record changed files, exact test and screenshot evidence, independent-review
verdict, remaining human-evidence gaps, and the next eligible package under
the accepted gate order in `docs/PROJECT-STATE.md`.
