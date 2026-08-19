# Preview 4 Pages recovery

Status: active local recovery package | Updated: 2026-08-19

## Objective

Deploy the already-published, byte-qualified Preview 4 Pages archive without
changing its tag, release assets, product bytes, or package identity.

## Source of truth

- Package commit `P4=ed89c07a23526adc99f498eaaa05b7d10c144633`
- Failed Pages run `32206710989`, attempt 1
- `docs/evidence/releases/0.1.0-preview.4.md`
- `.github/workflows/pages.yml`
- `tests/release/release-audit.test.ts`
- `tests/release/test_release_packager.py`
- `tests/release/test_verify_release_archive.py`

## In scope

- Make Preview 4 verifier fixtures valid in both predecessor-ledger and
  post-package-ledger repository states.
- Make one Pages job test recovery HEAD and a dependent fresh-runner job verify,
  audit, browser-test, upload, and deploy only the exact P4 archive from an
  exact pinned P4 checkout.
- One local rehearsal, one independent review, one push, and one automatic run.

Owned paths:

- `.github/workflows/pages.yml`
- `tests/release/release-audit.test.ts`
- `tests/release/test_release_packager.py`
- `tests/release/test_verify_release_archive.py`
- this contract

## Out of scope

Product, compiler, language, UI, prompt, package, manifest, ledger, release,
tag, asset, version, dependency, or P4 evidence mutation; artifact regeneration;
manual dispatch; retry-for-luck; Preview 5; rollback.

## Acceptance

| ID | Observable requirement |
|---|---|
| `P4-REC-01` | The predecessor ledger is derived from the closed Preview 4 length and SHA-256 binding, never from an assumed live-ledger state. |
| `P4-REC-02` | Synthetic P4 packaging copies only predecessor records and passes from both pre-append and post-append repository states. |
| `P4-REC-03` | An independent strict row parser derives the documented checksum-parser count; the production parser is not its own oracle. |
| `P4-REC-04` | Permanent regression covers the exact predecessor and exact two-line P4 append states. |
| `P4-REC-05` | Recovery HEAD's full Python release suite and exact workflow policy pass before a fresh runner checks out exact P4. |
| `P4-REC-06` | Exact P4 runs unit, type, verifier, extraction, audit, browser/axe, second-audit, upload, and deploy stages without rebuilding dist. |
| `P4-REC-07` | P4 tag, release assets, archive, manifest, ledger, and product bytes remain unchanged. |
| `P4-REC-08` | No tag, release, upload replacement, manual dispatch, or deployment retry occurs after a failure. |

## Verification

```text
python -B -m unittest tests/release/test_verify_release_archive.py
python -B -m unittest discover -s tests/release -p "test_*.py"
pnpm test
pnpm typecheck
exact P4 verifier, extraction comparison, release audits, and browser/axe suite
workflow-policy scan, git diff --check, exact five-path scope
independent read-only review
automatic GitHub Pages run, then public smoke and asset identity checks
```

## Stop conditions

Stop on product or P4 byte drift, inability to bind the deployed checkout to
exact P4, weakened verifier behavior, a sixth owned path, a second same-family
repair, failed local rehearsal, failed review, failed automatic run, or any
need to regenerate, retag, replace assets, dispatch manually, or broaden scope.

## Handoff

Report exact files, tests, review verdict, recovery commit and run IDs, deployed
Pages URL/bytes, limitations, and the one next product action. Record public
outcome once after deployment; do not add an administrative review loop.
