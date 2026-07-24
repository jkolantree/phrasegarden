# PhraseGarden project state

Updated: 2026-07-23

## Current state

Shipping milestone D — local publication candidate. PhraseGarden
`0.1.0-preview.1` is built, locally verified, and publication-authorized.
MIT and CC BY 4.0 license files are present. It has not yet been committed,
published, released, or deployed.

## Durable decisions

- Woven Conversation is the sole implemented visual direction.
- English→Japanese and Japanese→English use one exact versioned **Preview**
  pack. Preview means built-in guidance with external linguistic review still
  incomplete; it is not Reviewed or Flagship.
- Every other bundled direction resolves **Generic** and receives no
  endpoint-, profile-, or pair-specific linguistic clauses.
- The compiler remains pure and deterministic. `src/domain` has no Preact,
  browser, network, storage, clock, randomness, telemetry, backend, or runtime
  model dependency.
- Canonical language identity remains one exact registry-pinned BCP 47 tag:
  `LanguageProfile.id === LanguageProfile.bcp47`.
- Interface language, home language, target language, and generated
  instruction surface remain separate concepts.
- The product never asks for source text. Current settings and edits are
  memory-only.
- Gate 2I evidence semantics remain intact and separate. This candidate does
  not create reviewer evidence or derive Community, Reviewed, or Flagship.

## Shipping milestones

| Item | State | Evidence |
|---|---|---|
| Milestone A — compiler and authored data | Completed | Seven exact language profiles; EN↔JA Preview pack; Written Translator and Live Voice Coach; pure resolution/compiler; five snapshots in `samples/0.1.0-preview.1/` |
| Milestone B — Woven Conversation slice | Completed | Memory-only home → builder → review flow in `src/app/App.tsx`; behavior summary, provenance, copy, edit, regenerate, and exact text download |
| Milestone C — automated QA | Completed | `pnpm verify:release`: 270/270 Vitest and 4/4 sequential Edge Playwright/axe journeys; dual typechecks, Vite build, and release audit passed |
| Keyboard-only primary journey | Completed | Focused Playwright path uses Tab/Enter through skip link, selectors, tool, controls, generation, copy, download, readable prompt surface, and editing |
| Narrow/reflow and visual inspection | Completed | Playwright 320 px, 200%, and 400%-equivalent checks; four current screenshots inspected with no visible clipping, overlap, or stray focused skip link |
| Deterministic-domain boundary | Completed | Forbidden-API scan returned zero matches in `src/domain` |
| Milestone D — documentation and packaging | Completed | Public docs, samples, Pages workflow, publication manifest, byte manifest, Pages archive, and `SHA256SUMS` are present locally |
| Independent read-only review | Completed | Final current-byte verdict: PASS with no open P1/P2/P3 findings |
| Gate 2I review-evidence semantics | Unchanged | ADR-022 and its pure structural validator remain separate from this candidate; no fabricated review or tier evidence was added |
| In-app localhost manual inspection | Blocked | The Codex in-app Browser rejected further local URL navigation by policy; automated Edge inspection and direct screenshot inspection passed, but this is not claimed as an in-app manual browser pass |
| External linguistic review | Deferred | Preview labels and limitations state that English↔Japanese review is incomplete |
| Japanese interface, service worker, persistence, sharing, and Interpreter | Deferred | Deliberately outside this Preview candidate |
| Manual screen-reader, real IME, and forced-colors matrix | Deferred | Automated axe, keyboard, composition-event, bidi, reduced-motion, and reflow coverage passed; independent manual assistive-technology evidence is not claimed |
| Model and prospective evaluation | Skipped | No runtime or evaluation model calls; no prospective fixtures consumed |
| Publication authorization and license files | Completed | User authorized the exact plan; `LICENSE` is MIT and `LICENSE-CONTENT` applies CC BY 4.0 to maintained content |
| Repository initialization, commit, push, release, and deployment | In progress | Authorized exact remote plan; no remote result is claimed until verified |

## Current verification evidence

- Focused compiler: `pnpm test:compiler` — 19/19 passed.
- Full unit and snapshot suite: 11 files, 270/270 passed.
- TypeScript: both `tsconfig.json` and `tsconfig.domain.json` passed.
- Production build and release audit:

  | Pages path | Bytes | SHA-256 |
  |---|---:|---|
  | `assets/index-BxUVLzPO.css` | 15,925 | `51A89FCD583723513D08E69324DD89167806CF6E81F3B7B1BAE584DC64014625` |
  | `assets/index-C--6uDj9.js` | 137,522 | `2CAB03D48063F0BF95747E77C17F037144033173A96AF4881FB54BD184FD6802` |
  | `index.html` | 899 | `A043350C46D79344B041619AD494CD3BA2D677117C0F6B164B3290C28EEE9FEA` |

- Browser: 4/4 sequential Microsoft Edge Playwright journeys passed with axe,
  runtime-network isolation, exact copy/download, IME-event, keyboard, bidi,
  reduced-motion, 320 px, 200%, and 400%-equivalent assertions.
- Screenshots:
  `artifacts/screenshots/home-desktop.png`,
  `artifacts/screenshots/builder-written-desktop.png`,
  `artifacts/screenshots/review-written-desktop.png`, and
  `artifacts/screenshots/review-mobile-320.png`.
- Pages archive:
  `release/phrasegarden-0.1.0-preview.1-pages.zip`, 40,963 bytes,
  SHA-256
  `A9952F91DF731D6C4D3785DBFB24513D6477B571F659E3A3C1EB5E65F5618357`.
- Archive qualification: all 7/7 `SHA256SUMS` entries and all 3/3 extracted
  Pages files matched their recorded byte lengths and SHA-256 values.
- Independent read-only implementation review repeated 270/270 tests, both
  typechecks, build, release audit, domain scan, 4/4 browser journeys, and
  screenshot inspection. Its byte-level packaging
  recheck passed 7/7 checksum targets and all 3/3 exact manifest-bound ZIP
  entries, including forward-slash path portability. Final verdict: PASS with
  no open P1/P2/P3 findings.
- Publication boundary audit: all 23 manifest paths exist; all 108 proposed
  public text files decode as strict UTF-8; no machine username, attachment
  path, private-key marker, or token signature remains.

## Known limitations

- Preview pair guidance is versioned and deterministic, but external
  linguistic review has not been completed.
- Generic generation is intentionally conservative and contains no
  pair-specific advice.
- The interface and generated instruction surface are English-only.
- PhraseGarden generates prompts; it does not translate, assess pronunciation,
  listen to audio, or call an AI model.
- No local library, import/export, sharing, service worker, or offline refresh
  exists. A loaded page compiles without runtime network calls, but opening or
  refreshing a hosted copy requires its static host unless the browser cache
  satisfies the request.
- Hosted infrastructure may retain ordinary request logs even though
  PhraseGarden has no project analytics or telemetry.
- The archive proves captured local build bytes, not a Git commit, hosted
  download, deployment, or UI-mediated download identity.
- Source code is MIT-licensed. Maintained prompts/content are CC BY
  4.0-licensed under `LICENSE-CONTENT`.

## Credit-expensive work deliberately avoided

No second visual ideation batch, model evaluation, prospective-fixture
consumption, external linguistic evaluation, remote browser farm, repository
write, release creation, Pages deployment, telemetry, backend, or runtime AI
work was performed.

## Exact next eligible action

Execute the authorized publication plan with exact-scope Git history, public
`jkolantree/phrasegarden`, `main`, release `v0.1.0-preview.1`, qualified release
assets, and GitHub Pages; verify each remote object before claiming success.
