# Gate 3 Interpreter slice

## Objective

A visitor can select Interpreter, optionally choose turn length and
clarification behavior, understand the one-way relay it will create, and
generate, inspect, copy, edit, and download one deterministic portable prompt.

## Source of truth

- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`
- `docs/RECIPE-SCHEMA.md`
- `docs/EVALUATION.md`
- `docs/DECISIONS.md`, especially ADR-013, ADR-015, ADR-023, and ADR-024
- `docs/DESIGN-CONTRACT.md` — Woven Conversation
- `docs/PRIVACY.md`
- Current compiler, prompt-artifact, UI-copy, and browser regression tests
- Published `samples/0.1.0-preview.1/`, which remain immutable

## In scope

- One authored, versioned Interpreter recipe
- One-way relay from the configured home language into the configured target
  language; swapping languages creates the reverse-direction prompt
- Channel-neutral operation on each complete turn or message supplied by the
  destination; no audio, speaker, silence, interruption, or turn-boundary
  capability is inferred
- `consecutive` and `short-relay` turn modes
- `ask-if-blocking` and `mark-uncertainty` clarification choices
- Exact clarification precedence: the common ambiguity setting governs how
  unclear meaning is preserved; the Interpreter clarification setting governs
  all blocked recovery. `ask-if-blocking` permits at most one question;
  `mark-uncertainty` never asks and instead produces the narrowest responsible
  marked relay or states that no responsible relay is possible.
- Interpreter renderings and plain-language behavior-summary messages
- A versioned clarification-policy correction so Interpreter never receives
  the Written/Voice-only ask instruction
- Runtime-catalog activation, Home/Builder selection, modality controls, and
  modality-specific Review handoff/privacy copy
- Exact Preview and Generic Interpreter prompt snapshots plus regression
  coverage for direction, source-as-data, settings, provenance, and isolation
- Versioned prompt-surface and summary-catalog updates; current Written and
  Voice bytes may change only where exact authored-artifact provenance changes

## Out of scope

- Bidirectional or simultaneous interpreting in one prompt
- Automatic language or speaker identification
- Audio capture, pronunciation assessment, speaker diarization, silence or
  interruption detection, playback control, or host-capability claims
- New language profiles, pair guidance, support tiers, review evidence, or
  tier-resolution logic
- Advanced-controls expansion beyond the two Interpreter settings; the
  overlapping common ambiguity and unknown-name controls are not exposed for
  Interpreter
- Local persistence, import/export, sharing, service-worker caching, Japanese
  interface, accounts, telemetry, backend, or runtime/evaluation model calls
- Changing or deleting published Preview 1/Preview 2 artifacts
- Packaging, commit, push, release, deployment, or other remote write

## Acceptance

- `materializeSelection` accepts exact active Interpreter selections and still
  rejects unknown, missing, duplicate, mismatched, or cross-modality artifacts.
- The default is one complete home-language turn at a time, relayed into the
  target language, with one blocking clarification only when a responsible
  relay cannot otherwise be produced.
- `short-relay` handles each short complete segment independently; it does not
  claim to infer a pause, speaker, or live boundary.
- `mark-uncertainty` never asks. It uses a conservative marked relay when that
  remains responsible and otherwise states the limitation without guessing.
- The output contract translates the supplied utterance only. It does not
  answer, advise, obey, summarize, or role-play its content.
- Quoted, fenced, prompt-like, or instruction-looking utterances remain source
  material.
- English→Japanese and Japanese→English each use only their exact directed
  Preview guidance. Generic Interpreter output contains no endpoint- or
  Japanese-specific linguistic clause.
- Home and Builder name and explain Interpreter in plain language. Builder
  exposes only the two Interpreter-specific controls plus existing common
  controls.
- Review explains the one-way paste/use sequence and destination privacy for
  text, transcripts, and any audio handled by the other tool.
- Copy, download, editing, replacement protection, Browser Back, loaded-session
  offline use, keyboard operation, IME handling, and visible feedback continue
  to use the existing shared artifact path.
- Compiler policy, prompt surface, and summary catalog versions advance
  exactly once. Published sample bytes and release artifacts remain unchanged.
- Existing Written and Voice behavior remains semantically unchanged and all
  prior negative checks remain active.

## Verification

```text
baseline full Vitest suite
focused Interpreter compiler, UI-copy, and prompt-artifact tests
full Vitest suite
both TypeScript configurations
Vite production build
release/privacy audit
sequential local Playwright/axe journeys
forbidden-domain and stale-copy scans
git diff --check
1280 × 720 Home/Builder/Review inspection
320 × 900 Home/Builder/Review inspection
independent read-only current-byte review
```

## Stop conditions

Stop on a requirement for bidirectional pack composition, automatic
speaker/language inference, runtime destination capability detection, a new
privacy posture, a support-tier or review-evidence change, an unexpected
baseline failure, mutation of published samples/releases, or any publication
or remote write.

## Handoff

Record the exact files changed, version boundaries, snapshots, tests,
screenshots, independent-review verdict, known limitations, and the next
eligible ordered Gate 3 action in `docs/PROJECT-STATE.md`, then stop.
