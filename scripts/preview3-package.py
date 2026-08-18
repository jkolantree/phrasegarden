#!/usr/bin/env python3
"""Deterministic local source identity and Preview 3 packaging commands."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import stat
import subprocess
import sys

SOURCE_MANIFEST = Path("artifacts/release/preview3-source-manifest.json")
SOURCE_KIND = "phrasegarden-source-freeze"
GIT_SHA = re.compile(r"^[0-9a-f]{40}$")
PORTABLE_PATH = re.compile(r"^[A-Za-z0-9._/-]+$")
MAX_FILES = 512
MAX_TREES = 512
MAX_TREE_DEPTH = 32
MAX_BLOB_BYTES = 8 * 1024 * 1024
MAX_TOTAL_BYTES = 32 * 1024 * 1024
MAX_MANIFEST_BYTES = 1024 * 1024
MAX_GIT_OUTPUT_BYTES = 1024 * 1024
READ_CHUNK_BYTES = 64 * 1024
WINDOWS_RESERVED = {
    "AUX", "CON", "NUL", "PRN",
    *(f"COM{index}" for index in range(1, 10)),
    *(f"LPT{index}" for index in range(1, 10)),
}
GIT_ENV_NAMES = {
    "GIT_ALTERNATE_OBJECT_DIRECTORIES", "GIT_CEILING_DIRECTORIES",
    "GIT_COMMON_DIR", "GIT_CONFIG", "GIT_DIR", "GIT_EXEC_PATH",
    "GIT_GLOB_PATHSPECS", "GIT_ICASE_PATHSPECS", "GIT_INDEX_FILE",
    "GIT_LITERAL_PATHSPECS", "GIT_NAMESPACE", "GIT_NOGLOB_PATHSPECS",
    "GIT_OBJECT_DIRECTORY", "GIT_PREFIX", "GIT_QUARANTINE_PATH",
    "GIT_REPLACE_REF_BASE", "GIT_SHALLOW_FILE", "GIT_WORK_TREE",
}

class ToolError(Exception):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code

def fail(code: str, message: str) -> None:
    raise ToolError(code, message)

def sha256(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest().upper()


def run_bounded(
    command: list[str], limit: int, *, allowed: tuple[int, ...] = (0,),
    env: dict[str, str] | None = None, input_bytes: bytes | None = None,
) -> tuple[bytes, int]:
    process = subprocess.Popen(
        command, stdin=subprocess.PIPE if input_bytes is not None else subprocess.DEVNULL,
        stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, env=env,
    )
    if input_bytes is not None:
        assert process.stdin is not None
        process.stdin.write(input_bytes)
        process.stdin.close()
    assert process.stdout is not None
    output = process.stdout.read(limit + 1)
    process.stdout.close()
    if len(output) > limit:
        process.kill()
        process.wait()
        fail("E-GIT-OUTPUT-LIMIT", "Git output byte budget exceeded")
    result = process.wait()
    if result not in allowed:
        fail("E-GIT", f"Git command failed with status {result}")
    return output, result

def git(arguments: list[str], limit: int = MAX_GIT_OUTPUT_BYTES,
        *, allowed: tuple[int, ...] = (0,),
        input_bytes: bytes | None = None) -> tuple[bytes, int]:
    environment = os.environ.copy()
    for name in list(environment):
        upper = name.upper()
        if (upper == "GIT_CONFIG_PARAMETERS" or upper.startswith("GIT_CONFIG_")
                or upper.startswith("GIT_TRACE")):
            environment.pop(name)
    environment.update({"GIT_NO_LAZY_FETCH": "1", "GIT_NO_REPLACE_OBJECTS": "1",
                        "GIT_TERMINAL_PROMPT": "0", "GIT_CONFIG_NOSYSTEM": "1",
                        "GIT_CONFIG_GLOBAL": os.devnull, "GIT_OPTIONAL_LOCKS": "0",
                        "GIT_ALLOW_PROTOCOL": "file"})
    return run_bounded(
        ["git", "--no-replace-objects", "-c", "core.fsmonitor=false",
         "-c", f"core.excludesFile={os.devnull}", *arguments],
        limit, allowed=allowed, env=environment, input_bytes=input_bytes,
    )

def validate_git_environment() -> None:
    for name in os.environ:
        if name.upper() in GIT_ENV_NAMES:
            fail("E-GIT-ENV", f"repository-redirecting environment is set: {name}")

def reject_config_indirection(root: Path) -> None:
    git_dir = root / ".git"
    try:
        metadata = git_dir.lstat()
    except FileNotFoundError:
        fail("E-REPOSITORY", "repository root must contain a physical .git directory")
    if not stat.S_ISDIR(metadata.st_mode) or is_reparse(metadata):
        fail("E-REPOSITORY", "repository root must contain a physical .git directory")
    try:
        (git_dir / "commondir").lstat()
    except FileNotFoundError:
        pass
    else:
        fail("E-GIT-COMMONDIR", "redirected common Git directories are not allowed")
    for name, required in (("config", True), ("config.worktree", False)):
        path = git_dir / name
        try:
            path.lstat()
        except FileNotFoundError:
            if not required:
                continue
            fail("E-GIT-CONFIG", "required local Git config is missing")
        raw = read_regular(path, MAX_GIT_OUTPUT_BYTES, "E-GIT-CONFIG")
        scanned = raw[3:] if raw.startswith(b"\xef\xbb\xbf") else raw
        if (re.search(rb"(?im)^[ \t]*\[[ \t]*include(?:if)?(?=[. \t\"\]])", scanned)
                or re.search(rb"(?im)^[ \t]*excludesfile[ \t]*=", scanned)):
            fail("E-GIT-CONFIG-INDIRECTION",
                 "Git config includes and external excludes are not allowed")

def canonical_repo_path(value: str) -> str:
    if (not value or value.startswith("/") or "\\" in value
            or any(character in value for character in "?#")
            or PORTABLE_PATH.fullmatch(value) is None):
        fail("E-SOURCE-PATH", "path is not portable ASCII repository-relative")
    parts = value.split("/")
    if any(part in {"", ".", ".."} for part in parts):
        fail("E-SOURCE-PATH", "path contains a noncanonical segment")
    for part in parts:
        if part.endswith((" ", ".")) or part.split(".", 1)[0].upper() in WINDOWS_RESERVED:
            fail("E-SOURCE-PATH", "path contains a nonportable component")
    if str(PurePosixPath(value)) != value:
        fail("E-SOURCE-PATH", "path is not canonical POSIX")
    return value

def validate_paths(paths: list[str]) -> list[str]:
    checked = sorted(canonical_repo_path(path) for path in paths)
    if len(checked) != len(set(checked)):
        fail("E-SOURCE-PATH-DUPLICATE", "source paths must be unique")
    folded = [path.lower() for path in checked]
    if len(folded) != len(set(folded)):
        fail("E-SOURCE-PATH-COLLISION", "source paths collide case-insensitively")
    return checked

def git_object_size(kind: str, object_id: str, limit: int) -> int:
    if GIT_SHA.fullmatch(object_id) is None:
        fail("E-GIT-OBJECT", "Git object ID is not exact SHA-1")
    actual_kind, _ = git(["cat-file", "-t", object_id], 16)
    if actual_kind != f"{kind}\n".encode("ascii"):
        fail("E-GIT-OBJECT", f"Git object is not an exact {kind}")
    raw_size, _ = git(["cat-file", "-s", object_id], 32)
    if re.fullmatch(rb"(?:0|[1-9][0-9]*)\n", raw_size) is None:
        fail("E-GIT-OBJECT", "Git object size is not canonical decimal")
    size = int(raw_size)
    if size > limit:
        fail(f"E-SOURCE-{kind.upper()}-LIMIT", f"{kind} byte budget exceeded")
    return size

def git_object(kind: str, object_id: str, limit: int,
               expected_size: int | None = None) -> bytes:
    size = git_object_size(kind, object_id, limit) if expected_size is None else expected_size
    if size < 0 or size > limit:
        fail(f"E-SOURCE-{kind.upper()}-LIMIT", f"{kind} byte budget exceeded")
    value, _ = git(["cat-file", kind, object_id], size)
    if len(value) != size:
        fail("E-GIT-OBJECT", f"{kind} bytes do not match their declared size")
    header = f"{kind} {len(value)}\0".encode("ascii")
    if hashlib.sha1(header + value, usedforsecurity=False).hexdigest() != object_id:
        fail("E-GIT-OBJECT", f"{kind} bytes do not match their Git object ID")
    return value

def commit_tree(source_commit: str) -> str:
    value = git_object("commit", source_commit, MAX_GIT_OUTPUT_BYTES)
    match = re.match(rb"tree ([0-9a-f]{40})\n", value)
    if match is None:
        fail("E-SOURCE-COMMIT", "commit has no exact leading tree identity")
    return match.group(1).decode("ascii")

def reject_external_objects(root: Path) -> None:
    for name in ("objects/info/alternates", "objects/info/http-alternates"):
        raw, _ = git(["rev-parse", "--git-path", name])
        path = Path(raw.rstrip(b"\r\n").decode("utf-8"))
        if not path.is_absolute():
            path = root / path
        try:
            path.lstat()
        except FileNotFoundError:
            continue
        fail("E-GIT-ALTERNATES", "external Git object storage is not allowed")
    partial, _ = git(
        ["config", "--get-regexp",
         r"^(extensions\.partialclone|remote\..*\.promisor)$"], allowed=(0, 1)
    )
    if partial:
        fail("E-GIT-PARTIAL", "partial-clone object storage is not allowed")

def require_output_policy(source_commit: str) -> None:
    path = SOURCE_MANIFEST.as_posix().encode("ascii")
    tracked, _ = git(["ls-tree", "-z", source_commit, "--", path.decode()])
    if tracked:
        fail("E-SOURCE-OUTPUT-TRACKED", "source manifest path is tracked")
    ignored, result = git(
        ["check-ignore", "--stdin", "-z", "-v", "--no-index"],
        allowed=(0, 1), input_bytes=path + b"\0",
    )
    fields = ignored.split(b"\0")
    if (result != 0 or len(fields) != 5 or fields[-1] != b""
            or fields[0] != b".gitignore" or not fields[1].isdigit()
            or fields[3] != path):
        fail("E-SOURCE-OUTPUT-IGNORE", "output must use the committed root ignore")
    root_ignore, _ = git(["ls-tree", "-z", source_commit, "--", ".gitignore"])
    if not re.fullmatch(rb"100644 blob [0-9a-f]{40}\t\.gitignore\0", root_ignore):
        fail("E-SOURCE-OUTPUT-IGNORE", "root .gitignore must be a 100644 source blob")

def require_repository(source_commit: str) -> tuple[Path, str]:
    validate_git_environment()
    if GIT_SHA.fullmatch(source_commit) is None:
        fail("E-SOURCE-COMMIT", "source commit must be 40 lowercase hex characters")
    expected_root = Path.cwd().resolve()
    reject_config_indirection(expected_root)
    raw_root, _ = git(["rev-parse", "--show-toplevel"])
    root = Path(raw_root.rstrip(b"\r\n").decode("utf-8")).resolve()
    if os.path.normcase(str(root)) != os.path.normcase(str(expected_root)):
        fail("E-REPOSITORY", "command must run at the repository root")
    raw_head, _ = git(["rev-parse", "--verify", "HEAD"])
    head = raw_head.rstrip(b"\r\n").decode("ascii")
    if source_commit != head:
        fail("E-SOURCE-NOT-HEAD", "source commit must equal exact HEAD")
    untracked, _ = git(["ls-files", "--others", "--exclude-standard", "-z"])
    if untracked:
        fail("E-SOURCE-DIRTY", "nonignored untracked paths are not allowed")
    reject_external_objects(root)
    require_output_policy(source_commit)
    return root, commit_tree(source_commit)

def source_entries(source_tree: str) -> list[tuple[str, str, int, str]]:
    entries: dict[str, tuple[str, int, str]] = {}
    tree_count = total = 0
    def visit(tree_id: str, prefix: str, depth: int) -> None:
        nonlocal tree_count, total
        tree_count += 1
        if depth > MAX_TREE_DEPTH or tree_count > MAX_TREES:
            fail("E-SOURCE-TREE-LIMIT", "source tree depth/count budget exceeded")
        raw = git_object("tree", tree_id, MAX_GIT_OUTPUT_BYTES)
        offset = 0
        siblings: set[str] = set()
        while offset < len(raw):
            space = raw.find(b" ", offset)
            nul = raw.find(b"\0", space + 1)
            if space < 0 or nul < 0 or nul + 21 > len(raw):
                fail("E-SOURCE-TREE", "raw tree record is malformed")
            mode, raw_name = raw[offset:space], raw[space + 1:nul]
            if not raw_name or b"/" in raw_name:
                fail("E-SOURCE-TREE", "raw tree name is not one component")
            try:
                name = raw_name.decode("ascii")
            except UnicodeDecodeError:
                fail("E-SOURCE-TREE", "raw tree name is non-ASCII")
            object_id = raw[nul + 1:nul + 21].hex()
            offset = nul + 21
            if name.lower() in siblings:
                fail("E-SOURCE-PATH-COLLISION", "sibling tree names collide")
            siblings.add(name.lower())
            path = canonical_repo_path(f"{prefix}/{name}" if prefix else name)
            if mode == b"40000":
                visit(object_id, path, depth + 1)
            elif mode == b"100644":
                if path in entries:
                    fail("E-SOURCE-PATH-DUPLICATE", "source paths must be unique")
                if len(entries) >= MAX_FILES:
                    fail("E-SOURCE-FILE-LIMIT", "source file-count budget exceeded")
                size = git_object_size("blob", object_id, MAX_BLOB_BYTES)
                if size > MAX_TOTAL_BYTES - total:
                    fail("E-SOURCE-TOTAL-LIMIT", "source total-byte budget exceeded")
                value = git_object("blob", object_id, MAX_BLOB_BYTES, size)
                total += size
                entries[path] = (object_id, size, sha256(value))
            else:
                fail("E-SOURCE-MODE", "source entries must be regular 100644 blobs")
    visit(source_tree, "", 0)
    paths = validate_paths(list(entries))
    if SOURCE_MANIFEST.as_posix().lower() in {path.lower() for path in entries}:
        fail("E-SOURCE-OUTPUT-TRACKED", "source manifest path is tracked")
    return [(path, *entries[path]) for path in paths]

def is_reparse(metadata: os.stat_result) -> bool:
    return stat.S_ISLNK(metadata.st_mode) or bool(
        getattr(metadata, "st_file_attributes", 0)
        & getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 0)
    )

def require_directories(root: Path, parts: tuple[str, ...], *, create: bool) -> None:
    current = root
    for part in (None, *parts):
        if part is not None:
            current /= part
        try:
            metadata = current.lstat()
        except FileNotFoundError:
            if not create:
                fail("E-SOURCE-PATH-MISSING", "required directory is missing")
            current.mkdir()
            metadata = current.lstat()
        if not stat.S_ISDIR(metadata.st_mode) or is_reparse(metadata):
            fail("E-SOURCE-PATH-PHYSICAL", "directory chain must be physical")

def read_regular(path: Path, limit: int, code: str) -> bytes:
    try:
        metadata = path.lstat()
    except FileNotFoundError:
        fail(code, "required regular file is missing")
    if not stat.S_ISREG(metadata.st_mode) or is_reparse(metadata) or metadata.st_size > limit:
        fail(code, "required regular file is invalid or over budget")
    with path.open("rb") as stream:
        opened = os.fstat(stream.fileno())
        if (opened.st_dev, opened.st_ino) != (metadata.st_dev, metadata.st_ino):
            fail(code, "regular file identity changed before read")
        value = stream.read(limit + 1)
    after = path.lstat()
    if (after.st_dev, after.st_ino) != (metadata.st_dev, metadata.st_ino):
        fail(code, "regular file identity changed during read")
    if len(value) > limit:
        fail(code, "required regular file exceeds its byte budget")
    return value

def qualify_checkout(root: Path, entries: list[tuple[str, str, int, str]]) -> None:
    raw, _ = git(["ls-files", "-s", "-v", "-z"])
    index: dict[str, str] = {}
    for record in raw.split(b"\0")[:-1]:
        try:
            tag, rest = record.split(b" ", 1)
            header, raw_path = rest.split(b"\t", 1)
            mode, object_id, stage = header.split()
            path = raw_path.decode("ascii")
        except (ValueError, UnicodeDecodeError):
            fail("E-SOURCE-INDEX", "index record is malformed")
        if tag != b"H" or mode != b"100644" or stage != b"0":
            fail("E-SOURCE-INDEX", "index mode, stage, or concealment flag is invalid")
        index[path] = object_id.decode("ascii")
    expected = {path: object_id for path, object_id, _, _ in entries}
    if index != expected:
        fail("E-SOURCE-INDEX", "index does not exactly match the source tree")
    checked: set[tuple[str, ...]] = set()
    for path, _, size, digest in entries:
        posix = PurePosixPath(path)
        parents = tuple(posix.parts[:-1])
        if parents not in checked:
            require_directories(root, parents, create=False)
            checked.add(parents)
        value = read_regular(root.joinpath(*posix.parts), MAX_BLOB_BYTES,
                             "E-SOURCE-WORKTREE")
        if len(value) != size or sha256(value) != digest:
            fail("E-SOURCE-WORKTREE", f"raw worktree bytes differ: {path}")

def build_source_manifest(source_commit: str) -> tuple[bytes, dict[str, object]]:
    root, source_tree = require_repository(source_commit)
    entries = source_entries(source_tree)
    qualify_checkout(root, entries)
    final_root, final_tree = require_repository(source_commit)
    final_entries = source_entries(final_tree)
    if final_tree != source_tree or final_entries != entries:
        fail("E-SOURCE-DRIFT", "source identity changed during construction")
    qualify_checkout(final_root, final_entries)
    files = [{"path": path, "mode": "100644", "bytes": size, "sha256": digest}
             for path, _, size, digest in entries]
    manifest: dict[str, object] = {
        "schemaVersion": 1,
        "kind": SOURCE_KIND,
        "sourceCommit": source_commit,
        "sourceTree": source_tree,
        "files": files,
    }
    encoded = (json.dumps(manifest, ensure_ascii=True, indent=2,
                          separators=(",", ": ")) + "\n").encode("utf-8")
    if len(encoded) > MAX_MANIFEST_BYTES:
        fail("E-SOURCE-MANIFEST-LIMIT", "source manifest byte budget exceeded")
    return encoded, manifest

def report(encoded: bytes, manifest: dict[str, object], status_text: str) -> None:
    value = {
        "status": status_text,
        "manifestPath": SOURCE_MANIFEST.as_posix(),
        "bytes": len(encoded),
        "sha256": sha256(encoded),
        "files": len(manifest["files"]),
        "sourceCommit": manifest["sourceCommit"],
        "sourceTree": manifest["sourceTree"],
    }
    sys.stdout.write(json.dumps(value, separators=(",", ":")) + "\n")

def freeze_source(source_commit: str) -> None:
    encoded, manifest = build_source_manifest(source_commit)
    root = Path.cwd()
    require_directories(root, SOURCE_MANIFEST.parent.parts, create=True)
    output = root / SOURCE_MANIFEST
    try:
        with output.open("xb") as stream:
            stream.write(encoded)
            stream.flush()
            os.fsync(stream.fileno())
    except FileExistsError:
        fail("E-SOURCE-OUTPUT-EXISTS", "source manifest already exists")
    except OSError:
        fail("E-SOURCE-OUTPUT-WRITE", "write failed; blocking evidence was retained")
    require_directories(root, SOURCE_MANIFEST.parent.parts, create=False)
    if read_regular(output, MAX_MANIFEST_BYTES, "E-SOURCE-MANIFEST-FILE") != encoded:
        fail("E-SOURCE-OUTPUT-WRITE", "written source manifest bytes changed")
    report(encoded, manifest, "created")

def verify_source(source_commit: str) -> None:
    encoded, manifest = build_source_manifest(source_commit)
    require_directories(Path.cwd(), SOURCE_MANIFEST.parent.parts, create=False)
    if read_regular(Path.cwd() / SOURCE_MANIFEST, MAX_MANIFEST_BYTES,
                    "E-SOURCE-MANIFEST-FILE") != encoded:
        fail("E-SOURCE-MANIFEST-MISMATCH", "source manifest bytes do not match source")
    require_directories(Path.cwd(), SOURCE_MANIFEST.parent.parts, create=False)
    report(encoded, manifest, "verified")

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, allow_abbrev=False)
    commands = parser.add_subparsers(dest="command", required=True)
    for name in ("freeze-source", "verify-source"):
        command = commands.add_parser(name, allow_abbrev=False)
        command.add_argument("--source-commit", required=True)
    arguments = parser.parse_args()
    try:
        if arguments.command == "freeze-source":
            freeze_source(arguments.source_commit)
        else:
            verify_source(arguments.source_commit)
    except ToolError as error:
        sys.stderr.write(f"{error.code}: {error}\n")
        return 1
    except (OSError, UnicodeError, ValueError):
        sys.stderr.write("E-BOUNDARY: local source boundary operation failed\n")
        return 1
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
