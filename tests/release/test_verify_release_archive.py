from __future__ import annotations

import hashlib
import io
import json
import os
from pathlib import Path
import re
import runpy
import shutil
import stat
import subprocess
import sys
import tempfile
import unittest
from unittest import mock
import warnings
from zipfile import ZIP_BZIP2, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[2]
BASE = "c245244400858d759176b4d0679c343b700a5fde"
sys.path.insert(0, str(ROOT / "scripts"))
MODULE = runpy.run_path(str(ROOT / "scripts" / "release_archive_verifier.py"))
RELEASE_SPECS = MODULE["RELEASE_SPECS"]
PREVIEW3_SPEC = RELEASE_SPECS["preview3"]
PREVIEW4_SPEC = RELEASE_SPECS["preview4"]
PREVIEW5_SPEC = RELEASE_SPECS["preview5"]
PREVIEW6_SPEC = RELEASE_SPECS["preview6"]
PREVIEW7_SPEC = RELEASE_SPECS["preview7"]
PREVIEW8_SPEC = RELEASE_SPECS["preview8"]
PREVIEW9_SPEC = RELEASE_SPECS["preview9"]
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
read_commit_blob_bounded = MODULE["read_commit_blob_bounded"]
release_input_limit = MODULE["release_input_limit"]
validate_manifest_identity = MODULE["validate_manifest_identity"]
validate_source_release_identity = MODULE["validate_source_release_identity"]
run_for = MODULE["run_for"]
git_output = MODULE["git_output"]
require_packaging_repository = MODULE["require_packaging_repository"]
require_head_blob = MODULE["require_head_blob"]
ToolError = MODULE["ToolError"]
PACKAGING_PATHS = PREVIEW3_SPEC.packaging_paths
MAX_RELEASE_BYTES = MODULE["MAX_RELEASE_BYTES"]
MAX_ARCHIVE_BYTES = MODULE["MAX_ARCHIVE_BYTES"]
MAX_MANIFEST_BYTES = MODULE["MAX_MANIFEST_BYTES"]
MAX_CHECKSUM_BYTES = MODULE["MAX_CHECKSUM_BYTES"]
MAX_CHECKSUM_TARGET_BYTES = MODULE["MAX_CHECKSUM_TARGET_BYTES"]
MAX_PACKAGE_JSON_BYTES = MODULE["MAX_PACKAGE_JSON_BYTES"]
CHECKSUM_PATH = MODULE["CHECKSUM_PATH"]
MANIFEST_PATH = PREVIEW3_SPEC.final_manifest.as_posix()
ARCHIVE_PATH = PREVIEW3_SPEC.final_archive.as_posix()

def digest(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest().upper()


LEDGER_ROW = re.compile(rb"([0-9A-F]{64})  ([A-Za-z0-9][A-Za-z0-9._/-]*)\n")


def fixture_ledger_rows(value: bytes) -> list[tuple[str, str]]:
    if not value or not value.endswith(b"\n"):
        raise AssertionError("fixture ledger must be nonempty and LF-terminated")
    rows: list[tuple[str, str]] = []
    folded: set[str] = set()
    for line in value.splitlines(keepends=True):
        matched = LEDGER_ROW.fullmatch(line)
        if matched is None:
            raise AssertionError("fixture ledger row is not canonical")
        name = matched.group(2).decode("ascii")
        parts = name.split("/")
        if name.startswith("/") or name.endswith("/") or any(
            part in ("", ".", "..") for part in parts
        ):
            raise AssertionError("fixture ledger path is not canonical")
        collision = name.lower()
        if collision in folded:
            raise AssertionError("fixture ledger path is duplicate or case-colliding")
        folded.add(collision)
        rows.append((matched.group(1).decode("ascii"), name))
    return rows


def fixture_regular_bytes(path: Path) -> bytes:
    if not stat.S_ISREG(path.lstat().st_mode):
        raise AssertionError(f"fixture path is not a regular file: {path}")
    return path.read_bytes()


def release_parent_ledger(spec, value: bytes | None = None) -> bytes:
    raw = (ROOT / CHECKSUM_PATH).read_bytes() if value is None else value
    binding = spec.parent_ledger_binding
    if binding is None:
        raise AssertionError(f"{spec.id} predecessor binding is missing")
    length, expected_digest = binding
    parent = raw[:length]
    if (len(parent), digest(parent)) != (length, expected_digest) or not parent.endswith(b"\n"):
        raise AssertionError(f"{spec.id} predecessor ledger bytes do not match")
    fixture_ledger_rows(parent)
    return parent


def release_append_rows(spec) -> tuple[bytes, bytes] | None:
    paths = (ROOT / spec.final_archive, ROOT / spec.final_manifest)
    present = tuple(path.exists() for path in paths)
    if present == (False, False):
        return None
    if present != (True, True):
        raise AssertionError(f"{spec.id} release outputs are partial")
    rows = []
    for release_path, path in zip(
        (spec.final_archive, spec.final_manifest), paths, strict=True
    ):
        value = fixture_regular_bytes(path)
        rows.append(f"{digest(value)}  {release_path.as_posix()}\n".encode("ascii"))
    return rows[0], rows[1]


def validate_release_ledger_state(spec, value: bytes) -> list[tuple[str, str]]:
    parent = release_parent_ledger(spec, value)
    appended = release_append_rows(spec)
    valid = (parent,) if appended is None else (parent, parent + b"".join(appended))
    if value not in valid:
        raise AssertionError(f"{spec.id} ledger state is not exact")
    return fixture_ledger_rows(value)


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


def fixture_git_environment() -> dict[str, str]:
    environment = {name: value for name, value in os.environ.items()
                   if not name.upper().startswith("GIT_")}
    environment.update({"GIT_CONFIG_NOSYSTEM": "1", "GIT_CONFIG_GLOBAL": os.devnull,
        "GIT_TERMINAL_PROMPT": "0", "GIT_ALLOW_PROTOCOL": "file",
        "GIT_OPTIONAL_LOCKS": "0", "LC_ALL": "C", "LANG": "C"})
    return environment


def run_git(root: Path, *arguments: str) -> bytes:
    return subprocess.run(
        ["git", "-c", "commit.gpgSign=false", "-c", "core.autocrlf=false",
         "-c", f"core.hooksPath={os.devnull}", "-c",
         f"safe.directory={root.resolve().as_posix()}", "-C", str(root), *arguments],
        check=True, capture_output=True, env=fixture_git_environment(),
    ).stdout


def build_package(
    root: Path,
    spec=PREVIEW3_SPEC,
    *,
    release_version: str | None = None,
    package_version: str | None = None,
    extra_path: bool = False,
    reverse_append: bool = False,
) -> tuple[str, list[str]]:
    run_git(root, "init", "--object-format=sha1", "--template=")
    run_git(root, "config", "user.name", "Synthetic test")
    run_git(root, "config", "user.email", "test@example.invalid")
    if spec.parent_ledger_binding is not None:
        parent_ledger = release_parent_ledger(spec)
        source_paths = [CHECKSUM_PATH, "package.json"]
        for expected_digest, name in fixture_ledger_rows(parent_ledger):
            value = fixture_regular_bytes(ROOT.joinpath(*name.split("/")))
            if digest(value) != expected_digest:
                raise AssertionError(f"fixture ledger digest does not match: {name}")
            target = root.joinpath(*name.split("/"))
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(value)
            source_paths.append(name)
    else:
        old = root / "release" / "old.zip"
        old.parent.mkdir()
        old.write_bytes(b"qualified predecessor\n")
        parent_ledger = f"{digest(old.read_bytes())}  release/old.zip\n".encode()
        source_paths = [CHECKSUM_PATH, "package.json", "release/old.zip"]
    (root / CHECKSUM_PATH).write_bytes(parent_ledger)
    (root / "package.json").write_text(
        json.dumps({"version": package_version or spec.required_package_version}) + "\n",
        encoding="utf-8",
    )
    run_git(root, "add", *source_paths)
    run_git(root, "commit", "-m", "source")
    source = run_git(root, "rev-parse", "HEAD").decode().strip()
    for name in spec.packaging_paths[1:-2]:
        path = root.joinpath(*name.split("/"))
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(f"committed {name}\n".encode())
    archive = root / spec.final_archive
    value = f"qualified {spec.id} extraction\n".encode()
    with ZipFile(archive, "w") as package:
        package.writestr("index.html", value)
    manifest = manifest_for("index.html", value)
    version = release_version or spec.release_version
    manifest.update(releaseVersion=version,
                    artifactName=f"phrasegarden-{version}-pages.zip")
    manifest["sourceProvenance"]["gitCommit"] = source
    manifest_path = root / spec.final_manifest
    manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
    appended = [
        f"{digest(archive.read_bytes())}  {spec.final_archive.as_posix()}\n".encode(),
        f"{digest(manifest_path.read_bytes())}  {spec.final_manifest.as_posix()}\n".encode(),
    ]
    tail = reversed(appended) if reverse_append else appended
    (root / CHECKSUM_PATH).write_bytes(parent_ledger + b"".join(tail))
    added = list(spec.packaging_paths)
    if extra_path:
        extra = root / "src" / "extra.txt"
        extra.parent.mkdir()
        extra.write_text("extra\n", encoding="utf-8")
        added.append("src/extra.txt")
    run_git(root, "add", *added)
    run_git(root, "commit", "-m", "package")
    return source, ["--archive", spec.final_archive.as_posix(), "--manifest",
                    spec.final_manifest.as_posix(), "--checksums", CHECKSUM_PATH,
                    "--output", "dist", "--require-packaging-commit"]


class PinnedAdapterCompatibilityTest(unittest.TestCase):
    def invoke(self, script: Path, arguments: list[str],
               root: Path) -> subprocess.CompletedProcess[bytes]:
        return subprocess.run(
            [sys.executable, "-B", str(script), *arguments], cwd=root,
            capture_output=True, env=fixture_git_environment(),
        )

    def test_preview3_help_and_generic_extraction_match_the_base(self) -> None:
        with tempfile.TemporaryDirectory(prefix="phrasegarden-verifier-compat-") as directory:
            root = Path(directory)
            base_script = root / "verify-release-archive.py"
            base_script.write_bytes(run_git(
                ROOT, "show", f"{BASE}:scripts/verify-release-archive.py"))
            current = ROOT / "scripts" / "verify-release-archive.py"
            old_help = self.invoke(base_script, ["--help"], root)
            new_help = self.invoke(current, ["--help"], root)
            self.assertEqual((new_help.returncode, new_help.stdout, new_help.stderr),
                             (old_help.returncode, old_help.stdout, old_help.stderr))

            release = root / "release"
            release.mkdir()
            value = b"synthetic generic extraction\n"
            archive = release / "phrasegarden-synthetic-pages.zip"
            with ZipFile(archive, "w") as package:
                package.writestr("index.html", value)
            manifest = manifest_for("index.html", value)
            manifest["releaseVersion"] = "synthetic"
            manifest["artifactName"] = archive.name
            manifest_path = release / "synthetic-manifest.json"
            manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
            unrelated = root / PREVIEW4_SPEC.final_manifest
            unrelated.write_bytes(b"x" * (MAX_MANIFEST_BYTES + 1))
            unrelated_p5 = root / PREVIEW5_SPEC.final_manifest
            unrelated_p5.write_bytes(b"x" * (MAX_MANIFEST_BYTES + 1))
            unrelated_p6 = root / PREVIEW6_SPEC.final_manifest
            unrelated_p6.write_bytes(b"x" * (MAX_MANIFEST_BYTES + 1))
            unrelated_p7 = root / PREVIEW7_SPEC.final_manifest
            unrelated_p7.write_bytes(b"x" * (MAX_MANIFEST_BYTES + 1))
            unrelated_p8 = root / PREVIEW8_SPEC.final_manifest
            unrelated_p8.write_bytes(b"x" * (MAX_MANIFEST_BYTES + 1))
            unrelated_p9 = root / PREVIEW9_SPEC.final_manifest
            unrelated_p9.write_bytes(b"x" * (MAX_MANIFEST_BYTES + 1))
            (root / CHECKSUM_PATH).write_text(
                f"{digest(archive.read_bytes())}  {archive.relative_to(root).as_posix()}\n"
                f"{digest(manifest_path.read_bytes())}  {manifest_path.relative_to(root).as_posix()}\n"
                f"{digest(unrelated.read_bytes())}  {PREVIEW4_SPEC.final_manifest.as_posix()}\n"
                f"{digest(unrelated_p5.read_bytes())}  {PREVIEW5_SPEC.final_manifest.as_posix()}\n"
                f"{digest(unrelated_p6.read_bytes())}  {PREVIEW6_SPEC.final_manifest.as_posix()}\n"
                f"{digest(unrelated_p7.read_bytes())}  {PREVIEW7_SPEC.final_manifest.as_posix()}\n"
                f"{digest(unrelated_p8.read_bytes())}  {PREVIEW8_SPEC.final_manifest.as_posix()}\n"
                f"{digest(unrelated_p9.read_bytes())}  {PREVIEW9_SPEC.final_manifest.as_posix()}\n",
                encoding="utf-8",
            )
            arguments = [
                "--archive", archive.relative_to(root).as_posix(),
                "--manifest", manifest_path.relative_to(root).as_posix(),
                "--checksums", CHECKSUM_PATH, "--output", "dist",
            ]
            old = self.invoke(base_script, arguments, root)
            old_output = (root / "dist" / "index.html").read_bytes()
            shutil.rmtree(root / "dist")
            new = self.invoke(current, arguments, root)
            self.assertEqual((new.returncode, new.stdout, new.stderr),
                             (old.returncode, old.stdout, old.stderr))
            self.assertEqual((root / "dist" / "index.html").read_bytes(), old_output)
            shutil.rmtree(root / "dist")
            for spec_id in (
                "preview4", "preview5", "preview6", "preview7", "preview8",
                "preview9",
            ):
                with self.subTest(spec_id=spec_id):
                    strict = self.invoke(
                        ROOT / "scripts" / f"{spec_id}-verify-release-archive.py",
                        arguments,
                        root,
                    )
                    self.assertEqual(strict.returncode, 1)
                    self.assertIn(b"input byte budget exceeded", strict.stderr)
                    self.assertFalse((root / "dist").exists())

    def test_preview3_qualifying_success_and_order_match_the_base(self) -> None:
        cases = [
            ({}, None),
            ({"release_version": "0.1.0-preview.4", "extra_path": True},
             b"packaging commit path set does not equal the exact allowlist\n"),
            ({"package_version": "wrong", "reverse_append": True},
             b"SHA256SUMS must preserve the parent bytes and append exactly the "
             b"Preview 3 archive and manifest\n"),
        ]
        for index, (options, expected_error) in enumerate(cases):
            with self.subTest(options=options), tempfile.TemporaryDirectory(
                prefix=f"phrasegarden-preview3-differential-{index}-"
            ) as directory:
                root = Path(directory)
                _, arguments = build_package(root, **options)
                base_script = root / f"preview3-base-{index}.py"
                base_script.write_bytes(run_git(
                    ROOT, "show", f"{BASE}:scripts/verify-release-archive.py"))
                old = self.invoke(base_script, arguments, root)
                old_tree = ([p.relative_to(root / "dist").as_posix(), p.read_bytes()]
                            for p in (root / "dist").rglob("*") if p.is_file())
                old_tree = dict(old_tree) if (root / "dist").exists() else {}
                shutil.rmtree(root / "dist", ignore_errors=True)
                new = self.invoke(
                    ROOT / "scripts" / "verify-release-archive.py", arguments, root)
                self.assertEqual(
                    (new.returncode, new.stdout, new.stderr.replace(b"\r\n", b"\n")),
                    (old.returncode, old.stdout, old.stderr.replace(b"\r\n", b"\n")),
                )
                if expected_error is None:
                    actual = {p.relative_to(root / "dist").as_posix(): p.read_bytes()
                              for p in (root / "dist").rglob("*") if p.is_file()}
                    self.assertEqual((old.returncode, old.stderr), (0, b""))
                    self.assertEqual(old_tree, {"index.html": b"qualified preview3 extraction\n"})
                    self.assertEqual(actual, old_tree)
                else:
                    self.assertEqual(new.stderr.replace(b"\r\n", b"\n"), expected_error)
                    self.assertEqual(new.stdout, b"")
                    self.assertFalse((root / "dist").exists())

    def test_adapters_are_pinned_and_direct_or_unknown_selection_fails(self) -> None:
        core = self.invoke(ROOT / "scripts" / "release_archive_verifier.py", [], ROOT)
        self.assertEqual(core.returncode, 1)
        self.assertEqual(core.stderr.replace(b"\r\n", b"\n"),
                         b"release verifier core requires a pinned adapter\n")
        for spec_id in (
            "preview4", "preview5", "preview6", "preview7", "preview8",
            "preview9",
        ):
            with self.subTest(spec_id=spec_id):
                strict = self.invoke(
                    ROOT / "scripts" / f"{spec_id}-verify-release-archive.py",
                    ["--help"],
                    ROOT,
                )
                self.assertEqual(strict.returncode, 0)
                self.assertNotIn(b"--release", strict.stdout)
                self.assertNotIn(b"--version", strict.stdout)
        documented = subprocess.run(
            [sys.executable, "-B", "-c", "import runpy;from pathlib import Path;"
             "m=runpy.run_path('scripts/verify-release-archive.py');"
             "print(len(m['verify_checksums'](Path('SHA256SUMS'))))"],
            cwd=ROOT, capture_output=True,
        )
        expected_count = len(fixture_ledger_rows((ROOT / CHECKSUM_PATH).read_bytes()))
        self.assertEqual(
            (documented.returncode, documented.stdout.replace(b"\r\n", b"\n")),
            (0, f"{expected_count}\n".encode("ascii")),
        )
        error = io.StringIO()
        with mock.patch.object(sys, "stderr", error):
            self.assertEqual(run_for("Preview5"), 1)
        self.assertEqual(error.getvalue(), "release specification ID is unsupported\n")


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
        checksums = verify_checksums(PREVIEW3_SPEC, self.write_ledger([self.manifest]))
        with self.assertRaisesRegex(ValueError, "missing SHA256SUMS entry"):
            require_checksum(PREVIEW3_SPEC, checksums, self.archive, "archive")
    def test_missing_manifest_entry_fails_closed(self) -> None:
        checksums = verify_checksums(PREVIEW3_SPEC, self.write_ledger([self.archive]))
        with self.assertRaisesRegex(ValueError, "missing SHA256SUMS entry"):
            require_checksum(PREVIEW3_SPEC, checksums, self.manifest, "manifest")
    def test_mismatched_digest_fails_closed(self) -> None:
        ledger = self.write_ledger([self.archive, self.manifest])
        ledger.write_text(
            ledger.read_text(encoding="utf-8").replace(
                digest(self.archive.read_bytes()), "0" * 64, 1
            ),
            encoding="utf-8",
        )
        with self.assertRaisesRegex(ValueError, "SHA-256 mismatch"):
            verify_checksums(PREVIEW3_SPEC, ledger)

    def test_ledger_and_manifest_inputs_are_bounded(self) -> None:
        ledger = Path("SHA256SUMS")
        ledger.write_bytes(b"x" * (MAX_CHECKSUM_BYTES + 1))
        with self.assertRaisesRegex(ValueError, "input byte budget"):
            verify_checksums(PREVIEW3_SPEC, ledger)
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
            verify_checksums(PREVIEW3_SPEC, ledger)
        with self.assertRaisesRegex(ValueError, "input byte budget"):
            require_checksum(
                PREVIEW3_SPEC,
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
            verify_checksums(PREVIEW3_SPEC, ledger)


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
        events: list[str] = []
        with mock.patch.dict(require_head_blob.__globals__, {
            "require_directories": lambda *args, **kwargs: events.append("directory"),
            "read_regular": lambda *args, **kwargs: events.append("read") or b"x",
        }):
            require_head_blob({"x": ("", 1, digest(b"x"))}, "x")
        self.assertEqual(events, ["directory", "read", "directory"])
        exact = (Path(CHECKSUM_PATH), Path(ARCHIVE_PATH), Path(MANIFEST_PATH))
        validate_packaging_arguments(PREVIEW3_SPEC, *exact)
        preview4_exact = (Path(CHECKSUM_PATH), PREVIEW4_SPEC.final_archive,
                          PREVIEW4_SPEC.final_manifest)
        validate_packaging_arguments(PREVIEW4_SPEC, *preview4_exact)
        preview5_exact = (Path(CHECKSUM_PATH), PREVIEW5_SPEC.final_archive,
                          PREVIEW5_SPEC.final_manifest)
        validate_packaging_arguments(PREVIEW5_SPEC, *preview5_exact)
        preview6_exact = (Path(CHECKSUM_PATH), PREVIEW6_SPEC.final_archive,
                          PREVIEW6_SPEC.final_manifest)
        validate_packaging_arguments(PREVIEW6_SPEC, *preview6_exact)
        preview7_exact = (Path(CHECKSUM_PATH), PREVIEW7_SPEC.final_archive,
                          PREVIEW7_SPEC.final_manifest)
        validate_packaging_arguments(PREVIEW7_SPEC, *preview7_exact)
        preview8_exact = (Path(CHECKSUM_PATH), PREVIEW8_SPEC.final_archive,
                          PREVIEW8_SPEC.final_manifest)
        validate_packaging_arguments(PREVIEW8_SPEC, *preview8_exact)
        preview9_exact = (Path(CHECKSUM_PATH), PREVIEW9_SPEC.final_archive,
                          PREVIEW9_SPEC.final_manifest)
        validate_packaging_arguments(PREVIEW9_SPEC, *preview9_exact)
        for changed in [
            (exact[0], Path("other/archive.zip"), exact[2]),
            (exact[0], exact[1], Path("other/manifest.json")),
            (exact[0], PREVIEW4_SPEC.final_archive, exact[2]),
            (exact[0], exact[1], PREVIEW4_SPEC.final_manifest),
            (exact[0], PREVIEW5_SPEC.final_archive, exact[2]),
            (exact[0], exact[1], PREVIEW5_SPEC.final_manifest),
            (exact[0], PREVIEW6_SPEC.final_archive, exact[2]),
            (exact[0], exact[1], PREVIEW6_SPEC.final_manifest),
            (exact[0], PREVIEW7_SPEC.final_archive, exact[2]),
            (exact[0], exact[1], PREVIEW7_SPEC.final_manifest),
            (exact[0], PREVIEW8_SPEC.final_archive, exact[2]),
            (exact[0], exact[1], PREVIEW8_SPEC.final_manifest),
            (exact[0], PREVIEW9_SPEC.final_archive, exact[2]),
            (exact[0], exact[1], PREVIEW9_SPEC.final_manifest),
            ("./SHA256SUMS", ARCHIVE_PATH, MANIFEST_PATH),
            (CHECKSUM_PATH, ARCHIVE_PATH.replace("/", "\\"), MANIFEST_PATH),
            (CHECKSUM_PATH, ARCHIVE_PATH, MANIFEST_PATH.replace("/", "//", 1)),
        ]:
            with self.subTest(changed=changed):
                message = "exact release paths" if isinstance(changed[0], Path) else "path"
                with self.assertRaisesRegex(ValueError, message):
                    validate_packaging_arguments(PREVIEW3_SPEC, *changed)
        link = os.stat_result((stat.S_IFLNK, 0, 0, 0, 0, 0, 0, 0, 0, 0))
        with mock.patch.object(Path, "lstat", return_value=link):
            with self.assertRaisesRegex(ValueError, "expected regular file"):
                require_regular_file(Path("synthetic-link"), "fixture")
            self.assertTrue(path_entry_exists(Path("broken-link")))

    def test_packaging_manifest_identity_is_exact_for_each_spec(self) -> None:
        preview3 = manifest_for("index.html", b"fixture")
        validate_manifest_identity(PREVIEW3_SPEC, preview3)
        for spec in (
            PREVIEW4_SPEC, PREVIEW5_SPEC, PREVIEW6_SPEC, PREVIEW7_SPEC,
            PREVIEW8_SPEC, PREVIEW9_SPEC,
        ):
            with self.subTest(spec=spec.id):
                with self.assertRaisesRegex(ValueError, "releaseVersion"):
                    validate_manifest_identity(spec, preview3)
                strict = {
                    **preview3,
                    "releaseVersion": spec.release_version,
                    "artifactName": spec.archive_name,
                }
                validate_manifest_identity(spec, strict)
                with self.assertRaisesRegex(ValueError, "artifactName"):
                    validate_manifest_identity(
                        spec, {**strict, "artifactName": PREVIEW3_SPEC.archive_name}
                    )

    def test_checksum_budget_is_scoped_to_the_pinned_adapter(self) -> None:
        preview4_manifest = PREVIEW4_SPEC.final_manifest.as_posix()
        self.assertEqual(
            release_input_limit(PREVIEW3_SPEC, preview4_manifest),
            MAX_CHECKSUM_TARGET_BYTES,
        )
        self.assertEqual(
            release_input_limit(PREVIEW4_SPEC, preview4_manifest), MAX_MANIFEST_BYTES
        )
        preview5_manifest = PREVIEW5_SPEC.final_manifest.as_posix()
        self.assertEqual(
            release_input_limit(PREVIEW4_SPEC, preview5_manifest),
            MAX_CHECKSUM_TARGET_BYTES,
        )
        self.assertEqual(
            release_input_limit(PREVIEW5_SPEC, preview5_manifest), MAX_MANIFEST_BYTES
        )
        preview6_manifest = PREVIEW6_SPEC.final_manifest.as_posix()
        self.assertEqual(
            release_input_limit(PREVIEW5_SPEC, preview6_manifest),
            MAX_CHECKSUM_TARGET_BYTES,
        )
        self.assertEqual(
            release_input_limit(PREVIEW6_SPEC, preview6_manifest), MAX_MANIFEST_BYTES
        )
        preview7_manifest = PREVIEW7_SPEC.final_manifest.as_posix()
        self.assertEqual(
            release_input_limit(PREVIEW6_SPEC, preview7_manifest),
            MAX_CHECKSUM_TARGET_BYTES,
        )
        self.assertEqual(
            release_input_limit(PREVIEW7_SPEC, preview7_manifest), MAX_MANIFEST_BYTES
        )
        preview8_manifest = PREVIEW8_SPEC.final_manifest.as_posix()
        self.assertEqual(
            release_input_limit(PREVIEW7_SPEC, preview8_manifest),
            MAX_CHECKSUM_TARGET_BYTES,
        )
        self.assertEqual(
            release_input_limit(PREVIEW8_SPEC, preview8_manifest), MAX_MANIFEST_BYTES
        )
        preview9_manifest = PREVIEW9_SPEC.final_manifest.as_posix()
        self.assertEqual(
            release_input_limit(PREVIEW8_SPEC, preview9_manifest),
            MAX_CHECKSUM_TARGET_BYTES,
        )
        self.assertEqual(
            release_input_limit(PREVIEW9_SPEC, preview9_manifest), MAX_MANIFEST_BYTES
        )
    def test_exact_parent_and_path_set_are_required(self) -> None:
        source = "0" * 40
        validate_packaging_identity(
            PREVIEW3_SPEC, source, [source], list(PACKAGING_PATHS)
        )
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
                    validate_packaging_identity(
                        PREVIEW3_SPEC, source, parents, paths
                    )

    def test_git_boundary_preserves_codes_and_rejects_redirecting_environment(self) -> None:
        denied = ToolError("E-GIT-OUTPUT-LIMIT", "Git output byte budget exceeded")
        with mock.patch.dict(
            git_output.__globals__, {"hardened_git": mock.Mock(side_effect=denied)}
        ):
            with self.assertRaises(ToolError) as caught:
                git_output(["status"], "fixture")
        self.assertEqual(caught.exception.code, "E-GIT-OUTPUT-LIMIT")
        self.assertEqual(str(caught.exception), "fixture: Git output byte budget exceeded")
        with mock.patch.dict(os.environ, {"GIT_DIR": "redirected"}):
            with self.assertRaises(ToolError) as redirected:
                require_packaging_repository()
        self.assertEqual(redirected.exception.code, "E-GIT-ENV")

    def test_committed_blob_requires_mode_before_typed_read(self) -> None:
        object_id = "a" * 40
        nonregular = mock.Mock(
            return_value=f"100755 blob {object_id}\tpackage.json\0".encode()
        )
        with mock.patch.dict(
            read_commit_blob_bounded.__globals__, {"git_output": nonregular}
        ):
            with self.assertRaisesRegex(ValueError, "committed regular blob"):
                read_commit_blob_bounded(
                    "0" * 40,
                    "package.json",
                    "source package.json",
                    MAX_PACKAGE_JSON_BYTES,
                )
        nonregular.assert_called_once()

    def test_strict_source_identities_are_predecessor_bound(self) -> None:
        for spec in (
            PREVIEW4_SPEC, PREVIEW5_SPEC, PREVIEW6_SPEC, PREVIEW7_SPEC,
            PREVIEW8_SPEC, PREVIEW9_SPEC,
        ):
            with self.subTest(spec=spec.id):
                ledger = release_parent_ledger(spec)
                version = spec.required_package_version
                values = {
                    "package.json": f'{{"version":"{version}"}}\n'.encode("ascii"),
                    **{
                        path.as_posix(): (ROOT / path).read_bytes()
                        for path, _, _ in spec.predecessor_bindings
                    },
                }

                def reader(_: str, name: str, __: str, ___: int) -> bytes:
                    return values[name]

                with mock.patch.dict(
                    validate_source_release_identity.__globals__,
                    {"read_commit_blob_bounded": reader},
                ):
                    validate_source_release_identity(spec, "0" * 40, ledger)
                    for package in [
                        b"{}\n",
                        b'{"version":true}\n',
                        b'{"version":"0.1.0-preview.3"}\n',
                        f'{{"version":"{version}","version":"{version}"}}\n'.encode("ascii"),
                        f'{{"version":"{version}","x":NaN}}\n'.encode("ascii"),
                    ]:
                        with self.subTest(spec=spec.id, package=package):
                            values["package.json"] = package
                            with self.assertRaises(ValueError):
                                validate_source_release_identity(spec, "0" * 40, ledger)
                    values["package.json"] = f'{{"version":"{version}"}}\n'.encode("ascii")
                    with self.assertRaisesRegex(ValueError, "qualified predecessor ledger"):
                        validate_source_release_identity(spec, "0" * 40, ledger + b"x")
                    predecessor = spec.predecessor_bindings[0][0].as_posix()
                    values[predecessor] += b"x"
                    with self.assertRaisesRegex(ValueError, "byte identity mismatch"):
                        validate_source_release_identity(spec, "0" * 40, ledger)

    def test_strict_parent_ledgers_accept_only_lifecycle_states(self) -> None:
        current = (ROOT / CHECKSUM_PATH).read_bytes()
        if release_append_rows(PREVIEW9_SPEC) is None:
            self.assertEqual(
                validate_release_ledger_state(PREVIEW8_SPEC, current),
                fixture_ledger_rows(current),
            )
        else:
            with self.assertRaisesRegex(AssertionError, "state is not exact"):
                validate_release_ledger_state(PREVIEW8_SPEC, current)
        self.assertEqual(
            validate_release_ledger_state(PREVIEW9_SPEC, current),
            fixture_ledger_rows(current),
        )
        for spec in (
            PREVIEW4_SPEC, PREVIEW5_SPEC, PREVIEW6_SPEC, PREVIEW7_SPEC,
            PREVIEW8_SPEC, PREVIEW9_SPEC,
        ):
            with self.subTest(spec=spec.id):
                parent = release_parent_ledger(spec)
                self.assertEqual(
                    validate_release_ledger_state(spec, parent),
                    fixture_ledger_rows(parent),
                )
                appended = release_append_rows(spec)
                if appended is not None:
                    archive, manifest = appended
                    final = parent + archive + manifest
                    self.assertEqual(
                        validate_release_ledger_state(spec, final),
                        fixture_ledger_rows(final),
                    )
                    invalid = [
                        parent + archive,
                        parent + manifest,
                        parent + manifest + archive,
                        final + b"x",
                        parent + b"0" * 64 + archive[64:] + manifest,
                        parent + archive.replace(b"preview.", b"Preview.") + manifest,
                        parent + archive.replace(b"pages.zip", b"other.zip") + manifest,
                    ]
                    for value in invalid:
                        with self.subTest(spec=spec.id, value=value[-120:]), \
                                self.assertRaisesRegex(AssertionError, "state is not exact"):
                            validate_release_ledger_state(spec, value)
                with self.assertRaisesRegex(AssertionError, "do not match"):
                    release_parent_ledger(spec, b"x" + parent[1:])

    def test_fixture_ledger_parser_fails_closed(self) -> None:
        row = b"A" * 64 + b"  release/a.zip\n"
        invalid = [
            b"", row[:-1], row.lower(), row.replace(b"/", b"\\"),
            row.replace(b"release/a.zip", b"release/../a.zip"), row + row,
            row + row.replace(b"release/a.zip", b"RELEASE/a.zip"),
        ]
        for value in invalid:
            with self.subTest(value=value), self.assertRaises(AssertionError):
                fixture_ledger_rows(value)

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
                    PREVIEW3_SPEC, parent, parent + appended, archive, manifest
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
                                PREVIEW3_SPEC, parent, current, archive, manifest
                            )
            finally:
                os.chdir(original)

    def test_packaging_mode_binds_every_worktree_file_to_head(self) -> None:
        with tempfile.TemporaryDirectory(
            prefix="phrasegarden-packaging-git-test-"
        ) as directory:
            root = Path(directory)
            run_git(root, "init", "--object-format=sha1", "--template=")
            run_git(root, "config", "user.name", "Synthetic test")
            run_git(root, "config", "user.email", "test@example.invalid")
            parent_ledger = f"{'A' * 64}  release/old.zip\n".encode()
            (root / CHECKSUM_PATH).write_bytes(parent_ledger)
            (root / "package.json").write_text(
                '{"version":"0.1.0-preview.3"}\n', encoding="utf-8"
            )
            run_git(root, "add", CHECKSUM_PATH, "package.json")
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
            head = run_git(root, "rev-parse", "HEAD").decode().strip()
            run_git(root, "replace", head, source)

            original = Path.cwd()
            try:
                os.chdir(root)
                object_checks = mock.Mock(wraps=MODULE["reject_external_objects"])
                with mock.patch.dict(verify_packaging_commit.__globals__,
                                     {"reject_external_objects": object_checks}):
                    verify_packaging_commit(PREVIEW3_SPEC, source, Path(CHECKSUM_PATH),
                                            Path(ARCHIVE_PATH), Path(MANIFEST_PATH))
                self.assertEqual(object_checks.call_count, 2)
                archive.write_bytes(b"dirty archive")
                manifest.write_bytes(b"dirty manifest")
                ledger.write_bytes(
                    parent_ledger
                    + f"{digest(archive.read_bytes())}  {ARCHIVE_PATH}\n".encode()
                    + f"{digest(manifest.read_bytes())}  {MANIFEST_PATH}\n".encode()
                )
                with self.assertRaisesRegex(ValueError, "HEAD blob"):
                    verify_packaging_commit(
                        PREVIEW3_SPEC,
                        source,
                        Path(CHECKSUM_PATH),
                        Path(ARCHIVE_PATH),
                        Path(MANIFEST_PATH),
                    )
            finally:
                os.chdir(original)

    def test_strict_packaging_commits_bind_qualified_predecessors(self) -> None:
        for spec in (
            PREVIEW4_SPEC, PREVIEW5_SPEC, PREVIEW6_SPEC, PREVIEW7_SPEC,
            PREVIEW8_SPEC, PREVIEW9_SPEC,
        ):
            with self.subTest(spec=spec.id), tempfile.TemporaryDirectory(
                prefix=f"phrasegarden-{spec.id}-package-"
            ) as directory:
                root = Path(directory)
                _, arguments = build_package(root, spec)

                original = Path.cwd()
                try:
                    os.chdir(root)
                    result = subprocess.run(
                        [sys.executable, "-B", str(ROOT / "scripts" /
                         f"{spec.id}-verify-release-archive.py"), *arguments],
                        capture_output=True, env=fixture_git_environment())
                    self.assertEqual((result.returncode, result.stderr), (0, b""))
                    self.assertEqual((root / "dist" / "index.html").read_bytes(),
                                     f"qualified {spec.id} extraction\n".encode("ascii"))
                    crossed = subprocess.run(
                        [sys.executable, "-B", str(ROOT / "scripts" /
                         "verify-release-archive.py"),
                         *["cross-dist" if item == "dist" else item
                           for item in arguments]],
                        capture_output=True, env=fixture_git_environment())
                    self.assertEqual(crossed.returncode, 1)
                    self.assertEqual(
                        crossed.stderr.replace(b"\r\n", b"\n"),
                        b"packaging arguments do not equal the exact release paths\n",
                    )
                    self.assertFalse((root / "cross-dist").exists())
                finally:
                    os.chdir(original)


if __name__ == "__main__":
    unittest.main()
