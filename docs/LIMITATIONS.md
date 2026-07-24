# Product limitations

This document describes PhraseGarden `0.1.0-preview.1`.

## Language and support

- English→Japanese and Japanese→English are **Preview**, not Reviewed or
  Flagship. Their exact pair pack is built in and versioned, but external
  linguistic review has not been completed.
- All other bundled directions are **Generic**. They intentionally omit every
  endpoint- and pair-specific linguistic clause.
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
- The current local candidate has synthetic IME coverage and rendered visual
  inspection. A full assistive-technology matrix, real-device IME pass, forced
  colors pass, and independent screen-reader completion remain outstanding.
- The in-app manual localhost inspection was blocked by that browser surface's
  local-URL policy. Sequential Edge journeys, explicit focus assertions, and
  captured screenshots passed; no stronger manual-browser claim is made.

