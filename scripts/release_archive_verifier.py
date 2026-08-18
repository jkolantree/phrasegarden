#!/usr/bin/env python3
"""Shared fail-closed verification and extraction for release archives."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath, PureWindowsPath
import re
import shutil
import stat
import sys
import tempfile
from typing import BinaryIO
from zipfile import BadZipFile, ZIP_DEFLATED, ZIP_STORED, ZipFile

from release_packager import (
    MAX_GIT_OUTPUT_BYTES,
    RELEASE_SPECS,
    ReleaseSpec,
    ToolError,
    commit_tree,
    git as hardened_git,
    git_object,
    read_regular,
    reject_config_indirection,
    reject_external_objects,
    require_directories,
    source_entries,
    validate_git_environment,
)

SHA256 = re.compile(r"^[0-9A-F]{64}$")
GIT_SHA = re.compile(r"^[0-9a-f]{40}$")
PORTABLE_PATH = re.compile(r"^[A-Za-z0-9._/-]+$")
MAX_ARCHIVE_MEMBERS = 64
MAX_RELEASE_BYTES = 5 * 1024 * 1024
MAX_ARCHIVE_BYTES = MAX_RELEASE_BYTES + 256 * 1024
MAX_MANIFEST_BYTES = 256 * 1024
MAX_CHECKSUM_BYTES = 64 * 1024
MAX_CHECKSUM_TARGET_BYTES = MAX_ARCHIVE_BYTES
MAX_PACKAGE_JSON_BYTES = 256 * 1024
READ_CHUNK_BYTES = 64 * 1024
CHECKSUM_PATH = "SHA256SUMS"
WINDOWS_RESERVED = {
    "AUX",
    "CON",
    "NUL",
    "PRN",
    *(f"COM{index}" for index in range(1, 10)),
    *(f"LPT{index}" for index in range(1, 10)),
}


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

def release_input_limit(spec: ReleaseSpec, name: str) -> int:
    if name == spec.final_manifest.as_posix():
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

def validate_manifest_identity(spec: ReleaseSpec, manifest: dict) -> None:
    if manifest["releaseVersion"] != spec.release_version:
        fail("manifest: releaseVersion does not match the release specification")
    if manifest["artifactName"] != spec.archive_name:
        fail("manifest: artifactName does not match the release specification")

def verify_checksums(spec: ReleaseSpec, path: Path) -> dict[str, str]:
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
                release_input_limit(spec, name),
            )
            != expected
        ):
            fail(f"{path}:{line_number}: SHA-256 mismatch for {name}")
    return checksums

def require_checksum(
    spec: ReleaseSpec, checksums: dict[str, str], candidate: Path, label: str
) -> None:
    name = canonical_repo_path(candidate.as_posix(), label)
    require_regular_file(candidate, label)
    if name not in checksums:
        fail(f"{label}: missing SHA256SUMS entry for {name}")
    actual = sha256_file(candidate, label, release_input_limit(spec, name))
    if checksums[name] != actual:
        fail(f"{label}: SHA256SUMS digest mismatch for {name}")

def validate_packaging_identity(
    spec: ReleaseSpec,
    source_commit: str,
    parents: list[str],
    changed_paths: list[str],
) -> None:
    if len(parents) != 1:
        fail("packaging commit must have exactly one parent")
    if parents[0] != source_commit:
        fail(
            f"packaging parent {parents[0]} does not equal manifest source "
            f"{source_commit}"
        )
    validate_path_set(changed_paths, "packaging paths")
    if tuple(changed_paths) != spec.packaging_paths:
        fail("packaging commit path set does not equal the exact allowlist")

def validate_ledger_append(
    spec: ReleaseSpec,
    parent: bytes,
    current: bytes,
    archive: Path,
    manifest: Path,
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
            f"Preview {spec.id.removeprefix('preview')} archive and manifest"
        )

def validate_packaging_arguments(
    spec: ReleaseSpec, checksums: str | Path, archive: str | Path, manifest: str | Path,
) -> None:
    def exact(value: str | Path, label: str) -> str:
        return canonical_repo_path(value if type(value) is str else value.as_posix(), label)
    actual = (exact(checksums, "checksums"), exact(manifest, "manifest"),
              exact(archive, "archive"))
    if actual != (
        CHECKSUM_PATH,
        spec.final_manifest.as_posix(),
        spec.final_archive.as_posix(),
    ):
        fail("packaging arguments do not equal the exact release paths")

def git_output(
    arguments: list[str], label: str, limit: int = MAX_GIT_OUTPUT_BYTES
) -> bytes:
    try:
        value, _ = hardened_git(arguments, limit)
        return value
    except ToolError as error:
        raise ToolError(error.code, f"{label}: {error}") from error

def read_commit_blob_bounded(
    commit: str, name: str, label: str, limit: int
) -> bytes:
    if GIT_SHA.fullmatch(commit) is None:
        fail(f"{label}: invalid source commit")
    canonical = canonical_repo_path(name, label)
    entry = git_output(["ls-tree", "-z", commit, "--", canonical], label)
    match = re.fullmatch(
        rb"100644 blob ((?:[0-9a-f]{40}|[0-9a-f]{64}))\t"
        + re.escape(canonical.encode("ascii"))
        + rb"\0",
        entry,
    )
    if match is None:
        fail(f"{label}: expected exact committed regular blob")
    try:
        return git_object("blob", match.group(1).decode("ascii"), limit)
    except ToolError as error:
        raise ToolError(error.code, f"{label}: {error}") from error

def validate_source_release_identity(
    spec: ReleaseSpec, source_commit: str, parent_ledger: bytes
) -> None:
    package_bytes = read_commit_blob_bounded(
        source_commit,
        "package.json",
        "source package.json",
        MAX_PACKAGE_JSON_BYTES,
    )

    def object_pairs(pairs: list[tuple[str, object]]) -> dict[str, object]:
        document: dict[str, object] = {}
        for key, value in pairs:
            if key in document:
                fail("source package.json: duplicate JSON key")
            document[key] = value
        return document

    def invalid_constant(value: str) -> object:
        fail(f"source package.json: nonstandard JSON constant {value}")

    try:
        package = json.loads(
            package_bytes.decode("utf-8"),
            object_pairs_hook=object_pairs,
            parse_constant=invalid_constant,
        )
    except (json.JSONDecodeError, UnicodeDecodeError) as error:
        fail(f"source package.json: invalid JSON ({error})")
    if (
        type(package) is not dict
        or type(package.get("version")) is not str
        or package["version"] != spec.required_package_version
    ):
        fail("source package.json: version does not match the release specification")

    if spec.parent_ledger_binding is not None and (
        len(parent_ledger), sha256_bytes(parent_ledger)
    ) != spec.parent_ledger_binding:
        fail("parent SHA256SUMS does not match the qualified predecessor ledger")

    expected_suffix = b"".join(
        f"{digest}  {path.as_posix()}\n".encode("ascii")
        for path, _, digest in spec.predecessor_bindings
    )
    if expected_suffix and not parent_ledger.endswith(expected_suffix):
        fail("parent SHA256SUMS lacks the exact predecessor suffix")
    for path, length, digest in spec.predecessor_bindings:
        limit = MAX_MANIFEST_BYTES if path.suffix == ".json" else MAX_ARCHIVE_BYTES
        value = read_commit_blob_bounded(
            source_commit,
            path.as_posix(),
            f"predecessor {path.as_posix()}",
            limit,
        )
        if (len(value), sha256_bytes(value)) != (length, digest):
            fail(f"predecessor {path.as_posix()}: byte identity mismatch")

def require_packaging_repository() -> tuple[Path, str, list[str]]:
    validate_git_environment()
    expected_root = Path.cwd().resolve()
    reject_config_indirection(expected_root)
    raw_root = git_output(["rev-parse", "--show-toplevel"], "repository root", 4096)
    try:
        root = Path(raw_root.rstrip(b"\r\n").decode("utf-8")).resolve()
    except (UnicodeDecodeError, ValueError):
        fail("repository root: invalid Git output")
    if os.path.normcase(str(root)) != os.path.normcase(str(expected_root)):
        fail("command must run at the repository root")
    reject_external_objects(root)
    raw_head = git_output(["rev-parse", "--verify", "HEAD"], "packaging commit", 64)
    try:
        head = raw_head.rstrip(b"\r\n").decode("ascii")
    except UnicodeDecodeError:
        fail("unable to read packaging commit identity")
    if GIT_SHA.fullmatch(head) is None:
        fail("unable to read packaging commit identity")
    try:
        commit = git_object("commit", head, MAX_GIT_OUTPUT_BYTES)
    except ToolError as error:
        raise ToolError(error.code, f"packaging commit: {error}") from error
    parents: list[str] = []
    for line in commit.split(b"\n"):
        if line == b"":
            break
        if line.startswith(b"parent "):
            try:
                parent = line.removeprefix(b"parent ").decode("ascii")
            except UnicodeDecodeError:
                fail("unable to read packaging commit identity")
            if GIT_SHA.fullmatch(parent) is None:
                fail("unable to read packaging commit identity")
            parents.append(parent)
    return root, head, parents

def commit_inventory(spec: ReleaseSpec, commit: str, label: str) -> dict[str, tuple[str, int, str]]:
    try:
        return {
            name: (object_id, length, digest)
            for name, object_id, length, digest in source_entries(
                spec, commit_tree(commit)
            )
        }
    except ToolError as error:
        raise ToolError(error.code, f"{label}: {error}") from error

def require_head_blob(
    inventory: dict[str, tuple[str, int, str]], name: str
) -> None:
    path = Path(*name.split("/"))
    expected = inventory.get(name)
    if expected is None:
        fail(f"packaging path {name}: missing unique HEAD tree entry")
    _, expected_length, expected_digest = expected
    try:
        require_directories(Path.cwd(), path.parent.parts, create=False)
        actual = read_regular(path, release_input_limit_for_path(name), "E-PACKAGING-WORKTREE")
        require_directories(Path.cwd(), path.parent.parts, create=False)
    except ToolError as error:
        raise ToolError(error.code, f"packaging path {name}: {error}") from error
    if (len(actual), sha256_bytes(actual)) != (expected_length, expected_digest):
        fail(f"packaging path {name}: worktree bytes do not match HEAD blob")

def release_input_limit_for_path(name: str) -> int:
    return MAX_MANIFEST_BYTES if name.endswith("-pages-manifest.json") else MAX_CHECKSUM_TARGET_BYTES

def require_packaging_head_blobs(
    spec: ReleaseSpec, inventory: dict[str, tuple[str, int, str]]
) -> None:
    for name in spec.packaging_paths:
        require_head_blob(inventory, name)

def verify_packaging_commit(
    spec: ReleaseSpec,
    source_commit: str,
    checksums: str | Path,
    archive: str | Path,
    manifest: str | Path,
) -> None:
    validate_packaging_arguments(spec, checksums, archive, manifest)
    checksums, archive, manifest = Path(checksums), Path(archive), Path(manifest)
    root, head, parents = require_packaging_repository()
    if len(parents) != 1:
        validate_packaging_identity(spec, source_commit, parents, [])
    head_inventory = commit_inventory(spec, head, "packaging commit")
    parent_inventory = commit_inventory(spec, parents[0], "packaging parent")
    changed_paths = sorted(
        name
        for name in set(head_inventory) | set(parent_inventory)
        if head_inventory.get(name) != parent_inventory.get(name)
    )
    validate_packaging_identity(spec, source_commit, parents, changed_paths)
    require_packaging_head_blobs(spec, head_inventory)
    parent_ledger = read_commit_blob_bounded(
        source_commit,
        CHECKSUM_PATH,
        "parent SHA256SUMS",
        MAX_CHECKSUM_BYTES,
    )
    if spec.id != "preview3":
        validate_source_release_identity(spec, source_commit, parent_ledger)
    validate_ledger_append(
        spec,
        parent_ledger,
        read_bounded_bytes(checksums, "checksums", MAX_CHECKSUM_BYTES),
        archive,
        manifest,
    )
    reject_external_objects(root)

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

def main(spec: ReleaseSpec) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--archive", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--checksums", required=True)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--require-packaging-commit", action="store_true")
    args = parser.parse_args()

    archive, manifest_path, checksum_path = map(
        Path, (args.archive, args.manifest, args.checksums))
    manifest = load_manifest(manifest_path)
    checksums = verify_checksums(spec, checksum_path)
    require_checksum(spec, checksums, archive, "archive")
    require_checksum(spec, checksums, manifest_path, "manifest")
    if args.require_packaging_commit:
        verify_packaging_commit(
            spec,
            manifest["sourceProvenance"]["gitCommit"],
            args.checksums,
            args.archive,
            args.manifest,
        )
        if spec.id != "preview3":
            validate_manifest_identity(spec, manifest)
    verify_and_extract(archive, manifest, args.output)
    print(
        json.dumps(
            {
                "ok": True,
                "archive": str(archive),
                "manifest": str(manifest_path),
                "output": str(args.output),
                "files": len(manifest["files"]),
            },
            sort_keys=True,
        )
    )
    return 0

def run_for(spec_id: str) -> int:
    try:
        if type(spec_id) is not str or spec_id not in RELEASE_SPECS:
            fail("release specification ID is unsupported")
        return main(RELEASE_SPECS[spec_id])
    except ToolError as error:
        print(f"{error.code}: {error}", file=sys.stderr)
        return 1
    except (BadZipFile, OSError, ValueError) as error:
        print(str(error), file=sys.stderr)
        return 1


if __name__ == "__main__":
    print("release verifier core requires a pinned adapter", file=sys.stderr)
    raise SystemExit(1)
