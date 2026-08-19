# PhraseGarden

PhraseGarden makes reusable instructions for an AI chat or language tool.
Choose the languages and task, copy the instructions, then paste them into the
other tool before sending the words you want translated or practiced. The app
is static and works locally in the browser: it does not translate source text,
call an AI model, or send settings to a project server.

The public Preview centers English↔Japanese. Both directions use one exact,
versioned pair pack and are labeled **Preview** because external linguistic
review has not been completed. Every other direction between bundled language
profiles uses the conservative **Generic** compiler and receives no endpoint-
or pair-specific linguistic guidance.

## Use PhraseGarden

Open the public Prompt Studio at
[jkolantree.github.io/phrasegarden](https://jkolantree.github.io/phrasegarden/).
Versioned release status, evidence, and downloadable assets are available from
the [PhraseGarden releases](https://github.com/jkolantree/phrasegarden/releases).
The `0.1.0-preview.5` source carries forward Preview 4's one-way Interpreter,
expanded Generic language catalog, and deterministic compiler. It makes the
human path clearer: one outcome-first start, optional tone and context controls,
and a copy-first Review with complete instructions in a bounded reading area.
Source presence does not
establish packaging, publication, or deployment; version-bound release evidence
and the corresponding public repository state establish those claims.

## Run locally

Requirements: Node.js 24 or later and pnpm 11.9.0.

```text
pnpm install --frozen-lockfile
pnpm dev
```

Then:

1. Confirm the language direction and task, or change them.
2. Choose **Make my instructions**. The defaults work for most people.
3. If tone or context matters, open **Adjust tone or context** first.
4. On Review, read the support note and known limitation.
5. Copy or download the instructions and paste them into a compatible tool.

PhraseGarden never asks for the words you want to translate. Paste the
generated instructions into a language tool of your choice, then provide source text
there.

## What Preview 5 includes

- English→Japanese and Japanese→English Preview guidance
- Conservative Generic generation for all other bundled directions
- Identity-only profiles for French, German, Italian, Spanish, and
  region-unspecified Portuguese; these add no language-specific guidance
- Translate writing, Practice speaking, and one-way Translate a conversation
  tasks, backed by the existing versioned recipes
- One plain-language fast path with safe defaults and no required Builder stop
- Optional relationship, tone, and detail controls shown before advanced policy
  detail
- Copy-first Review, explicit destination privacy, and a bounded complete-text
  reading and editing area
- One progressive Advanced settings disclosure for uncommon controls
- Relationship, hierarchy, register, ambiguity, name, teaching, correction,
  pronunciation, pace, Interpreter turn, and clarification controls
- Pure deterministic compiler, validation, provenance, warnings, and summaries
- Visible and editable generated prompts
- Exact UTF-8/LF plain-text downloads
- Keyboard, narrow-screen, bidirectional-label, reduced-motion, and automated
  accessibility coverage
- No backend, account, database, telemetry, advertising, runtime AI, service
  worker, local recipe storage, or share payload

The Preview 5 interface and generated instruction surface are English-only.
Read the [product limitations](docs/LIMITATIONS.md) before use.

## Support labels

| Label | Meaning in PhraseGarden |
|---|---|
| Preview | An exact built-in directed pair pack is versioned, but external linguistic review is incomplete. |
| Generic | No exact pair pack is selected; only universal, conservative instructions are emitted. |
| Community, Reviewed, Flagship | Reserved for a later evidence-qualified resolver. Preview 5 cannot assign them. |

A user or imported configuration cannot choose or upgrade its tier.

## Privacy and local ownership

Runtime settings live only in memory and disappear on refresh. There is no
source-text field, microphone access, project cookie, local storage, analytics,
or runtime network API. Loading a hosted copy still requests static files from
its host, whose infrastructure may retain ordinary request logs. See
[Privacy](docs/PRIVACY.md).

## Architecture

```text
recipe configuration
+ exact language profiles
+ zero or one exact directed pair pack
+ modality recipe and compiler policy
→ canonical prompt + behavior summary + provenance + warnings
```

- `src/domain`: pure types, validation, materialization, resolution, compiler
- `src/packs`: versioned profiles and the English↔Japanese Preview pack
- `src/recipes`: Written, Voice, Interpreter, policy, and English prompt surface
- `src/locales`: English interface, warning, limitation, and summary strings
- `src/app` and `src/ui`: memory-only Preact presentation and interactions
- `tests`: deterministic, snapshot, browser, privacy, and accessibility checks

The canonical language identity is one exact registry-pinned BCP 47 tag:
`LanguageProfile.id === LanguageProfile.bcp47`.

## Verification

```text
pnpm test
pnpm typecheck
pnpm build
pnpm audit:release
pnpm test:e2e:dist
```

Browser tests run sequentially and use axe. Local Windows verification uses
Microsoft Edge; the prepared Pages workflow uses Playwright Chromium.
The core compiler implementation and version remain `0.1.0-preview.1`.
Interpreter uses versioned recipe `1.0.0`, compiler policy `1.1.0`, English
prompt surface `1.1.0`, and English summary catalog `1.3.0`. Exact Preview 3
Interpreter regression hashes remain locked in compiler tests. Published
byte-qualified sample prompts remain unchanged in
[`samples/0.1.0-preview.1`](samples/0.1.0-preview.1).
The public repository inventory is recorded in
[`docs/PUBLICATION-MANIFEST.md`](docs/PUBLICATION-MANIFEST.md); exact local
artifact and sample hashes are in [`SHA256SUMS`](SHA256SUMS).

## Contributing and governance

Read [CONTRIBUTING.md](CONTRIBUTING.md). Formal pair-review governance and
support-tier qualification are deliberately deferred. Do not add a reviewer,
review outcome, or Reviewed/Flagship claim without independently qualified
evidence and a separately approved resolver.

## License

PhraseGarden source code and software infrastructure are licensed under the
[MIT License](LICENSE). Maintained prompts, recipe wording, language-profile
and pair-pack linguistic content, interface copy, samples, and documentation
are licensed under
[Creative Commons Attribution 4.0 International](LICENSE-CONTENT).
