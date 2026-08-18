from __future__ import annotations

import hashlib
import io
import json
import os
from pathlib import Path
import runpy
import stat
import subprocess
import tempfile
import unittest
from unittest import mock
import warnings
from zipfile import ZIP_BZIP2, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[2]
MODULE = runpy.run_path(str(ROOT / "scripts" / "verify-release-archive.py"))
verify_checksums = MODULE["verify_checksums"]
require_checksum = MODULE["require_checksum"]
load_manifest = MODULE["load_manifest"]
verify_and_extract = MODULE["verify_and_extract"]
canonical_repo_path = MODULE["canonical_repo_path"]
validate_path_set = MODULE["validate_path_set"]
validate_packaging_identity = MODULE["validate_packaging_identity"]
validate_ledger_append = MODULE["validate_ledger_append"]
validate_packaging_arguments = MODULE["validate_packaging_arguments"]
verify_packaging_commit = MODULE["verify_packaging_commit"]
require_regular_file = MODULE["require_regular_file"]
path_entry_exists = MODULE["path_entry_exists"]
read_member_bounded = MODULE["read_member_bounded"]
read_git_blob_bounded = MODULE["read_git_blob_bounded"]
PACKAGING_PATHS = MODULE["PACKAGING_PATHS"]
MAX_RELEASE_BYTES = MODULE["MAX_RELEASE_BYTES"]
MAX_ARCHIVE_BYTES = MODULE["MAX_ARCHIVE_BYTES"]
MAX_MANIFEST_BYTES = MODULE["MAX_MANIFEST_BYTES"]
MAX_CHECKSUM_BYTES = MODULE["MAX_CHECKSUM_BYTES"]
MAX_CHECKSUM_TARGET_BYTES = MODULE["MAX_CHECKSUM_TARGET_BYTES"]
CHECKSUM_PATH = MODULE["CHECKSUM_PATH"]
MANIFEST_PATH = MODULE["MANIFEST_PATH"]
ARCHIVE_PATH = MODULE["ARCHIVE_PATH"]

def digest(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest().upper()

def manifest_for(path: str, value: bytes) -> dict:
    return {
        "schemaVersion": 1,
        "releaseVersion": "0.1.0-preview.3",
        "artifactName": "phrasegarden-0.1.0-preview.3-pages.zip",
        "sourceProvenance": {
            "kind": "git-commit",
            "gitCommit": "0" * 40,
            "statement": "Synthetic development-only fixture.",
        },
        "build": {"command": "pnpm build", "base": "./", "sourceMaps": False},
        "files": [
            {"path": path, "bytes": len(value), "sha256": digest(value)}
        ],
    }


def run_git(root: Path, *arguments: str) -> bytes:
    return subprocess.run(
        ["git", "-C", str(root), *arguments],
        check=True,
        capture_output=True,
    ).stdout

class ChecksumBindingTest(unittest.TestCase):
    def setUp(self) -> None:
        self.original = Path.cwd()
        self.temp = tempfile.TemporaryDirectory(
            prefix="phrasegarden-checksum-test-"
        )
        os.chdir(self.temp.name)
        release = Path("release")
        release.mkdir()
        self.archive = release / "phrasegarden-0.1.0-preview.3-pages.zip"
        self.manifest = (
            release
            / "phrasegarden-0.1.0-preview.3-pages-manifest.json"
        )
        self.archive.write_bytes(b"archive")
        self.manifest.write_bytes(b"manifest")
    def tearDown(self) -> None:
        os.chdir(self.original)
        self.temp.cleanup()
    def write_ledger(self, paths: list[Path]) -> Path:
        ledger = Path("SHA256SUMS")
        ledger.write_text(
            "".join(
                f"{digest(path.read_bytes())}  {path.as_posix()}\n"
                for path in paths
            ),
            encoding="utf-8",
        )
        return ledger
    def test_missing_archive_entry_fails_closed(self) -> None:
        checksums = verify_checksums(self.write_ledger([self.manifest]))
        with self.assertRaisesRegex(ValueError, "missing SHA256SUMS entry"):
            require_checksum(checksums, self.archive, "archive")
    def test_missing_manifest_entry_fails_closed(self) -> None:
        checksums = verify_checksums(self.write_ledger([self.archive]))
        with self.assertRaisesRegex(ValueError, "missing SHA256SUMS entry"):
            require_checksum(checksums, self.manifest, "manifest")
    def test_mismatched_digest_fails_closed(self) -> None:
        ledger = self.write_ledger([self.archive, self.manifest])
        ledger.write_text(
            ledger.read_text(encoding="utf-8").replace(
                digest(self.archive.read_bytes()), "0" * 64, 1
            ),
            encoding="utf-8",
        )
        with self.assertRaisesRegex(ValueError, "SHA-256 mismatch"):
            verify_checksums(ledger)

    def test_ledger_and_manifest_inputs_are_bounded(self) -> None:
        ledger = Path("SHA256SUMS")
        ledger.write_bytes(b"x" * (MAX_CHECKSUM_BYTES + 1))
        with self.assertRaisesRegex(ValueError, "input byte budget"):
            verify_checksums(ledger)
        manifest = Path("manifest.json")
        manifest.write_bytes(b"x" * (MAX_MANIFEST_BYTES + 1))
        with self.assertRaisesRegex(ValueError, "input byte budget"):
            load_manifest(manifest)
        self.archive.write_bytes(b"x" * (MAX_ARCHIVE_BYTES + 1))
        ledger.write_text(
            f"{digest(self.archive.read_bytes())}  {ARCHIVE_PATH}\n",
            encoding="utf-8",
        )
        with self.assertRaisesRegex(ValueError, "input byte budget"):
            verify_checksums(ledger)
        with self.assertRaisesRegex(ValueError, "input byte budget"):
            require_checksum(
                {ARCHIVE_PATH: digest(self.archive.read_bytes())},
                self.archive,
                "archive",
            )
        other = Path("other.bin")
        with other.open("wb") as stream:
            stream.seek(MAX_CHECKSUM_TARGET_BYTES)
            stream.write(b"x")
        ledger.write_text(f"{'0' * 64}  other.bin\n", encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "input byte budget"):
            verify_checksums(ledger)


class ArchiveValidationTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory(
            prefix="phrasegarden-archive-test-"
        )
        self.root = Path(self.temp.name)
        self.archive = (
            self.root / "phrasegarden-0.1.0-preview.3-pages.zip"
        )
    def tearDown(self) -> None:
        self.temp.cleanup()
    def test_exact_archive_extracts_to_fresh_output(self) -> None:
        value = b"qualified bytes"
        manifest = manifest_for("index.html", value)
        with ZipFile(self.archive, "w") as package:
            package.writestr("index.html", value)
        output = self.root / "dist"
        verify_and_extract(self.archive, manifest, output)
        self.assertEqual((output / "index.html").read_bytes(), value)
    def test_traversal_archive_member_fails_closed(self) -> None:
        value = b"unsafe"
        manifest = manifest_for("../index.html", value)
        with ZipFile(self.archive, "w") as package:
            package.writestr("../index.html", value)
        with self.assertRaisesRegex(ValueError, "noncanonical segment"):
            verify_and_extract(self.archive, manifest, self.root / "dist")
    def test_manifest_extra_field_fails_closed(self) -> None:
        manifest = manifest_for("index.html", b"fixture")
        manifest["unsupported"] = True
        path = self.root / "manifest.json"
        path.write_text(json.dumps(manifest), encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "unexpected or missing keys"):
            load_manifest(path)

    def test_manifest_duplicate_keys_constants_and_types_fail_closed(self) -> None:
        valid = manifest_for("index.html", b"fixture")
        cases = {
            "duplicate": json.dumps(valid)[:-1] + ',"schemaVersion":1}',
            "constant": json.dumps(valid).replace(
                '"schemaVersion": 1', '"schemaVersion": NaN'
            ),
            "boolean-schema": json.dumps({**valid, "schemaVersion": True}),
            "float-schema": json.dumps({**valid, "schemaVersion": 1.0}),
            "numeric-source-maps": json.dumps(
                {**valid, "build": {**valid["build"], "sourceMaps": 0}}
            ),
        }
        path = self.root / "manifest.json"
        for name, raw in cases.items():
            with self.subTest(name=name):
                path.write_text(raw, encoding="utf-8")
                with self.assertRaises(ValueError):
                    load_manifest(path)

    def test_portability_and_case_collisions_fail_closed(self) -> None:
        for value in [
            "C:escape.txt",
            "C:/escape.txt",
            "asset?query",
            "asset#fragment",
            "CON.txt",
            "trailing.",
            "assets/e\u0301.js",
            "assets/é.js",
        ]:
            with self.subTest(value=value):
                with self.assertRaises(ValueError):
                    canonical_repo_path(value, "fixture")
        with self.assertRaisesRegex(ValueError, "case-insensitively unique"):
            validate_path_set(["assets/A.js", "assets/a.js"], "fixture")

    def test_duplicate_extra_symlink_and_existing_output_fail_closed(
        self,
    ) -> None:
        value = b"fixture"
        manifest = manifest_for("index.html", value)
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", UserWarning)
            with ZipFile(self.archive, "w") as package:
                package.writestr("index.html", value)
                package.writestr("index.html", value)
        with self.assertRaisesRegex(ValueError, "unique"):
            verify_and_extract(self.archive, manifest, self.root / "duplicate")
        with ZipFile(self.archive, "w") as package:
            package.writestr("extra.html", value)
            package.writestr("index.html", value)
        with self.assertRaisesRegex(ValueError, "path set"):
            verify_and_extract(self.archive, manifest, self.root / "extra")
        link = ZipInfo("index.html")
        link.external_attr = 0o120777 << 16
        with ZipFile(self.archive, "w") as package:
            package.writestr(link, value)
        with self.assertRaisesRegex(ValueError, "symbolic-link"):
            verify_and_extract(self.archive, manifest, self.root / "link")
        with ZipFile(self.archive, "w", compression=ZIP_BZIP2) as package:
            package.writestr("index.html", value)
        with self.assertRaisesRegex(ValueError, "unsupported archive member"):
            verify_and_extract(
                self.archive, manifest, self.root / "compression"
            )
        with ZipFile(self.archive, "w") as package:
            package.writestr("index.html", value + b"longer")
        with self.assertRaisesRegex(ValueError, "byte-length mismatch"):
            verify_and_extract(self.archive, manifest, self.root / "length")
        with ZipFile(self.archive, "w") as package:
            package.writestr("index.html", value)
        existing = self.root / "existing"
        existing.mkdir()
        with self.assertRaisesRegex(ValueError, "already exists"):
            verify_and_extract(self.archive, manifest, existing)

    def test_special_file_modes_fail_closed(self) -> None:
        value = b"fixture"
        manifest = manifest_for("index.html", value)
        for mode in [0o010000, 0o020000, 0o040000, 0o060000, 0o140000]:
            with self.subTest(mode=oct(mode)):
                special = ZipInfo("index.html")
                special.create_system = 3
                special.external_attr = (mode | 0o600) << 16
                with ZipFile(self.archive, "w") as package:
                    package.writestr(special, value)
                with self.assertRaisesRegex(ValueError, "non-regular"):
                    verify_and_extract(
                        self.archive,
                        manifest,
                        self.root / f"special-{mode:o}",
                    )

    def test_physical_budget_and_prepended_payload_fail_closed(self) -> None:
        value = b"fixture"
        manifest = manifest_for("index.html", value)
        self.archive.write_bytes(b"x" * (MAX_ARCHIVE_BYTES + 1))
        with self.assertRaisesRegex(ValueError, "physical byte budget"):
            verify_and_extract(self.archive, manifest, self.root / "oversized")
        with ZipFile(self.archive, "w") as package:
            package.writestr("index.html", value)
        self.archive.write_bytes(b"opaque-prefix" + self.archive.read_bytes())
        with self.assertRaisesRegex(ValueError, "prepended payload"):
            verify_and_extract(self.archive, manifest, self.root / "prefixed")

    def test_late_validation_failure_leaves_retry_path_clean(self) -> None:
        first = b"first"
        second = b"second"
        manifest = manifest_for("a.txt", first)
        manifest["files"].append(
            {"path": "b.txt", "bytes": len(second), "sha256": "0" * 64}
        )
        with ZipFile(self.archive, "w") as package:
            package.writestr("a.txt", first)
            package.writestr("b.txt", second)
        output = self.root / "retry"
        with self.assertRaisesRegex(ValueError, "SHA-256 mismatch"):
            verify_and_extract(self.archive, manifest, output)
        self.assertFalse(output.exists())
        manifest["files"][1]["sha256"] = digest(second)
        verify_and_extract(self.archive, manifest, output)
        self.assertEqual((output / "a.txt").read_bytes(), first)
        self.assertEqual((output / "b.txt").read_bytes(), second)

    def test_member_reads_are_hard_bounded(self) -> None:
        self.assertEqual(
            read_member_bounded(io.BytesIO(b"exact"), 5, "fixture"),
            b"exact",
        )

        class HostileStream:
            def __init__(self) -> None:
                self.requests: list[int] = []

            def read(self, size: int = -1) -> bytes:
                self.requests.append(size)
                if size < 0:
                    raise AssertionError("unbounded member read")
                return b"x" * size

        hostile = HostileStream()
        with self.assertRaisesRegex(ValueError, "decompressed-length mismatch"):
            read_member_bounded(hostile, 7, "hostile")
        self.assertEqual(hostile.requests, [8])

    def test_manifest_release_budget_fails_closed(self) -> None:
        manifest = manifest_for("index.html", b"fixture")
        manifest["files"][0]["bytes"] = MAX_RELEASE_BYTES + 1
        path = self.root / "manifest.json"
        path.write_text(json.dumps(manifest), encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "byte budget"):
            load_manifest(path)
class PackagingCommitValidationTest(unittest.TestCase):
    def test_exact_arguments_and_regular_files_are_required(self) -> None:
        exact = (Path(CHECKSUM_PATH), Path(ARCHIVE_PATH), Path(MANIFEST_PATH))
        validate_packaging_arguments(*exact)
        for changed in [
            (exact[0], Path("other/archive.zip"), exact[2]),
            (exact[0], exact[1], Path("other/manifest.json")),
        ]:
            with self.subTest(changed=changed):
                with self.assertRaisesRegex(ValueError, "exact release paths"):
                    validate_packaging_arguments(*changed)
        link = os.stat_result((stat.S_IFLNK, 0, 0, 0, 0, 0, 0, 0, 0, 0))
        with mock.patch.object(Path, "lstat", return_value=link):
            with self.assertRaisesRegex(ValueError, "expected regular file"):
                require_regular_file(Path("synthetic-link"), "fixture")
            self.assertTrue(path_entry_exists(Path("broken-link")))
    def test_exact_parent_and_path_set_are_required(self) -> None:
        source = "0" * 40
        validate_packaging_identity(source, [source], list(PACKAGING_PATHS))
        invalid = [
            ([], list(PACKAGING_PATHS)),
            ([source, "1" * 40], list(PACKAGING_PATHS)),
            (["1" * 40], list(PACKAGING_PATHS)),
            ([source], list(PACKAGING_PATHS[:-1])),
            ([source], [*PACKAGING_PATHS, "src/app.tsx"]),
        ]
        for parents, paths in invalid:
            with self.subTest(parents=parents, paths=paths):
                with self.assertRaises(ValueError):
                    validate_packaging_identity(source, parents, paths)

    def test_parent_git_blob_is_sized_before_content_is_read(self) -> None:
        git = mock.Mock(
            return_value=f"{MAX_CHECKSUM_BYTES + 1}\n".encode("ascii")
        )
        with mock.patch.dict(
            read_git_blob_bounded.__globals__, {"git_output": git}
        ):
            with self.assertRaisesRegex(ValueError, "input byte budget"):
                read_git_blob_bounded(
                    "HEAD^:SHA256SUMS",
                    "parent SHA256SUMS",
                    MAX_CHECKSUM_BYTES,
                )
        git.assert_called_once_with(
            ["cat-file", "-s", "HEAD^:SHA256SUMS"],
            "parent SHA256SUMS",
        )
    def test_ledger_preserves_parent_and_appends_exactly_two_lines(self) -> None:
        with tempfile.TemporaryDirectory(
            prefix="phrasegarden-ledger-test-"
        ) as directory:
            root = Path(directory)
            original = Path.cwd()
            try:
                os.chdir(root)
                archive = Path("release.zip")
                manifest = Path("manifest.json")
                archive.write_bytes(b"archive")
                manifest.write_bytes(b"manifest")
                parent = f"{'A' * 64}  release/old.zip\n".encode()
                appended = (
                    f"{digest(archive.read_bytes())}  release.zip\n"
                    f"{digest(manifest.read_bytes())}  manifest.json\n"
                ).encode()
                validate_ledger_append(
                    parent, parent + appended, archive, manifest
                )
                for current in [
                    appended,
                    parent + appended + b"extra\n",
                ]:
                    with self.subTest(current=current):
                        with self.assertRaisesRegex(
                            ValueError, "preserve the parent bytes"
                        ):
                            validate_ledger_append(
                                parent, current, archive, manifest
                            )
            finally:
                os.chdir(original)

    def test_packaging_mode_binds_every_worktree_file_to_head(self) -> None:
        with tempfile.TemporaryDirectory(
            prefix="phrasegarden-packaging-git-test-"
        ) as directory:
            root = Path(directory)
            run_git(root, "init")
            run_git(root, "config", "user.name", "Synthetic test")
            run_git(root, "config", "user.email", "test@example.invalid")
            parent_ledger = f"{'A' * 64}  release/old.zip\n".encode()
            (root / CHECKSUM_PATH).write_bytes(parent_ledger)
            run_git(root, "add", CHECKSUM_PATH)
            run_git(root, "commit", "-m", "parent")
            source = run_git(root, "rev-parse", "HEAD").decode().strip()

            for name in PACKAGING_PATHS[1:]:
                path = root.joinpath(*name.split("/"))
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(f"committed {name}\n".encode())
            archive = root.joinpath(*ARCHIVE_PATH.split("/"))
            manifest = root.joinpath(*MANIFEST_PATH.split("/"))
            ledger = root / CHECKSUM_PATH
            ledger.write_bytes(
                parent_ledger
                + f"{digest(archive.read_bytes())}  {ARCHIVE_PATH}\n".encode()
                + f"{digest(manifest.read_bytes())}  {MANIFEST_PATH}\n".encode()
            )
            run_git(root, "add", *PACKAGING_PATHS)
            run_git(root, "commit", "-m", "package")

            original = Path.cwd()
            try:
                os.chdir(root)
                verify_packaging_commit(
                    source,
                    Path(CHECKSUM_PATH),
                    Path(ARCHIVE_PATH),
                    Path(MANIFEST_PATH),
                )
                archive.write_bytes(b"dirty archive")
                manifest.write_bytes(b"dirty manifest")
                ledger.write_bytes(
                    parent_ledger
                    + f"{digest(archive.read_bytes())}  {ARCHIVE_PATH}\n".encode()
                    + f"{digest(manifest.read_bytes())}  {MANIFEST_PATH}\n".encode()
                )
                with self.assertRaisesRegex(ValueError, "HEAD blob"):
                    verify_packaging_commit(
                        source,
                        Path(CHECKSUM_PATH),
                        Path(ARCHIVE_PATH),
                        Path(MANIFEST_PATH),
                    )
            finally:
                os.chdir(original)


if __name__ == "__main__":
    unittest.main()
