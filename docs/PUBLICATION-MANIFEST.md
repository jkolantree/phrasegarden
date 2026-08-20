# Publication manifest

This manifest defines the authorized public repository contents and source
target for PhraseGarden `0.1.0-preview.8`. This source record does not establish
its containing checkpoint, a package, deployment, tag, or GitHub Release. Earlier
repository, release, license, and Pages evidence remains immutable. Actual
package, publication, and deployment status is established only by
version-bound release evidence and corresponding public state.

## Authorized repository

- Owner and name: `jkolantree/phrasegarden`
- Visibility: public
- Default branch: `main`
- Repository: <https://github.com/jkolantree/phrasegarden>
- Preview 2 rollback release: <https://github.com/jkolantree/phrasegarden/releases/tag/v0.1.0-preview.2>
- Preview 3 public prerelease: <https://github.com/jkolantree/phrasegarden/releases/tag/v0.1.0-preview.3>
- Preview 4 public prerelease: <https://github.com/jkolantree/phrasegarden/releases/tag/v0.1.0-preview.4>
- Preview 5 has no tag or GitHub Release
- Preview 6 has no tag or GitHub Release
- Preview 7 is the exact immutable local package predecessor and has no tag or
  GitHub Release; current public bytes require fresh observation
- Preview 8 is a source target. No tag, GitHub Release, deployment, or public
  byte is established or authorized by this document
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
- `release/phrasegarden-0.1.0-preview.7-pages.zip`
- `release/phrasegarden-0.1.0-preview.7-pages-manifest.json`
- Future qualified `release/phrasegarden-0.1.0-preview.8-pages.zip`
- Future qualified `release/phrasegarden-0.1.0-preview.8-pages-manifest.json`
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

## Preview 8 source and Pages boundary

- Version: `0.1.0-preview.8`
- Product parent: exact bilingual checkpoint
  `f0583569aa2441fb6d34d4c40a6e3e0e0233d363`
- Authority boundary: this source record alone establishes no `S8`, `P8`,
  Preview 8 archive, deployment, tag, GitHub Release, or public byte
- Source: one exact source checkpoint `S8` and its complete-tree source
  manifest, established only by Git and source-qualification evidence
- Package: one exact seven-path child `P8` with sole parent `S8`, established
  only by Git and committed-package verification
- Immutable predecessor checksum ledger: 2,188 bytes, SHA-256
  `FE11EEA9DC696BC04FA63E7D9E56D95077EAAFBFB3B881C83EAB8EC029DA241A`
- Immutable predecessor Pages archive: 187,305 bytes, SHA-256
  `715ED188561505D1531FA903EC85EE742A34AE0A6646C9E61190D0D79FFD9513`
- Immutable predecessor manifest: 976 bytes, SHA-256
  `87296B9F800D3821437F9C15EB461522D5D790CB07EF5EA540E60C896F2E46BA`
- Planned Pages behavior: extract, verify, test, and deploy the exact checked-in
  Preview 8 archive without rebuilding it
- Pages target: <https://jkolantree.github.io/phrasegarden/>
- Git tag and GitHub Release: separate external actions requiring exact later
  authorization; neither is implied here

Preview 8 contains an English `source-interface` with no human-review claim and
a Japanese `public-unreviewed-preview` page interface. The Japanese interface
has not completed qualified-human review, the generated portable prompt remains
English, and no language direction is promoted beyond its compiler-derived
Preview or Generic tier.

The identity chain is exact source set → `S8` → one build → deterministic
stage → independent review → same-byte promotion → exact `P8` child → Pages →
public-byte comparison. No earlier link proves a later one.

## Preview 7 source and Pages boundary

- Version: `0.1.0-preview.7`
- Authority boundary: this source record alone establishes no `S7`, `P7`,
  Preview 7 archive, deployment, tag, or GitHub Release
- Source: one exact source checkpoint `S7` and its complete-tree source
  manifest, established only by Git and source-qualification evidence
- Package: one exact seven-path child `P7` with sole parent `S7`, established
  only by Git and committed-package verification
- Immutable predecessor checksum ledger: 1,952 bytes, SHA-256
  `82CBC32E5606F827765983271B248CD7C4788DFE57AB703FD1B94A55432B9C4E`
- Immutable predecessor Pages archive: 186,851 bytes, SHA-256
  `6A2DC1E364F42B64D54034E734233CB09A9166A01F9C6591D182AB40CA81EA55`
- Immutable predecessor manifest: 976 bytes, SHA-256
  `B9753A9286D3C8E662ABB7A9244817BFA7EAA2382B262794816527C765074F7E`
- Planned Pages behavior: extract, verify, test, and deploy the exact checked-in
  Preview 7 archive without rebuilding it
- Pages target: <https://jkolantree.github.io/phrasegarden/>
- Git tag and GitHub Release: not part of the Preview 7 Pages-only plan

Preview 7 must follow this identity chain: exact source set → `S7` → one build
→ deterministic stage → independent review → same-byte promotion → exact `P7`
child → Pages → public-byte comparison. No earlier link proves a later one.
The Preview 7 archive and manifest enter the repository include boundary only
after their exact bytes are qualified; they do not exist merely because this
source target is documented.

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

Preview 6 passed its version-bound Pages qualification and is the exact
immutable Pages predecessor for Preview 7. That result does not establish
Preview 7 bytes, accessibility conformance, or linguistic review.

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
