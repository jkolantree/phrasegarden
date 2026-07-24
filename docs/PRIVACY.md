# Privacy

PhraseGarden is designed so its core task does not require user data to reach a
PhraseGarden application server.

## What the application does not collect

This candidate has no backend, database, authentication, advertising,
behavioral analytics, telemetry, runtime AI provider, feedback form, or public
free-text submission. It does not request microphone, camera, location, or
notification permissions.

The builder does not contain a source-text field. Examples, relationship
details, generated prompt contents, edits, audio, and learning history are not
sent to project servers.

## Data on the device

- Selected settings, the generated prompt, and a local edit live in page memory.
- Nothing is written to cookies, `localStorage`, `sessionStorage`, IndexedDB, or
  a service worker cache.
- Refreshing or closing the page clears that state.
- Copy and download occur only after the user activates those controls.
- A downloaded prompt becomes an ordinary local file governed by the user's
  browser and operating system.

## Network boundary

A hosted edition must initially request its HTML, JavaScript, and CSS from the
static host. Hosting infrastructure, including GitHub Pages if approved, may
retain ordinary request metadata under its own policies. PhraseGarden does not
add a tracker or send runtime API requests after those assets load.

The production page uses a restrictive content-security policy, self-hosted
assets, `connect-src 'none'`, and no third-party fonts, images, scripts, CDNs, or
analytics endpoints.

## Destination tools

When a user copies a prompt into another language tool or practices there,
that tool's privacy policy applies. PhraseGarden cannot control what a
destination tool stores or how it processes any text, audio, transcript, or
other content it receives.
