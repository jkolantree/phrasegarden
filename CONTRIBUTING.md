# Contributing to PhraseGarden

PhraseGarden is currently a local Preview candidate. Public contribution
handling begins only after repository publication and license approval.

## Development checks

Keep packages bounded and preserve the pure-domain boundary:

```text
pnpm test
pnpm typecheck
pnpm build
pnpm audit:release
pnpm test:e2e
```

`src/domain` must remain browser-free, storage-free, network-free, clock-free,
randomness-free, and independent of ambient `Intl`.

## Language and pair changes

- Use one exact bundled canonical identity; never introduce a display name,
  alias, or locale-canonicalized second ID.
- Profile versions are separate from language identity and registry version.
- Generic output may not contain profile- or pair-specific linguistic clauses.
- Do not claim Community, Reviewed, or Flagship status from well-formed
  metadata alone.
- Do not fabricate a reviewer, evidence file, review date, outcome, suite pass,
  or reviewer qualification.

Formal pair-review governance, byte-manifest qualification, reviewer
qualification, and the future tier resolver are deferred. A language
contribution may be discussed and tested, but it cannot acquire a higher tier
until that separate governance work is approved and implemented.

## Failure-directed changes

For a compiler, recipe, language, pair, interface, or accessibility failure:

1. Preserve the exact failing input or interaction.
2. Classify the responsible layer.
3. Add a negative/regression fixture.
4. Change the smallest responsible layer.
5. Run the focused and full suites.

Do not weaken a validator, fixture, rubric, or acceptance rule to obtain a
pass. Exposed fixtures remain development/regression evidence.

## Privacy and accessibility

Do not add source-text collection, analytics, telemetry, accounts, runtime AI,
remote fonts, CDNs, or public free-text submission without an explicit product
and privacy decision. Use native controls and retain keyboard, screen-reader,
IME, CJK, bidi, zoom, and reduced-motion behavior.

## License of contributions

By contributing, you agree that code and software-infrastructure
contributions are provided under the repository's MIT License, while
maintained prompt/content contributions are provided under CC BY 4.0 as
described in `LICENSE-CONTENT`. Do not contribute material you do not have the
right to license on those terms.
