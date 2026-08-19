# PhraseGarden project state

Updated: 2026-08-19

## Current outcome

PhraseGarden `0.1.0-preview.6` is the exact local candidate for the authorized
Pages update. It changes only narrow-screen Review density: truthful support
and limitation notices stay before Copy, the two small orientation labels stay
visible, and every action keeps its 44 px floor. The compiler, prompt bytes,
language identities, pair guidance, recipes, support tiers, and privacy model
are unchanged.

Source checkpoint `S6=f442677f494eb36e0177c023e287a9de47573dbe`, tree
`3a5c8a94ec0959292bc8c81fe86973a835ea950b`, has sole parent
`dd040276c18a409d15d41bd1ea4f29a829562051`.

## Exact local package record

- Complete-tree source manifest: 32,705 bytes, 168 files, 2,106,552 payload
  bytes, SHA-256 `F5F234D3EB867E45B50CD5E8CED2E484B56E725B3AD72B9AAAB5B8A382B26DAE`
- Pages ZIP: 186,851 bytes, SHA-256
  `6A2DC1E364F42B64D54034E734233CB09A9166A01F9C6591D182AB40CA81EA55`
- Release manifest: 976 bytes, SHA-256
  `B9753A9286D3C8E662ABB7A9244817BFA7EAA2382B262794816527C765074F7E`
- Appended checksum ledger: 1,952 bytes, SHA-256
  `82CBC32E5606F827765983271B248CD7C4788DFE57AB703FD1B94A55432B9C4E`

The local final ZIP, manifest, and ledger are byte-identical to the independently
reviewed stage. This statement does not establish the containing `P6` commit,
workflow execution, deployment, or public bytes.

## Local evidence

| Check | Result |
|---|---|
| Application tests | 329/329 passed; canonical prompt snapshots unchanged |
| Release/security tests | 58/58 passed under CPython 3.12.13 |
| Workflow and claim policy | 41/41 passed |
| Type checks and build | both TypeScript configurations passed; one pnpm 11.9.0 / Node 24 build |
| Output audit | identical three-file hashes before and after local inspection |
| Narrow mobile inspection | in-app Chromium at 320 × 900 measured Copy bottom at 600.5 px; both orientation labels and all truth notices remained visible |
| Independent review | exact source and stage product/accessibility/security reviews passed with zero open P1/P2/P3 |

The local browser measurement is not the Linux Chromium/axe release result.
Pages CI owns that exact check. No WCAG, screen-reader, linguistic-review,
deployment, or public-byte claim follows from this table.

## Publication cursor

1. Obtain one external exact-byte review of the seven packaging paths.
2. If it has zero open P1/P2/P3, checkpoint those unchanged paths as sole-parent
   `P6` and run the pinned committed-package verifier.
3. Confirm remote `main` still equals `dd040276c18a409d15d41bd1ea4f29a829562051`,
   then push the exact `S6` to `P6` chain once.
4. Inspect the one automatic Pages run. The Linux Chromium 320 × 900 check must
   keep Copy at or below the 800 px bound without hiding notices or labels.
5. After a successful deployment, download public HTML, CSS, and JavaScript and
   compare each length and SHA-256 with the release manifest.

No Preview 6 tag or GitHub Release is authorized.

## Preview 5 source candidate

PhraseGarden is preparing `0.1.0-preview.5` is retained here only as the exact
historical cursor text that preceded the failed release check. The immutable Preview 4 tag and release assets remain bound to
their published identity.
Preview 5 passed local Edge review but Linux Chromium placed Copy at
`985.984375 > 900`; the run failed before upload or deployment. No runtime model call, prompt change, or tier promotion caused that failure. This keeps the already authorized Pages update separate: it moved to the independently versioned Preview 6 candidate instead of rewriting Preview 5.

## Deferred

Manual screen-reader, real-device IME, forced-colors, and moderated first-run
usability evidence remain incomplete. Local recipe storage/import/sharing,
Japanese UI localization, durable offline refresh, model evaluation, and
evidence-qualified Community/Reviewed/Flagship tiers remain separate work.
