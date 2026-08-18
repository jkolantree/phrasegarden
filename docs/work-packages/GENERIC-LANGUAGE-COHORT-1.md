# Generic language cohort 1

## Objective

Make French, German, Italian, Spanish, and region-unspecified Portuguese exact,
selectable PhraseGarden language identities whose every non-English↔Japanese
direction compiles through the conservative Generic path.

## Source of truth

- User authorization on 2026-08-17
- `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, and `docs/RECIPE-SCHEMA.md`
- ADR-020, ADR-023, and ADR-030
- The IANA Language Subtag Registry with observed `File-Date: 2026-08-08`
- The independently reviewed language and UX audits for this package
- Archive-repair checkpoint `70858f1c4157af3340cea6c95f50cf9fd387ffbf`

## In scope

Exactly these package-owned paths:

```text
docs/DECISIONS.md
docs/PRODUCT.md
docs/PROJECT-STATE.md
docs/RECIPE-SCHEMA.md
docs/TRACEABILITY.md
docs/work-packages/GENERIC-LANGUAGE-COHORT-1.md
docs/work-packages/PREVIEW-3-PUBLICATION.md
src/packs/canonical-language-registry.data.json
src/packs/canonical-language-registry.ts
src/packs/language-profiles.ts
tests/domain/compiler.test.ts
tests/domain/language-profile-validation.test.ts
```

The canonical registry advances explicitly to `2026-08-17.1`. Its exact
UTF-8/LF content hash is derived after the registry bytes are final. The five
new exact identities are `de`, `es`, `fr`, `it`, and `pt`; each gets one
identity-only profile at profile version `1.0.0` with `Latn`, `ltr`, an autonym,
search names, and no monolingual clause.

`pt` means Portuguese with region unspecified. It is not described as neutral,
Brazilian, European, African, or any other regional variety. ASCII search
spellings are display-discovery strings only, never stored identities or
accepted aliases.

## Out of scope

- Pair packs, pair-specific clauses, review records, and support-tier promotion
- `pt-BR`, `pt-PT`, dialect selection, or claims about regional adequacy
- Runtime alias normalization or migration of old exported payloads
- App copy, selector presentation, support-status presentation, CSS, or browser
  tests; those belong to the next beginner-facing package
- Additional languages beyond the five named cohort
- Interface localization, generated-instruction localization, Gate 4+, model
  evaluation, prospective-fixture consumption, Pages policy, or publication

## Acceptance

| ID | Observable evidence |
|---|---|
| `GLC-01` | Registry version, source date, exact sorted tag set, UTF-8/LF bytes, and external SHA-256 agree byte for byte. |
| `GLC-02` | Every bundled profile has `id === bcp47`, exact registry binding, deterministic order, a nonempty autonym/search name, and a valid script/direction. |
| `GLC-03` | `de`, `es`, `fr`, `it`, and `pt` have exact NFC autonyms, ASCII discovery spellings, `Latn`, `ltr`, and zero linguistic clauses. |
| `GLC-04` | `pt-BR`, `pt-PT`, casing variants, unlisted tags, deprecated aliases, grandfathered tags, private use, and extensions fail closed. |
| `GLC-05` | All 132 distinct directed pairs across all three recipes compile: six English↔Japanese outputs are Preview and the other 390 are Generic. |
| `GLC-06` | Every Generic output has no pair pack, no review claim, the Generic limitation, no section 6, and no endpoint/pair linguistic clause. |
| `GLC-07` | Compiler, recipe, prompt-surface, profile, and pair-pack versions remain separate and unchanged; registry provenance advances visibly and deterministically. |
| `GLC-08` | Historical published samples, release artifacts, checksum ledger, review evidence, and `src/domain/**` remain byte-unchanged. |
| `GLC-09` | Old or mismatched registry references fail clearly; no silent reinterpretation or alias storage is added. |
| `GLC-10` | Focused identity/compiler tests, full Vitest, both typechecks, Vite build, forbidden-domain scan, diff hygiene, and independent read-only review pass. |

All fixtures are development/regression evidence. No test success establishes a
human linguistic review, regional adequacy, or evidence-qualified support tier.

## Verification

```text
pnpm test:language-profile
pnpm test:compiler
pnpm test
pnpm exec tsc -p tsconfig.json --noEmit
pnpm exec tsc -p tsconfig.domain.json --noEmit
pnpm build
git diff --check
```

Also recalculate the registry file SHA-256 from direct bytes; assert 396 exact
compilations and the 6/390 tier partition; run the hostile `Intl`/locale/time
zone test; scan `src/domain` for forbidden browser/network/clock/randomness
dependencies; compare protected paths and all nine historical checksums; and
verify no generated cache or unexpected file enters the package.

## Stop conditions

Stop if one canonical tag cannot honestly represent a required public identity;
`pt` would need an undocumented regional claim; the schema needs a second
identity system; a new pair clause or review claim appears; old registry-bound
data is silently rebound; historical bytes change; the 6/390 partition fails;
the package approaches the 700-net-line cliff; or any baseline check fails.

## Handoff

Record the final registry version/hash, exact profiles, test counts, tier
partition, protected-path result, independent verdict, limitations, and next
beginner-facing package in `PROJECT-STATE.md` and `TRACEABILITY.md`. Checkpoint
only the twelve owned paths. Do not call the source frozen, build release
artifacts, change Pages, push, or publish.
