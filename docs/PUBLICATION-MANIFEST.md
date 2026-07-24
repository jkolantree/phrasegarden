# Publication manifest

This manifest defines the authorized public repository contents for
PhraseGarden `0.1.0-preview.1`. The license split is recorded locally;
repository, release, and Pages publication remain pending until the remote
steps complete.

## Authorized repository

- Owner and name: `jkolantree/phrasegarden`
- Visibility: public
- Default branch: `main`
- Initialization: use the existing empty `.git` directory in this workspace
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

The Pages archive contains only the three files listed and byte-qualified in
`release/phrasegarden-0.1.0-preview.1-pages-manifest.json`, rooted as
`index.html` and `assets/**`. `SHA256SUMS` qualifies the archive, manifest, and
published prompt samples. The archive is not evidence of a repository commit,
hosted download, deployment, or UI-mediated download identity.
