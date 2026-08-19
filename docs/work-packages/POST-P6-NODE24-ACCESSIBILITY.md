# Post-Preview-6 Node 24 and accessibility maintenance

Status: historical maintenance source contract; no publication or release authority

## Objective

Remove the known GitHub Actions Node 20 warnings and make the language-support
and complete-instruction surfaces easier for accessibility APIs to discover,
while adding bounded forced-colors regression coverage.

## Source of truth

- Public Preview 6 commit `d0922651db3bef58215ea130876d88bd54b8e3bc`
- `docs/ACCESSIBILITY.md`, `docs/LIMITATIONS.md`, and
  `docs/DESIGN-CONTRACT.md`
- Official stable action definitions and release tags retrieved on
  2026-08-19
- Existing Playwright/axe and exact workflow-policy tests

## In scope

- `.github/workflows/pages.yml`
- `tests/release/release-audit.test.ts`
- `src/ui/SupportStatus.tsx`
- `src/app/App.tsx`
- `src/ui/styles.css`
- `tests/e2e/preview.spec.ts`
- `docs/ACCESSIBILITY.md`
- `docs/LIMITATIONS.md`
- `docs/PROJECT-STATE.md`
- This contract

The workflow keeps its existing triggers, permissions, commands, artifact,
audit order, and deployment architecture. Only these official outer action
pins change:

| Action | Stable release | Immutable commit | Runtime |
|---|---|---|---|
| `actions/checkout` | `v7.0.1` | `3d3c42e5aac5ba805825da76410c181273ba90b1` | Node 24 |
| `pnpm/action-setup` | `v6.0.10` | `0977fd99725f1db4007ccb2928dbb4e90d06cc86` | Node 24 |
| `actions/setup-node` | `v7.0.0` | `820762786026740c76f36085b0efc47a31fe5020` | Node 24 |
| `actions/upload-pages-artifact` | `v5.0.0` | `fc324d3547104276b827a68afc52ff2a11cc49c9` | composite; pins Node-24 `upload-artifact@v7.0.0` |
| `actions/deploy-pages` | `v5.0.0` | `cd2ce8fcbc39b97be8ca5fce6e763baed58fa128` | Node 24 |

## Out of scope

- Prompt, summary, compiler, recipe, language-profile, pair-pack, tier, registry,
  privacy, or locale changes
- Rewriting Preview 6 or changing its archive, manifest, ledger, tag, or public
  bytes
- Manual screen-reader, physical-device IME, or manual forced-colors claims
- Moderated usability participants or external linguistic review
- Commit, push, tag, GitHub Release, Pages deployment, or publication

## Acceptance

- Every workflow action is pinned to the exact official commit above and its
  action definition uses Node 24, directly or through the named composite.
- Workflow triggers, permissions, commands, full-history checkout, strict
  committed-package verification, browser/audit order, and active Preview 6
  artifact remain unchanged.
- Each active view exposes one named language-guidance region.
- The focusable complete prompt is named by its visible heading.
- Forced-colors emulation keeps visible focus, checked state, support and
  limitation truth, 44 px actions, DOM order, and narrow reflow without new
  axe violations.
- Automated evidence is not described as a manual screen-reader,
  forced-colors, real-device, WCAG, usability-participant, or linguistic-review
  pass.
- Prompt snapshots and protected domain bytes remain unchanged.

## Verification

```text
pnpm exec vitest run tests/release/release-audit.test.ts
pnpm exec playwright test tests/e2e/preview.spec.ts -g "role and name queries|forced colors"
pnpm test
pnpm typecheck
pnpm build
pnpm test:e2e:dist
git diff --check
```

The immutable Preview 6 release manifest cannot audit this intentionally
changed source build. Release-output audit belongs to the separately versioned
successor package and is not simulated with Preview 6 metadata.

## Stop conditions

Stop on an unexpected baseline failure, action-ref drift, a workflow control or
permission change, prompt/domain byte drift, platform-specific color
overfitting, or any need to claim unavailable human/device/reviewer evidence.
Publication requires a separately versioned successor package and explicit
authority; this package never mutates Preview 6.

## Handoff

Report changed files, exact checks run, observed limitations, independent
review, and the smallest separately authorized release step. Do not describe
this local source package as deployed or release-ready.
