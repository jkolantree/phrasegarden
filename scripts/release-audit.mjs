import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";

const root = resolve("dist");
const textExtensions = new Set([".css", ".html", ".js", ".json", ".txt"]);
const forbidden = [
  ["source-map-reference", /sourceMappingURL/i],
  ["private-codex-path", /(?:^|[\\/])\.codex(?:[\\/]|$)|attachments[\\/]/i],
  ["absolute-user-path", /[A-Za-z]:[\\/](?:Users|Documents)[\\/]/i],
  [
    "tracker-or-cdn",
    /google-analytics|googletagmanager|fonts\.googleapis|use\.typekit|segment\.com|sentry\.io|plausible\.io|unpkg\.com|jsdelivr\.net/i,
  ],
  ["remote-html-asset", /(?:src|href)\s*=\s*["']https?:\/\//i],
  ["remote-css-asset", /url\(\s*["']?https?:\/\//i],
];

async function walk(directory) {
  const names = await readdir(directory);
  const paths = [];
  for (const name of names.sort()) {
    const path = resolve(directory, name);
    if ((await stat(path)).isDirectory()) {
      paths.push(...(await walk(path)));
    } else {
      paths.push(path);
    }
  }
  return paths;
}

const files = await walk(root);
const issues = [];
const manifest = [];

for (const path of files) {
  const name = relative(root, path).replaceAll("\\", "/");
  const bytes = await readFile(path);
  if (name.endsWith(".map")) {
    issues.push(`${name}: source map must not ship`);
  }
  if (textExtensions.has(extname(name))) {
    const text = bytes.toString("utf8");
    for (const [code, pattern] of forbidden) {
      if (pattern.test(text)) {
        issues.push(`${name}: ${code}`);
      }
    }
  }
  manifest.push({
    path: name,
    bytes: bytes.byteLength,
    sha256: createHash("sha256").update(bytes).digest("hex").toUpperCase(),
  });
}

const index = await readFile(resolve(root, "index.html"), "utf8");
for (const requirement of [
  "Content-Security-Policy",
  "connect-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
]) {
  if (!index.includes(requirement)) {
    issues.push(`index.html: missing ${requirement}`);
  }
}

if (issues.length > 0) {
  console.error(issues.join("\n"));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ ok: true, root: "dist", files: manifest }, null, 2));
}

