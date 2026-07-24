# Gate 3 Interpreter candidate evidence

Status: local checkpoint; unpublished and not release-qualified
Recorded: 2026-07-24

## Identity and scope

- Contract: `docs/work-packages/GATE-3-INTERPRETER-SLICE.md`
- Governing decision: ADR-025
- Parent checkpoint:
  `aaead44a2b8d604cb390d369a4e588713de2df9e`
- Local candidate commit:
  `c2e6104e3b47ef180d5e27da5147d31b59ee4ebf`
- Candidate tree:
  `68b87eabf3bce25ee989d736787d259016072530`
- Reviewed stage-set fingerprint before commit:
  `4fcdb10e9505510753b6c4ab4f2d3cf806f2837a`
- Exact checkpoint scope: 23 modified tracked paths plus two additions,
  `docs/work-packages/GATE-3-INTERPRETER-SLICE.md` and
  `src/recipes/interpreter.ts`.

The candidate adds one-way, host-bounded Interpreter relay prompts, plain
controls and Review handoff, deterministic renderings, and regression
coverage. It does not alter published samples or releases, support claims,
language profiles, pair packs, or review evidence.

## Deterministic prompt and build evidence

Prompt SHA-256:

- default English→Japanese:
  `C28BDC4269D12A8E2074E4A7A4FD12F7FE40E3E100AD2CCF1605B0C7F9096A22`
- Japanese→English short-relay plus mark-uncertainty:
  `5A68717E877B4A9C8A52200CA55EADF7F2AF24570C47EC6CC81150E931491896`
- Generic English→Indonesian:
  `083ED45DDFB3FCA34A06D60938D82ECF6CA85AD1AFBC658166F520FCE902BCDC`

Local build at final verification:

| Path | Bytes | SHA-256 |
|---|---:|---|
| `index.html` | 899 | `B6FAF2B18B4E78C302CA884FAC4A2C6950AD62CA756952667C8118598BD7DEA7` |
| CSS | 19,054 | `29453814FEDB64FC8F6B42E17E66BD8473D8F3BA6E2DAE7C7C910CF4D9537FD4` |
| JavaScript | 155,624 | `CD57DE393A78B882302CD5C6A322B9B690D59750F0450AA665BA7BAA6A5EAB3D` |

## Verification record

- Focused recipe, policy, rendering, summary, and UI-copy tests: 76/76 passed.
- Repair-focused tests: 26/26 passed.
- Full suite: 12 files, 277/277 passed.
- Both TypeScript configurations passed.
- Vite build, release audit, `git diff --check`, protected-release diff, and
  deterministic-domain forbidden-API scan passed.
- 10/10 sequential Microsoft Edge Playwright/axe journeys passed. The new
  journey covered native keyboard selection, direct creation, Builder-byte
  equality, copy/download identity, one-way swap behavior, both turn modes,
  both clarification modes, Generic isolation, destination privacy, 320 px,
  initial desktop visibility, horizontal overflow, axe, and runtime request
  isolation.
- Eight desktop/mobile screenshots were captured and inspected with no
  clipping, overlap, or horizontal overflow.

## Preserved failures and repairs

- The first authored compiler-policy run failed closed with
  `E-UNSORTED-IN-VALUES`; sorting the declared values repaired the policy layer.
- The first two desktop layout attempts placed the primary action at
  `818.109375` px and `776.109375` px. Compacting the three-card layout brought
  it inside the unchanged 720 px boundary.
- The first independent current-byte review failed with two P2 findings:
  mark-uncertainty still received ask-capable pair/name wording, and Review
  described a complete turn when short-relay was selected.
- The semantic repair made the active Interpreter clarification rule the sole
  blocked-recovery authority across both directions and all unknown-name
  choices. The UI repair derived handoff wording from selected turn mode.
  Negative/regression coverage was retained.

## Independent review

The second independent current-byte review returned PASS with no open
P1/P2/P3. It compiled all 12 mark-mode direction × ambiguity × name
configurations, confirmed one bounded ask instruction in ask mode, verified
both handoff branches, matched the three prompt hashes and build hashes, and
found zero published/package drift.

Its repaired-diff SHA-256 before the final evidence-only state update was
`4A1E656556DE71822CD6B75E46FA69104431CAFCEB368BD8E2021FFADC4831FE`.
A final checkpoint review then bound the exact 25-path worktree: start/end diff
fingerprint `4a06a551a36ceb8d023494519172da9df8431b72`, start/end status fingerprint
`1a68def1be7724a888fd3d1a865d98f5be52269d`, no P1/P2/P3, and zero protected
path drift. The exact set was staged, checked, and committed locally.

## Preserved limits

- Interpreter is one-way and relies on the destination/user to supply complete
  turns or short complete segments.
- It does not detect speakers, language direction, audio, pauses,
  interruptions, silence, or turn boundaries.
- External linguistic review, model evaluation, prospective evaluation,
  package generation, remote CI, release, deployment, and production
  qualification were not performed.
- The public Preview 2 site remains unchanged and does not contain Interpreter.
