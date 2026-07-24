# PhraseGarden

PhraseGarden is a static Prompt Studio for making readable, portable
language-learning and translation prompts without prompt-engineering
knowledge. It compiles selected settings locally. It does not translate source
text, call an AI model, or send prompt settings to a project server.

The public Preview centers English↔Japanese. Both directions use one exact,
versioned pair pack and are labeled **Preview** because external linguistic
review has not been completed. Every other direction between bundled language
profiles uses the conservative **Generic** compiler and receives no endpoint-
or pair-specific linguistic guidance.

## Use PhraseGarden

Open the public Prompt Studio at
[jkolantree.github.io/phrasegarden](https://jkolantree.github.io/phrasegarden/).
The versioned source and release evidence are available in the
[`0.1.0-preview.2` release](https://github.com/jkolantree/phrasegarden/releases/tag/v0.1.0-preview.2).
That deployed release contains Written Translator and Live Voice Coach. The
current `0.1.0-preview.3` source candidate adds the reviewed one-way
Interpreter and puts uncommon controls behind one Advanced settings
disclosure; it is not published until its exact package and public bytes pass
the release protocol.

## Run locally

Requirements: Node.js 24 or later and pnpm 11.9.0.

```text
pnpm install --frozen-lockfile
pnpm dev
```

Then:

1. Choose a home and target language.
2. Choose Written Translator, Live Voice Coach, or Interpreter.
3. Read what the prompt will do and choose **Create prompt**.
4. If you want more control, open **Optional settings** first.
5. Copy or download the prompt and paste it into a compatible language tool.

PhraseGarden never asks for the words you want to translate. Paste the
generated prompt into a language tool of your choice, then provide source text
there.

## What this candidate includes

- English→Japanese and Japanese→English Preview guidance
- Conservative Generic generation for all other bundled directions
- Written Translator, Live Voice Coach, and one-way Interpreter recipes
- Direct creation with safe defaults and an optional settings path
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

The interface and generated instruction surface are English-only in this
candidate. Read the [product limitations](docs/LIMITATIONS.md) before use.

## Support labels

| Label | Meaning in PhraseGarden |
|---|---|
| Preview | An exact built-in directed pair pack is versioned, but external linguistic review is incomplete. |
| Generic | No exact pair pack is selected; only universal, conservative instructions are emitted. |
| Community, Reviewed, Flagship | Reserved for a later evidence-qualified resolver. This candidate cannot assign them. |

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
Interpreter adds versioned recipe `1.0.0`, compiler policy `1.1.0`, English
prompt surface `1.1.0`, and English summary catalog `1.2.0`. Exact current
Interpreter prompt hashes are locked in compiler tests. Published
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
