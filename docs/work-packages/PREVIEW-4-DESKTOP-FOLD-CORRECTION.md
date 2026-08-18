# Preview 4 desktop-fold correction

## Objective

Create one narrowly scoped development correction for the public Preview 3
Pages failure: keep the primary Home action comfortably visible in the longest
supported desktop Home state at a `1280 x 720` viewport.

This package creates no release, tag, asset, deployment, or Preview 4 public
identity. Preview 3 remains immutable. Any later correction release requires a
new source freeze, package, version, tag, assets, confirmation, and public-byte
verification.

## Source of truth

- GitHub Actions run `32155197089`, job `95770603474`, exact source/package
  commit `0482c8adb4aeefdbb7b6329e6408fd6c29fd96d4`.
- `tests/e2e/preview.spec.ts`, test `expanded languages stay understandable,
  exact, and accessible`, with the retained failure at line 801:
  `728.9375 <= 720` was false in Linux Chromium.
- `src/app/App.tsx` Home structure and `src/ui/styles.css` Woven Conversation
  responsive rules.
- `docs/DESIGN-CONTRACT.md`, `docs/RELEASE-WORKFLOW.md`, and
  `docs/evidence/releases/0.1.0-preview.3.md`.

## In scope

- `docs/work-packages/PREVIEW-4-DESKTOP-FOLD-CORRECTION.md`
- `src/ui/styles.css`
- `tests/e2e/preview.spec.ts`
- `tests/release/release-audit.test.ts`
- `docs/evidence/releases/0.1.0-preview.3-publication.md`
- `docs/PROJECT-STATE.md`
- `docs/TRACEABILITY.md`

The implementation may compact vertical spacing only on short, wide Home
layouts. The failing browser journey remains the regression owner.

## Out of scope

- Changing prompt, compiler, recipe, language-profile, pair-pack, tier, or
  provenance behavior.
- Changing Home copy, controls, focus order, mobile layout, or accessibility
  semantics.
- Weakening, deleting, skipping, or retrying the failed assertion for luck.
- Replacing, deleting, moving, or retagging Preview 3.
- Version bumps, release-tool generalization, source freeze, packaging, push,
  tag, GitHub release, Pages deployment, or production smoke testing.
- Gates 4 and later, runtime AI, backend, accounts, telemetry, or model
  evaluation.

## Acceptance

- `P4-FOLD-01`: At `1280 x 720`, after selecting French as the target, the
  complete `Create my prompt` button ends at least 24 CSS pixels above the
  viewport bottom.
- `P4-FOLD-02`: The existing state and exact `728.9375 > 720` Preview 3
  observation remain permanent interface-regression evidence. The same named
  browser fixture retains the original fold assertion and adds a separate 24
  px safety invariant.
- `P4-FOLD-03`: The existing default Preview and Interpreter desktop fold
  assertions remain enabled and pass.
- `P4-FOLD-04`: The 320 px quick action, no-overflow, keyboard, bidi, reduced
  motion, and axe journeys remain unchanged and pass.
- `P4-FOLD-05`: No prompt snapshot, domain behavior, language identity,
  support claim, privacy boundary, public state, or existing Preview 1–3
  archive, manifest, ledger-prefix, tag, or public-asset byte is changed. A
  future Preview 4 distributable is expected to contain the CSS correction.
- `P4-FOLD-06`: The focused fix and final seven-path package bytes receive an
  independent read-only review with zero open P1/P2/P3 findings before
  checkpointing.

## Development failure retained

The first full deterministic run after recording the public outcome returned in
`release filesystem audit > keeps public release claims stable across packaging
and publication`. Its exact cause was the transition fixture still requiring
the now-obsolete prepublication sentence `The last public state qualified by
repository evidence before Preview 3 publication work`. The responsible layer
is the release-state regression fixture. It now rejects the obsolete sentences
and requires the exact public-prerelease, verified-asset, skipped-deployment,
and live-byte-unknown replacements. The fixture was not weakened or removed.

## Verification

Development checks, before any future release freeze:

```text
node node_modules/@playwright/test/cli.js test tests/e2e/preview.spec.ts --grep "expanded languages stay understandable, exact, and accessible"
node node_modules/@playwright/test/cli.js test tests/e2e/preview.spec.ts
pnpm test
pnpm typecheck
pnpm build
```

Inspect the `1280 x 720` Generic Home screenshot directly and compare the
primary-action position with the retained Preview 3 screenshot/failure. Check
the exact seven-path diff, `git diff --check`, and forbidden domain scan. These
are development results only; a later correction-release source must be frozen
and qualified again under `docs/RELEASE-WORKFLOW.md`.

## Stop conditions

Stop rather than guess if:

- the fix requires copy, control, focus-order, mobile, prompt, language, tier,
  privacy, or release-policy changes;
- 24 CSS pixels of fold headroom cannot be achieved without clipping or hiding
  content;
- the current failure cannot be reproduced or the focused regression fails for
  a different reason;
- the baseline has unrelated failures or the seven-path boundary drifts;
- a new public identity or public write would be required before exact values
  are available for confirmation.

## Handoff

Report the seven exact paths, CSS behavior changed, retained negative fixtures,
commands and counts, screenshot evidence, independent-review result, and any
environment difference between local Edge and Linux Chromium. The next
eligible package is correction-release identity and same-byte tooling; it may
begin only after this package passes.
