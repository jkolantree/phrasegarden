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
- Named language-guidance, limitation, handoff, and complete-instruction
  regions for accessibility APIs
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

## Preview 6 Pages predecessor and Preview 5 failure

Preview 5 kept exactly one Home fast path visible in the reviewed desktop and
mobile states, and its truthful support and limitation notices preceded Copy.
Its exact Linux Chromium check nevertheless placed the Copy action at
`985.984375` px in a 320 × 900 Review viewport, beyond the required `900` px.
Pages deployment therefore stopped; that negative result remains part of the
immutable Preview 5 record.

Preview 6 changed only narrow-screen Review presentation. Its acceptance target
kept the support and limitation notices before Copy, retained 44 px actions,
and placed the Copy action's bottom at no more than `800` px from the viewport
top, leaving at least 100 px of design headroom at 320 × 900. Preview 6 later
passed its version-bound Pages qualification and is the exact immutable Pages
predecessor. That bounded evidence did not establish an independent
screen-reader matrix, real-device coverage, or WCAG conformance.

## Preview 7 source-candidate coverage

The Preview 7 source candidate keeps Preview 6 behavior and adds
automated checks for visible focus, selected state, truthful support and
limitation notices, 44 px actions, DOM order, axe, and narrow reflow under
forced-colors emulation. It also checks the named language-guidance regions and
the named complete-instruction document through browser role-and-name queries.
At that source-candidate stage, these changes and automated regressions did not
establish a package or deployment. Later version-bound evidence established
Preview 7 as the exact public Pages predecessor. Neither stage establishes a
manual forced-colors inspection or screen-reader pass.

## Preview 8 Japanese interface and returned Pages run

The Preview 8 source includes a complete Japanese interface catalog with a
persistent named disclosure that qualified-speaker review is incomplete. The
adjacent English control is its immediate recovery path and preserves settings,
generated instructions, and edits. Automated catalog, keyboard, axe, reflow,
IME, and byte-preservation checks are development evidence; they do not prove
human Japanese quality or manual assistive-technology behavior.

The exact Preview 8 Pages run `32405959146` extracted and audited the checked-in
archive successfully, then returned 13/15 Linux Chromium journeys. Two journeys
measured the same English Home primary-action bottom at `1024.828125` px in a
320 × 900 viewport, beyond the required `900` px. Upload and deployment were
skipped, and the post-run public-byte observation remained exact Preview 7.
This negative result is immutable Preview 8 evidence; local Edge results and
axe results do not override it.

## Preview 9 returned Pages run

Preview 9 changed only narrow, short-screen CSS density and kept the stronger
Home regression. Its exact Actions run `32416506948` extracted and audited the
checked-in archive, then returned 13/15 Linux Chromium journeys. Both failures
measured the same untouched-English Home primary-action bottom at `823.75` px
in a 320 × 900 viewport, beyond the required `800` px. Because that first state
failed, the Japanese Linux state was not reached. Upload and deployment were
skipped. Local same-dist Chromium and Edge passes are retained development
evidence; they do not override this exact Linux result.

## Preview 10 narrow Home recovery target

Preview 10 changes only the causal narrow, short-screen CSS wrap and spacing
budget. At 320 × 900, the English and Japanese Home primary action must each
end no more than `800` px from the viewport top, leaving at least 100 px of
headroom. All language-entry and primary actions remain at least 44 px high;
all copy, the Japanese review disclosure, semantic and focus order, and normal
vertical scrolling remain available. The same states must keep page-level
horizontal overflow within the existing one-pixel tolerance and pass their
named axe checks. The 320 px path also remains the 400%-equivalent reflow case.

Those are acceptance targets, not results. Preview 10 accessibility evidence
exists only after the exact `S10` source, build, checked-in archive, Linux
browser run, and any separately required manual inspections are identified.

## Known gaps

Automated checks do not replace human assistive-technology testing. Preview 3
evidence does not include an independent screen-reader matrix, a real-device
IME matrix, forced-colors manual inspection, or broad browser/OS coverage. The
Japanese interface has not been reviewed by a qualified Japanese speaker.

After publication, accessibility reports should include the page, browser,
assistive technology, expected result, actual result, and reproduction steps.
