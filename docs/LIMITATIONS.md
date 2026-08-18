# Product limitations

This source tree targets PhraseGarden `0.1.0-preview.3` and contains the
Interpreter, Advanced settings, five-language Generic catalog, and
beginner-facing presentation. Source presence does not establish packaging,
publication, or deployment. Those states are established only by the
version-bound release evidence and the corresponding public repository state.

## Language and support

- English→Japanese and Japanese→English are **Preview**, not Reviewed or
  Flagship. Their exact pair pack is built in and versioned, but external
  linguistic review has not been completed.
- All other bundled directions are **Generic**. They intentionally omit every
  endpoint- and pair-specific linguistic clause.
- French, German, Italian, Spanish, and region-unspecified Portuguese are
  bundled as identity-only Generic profiles. `pt` does not mean Brazilian,
  European, neutral, or dialect-reviewed Portuguese; `pt-BR` and `pt-PT` are
  not supported by the `0.1.0-preview.3` source.
- The bundled canonical registry is a small supported set, not a claim of
  universal language coverage. A valid BCP 47 tag that is not in the exact
  registry is unsupported.
- The interface and generated instruction surface are English-only.
- Profile and pair content cannot establish that a human review occurred or
  that a linguistic conclusion is correct. Formal evidence qualification and
  tier resolution are deferred.

## Tool behavior

- PhraseGarden compiles instructions; it does not translate, teach, or run a
  model. Results depend on the destination tool and its instruction-following
  behavior.
- Live Voice Coach creates a screenless interaction prompt but does not capture
  audio. Transcript-only evidence cannot support pronunciation assessment.
- Unknown destination capabilities remain unknown. The prompt cannot create
  microphone input, spoken output, interruption, silence detection, or
  playback-rate controls that the destination does not expose.
- Interpreter is one-way from the selected home language into the selected
  target language. Reversing direction requires swapping languages and
  creating another prompt.
- Interpreter uses only each complete turn, message, or short complete segment
  supplied by the destination. It cannot identify speakers, hear unavailable
  audio, or detect pauses, interruptions, or turn boundaries.
- Unknown Japanese name readings are preserved rather than invented.
- A locally edited prompt is visibly marked as modified and is no longer
  canonical compiler output.

## Local, offline, and portable behavior

- Settings are memory-only. Refreshing the page clears the current work.
- There is no recipe library, import/export, URL sharing, account, or sync.
- No service worker or offline cache is included. An already loaded page can
  compile without runtime network access, but an offline refresh may fail.
- Downloads are explicit UTF-8 bytes without a BOM and retain canonical LF
  line endings. System clipboards transport text rather than a byte artifact;
  Windows may expose copied newlines as CRLF when read back.

## Verification limits

- Compiler fixtures and browser journeys are development/regression evidence,
  not untouched prospective semantic evaluation.
- Automated axe checks do not prove complete accessibility.
- Recorded local development evidence includes synthetic IME coverage and
  rendered visual inspection. A full assistive-technology matrix, real-device
  IME pass, forced-colors pass, and independent screen-reader completion remain
  outstanding.
- The in-app manual localhost inspection was blocked by that browser surface's
  local-URL policy. Sequential Edge journeys, explicit focus assertions, and
  captured screenshots passed; no stronger manual-browser claim is made.
- Interpreter is committed and independently reviewed as product code. That
  code review does not itself establish package, publication, deployment, or
  independent linguistic-review status; consult the version-bound release
  evidence for those separate claims.
