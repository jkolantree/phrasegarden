#!/usr/bin/env python3
"""Deterministic local source identity and closed-version packaging commands."""

from __future__ import annotations

import argparse
from dataclasses import dataclass
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import stat
import subprocess
import sys
from types import MappingProxyType
from typing import Mapping
from zipfile import BadZipFile, ZIP_STORED, ZipFile, ZipInfo

SOURCE_KIND = "phrasegarden-source-freeze"
CHECKSUM_LEDGER = Path("SHA256SUMS")
DIST_ROOT = Path("dist")
BUILD_STATEMENT = (
    "Records the declared source commit and distributable byte inventory; this "
    "manifest does not establish build qualification or a packaging commit."
)
GIT_SHA = re.compile(r"^[0-9a-f]{40}$")
PORTABLE_PATH = re.compile(r"^[A-Za-z0-9._/-]+$")
MAX_FILES = 512
MAX_TREES = 512
MAX_TREE_DEPTH = 32
MAX_BLOB_BYTES = 8 * 1024 * 1024
MAX_TOTAL_BYTES = 32 * 1024 * 1024
MAX_MANIFEST_BYTES = 1024 * 1024
MAX_PACKAGE_JSON_BYTES = 256 * 1024
MAX_GIT_OUTPUT_BYTES = 1024 * 1024
MAX_GIT_OBJECT_ENTRIES = 65536
MAX_GIT_OBJECT_DEPTH = 8
MAX_PACKAGE_FILES = 64
MAX_PACKAGE_ENTRIES = 128
MAX_PACKAGE_DEPTH = 16
MAX_RELEASE_BYTES = 5 * 1024 * 1024
MAX_ARCHIVE_BYTES = MAX_RELEASE_BYTES + 256 * 1024
MAX_RELEASE_MANIFEST_BYTES = 256 * 1024
MAX_LEDGER_BYTES = 64 * 1024
READ_CHUNK_BYTES = 64 * 1024
ZIP_TIMESTAMP = (1980, 1, 1, 0, 0, 0)
ASSET_NAME = re.compile(r"^index-[A-Za-z0-9_-]+\.(?:css|js)$")
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

@dataclass(frozen=True, slots=True)
class ReleaseSpec:
    id: str
    release_version: str
    required_package_version: str
    source_manifest: Path
    stage_root: Path
    final_archive: Path
    final_manifest: Path
    evidence_path: Path
    publication_contract: Path
    parent_ledger_binding: tuple[int, str] | None = None
    predecessor_bindings: tuple[tuple[Path, int, str], ...] = ()

    @property
    def predecessor_paths(self) -> tuple[Path, ...]:
        return tuple(binding[0] for binding in self.predecessor_bindings)

    @property
    def archive_name(self) -> str:
        return self.final_archive.name

    @property
    def manifest_name(self) -> str:
        return self.final_manifest.name

    @property
    def stage_archive(self) -> Path:
        return self.stage_root / "release" / self.archive_name

    @property
    def stage_manifest(self) -> Path:
        return self.stage_root / "release" / self.manifest_name

    @property
    def stage_ledger(self) -> Path:
        return self.stage_root / CHECKSUM_LEDGER

    @property
    def packaging_paths(self) -> tuple[str, ...]:
        return (
            CHECKSUM_LEDGER.as_posix(),
            "docs/PROJECT-STATE.md",
            "docs/TRACEABILITY.md",
            self.evidence_path.as_posix(),
            self.publication_contract.as_posix(),
            self.final_manifest.as_posix(),
            self.final_archive.as_posix(),
        )

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

def make_release_spec(spec_id: str, version: str, *,
                      parent_ledger_binding: tuple[int, str] | None = None,
                      predecessor_bindings: tuple[tuple[Path, int, str], ...] = ()) -> ReleaseSpec:
    archive_name = f"phrasegarden-{version}-pages.zip"
    manifest_name = f"phrasegarden-{version}-pages-manifest.json"
    return ReleaseSpec(
        id=spec_id,
        release_version=version,
        required_package_version=version,
        source_manifest=Path(f"artifacts/release/{spec_id}-source-manifest.json"),
        stage_root=Path(f"artifacts/release/{spec_id}-package-stage"),
        final_archive=Path("release") / archive_name,
        final_manifest=Path("release") / manifest_name,
        evidence_path=Path(f"docs/evidence/releases/{version}.md"),
        publication_contract=Path(
            f"docs/work-packages/{spec_id.upper().replace('PREVIEW', 'PREVIEW-')}-PUBLICATION.md"
        ),
        parent_ledger_binding=parent_ledger_binding,
        predecessor_bindings=predecessor_bindings,
    )

CLOSED_SPEC_PATHS = {
    "preview3": ("artifacts/release/preview3-source-manifest.json",
                 "artifacts/release/preview3-package-stage",
                 "release/phrasegarden-0.1.0-preview.3-pages.zip",
                 "release/phrasegarden-0.1.0-preview.3-pages-manifest.json",
                 "docs/evidence/releases/0.1.0-preview.3.md",
                 "docs/work-packages/PREVIEW-3-PUBLICATION.md"),
    "preview4": ("artifacts/release/preview4-source-manifest.json",
                 "artifacts/release/preview4-package-stage",
                 "release/phrasegarden-0.1.0-preview.4-pages.zip",
                 "release/phrasegarden-0.1.0-preview.4-pages-manifest.json",
                 "docs/evidence/releases/0.1.0-preview.4.md",
                 "docs/work-packages/PREVIEW-4-PUBLICATION.md"),
    "preview5": ("artifacts/release/preview5-source-manifest.json",
                 "artifacts/release/preview5-package-stage",
                 "release/phrasegarden-0.1.0-preview.5-pages.zip",
                 "release/phrasegarden-0.1.0-preview.5-pages-manifest.json",
                 "docs/evidence/releases/0.1.0-preview.5.md",
                 "docs/work-packages/PREVIEW-5-PUBLICATION.md"),
    "preview6": ("artifacts/release/preview6-source-manifest.json",
                 "artifacts/release/preview6-package-stage",
                 "release/phrasegarden-0.1.0-preview.6-pages.zip",
                 "release/phrasegarden-0.1.0-preview.6-pages-manifest.json",
                 "docs/evidence/releases/0.1.0-preview.6.md",
                 "docs/work-packages/PREVIEW-6-PUBLICATION.md"),
}

def validate_release_specs(specs: Mapping[str, ReleaseSpec]) -> None:
    if tuple(specs) != ("preview3", "preview4", "preview5", "preview6"):
        fail("E-RELEASE-SPEC", "release specification IDs are not exact")
    expected = (("preview3", "0.1.0-preview.3"),
                ("preview4", "0.1.0-preview.4"),
                ("preview5", "0.1.0-preview.5"),
                ("preview6", "0.1.0-preview.6"))
    identity_paths: list[str] = []
    for (spec_id, version), (key, spec) in zip(expected, specs.items(), strict=True):
        if (key != spec_id or spec.id != spec_id
                or spec.release_version != version
                or spec.required_package_version != version
                or spec.archive_name != f"phrasegarden-{version}-pages.zip"
                or spec.manifest_name != f"phrasegarden-{version}-pages-manifest.json"
                or spec.stage_archive.parent != spec.stage_root / "release"
                or spec.stage_manifest.parent != spec.stage_root / "release"
                or len(spec.packaging_paths) != 7):
            fail("E-RELEASE-SPEC", "release specification identity is invalid")
        paths = (
            spec.source_manifest, spec.stage_root, spec.final_archive,
            spec.final_manifest, spec.evidence_path, spec.publication_contract,
        )
        if tuple(path.as_posix() for path in paths) != CLOSED_SPEC_PATHS[spec_id]:
            fail("E-RELEASE-SPEC", "release specification path identity is invalid")
        try:
            identity_paths.extend(canonical_repo_path(path.as_posix()) for path in paths)
            validate_paths(list(spec.packaging_paths))
        except ToolError:
            fail("E-RELEASE-SPEC", "release specification path is invalid")
    if len({path.lower() for path in identity_paths}) != len(identity_paths):
        fail("E-RELEASE-SPEC", "release specification paths collide")
    preview3, preview4, preview5, preview6 = specs.values()
    if (preview3.parent_ledger_binding is not None or preview3.predecessor_bindings
            or preview4.parent_ledger_binding != (1244,
                "E65D2D74EF7374B65E12B7898F54D83164093C267B090D0E4E7EC95B578DEA2A")
            or preview4.predecessor_bindings != (
                (preview3.final_archive, 179217,
                 "48C2A6CE0233C1BE66018E4C8A3915040DB5ADCBCFF3C40BA33B534F8E21DAFA"),
                (preview3.final_manifest, 976,
                 "C72862B522305104CC135C00FC31CC47881D8F9DCC6232B77CE027738D9D3B5F"))
            or preview5.parent_ledger_binding != (1480,
                "CB04A67C584205E12527C3FE3C5666B809BFD18CAE5F1E3ADCA51C5255E7FB7F")
            or preview5.predecessor_bindings != (
                (preview4.final_archive, 179438,
                 "1797FE8289D44D8192EA5AFCE04A364B5F46A2E09A8F378598C4A71F1FE2A463"),
                (preview4.final_manifest, 976,
                 "3F89B96D42EFD4D39B0713BFC7058FB0065B6CAB96CCB3BB3785A7395CBB86C5"))
            or preview6.parent_ledger_binding != (1716,
                "0F551D3C522C89244A964E1C0F427C9C3A14B13E2DF3219692529C89DDA19228")
            or preview6.predecessor_bindings != (
                (preview5.final_archive, 186175,
                 "33BB1A8F8FA23B6B5D1DE0D727CA29CC19CBB33861ECD8B611C2C4C76F883458"),
                (preview5.final_manifest, 976,
                 "2E48975AC719D689F312A17D8997E4983E13F36245B62BBF1D826F7995E7DEA0"))):
        fail("E-RELEASE-SPEC", "release predecessor policy is invalid")

_preview3 = make_release_spec("preview3", "0.1.0-preview.3")
_preview4 = make_release_spec(
    "preview4", "0.1.0-preview.4",
    parent_ledger_binding=(1244,
        "E65D2D74EF7374B65E12B7898F54D83164093C267B090D0E4E7EC95B578DEA2A"),
    predecessor_bindings=(
        (_preview3.final_archive, 179217,
         "48C2A6CE0233C1BE66018E4C8A3915040DB5ADCBCFF3C40BA33B534F8E21DAFA"),
        (_preview3.final_manifest, 976,
         "C72862B522305104CC135C00FC31CC47881D8F9DCC6232B77CE027738D9D3B5F")),
)
_preview5 = make_release_spec(
    "preview5", "0.1.0-preview.5",
    parent_ledger_binding=(1480,
        "CB04A67C584205E12527C3FE3C5666B809BFD18CAE5F1E3ADCA51C5255E7FB7F"),
    predecessor_bindings=(
        (_preview4.final_archive, 179438,
         "1797FE8289D44D8192EA5AFCE04A364B5F46A2E09A8F378598C4A71F1FE2A463"),
        (_preview4.final_manifest, 976,
         "3F89B96D42EFD4D39B0713BFC7058FB0065B6CAB96CCB3BB3785A7395CBB86C5")),
)
_preview6 = make_release_spec(
    "preview6", "0.1.0-preview.6",
    parent_ledger_binding=(1716,
        "0F551D3C522C89244A964E1C0F427C9C3A14B13E2DF3219692529C89DDA19228"),
    predecessor_bindings=(
        (_preview5.final_archive, 186175,
         "33BB1A8F8FA23B6B5D1DE0D727CA29CC19CBB33861ECD8B611C2C4C76F883458"),
        (_preview5.final_manifest, 976,
         "2E48975AC719D689F312A17D8997E4983E13F36245B62BBF1D826F7995E7DEA0")),
)
RELEASE_SPECS: Mapping[str, ReleaseSpec] = MappingProxyType({
    _preview3.id: _preview3,
    _preview4.id: _preview4,
    _preview5.id: _preview5,
    _preview6.id: _preview6,
})
validate_release_specs(RELEASE_SPECS)
PREVIEW3_SPEC = RELEASE_SPECS["preview3"]
PREVIEW4_SPEC = RELEASE_SPECS["preview4"]
PREVIEW5_SPEC = RELEASE_SPECS["preview5"]
PREVIEW6_SPEC = RELEASE_SPECS["preview6"]

def resolve_release_spec(spec_id: str) -> ReleaseSpec:
    if type(spec_id) is not str or spec_id not in RELEASE_SPECS:
        fail("E-RELEASE-SPEC", "release specification ID is unsupported")
    return RELEASE_SPECS[spec_id]

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

def require_physical_git_objects(root: Path) -> None:
    objects, pending, remaining = root / ".git" / "objects", [()], MAX_GIT_OBJECT_ENTRIES
    try:
        while pending:
            parts = pending.pop()
            if len(parts) > MAX_GIT_OBJECT_DEPTH:
                fail("E-GIT-OBJECTS", "Git object-store traversal budget exceeded")
            require_directories(root / ".git", ("objects", *parts), create=False)
            directory = objects.joinpath(*parts)
            names = directory_names(directory, "E-GIT-OBJECTS", remaining)
            remaining -= len(names)
            for name in names:
                child = directory / name
                metadata = child.lstat()
                if is_reparse(metadata) or not (stat.S_ISDIR(metadata.st_mode)
                                                or stat.S_ISREG(metadata.st_mode)):
                    fail("E-GIT-OBJECTS", "Git object-store entries must be physical")
                if stat.S_ISDIR(metadata.st_mode):
                    pending.append((*parts, name))
    except (OSError, ToolError):
        fail("E-GIT-OBJECTS", "physical bounded Git object store required")

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
    require_physical_git_objects(root)

def require_output_policy(spec: ReleaseSpec, source_commit: str) -> None:
    path = spec.source_manifest.as_posix().encode("ascii")
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

def require_package_ignore_policy(spec: ReleaseSpec, source_commit: str,
                                  dist_paths: list[str]) -> None:
    tracked, _ = git(["ls-tree", "-r", "-z", source_commit, "--",
                      DIST_ROOT.as_posix(), spec.stage_root.as_posix()])
    if tracked:
        fail("E-PACKAGE-OUTPUT-TRACKED", "dist and package stage must be untracked")
    paths = [DIST_ROOT.joinpath(*PurePosixPath(name).parts) for name in dist_paths]
    for path in (*paths, spec.stage_archive, spec.stage_manifest, spec.stage_ledger):
        encoded = path.as_posix().encode("ascii")
        ignored, result = git(["check-ignore", "--stdin", "-z", "-v", "--no-index"],
                              allowed=(0, 1), input_bytes=encoded + b"\0")
        fields = ignored.split(b"\0")
        if (result != 0 or len(fields) != 5 or fields[-1] != b""
                or fields[0] != b".gitignore" or not fields[1].isdigit()
                or fields[3] != encoded):
            fail("E-PACKAGE-OUTPUT-IGNORE",
                 "dist and package stage require the committed root ignore")

def require_repository(spec: ReleaseSpec, source_commit: str) -> tuple[Path, str]:
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
    require_output_policy(spec, source_commit)
    return root, commit_tree(source_commit)

def source_entries(spec: ReleaseSpec,
                   source_tree: str) -> list[tuple[str, str, int, str]]:
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
    if spec.source_manifest.as_posix().lower() in {path.lower() for path in entries}:
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

def strict_json(value: bytes, code: str) -> object:
    def object_pairs(pairs: list[tuple[str, object]]) -> dict[str, object]:
        result: dict[str, object] = {}
        for key, item in pairs:
            if key in result:
                fail(code, "JSON object contains a duplicate key")
            result[key] = item
        return result

    def invalid_constant(_: str) -> object:
        fail(code, "JSON contains a nonstandard numeric constant")

    try:
        return json.loads(value.decode("utf-8"), object_pairs_hook=object_pairs,
                          parse_constant=invalid_constant)
    except (json.JSONDecodeError, UnicodeDecodeError):
        fail(code, "JSON is not canonical UTF-8 input")

def require_package_version(spec: ReleaseSpec,
                            entries: list[tuple[str, str, int, str]]) -> None:
    matches = [entry for entry in entries if entry[0] == "package.json"]
    if len(matches) != 1:
        fail("E-RELEASE-SOURCE-VERSION", "committed package.json is missing")
    _, object_id, size, _ = matches[0]
    if size > MAX_PACKAGE_JSON_BYTES:
        fail("E-RELEASE-SOURCE-VERSION", "committed package.json exceeds its byte budget")
    document = strict_json(
        git_object("blob", object_id, MAX_PACKAGE_JSON_BYTES, size),
        "E-RELEASE-SOURCE-VERSION",
    )
    if (type(document) is not dict
            or type(document.get("version")) is not str
            or document["version"] != spec.required_package_version):
        fail("E-RELEASE-SOURCE-VERSION",
             "committed package.json version does not match the release specification")

def build_source_manifest(spec: ReleaseSpec,
                          source_commit: str) -> tuple[bytes, dict[str, object]]:
    root, source_tree = require_repository(spec, source_commit)
    entries = source_entries(spec, source_tree)
    require_package_version(spec, entries)
    qualify_checkout(root, entries)
    final_root, final_tree = require_repository(spec, source_commit)
    final_entries = source_entries(spec, final_tree)
    require_package_version(spec, final_entries)
    if final_tree != source_tree or final_entries != entries:
        fail("E-SOURCE-DRIFT", "source identity changed during construction")
    qualify_checkout(final_root, final_entries)
    reject_external_objects(final_root)
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

def report(spec: ReleaseSpec, encoded: bytes, manifest: dict[str, object],
           status_text: str) -> None:
    value = {
        "status": status_text,
        "manifestPath": spec.source_manifest.as_posix(),
        "bytes": len(encoded),
        "sha256": sha256(encoded),
        "files": len(manifest["files"]),
        "sourceCommit": manifest["sourceCommit"],
        "sourceTree": manifest["sourceTree"],
    }
    sys.stdout.write(json.dumps(value, separators=(",", ":")) + "\n")

def freeze_source(spec: ReleaseSpec, source_commit: str) -> None:
    encoded, manifest = build_source_manifest(spec, source_commit)
    root = Path.cwd()
    require_directories(root, spec.source_manifest.parent.parts, create=True)
    output = root / spec.source_manifest
    try:
        with output.open("xb") as stream:
            stream.write(encoded)
            stream.flush()
            os.fsync(stream.fileno())
    except FileExistsError:
        fail("E-SOURCE-OUTPUT-EXISTS", "source manifest already exists")
    except OSError:
        fail("E-SOURCE-OUTPUT-WRITE", "write failed; blocking evidence was retained")
    require_directories(root, spec.source_manifest.parent.parts, create=False)
    if read_regular(output, MAX_MANIFEST_BYTES, "E-SOURCE-MANIFEST-FILE") != encoded:
        fail("E-SOURCE-OUTPUT-WRITE", "written source manifest bytes changed")
    report(spec, encoded, manifest, "created")

def verify_source(spec: ReleaseSpec, source_commit: str) -> None:
    encoded, manifest = build_source_manifest(spec, source_commit)
    require_directories(Path.cwd(), spec.source_manifest.parent.parts, create=False)
    if read_regular(Path.cwd() / spec.source_manifest, MAX_MANIFEST_BYTES,
                    "E-SOURCE-MANIFEST-FILE") != encoded:
        fail("E-SOURCE-MANIFEST-MISMATCH", "source manifest bytes do not match source")
    require_directories(Path.cwd(), spec.source_manifest.parent.parts, create=False)
    report(spec, encoded, manifest, "verified")

def path_entry_exists(path: Path) -> bool:
    try:
        path.lstat()
    except FileNotFoundError:
        return False
    return True

def canonical_json(value: object) -> bytes:
    return (json.dumps(value, ensure_ascii=True, indent=2,
                       separators=(",", ": ")) + "\n").encode("utf-8")

def require_source_evidence(spec: ReleaseSpec, source_commit: str) -> bytes:
    expected, _ = build_source_manifest(spec, source_commit)
    actual = source_evidence_file(spec)
    if actual != expected:
        fail("E-SOURCE-MANIFEST-MISMATCH", "source manifest bytes do not match source")
    return actual

def source_evidence_file(spec: ReleaseSpec) -> bytes:
    root = Path.cwd()
    require_directories(root, spec.source_manifest.parent.parts, create=False)
    actual = read_regular(root / spec.source_manifest, MAX_MANIFEST_BYTES,
                          "E-SOURCE-MANIFEST-FILE")
    require_directories(root, spec.source_manifest.parent.parts, create=False)
    return actual

def directory_names(path: Path, code: str,
                    limit: int = MAX_PACKAGE_ENTRIES) -> list[str]:
    try:
        before = path.lstat()
    except FileNotFoundError:
        fail(code, "required directory is missing")
    if not stat.S_ISDIR(before.st_mode) or is_reparse(before):
        fail(code, "required directory must be physical")
    names: list[str] = []
    for item in path.iterdir():
        if len(names) >= limit:
            fail(code, "directory entry budget exceeded")
        names.append(item.name)
    names.sort()
    after = path.lstat()
    if ((after.st_dev, after.st_ino) != (before.st_dev, before.st_ino)
            or not stat.S_ISDIR(after.st_mode) or is_reparse(after)):
        fail(code, "directory identity changed during inspection")
    return names

def release_paths(paths: list[str]) -> list[str]:
    checked = validate_paths(paths)
    assets = [path for path in checked if path.startswith("assets/")]
    if (len(checked) != 3 or "index.html" not in checked or len(assets) != 2
            or {PurePosixPath(path).suffix for path in assets} != {".css", ".js"}
            or any(len(PurePosixPath(path).parts) != 2 for path in assets)
            or any(ASSET_NAME.fullmatch(PurePosixPath(path).name) is None
                   for path in assets)):
        fail("E-PACKAGE-DIST-SHAPE", "dist must contain the exact supported release shape")
    return checked

def scan_dist() -> list[tuple[str, bytes]]:
    root = Path.cwd()
    require_directories(root, DIST_ROOT.parts, create=False)
    dist = root / DIST_ROOT
    if directory_names(dist, "E-PACKAGE-DIST-SHAPE") != ["assets", "index.html"]:
        fail("E-PACKAGE-DIST-SHAPE", "dist root has an unexpected entry")
    assets = dist / "assets"
    names = directory_names(assets, "E-PACKAGE-DIST-SHAPE")
    paths = release_paths(["index.html", *(f"assets/{name}" for name in names)])
    if len(paths) > MAX_PACKAGE_FILES or len(names) + 2 > MAX_PACKAGE_ENTRIES:
        fail("E-PACKAGE-DIST-LIMIT", "dist entry budget exceeded")
    files: list[tuple[str, bytes]] = []
    total = 0
    for name in paths:
        value = read_regular(dist.joinpath(*PurePosixPath(name).parts),
                             MAX_RELEASE_BYTES, "E-PACKAGE-DIST-FILE")
        total += len(value)
        if total > MAX_RELEASE_BYTES:
            fail("E-PACKAGE-DIST-LIMIT", "dist byte budget exceeded")
        files.append((name, value))
    if (directory_names(dist, "E-PACKAGE-DIST-SHAPE") != ["assets", "index.html"]
            or directory_names(assets, "E-PACKAGE-DIST-SHAPE") != names):
        fail("E-PACKAGE-DIST-DRIFT", "dist changed during inspection")
    return files

def committed_regular_file(source_commit: str, path: Path, limit: int) -> bytes:
    name = canonical_repo_path(path.as_posix())
    raw, _ = git(["ls-tree", "-z", source_commit, "--", name])
    match = re.fullmatch(
        rb"100644 blob ([0-9a-f]{40})\t" + re.escape(name.encode("ascii")) + rb"\0",
        raw,
    )
    if match is None:
        fail("E-PACKAGE-PREDECESSOR", "required predecessor is not a committed regular file")
    object_id = match.group(1).decode("ascii")
    size = git_object_size("blob", object_id, limit)
    return git_object("blob", object_id, limit, size)

def require_parent_ledger(spec: ReleaseSpec, source_commit: str) -> bytes:
    raw = read_regular(Path.cwd() / CHECKSUM_LEDGER, MAX_LEDGER_BYTES,
                       "E-PACKAGE-LEDGER")
    if not raw.endswith(b"\n") or raw.endswith(b"\n\n"):
        fail("E-PACKAGE-LEDGER", "source ledger must end in exactly one LF")
    if (spec.parent_ledger_binding is not None
            and (len(raw), sha256(raw)) != spec.parent_ledger_binding):
        fail("E-PACKAGE-PREDECESSOR", "qualified parent ledger bytes do not match")
    seen: set[str] = set()
    records: list[tuple[str, str]] = []
    spec_order = tuple(RELEASE_SPECS)
    active_index = spec_order.index(spec.id)
    forbidden = {
        path.as_posix().lower()
        for release in tuple(RELEASE_SPECS.values())[active_index:]
        for path in (release.final_archive, release.final_manifest)
    }
    for line in raw.splitlines(keepends=True):
        match = re.fullmatch(rb"([0-9A-F]{64})  ([A-Za-z0-9._/-]+)\n", line)
        if match is None:
            fail("E-PACKAGE-LEDGER", "source ledger has a malformed line")
        name = canonical_repo_path(match.group(2).decode("ascii"))
        if name.lower() in seen or name.lower() in forbidden:
            message = ("source ledger has a duplicate or Preview 3 path"
                       if spec.id == "preview3"
                       else "source ledger has a duplicate or active release path")
            fail("E-PACKAGE-LEDGER", message)
        seen.add(name.lower())
        records.append((match.group(1).decode("ascii"), name))
    expected = [(digest, path.as_posix())
                for path, _, digest in spec.predecessor_bindings]
    if expected:
        if records[-len(expected):] != expected:
            fail("E-PACKAGE-PREDECESSOR", "required predecessor ledger suffix is missing")
        for path, length, digest in spec.predecessor_bindings:
            limit = (MAX_RELEASE_MANIFEST_BYTES
                     if path.suffix == ".json" else MAX_ARCHIVE_BYTES)
            value = committed_regular_file(source_commit, path, limit)
            if (len(value), sha256(value)) != (length, digest):
                fail("E-PACKAGE-PREDECESSOR",
                     "predecessor ledger hash does not match committed bytes")
    return raw

def build_release_manifest(spec: ReleaseSpec, source_commit: str,
                           files: list[tuple[str, bytes]]) -> bytes:
    return canonical_json({
        "schemaVersion": 1,
        "releaseVersion": spec.release_version,
        "artifactName": spec.archive_name,
        "sourceProvenance": {"kind": "git-commit", "gitCommit": source_commit,
                             "statement": BUILD_STATEMENT},
        "build": {"command": "pnpm build", "base": "./", "sourceMaps": False},
        "files": [{"path": name, "bytes": len(value), "sha256": sha256(value)}
                  for name, value in files],
    })

def build_archive(files: list[tuple[str, bytes]]) -> bytes:
    output = io.BytesIO()
    with ZipFile(output, "w", compression=ZIP_STORED, allowZip64=False) as package:
        package.comment = b""
        for name, value in files:
            info = ZipInfo(name, ZIP_TIMESTAMP)
            info.create_system = 3
            info.create_version = info.extract_version = 20
            info.compress_type = ZIP_STORED
            info.flag_bits = info.internal_attr = 0
            info.external_attr = (stat.S_IFREG | 0o644) << 16
            info.extra = info.comment = b""
            package.writestr(info, value, compress_type=ZIP_STORED)
    value = output.getvalue()
    if len(value) > MAX_ARCHIVE_BYTES:
        fail("E-PACKAGE-ARCHIVE-LIMIT", "archive byte budget exceeded")
    return value

def read_archive(raw: bytes) -> list[tuple[str, bytes]]:
    if len(raw) > MAX_ARCHIVE_BYTES:
        fail("E-PACKAGE-ARCHIVE-LIMIT", "archive byte budget exceeded")
    expected_attr = (stat.S_IFREG | 0o644) << 16
    try:
        with ZipFile(io.BytesIO(raw), "r") as package:
            infos = package.infolist()
            if not infos or len(infos) > MAX_PACKAGE_FILES:
                fail("E-PACKAGE-ARCHIVE-LIMIT", "archive member budget exceeded")
            names = release_paths([info.filename for info in infos])
            if names != [info.filename for info in infos] or package.comment:
                fail("E-PACKAGE-ARCHIVE", "archive order or comment is not canonical")
            files: list[tuple[str, bytes]] = []
            total = 0
            for info in infos:
                if (info.date_time != ZIP_TIMESTAMP or info.create_system != 3
                        or info.create_version != 20 or info.extract_version != 20
                        or info.compress_type != ZIP_STORED or info.flag_bits != 0
                        or info.internal_attr != 0 or info.external_attr != expected_attr
                        or info.extra or info.comment or info.is_dir()
                        or info.compress_size != info.file_size):
                    fail("E-PACKAGE-ARCHIVE", "archive member metadata is not canonical")
                value = bytearray()
                with package.open(info, "r") as stream:
                    while chunk := stream.read(min(
                            READ_CHUNK_BYTES, info.file_size - len(value) + 1)):
                        value.extend(chunk)
                        if len(value) > info.file_size:
                            fail("E-PACKAGE-ARCHIVE", "archive member exceeds declared size")
                if len(value) != info.file_size:
                    fail("E-PACKAGE-ARCHIVE", "archive member length is invalid")
                total += len(value)
                if total > MAX_RELEASE_BYTES:
                    fail("E-PACKAGE-ARCHIVE-LIMIT", "archive release budget exceeded")
                files.append((info.filename, bytes(value)))
    except BadZipFile:
        fail("E-PACKAGE-ARCHIVE", "archive is not a valid ZIP")
    if build_archive(files) != raw:
        fail("E-PACKAGE-ARCHIVE", "archive bytes are not canonical")
    return files

def ledger_tail(spec: ReleaseSpec, archive: bytes, manifest: bytes) -> bytes:
    return (f"{sha256(archive)}  {spec.final_archive.as_posix()}\n"
            f"{sha256(manifest)}  {spec.final_manifest.as_posix()}\n").encode("ascii")

def candidate(spec: ReleaseSpec, source_commit: str) -> dict[str, object]:
    source = require_source_evidence(spec, source_commit)
    files = scan_dist()
    require_package_ignore_policy(spec, source_commit, [name for name, _ in files])
    parent = require_parent_ledger(spec, source_commit)
    manifest = build_release_manifest(spec, source_commit, files)
    if len(manifest) > MAX_RELEASE_MANIFEST_BYTES:
        fail("E-PACKAGE-MANIFEST-LIMIT", "release manifest byte budget exceeded")
    archive = build_archive(files)
    ledger = parent + ledger_tail(spec, archive, manifest)
    if len(ledger) > MAX_LEDGER_BYTES:
        fail("E-PACKAGE-LEDGER", "staged ledger byte budget exceeded")
    if (require_source_evidence(spec, source_commit) != source or scan_dist() != files
            or require_parent_ledger(spec, source_commit) != parent):
        fail("E-PACKAGE-DRIFT", "package inputs changed during construction")
    return {"source": source, "files": files, "parent": parent,
            "manifest": manifest, "archive": archive, "ledger": ledger}

def exact_directory(path: Path, expected: list[str], code: str) -> None:
    if directory_names(path, code) != sorted(expected):
        fail(code, "directory has an unexpected entry")

def stage_snapshot(spec: ReleaseSpec) -> dict[str, bytes]:
    root = Path.cwd()
    require_directories(root, spec.stage_root.parts, create=False)
    exact_directory(root / spec.stage_root, ["SHA256SUMS", "release"],
                    "E-PACKAGE-STAGE-SHAPE")
    exact_directory(root / spec.stage_root / "release",
                    [spec.archive_name, spec.manifest_name],
                    "E-PACKAGE-STAGE-SHAPE")
    return {"archive": read_regular(root / spec.stage_archive, MAX_ARCHIVE_BYTES,
                                    "E-PACKAGE-STAGE-FILE"),
            "manifest": read_regular(root / spec.stage_manifest,
                                     MAX_RELEASE_MANIFEST_BYTES,
                                     "E-PACKAGE-STAGE-FILE"),
            "ledger": read_regular(root / spec.stage_ledger, MAX_LEDGER_BYTES,
                                   "E-PACKAGE-STAGE-FILE")}

def write_exclusive(path: Path, value: bytes, code: str) -> None:
    root = Path.cwd()
    require_directories(root, path.parent.parts, create=False)
    try:
        with (root / path).open("xb") as stream:
            if stream.write(value) != len(value):
                raise OSError("short write")
            stream.flush()
            os.fsync(stream.fileno())
    except (FileExistsError, OSError):
        fail(code, "exclusive write failed; partial output was retained")
    require_directories(root, path.parent.parts, create=False)
    if read_regular(root / path, len(value), code) != value:
        fail(code, "written bytes changed; partial output was retained")

def require_fresh_final(spec: ReleaseSpec) -> None:
    root = Path.cwd()
    require_directories(root, spec.final_archive.parent.parts, create=False)
    if (path_entry_exists(root / spec.final_archive)
            or path_entry_exists(root / spec.final_manifest)):
        message = ("Preview " + spec.id.removeprefix("preview")
                   + " final output already exists")
        fail("E-PACKAGE-FINAL-EXISTS", message)

def verify_package_stage(spec: ReleaseSpec, source_commit: str) -> dict[str, object]:
    require_fresh_final(spec)
    expected = candidate(spec, source_commit)
    staged = stage_snapshot(spec)
    archive, manifest, ledger = (staged[key] for key in ("archive", "manifest", "ledger"))
    files = read_archive(archive)
    if (files != expected["files"] or archive != expected["archive"]
            or manifest != build_release_manifest(spec, source_commit, files)
            or manifest != expected["manifest"] or ledger != expected["ledger"]):
        fail("E-PACKAGE-STAGE-MISMATCH", "staged bytes do not match package inputs")
    if (stage_snapshot(spec) != staged
            or require_source_evidence(spec, source_commit) != expected["source"]
            or scan_dist() != files
            or require_parent_ledger(spec, source_commit) != expected["parent"]):
        fail("E-PACKAGE-DRIFT", "package inputs changed during verification")
    expected.update({"archive": archive, "manifest": manifest, "ledger": ledger})
    return expected

def package_report(spec: ReleaseSpec, status_text: str, source_commit: str,
                   values: dict[str, object]) -> None:
    def record(path: Path, key: str) -> dict[str, object]:
        value = values[key]
        assert isinstance(value, bytes)
        return {"path": path.as_posix(), "bytes": len(value), "sha256": sha256(value)}
    result = {"status": status_text, "sourceCommit": source_commit,
              "sourceManifest": record(spec.source_manifest, "source"),
              "archive": record(spec.stage_archive, "archive"),
              "releaseManifest": record(spec.stage_manifest, "manifest"),
              "checksums": record(spec.stage_ledger, "ledger")}
    sys.stdout.write(json.dumps(result, separators=(",", ":"), sort_keys=True) + "\n")

def stage_package(spec: ReleaseSpec, source_commit: str) -> None:
    require_fresh_final(spec)
    values = candidate(spec, source_commit)
    root = Path.cwd()
    require_directories(root, spec.stage_root.parent.parts, create=False)
    if path_entry_exists(root / spec.stage_root):
        fail("E-PACKAGE-STAGE-EXISTS", "package stage already exists")
    try:
        (root / spec.stage_root).mkdir()
        (root / spec.stage_root / "release").mkdir()
    except OSError:
        fail("E-PACKAGE-STAGE-WRITE", "stage creation failed; partial output was retained")
    for path, key in ((spec.stage_archive, "archive"),
                      (spec.stage_manifest, "manifest"),
                      (spec.stage_ledger, "ledger")):
        value = values[key]
        assert isinstance(value, bytes)
        write_exclusive(path, value, "E-PACKAGE-STAGE-WRITE")
    verified = verify_package_stage(spec, source_commit)
    package_report(spec, "staged", source_commit, verified)

def verify_package(spec: ReleaseSpec, source_commit: str) -> None:
    package_report(spec, "verified", source_commit,
                   verify_package_stage(spec, source_commit))

def ledger_metadata(parent: bytes) -> os.stat_result:
    path = Path.cwd() / CHECKSUM_LEDGER
    metadata = path.lstat()
    if (not stat.S_ISREG(metadata.st_mode) or is_reparse(metadata)
            or metadata.st_nlink != 1
            or read_regular(path, MAX_LEDGER_BYTES, "E-PACKAGE-LEDGER") != parent):
        fail("E-PACKAGE-PROMOTION-WRITE", "source ledger changed before promotion")
    return metadata

def append_ledger(parent: bytes, tail: bytes) -> None:
    path = Path.cwd() / CHECKSUM_LEDGER
    metadata = ledger_metadata(parent)
    descriptor = -1
    try:
        descriptor = os.open(path, os.O_WRONLY | os.O_APPEND | getattr(os, "O_BINARY", 0))
        opened = os.fstat(descriptor)
        if (not stat.S_ISREG(opened.st_mode) or opened.st_nlink != 1
                or (opened.st_dev, opened.st_ino) != (metadata.st_dev, metadata.st_ino)
                or opened.st_size != len(parent) or os.write(descriptor, tail) != len(tail)):
            raise OSError("ledger identity or write length changed")
        os.fsync(descriptor)
    except OSError:
        fail("E-PACKAGE-PROMOTION-WRITE", "ledger append failed; partial output was retained")
    finally:
        if descriptor >= 0:
            os.close(descriptor)

def promote_package(spec: ReleaseSpec, source_commit: str) -> None:
    values = verify_package_stage(spec, source_commit)
    archive = values["archive"]
    manifest = values["manifest"]
    ledger = values["ledger"]
    parent = values["parent"]
    assert all(isinstance(value, bytes) for value in (archive, manifest, ledger, parent))
    staged = {key: values[key] for key in ("archive", "manifest", "ledger")}
    if stage_snapshot(spec) != staged:
        fail("E-PACKAGE-STAGE-DRIFT", "stage changed before promotion")
    ledger_metadata(parent)
    write_exclusive(spec.final_archive, archive, "E-PACKAGE-PROMOTION-WRITE")
    write_exclusive(spec.final_manifest, manifest, "E-PACKAGE-PROMOTION-WRITE")
    append_ledger(parent, ledger[len(parent):])
    root = Path.cwd()
    head, _ = git(["rev-parse", "--verify", "HEAD"], 64)
    if (stage_snapshot(spec) != staged
            or source_evidence_file(spec) != values["source"]
            or scan_dist() != values["files"] or head != f"{source_commit}\n".encode("ascii")
            or read_regular(root / spec.final_archive, MAX_ARCHIVE_BYTES,
                     "E-PACKAGE-PROMOTION-WRITE") != archive
            or read_regular(root / spec.final_manifest, MAX_RELEASE_MANIFEST_BYTES,
                            "E-PACKAGE-PROMOTION-WRITE") != manifest
            or read_regular(root / CHECKSUM_LEDGER, MAX_LEDGER_BYTES,
                            "E-PACKAGE-PROMOTION-WRITE") != ledger):
        fail("E-PACKAGE-PROMOTION-WRITE", "promoted bytes changed; partial output retained")
    package_report(spec, "promoted", source_commit, values)

def main(spec: ReleaseSpec) -> int:
    description = ("Deterministic local source identity and Preview "
                   f"{spec.id.removeprefix('preview')} packaging commands.")
    parser = argparse.ArgumentParser(description=description, allow_abbrev=False)
    commands = parser.add_subparsers(dest="command", required=True)
    for name in ("freeze-source", "verify-source", "stage-package",
                 "verify-package", "promote-package"):
        command = commands.add_parser(name, allow_abbrev=False)
        command.add_argument("--source-commit", required=True)
    arguments = parser.parse_args()
    try:
        if arguments.command == "freeze-source":
            freeze_source(spec, arguments.source_commit)
        elif arguments.command == "verify-source":
            verify_source(spec, arguments.source_commit)
        elif arguments.command == "stage-package":
            stage_package(spec, arguments.source_commit)
        elif arguments.command == "verify-package":
            verify_package(spec, arguments.source_commit)
        else:
            promote_package(spec, arguments.source_commit)
    except ToolError as error:
        sys.stderr.write(f"{error.code}: {error}\n")
        return 1
    except (OSError, UnicodeError, ValueError):
        sys.stderr.write("E-BOUNDARY: local source boundary operation failed\n")
        return 1
    return 0

def main_for(spec_id: str) -> int:
    try:
        spec = resolve_release_spec(spec_id)
    except ToolError as error:
        sys.stderr.write(f"{error.code}: {error}\n")
        return 1
    return main(spec)

if __name__ == "__main__":
    sys.stderr.write("E-RELEASE-SPEC: use one pinned release adapter\n")
    raise SystemExit(1)
