# Publication manifest

This manifest defines the authorized public repository contents for
PhraseGarden `0.1.0-preview.2`. The repository, release, license split, and
GitHub Pages deployment are public. The immutable `0.1.0-preview.1` materials
remain published as historical release evidence.

## Authorized repository

- Owner and name: `jkolantree/phrasegarden`
- Visibility: public
- Default branch: `main`
- Repository: <https://github.com/jkolantree/phrasegarden>
- Current release: <https://github.com/jkolantree/phrasegarden/releases/tag/v0.1.0-preview.2>
- Previous release: <https://github.com/jkolantree/phrasegarden/releases/tag/v0.1.0-preview.1>
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
- `dist/`, because Pages builds from source and the qualified static bytes are
  separately captured in the release archive
- `artifacts/`, `playwright-report/`, `test-results/`, and `coverage/`
- Local files matching `*.log` or `*.local`
- Any credential, environment file, source text, private example, relationship
  detail, audio, prompt history, analytics data, or local browser state

## Local artifact boundary

Each Pages archive contains only the files listed and byte-qualified in its
same-version manifest, rooted as `index.html` and `assets/**`. `SHA256SUMS`
qualifies both release archives, both manifests, and the published prompt
samples. An archive is not by itself evidence of hosted release-download
identity or UI-mediated download identity. Repository refs, release assets,
and production responses require separate remote verification.
