# PhraseGarden project state

Updated: 2026-08-19

## Current outcome

PhraseGarden `0.1.0-preview.7` is the active local source candidate and has an
exact local package content record. Source checkpoint
`S7=465f0516e58f1270529923027013565881be76e9` has tree
`8fc64ad4edf9f941aa8b370b8777f28c200bf7af` and sole parent
`d0922651db3bef58215ea130876d88bd54b8e3bc`.

Preview 6 remains the immutable deployed predecessor. Preview 7 changes
accessibility semantics, browser regressions, release identity, and official
immutable Node 24 GitHub Action pins. It does not change compiler output,
prompt snapshots, language identities, pair guidance, recipes, support tiers,
or the privacy model.

## Exact local Preview 7 package

| Artifact | Bytes | SHA-256 |
|---|---:|---|
| Source manifest | 34,329 | `674146B0F73C41321A7D4E47949ABA8643F2C038C1C48DDBB305766E1AEAA1DE` |
| Pages ZIP | 187,305 | `715ED188561505D1531FA903EC85EE742A34AE0A6646C9E61190D0D79FFD9513` |
| Release manifest | 976 | `87296B9F800D3821437F9C15EB461522D5D790CB07EF5EA540E60C896F2E46BA` |
| `SHA256SUMS` | 2,188 | `FE11EEA9DC696BC04FA63E7D9E56D95077EAAFBFB3B881C83EAB8EC029DA241A` |

The ledger preserves the exact 1,952-byte Preview 6 ledger, SHA-256
`82CBC32E5606F827765983271B248CD7C4788DFE57AB703FD1B94A55432B9C4E`,
then appends only the Preview 7 ZIP row followed by its manifest row. One
successful owner-context promotion copied the independently reviewed stage to
the three final paths without regeneration; direct byte comparison passed.

## Local evidence boundary

The exact source passed 329 application tests, 58 Python release/security
tests, 41 workflow and claim-policy tests, both TypeScript checks, a Node 24
build, release audits, 14 sequential Edge/axe journeys, and two independent
source reviews. The one release build and canonical stage then passed matching
pre/post audits, all 14 browser journeys, package verification, and independent
product/accessibility/language and security/archive reviews.

These results establish local deterministic structure and reviewed bytes. They
do not establish Preview 7's containing package commit, Actions run,
deployment, current public bytes, tag, GitHub Release, WCAG conformance,
manual assistive-technology behavior, or external linguistic review.

This source-state record alone establishes no Preview 7 checkpoint; Git
identity separately establishes `S7`. Likewise, this package content record
does not self-establish `P7` or any public state.

## Authority sequence

If no source receipt exists, source qualification must finish before any
package content record; exact `S7` already has that separately bound receipt.

1. An external zero-finding review receipt for the exact seven package paths
   permits those unchanged bytes to be checkpointed as the sole-parent child
   of `S7`.
2. Git identity plus the pinned committed-package verifier and fresh extraction
   alone establish local package commit `P7`.
3. A fresh remote baseline permits one `S7 → P7` main push. The no-build Pages
   run and exact public HTML/CSS/JavaScript downloads separately establish
   deployment and public-byte authority.
4. No Preview 7 tag or GitHub Release is part of this cycle.

Stop on byte or scope drift, another build or promotion, wrong parent or path,
open review finding, verifier failure, remote drift, CI/deployment failure,
public-byte mismatch, or any need to rewrite an earlier release.

## Deferred

Manual screen-reader, real-device IME, manual forced-colors, moderated first-run
usability, local recipe storage/import/sharing, Japanese UI localization,
durable offline refresh, model evaluation, and evidence-qualified
Community/Reviewed/Flagship tiers remain separate work.
