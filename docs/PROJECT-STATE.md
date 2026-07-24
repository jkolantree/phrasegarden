# PhraseGarden project state

Updated: 2026-07-24

## Current state

Shipping milestone D — usability Preview publication. PhraseGarden
`0.1.0-preview.1` remains the immutable published baseline. The reviewed
plain-language and zero-friction usability work is now the authorized
`0.1.0-preview.2` publication candidate.

Two bounded usability packages are included:

- the plain-language pass replaces implementation language with intentional
  labels and readable behavior summaries;
- the zero-friction/safe-handoff pass exposes the working controls on Home,
  creates directly without a mandatory Builder visit, makes first actions
  visible in initial desktop and mobile viewports, explains the destination
  handoff, reports Copy/Download outcomes visibly, and protects edited prompts
  from silent replacement.

The compiler, generated prompt instructions, canonical prompt bytes, language
identities, pair guidance, support resolution, and review evidence remain
unchanged. The package/release identity advances to `0.1.0-preview.2`; compiler
provenance remains `0.1.0-preview.1`.

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
- Home compiles the current choices directly; Builder is an optional-settings
  path. Review is the informed-use handoff and never sends or runs the prompt.
- Internal navigation preserves the current artifact. Replacing an edited copy
  requires confirmation; refresh and close use the browser's native
  before-unload warning.
- Primary interface copy explains what a prompt is before using product
  vocabulary. Implementation identifiers and hashes remain available under
  `Technical details and versions`, not in the main task path.
- Gate 2I evidence semantics remain intact and separate. This candidate does
  not create reviewer evidence or derive Community, Reviewed, or Flagship.

## Shipping milestones

| Item | State | Evidence |
|---|---|---|
| Milestone A — compiler and authored data | Completed | Seven exact language profiles; EN↔JA Preview pack; Written Translator and Live Voice Coach; pure resolution/compiler; five snapshots in `samples/0.1.0-preview.1/` |
| Milestone B — Woven Conversation slice | Completed | Memory-only Home → Review direct path plus optional Builder in `src/app/App.tsx`; behavior summary, provenance, copy, edit, restore, and exact text download |
| Milestone C — published automated QA | Unchanged | Published `0.1.0-preview.1`: 270/270 Vitest and 4/4 sequential Edge Playwright/axe journeys; dual typechecks, Vite build, and release audit passed |
| Keyboard-only primary journey | Completed | Focused Playwright path uses Tab/Enter through skip link, selectors, tool, controls, generation, copy, download, readable prompt surface, and editing |
| Narrow/reflow and visual inspection | Completed | Playwright 320 px, 200%, and 400%-equivalent checks; five current screenshots inspected with no visible clipping, overlap, or stray focused skip link |
| Deterministic-domain boundary | Completed | Forbidden-API scan returned zero matches in `src/domain` |
| Milestone D — documentation and packaging | Completed | Public docs, samples, Pages workflow, publication manifest, byte manifest, Pages archive, and `SHA256SUMS` are present locally |
| Published release independent review | Unchanged | Published `0.1.0-preview.1` verdict: PASS with no open P1/P2/P3 findings |
| Gate 2I review-evidence semantics | Unchanged | ADR-022 and its pure structural validator remain separate from this candidate; no fabricated review or tier evidence was added |
| Plain-language usability pass | Completed locally | Home explains what a prompt is and where to use it; Builder exposes intentional labels for every option; Review leads with plain-language choices and keeps technical identifiers in disclosure |
| Plain-language independent review | Completed | Independent current-byte review returned PASS with no open P1/P2/P3 findings after the final option-label and empty-caution fixes |
| Zero-friction entry and safe handoff | Completed locally | Direct Home creation, mobile Quick start, optional Builder, initial-viewport Home/Review actions, explicit paste order and modality-aware destination privacy, visible action feedback, artifact-preserving navigation, replacement confirmation, and native refresh/close warning |
| Current local automated QA | Completed | 271/271 Vitest; 9/9 sequential Edge Playwright/axe journeys; dual typechecks, Vite build, release audit, forbidden-domain scan, and diff check passed |
| Current usability independent review | Completed | Final quiescent current-byte review: PASS with no open P1/P2/P3 findings; 20-file start/end fingerprint had zero drift |
| `0.1.0-preview.2` publication package | In progress | User authorized commit, fast-forward push, immutable tag/release, and Pages deployment; local release-byte packaging and remote verification remain |
| In-app localhost manual inspection | Blocked | The Codex in-app Browser rejected further local URL navigation by policy; automated Edge inspection and direct screenshot inspection passed, but this is not claimed as an in-app manual browser pass |
| External linguistic review | Deferred | Preview labels and limitations state that English↔Japanese review is incomplete |
| Interpreter | Deferred | Deliberately outside this usability candidate; ADR-013 keeps it as the next uncompleted ordered Gate 3 slice |
| Japanese interface, service worker, persistence, and sharing | Deferred | Deliberately outside this usability candidate and not eligible ahead of the remaining Gate 3 slice |
| Manual screen-reader, real IME, and forced-colors matrix | Deferred | Automated axe, keyboard, composition-event, bidi, reduced-motion, and reflow coverage passed; independent manual assistive-technology evidence is not claimed |
| Model and prospective evaluation | Skipped | No runtime or evaluation model calls; no prospective fixtures consumed |
| Publication authorization and license files | Completed | User authorized the exact plan; `LICENSE` is MIT and `LICENSE-CONTENT` applies CC BY 4.0 to maintained content |
| Public repository and `main` | Completed | <https://github.com/jkolantree/phrasegarden>; exact local and remote refs matched after push |
| Previous versioned GitHub release | Unchanged | `v0.1.0-preview.1`; qualified Pages ZIP, byte manifest, and `SHA256SUMS` remain immutable |
| Current versioned GitHub release | In progress | Proposed unused tag `v0.1.0-preview.2`; release creation follows local packaging and fast-forward push |
| Published GitHub Pages baseline | Unchanged | `0.1.0-preview.1`, workflow run `30065621412`, attempt 2; <https://jkolantree.github.io/phrasegarden/> |

## Current verification evidence

### `0.1.0-preview.2` publication candidate

- Focused UI-copy and prompt-artifact tests: 2 files, 4/4 passed.
- Full unit and snapshot suite: 12 files, 271/271 passed.
- TypeScript: both `tsconfig.json` and `tsconfig.domain.json` passed.
- Browser: 9/9 sequential Microsoft Edge Playwright journeys passed. The
  suite covers exact direct-versus-optional prompt bytes, initial-viewport
  Home and Review actions, Browser Back, edited-copy replacement confirmation,
  native before-unload, visible Copy/Download success and failure, an actual
  loaded-session offline path, Preview/Generic isolation, Voice capability
  limitations, modality-aware destination privacy, IME composition, keyboard
  order, axe, bidi, reduced motion, 320 px, and 200%/400%-equivalent reflow.
- Summary catalog is `en@1.1.0`; generated prompt snapshots and artifact byte
  tests remain green. Direct and optional-settings paths use the same compiler
  and produce exact canonical equality for identical effective inputs.
- Every exposed configuration enum has an explicit English interface label,
  enforced by `tests/app/ui-copy.test.ts`.
- Forbidden-domain and stale-flow-copy scans returned zero matches.
- `git diff --check` passed.
- Current local production build:

  | Pages path | Bytes | SHA-256 |
  |---|---:|---|
  | `assets/index-B94Y9q7K.css` | 18,674 | `48D704328CC092BC897ED13EE3B1EE11421281013B930E947D1C2D25657A1FC3` |
  | `assets/index-rJLSNRcR.js` | 145,347 | `6FC247AC92CB9CE53E5280DEBF4CA49870E989595936C375581FA5A94745C1F6` |
  | `index.html` | 899 | `C203281FD5001C62F2558F38DFA82ADC3AE620852AE6E28B86A1917AAD984508` |

- Current screenshots:
  `artifacts/screenshots/home-desktop.png`,
  `artifacts/screenshots/home-mobile-320.png`,
  `artifacts/screenshots/builder-written-desktop.png`,
  `artifacts/screenshots/review-written-desktop.png`, and
  `artifacts/screenshots/review-mobile-320.png`.
- Direct screenshot inspection found no clipping, overlap, or hidden primary
  action at the tested desktop and mobile widths.
- Independent current-byte review first found modality-blind
  destination-privacy copy and stale evidence wording. Both were corrected.
  The final quiescent recheck returned PASS with no open P1/P2/P3 findings;
  its 20-file start/end fingerprint had zero drift.

### Published `0.1.0-preview.1`

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
- GitHub Actions build: 11/11 test files and 270/270 tests passed on Ubuntu;
  the first deploy attempt failed closed because Pages had not yet been
  enabled. After selecting GitHub Actions as the Pages source, failed-job
  rerun attempt 2 deployed successfully.
- Production-byte qualification: `index.html`, CSS, and JavaScript were
  downloaded from the public Pages URL and matched all 3/3 manifest byte
  lengths and SHA-256 values exactly.

## Known limitations

- Preview pair guidance is versioned and deterministic, but external
  linguistic review has not been completed.
- Generic generation is intentionally conservative and contains no
  pair-specific advice.
- The interface and generated instruction surface are English-only.
- PhraseGarden generates prompts; it does not translate, assess pronunciation,
  listen to audio, or call an AI model.
- Interpreter remains unimplemented; Written Translator and Live Voice Coach
  are the only current modalities.
- No local library, import/export, sharing, service worker, or offline refresh
  exists. A loaded page compiles without runtime network calls, but opening or
  refreshing a hosted copy requires its static host unless the browser cache
  satisfies the request.
- Hosted infrastructure may retain ordinary request logs even though
  PhraseGarden has no project analytics or telemetry.
- The archive proves captured build bytes. Production Pages bytes were
  independently downloaded and matched, but this does not by itself prove
  UI-mediated download identity for the GitHub release attachment.
- Source code is MIT-licensed. Maintained prompts/content are CC BY
  4.0-licensed under `LICENSE-CONTENT`.
- GitHub currently emits a non-blocking deprecation warning because several
  upstream actions target Node.js 20 while GitHub forces them onto Node.js 24.

## Credit-expensive work deliberately avoided

No second visual ideation batch, model evaluation, prospective-fixture
consumption, external linguistic evaluation, remote browser farm, telemetry,
backend, or runtime AI work was performed.

## Exact next eligible action

Complete the authorized `0.1.0-preview.2` publication package: bind the audited
Pages bytes to a new manifest and archive, fast-forward public `main`, create
the immutable tag and release, deploy Pages, and compare the production bytes.

After that handoff, the next eligible implementation package under the accepted
gate order is the bounded Gate 3 Interpreter slice. It requires its own task
contract and must pass before Gate 4 local ownership begins.
