# Publication manifest

This manifest defines the authorized public repository contents and target
identity for PhraseGarden `0.1.0-preview.6`. Earlier repository,
release, license, and Pages evidence remains immutable. Actual package,
publication, and deployment status is established only by version-bound
release evidence and corresponding public state.

## Authorized repository

- Owner and name: `jkolantree/phrasegarden`
- Visibility: public
- Default branch: `main`
- Repository: <https://github.com/jkolantree/phrasegarden>
- Preview 2 rollback release: <https://github.com/jkolantree/phrasegarden/releases/tag/v0.1.0-preview.2>
- Preview 3 public prerelease: <https://github.com/jkolantree/phrasegarden/releases/tag/v0.1.0-preview.3>
- Preview 4 public prerelease: <https://github.com/jkolantree/phrasegarden/releases/tag/v0.1.0-preview.4>
- Preview 5 has no authorized tag or GitHub release in the current Pages plan
- Preview 6 has no authorized tag or GitHub release in the current Pages plan
- Preview 1 historical release: <https://github.com/jkolantree/phrasegarden/releases/tag/v0.1.0-preview.1>
- Pages: <https://jkolantree.github.io/phrasegarden/>
- Initialization: the existing empty `.git` directory was initialized in place
- Licenses: MIT for code; CC BY 4.0 for maintained prompts, recipes,
  pair/profile content, samples, and documentation

## Include

- `.github/workflows/pages.yml`
- `.gitattributes` and `.gitignore`
- `README.md`, `CONTRIBUTING.md`, `LICENSE`, `LICENSE-CONTENT`, and
  `SHA256SUMS`
- `docs/**`
- `release/phrasegarden-0.1.0-preview.1-pages.zip`
- `release/phrasegarden-0.1.0-preview.1-pages-manifest.json`
- `release/phrasegarden-0.1.0-preview.2-pages.zip`
- `release/phrasegarden-0.1.0-preview.2-pages-manifest.json`
- `release/phrasegarden-0.1.0-preview.3-pages.zip`
- `release/phrasegarden-0.1.0-preview.3-pages-manifest.json`
- `release/phrasegarden-0.1.0-preview.4-pages.zip`
- `release/phrasegarden-0.1.0-preview.4-pages-manifest.json`
- `release/phrasegarden-0.1.0-preview.5-pages.zip`
- `release/phrasegarden-0.1.0-preview.5-pages-manifest.json`
- `release/phrasegarden-0.1.0-preview.6-pages.zip`
- `release/phrasegarden-0.1.0-preview.6-pages-manifest.json`
- `samples/0.1.0-preview.1/**`
- `scripts/**`
- `src/**`
- `tests/**`
- `index.html`
- `package.json` and `pnpm-lock.yaml`
- `playwright.config.ts`
- `tsconfig.json` and `tsconfig.domain.json`
- `vite.config.ts` and `vitest.config.ts`

## Exclude

- The local `.git` directory itself; Git metadata is initialized in place but
  is never published as repository content
- `.agents/` and `.codex/`
- `.pnpm-store/` and `node_modules/`
- `dist/`, because Pages extracts the exact qualified static bytes from the
  checked-in release archive
- `artifacts/`, `playwright-report/`, `test-results/`, and `coverage/`
- Local files matching `*.log` or `*.local`
- Any credential, environment file, source text, private example, relationship
  detail, audio, prompt history, analytics data, or local browser state

## Local artifact boundary

Each Pages archive contains only the files listed and byte-qualified in its
same-version manifest, rooted as `index.html` and `assets/**`. `SHA256SUMS`
qualifies all release archives, manifests, and the published prompt
samples. An archive is not by itself evidence of hosted release-download
identity or UI-mediated download identity. Repository refs, release assets,
and production responses require separate remote verification.

## Preview 6 Pages boundary

- Version: `0.1.0-preview.6`
- Source: one exact source checkpoint `S6` and its complete-tree source manifest
- Package: one exact seven-path child `P6` with sole parent `S6`
- Immutable predecessor: the exact Preview 5 archive, manifest, and 1,716-byte
  checksum-ledger prefix
- Pages behavior: extract, verify, test, and deploy the exact checked-in Preview
  6 archive without rebuilding it
- Pages target: <https://jkolantree.github.io/phrasegarden/>
- Git tag and GitHub release: not part of the authorized Pages update

The source target does not establish a Preview 6 checkpoint, package,
deployment, production bytes, accessibility conformance, or linguistic review.
Each claim requires its named version-bound verification evidence.

## Preview 5 Pages boundary

- Version: `0.1.0-preview.5`
- Source: one exact source checkpoint `S5` and its complete-tree source manifest
- Package: one exact seven-path child `P5` with sole parent `S5`
- Immutable predecessor: qualified Preview 4 archive, manifest, and 1,480-byte
  checksum-ledger prefix
- Pages target: <https://jkolantree.github.io/phrasegarden/>
- Git tag and GitHub release: not part of the authorized Pages update

The Preview 5 source and package records remain immutable. Its Linux Chromium
check placed Copy at `985.984375` px in a 320 × 900 Review viewport, beyond the
required `900` px, so Pages deployment stopped. That failure establishes no
accessibility conformance or linguistic-review claim.

## Preview 4 publication boundary

- Version: `0.1.0-preview.4`
- Public annotated tag: `v0.1.0-preview.4`, targeting exact package commit
  `ed89c07a23526adc99f498eaaa05b7d10c144633`
- Source: exact source commit `S4`; qualification requires its exact Preview 4
  source manifest
- Package: exact seven-path child commit `P4` with sole parent `S4`;
  qualification requires the pinned package verifier
- Immutable predecessor assets: the qualified Preview 3 archive and manifest
- Pages rollback: the qualified Preview 2 archive; Preview 3 did not deploy
- Pages target: <https://jkolantree.github.io/phrasegarden/>

The Preview 4 tag, prerelease record, and three public release assets were
verified separately. Its captured Pages attempts stopped before deployment;
that history does not establish current production bytes.

## Preview 3 publication boundary

- Version: `0.1.0-preview.3`
- Tag: `v0.1.0-preview.3`
- Source: one clean source-freeze commit recorded by the Preview 3 manifest
- Package: one later commit adding only exact release bytes and evidence
- Pages target: <https://jkolantree.github.io/phrasegarden/>
- Rollback archive:
  `release/phrasegarden-0.1.0-preview.2-pages.zip`, 44,006 bytes,
  SHA-256
  `F76C665A2919B5403627667CB76D72015B0A4E79C0D95D653B4AD9EB6D4C15CF`

Preview 3 is a development prerelease. It does not establish Gate 3 exit,
stable readiness, linguistic review, accessibility conformance, durable
offline behavior, or broad browser/assistive-technology support. Exact source,
package, workflow, release-asset, and production-response evidence is recorded
only after each boundary passes.

## Preview 2 publication evidence

- Release source/tag commit:
  `6e55e8d142c748de181cd5136076d576d0994e19`
- Corrected source commit named by the byte manifest:
  `78452fe797ee1f6c98ae06dba6f0aa2ffceb127c`
- GitHub Actions build and Pages deployment:
  <https://github.com/jkolantree/phrasegarden/actions/runs/30097157552>
- Public release:
  <https://github.com/jkolantree/phrasegarden/releases/tag/v0.1.0-preview.2>
- Public Pages:
  <https://jkolantree.github.io/phrasegarden/>

The three attached release files were downloaded through their public release
URLs and matched local byte lengths and SHA-256 values exactly. The three
production Pages files were downloaded separately and matched every manifest
binding. A separate production-browser journey verified default
English→Japanese Written creation, copied text after platform newline
normalization, and byte-identical prompt download.
