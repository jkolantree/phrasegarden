# PhraseGarden project state

Updated: 2026-07-24

## Current state

Shipping milestone D — public usability Preview, plus one unpublished Gate 3
candidate. PhraseGarden `0.1.0-preview.2` remains committed, tagged, released
as a public pre-release, and deployed at
<https://jkolantree.github.io/phrasegarden/>. Release tag
`v0.1.0-preview.2` identifies exact package commit
`6e55e8d142c748de181cd5136076d576d0994e19`. Both published Previews remain
immutable.

Two bounded usability packages are included:

- the plain-language pass replaces implementation language with intentional
  labels and readable behavior summaries;
- the zero-friction/safe-handoff pass exposes the working controls on Home,
  creates directly without a mandatory Builder visit, makes first actions
  visible in initial desktop and mobile viewports, explains the destination
  handoff, reports Copy/Download outcomes visibly, and protects edited prompts
  from silent replacement.

Within the published Preview 2 usability packages, the compiler, generated
prompt instructions, canonical prompt bytes, language identities, pair
guidance, support resolution, and review evidence remained unchanged. The
package/release identity advanced to `0.1.0-preview.2`; its compiler provenance
remains `0.1.0-preview.1`.

The current workspace additionally contains a completed, locally verified, and
independently re-approved, but unpublished, Gate 3 Interpreter slice. It adds a
one-way, host-bounded relay recipe, its plain-language controls and review
handoff, deterministic prompt renderings, and regression coverage. It does not
alter published package bytes, support-tier claims, authored language profiles,
pair packs, or review evidence.

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
- Interpreter is a one-way relay from the selected home language into the
  selected target language. Reversing direction requires swapping languages
  and creating a new prompt.
- The host or user supplies each complete turn, message, or short segment.
  PhraseGarden does not claim speaker detection, language-direction detection,
  audio handling, pause detection, interruption detection, or turn-boundary
  inference.
- Interpreter clarification owns blocked recovery: `ask-if-blocking` permits
  at most one concise question; `mark-uncertainty` never asks and instead
  produces the narrowest responsible marked relay or states that no responsible
  relay is possible. This is ADR-025.

## Shipping milestones

| Item | State | Evidence |
|---|---|---|
| Milestone A — compiler and authored data | Completed | Seven exact language profiles; EN↔JA Preview pack; Written Translator and Live Voice Coach; pure resolution/compiler; five snapshots in `samples/0.1.0-preview.1/` |
| Milestone B — Woven Conversation slice | Completed | Memory-only Home → Review direct path plus optional Builder in `src/app/App.tsx`; behavior summary, provenance, copy, edit, restore, and exact text download |
| Milestone C — published automated QA | Completed | `0.1.0-preview.2`: 271/271 Vitest and 9/9 sequential Playwright/axe journeys passed locally and on Ubuntu; dual typechecks, Vite build, release audit, and domain scan passed |
| Keyboard-only primary journey | Completed | Focused Playwright path uses Tab/Enter through skip link, selectors, tool, controls, generation, copy, download, readable prompt surface, and editing |
| Narrow/reflow and visual inspection | Completed | Playwright 320 px, 200%, and 400%-equivalent checks; five current screenshots inspected with no visible clipping, overlap, or stray focused skip link |
| Deterministic-domain boundary | Completed | Forbidden-API scan returned zero matches in `src/domain` |
| Milestone D — documentation and packaging | Completed | Public docs, samples, Pages workflow, publication manifest, byte manifest, Pages archive, and `SHA256SUMS` are present locally |
| Published release independent review | Unchanged | Published `0.1.0-preview.1` verdict: PASS with no open P1/P2/P3 findings |
| Gate 2I review-evidence semantics | Unchanged | ADR-022 and its pure structural validator remain separate from this candidate; no fabricated review or tier evidence was added |
| Plain-language usability pass | Completed | Published Home explains what a prompt is and where to use it; Builder exposes intentional labels; Review leads with plain-language choices and keeps technical identifiers in disclosure |
| Plain-language independent review | Completed | Independent current-byte review returned PASS with no open P1/P2/P3 findings after the final option-label and empty-caution fixes |
| Zero-friction entry and safe handoff | Completed | Published direct Home creation, mobile Quick start, optional Builder, initial-viewport actions, explicit paste order, modality-aware privacy, visible feedback, artifact-preserving navigation, and edit-loss protection |
| Current local automated QA | Completed | Interpreter candidate: 277/277 Vitest; 10/10 sequential Edge Playwright/axe journeys; dual typechecks, Vite build, release audit, and forbidden-domain scan passed |
| Published usability independent review | Completed | Preview 2 quiescent current-byte review: PASS with no open P1/P2/P3 findings; 20-file start/end fingerprint had zero drift |
| First Preview 2 packaging review | Superseded | It passed, but GitHub Actions run `30096526036` exposed a Chromium viewport failure before tagging, release, or deployment; its package bytes were replaced |
| Corrected Preview 2 packaging review | Completed | Follow-up independent read-only review: PASS with zero P1/P2/P3; 9/9 checksums, 3/3 archive members, exact source binding, old-release preservation, unchanged regression assertion, and zero post-freeze runtime drift verified |
| `0.1.0-preview.2` publication package | Completed | Corrected source `78452fe797ee1f6c98ae06dba6f0aa2ffceb127c`; exact package/tag commit `6e55e8d142c748de181cd5136076d576d0994e19`; local, CI, release-asset, Pages-byte, and production-journey checks passed |
| In-app localhost manual inspection | Blocked | The Codex in-app Browser rejected further local URL navigation by policy; automated Edge inspection and direct screenshot inspection passed, but this is not claimed as an in-app manual browser pass |
| External linguistic review | Deferred | Preview labels and limitations state that English↔Japanese review is incomplete |
| Interpreter | Completed | Unpublished one-way, host-bounded relay slice; two P2 findings from the first independent review were repaired; 277/277 Vitest, 10/10 Edge Playwright/axe, and the independent re-review pass with no open P1/P2/P3 findings |
| Japanese interface, service worker, persistence, and sharing | Deferred | Deliberately outside this usability candidate and not eligible ahead of the remaining Gate 3 slice |
| Manual screen-reader, real IME, and forced-colors matrix | Deferred | Automated axe, keyboard, composition-event, bidi, reduced-motion, and reflow coverage passed; independent manual assistive-technology evidence is not claimed |
| Model and prospective evaluation | Skipped | No runtime or evaluation model calls; no prospective fixtures consumed |
| Publication authorization and license files | Completed | User authorized the exact plan; `LICENSE` is MIT and `LICENSE-CONTENT` applies CC BY 4.0 to maintained content |
| Public repository and `main` | Completed | <https://github.com/jkolantree/phrasegarden>; exact local and remote refs matched after push |
| Previous versioned GitHub release | Unchanged | `v0.1.0-preview.1`; qualified Pages ZIP, byte manifest, and `SHA256SUMS` remain immutable |
| Current versioned GitHub release | Completed | Public pre-release `v0.1.0-preview.2` at <https://github.com/jkolantree/phrasegarden/releases/tag/v0.1.0-preview.2>; tag resolves to `6e55e8d142c748de181cd5136076d576d0994e19` |
| GitHub Pages deployment | Completed | Corrected workflow run `30097157552`; build and deploy jobs passed; <https://jkolantree.github.io/phrasegarden/> |
| Production bytes and journey | Completed | 3/3 Pages files and 3/3 release attachments matched local bytes; production EN→JA Written creation, copy, and download passed |

## Current verification evidence

### Unpublished Gate 3 Interpreter candidate

- The bounded contract is
  `docs/work-packages/GATE-3-INTERPRETER-SLICE.md`; ADR-025 records the one-way,
  host-bounded protocol and clarification precedence.
- Focused recipe, compiler-policy, prompt-surface, summary, and UI-copy tests:
  76/76 passed. Full unit and snapshot suite: 12 files, 277/277 passed.
- TypeScript: both `tsconfig.json` and `tsconfig.domain.json` passed. Vite build
  and the release audit passed.
- Browser: 10/10 sequential Microsoft Edge Playwright/axe journeys passed. The
  added journey covers native keyboard tool selection, direct creation,
  unchanged Builder-byte equality, copy/download byte identity, one-way
  direction and swap behavior, both turn modes, both clarification modes,
  Generic isolation, destination privacy, 320 px layout, initial desktop
  action visibility, horizontal-overflow checks, axe, and no runtime remote
  request APIs.
- Current deterministic Interpreter prompt SHA-256 values are:
  `C28BDC4269D12A8E2074E4A7A4FD12F7FE40E3E100AD2CCF1605B0C7F9096A22`
  for default English→Japanese,
  `5A68717E877B4A9C8A52200CA55EADF7F2AF24570C47EC6CC81150E931491896`
  for Japanese→English short-relay plus mark-uncertainty, and
  `083ED45DDFB3FCA34A06D60938D82ECF6CA85AD1AFBC658166F520FCE902BCDC`
  for Generic English→Indonesian.
- Current build bytes are `index.html` at 899 bytes with SHA-256
  `B6FAF2B18B4E78C302CA884FAC4A2C6950AD62CA756952667C8118598BD7DEA7`,
  CSS at 19,054 bytes with SHA-256
  `29453814FEDB64FC8F6B42E17E66BD8473D8F3BA6E2DAE7C7C910CF4D9537FD4`,
  and JavaScript at 155,624 bytes with SHA-256
  `CD57DE393A78B882302CD5C6A322B9B690D59750F0450AA665BA7BAA6A5EAB3D`.
- Eight current Interpreter/default desktop and 320 px screenshots were
  captured and inspected. No clipping, overlap, or horizontal overflow was
  observed.
- The deterministic-domain forbidden-API scan returned zero matches.
- The first authored compiler-policy run failed closed with
  `E-UNSORTED-IN-VALUES`; sorting the declared values fixed the responsible
  policy layer. The first two desktop layout attempts placed the primary action
  at 818.109375 px and 776.109375 px respectively; compacting the three-card
  layout brought it inside the unchanged 720 px acceptance boundary.
- The first independent current-byte review returned FAIL with two P2 findings:
  mark-uncertainty still received ask-capable pair/name wording, and Review
  described a complete turn after short-relay was selected. The repair
  neutralized pair/name guidance so the active clarification rule is the sole
  blocked-recovery authority, covers both directions and both unknown-name
  choices, and derives Review handoff wording from the selected turn mode.
  Repair-focused tests passed 26/26; the full 277/277 suite, both typechecks,
  Vite build, release audit, and all 10 Edge/axe journeys then passed.
- The second independent current-byte review returned PASS with no open
  P1/P2/P3 findings. It independently compiled and inspected all 12 mark-mode
  direction × ambiguity × name configurations, confirmed exactly one bounded
  ask instruction in ask mode, verified both handoff branches, matched the
  three prompt hashes and build hashes, and found zero published/package drift.
  Its quiescent repaired-diff SHA-256 was
  `4A1E656556DE71822CD6B75E46FA69104431CAFCEB368BD8E2021FFADC4831FE`
  before this final evidence-only state update.
- Published samples, release material, package identity, compiler identity,
  language profiles, pair pack, support resolution, and review-evidence
  semantics are unchanged. No commit, push, package, tag, release, or deployment
  was performed.

### Published `0.1.0-preview.2`

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
  | `assets/index-BjQ0pqo0.css` | 18,674 | `BC79B6F84CD4A832BE24633B0AB139E0D5FE2BA9D62463EC66883A451827F7DF` |
  | `assets/index-Dt4wG1oY.js` | 145,347 | `6FC247AC92CB9CE53E5280DEBF4CA49870E989595936C375581FA5A94745C1F6` |
  | `index.html` | 899 | `A3DE753057F92E2124265D5335E54E9CDA8C2621CFE8991C65A09C880573CE98` |

- Source freeze:
  `78452fe797ee1f6c98ae06dba6f0aa2ffceb127c`.
- Pages archive:
  `release/phrasegarden-0.1.0-preview.2-pages.zip`, 44,006 bytes,
  SHA-256
  `F76C665A2919B5403627667CB76D72015B0A4E79C0D95D653B4AD9EB6D4C15CF`.
- Byte manifest SHA-256:
  `54EA72417BFCC34246E937A427DD0C7BFD17132FA9EB8C42D7B173D51CEBAE38`.
- Local artifact qualification: all 9/9 `SHA256SUMS` entries and all 3/3
  extracted Preview 2 Pages files matched their recorded byte lengths and
  SHA-256 values. ZIP member paths use forward slashes.
- GitHub Actions run `30096526036` failed closed before deployment: Ubuntu
  Chromium measured the default Home primary-action bottom at `742.140625` px
  in a 720 px viewport. This was classified as an interface failure. The
  existing negative assertion remains unchanged; large-screen top/hero spacing
  was reduced by 28 px in the smallest responsible CSS layer. The focused
  browser case and all 9/9 local Edge journeys then passed.
- The corrected package's follow-up independent review returned PASS with zero
  open P1/P2/P3 findings. It independently reverified all 9/9 checksum
  targets, all 3/3 archive entries against the manifest and current `dist`,
  exact corrected-source binding, byte preservation of the old release,
  unchanged viewport assertion, version honesty, and zero post-freeze runtime
  drift.
- Corrected GitHub Actions run `30097157552` passed 271/271 Vitest, both
  typechecks, the Vite build, release audit, 9/9 Ubuntu Chromium
  Playwright/axe journeys, Pages artifact upload, and deployment.
- Public pre-release
  <https://github.com/jkolantree/phrasegarden/releases/tag/v0.1.0-preview.2>
  resolves to package commit
  `6e55e8d142c748de181cd5136076d576d0994e19`.
- The ZIP, manifest, and `SHA256SUMS` attachments were downloaded from their
  public release URLs. All 3/3 matched their exact local byte lengths and
  SHA-256 values; `SHA256SUMS` itself is 1,008 bytes with SHA-256
  `47B0294830BB8E6E5B68B4FEB170691E41F02745736CAF5396FDF51879DBBFDF`.
- Production `index.html`, CSS, and JavaScript were independently downloaded
  from Pages and matched all 3/3 manifest path, length, and SHA-256 bindings.
- A clean production Microsoft Edge journey generated the default
  English→Japanese Written prompt, confirmed the Preview limitation, copied
  all 5,155 characters exactly after Windows clipboard newline normalization,
  and downloaded byte-identical text as
  `phrasegarden-en-ja-written-translator-0.1.0-preview.1.txt`. The filename
  correctly reflects unchanged compiler provenance.

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
- The local Interpreter candidate is one-way only and relies on the host or
  user to supply complete turn boundaries. It does not detect speakers,
  direction, audio, pauses, interruptions, or turn boundaries, and it has not
  been published.
- No local library, import/export, sharing, service worker, or offline refresh
  exists. A loaded page compiles without runtime network calls, but opening or
  refreshing a hosted copy requires its static host unless the browser cache
  satisfies the request.
- Hosted infrastructure may retain ordinary request logs even though
  PhraseGarden has no project analytics or telemetry.
- The archive, direct GitHub release-attachment downloads, direct production
  Pages downloads, and the in-product prompt download were verified as
  separate transport boundaries. This evidence does not generalize to every
  browser, destination tool, or future host response.
- Source code is MIT-licensed. Maintained prompts/content are CC BY
  4.0-licensed under `LICENSE-CONTENT`.
- GitHub currently emits a non-blocking deprecation warning because several
  upstream actions target Node.js 20 while GitHub forces them onto Node.js 24.

## Credit-expensive work deliberately avoided

No second visual ideation batch, model evaluation, prospective-fixture
consumption, external linguistic evaluation, remote browser farm, telemetry,
backend, runtime AI work, packaging, remote write, or deployment was performed.

## Exact next eligible action

The next eligible implementation package under the accepted gate order is a
bounded Gate 3 Advanced controls slice. It requires its own task contract and
must pass before Gate 4 local ownership begins. It has not started.
