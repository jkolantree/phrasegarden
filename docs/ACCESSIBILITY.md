# Accessibility

PhraseGarden aims for WCAG 2.2 AA-compatible operation, while describing the
evidence for this Preview honestly.

## Implemented

- Semantic headings, one main landmark, a skip link, native buttons, selects,
  radios, fieldsets, details, and a labeled textarea
- Keyboard completion and deliberate focus movement after view transitions
- Focus movement into the instruction editor, into the discard-edits
  alertdialog, and back to the invoking or restored content
- Visible non-color-only Preview/Generic and modified states
- Focus indicators, 44 px controls, and logical DOM/visual order
- Reflow without page-level horizontal scrolling at 320 px and at
  200%/400%-equivalent layout widths
- Reduced-motion and forced-colors styles
- `lang` attributes for Japanese runs, bidirectional isolation, and CJK-safe
  wrapping
- IME-aware editing that does not commit changes during composition
- Restrained live announcements for committed actions
- A bounded, keyboard-focusable complete-instruction reading region; Copy and
  Download still use the full exact text

## Checks recorded for Preview 3

- Twelve sequential Playwright journeys in Microsoft Edge
- axe scans on Written, Voice, and Interpreter home, builder, and
  generated-prompt review states, including Advanced-open Written and Voice
  plus 320 px Interpreter states
- Keyboard focus assertions
- 320 px mobile screenshots and desktop screenshots for the default,
  Written Builder Advanced-closed, Voice Advanced-open, and Interpreter paths
- 200% and 400%-equivalent reflow assertions
- Bidirectional-label and reduced-motion assertions
- Synthetic Japanese composition-event coverage
- Direct visual inspection of the captured rendered screens

## Preview 6 target and Preview 5 failure

Preview 5 kept exactly one Home fast path visible in the reviewed desktop and
mobile states, and its truthful support and limitation notices preceded Copy.
Its exact Linux Chromium check nevertheless placed the Copy action at
`985.984375` px in a 320 × 900 Review viewport, beyond the required `900` px.
Pages deployment therefore stopped; that negative result remains part of the
immutable Preview 5 record.

Preview 6 changes only narrow-screen Review presentation. Its acceptance target
keeps the support and limitation notices before Copy, retains 44 px actions,
and places the Copy action's bottom at no more than `800` px from the viewport
top, leaving at least 100 px of design headroom at 320 × 900. Passing that
bound would remain bounded automated evidence; it would not establish an
independent screen-reader matrix, real-device coverage, release deployment, or
WCAG conformance.

## Known gaps

Automated checks do not replace human assistive-technology testing. Preview 3
evidence does not include an independent screen-reader matrix, a real-device
IME matrix, forced-colors manual inspection, or broad browser/OS coverage. The
interface is not yet localized into Japanese.

After publication, accessibility reports should include the page, browser,
assistive technology, expected result, actual result, and reproduction steps.
