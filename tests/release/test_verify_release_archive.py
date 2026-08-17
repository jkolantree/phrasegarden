from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import runpy
import stat
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
require_regular_file = MODULE["require_regular_file"]
PACKAGING_PATHS = MODULE["PACKAGING_PATHS"]
MAX_RELEASE_BYTES = MODULE["MAX_RELEASE_BYTES"]
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
    def test_portability_and_case_collisions_fail_closed(self) -> None:
        for value in [
            "C:escape.txt",
            "C:/escape.txt",
            "asset?query",
            "asset#fragment",
            "CON.txt",
            "trailing.",
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
if __name__ == "__main__":
    unittest.main()
