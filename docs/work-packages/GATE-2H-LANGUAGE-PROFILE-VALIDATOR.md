# Gate 2H — Canonical language registry and profile validator

Status: Completed  
Gate: 2 — Compiler Foundation  
Updated: 2026-07-23

## OBJECTIVE

Convert an unknown JSON-like value into one exact, fresh `LanguageProfile` whose single language identity is validated against one bundled immutable registry, while pinning the same registry identity across configuration, pair-direction, share, compiler-input, and provenance contracts.

## SOURCE OF TRUTH

- The user's approved canonical-language-identity contract dated 2026-07-23
- `docs/ARCHITECTURE.md`, especially exact artifacts, pure resolution, language identity, and migration boundaries
- `docs/RECIPE-SCHEMA.md`, especially identities, `LanguageProfile`, validation order, configurations, provenance, and share payloads
- `docs/EVALUATION.md`, especially deterministic invariants and cross-environment evidence
- `docs/DECISIONS.md`, especially ADR-001, ADR-002, ADR-003, ADR-017 through ADR-021
- Gate 2B/D accepted validator behavior and regressions
- The bundled registry data bytes and their checked SHA-256

## IN SCOPE

- A domain `LanguageRegistryRef`, trusted registry input shape, canonical language ID/ref validators, and exact registry-reference matching.
- One bundled, versioned, deeply immutable PhraseGarden supported-tag registry with a precomputed content hash and published-source metadata.
- Pure `validateLanguageProfile(unknown, registry)` with an exact root, dense arrays, exact `id === bcp47`, canonical casing/membership, independent profile version, profile-owned clauses, local duplicate checks, and fresh reconstruction.
- Remove unqualified `reviewRecords` from `LanguageProfile`; retain review types and pair evidence for a later separate validator.
- Require the exact registry reference in `LanguageProfile`, `PairDirection`, `RecipeConfiguration`, `SharePayloadV1`, `CompilerInputs`, and `ArtifactProvenance`.
- Extend configuration validation to reject noncanonical endpoint refs and missing/mismatched registry versions or hashes.
- Initial policy rejects aliases/deprecated forms, grandfathered tags, private use, extensions, casing variants, and valid-but-unlisted tags. No alias is accepted or normalized in this package.
- Focused fixtures for exact `en`/`ja`, language-script-region identity, casing, deprecated aliases, grandfathered/private-use/extensions, registry mismatch, pair references, profile-version independence, unsafe shapes, clause ownership, and deterministic environment changes.
- Allowed files: `package.json`; the five Gate 0 contracts and project state; this contract; `src/domain/{authored,configuration,configuration-validation,index,language-identity,language-profile-validation,results}.ts`; `src/packs/canonical-language-registry*` and `src/packs/index.ts`; `tests/fixtures/configurations.ts`; focused identity/profile tests; and existing configuration-validator tests.

## OUT OF SCOPE

- Additional language profiles, the English/Japanese authored profile content, pair-pack validation/resolution, tier qualification, review-bundle validation, recipes, compiler composition, emitted prompt bytes, UI, persistence, share serialization/parsing, deployed migrations, service workers, model evaluation, or release work.
- Alias acceptance or a boundary alias map.
- A complete mirror of every IANA tag or any claim that registry membership makes a language selectable.
- Rewriting immutable Gate 0 fixture-definition bytes. They remain historical development evidence; a later machine-readable revision must carry the exact registry pin.

## ACCEPTANCE

- `LanguageProfile.id` and `bcp47` must be nonempty, exact, byte-identical, canonical-cased registry members.
- The registry source is bundled, versioned, content-hashed, deeply frozen, and checked against its exact UTF-8 bytes. Runtime validation performs no hashing, fetch, `Intl` call, locale lookup, time read, or environment-dependent canonicalization.
- The hashed artifact is exactly `src/packs/canonical-language-registry.data.json` (UTF-8, no BOM, LF, one terminal LF); its digest is stored outside those bytes. Canonical/deprecated/grandfathered entries are exact, unique, and code-unit sorted. Initial canonical members are exactly `en`, `he`, `id`, `ja`, `tlh`, `yi`, and `zh-Hant-TW`.
- Stored identity validation never normalizes. Casing variants, deprecated aliases, grandfathered tags, private use, unsupported extensions, and unlisted tags fail with stable diagnostics.
- A missing or different registry version/hash fails clearly. Valid registry refs are reconstructed from the trusted registry, not retained from caller input.
- Configuration home/target refs and pair-direction fixture refs use canonical registry identities. Home and target remain distinct; profile version is a separate pin.
- A profile's arrays are exact/dense. Names and scripts are nonempty and locally unique; scripts use canonical four-letter script casing. Clauses reuse the exact Gate 2D validator, must be profile-owned, retain order, and have unique local IDs.
- Successful values are deeply detached. Issues retain the fixed stage/code/path ordering.
- `ArtifactProvenance` and `SharePayloadV1` cannot be represented by the TypeScript contract without an exact registry version/hash.
- Existing 128 tests, both typechecks, build, and domain-boundary behavior remain green.

## VERIFICATION

From the workspace root:

```text
pnpm run test:language-profile
pnpm test
pnpm exec tsc -p tsconfig.json --noEmit
pnpm exec tsc -p tsconfig.domain.json --noEmit
pnpm exec vite build
rg -n "preact|window|document|localStorage|sessionStorage|fetch|XMLHttpRequest|WebSocket|navigator|location|Date\\.|new Date|Math\\.random|crypto\\.random|Intl|toLocale|eval\\(|Function\\(" src/domain src/packs
```

Additionally hash the exact registry data bytes locally, compare the expected digest, inspect deep freezing and fresh values, and run the same fixtures after hostile `Intl` plus differing locale/time-zone environment values.

## STOP CONDITIONS

- One canonical tag cannot represent an identity required by the approved product scope; preserve the counterexample and stop instead of adding a second identity.
- Canonical acceptance would require ambient registry, locale, clock, network, or host behavior.
- Profile validation would need to qualify reviewer evidence, resolve a pair, select clauses, or emit prompt/provenance bytes.
- The registry source/hash cannot be reproduced from direct filesystem bytes.
- Existing accepted validator behavior changes outside the explicit registry/configuration identity delta.

## HANDOFF

Files changed:

- Product contracts: `docs/ARCHITECTURE.md`, `docs/RECIPE-SCHEMA.md`, `docs/EVALUATION.md`, `docs/DECISIONS.md`, and `docs/PROJECT-STATE.md`
- Package contract: this file
- Domain: `src/domain/authored.ts`, `configuration.ts`, `configuration-validation.ts`, `index.ts`, `language-identity.ts`, `language-profile-validation.ts`, and `results.ts`
- Bundled data: `src/packs/canonical-language-registry.data.json`, `canonical-language-registry.ts`, and `index.ts`
- Tests/tooling: `package.json`, `tests/fixtures/configurations.ts`, `tests/domain/configuration-validation.test.ts`, `primitives.test.ts`, and `language-profile-validation.test.ts`

Change classification:

- **Product behavior:** no UI or runtime product journey changed.
- **Prompt/instruction:** registry version/hash were added as typed provenance render-value paths; no prompt prose or authored prompt was added.
- **Deterministic builder:** one immutable supported-tag registry and exact registry-reference reconstruction were added.
- **Validator/checker:** canonical language IDs/refs, normalized configuration endpoints, and full profile content now fail closed.
- **Tests:** 24 focused identity/profile fixtures; total suite increased from 128 to 152.
- **Evaluation fixtures:** only development unit fixtures were added. Immutable Gate 0 acceptance bytes and their provenance ledger were not rewritten.
- **Scoring rubric:** unchanged.
- **Packaging:** the registry JSON is bundled through a local TypeScript module; no dependency or remote asset was added.
- **Evidence transport:** direct filesystem bytes and local hashes only; no upload, model claim, or base64 transport.

Lead verification:

- Focused language-profile tests: 24/24 passed.
- Full tests: 152/152 passed across 8 files.
- Application TypeScript check: passed.
- DOM-free domain TypeScript check: passed.
- Vite production build: passed; 7 modules transformed.
- Domain/packs scan: no Preact, DOM, storage, network, clock, randomness, `Intl`/locale, `eval`, or dynamic `Function` dependency.
- Registry artifact: 1,153 bytes; UTF-8 without BOM; LF only; one terminal LF; SHA-256 `37EEF56CD6238F87ADA21F22BCA7CC947D3A4FAE224DEFE67141C10DE4DEED91`.
- Contract-gap re-review: passed after the registry byte/hash definition and project-state contradiction were corrected.
- Independent implementation review: passed with no P1/P2 findings. The reviewer independently repeated 24/24 focused tests, 152/152 full tests, both typechecks, the Vite build, the exact forbidden scan, and direct registry byte/hash inspection. Its stable reviewed source-set SHA-256 was `49182B328FDCD19ED923273211DC75019B4C6C73BA86AC44BCD73B46500A2A7E`.

Development evidence:

- An initial `pnpm exec tsc` launcher attempt could not resolve `tsc` in this Windows fallback runtime. Both exact local `tsc.CMD` checks and the build's dual typecheck passed; this was a command-launcher issue, not a source failure.
- The lead found and corrected two pre-review omissions: registry provenance render-value paths, and exclusion of `languageRegistry` from recipe-owned defaults.
- No required product identity needed a second identifier. Exact `en`, `ja`, and `zh-Hant-TW` fixtures pass.

Known limitations:

- No alias is accepted. A boundary alias map is deliberately absent.
- No authored language profile, pair resolver, profile-review bundle, compiler, share parser/migration, or UI was added.
- The immutable Gate 0 acceptance definition predates the registry pin and remains historical development evidence, not a current valid `RecipeConfiguration`. A later immutable revision or explicit migration is required before machine-readable compiler use.

Gate 2H is complete. The package stops here; no later Gate 2 or Gate 3 work is eligible within this task.
