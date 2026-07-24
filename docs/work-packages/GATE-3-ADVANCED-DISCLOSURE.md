# Gate 3.5 Advanced disclosure

## Objective

A visitor sees the few settings most people use immediately and can open one
plain `Advanced settings` disclosure for the existing uncommon controls,
without changing any effective configuration or generated artifact.

## Source of truth

- `docs/PRODUCT.md` primary journey and current MVP
- `docs/RECIPE-SCHEMA.md` fields, enums, defaults, and modality rules
- `docs/DESIGN-CONTRACT.md` Woven Conversation Builder
- `docs/DECISIONS.md`, especially ADR-024, ADR-025, ADR-026, and ADR-027
- `docs/TRACEABILITY.md`, requirements `G3-ADV-01`–`G3-ADV-09`
- User-approved decision: this package reorganizes existing settings only; it
  adds no ontology, prompt behavior, summary semantics, or version transition
- Interpreter checkpoint `c2e6104e3b47ef180d5e27da5147d31b59ee4ebf`
- Process checkpoint `e29342674c28b80be9cbc894abd2e5df17a7a1b1`

## In scope

Exact field placement:

| Setting | Written | Live Voice | Interpreter |
|---|---|---|---|
| relationship | visible | visible | visible |
| hierarchy / relative status | advanced | advanced | advanced |
| register / tone and formality | visible | visible | visible |
| ambiguity | advanced | advanced | absent |
| title/honorific handling | advanced | advanced | advanced |
| unknown-name reading | advanced | advanced | absent |
| Written output detail | visible | absent | absent |
| correction timing and focus | absent | visible | absent |
| pronunciation, teaching depth, and pace | absent | visible | absent |
| five declared destination capabilities | absent | advanced | absent |
| turn mode and clarification | absent | absent | visible |

The Builder has exactly one native `details` disclosure named
`Advanced settings`, closed on first entry. Existing settings remain controlled
by the same state values and handlers. Interpreter continues to omit ambiguity
and unknown-name controls under ADR-025.

Owned paths:

- `docs/DECISIONS.md`
- `docs/PROJECT-STATE.md`
- `docs/TRACEABILITY.md`
- `docs/work-packages/GATE-3-ADVANCED-DISCLOSURE.md`
- `src/app/App.tsx`
- `src/ui/styles.css`
- `tests/e2e/preview.spec.ts`

## Out of scope

- Any new enum, field, default, recipe clause, prompt rendering, summary item,
  warning, limitation, provenance field, support behavior, or artifact version
- Changes under `src/domain`, `src/packs`, `src/recipes`, or `src/locales`
- Changes to package/release identity, published samples, archives, manifests,
  checksums, workflows, or public Preview bytes
- Local save/library, import/export, sharing, Japanese UI, service worker,
  runtime/model calls, evaluation, packaging, remote CI, or publication
- New relationship prose, source text, audio, or destination detection

## Acceptance

| ID | Observable behavior |
|---|---|
| `G3-ADV-01` | Every modality shows exactly one native `Advanced settings` disclosure; no second Builder disclosure remains. |
| `G3-ADV-02` | Relationship, register, and every selected modality's core controls are visible while the disclosure is closed. |
| `G3-ADV-03` | Hierarchy appears exactly once inside Advanced for every modality. |
| `G3-ADV-04` | Ambiguity and unknown-name controls appear only for Written and Voice; title handling appears for all three. |
| `G3-ADV-05` | Voice alone exposes the five user-declared destination capabilities inside Advanced, with the existing non-detection explanation. |
| `G3-ADV-06` | Opening, closing, or switching the disclosure cannot mutate any setting or effective configuration. |
| `G3-ADV-07` | Identical settings still produce byte-identical prompt, summary, warnings, limitations, and provenance through direct and Builder paths. |
| `G3-ADV-08` | Protected semantic paths, current prompt snapshots/hashes, artifact versions, and published bytes do not change. |
| `G3-ADV-09` | Closed and open disclosure states work with native keyboard semantics, axe, 320 px, and 200%/400%-equivalent reflow without page overflow. |

## Verification

Run cheap checks before expensive checks:

```text
exact owned-path and protected semantic-path diff
single-disclosure and modality field-map source scan
full Vitest suite and both TypeScript configurations
Vite production build and release audit
focused sequential Playwright/axe Advanced, keyboard, and reflow cases
full sequential Playwright/axe suite
1280 × 720 and 320 × 900 open/closed Builder screenshot inspection
git diff --check, exact staged allowlist, cached diff check, and staged fingerprint
independent read-only current-byte review
```

No prompt/model prospective evaluation is warranted because no prompt or
semantic byte is allowed to change.

## Stop conditions

Stop if grouping requires a new setting, default, label ontology, prompt or
summary change, version bump, non-native disclosure behavior, hidden core
control, Interpreter ambiguity/name exposure, inferred host capability,
protected-path change, package growth beyond 500 net lines, unexpected
baseline failure, or any remote action.

## Handoff

Record the exact changed paths, field map, tests, screenshots, prompt-byte
regression result, independent verdict, failures, repair counters, limitations,
and next eligible Gate 3 exit action in `docs/PROJECT-STATE.md`. Create a
local-only checkpoint and stop before Gate 3 exit qualification.
