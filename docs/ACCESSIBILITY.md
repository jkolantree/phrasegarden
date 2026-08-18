# Accessibility

PhraseGarden aims for WCAG 2.2 AA-compatible operation, while describing the
evidence for this Preview honestly.

## Implemented

- Semantic headings, one main landmark, a skip link, native buttons, selects,
  radios, fieldsets, details, and a labeled textarea
- Keyboard completion and deliberate focus movement after view transitions
- Visible non-color-only Preview/Generic and modified states
- Focus indicators, 44 px controls, and logical DOM/visual order
- Reflow without page-level horizontal scrolling at 320 px and at
  200%/400%-equivalent layout widths
- Reduced-motion and forced-colors styles
- `lang` attributes for Japanese runs, bidirectional isolation, and CJK-safe
  wrapping
- IME-aware editing that does not commit changes during composition
- Restrained live announcements for committed actions

## Checks run for this candidate

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

## Known gaps

Automated checks do not replace human assistive-technology testing. This
candidate has not completed an independent screen-reader matrix, a real-device
IME matrix, forced-colors manual inspection, or broad browser/OS coverage. The
interface is not yet localized into Japanese.

The in-app browser could not open the local candidate because that surface
blocked localhost navigation. This is recorded as a test-transport limitation,
not as a product accessibility pass or failure.

After publication, accessibility reports should include the page, browser,
assistive technology, expected result, actual result, and reproduction steps.
