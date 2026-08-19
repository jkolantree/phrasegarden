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

The reviewed source is checkpointed as
`S5=16ad1fbf964e4ee6084457d27208c17ae5d413e9`, tree
`0f6e8e0c3deea74766725122379d969c850a4c1f`.

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

## Exact local package record

- Complete-tree source manifest: 31,497 bytes, 162 files, SHA-256
  `C22DC0C2035768978E130AD5E471E2F432F9BDDAC067E08CB45D95194B28772E`
- Pages ZIP: 186,175 bytes, SHA-256
  `33BB1A8F8FA23B6B5D1DE0D727CA29CC19CBB33861ECD8B611C2C4C76F883458`
- Release manifest: 976 bytes, SHA-256
  `2E48975AC719D689F312A17D8997E4983E13F36245B62BBF1D826F7995E7DEA0`
- Appended checksum ledger: 1,716 bytes, SHA-256
  `0F551D3C522C89244A964E1C0F427C9C3A14B13E2DF3219692529C89DDA19228`

The local final ZIP, manifest, and ledger are byte-identical to the reviewed
stage. This record does not by itself establish the containing `P5` commit,
committed-package verification, push, Pages run, deployment, or public bytes.

## Current local evidence

| Check | Result |
|---|---|
| Full deterministic application tests | 324/324 passed; canonical prompt snapshots unchanged |
| Python release/security tests | 58/58 passed on the unchanged release-tool/test bytes under CPython 3.12.13 |
| Pinned build | one successful pnpm 11.9.0 build; both TypeScript configurations passed |
| Output audit | identical three-file hashes before and after browser qualification |
| Edge, Playwright, and axe | 12/12 sequential journeys passed on the packaged bytes |
| Independent review | source and staged-package product/security reviews passed with zero open P1/P2/P3 |

This is development evidence, not a source checkpoint, package, deployment,
WCAG claim, assistive-technology matrix, or external linguistic review.

## Release cursor

1. Bind the exact seven packaging paths with one final read-only content review.
2. If that review has zero open P1/P2/P3 and the bytes remain unchanged, create
   the sole-parent-`S5` packaging checkpoint `P5`.
3. Run the pinned Preview 5 committed-package verifier into a fresh ignored
   extraction and compare it byte-for-byte with the reviewed stage and `dist`.
4. Confirm remote `main` still equals the expected predecessor, then push only
   the exact `S5`→`P5` chain for the already authorized Pages update. Do not
   create or move a tag or GitHub release unless separately authorized.
5. Inspect the one triggered Pages run. Repair only a captured causal failure;
   never rerun or regenerate for luck.
6. After deployment succeeds, download the public Pages HTML and its exact
   manifest-listed assets and compare every length and SHA-256.

Any source drift, prompt-byte drift, unexplained test failure, Preview 4 byte
change, or public-byte mismatch stops this sequence at the responsible layer.

## Deferred

Manual screen-reader, real-device IME, forced-colors, and moderated first-run
usability evidence remain incomplete. Gate 4 storage/import/sharing, Japanese
interface localization, durable offline refresh, model evaluation, and
evidence-qualified Community/Reviewed/Flagship tiers remain separate work.
