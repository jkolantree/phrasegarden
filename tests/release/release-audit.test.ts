import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, truncateSync, writeFileSync } from "node:fs";
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
afterEach(() => { for (const path of workspaces.splice(0)) rmSync(path, { recursive: true, force: true }); });
describe("release filesystem audit", () => {
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
        ],
        stable: [
          "Versioned release status, evidence, and downloadable assets",
          "Source presence does not\nestablish packaging, publication, or deployment",
          "## What Preview 3 includes",
          "The Preview 3 interface and generated instruction surface are English-only.",
          "Preview 3 cannot assign them",
          "Exact Preview 3\nInterpreter prompt hashes",
        ],
      },
      {
        name: "docs/ACCESSIBILITY.md",
        returned: [
          "Checks run for this candidate",
          "candidate has not completed an independent screen-reader matrix",
          "local candidate because that surface",
        ],
        stable: [
          "Checks recorded for Preview 3",
          "Preview 3\nevidence does not include an independent screen-reader matrix",
          "local Preview 3 build because that surface",
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
          "This source tree targets PhraseGarden `0.1.0-preview.3`",
          "Source presence does not establish packaging,\npublication, or deployment.",
          "not supported by the `0.1.0-preview.3` source",
          "Recorded local development evidence includes synthetic IME coverage",
          "code review does not itself establish package, publication, deployment, or",
          "version-bound release\n  evidence for those separate claims",
        ],
      },
      {
        name: "docs/PRIVACY.md",
        returned: ["This candidate has no backend"],
        stable: ["PhraseGarden `0.1.0-preview.3` has no backend"],
      },
      {
        name: "docs/PRODUCT.md",
        returned: [
          "The current local candidate contains",
          "The published `0.1.0-preview.2` site still contains Written",
          "The proposed `0.1.0-preview.3`\nprerelease",
          "The proposed Preview 3 also adds",
          "The candidate is memory-only",
        ],
        stable: [
          "The `0.1.0-preview.3` source contains",
          "Source presence does not establish package, publication, or\ndeployment status",
          "Preview 3 adds the reviewed one-way Interpreter",
          "Preview 3 also adds identity-only profiles",
          "PhraseGarden `0.1.0-preview.3` is memory-only",
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
        ],
        stable: [
          "The last public state qualified by repository evidence before Preview 3\npublication work",
          "Current public status requires\nfresh remote evidence",
          "The target\nidentity is `0.1.0-preview.3`",
          "This repair checkpoint itself establishes no\nreplacement source freeze, package, publication, or deployment",
          "push, tag, release, Pages, and CI-write state must be established from version-bound public evidence",
        ],
      },
      {
        name: "docs/PUBLICATION-MANIFEST.md",
        returned: [
          "current PhraseGarden Preview channel and the proposed",
          "- Current public release:",
          "- Proposed prerelease tag:",
        ],
        stable: [
          "Actual package,\npublication, and deployment status is established only by version-bound\nrelease evidence",
          "- Preview 2 rollback release:",
          "- Preview 3 target tag:",
        ],
      },
      {
        name: "docs/RELEASE-NOTES.md",
        returned: [
          "Status: proposed public prerelease",
          "exact current Interpreter",
          "claims remain pending until",
          "captures a current 320 px",
        ],
        stable: [
          "Status: prerelease record; publication status is version-bound",
          "exact Preview 3 Interpreter",
          "each is recorded only when its named\n  qualification stage and version-bound evidence pass",
          "captures a 2026-08-18 320 px",
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
  it("pins exact actions and preserves main-only same-byte deployment", () => {
    const workflow = readFileSync(workflowPath, "utf8").replaceAll("\r\n", "\n");
    const uses = [...workflow.matchAll(/^\s+(?:-\s+)?uses:\s+([^\s#]+)/gm)].map((match) => match[1]);
    expect(uses).toEqual([
      "actions/checkout@11d5960a326750d5838078e36cf38b85af677262",
      "pnpm/action-setup@b906affcce14559ad1aafd4ab0e942779e9f58b1",
      "actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020",
      "actions/upload-pages-artifact@56afc609e74202658d3ffba0e8f6dda462b719fa",
      "actions/deploy-pages@d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e",
    ]);
    expect(uses.every((value) => /@[0-9a-f]{40}$/.test(value ?? ""))).toBe(true);
    expect(workflow.match(/if: github\.ref == 'refs\/heads\/main'/g)).toHaveLength(2);
    expect(workflow).toContain("permissions: {}");
    expect(workflow).toMatch(/verify:\n\s+if:.*\n\s+permissions:\n\s+contents: read/);
    expect(workflow).toMatch(/deploy:\n\s+if:.*\n\s+permissions:\n\s+pages: write\n\s+id-token: write/);
    expect(workflow).toContain("fetch-depth: 2");
    expect(workflow).toContain("persist-credentials: false");
    expect(workflow).toContain("--require-packaging-commit");
    expect(workflow).not.toContain("--require-head-parent");
    expect(workflow).not.toMatch(/\bpnpm build\b/);
    expect(workflow).toContain("pnpm test\n");
    expect(workflow).toContain("pnpm typecheck\n");
    expect(workflow).toContain("python3 -m unittest tests/release/test_verify_release_archive.py");
    expect(workflow).toContain("pnpm test:e2e:dist");
    expect(workflow.match(/node scripts\/release-audit\.mjs/g)).toHaveLength(2);
    const extract = workflow.indexOf("--require-packaging-commit");
    const firstAudit = workflow.indexOf("node scripts/release-audit.mjs");
    const browser = workflow.indexOf("pnpm test:e2e:dist");
    const secondAudit = workflow.lastIndexOf("node scripts/release-audit.mjs");
    const upload = workflow.indexOf("actions/upload-pages-artifact@");
    expect([extract, firstAudit, browser, secondAudit, upload]).toEqual([...[extract, firstAudit, browser, secondAudit, upload]].sort((left, right) => left - right));
    expect(workflow.indexOf("Confirm browser checks")).toBeLessThan(upload);
    expect(workflow).toContain("needs: verify");
    const paths = workflow.match(/    paths:\n((?:      - .+\n)+)/)?.[1]?.trim().split("\n").map((line) => line.replace(/^\s*-\s+"?|"?$/g, ""));
    expect(paths).toEqual([
      ".github/workflows/pages.yml", "SHA256SUMS", "index.html",
      "package.json", "pnpm-lock.yaml", "playwright.config.ts",
      "release/phrasegarden-0.1.0-preview.3-pages-manifest.json",
      "release/phrasegarden-0.1.0-preview.3-pages.zip", "scripts/**",
      "src/**", "tests/**", "tsconfig.json", "tsconfig.domain.json",
      "vite.config.ts", "vitest.config.ts",
    ]);
  });
});
