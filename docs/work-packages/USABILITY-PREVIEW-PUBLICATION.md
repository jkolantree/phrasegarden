# Usability Preview publication package

## Objective

Publish the verified zero-friction and plain-language usability candidate as
PhraseGarden `0.1.0-preview.2`, without changing canonical compiler output or
rewriting the existing `v0.1.0-preview.1` release.

## Source of truth

- The user's approved public-Preview publication plan and explicit
  authorization for this candidate
- `docs/PRODUCT.md`, `docs/DESIGN-CONTRACT.md`, and ADR-024
- `docs/PRIVACY.md`, `docs/LIMITATIONS.md`, and
  `docs/PUBLICATION-MANIFEST.md`
- The passing usability fixtures in `tests/app` and `tests/e2e`
- Public baseline commit
  `a4595b1eaf1f6253af6c330e1be07a2a42b5af41`

## In scope

- Publish the reviewed local usability changes
- Assign the package and GitHub release identity `0.1.0-preview.2`
- Create an immutable Pages archive, byte manifest, and checksums
- Commit and fast-forward public `main`
- Create the immutable `v0.1.0-preview.2` tag and GitHub release
- Deploy GitHub Pages and verify public bytes and the core prompt journey

## Out of scope

- Compiler, recipe, profile, pair-pack, registry, or canonical prompt version
  changes
- Interpreter, local ownership, sharing, service worker, Japanese interface,
  backend, telemetry, runtime AI, or model evaluation
- Any rewrite of `v0.1.0-preview.1`, its samples, artifacts, tag, or release
- External linguistic, user-study, or assistive-technology claims

## Acceptance

- `origin/main` matches the recorded baseline before publication and the push
  is a normal fast-forward.
- Focused tests, all tests, both typechecks, Vite build, release audit,
  deterministic-domain scan, Playwright/axe, and `git diff --check` pass.
- The new archive contains only the audited `dist` files; every path, length,
  and SHA-256 matches its immutable manifest.
- The old release files and tag remain unchanged.
- The new tag identifies the exact release commit and all uploaded assets
  match local bytes.
- The production Pages files match the new manifest and the core
  English-to-Japanese Written creation, copy, and download journey passes.

## Verification

```text
pnpm exec vitest run tests/app/ui-copy.test.ts tests/app/prompt-artifact.test.ts
pnpm test
pnpm typecheck
pnpm build
pnpm audit:release
pnpm test:e2e
rg forbidden browser, network, storage, clock, randomness, and Preact APIs in src/domain
git diff --check
```

Inspect the archive entries, manifest bindings, remote refs, release assets,
workflow jobs, production response bytes, and rendered production journey.

## Stop conditions

Stop on remote-main drift, a pre-existing `v0.1.0-preview.2` tag or release,
an authentication or permission failure, any failed required check, an
unexpected generated-prompt change, a release-byte mismatch, or a change that
would require broadening the approved product or privacy scope.

## Handoff

Report the exact source and release commits, tag, release URL, Pages URL,
artifact hashes, workflow status, production-byte comparison, journey result,
known Preview limitations, and all Completed, Failed, Blocked, Unchanged, and
Skipped states. Update `docs/PROJECT-STATE.md`, then stop.

## Failure-directed correction

GitHub Actions run `30096526036` failed closed before deployment. At the
default 1280×720 Ubuntu Chromium viewport, the Home primary-action bottom was
`742.140625` px, exceeding the 720 px viewport. Classification: interface.
The existing first-viewport assertion remains the permanent regression
fixture. The smallest responsible fix reduced only large-screen Home and hero
top spacing by 28 px; no acceptance criterion or prompt behavior was changed.

## Completed handoff

- Corrected source:
  `78452fe797ee1f6c98ae06dba6f0aa2ffceb127c`
- Package/tag:
  `6e55e8d142c748de181cd5136076d576d0994e19`
- Corrected Actions and Pages run: `30097157552`
- Release: `v0.1.0-preview.2`
- Pages ZIP: 44,006 bytes,
  `F76C665A2919B5403627667CB76D72015B0A4E79C0D95D653B4AD9EB6D4C15CF`
- Manifest:
  `54EA72417BFCC34246E937A427DD0C7BFD17132FA9EB8C42D7B173D51CEBAE38`
- Remote evidence: 3/3 release attachments and 3/3 production Pages files
  matched local bytes; the production create/copy/download journey passed.
