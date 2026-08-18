# Preview 3 beginner-facing language journey

## Objective

A first-time visitor can understand what PhraseGarden makes, choose any of the
twelve bundled languages without seeing implementation codes, create a prompt
directly, and confirm its exact direction and support level on Review.

## Source of truth

- User authorization and plain-language direction on 2026-08-17
- `docs/PRODUCT.md`, `docs/DESIGN-CONTRACT.md`, and ADR-030
- Generic language checkpoint
  `db85ed4a09f2e960ce0f6a31f84844b6e719bdf6`
- The independent UX, accessibility, and language-expansion audits
- Existing semantic native-select, direct-create, copy, and download behavior

## In scope

Exactly these package-owned paths:

```text
docs/DECISIONS.md
docs/PROJECT-STATE.md
docs/TRACEABILITY.md
docs/work-packages/PREVIEW-3-BEGINNER-JOURNEY.md
docs/work-packages/PREVIEW-3-PUBLICATION.md
src/app/App.tsx
src/ui/LanguageLabel.tsx
src/ui/SupportStatus.tsx
src/ui/language-presentation.ts
src/ui/styles.css
tests/app/ui-copy.test.ts
tests/e2e/preview.spec.ts
```

Presentation uses one explicit bundled display catalog. It orders languages by
their authored English display names, shows an authored English name plus
autonym, isolates mixed-direction text, and keeps the canonical tag only in
control values and technical provenance. It never sorts with ambient `Intl`.

The direct-create path remains primary. Pair labels and help adapt to Written,
Voice, or Interpreter modality. Review visibly restates home language, target
language, tool, and derived support level before the handoff.

## Out of scope

- Compiler, registry, profile, recipe, pair-pack, prompt, summary, provenance,
  support-tier resolution, copy bytes, or downloaded prompt bytes
- Search/combobox behavior, aliases, flags, additional language identities,
  regional Portuguese, interface localization, or generated-prompt localization
- Pair-specific review claims, support-tier promotion, runtime model calls,
  persistence, sharing, Gate 4+, Pages policy, packaging, push, or publication
- A claim that automated interaction proves novice comprehension or the
  under-two-minute product goal; that needs separately consented usability work

## Acceptance

| ID | Observable evidence |
|---|---|
| `BJ-01` | Hero copy says PhraseGarden makes instructions for another tool and never asks for source text. |
| `BJ-02` | Tool descriptions say what prompt is made; Voice states that audio depends on the other tool. |
| `BJ-03` | Written and Interpreter use `Translate from` / `Translate into`; Voice uses `Explain in` / `Practice in`, with matching help. |
| `BJ-04` | Both native selects expose exactly twelve canonical values in deterministic English-name order, with visible English names/autonyms and no flags or visible BCP-47 codes. |
| `BJ-05` | Mixed LTR/RTL labels are isolated; document interface language stays English after any language selection. |
| `BJ-06` | Generic copy states that general meaning-and-tone rules apply and that the exact direction has neither pair-specific guidance nor independent language review. |
| `BJ-07` | Review visibly identifies the exact direction and tool before support and handoff content. |
| `BJ-08` | Language changes and Swap announce the resulting English-readable direction, exact derived tier, and bounded tier meaning. |
| `BJ-09` | English→French, German↔Italian, English→Portuguese, and English→Spanish journeys remain Generic; English↔Japanese remains Preview. |
| `BJ-10` | Copy and download remain byte-identical to the generated prompt; Portuguese never implies a region; Generic output contains no Japanese-specific guidance. |
| `BJ-11` | 1280×720 and 320×900 Home/Review, keyboard completion, axe, overflow, and 200%/400%-equivalent reflow checks pass. |
| `BJ-12` | Prompt/provenance snapshots and all protected deterministic layers remain byte-unchanged. |

## Verification

```text
pnpm test -- tests/app/ui-copy.test.ts
pnpm test
pnpm exec tsc -p tsconfig.json --noEmit
pnpm exec tsc -p tsconfig.domain.json --noEmit
pnpm build
pnpm test:e2e:dist
git diff --check
```

Also inspect fresh 1280×720 and 320×900 Home/Review screenshots, verify no page
overflow at 200% and 400%-equivalent reflow, scan package scope and forbidden
domain dependencies, compare protected paths and all historical checksums, and
obtain an independent read-only review of the exact package bytes.

## Stop conditions

Stop if presentation needs a second language identity, tier becomes
user-selectable, native selects become inaccessible, source text is requested,
prompt/provenance bytes change, `pt` acquires a regional claim, a baseline
fails outside this package, the work approaches 700 net lines, or Pages-policy
bytes would need to enter this package.

## Handoff

Record exact copy, ordering, journeys, test counts, screenshots, accessibility
limits, independent verdict, and the next Pages-policy package in
`PROJECT-STATE.md` and `TRACEABILITY.md`. Checkpoint only the twelve owned
paths. Do not freeze source, build release artifacts, stage the two excluded
Pages-policy files, push, or publish.
