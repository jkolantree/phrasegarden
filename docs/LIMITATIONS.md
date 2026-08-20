# Product limitations

The PhraseGarden `0.1.0-preview.10` source target carries forward Preview 9's
exact prompt, compiler, language profiles, pair guidance, support labels,
English and Japanese page interfaces, start-in-your-language behavior, and
privacy boundary. It targets only the causal narrow, short-screen CSS wrap and
spacing budget while retaining the 320 × 900 Home regression. This document
establishes no exact `S10`, package, deployment, tag, or GitHub Release; those states require
version-bound evidence and the corresponding repository or public state.

## Language and support

- English→Japanese and Japanese→English are **Preview**, not Reviewed or
  Flagship. Their exact pair pack is built in and versioned, but external
  linguistic review has not been completed.
- All other bundled directions are **Generic**. They intentionally omit every
  endpoint- and pair-specific linguistic clause.
- French, German, Italian, Spanish, and region-unspecified Portuguese are
  bundled as identity-only Generic profiles. `pt` does not mean Brazilian,
  European, neutral, or dialect-reviewed Portuguese; `pt-BR` and `pt-PT` are
  not supported by the `0.1.0-preview.10` source target.
- The bundled canonical registry is a small supported set, not a claim of
  universal language coverage. A valid BCP 47 tag that is not in the exact
  registry is unsupported.
- The page interface is available in English and Japanese. The Japanese
  catalog is an explicitly unreviewed Preview: deterministic completeness and
  automated checks do not establish qualified-human review or linguistic
  correctness.
- The generated instruction surface remains English-only in both interfaces.
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
  rendered visual inspection. Automated forced-colors emulation checks visible
  focus, selected state, truth notices, action size, order, axe, and reflow; a
  full assistive-technology matrix, real-device IME pass, manual forced-colors
  pass, and independent screen-reader completion remain outstanding.
- The immutable Preview 5 package did not deploy: Linux Chromium placed Copy at
  `985.984375` px in a 320 × 900 Review viewport, beyond the required `900` px.
  Preview 6's version-bound Pages qualification established the corrected
  predecessor with Copy at no more than `800` px while retaining truthful
  support and limitation notices before it.
- The immutable Preview 8 package also did not deploy. Actions run
  `32405959146` extracted and audited its archive, but two of 15 Linux Chromium
  journeys placed the English Home primary action at `1024.828125` px in a
  320 × 900 viewport. Upload and deployment were skipped; the post-run public
  bytes remained exact Preview 7 at that recorded checkpoint. Preview 9 then
  qualified its own local built bytes, but exact Actions run `32416506948`
  returned 13/15 Linux Chromium journeys. Both failures measured the same
  untouched-English Home primary-action bottom at `823.75` px in a 320 × 900
  viewport, beyond the required `800` px. The Japanese Linux state was not
  reached; upload and deployment were skipped. The run's exact-Preview-7 public
  comparison is a dated observation, not a refreshed claim about current hosted
  bytes. Preview 10 qualification requires its own built bytes; neither local
  Preview 9 results nor source inheritance transfers that result.
- The in-app manual localhost inspection was blocked by that browser surface's
  local-URL policy. Sequential Edge journeys, explicit focus assertions, and
  captured screenshots passed; no stronger manual-browser claim is made.
- Interpreter is committed and independently reviewed as product code. That
  code review does not itself establish package, publication, deployment, or
  independent linguistic-review status; consult the version-bound release
  evidence for those separate claims.
