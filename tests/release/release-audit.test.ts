import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, truncateSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";
const repository = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const auditScript = join(repository, "scripts/release-audit.mjs");
const workflowPath = join(repository, ".github/workflows/pages.yml");
const accessibilityPath = join(repository, "docs/ACCESSIBILITY.md");
const limitationsPath = join(repository, "docs/LIMITATIONS.md");
const privacyPath = join(repository, "docs/PRIVACY.md");
const readmePath = join(repository, "README.md");
const productPath = join(repository, "docs/PRODUCT.md");
const projectStatePath = join(repository, "docs/PROJECT-STATE.md");
const publicationManifestPath = join(repository, "docs/PUBLICATION-MANIFEST.md");
const releaseNotesPath = join(repository, "docs/RELEASE-NOTES.md");
const releaseWorkflowPath = join(repository, "docs/RELEASE-WORKFLOW.md");
const preview8SourceContractPath = join(repository, "docs/work-packages/PREVIEW-8-SOURCE-IDENTITY.md");
const publicationContractPath = join(repository, "docs/work-packages/PREVIEW-4-PUBLICATION.md");
const preview7ClaimSources = [
  ["docs/evidence/releases/0.1.0-preview.7.md", join(repository, "docs/evidence/releases/0.1.0-preview.7.md")],
  ["docs/work-packages/PREVIEW-7-PUBLICATION.md", join(repository, "docs/work-packages/PREVIEW-7-PUBLICATION.md")],
] as const;
const preview8ClaimSources = [
  ["docs/evidence/releases/0.1.0-preview.8.md", join(repository, "docs/evidence/releases/0.1.0-preview.8.md")],
  ["docs/work-packages/PREVIEW-8-PUBLICATION.md", join(repository, "docs/work-packages/PREVIEW-8-PUBLICATION.md")],
] as const;
const workspaces: string[] = [];
const csp = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; worker-src 'none'";
const canonicalHtml = [
  "<!doctype html>", '<html lang="en" dir="ltr">', "  <head>",
  '    <meta charset="UTF-8" />', '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
  "    <meta", '      http-equiv="Content-Security-Policy"', `      content="${csp}"`, "    />",
  '    <meta name="theme-color" content="#F7F3EA" />', "    <meta", '      name="description"',
  '      content="Build readable, portable language-learning and translation prompts locally with PhraseGarden."', "    />",
  "    <title>PhraseGarden · Portable language prompts</title>",
  '    <script type="module" crossorigin src="./assets/index-test.js"></script>',
  '    <link rel="stylesheet" crossorigin href="./assets/index-test.css">',
  "  </head>", "  <body>", '    <div id="app"></div>', "  </body>", "</html>", "",
].join("\n");
function workspace(): string { const path = mkdtempSync(join(tmpdir(), "phrasegarden-release-audit-")); workspaces.push(path); return path; }
function sha256(bytes: Buffer): string { return createHash("sha256").update(bytes).digest("hex").toUpperCase(); }
function createDist(root: string, stylesheet = "index-test.css", script = "index-test.js"): void {
  const dist = join(root, "dist"); mkdirSync(join(dist, "assets"), { recursive: true });
  writeFileSync(join(dist, "index.html"), canonicalHtml
    .replace("index-test.css", stylesheet)
    .replace("index-test.js", script));
  writeFileSync(join(dist, "assets", stylesheet), "body { color: #123; }\n");
  writeFileSync(join(dist, "assets", script), "console.log('PhraseGarden');\n");
}
function manifestFixture(root: string, assetPaths = ["assets/index-test.css", "assets/index-test.js"]) {
  const paths = [...assetPaths, "index.html"].sort();
  return {
    schemaVersion: 1,
    releaseVersion: "0.1.0-preview.3",
    artifactName: "phrasegarden-0.1.0-preview.3-pages.zip",
    sourceProvenance: { kind: "git-commit", gitCommit: "a".repeat(40), statement: "Synthetic development fixture." },
    build: { command: "pnpm build", base: "./", sourceMaps: false },
    files: paths.map((path) => { const bytes = readFileSync(join(root, "dist", ...path.split("/"))); return { path, bytes: bytes.byteLength, sha256: sha256(bytes) }; }),
  };
}
type ManifestFixture = ReturnType<typeof manifestFixture>;
function writeManifest(root: string, value: unknown): string { const path = join(root, "manifest.json"); writeFileSync(path, `${JSON.stringify(value)}\n`); return path; }
function runAudit(root: string, ...arguments_: string[]) { return spawnSync(process.execPath, [auditScript, ...arguments_], { cwd: root, encoding: "utf8" }); }
function expectAuditFailure(root: string, message: string, ...arguments_: string[]): void { const result = runAudit(root, ...arguments_); expect(result.status).toBe(1); expect(result.stderr).toContain(message); }
function readExactClaimPair(sources: ReadonlyArray<readonly [string, string]>): string[] {
  const present = sources.map(([, path]) => existsSync(path));
  if (present.some((value) => value !== present[0])) {
    throw new Error("active release evidence and publication contract must be absent or present together");
  }
  return present[0] ? sources.map(([, path]) => readFileSync(path, "utf8").replace(/\r\n/g, "\n")) : [];
}
afterEach(() => { for (const path of workspaces.splice(0)) rmSync(path, { recursive: true, force: true }); });
describe("release filesystem audit", () => {
  it("requires active release claim documents as an exact pair", () => {
    const root = workspace();
    const evidence = join(root, "evidence.md");
    const contract = join(root, "contract.md");
    const sources = [["evidence", evidence], ["contract", contract]] as const;
    expect(readExactClaimPair(sources)).toEqual([]);
    writeFileSync(evidence, "evidence\n");
    expect(() => readExactClaimPair(sources)).toThrow("absent or present together");
    writeFileSync(contract, "contract\n");
    expect(readExactClaimPair(sources)).toEqual(["evidence\n", "contract\n"]);
  });

  it("keeps public release claims stable across packaging and publication", () => {
    const publicClaimSources = [
      ["README.md", readmePath],
      ["docs/ACCESSIBILITY.md", accessibilityPath],
      ["docs/LIMITATIONS.md", limitationsPath],
      ["docs/PRIVACY.md", privacyPath],
      ["docs/PRODUCT.md", productPath],
      ["docs/PROJECT-STATE.md", projectStatePath],
      ["docs/PUBLICATION-MANIFEST.md", publicationManifestPath],
      ["docs/RELEASE-NOTES.md", releaseNotesPath],
      ["docs/RELEASE-WORKFLOW.md", releaseWorkflowPath],
      ["docs/work-packages/PREVIEW-8-SOURCE-IDENTITY.md", preview8SourceContractPath],
      ["docs/work-packages/PREVIEW-4-PUBLICATION.md", publicationContractPath],
    ] as const;
    const publicClaims = new Map(publicClaimSources.map(
      ([name, path]) => [name, readFileSync(path, "utf8").replace(/\r\n/g, "\n")] as const,
    ));
    const claimTransitions = [
      {
        name: "README.md",
        returned: [
          "current `0.1.0-preview.3` source candidate",
          "It is not\npublished until its exact package and public bytes pass the release protocol.",
          "What this candidate includes",
          "English-only in this\ncandidate",
          "This candidate cannot assign them",
          "Exact current\nInterpreter prompt hashes",
          "The `0.1.0-preview.3` source adds",
        ],
        stable: [
          "Earlier versioned releases and downloadable assets",
          "does not establish its containing Git checkpoint, a package, deployment, tag,\nor GitHub Release",
          "## What Preview 8 includes",
          "The generated instruction surface is English-only.",
          "Preview 8 cannot assign them",
          "prominent English/Japanese page-\nlanguage choice",
          "explicitly shipped as an unreviewed Preview",
          "Exact Preview 3\nInterpreter regression hashes",
        ],
      },
      {
        name: "docs/ACCESSIBILITY.md",
        returned: [
          "Checks run for this candidate",
          "candidate has not completed an independent screen-reader matrix",
          "local candidate because that surface",
          "## Next-preview Japanese interface",
          "The next-preview source includes a complete Japanese interface catalog",
        ],
        stable: [
          "Checks recorded for Preview 3",
          "Preview 3\nevidence does not include an independent screen-reader matrix",
          "## Preview 6 Pages predecessor and Preview 5 failure",
          "`985.984375` px in a 320 × 900 Review viewport",
          "bottom at no more than `800` px",
          "truthful support and limitation notices preceded Copy",
          "Preview 6 later\npassed its version-bound Pages qualification",
          "## Preview 7 source-candidate coverage",
          "not a packaged or\ndeployed Preview 7",
          "## Preview 8 Japanese interface",
          "The Preview 8 source includes a complete Japanese interface catalog",
          "qualified-speaker review is incomplete",
          "Japanese interface has not been reviewed by a qualified Japanese speaker",
        ],
      },
      {
        name: "docs/LIMITATIONS.md",
        returned: [
          "The deployed public release is PhraseGarden `0.1.0-preview.2`",
          "current\nworkspace contains",
          "proposed\n`0.1.0-preview.3` prerelease",
          "it is not yet packaged or published",
          "not supported identities in this candidate",
          "The current local candidate has",
          "has not yet been packaged",
        ],
        stable: [
          "This source tree defines a PhraseGarden `0.1.0-preview.8` candidate",
          "Source\npresence does not establish a Preview 8 package, deployment,\ntag, or GitHub Release",
          "not supported by the `0.1.0-preview.8` source candidate",
          "The page interface is available in English and Japanese",
          "generated instruction surface remains English-only",
          "The immutable Preview 5 package did not deploy",
          "Automated forced-colors emulation checks visible",
          "Preview 6's version-bound Pages qualification established the corrected\n  predecessor",
          "code review does not itself establish package, publication, deployment, or",
          "version-bound release\n  evidence for those separate claims",
        ],
      },
      {
        name: "docs/PRIVACY.md",
        returned: ["This candidate has no backend"],
        stable: [
          "PhraseGarden `0.1.0-preview.8` source candidate has no backend",
          "privacy behavior is unchanged from Preview 7",
        ],
      },
      {
        name: "docs/PRODUCT.md",
        returned: [
          "The current local candidate contains",
          "The published `0.1.0-preview.2` site still contains Written",
          "The proposed `0.1.0-preview.3`\nprerelease",
          "The proposed Preview 3 also adds",
          "The candidate is memory-only",
          "carries forward the reviewed one-way",
          "The `0.1.0-preview.7` source candidate contains",
          "Source presence does not\nestablish a Preview 7 package",
          "Preview 7 retains identity-only profiles",
          "PhraseGarden `0.1.0-preview.7` is memory-only",
        ],
        stable: [
          "The `0.1.0-preview.8` source candidate contains",
          "Source presence\ndoes not establish a Preview 8 package, deployment, tag, or GitHub Release",
          "one-way Interpreter for bundled language profiles",
          "Preview 8 retains identity-only profiles",
          "PhraseGarden `0.1.0-preview.8` is memory-only",
          "In Builder, see the language-support guidance",
          "`public-unreviewed-preview` locale",
          "Qualified-speaker review is not a\npublication prerequisite for that label",
          "one reviewed English generated-instruction surface",
        ],
      },
      {
        name: "docs/PROJECT-STATE.md",
        returned: [
          "PhraseGarden `0.1.0-preview.2` is the last byte-qualified public pre-release at",
          "The proposed\nidentity remains `0.1.0-preview.3`",
          "The source is not frozen, packaged,\npublished, or deployed.",
          "no push, tag, release, Pages, or CI write for the local candidate",
          "PhraseGarden remote/public state has not been freshly\nread.",
          "The last public state qualified by repository evidence before Preview 3\npublication work",
          "Current public status requires\nfresh remote evidence",
          "push, tag, release, Pages, and CI-write state must be established from version-bound public evidence",
        ],
        stable: [
          "PhraseGarden `0.1.0-preview.8` is the active release-source target",
          "## Exact Preview 7 predecessor",
          "`FE11EEA9DC696BC04FA63E7D9E56D95077EAAFBFB3B881C83EAB8EC029DA241A`",
          "complete English `source-interface` catalog",
          "complete Japanese `public-unreviewed-preview` page catalog",
          "Japanese catalog has no qualified-human review",
          "generated portable\nprompt remains English LTR",
          "## Next eligible actions",
        ],
      },
      {
        name: "docs/PUBLICATION-MANIFEST.md",
        returned: [
          "current PhraseGarden Preview channel and the proposed",
          "- Current public release:",
          "- Proposed prerelease tag:",
          "- Previous release: <https://github.com/jkolantree/phrasegarden/releases/tag/v0.1.0-preview.1>",
          "Future qualified `release/phrasegarden-0.1.0-preview.4-pages.zip`",
          "Source: one future clean `S4`",
          "Package: one later seven-path commit",
        ],
        stable: [
          "Actual\npackage, publication, and deployment status is established only by\nversion-bound release evidence",
          "- Preview 2 rollback release:",
          "- Preview 3 public prerelease:",
          "- Preview 4 public prerelease:",
          "- Preview 5 has no tag or GitHub Release",
          "- Preview 7 is the exact immutable local package predecessor",
          "- Preview 8 is a source target",
          "- Preview 1 historical release:",
          "- `release/phrasegarden-0.1.0-preview.7-pages.zip`",
          "- `release/phrasegarden-0.1.0-preview.7-pages-manifest.json`",
          "Future qualified `release/phrasegarden-0.1.0-preview.8-pages.zip`",
          "Future qualified `release/phrasegarden-0.1.0-preview.8-pages-manifest.json`",
          "## Preview 8 source and Pages boundary",
          "Source: one exact source checkpoint `S8`",
          "Package: one exact seven-path child `P8`",
          "Preview 8 archive without rebuilding it",
          "Japanese interface\nhas not completed qualified-human review",
          "## Preview 7 source and Pages boundary",
          "Source: one exact source checkpoint `S7`",
          "Package: one exact seven-path child `P7`",
          "deploy the exact checked-in\n  Preview 7 archive without rebuilding it",
          "## Preview 6 Pages boundary",
          "Source: one exact source checkpoint `S6`",
          "Package: one exact seven-path child `P6`",
          "deploy the exact checked-in Preview\n  6 archive without rebuilding it",
          "## Preview 5 Pages boundary",
          "Package: one exact seven-path child `P5`",
          "Preview 4 tag, prerelease record, and three public release assets were",
        ],
      },
      {
        name: "docs/RELEASE-NOTES.md",
        returned: [
          "Status: proposed public prerelease",
          "exact current Interpreter",
          "claims remain pending until",
          "captures a current 320 px",
          "Preview 3 remains the byte-qualified public prerelease",
        ],
        stable: [
          "## 0.1.0-preview.8 — start in English or Japanese",
          "Status: source target; package, deployment, tag, GitHub Release, and public-byte",
          "Japanese\n  catalog is Preview content without qualified-human review",
          "generated portable prompt on the existing English authored surface",
          "exact Preview 7 predecessor bindings",
          "## 0.1.0-preview.7 — clearer accessibility semantics and Node 24 release pins",
          "named language-support guidance",
          "official GitHub Actions commits to their Node 24-backed",
          "Status: prerelease record; publication status is version-bound",
          "exact Preview 3 Interpreter",
          "each is recorded only when its named\n  qualification stage and version-bound evidence pass",
          "captures a 2026-08-18 320 px",
          "## 0.1.0-preview.4 — desktop fold correction and closed release path",
          "Status: source target; package, publication, and deployment are version-bound",
          "No Preview 4 source freeze, release package, tag, GitHub release, Pages\ndeployment",
          "Preview 3 release assets are byte-qualified",
          "## 0.1.0-preview.5 — a clearer path from choice to copy",
          "Status: source target; package, publication, and deployment are version-bound",
          "Preview 5 adds no\nruntime model detection",
          "## 0.1.0-preview.6 — mobile handoff headroom",
          "Targets a Copy-action bottom of no more than 800 px",
          "Linux Chromium placed Copy at `985.984375` px",
          "Preview 6 is\na separately versioned correction",
        ],
      },
      {
        name: "docs/RELEASE-WORKFLOW.md",
        returned: [
          "python -B scripts/preview3-package.py freeze-source --source-commit <S>",
          "artifacts/release/preview3-source-manifest.json",
          "binds `S`, its",
          "declared source `S`",
          "sole parent `S`",
        ],
        stable: [
          "python -B scripts/preview8-package.py freeze-source --source-commit <S8>",
          "python -B scripts/preview8-package.py verify-source --source-commit <S8>",
          "artifacts/release/preview8-source-manifest.json",
          "binds `S8`, its",
          "declared source `S8`",
          "sole parent `S8`",
          "Preview 3 through Preview 7 adapters remain\navailable",
          "explicitly unreviewed Preview content",
          "deploys the exact\nchecked-in archive; it must not silently rebuild",
        ],
      },
      {
        name: "docs/work-packages/PREVIEW-8-SOURCE-IDENTITY.md",
        returned: [],
        stable: [
          "Status: source contract; no package or public authority",
          "Version target: `0.1.0-preview.8`",
          "changes exactly these 31 paths",
          "Preview 7 ledger: 2,188 bytes",
          "The English catalog is the `source-interface`",
          "Only the Japanese catalog is `public-unreviewed-preview`",
          "exact 31-path source delta → S8",
          "separately authorized Pages action",
        ],
      },
      {
        name: "docs/work-packages/PREVIEW-4-PUBLICATION.md",
        returned: [
          "Preview 3 remains the byte-qualified public prerelease",
          "a clean descendant may become source `S4`",
        ],
        stable: [
          "Preview 3 release assets are byte-qualified and its Pages run did not deploy",
          "This exact thirteen-path checkpoint is source candidate `S4`",
          "they do not create a descendant source identity",
        ],
      },
    ] as const;

    expect([...publicClaims.keys()]).toEqual(claimTransitions.map(({ name }) => name));
    for (const { name, returned, stable } of claimTransitions) {
      const document = publicClaims.get(name);
      expect(document).toBeDefined();
      for (const claim of returned) expect(document).not.toContain(claim);
      for (const claim of stable) expect(document).toContain(claim);
    }
    const combinedClaims = [
      ...publicClaims.values(),
      ...readExactClaimPair(preview7ClaimSources),
      ...readExactClaimPair(preview8ClaimSources),
    ].join("\n");
    for (const prohibited of [
      /Preview (?:5|6|7|8) (?:assigns|is) (?:Community|Reviewed|Flagship)\b/i,
      /English↔Japanese (?:has completed|completed|passed) external linguistic review/i,
      /Japanese (?:interface|catalog) (?:has completed|completed|passed|received) (?:qualified[- ]human|qualified[- ]speaker|human) review/i,
      /Preview (?:5|6|7|8) (?:is|has been) WCAG conformant/i,
      /Preview (?:5|6|7|8) (?:passed|completed) an independent screen-reader matrix/i,
      /Preview 8 (?:is|has been) (?:published|deployed)\b/i,
      /Current Pages (?:serves|runs) Preview 8/i,
    ]) expect(combinedClaims).not.toMatch(prohibited);
  });

  it("accepts a regular dist tree bound to one exact manifest", () => {
    const root = workspace(); createDist(root);
    const manifest = writeManifest(root, manifestFixture(root)); const result = runAudit(root, manifest);
    expect(result.status, result.stderr).toBe(0); expect(JSON.parse(result.stdout)).toMatchObject({ ok: true, root: "dist" });
    mkdirSync(join(root, "dist/unused"));
    expectAuditFailure(root, "unexpected release output shape", manifest);
  });
  it("binds CSS and JavaScript by path shape when JavaScript sorts first", () => {
    const root = workspace();
    createDist(root, "index-zzz.css", "index-aaa.js");
    const manifest = writeManifest(root, manifestFixture(root, [
      "assets/index-zzz.css",
      "assets/index-aaa.js",
    ]));
    const result = runAudit(root, manifest);
    expect(result.status, result.stderr).toBe(0);
  });
  it("fails cleanly for missing roots, extra arguments, and forbidden output", () => {
    const missing = workspace();
    expectAuditFailure(missing, "dist: unreadable root");
    const root = workspace();
    createDist(root);
    expectAuditFailure(root, "usage: release-audit.mjs [manifest]", "one.json", "two.json");
    writeFileSync(join(root, "dist/assets/leak.JS.MAP"), "{}\n");
    writeFileSync(join(root, "dist/assets/tracker.JS"), "https://google-analytics.com\n");
    const cspCases: [string, string][] = [
      ["<!doctype html><html><head><!-- Content-Security-Policy connect-src 'none' script-src 'self' style-src 'self' --></head></html>", "head comments are not allowed"],
      ["<!doctype html><html><head><meta http-equiv=\"not-csp\" http-equiv=\"Content-Security-Policy\" content=\"connect-src 'none'; script-src 'self'; style-src 'self'\"></head></html>", "duplicate meta attribute http-equiv"],
      ["<!doctype html><html><head><title><meta http-equiv=\"Content-Security-Policy\" content=\"connect-src 'none'; script-src 'self'; style-src 'self'\"></title></head></html>", "missing Content-Security-Policy"],
      [`<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="${"default-src 'self'; ".repeat(300)}"></head></html>`, "CSP exceeds 4096 UTF-8 bytes"],
      ["<!doctype html><html><body><script>const fake=\"<head><meta http-equiv='Content-Security-Policy' content=\"connect-src 'none'; script-src 'self'; style-src 'self'\"></head>\"</script></body></html>", "missing Content-Security-Policy"],
      ["<!doctype html><html><template><head><meta http-equiv=\"Content-Security-Policy\" content=\"connect-src 'none'; script-src 'self'; style-src 'self'\"></head></template></html>", "missing Content-Security-Policy"],
      ["<!doctype html><html><head><meta http-equiv=refresh http-equiv=\"Content-Security-Policy\" content=\"connect-src 'none'; script-src 'self'; style-src 'self'\"></head></html>", "invalid meta attribute syntax"],
      ["<!doctype html><html><head><meta x:http-equiv=\"Content-Security-Policy\" content=\"connect-src 'none'; script-src 'self'; style-src 'self'\"></head></html>", "invalid meta attribute syntax"],
      ["<!doctype html><html data=\"> <head><meta http-equiv='Content-Security-Policy' content=\"connect-src 'none'; script-src 'self'; style-src 'self'\"></head>\"><head></head></html>", "missing Content-Security-Policy"],
      ["<!doctype html><html><head data=\"> <meta http-equiv='Content-Security-Policy' content=\"connect-src 'none'; script-src 'self'; style-src 'self'\"></head>\"></head></html>", "missing Content-Security-Policy"],
      ["<!doctype html><html><head><script>console.log('before')</script><meta http-equiv=\"Content-Security-Policy\" content=\"connect-src 'none'; script-src 'self'; style-src 'self'\"></head></html>", "CSP must precede script"],
      ["<!doctype html><html><head><meta http-equiv=\"Content-Security-Policy\" content=\"connect-src 'none'; script-src 'self'; style-src 'self'\"><meta http-equiv=\"refresh\" content=\"0;url=https://example.com\"></head></html>", "unsupported non-CSP http-equiv"],
      ["<!doctype html><html><head><meta http-equiv=\"Content-Security-Policy\" content=\"connect-src 'none'; script-src 'self'; style-src 'self'\"></head><body><meta http-equiv=\"refresh\" content=\"0;url=https://example.com\"></body></html>", "exactly one http-equiv"],
      [`<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="${"é".repeat(3000)}; connect-src 'none'; script-src 'self'; style-src 'self'"></head></html>`, "CSP exceeds 4096 UTF-8 bytes"],
      [`<!doctype html>\u00A0<html><head><meta http-equiv="Content-Security-Policy" content="${csp}"></head></html>`, "missing canonical document head"],
      [`<!doctype html><html>\u00A0<head><meta http-equiv="Content-Security-Policy" content="${csp}"></head></html>`, "missing canonical document head"],
      [`<!doctype html><html><head>\u00A0<meta http-equiv="Content-Security-Policy" content="${csp}"></head></html>`, "unsupported or malformed head markup"],
      [`<!doctype html><html><head><meta http-equiv="Content-Security-Policy"\u00A0content="${csp}"></head></html>`, "invalid meta attribute syntax"],
      [`<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src\u00A0'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; worker-src 'none'"></head></html>`, "CSP default-src must be exactly"],
      [`<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="${csp.replace("worker-src", "worKer-src")}"></head></html>`, "non-ASCII CSP directive name"],
      [`<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="${csp}"><link rel=preconnect href=https://example.com></head></html>`, "remote-html-asset"],
      ["<!doctype html><html><head><meta http-equiv=\"Content-Security-Policy\" content=\"connect-src 'none'; script-src 'self'; style-src 'self'\"></head></html>", "CSP must contain exactly the required directives"],
      [`<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="${csp}"></head><body><a href="https&#58;//example.invalid">go</a></body></html>`, "unsupported canonical body shell"],
      [`<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="${csp}"></head><body><a href="//example.invalid">go</a></body></html>`, "unsupported canonical body shell"],
      [`<!doctype html><html><head><!--><link rel="preload" href="//example.invalid/pixel" as="image">--><meta http-equiv="Content-Security-Policy" content="${csp}"></head><body><div id="app"></div></body></html>`, "head comments are not allowed"],
      [`<!doctype html><html><head><title>x</title x><link rel="preload" href="//example.invalid/pixel" as="image"></title><meta http-equiv="Content-Security-Policy" content="${csp}"></head><body><div id="app"></div></body></html>`, "browser-valid title end tag"],
      [`<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="${csp}"><script type="module" crossorigin src="./assets/index-test.js"></script x><link rel="preload" href="//example.invalid/pixel" as="image"></script></head><body><div id="app"></div></body></html>`, "browser-valid script end tag"],
    ];
    for (const [html] of cspCases) { writeFileSync(join(root, "dist/index.html"), html); expectAuditFailure(root, "does not match canonical release document"); }
    const final = runAudit(root);
    expect(final.stderr).toContain("source map must not ship");
    expect(final.stderr).toContain("tracker-or-cdn");
    expect(final.stderr).toContain("unexpected release output shape");
  });

  it("rejects a linked directory without reading through it", () => {
    const root = workspace();
    createDist(root);
    const outside = join(root, "outside");
    mkdirSync(outside);
    writeFileSync(join(outside, "private.txt"), "must not be followed\n");
    symlinkSync(outside, join(root, "dist/linked"), process.platform === "win32" ? "junction" : "dir");
    const result = runAudit(root);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("linked: symlink must not ship");
    expect(result.stdout).not.toContain("private.txt");
  });
  it.each<[string, (manifest: ManifestFixture) => unknown, string]>([
    ["unknown root field", (value) => ({ ...value, extra: true }), "keys"],
    ["wrong schema type", (value) => ({ ...value, schemaVersion: true }), "schemaVersion"],
    ["unsafe artifact", (value) => ({ ...value, releaseVersion: "../evil", artifactName: "phrasegarden-../evil-pages.zip" }), "artifactName must be one portable ASCII filename"],
    ["wrong build type", (value) => ({ ...value, build: { ...value.build, sourceMaps: 0 } }), "unsupported build identity"],
    ["non-string commit", (value) => ({ ...value, sourceProvenance: { ...value.sourceProvenance, gitCommit: [value.sourceProvenance.gitCommit] } }), "gitCommit must be 40 lowercase"],
    ["unsafe path", (value) => ({ ...value, files: [{ ...value.files[0]!, path: "../index.html" }, value.files[1]!] }), "path is not portable ASCII"],
    ["non-ASCII path", (value) => ({ ...value, files: [{ ...value.files[0]!, path: "é.txt" }, value.files[1]!] }), "path is not portable ASCII"],
    ["wrong SHA type", (value) => ({ ...value, files: [{ ...value.files[0]!, sha256: [value.files[0]!.sha256] }, value.files[1]!] }), "sha256 must be uppercase"],
    ["wrong byte length", (value) => ({ ...value, files: [{ ...value.files[0]!, bytes: 1 }, value.files[1]!] }), "dist path, length, or SHA-256 mismatch"],
    ["unsorted paths", (value) => ({ ...value, files: [...value.files].reverse() }), "paths must be sorted"],
    ["duplicate paths", (value) => ({ ...value, files: [value.files[0]!, value.files[0]!] }), "paths must be case-insensitively unique"],
  ])("rejects manifest case: %s", (_label, change, message) => {
    const root = workspace();
    createDist(root);
    const manifest = writeManifest(root, change(manifestFixture(root)));
    expectAuditFailure(root, message, manifest);
  });
  it("rejects nested duplicate JSON keys", () => {
    const root = workspace();
    createDist(root);
    const raw = JSON.stringify(manifestFixture(root)).replace('"sourceMaps":false', '"sourceMaps":false,"sourceMaps":false');
    const path = join(root, "manifest.json"); writeFileSync(path, raw);
    expectAuditFailure(root, "duplicate object key \"sourceMaps\"", path);
  });
  it.each<[string, (root: string) => void, string]>([
    ["file count", (root) => { for (let index = 0; index < 63; index += 1) writeFileSync(join(root, `dist/f${index}.txt`), "x"); }, "file count exceeds 64"],
    ["entry count", (root) => { for (let index = 0; index < 129; index += 1) mkdirSync(join(root, `dist/d${index}`)); }, "entry count exceeds 128"],
    ["directory depth", (root) => { let path = join(root, "dist"); for (let index = 0; index < 18; index += 1) { path = join(path, "d"); mkdirSync(path); } }, "directory depth exceeds 16"],
    ["single-file bytes", (root) => { const path = join(root, "dist/large.bin"); writeFileSync(path, ""); truncateSync(path, 5 * 1024 * 1024 + 1); }, "release byte budget exceeds"],
    ["total bytes", (root) => { for (const name of ["one.bin", "two.bin"]) { const path = join(root, "dist", name); writeFileSync(path, ""); truncateSync(path, 3 * 1024 * 1024); } }, "release byte budget exceeds"],
  ])("rejects bounded input case: %s", (_label, setup, message) => {
    const root = workspace();
    createDist(root);
    setup(root);
    expectAuditFailure(root, message);
  });
  it("rejects an oversized manifest before parsing", () => {
    const root = workspace();
    createDist(root);
    const path = writeManifest(root, manifestFixture(root)); truncateSync(path, 256 * 1024 + 1);
    expectAuditFailure(root, "byte limit 262144 exceeded", path);
  });
});
describe("Pages workflow policy", () => {
  const workflow = readFileSync(workflowPath, "utf8").replaceAll("\r\n", "\n");
  const commands = [...workflow.matchAll(/^\s+(?:-\s+)?run:\s*(?:>-\n((?: {10}.+\n?)+)|([^\n]+))/gm)]
    .map((match) => (match[2] ?? match[1]?.trim() ?? "").replace(/\n\s+/g, " "));
  const p7Manifest = "release/phrasegarden-0.1.0-preview.7-pages-manifest.json";
  const p7Archive = "release/phrasegarden-0.1.0-preview.7-pages.zip";
  const p8Manifest = "release/phrasegarden-0.1.0-preview.8-pages-manifest.json";
  const p8Archive = "release/phrasegarden-0.1.0-preview.8-pages.zip";
  const occurrences = (value: string): number => workflow.split(value).length - 1;
  const workflowPolicyHash = "636354BE5FD69DF3C2C14F8E731FE4AB8B279EA1C7497BF71CD5A62322BB0E90";
  const packageDocument = JSON.parse(readFileSync(join(repository, "package.json"), "utf8")) as {
    version: string; scripts: Record<string, string>;
  };
  const packageScripts = packageDocument.scripts;
  const exactWorkflow = (candidate: string): void => {
    expect(sha256(Buffer.from(candidate.replaceAll("\r\n", "\n")))).toBe(workflowPolicyHash);
  };
  const exactPackageScripts = (candidate: Record<string, string>): void => {
    expect(Object.keys(candidate).sort()).toEqual([
      "audit:release", "build", "check", "dev", "preview", "test", "test:clause",
      "test:compiler", "test:compiler-policy", "test:e2e", "test:e2e:dist",
      "test:language-profile", "test:prompt-surface", "test:review-evidence",
      "test:spec", "test:summary-catalog", "test:watch", "typecheck", "verify:release",
    ]);
    expect({ test: candidate.test, typecheck: candidate.typecheck, e2e: candidate["test:e2e:dist"] }).toEqual({
      test: "vitest run",
      typecheck: "tsc -p tsconfig.json --noEmit && tsc -p tsconfig.domain.json --noEmit",
      e2e: "playwright test",
    });
  };
  const policyMutations: [string, (source: string) => string][] = [
    ["skipped post-browser audit", (source) => source.replace(
      "      - name: Confirm browser checks did not alter the qualified bytes\n        run:",
      "      - name: Confirm browser checks did not alter the qualified bytes\n        if: false\n        run:")],
    ["ignored audit failure", (source) => source.replace(
      "      - name: Confirm browser checks did not alter the qualified bytes\n        run:",
      "      - name: Confirm browser checks did not alter the qualified bytes\n        continue-on-error: true\n        run:")],
    ["alternate checkout", (source) => source.replace(
      "        with:\n          fetch-depth: 0", "        with:\n          repository: another/public-repository\n          ref: main\n          fetch-depth: 0")],
    ["ref override", (source) => source.replace(
      "          fetch-depth: 0", "          ref: main\n          fetch-depth: 0")],
    ["recovery harness", (source) => source.replace(
      "jobs:\n  verify:", "jobs:\n  recovery-harness:\n    runs-on: ubuntu-latest\n  verify:\n    needs: recovery-harness")],
    ["source rebuild", (source) => source.replace(
      "      - run: pnpm typecheck", "      - run: pnpm typecheck\n      - run: pnpm build")],
    ["packaging identity bypass", (source) => source.replace(
      "          --require-packaging-commit", "          ")],
    ["changed active archive", (source) => source.replace(
      `          --archive ${p8Archive}`, `          --archive ${p7Archive}`)],
    ["changed active manifest", (source) => source.replace(
      `          --manifest ${p8Manifest}`, `          --manifest ${p7Manifest}`)],
    ["elevated verify permission", (source) => source.replace(
      "    permissions:\n      contents: read", "    permissions:\n      contents: read\n      issues: write")],
    ["added schedule", (source) => source.replace(
      "on:\n  workflow_dispatch:", "on:\n  schedule:\n    - cron: '0 0 * * *'\n  workflow_dispatch:")],
    ["changed concurrency", (source) => source.replace("cancel-in-progress: false", "cancel-in-progress: true")],
    ["deploy despite failure", (source) => source.replace(
      "    if: github.ref == 'refs/heads/main'\n    permissions:\n      pages: write",
      "    if: github.ref == 'refs/heads/main' && always()\n    permissions:\n      pages: write")],
    ["unparsed run block", (source) => source.replace(
      "      - uses: actions/upload-pages-artifact@", "      - run: |\n          echo shadow\n      - uses: actions/upload-pages-artifact@")],
  ];

  it.each(policyMutations)("rejects workflow control bypass: %s", (_label, mutate) => {
    const changed = mutate(workflow);
    expect(changed).not.toBe(workflow);
    expect(() => exactWorkflow(changed)).toThrow();
  });

  it("rejects an added root pnpm lifecycle hook", () => {
    exactPackageScripts(packageScripts);
    expect(() => exactPackageScripts({
      ...packageScripts, "pnpm:devPreinstall": "node scripts/change-release-tools.mjs",
    })).toThrow();
  });

  it("pins authority and the complete Preview 8 command chain", () => {
    exactWorkflow(workflow);
    expect(packageDocument.version).toBe("0.1.0-preview.8");
    exactPackageScripts(packageScripts);
    const uses = [...workflow.matchAll(/^\s+(?:-\s+)?uses:\s+([^\s#]+)/gm)].map((match) => match[1]);
    expect(uses).toEqual([
      "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1",
      "pnpm/action-setup@0977fd99725f1db4007ccb2928dbb4e90d06cc86",
      "actions/setup-node@820762786026740c76f36085b0efc47a31fe5020",
      "actions/upload-pages-artifact@fc324d3547104276b827a68afc52ff2a11cc49c9",
      "actions/deploy-pages@cd2ce8fcbc39b97be8ca5fce6e763baed58fa128",
    ]);
    expect(uses.every((value) => /@[0-9a-f]{40}$/.test(value ?? ""))).toBe(true);
    expect(workflow.match(/if: github\.ref == 'refs\/heads\/main'/g)).toHaveLength(2);
    expect(workflow).toContain("permissions: {}");
    expect(workflow).toMatch(/verify:\n\s+if:.*\n\s+permissions:\n\s+contents: read/);
    expect(workflow).toMatch(/deploy:\n\s+if:.*\n\s+permissions:\n\s+pages: write\n\s+id-token: write/);
    expect(workflow.match(/fetch-depth:/g)).toHaveLength(1);
    expect(workflow.match(/fetch-depth: 0/g)).toHaveLength(1);
    expect(workflow.match(/persist-credentials: false/g)).toHaveLength(1);
    expect(workflow).not.toMatch(/^\s+ref:/gm);
    expect(workflow).not.toMatch(/(?:filter|sparse-checkout):/);
    expect(workflow).not.toContain("recovery-harness");
    expect(commands).toEqual([
      "pnpm install --frozen-lockfile",
      "python3 -m unittest discover -s tests/release -p 'test_*.py'",
      "pnpm test", "pnpm typecheck",
      `python3 scripts/preview8-verify-release-archive.py --archive ${p8Archive} --manifest ${p8Manifest} --checksums SHA256SUMS --output dist --require-packaging-commit`,
      `node scripts/release-audit.mjs ${p8Manifest}`,
      "pnpm exec playwright install chromium", "pnpm test:e2e:dist",
      `node scripts/release-audit.mjs ${p8Manifest}`,
    ]);
    const extractionStep = workflow.split(/\n(?=      - )/).find((step) => step.includes("Extract the exact qualified Pages archive"));
    expect(extractionStep).toBe([
      "      - name: Extract the exact qualified Pages archive", "        run: >-",
      "          python3 scripts/preview8-verify-release-archive.py",
      `          --archive ${p8Archive}`, `          --manifest ${p8Manifest}`,
      "          --checksums SHA256SUMS", "          --output dist",
      "          --require-packaging-commit",
    ].join("\n"));
    const active = commands.join("\n");
    expect(active).not.toMatch(/preview\.[3-7]|preview[3-7]-|scripts\/verify-release-archive\.py|scripts\/release_archive_verifier\.py|--(?:release|version|spec)\b/);
    expect(active).not.toMatch(/pnpm (?:run )?build\b/);
    const extract = workflow.indexOf("--require-packaging-commit");
    const firstAudit = workflow.indexOf("node scripts/release-audit.mjs");
    const browser = workflow.indexOf("pnpm test:e2e:dist");
    const secondAudit = workflow.lastIndexOf("node scripts/release-audit.mjs");
    const upload = workflow.indexOf("actions/upload-pages-artifact@");
    expect([extract, firstAudit, browser, secondAudit, upload].every((index) => index >= 0)).toBe(true);
    expect([extract, firstAudit, browser, secondAudit, upload]).toEqual([...[extract, firstAudit, browser, secondAudit, upload]].sort((left, right) => left - right));
    expect(workflow.indexOf("Confirm browser checks")).toBeLessThan(upload);
    expect(workflow).toContain("Install exact Playwright Chromium without OS package refresh\n        timeout-minutes: 10\n        run: pnpm exec playwright install chromium");
    expect(workflow).not.toContain("playwright install --with-deps");
    expect(workflow).toContain("needs: verify");
    expect(workflow.match(/\n\s+path: dist\n/g)).toHaveLength(1);
  });

  it("monitors exact active and predecessor release paths", () => {
    const paths = workflow.match(/    paths:\n((?:      - .+\n)+)/)?.[1]?.trim().split("\n").map((line) => line.replace(/^\s*-\s+"?|"?$/g, ""));
    expect(paths).toEqual([
      ".github/workflows/pages.yml", "SHA256SUMS", "index.html",
      "package.json", "pnpm-lock.yaml", "playwright.config.ts",
      p7Manifest, p7Archive, p8Manifest, p8Archive, "scripts/**",
      "src/**", "tests/**", "tsconfig.json", "tsconfig.domain.json",
      "vite.config.ts", "vitest.config.ts",
    ]);
    expect([occurrences(p7Manifest), occurrences(p7Archive)]).toEqual([1, 1]);
    expect([occurrences(p8Manifest), occurrences(p8Archive)]).toEqual([4, 2]);
  });
});
