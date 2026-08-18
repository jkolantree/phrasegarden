#!/usr/bin/env python3
"""Fail-closed verification and extraction for a PhraseGarden Pages archive."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath, PureWindowsPath
import re
import shutil
import stat
import subprocess
import sys
import tempfile
from typing import BinaryIO
from zipfile import BadZipFile, ZIP_DEFLATED, ZIP_STORED, ZipFile

SHA256 = re.compile(r"^[0-9A-F]{64}$")
GIT_SHA = re.compile(r"^[0-9a-f]{40}$")
GIT_OBJECT_ID = re.compile(r"^(?:[0-9a-f]{40}|[0-9a-f]{64})$")
PORTABLE_PATH = re.compile(r"^[A-Za-z0-9._/-]+$")
MAX_ARCHIVE_MEMBERS = 64
MAX_RELEASE_BYTES = 5 * 1024 * 1024
MAX_ARCHIVE_BYTES = MAX_RELEASE_BYTES + 256 * 1024
MAX_MANIFEST_BYTES = 256 * 1024
MAX_CHECKSUM_BYTES = 64 * 1024
MAX_CHECKSUM_TARGET_BYTES = MAX_ARCHIVE_BYTES
READ_CHUNK_BYTES = 64 * 1024
CHECKSUM_PATH = "SHA256SUMS"
MANIFEST_PATH = "release/phrasegarden-0.1.0-preview.3-pages-manifest.json"
ARCHIVE_PATH = "release/phrasegarden-0.1.0-preview.3-pages.zip"
WINDOWS_RESERVED = {
    "AUX",
    "CON",
    "NUL",
    "PRN",
    *(f"COM{index}" for index in range(1, 10)),
    *(f"LPT{index}" for index in range(1, 10)),
}
PACKAGING_PATHS = (
    CHECKSUM_PATH,
    "docs/PROJECT-STATE.md",
    "docs/TRACEABILITY.md",
    "docs/evidence/releases/0.1.0-preview.3.md",
    "docs/work-packages/PREVIEW-3-PUBLICATION.md",
    MANIFEST_PATH,
    ARCHIVE_PATH,
)


def fail(message: str) -> None:
    raise ValueError(message)


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest().upper()


def read_bounded_bytes(path: Path, label: str, limit: int) -> bytes:
    require_regular_file(path, label)
    if path.lstat().st_size > limit:
        fail(f"{label}: input byte budget exceeded")
    value = bytearray()
    with path.open("rb") as stream:
        while chunk := stream.read(READ_CHUNK_BYTES):
            value.extend(chunk)
            if len(value) > limit:
                fail(f"{label}: input byte budget exceeded")
    return bytes(value)


def sha256_file(path: Path, label: str, limit: int | None = None) -> str:
    require_regular_file(path, label)
    digest = hashlib.sha256()
    total = 0
    with path.open("rb") as stream:
        while chunk := stream.read(READ_CHUNK_BYTES):
            total += len(chunk)
            if limit is not None and total > limit:
                fail(f"{label}: input byte budget exceeded")
            digest.update(chunk)
    return digest.hexdigest().upper()


def release_input_limit(name: str) -> int:
    if name == MANIFEST_PATH:
        return MAX_MANIFEST_BYTES
    return MAX_CHECKSUM_TARGET_BYTES


def exact_keys(value: object, keys: set[str], label: str) -> dict:
    if not isinstance(value, dict):
        fail(f"{label}: expected object")
    if set(value) != keys:
        fail(f"{label}: unexpected or missing keys")
    return value


def require_regular_file(path: Path, label: str) -> None:
    try:
        metadata = path.lstat()
    except FileNotFoundError:
        fail(f"{label}: missing regular file {path}")
    if not stat.S_ISREG(metadata.st_mode):
        fail(f"{label}: expected regular file {path}")


def path_entry_exists(path: Path) -> bool:
    try:
        path.lstat()
    except FileNotFoundError:
        return False
    return True


def canonical_repo_path(value: object, label: str) -> str:
    if not isinstance(value, str) or not value:
        fail(f"{label}: path must be nonempty")
    if (
        value.startswith("/")
        or "\\" in value
        or PureWindowsPath(value).drive
        or any(character in value for character in "?#")
        or PORTABLE_PATH.fullmatch(value) is None
    ):
        fail(f"{label}: path is not portable ASCII repository-relative")
    parts = value.split("/")
    if any(part in {"", ".", ".."} for part in parts):
        fail(f"{label}: path contains a noncanonical segment")
    for part in parts:
        if part.endswith((" ", ".")) or any(
            ord(character) < 32 or character in '<>:"|?*'
            for character in part
        ):
            fail(f"{label}: path contains a nonportable component")
        if part.split(".", 1)[0].upper() in WINDOWS_RESERVED:
            fail(f"{label}: path uses a reserved Windows component")
    if str(PurePosixPath(value)) != value:
        fail(f"{label}: path is not canonical POSIX")
    return value


def validate_path_set(values: list[str], label: str) -> list[str]:
    paths = [
        canonical_repo_path(value, f"{label}[{index}]")
        for index, value in enumerate(values)
    ]
    if paths != sorted(paths):
        fail(f"{label}: paths must be sorted")
    if len(paths) != len(set(paths)):
        fail(f"{label}: paths must be unique")
    folded = [path.casefold() for path in paths]
    if len(folded) != len(set(folded)):
        fail(f"{label}: paths must be case-insensitively unique")
    return paths


def reject_duplicate_keys(pairs: list[tuple[str, object]]) -> dict:
    value: dict[str, object] = {}
    for key, item in pairs:
        if key in value:
            fail(f"manifest: duplicate JSON key {key}")
        value[key] = item
    return value


def reject_json_constant(value: str) -> object:
    fail(f"manifest: nonstandard JSON constant {value}")


def load_manifest(path: Path) -> dict:
    raw = read_bounded_bytes(path, "manifest", MAX_MANIFEST_BYTES)
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as error:
        fail(f"manifest: invalid UTF-8 ({error})")
    try:
        parsed = json.loads(
            text,
            object_pairs_hook=reject_duplicate_keys,
            parse_constant=reject_json_constant,
        )
    except json.JSONDecodeError as error:
        fail(f"manifest: invalid JSON ({error})")
    root = exact_keys(
        parsed,
        {
            "schemaVersion",
            "releaseVersion",
            "artifactName",
            "sourceProvenance",
            "build",
            "files",
        },
        "manifest",
    )
    if type(root["schemaVersion"]) is not int or root["schemaVersion"] != 1:
        fail("manifest: unsupported schemaVersion")
    if not isinstance(root["releaseVersion"], str) or not root["releaseVersion"]:
        fail("manifest: releaseVersion must be nonempty")
    artifact_name = canonical_repo_path(
        root["artifactName"], "manifest.artifactName"
    )
    if "/" in artifact_name:
        fail("manifest: artifactName must be one filename")
    if root["artifactName"] != f"phrasegarden-{root['releaseVersion']}-pages.zip":
        fail("manifest: artifactName does not match releaseVersion")
    source = exact_keys(
        root["sourceProvenance"],
        {"kind", "gitCommit", "statement"},
        "manifest.sourceProvenance",
    )
    if (
        source["kind"] != "git-commit"
        or not isinstance(source["gitCommit"], str)
        or not GIT_SHA.fullmatch(source["gitCommit"])
    ):
        fail("manifest.sourceProvenance: invalid Git identity")
    if not isinstance(source["statement"], str) or not source["statement"]:
        fail("manifest.sourceProvenance: statement must be nonempty")
    build = exact_keys(
        root["build"], {"command", "base", "sourceMaps"}, "manifest.build"
    )
    if (
        build["command"] != "pnpm build"
        or type(build["command"]) is not str
        or build["base"] != "./"
        or type(build["base"]) is not str
        or type(build["sourceMaps"]) is not bool
        or build["sourceMaps"] is not False
    ):
        fail("manifest.build: unsupported build identity")
    if not isinstance(root["files"], list):
        fail("manifest.files: expected array")
    paths: list[str] = []
    total_bytes = 0
    for index, value in enumerate(root["files"]):
        item = exact_keys(
            value, {"path", "bytes", "sha256"}, f"manifest.files[{index}]"
        )
        name = canonical_repo_path(
            item["path"], f"manifest.files[{index}]"
        )
        if (
            not isinstance(item["bytes"], int)
            or isinstance(item["bytes"], bool)
            or item["bytes"] < 0
        ):
            fail(f"manifest.files[{index}]: invalid byte length")
        if not isinstance(item["sha256"], str) or not SHA256.fullmatch(
            item["sha256"]
        ):
            fail(f"manifest.files[{index}]: invalid SHA-256")
        paths.append(name)
        total_bytes += item["bytes"]
    if not paths or len(paths) > MAX_ARCHIVE_MEMBERS:
        fail("manifest.files: unsupported member count")
    if total_bytes > MAX_RELEASE_BYTES:
        fail("manifest.files: release byte budget exceeded")
    validate_path_set(paths, "manifest.files")
    return root


def verify_checksums(path: Path) -> dict[str, str]:
    raw = read_bounded_bytes(path, "checksums", MAX_CHECKSUM_BYTES)
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as error:
        fail(f"checksums: invalid UTF-8 ({error})")
    checksums: dict[str, str] = {}
    folded: set[str] = set()
    for line_number, line in enumerate(text.splitlines(), start=1):
        match = re.fullmatch(r"([0-9A-F]{64})  ([^\\\r\n]+)", line)
        if match is None:
            fail(f"{path}:{line_number}: malformed checksum line")
        expected, name = match.groups()
        name = canonical_repo_path(name, f"{path}:{line_number}")
        if name in checksums or name.casefold() in folded:
            fail(f"{path}:{line_number}: duplicate path")
        checksums[name] = expected
        folded.add(name.casefold())
        candidate = Path(*name.split("/"))
        require_regular_file(candidate, f"{path}:{line_number}")
        if (
            sha256_file(
                candidate,
                f"{path}:{line_number}",
                release_input_limit(name),
            )
            != expected
        ):
            fail(f"{path}:{line_number}: SHA-256 mismatch for {name}")
    return checksums


def require_checksum(
    checksums: dict[str, str], candidate: Path, label: str
) -> None:
    name = canonical_repo_path(candidate.as_posix(), label)
    require_regular_file(candidate, label)
    if name not in checksums:
        fail(f"{label}: missing SHA256SUMS entry for {name}")
    actual = sha256_file(candidate, label, release_input_limit(name))
    if checksums[name] != actual:
        fail(f"{label}: SHA256SUMS digest mismatch for {name}")

def validate_packaging_identity(
    source_commit: str, parents: list[str], changed_paths: list[str]
) -> None:
    if len(parents) != 1:
        fail("packaging commit must have exactly one parent")
    if parents[0] != source_commit:
        fail(
            f"packaging parent {parents[0]} does not equal manifest source "
            f"{source_commit}"
        )
    validate_path_set(changed_paths, "packaging paths")
    if tuple(changed_paths) != PACKAGING_PATHS:
        fail("packaging commit path set does not equal the exact allowlist")

def validate_ledger_append(
    parent: bytes, current: bytes, archive: Path, manifest: Path
) -> None:
    if not parent.endswith(b"\n"):
        fail("parent SHA256SUMS must end with one LF")
    archive_name = canonical_repo_path(archive.as_posix(), "archive")
    manifest_name = canonical_repo_path(manifest.as_posix(), "manifest")
    expected = (
        f"{sha256_file(archive, 'archive', MAX_ARCHIVE_BYTES)}  {archive_name}\n"
        f"{sha256_file(manifest, 'manifest', MAX_MANIFEST_BYTES)}  {manifest_name}\n"
    ).encode("utf-8")
    if current != parent + expected:
        fail(
            "SHA256SUMS must preserve the parent bytes and append exactly the "
            "Preview 3 archive and manifest"
        )

def validate_packaging_arguments(
    checksums: Path, archive: Path, manifest: Path
) -> None:
    actual = (
        canonical_repo_path(checksums.as_posix(), "checksums"),
        canonical_repo_path(manifest.as_posix(), "manifest"),
        canonical_repo_path(archive.as_posix(), "archive"),
    )
    if actual != (CHECKSUM_PATH, MANIFEST_PATH, ARCHIVE_PATH):
        fail("packaging arguments do not equal the exact release paths")


def git_output(arguments: list[str], label: str) -> bytes:
    try:
        return subprocess.run(
            ["git", *arguments],
            check=True,
            capture_output=True,
        ).stdout
    except subprocess.CalledProcessError as error:
        detail = error.stderr.decode("utf-8", errors="replace").strip()
        fail(f"{label}: Git command failed{f' ({detail})' if detail else ''}")


def read_git_blob_bounded(reference: str, label: str, limit: int) -> bytes:
    raw_size = git_output(["cat-file", "-s", reference], label)
    try:
        size = int(raw_size.decode("ascii").strip())
    except (UnicodeDecodeError, ValueError):
        fail(f"{label}: invalid Git blob size")
    if size < 0 or size > limit:
        fail(f"{label}: input byte budget exceeded")
    value = git_output(["cat-file", "blob", reference], label)
    if len(value) != size:
        fail(f"{label}: Git blob size changed")
    return value


def require_head_blob(name: str) -> None:
    path = Path(*name.split("/"))
    require_regular_file(path, f"packaging path {name}")
    entry = git_output(["ls-tree", "-z", "HEAD", "--", name], name)
    if not entry.endswith(b"\0") or entry.count(b"\0") != 1:
        fail(f"packaging path {name}: missing unique HEAD tree entry")
    try:
        metadata, raw_name = entry[:-1].split(b"\t", 1)
        mode, kind, expected_oid = metadata.decode("ascii").split(" ")
        tree_name = raw_name.decode("utf-8")
    except (UnicodeDecodeError, ValueError):
        fail(f"packaging path {name}: malformed HEAD tree entry")
    if (
        mode != "100644"
        or kind != "blob"
        or GIT_OBJECT_ID.fullmatch(expected_oid) is None
        or tree_name != name
    ):
        fail(f"packaging path {name}: expected exact regular HEAD blob")
    actual_oid = git_output(
        ["hash-object", "--no-filters", "--", name], name
    ).decode("ascii").strip()
    if actual_oid != expected_oid:
        fail(f"packaging path {name}: worktree bytes do not match HEAD blob")


def require_packaging_head_blobs() -> None:
    for name in PACKAGING_PATHS:
        require_head_blob(name)


def verify_packaging_commit(
    source_commit: str,
    checksums: Path,
    archive: Path,
    manifest: Path,
) -> None:
    validate_packaging_arguments(checksums, archive, manifest)
    identity = git_output(
        ["rev-list", "--parents", "-n", "1", "HEAD"],
        "packaging commit",
    ).decode("ascii").strip().split()
    if len(identity) < 1 or not GIT_SHA.fullmatch(identity[0]):
        fail("unable to read packaging commit identity")
    changed = git_output(
        ["diff", "--name-only", "--no-renames", "-z", "HEAD^", "HEAD"],
        "packaging paths",
    )
    if changed and not changed.endswith(b"\0"):
        fail("unable to read packaging commit paths")
    changed_paths = (
        changed[:-1].decode("utf-8").split("\0") if changed else []
    )
    validate_packaging_identity(source_commit, identity[1:], changed_paths)
    require_packaging_head_blobs()
    parent_ledger = read_git_blob_bounded(
        "HEAD^:SHA256SUMS", "parent SHA256SUMS", MAX_CHECKSUM_BYTES
    )
    validate_ledger_append(
        parent_ledger,
        read_bounded_bytes(checksums, "checksums", MAX_CHECKSUM_BYTES),
        archive,
        manifest,
    )


def read_member_bounded(
    stream: BinaryIO, expected_bytes: int, name: str
) -> bytes:
    value = bytearray()
    while True:
        remaining_with_probe = expected_bytes - len(value) + 1
        request = min(READ_CHUNK_BYTES, remaining_with_probe)
        chunk = stream.read(request)
        if not chunk:
            break
        value.extend(chunk)
        if len(value) > expected_bytes:
            fail(f"archive decompressed-length mismatch: {name}")
    if len(value) != expected_bytes:
        fail(f"archive decompressed-length mismatch: {name}")
    return bytes(value)


def verify_and_extract(archive: Path, manifest: dict, output: Path) -> None:
    require_regular_file(archive, "archive")
    if archive.lstat().st_size > MAX_ARCHIVE_BYTES:
        fail("archive: physical byte budget exceeded")
    if archive.name != manifest["artifactName"]:
        fail("archive filename does not match manifest")
    if path_entry_exists(output):
        fail(f"output path already exists: {output}")

    expected = {item["path"]: item for item in manifest["files"]}
    validated: list[tuple[PurePosixPath, bytes]] = []
    with ZipFile(archive, "r") as package:
        infos = package.infolist()
        names = [item.filename for item in infos]
        validate_path_set(names, "archive")
        if not names or len(names) > MAX_ARCHIVE_MEMBERS:
            fail("archive: unsupported member count")
        if sum(info.file_size for info in infos) > MAX_RELEASE_BYTES:
            fail("archive: release byte budget exceeded")
        if set(names) != set(expected):
            fail("archive path set does not equal manifest")
        if infos[0].header_offset != 0:
            fail("archive: prepended payload is not allowed")
        for info in infos:
            name = info.filename
            posix = PurePosixPath(name)
            if (
                info.is_dir()
                or info.flag_bits & 0x1
                or info.compress_type not in {ZIP_STORED, ZIP_DEFLATED}
            ):
                fail(f"unsupported archive member: {name}")
            unix_type = stat.S_IFMT((info.external_attr >> 16) & 0xFFFF)
            if unix_type == stat.S_IFLNK:
                fail(f"symbolic-link archive member: {name}")
            if unix_type not in {0, stat.S_IFREG} or info.external_attr & 0x10:
                fail(f"non-regular archive member: {name}")
            record = expected[name]
            if info.file_size != record["bytes"]:
                fail(f"archive byte-length mismatch: {name}")
            with package.open(info, "r") as stream:
                value = read_member_bounded(stream, info.file_size, name)
            if sha256_bytes(value) != record["sha256"]:
                fail(f"archive SHA-256 mismatch: {name}")
            validated.append((posix, value))

    output.parent.mkdir(parents=True, exist_ok=True)
    staging = Path(
        tempfile.mkdtemp(prefix=f".{output.name}-", dir=output.parent)
    )
    try:
        for posix, value in validated:
            destination = staging.joinpath(*posix.parts)
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(value)
        if path_entry_exists(output):
            fail(f"output path already exists: {output}")
        staging.replace(output)
    finally:
        if staging.exists():
            shutil.rmtree(staging)

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--archive", required=True, type=Path)
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--checksums", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--require-packaging-commit", action="store_true")
    args = parser.parse_args()

    manifest = load_manifest(args.manifest)
    checksums = verify_checksums(args.checksums)
    require_checksum(checksums, args.archive, "archive")
    require_checksum(checksums, args.manifest, "manifest")
    if args.require_packaging_commit:
        verify_packaging_commit(
            manifest["sourceProvenance"]["gitCommit"],
            args.checksums,
            args.archive,
            args.manifest,
        )
    verify_and_extract(args.archive, manifest, args.output)
    print(
        json.dumps(
            {
                "ok": True,
                "archive": str(args.archive),
                "manifest": str(args.manifest),
                "output": str(args.output),
                "files": len(manifest["files"]),
            },
            sort_keys=True,
        )
    )
    return 0

if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (BadZipFile, OSError, ValueError) as error:
        print(str(error), file=sys.stderr)
        raise SystemExit(1)
