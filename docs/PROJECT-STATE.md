# PhraseGarden project state

Updated: 2026-08-19

## Current outcome

PhraseGarden is preparing `0.1.0-preview.5`: one clearer human journey from
language choice to copied instructions. The compiler, prompt surface, language
profiles, pair pack, recipes, support resolution, privacy model, and canonical
prompt snapshots remain unchanged. The English behavior-summary catalog moves
to `1.3.0` for plain-language task descriptions.

The immutable Preview 4 tag and release assets remain bound to
`ed89c07a23526adc99f498eaaa05b7d10c144633`. The last captured Pages attempt
failed before upload or deployment because release fixtures confused the
pre-P4 checksum ledger with its valid post-P4 state. Preview 5 fixes that test
lifecycle without changing Preview 4 bytes.

## Preview 5 source candidate

- Outcome-first Home with one visible **Make my instructions** path
- Optional relationship, tone, and detail controls first in Builder
- Honest support and limitation notices before Copy at 320 × 900
- Complete generated text in a bounded, focusable, editable reading area
- Task-specific language and tool labels
- Region-unspecified public wording for canonical language identity `pt`
- Deliberate Edit and discard-confirmation focus behavior
- Closed Preview 5 packager/verifier adapters and a no-build Pages workflow

No runtime model call, model chooser, new language, backend, account,
telemetry, persistence, share payload, or linguistic-review claim was added.

## Current local evidence

| Check | Result |
|---|---|
| Full deterministic application tests | 324/324 passed; canonical prompt snapshots unchanged |
| Python release/security tests | 58/58 passed under CPython 3.12.13 |
| TypeScript | both application and domain configurations passed |
| Production build and output audit | passed on the development candidate |
| Edge, Playwright, and axe | 12/12 sequential journeys passed |
| Visual inspection | Home, Builder, and Review inspected at 320 px and desktop widths |

This is development evidence, not a source checkpoint, package, deployment,
WCAG claim, assistive-technology matrix, or external linguistic review.

## Release cursor

1. If an independent exact-source review receipt is absent, review the current
   source candidate without mutation.
2. If that review reports zero blocking findings and the bytes remain
   unchanged, checkpoint them once as `S5`.
3. From exact `S5`, create and verify its source manifest, clear the prior
   ignored development `dist`, and run one pnpm 11.9.0 release build.
4. Run the complete deterministic/browser/output qualification once, stage and
   review the exact Preview 5 archive, manifest, and ledger append, then promote
   those same bytes.
5. Create the exact seven-path `P5` child of `S5`, run the pinned committed-
   package verifier, and compare the extracted tree with the reviewed stage.
6. Only then push the exact `P5` chain to `jkolantree/phrasegarden` `main` for
   the already authorized Pages update. Do not create or move a tag or GitHub
   release unless separately authorized.
7. Re-download the deployed Pages files and compare every length and SHA-256
   with the Preview 5 manifest.

Any source drift, prompt-byte drift, unexplained test failure, Preview 4 byte
change, or public-byte mismatch stops this sequence at the responsible layer.

## Deferred

Manual screen-reader, real-device IME, forced-colors, and moderated first-run
usability evidence remain incomplete. Gate 4 storage/import/sharing, Japanese
interface localization, durable offline refresh, model evaluation, and
evidence-qualified Community/Reviewed/Flagship tiers remain separate work.
