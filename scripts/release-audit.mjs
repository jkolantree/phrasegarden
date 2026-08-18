import { createHash } from "node:crypto";
import { lstat, open, opendir } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";

const root = resolve("dist");
const manifestPath = process.argv[2];
const issues = [];
const MAX_FILES = 64;
const MAX_ENTRIES = 128;
const MAX_DEPTH = 16;
const MAX_RELEASE_BYTES = 5 * 1024 * 1024;
const MAX_MANIFEST_BYTES = 256 * 1024;
const portablePath = /^[A-Za-z0-9._/-]+$/;
const reservedName = /^(?:AUX|CON|NUL|PRN|COM[1-9]|LPT[1-9])(?:\.|$)/i;
const decoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
const textExtensions = new Set([".css", ".html", ".js", ".json", ".txt"]);
const forbidden = [
  ["source-map-reference", /sourceMappingURL/i],
  ["private-codex-path", /(?:^|[\\/])\.codex(?:[\\/]|$)|attachments[\\/]/i],
  ["absolute-user-path", /[A-Za-z]:[\\/](?:Users|Documents)[\\/]/i],
  ["tracker-or-cdn", /google-analytics|googletagmanager|fonts\.googleapis|use\.typekit|segment\.com|sentry\.io|plausible\.io|unpkg\.com|jsdelivr\.net/i],
  ["remote-html-asset", /(?:src|href)[\t\n\f\r ]*=[\t\n\f\r ]*["']?https?:\/\//i],
  ["remote-css-asset", /url\([\t\n\f\r ]*["']?https?:\/\//i],
];

if (process.argv.length > 3) issues.push("usage: release-audit.mjs [manifest]");

function errorText(error) {
  return error instanceof Error ? error.message : String(error);
}

function isCanonicalPath(value) {
  if (typeof value !== "string" || !portablePath.test(value)) return false;
  return value.split("/").every((part) =>
    part !== "" && part !== "." && part !== ".." &&
    !part.endsWith(".") && !reservedName.test(part)
  );
}

function exactKeys(value, keys, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    issues.push(`${label}: expected object`);
    return false;
  }
  const actual = Object.keys(value).sort();
  const wanted = [...keys].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    issues.push(`${label}: keys ${JSON.stringify(actual)} do not equal ${JSON.stringify(wanted)}`);
    return false;
  }
  return true;
}

function parseStrictJson(text) {
  let at = 0;
  const whitespace = () => {
    while (/[ \t\r\n]/.test(text[at] ?? "")) at += 1;
  };
  const string = () => {
    const start = at;
    if (text[at++] !== '"') throw new Error("expected JSON string");
    while (at < text.length) {
      const character = text[at++];
      if (character === "\\") at += 1;
      else if (character === '"') {
        JSON.parse(text.slice(start, at));
        return text.slice(start, at);
      }
    }
    throw new Error("unterminated JSON string");
  };
  const value = () => {
    whitespace();
    if (text[at] === "{") {
      at += 1;
      whitespace();
      const keys = new Set();
      if (text[at] === "}") { at += 1; return; }
      while (true) {
        whitespace();
        const key = JSON.parse(string());
        if (keys.has(key)) throw new Error(`duplicate object key ${JSON.stringify(key)}`);
        keys.add(key);
        whitespace();
        if (text[at++] !== ":") throw new Error("expected colon after object key");
        value();
        whitespace();
        const delimiter = text[at++];
        if (delimiter === "}") return;
        if (delimiter !== ",") throw new Error("expected comma or object close");
      }
    }
    if (text[at] === "[") {
      at += 1;
      whitespace();
      if (text[at] === "]") { at += 1; return; }
      while (true) {
        value();
        whitespace();
        const delimiter = text[at++];
        if (delimiter === "]") return;
        if (delimiter !== ",") throw new Error("expected comma or array close");
      }
    }
    if (text[at] === '"') { string(); return; }
    const start = at;
    while (at < text.length && !/[ \t\r\n,\]}]/.test(text[at])) at += 1;
    if (start === at) throw new Error("expected JSON value");
    JSON.parse(text.slice(start, at));
  };
  value();
  whitespace();
  if (at !== text.length) throw new Error("unexpected material after JSON value");
  return JSON.parse(text);
}

async function readBounded(path, label, limit) {
  const before = await lstat(path);
  if (before.isSymbolicLink() || !before.isFile()) throw new Error("expected a real regular file");
  if (before.size > limit) throw new Error(`byte limit ${limit} exceeded`);
  const handle = await open(path, "r");
  try {
    const entry = await handle.stat();
    if (!entry.isFile() || entry.size > limit) throw new Error(`byte limit ${limit} exceeded`);
    const bytes = Buffer.alloc(entry.size + 1);
    let used = 0;
    while (used < bytes.length) {
      const { bytesRead } = await handle.read(bytes, used, bytes.length - used, used);
      if (bytesRead === 0) break;
      used += bytesRead;
    }
    if (used !== entry.size || entry.size !== before.size) throw new Error("file changed while reading");
    return bytes.subarray(0, used);
  } finally {
    await handle.close();
  }
}

let entryCount = 0;
let fileCount = 0;
let declaredBytes = 0;
let walkBlocked = false;
async function walk(directory, depth = 0) {
  if (depth > MAX_DEPTH) {
    issues.push(`dist: directory depth exceeds ${MAX_DEPTH}`);
    walkBlocked = true;
    return [];
  }
  const names = [];
  for await (const entry of await opendir(directory)) {
    entryCount += 1;
    if (entryCount > MAX_ENTRIES) {
      issues.push(`dist: entry count exceeds ${MAX_ENTRIES}`);
      walkBlocked = true;
      break;
    }
    names.push(entry.name);
  }
  const paths = [];
  for (const name of names.sort()) {
    if (walkBlocked) break;
    const path = resolve(directory, name);
    const displayName = relative(root, path).replaceAll("\\", "/");
    const entry = await lstat(path);
    if (!isCanonicalPath(displayName)) issues.push(`${displayName}: path is not portable ASCII repository-relative`);
    if (entry.isSymbolicLink()) issues.push(`${displayName}: symlink must not ship`);
    else if (entry.isDirectory()) paths.push(...(await walk(path, depth + 1)));
    else if (!entry.isFile()) issues.push(`${displayName}: non-regular entry must not ship`);
    else {
      fileCount += 1;
      declaredBytes += entry.size;
      if (fileCount > MAX_FILES) issues.push(`dist: file count exceeds ${MAX_FILES}`);
      else if (declaredBytes > MAX_RELEASE_BYTES) issues.push(`dist: release byte budget exceeds ${MAX_RELEASE_BYTES}`);
      else paths.push(path);
      if (fileCount > MAX_FILES || declaredBytes > MAX_RELEASE_BYTES) walkBlocked = true;
    }
  }
  return paths;
}

let files = [];
try {
  const rootEntry = await lstat(root);
  if (rootEntry.isSymbolicLink() || !rootEntry.isDirectory()) issues.push("dist: expected a real directory");
  else files = await walk(root);
} catch (error) {
  issues.push(`dist: unreadable root (${errorText(error)})`);
}
files.sort();

const manifest = [];
const textFiles = new Map();
let actualBytes = 0;
for (const path of files) {
  const name = relative(root, path).replaceAll("\\", "/");
  let bytes;
  try {
    bytes = await readBounded(path, name, MAX_RELEASE_BYTES - actualBytes);
  } catch (error) {
    issues.push(`${name}: unreadable file (${errorText(error)})`);
    continue;
  }
  actualBytes += bytes.byteLength;
  if (actualBytes > MAX_RELEASE_BYTES) issues.push(`dist: release byte budget exceeds ${MAX_RELEASE_BYTES}`);
  if (name.toLowerCase().endsWith(".map")) issues.push(`${name}: source map must not ship`);
  if (textExtensions.has(extname(name).toLowerCase())) {
    try {
      const text = decoder.decode(bytes);
      textFiles.set(name, text);
      for (const [code, pattern] of forbidden) if (pattern.test(text)) issues.push(`${name}: ${code}`);
    } catch (error) {
      issues.push(`${name}: invalid UTF-8 (${errorText(error)})`);
    }
  }
  manifest.push({
    path: name,
    bytes: bytes.byteLength,
    sha256: createHash("sha256").update(bytes).digest("hex").toUpperCase(),
  });
}
manifest.sort((left, right) => left.path < right.path ? -1 : left.path > right.path ? 1 : 0);
if (new Set(manifest.map((item) => item.path.toLowerCase())).size !== manifest.length) issues.push("dist: paths must be case-insensitively unique");
const releasePaths = manifest.map((item) => item.path);
const stylesheetPaths = releasePaths.filter((path) => /^assets\/index-[A-Za-z0-9_-]+\.css$/.test(path));
const scriptPaths = releasePaths.filter((path) => /^assets\/index-[A-Za-z0-9_-]+\.js$/.test(path));
if (entryCount !== 4 || releasePaths.length !== 3 || stylesheetPaths.length !== 1 || scriptPaths.length !== 1 || !releasePaths.includes("index.html")) issues.push("dist: unexpected release output shape");
const stylesheetPath = stylesheetPaths[0] ?? "";
const scriptPath = scriptPaths[0] ?? "";

if (manifestPath !== undefined) {
  let expected;
  try {
    const raw = await readBounded(resolve(manifestPath), "manifest", MAX_MANIFEST_BYTES);
    expected = parseStrictJson(decoder.decode(raw));
  } catch (error) {
    issues.push(`${manifestPath}: unreadable manifest (${errorText(error)})`);
  }
  if (expected !== undefined && exactKeys(expected, ["schemaVersion", "releaseVersion", "artifactName", "sourceProvenance", "build", "files"], "manifest")) {
    if (expected.schemaVersion !== 1) issues.push("manifest: schemaVersion must be 1");
    if (typeof expected.releaseVersion !== "string" || expected.releaseVersion.length === 0) issues.push("manifest: releaseVersion must be a nonempty string");
    if (!isCanonicalPath(expected.artifactName) || expected.artifactName.includes("/")) issues.push("manifest: artifactName must be one portable ASCII filename");
    if (expected.artifactName !== `phrasegarden-${expected.releaseVersion}-pages.zip`) issues.push("manifest: artifactName does not match releaseVersion");
    if (exactKeys(expected.sourceProvenance, ["kind", "gitCommit", "statement"], "manifest.sourceProvenance")) {
      if (expected.sourceProvenance.kind !== "git-commit") issues.push("manifest.sourceProvenance: kind must be git-commit");
      if (typeof expected.sourceProvenance.gitCommit !== "string" || !/^[0-9a-f]{40}$/.test(expected.sourceProvenance.gitCommit)) issues.push("manifest.sourceProvenance: gitCommit must be 40 lowercase hexadecimal characters");
      if (typeof expected.sourceProvenance.statement !== "string" || expected.sourceProvenance.statement.length === 0) issues.push("manifest.sourceProvenance: statement must be nonempty");
    }
    if (exactKeys(expected.build, ["command", "base", "sourceMaps"], "manifest.build") && (expected.build.command !== "pnpm build" || expected.build.base !== "./" || expected.build.sourceMaps !== false)) issues.push("manifest.build: unsupported build identity");
    if (!Array.isArray(expected.files)) issues.push("manifest.files: expected array");
    else {
      const expectedFiles = [];
      let expectedBytes = 0;
      for (const [index, item] of expected.files.entries()) {
        const label = `manifest.files[${index}]`;
        if (!exactKeys(item, ["path", "bytes", "sha256"], label)) continue;
        if (!isCanonicalPath(item.path)) issues.push(`${label}: path is not portable ASCII repository-relative`);
        if (!Number.isSafeInteger(item.bytes) || item.bytes < 0) issues.push(`${label}: bytes must be a nonnegative safe integer`);
        else expectedBytes += item.bytes;
        if (typeof item.sha256 !== "string" || !/^[0-9A-F]{64}$/.test(item.sha256)) issues.push(`${label}: sha256 must be uppercase hexadecimal`);
        expectedFiles.push({ path: item.path, bytes: item.bytes, sha256: item.sha256 });
      }
      const expectedPaths = expectedFiles.map((item) => item.path);
      if (expectedFiles.length === 0 || expectedFiles.length > MAX_FILES) issues.push(`manifest.files: count must be between 1 and ${MAX_FILES}`);
      if (expectedBytes > MAX_RELEASE_BYTES) issues.push(`manifest.files: release byte budget exceeds ${MAX_RELEASE_BYTES}`);
      if (JSON.stringify(expectedPaths) !== JSON.stringify([...expectedPaths].sort())) issues.push("manifest.files: paths must be sorted");
      if (new Set(expectedPaths).size !== expectedPaths.length || new Set(expectedPaths.map((path) => typeof path === "string" ? path.toLowerCase() : path)).size !== expectedPaths.length) issues.push("manifest.files: paths must be case-insensitively unique");
      if (JSON.stringify(expectedFiles) !== JSON.stringify(manifest)) issues.push("manifest.files: dist path, length, or SHA-256 mismatch");
    }
  }
}

const index = textFiles.get("index.html");
if (index === undefined) issues.push("index.html: unreadable or missing UTF-8 file");
else {
  const expectedIndex = [
    "<!doctype html>",
    '<html lang="en" dir="ltr">',
    "  <head>",
    '    <meta charset="UTF-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    "    <meta",
    '      http-equiv="Content-Security-Policy"',
    '      content="default-src \'self\'; script-src \'self\'; style-src \'self\'; img-src \'self\'; font-src \'self\'; connect-src \'none\'; object-src \'none\'; base-uri \'self\'; form-action \'none\'; worker-src \'none\'"',
    "    />",
    '    <meta name="theme-color" content="#F7F3EA" />',
    "    <meta",
    '      name="description"',
    '      content="Build readable, portable language-learning and translation prompts locally with PhraseGarden."',
    "    />",
    "    <title>PhraseGarden · Portable language prompts</title>",
    `    <script type="module" crossorigin src="./${scriptPath}"></script>`,
    `    <link rel="stylesheet" crossorigin href="./${stylesheetPath}">`,
    "  </head>",
    "  <body>",
    '    <div id="app"></div>',
    "  </body>",
    "</html>",
    "",
  ].join("\n");
  if (index !== expectedIndex) issues.push("index.html: does not match canonical release document");
}

if (issues.length > 0) {
  console.error(issues.join("\n"));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ ok: true, root: "dist", files: manifest }, null, 2));
}
