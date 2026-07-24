# Release notes

## 0.1.0-preview.1 — public Preview

Date: 2026-07-23

### Product behavior

- Added the Woven Conversation home, builder, and generated-prompt review flow.
- Added English→Japanese and Japanese→English Preview generation.
- Added conservative Generic generation for every other bundled direction.
- Added Written Translator and Live Voice Coach controls and summaries.
- Added local copy, explicit local editing, regeneration confirmation, and
  exact UTF-8 plain-text download.

### Deterministic compiler

- Added exact version materialization, directed-pair resolution, pure
  compilation, stable section order, typed rendering, prompt budgets, warnings,
  limitations, and full provenance.
- Added the non-review `preview` tier without changing future review-evidence
  semantics.
- Preserved strict Generic isolation and rejected caller-supplied tier claims.

### Tests and QA

- Added five canonical prompt snapshots and compiler negative fixtures.
- Added prompt-artifact byte-boundary tests.
- Passed 270/270 unit and snapshot tests, both TypeScript configurations, the
  production build, release-byte audit, and a zero-match deterministic-domain
  API scan.
- Passed 4/4 sequential Microsoft Edge Playwright/axe journeys.
- Added sequential Playwright and axe journeys for Preview, Voice, Generic,
  editing, copy/download, keyboard, mobile, bidi, reduced motion, zoom/reflow,
  and runtime network isolation.
- Fixed Windows download newline rewriting by encoding explicit UTF-8 bytes.
- Fixed IME composition commits, keyboard skip-link focus, correction-focus
  summary synthesis, and a duplicate Preview notice in review.

### Known limitations

See [LIMITATIONS.md](LIMITATIONS.md). Most importantly, Preview pair guidance
has not completed external linguistic review; Generic has no pair-specific
guidance; there is no runtime AI, persistence, service worker, Japanese
interface, or completed assistive-technology matrix.

Public source:
<https://github.com/jkolantree/phrasegarden>

Versioned release:
<https://github.com/jkolantree/phrasegarden/releases/tag/v0.1.0-preview.1>

GitHub Pages:
<https://jkolantree.github.io/phrasegarden/>
