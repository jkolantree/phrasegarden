from __future__ import annotations

from contextlib import contextmanager
from dataclasses import replace
from functools import partial
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
from contextlib import redirect_stderr
from types import SimpleNamespace
from unittest import mock
import zlib
from zipfile import ZIP_STORED, ZipFile

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
BASE = "3a2cfd0f81a6a9513991eef4f3b1e604185536bc"
SCRIPT = ROOT / "scripts" / "preview3-package.py"
P4_SCRIPT = ROOT / "scripts" / "preview4-package.py"
CORE = ROOT / "scripts" / "release_packager.py"
MODULE = runpy.run_path(str(CORE))
ENGINE_GLOBALS = MODULE["main"].__globals__
ToolError = MODULE["ToolError"]
ReleaseSpec = MODULE["ReleaseSpec"]
RELEASE_SPECS = MODULE["RELEASE_SPECS"]
PREVIEW3_SPEC = RELEASE_SPECS["preview3"]
PREVIEW4_SPEC = RELEASE_SPECS["preview4"]
build_source_manifest = partial(MODULE["build_source_manifest"], PREVIEW3_SPEC)
canonical_repo_path = MODULE["canonical_repo_path"]
commit_tree = MODULE["commit_tree"]
freeze_source = partial(MODULE["freeze_source"], PREVIEW3_SPEC)
git_object_size = MODULE["git_object_size"]
main = partial(MODULE["main"], PREVIEW3_SPEC)
MAX_GIT_OUTPUT_BYTES = MODULE["MAX_GIT_OUTPUT_BYTES"]
reject_config_indirection = MODULE["reject_config_indirection"]
reject_external_objects = MODULE["reject_external_objects"]
require_physical_git_objects = MODULE["require_physical_git_objects"]
require_directories = MODULE["require_directories"]
run_bounded = MODULE["run_bounded"]
source_entries = partial(MODULE["source_entries"], PREVIEW3_SPEC)
verify_source = partial(MODULE["verify_source"], PREVIEW3_SPEC)
validate_paths = MODULE["validate_paths"]
validate_release_specs = MODULE["validate_release_specs"]
resolve_release_spec = MODULE["resolve_release_spec"]
SOURCE_MANIFEST = PREVIEW3_SPEC.source_manifest
STAGE_ROOT = PREVIEW3_SPEC.stage_root
STAGE_ARCHIVE = PREVIEW3_SPEC.stage_archive
STAGE_MANIFEST = PREVIEW3_SPEC.stage_manifest
STAGE_LEDGER = PREVIEW3_SPEC.stage_ledger
FINAL_ARCHIVE = PREVIEW3_SPEC.final_archive
FINAL_MANIFEST = PREVIEW3_SPEC.final_manifest
stage_package = partial(MODULE["stage_package"], PREVIEW3_SPEC)
promote_package = partial(MODULE["promote_package"], PREVIEW3_SPEC)
scan_dist = MODULE["scan_dist"]

ARCHIVE_MODULE = runpy.run_path(str(ROOT / "scripts" / "release_archive_verifier.py"))
PACKAGING_PATHS = PREVIEW3_SPEC.packaging_paths
load_release_manifest = ARCHIVE_MODULE["load_manifest"]
verify_checksums = ARCHIVE_MODULE["verify_checksums"]
require_checksum = ARCHIVE_MODULE["require_checksum"]
verify_and_extract = ARCHIVE_MODULE["verify_and_extract"]
verify_packaging_commit = partial(
    ARCHIVE_MODULE["verify_packaging_commit"], PREVIEW3_SPEC
)

def fixture_git_environment() -> dict[str, str]:
    environment = os.environ.copy()
    for name in list(environment):
        if name.upper().startswith("GIT_"):
            environment.pop(name)
    environment.update({
        "GIT_CONFIG_NOSYSTEM": "1", "GIT_CONFIG_GLOBAL": os.devnull,
        "GIT_TERMINAL_PROMPT": "0", "GIT_ALLOW_PROTOCOL": "file",
        "GIT_OPTIONAL_LOCKS": "0", "LC_ALL": "C", "LANG": "C",
    })
    return environment

def git(root: Path, *arguments: str, input_bytes: bytes | None = None) -> bytes:
    return subprocess.run(
        ["git", "-c", "commit.gpgSign=false", "-c", "tag.gpgSign=false",
         "-c", "core.hooksPath=.git/no-hooks", "-c", "core.autocrlf=false",
         "-C", str(root), *arguments],
        input=input_bytes,
        check=True,
        capture_output=True,
        env=fixture_git_environment(),
    ).stdout

def commit(root: Path, message: str) -> str:
    git(root, "commit", "-q", "-m", message)
    return git(root, "rev-parse", "HEAD").decode("ascii").strip()


def bound_parent_ledger(spec: ReleaseSpec) -> bytes:
    binding = spec.parent_ledger_binding
    if binding is None:
        raise AssertionError("release specification has no parent-ledger binding")
    length, expected_digest = binding
    current = (ROOT / "SHA256SUMS").read_bytes()
    parent = current[:length]
    actual = hashlib.sha256(parent).hexdigest().upper()
    if len(parent) != length or actual != expected_digest or not parent.endswith(b"\n"):
        raise AssertionError("qualified parent ledger bytes do not match")
    return parent


@contextmanager
def repository(version: str = PREVIEW3_SPEC.release_version):
    temporary = tempfile.TemporaryDirectory(prefix="phrasegarden-source-test-")
    root = Path(temporary.name)
    try:
        git(root, "init", "-q", "--object-format=sha1", "--template=")
        (root / ".git" / "info").mkdir()
        git(root, "config", "user.name", "PhraseGarden fixture")
        git(root, "config", "user.email", "fixture@example.invalid")
        (root / ".gitignore").write_bytes(b"artifacts/\n")
        (root / "README.md").write_bytes(b"fixture\n")
        (root / "package.json").write_bytes(
            (json.dumps({"version": version}, separators=(",", ":")) + "\n").encode()
        )
        git(root, "add", ".gitignore", "README.md", "package.json")
        commit(root, "base")
        (root / "src").mkdir()
        (root / "src" / "value.txt").write_bytes(b"exact source bytes\n")
        git(root, "add", "src/value.txt")
        head = commit(root, "source")
        yield root, head
    finally:
        temporary.cleanup()

@contextmanager
def package_repository(spec: ReleaseSpec = PREVIEW3_SPEC):
    with repository(spec.required_package_version) as (root, _):
        (root / ".gitignore").write_bytes(b"artifacts/\ndist/\n")
        release = root / "release"
        release.mkdir()
        old = release / "old.zip"
        old.write_bytes(b"historical archive\n")
        digest = hashlib.sha256(old.read_bytes()).hexdigest().upper()
        (root / "SHA256SUMS").write_bytes(
            f"{digest}  release/old.zip\n".encode("ascii")
        )
        if spec is PREVIEW4_SPEC:
            (root / "SHA256SUMS").write_bytes(bound_parent_ledger(spec))
            for path in spec.predecessor_paths:
                value = (ROOT / path).read_bytes()
                target = root / path
                target.write_bytes(value)
        git(root, "add", ".gitignore", "SHA256SUMS", "release/old.zip")
        if spec is PREVIEW4_SPEC:
            git(root, "add", *(path.as_posix() for path in spec.predecessor_paths))
        head = commit(root, "package source")
        assets = root / "dist" / "assets"
        assets.mkdir(parents=True)
        (root / "dist" / "index.html").write_bytes(b"<!doctype html>\n")
        (assets / "index-a.css").write_bytes(b"body{}\n")
        (assets / "index-b.js").write_bytes(b"console.log('fixture')\n")
        adapter = P4_SCRIPT if spec is PREVIEW4_SPEC else SCRIPT
        frozen = tool(root, "freeze-source", head, adapter=adapter)
        if frozen.returncode != 0:
            raise AssertionError(frozen.stderr)
        yield root, head

def tool(root: Path, command: str, source: str, *, env=None,
         adapter: Path = SCRIPT):
    return subprocess.run(
        [sys.executable, "-B", str(adapter), command,
         "--source-commit", source],
        cwd=root,
        env=fixture_git_environment() if env is None else env,
        capture_output=True,
        text=True,
    )

class ReleaseSpecificationTest(unittest.TestCase):
    def assert_failure(self, result, code: str) -> None:
        self.assertEqual(result.returncode, 1, result.stderr)
        self.assertEqual(result.stdout, "")
        self.assertRegex(result.stderr, rf"\A{code}: [^\r\n]+\n\Z")

    def test_closed_specs_adapters_and_committed_versions(self) -> None:
        self.assertEqual(tuple(RELEASE_SPECS), ("preview3", "preview4"))
        with self.assertRaises(TypeError):
            RELEASE_SPECS["preview5"] = PREVIEW4_SPEC
        for value in ("Preview4", "preview-4", "0.1.0-preview.4"):
            with self.assertRaises(ToolError) as raised:
                resolve_release_spec(value)
            self.assertEqual(raised.exception.code, "E-RELEASE-SPEC")
        for field in ("source_manifest", "stage_root", "final_archive",
                      "final_manifest", "evidence_path", "publication_contract"):
            rerouted = replace(PREVIEW4_SPEC,
                               **{field: Path("changed") / getattr(PREVIEW4_SPEC, field).name})
            with self.assertRaises(ToolError) as raised:
                validate_release_specs({"preview3": PREVIEW3_SPEC, "preview4": rerouted})
            self.assertEqual(raised.exception.code, "E-RELEASE-SPEC")
        for version, adapter, code in (
            (PREVIEW4_SPEC.release_version, SCRIPT, "E-RELEASE-SOURCE-VERSION"),
            (PREVIEW3_SPEC.release_version, P4_SCRIPT, "E-RELEASE-SOURCE-VERSION"),
        ):
            with repository(version) as (root, head):
                self.assert_failure(tool(root, "freeze-source", head,
                                         adapter=adapter), code)
        for raw in (b"{}\n", b'{"Version":"0.1.0-preview.3"}\n',
                    b'{"version":true}\n',
                    b'{"version":"0.1.0-preview.3","version":"0.1.0-preview.3"}\n',
                    b'{"version":"0.1.0-preview.3","x":NaN}\n'):
            with repository() as (root, _):
                (root / "package.json").write_bytes(raw)
                git(root, "add", "package.json")
                head = commit(root, "malformed package identity")
                self.assert_failure(tool(root, "freeze-source", head),
                                    "E-RELEASE-SOURCE-VERSION")
        with repository() as (root, head):
            attempted = subprocess.run(
                [sys.executable, "-B", str(SCRIPT), "freeze-source",
                 "--source-commit", head, "--release", "preview4"],
                cwd=root, env=fixture_git_environment(), capture_output=True, text=True,
            )
            self.assertEqual(attempted.returncode, 2)
            self.assertFalse((root / SOURCE_MANIFEST).exists())

    def test_preview4_stage_and_predecessor_binding(self) -> None:
        with package_repository(PREVIEW4_SPEC) as (root, head):
            staged = tool(root, "stage-package", head, adapter=P4_SCRIPT)
            self.assertEqual(staged.returncode, 0, staged.stderr)
            manifest = json.loads((root / PREVIEW4_SPEC.stage_manifest).read_bytes())
            self.assertEqual((manifest["releaseVersion"], manifest["artifactName"]),
                             (PREVIEW4_SPEC.release_version,
                              PREVIEW4_SPEC.archive_name))
            parent = (root / "SHA256SUMS").read_bytes()
            self.assertTrue((root / PREVIEW4_SPEC.stage_ledger).read_bytes().startswith(parent))
            self.assert_failure(tool(root, "freeze-source", head),
                                "E-RELEASE-SOURCE-VERSION")
        for mutation in ("reorder", "joint", "prefix", "active"):
            with self.subTest(mutation=mutation), \
                    package_repository(PREVIEW4_SPEC) as (root, _):
                source = root / PREVIEW4_SPEC.source_manifest
                source.unlink()
                ledger = root / "SHA256SUMS"
                lines = ledger.read_bytes().splitlines(keepends=True)
                if mutation == "reorder":
                    ledger.write_bytes(b"".join([*lines[:-2], lines[-1], lines[-2]]))
                    git(root, "add", "SHA256SUMS")
                elif mutation == "joint":
                    path = PREVIEW4_SPEC.predecessor_paths[0]
                    value = b"jointly changed predecessor\n"
                    (root / path).write_bytes(value)
                    lines[-2] = (f"{hashlib.sha256(value).hexdigest().upper()}  "
                                 f"{path.as_posix()}\n").encode()
                    ledger.write_bytes(b"".join(lines))
                    git(root, "add", "SHA256SUMS", path.as_posix())
                elif mutation == "prefix":
                    lines[0] = b"0" * 64 + lines[0][64:]
                    ledger.write_bytes(b"".join(lines))
                    git(root, "add", "SHA256SUMS")
                else:
                    ledger.write_bytes(ledger.read_bytes() +
                        f"{'0' * 64}  {PREVIEW4_SPEC.final_archive.as_posix()}\n".encode())
                    git(root, "add", "SHA256SUMS")
                head = commit(root, f"{mutation} predecessor")
                self.assertEqual(tool(root, "freeze-source", head,
                                      adapter=P4_SCRIPT).returncode, 0)
                self.assert_failure(tool(root, "stage-package", head,
                                         adapter=P4_SCRIPT), "E-PACKAGE-PREDECESSOR")

    def test_preview3_golden_bytes_survive_shared_core_extraction(self) -> None:
        with package_repository() as (root, head), \
                tempfile.TemporaryDirectory(prefix="phrasegarden-old-packager-") as temp:
            expected_source = (root / SOURCE_MANIFEST).read_bytes()
            (root / SOURCE_MANIFEST).unlink()
            old_script = Path(temp) / "preview3-package.py"
            old_script.write_bytes(subprocess.run(
                ["git", "-c", f"safe.directory={ROOT}", "-C", str(ROOT), "show",
                 f"{BASE}:scripts/preview3-package.py"], check=True,
                capture_output=True, env=fixture_git_environment(),
            ).stdout)
            old_help = subprocess.run([sys.executable, "-B", str(old_script), "--help"],
                cwd=root, env=fixture_git_environment(), capture_output=True, text=True)
            new_help = subprocess.run([sys.executable, "-B", str(SCRIPT), "--help"],
                cwd=root, env=fixture_git_environment(), capture_output=True, text=True)
            self.assertEqual((new_help.returncode, new_help.stdout, new_help.stderr),
                             (old_help.returncode, old_help.stdout, old_help.stderr))
            self.assertEqual(tool(root, "freeze-source", head,
                                  adapter=old_script).returncode, 0)
            self.assertEqual((root / SOURCE_MANIFEST).read_bytes(), expected_source)
            self.assertEqual(tool(root, "stage-package", head,
                                  adapter=old_script).returncode, 0)
            expected_stage = SameBytePackageTest.staged(root)
            shutil.rmtree(root / STAGE_ROOT)
            (root / SOURCE_MANIFEST).unlink()
            self.assertEqual(tool(root, "freeze-source", head).returncode, 0)
            self.assertEqual(tool(root, "stage-package", head).returncode, 0)
            self.assertEqual(SameBytePackageTest.staged(root), expected_stage)

class SourceManifestTest(unittest.TestCase):
    def assert_tool_failure(
        self, root: Path, source: str, code: str, command: str = "freeze-source",
        *, env: dict[str, str] | None = None,
    ):
        result = tool(root, command, source, env=env)
        self.assertEqual(result.returncode, 1, result.stderr)
        self.assertEqual(result.stdout, "")
        self.assertRegex(result.stderr, rf"\A{re.escape(code)}: [^\r\n]+\n\Z")
        return result

    def test_freeze_and_verify_exact_committed_bytes(self) -> None:
        with repository() as (root, head):
            result = tool(root, "freeze-source", head)
            self.assertEqual(result.returncode, 0, result.stderr)
            output = root / SOURCE_MANIFEST
            raw = output.read_bytes()
            source_tree = git(root, "rev-parse", "HEAD^{tree}").decode().strip()
            expected_files = []
            for path in [".gitignore", "README.md", "package.json", "src/value.txt"]:
                value = git(root, "show", f"HEAD:{path}")
                expected_files.append({
                    "path": path, "mode": "100644", "bytes": len(value),
                    "sha256": hashlib.sha256(value).hexdigest().upper(),
                })
            expected_manifest = {
                "schemaVersion": 1,
                "kind": "phrasegarden-source-freeze",
                "sourceCommit": head,
                "sourceTree": source_tree,
                "files": expected_files,
            }
            expected_raw = (json.dumps(
                expected_manifest, ensure_ascii=True, indent=2,
                separators=(",", ": "),
            ) + "\n").encode("utf-8")
            self.assertEqual(raw, expected_raw)
            manifest = json.loads(raw)
            self.assertEqual(manifest, expected_manifest)
            self.assertEqual(
                list(manifest),
                ["schemaVersion", "kind", "sourceCommit", "sourceTree", "files"],
            )
            paths = [entry["path"] for entry in manifest["files"]]
            self.assertEqual(paths, [".gitignore", "README.md", "package.json",
                                     "src/value.txt"])
            for entry in manifest["files"]:
                self.assertEqual(list(entry), ["path", "mode", "bytes", "sha256"])
            report = json.loads(result.stdout)
            self.assertEqual(report["sha256"], hashlib.sha256(raw).hexdigest().upper())
            verified = tool(root, "verify-source", head)
            self.assertEqual(verified.returncode, 0, verified.stderr)
            self.assertEqual(json.loads(verified.stdout)["status"], "verified")
    def test_deterministic_across_environment_and_never_overwrites(self) -> None:
        with repository() as (root, head):
            first = tool(root, "freeze-source", head)
            self.assertEqual(first.returncode, 0, first.stderr)
            output = root / SOURCE_MANIFEST
            expected = output.read_bytes()
            self.assert_tool_failure(root, head, "E-SOURCE-OUTPUT-EXISTS")
            self.assertEqual(output.read_bytes(), expected)
            output.unlink()
            hostile = fixture_git_environment()
            hostile.update({"TZ": "Pacific/Kiritimati", "LC_ALL": "tr_TR.UTF-8",
                            "LANG": "ja_JP.UTF-8"})
            trace = Path(tempfile.gettempdir()) / f"{root.name}-git-trace.json"
            hostile["GIT_TRACE2_EVENT"] = str(trace)
            second = tool(root, "freeze-source", head, env=hostile)
            self.assertEqual(second.returncode, 0, second.stderr)
            self.assertEqual(output.read_bytes(), expected)
            self.assertFalse(trace.exists())
            output.unlink()
            git(root, "replace", head, git(root, "rev-parse", "HEAD^").decode().strip())
            replaced = tool(root, "freeze-source", head)
            self.assertEqual(replaced.returncode, 0, replaced.stderr)
            self.assertEqual(output.read_bytes(), expected)
    def test_dirty_tracked_staged_and_untracked_states_fail(self) -> None:
        with repository() as (root, head):
            value = root / "src" / "value.txt"
            original = value.read_bytes()
            value.write_bytes(b"dirty\n")
            self.assert_tool_failure(root, head, "E-SOURCE-WORKTREE")
            value.write_bytes(original)
            value.write_bytes(b"staged\n")
            git(root, "add", "src/value.txt")
            self.assert_tool_failure(root, head, "E-SOURCE-INDEX")
            git(root, "restore", "--staged", "src/value.txt")
            value.write_bytes(original)
            untracked = root / "untracked.txt"
            untracked.write_bytes(b"untracked\n")
            self.assert_tool_failure(root, head, "E-SOURCE-DIRTY")

    def test_concealment_flags_and_clean_filters_do_not_hide_raw_changes(self) -> None:
        with repository() as (root, head):
            value = root / "src" / "value.txt"
            value.write_bytes(b"hidden by assume-unchanged\n")
            git(root, "update-index", "--assume-unchanged", "src/value.txt")
            self.assertEqual(git(root, "status", "--porcelain"), b"")
            self.assert_tool_failure(root, head, "E-SOURCE-INDEX")
        with repository() as (root, head):
            attributes = root / ".gitattributes"
            attributes.write_bytes(b"src/value.txt filter=hide\n")
            helper = root / ".git" / "clean.py"
            sentinel = root / ".git" / "filter-ran"
            helper.write_text(
                f"from pathlib import Path\nPath({str(sentinel)!r}).write_bytes(b'ran')\n"
                "import sys\nsys.stdin.buffer.read()\n"
                "sys.stdout.buffer.write(b'exact source bytes\\n')\n",
                encoding="utf-8",
            )
            command = f'"{Path(sys.executable).as_posix()}" "{helper.as_posix()}"'
            git(root, "config", "filter.hide.clean", command)
            git(root, "config", "filter.hide.required", "true")
            git(root, "add", ".gitattributes")
            git(root, "add", "--renormalize", "src/value.txt")
            head = commit(root, "clean filter policy")
            sentinel.unlink(missing_ok=True)
            (root / "src" / "value.txt").write_bytes(b"hidden by clean filter\n")
            self.assert_tool_failure(root, head, "E-SOURCE-WORKTREE")
            self.assertFalse(sentinel.exists())

    def test_every_consumed_git_object_is_rehashed(self) -> None:
        for kind, selector in (("commit", "HEAD"), ("tree", "HEAD^{tree}"),
                               ("blob", "HEAD:src/value.txt")):
            with self.subTest(kind=kind), repository() as (root, head):
                tree_id = git(root, "rev-parse", "HEAD^{tree}").decode().strip()
                object_id = git(root, "rev-parse", selector).decode().strip()
                value = git(root, "cat-file", kind, object_id)
                evil = b"x" * len(value)
                loose = root / ".git" / "objects" / object_id[:2] / object_id[2:]
                os.chmod(loose, stat.S_IREAD | stat.S_IWRITE)
                loose.write_bytes(zlib.compress(f"{kind} {len(evil)}\0".encode() + evil))
                original = Path.cwd()
                os.chdir(root)
                try:
                    with self.assertRaises(ToolError) as raised:
                        commit_tree(object_id) if kind == "commit" else source_entries(tree_id)
                    self.assertEqual(raised.exception.code, "E-GIT-OBJECT")
                finally:
                    os.chdir(original)
    def test_source_identity_root_and_ignored_output_are_exact(self) -> None:
        with repository() as (root, head):
            parent = git(root, "rev-parse", "HEAD^").decode().strip()
            for source, code in (
                (head[:12], "E-SOURCE-COMMIT"),
                (head.upper(), "E-SOURCE-COMMIT"),
                ("0" * 40, "E-SOURCE-NOT-HEAD"),
                (parent, "E-SOURCE-NOT-HEAD"),
            ):
                with self.subTest(source=source):
                    self.assert_tool_failure(root, source, code)
            nested = root / "src"
            self.assert_tool_failure(nested, head, "E-REPOSITORY")
            redirected = fixture_git_environment()
            redirected["GIT_INDEX_FILE"] = str(root / ".git" / "other-index")
            self.assert_tool_failure(root, head, "E-GIT-ENV", env=redirected)
            abbreviated = subprocess.run(
                [sys.executable, "-B", str(SCRIPT), "freeze-source",
                 "--source-c", head], cwd=root, capture_output=True, text=True,
                env=fixture_git_environment(),
            )
            self.assertEqual(abbreviated.returncode, 2)
            self.assertEqual(abbreviated.stdout, "")
            alternate = root / ".git" / "objects" / "info" / "alternates"
            alternate.write_text(str(root), encoding="utf-8")
            self.assert_tool_failure(root, head, "E-GIT-ALTERNATES")
            alternate.unlink()
            git(root, "config", "extensions.partialClone", "origin")
            self.assert_tool_failure(root, head, "E-GIT-PARTIAL")
            git(root, "config", "--unset", "extensions.partialClone")
            git(root, "config", "extensions.worktreeConfig", "true")
            git(root, "config", "--worktree", "extensions.partialClone", "origin")
            self.assert_tool_failure(root, head, "E-GIT-PARTIAL")
            git(root, "config", "--worktree", "--unset", "extensions.partialClone")
            git(root, "config", "remote.origin.promisor", "true")
            self.assert_tool_failure(root, head, "E-GIT-PARTIAL")
            git(root, "config", "--unset", "remote.origin.promisor")
            git(root, "config", "include.path", "../outside-config")
            self.assert_tool_failure(root, head, "E-GIT-CONFIG-INDIRECTION")
            git(root, "config", "--unset-all", "include.path")
            config = root / ".git" / "config"
            original_config = config.read_bytes()
            config.write_bytes(original_config +
                               b'\n[includeIf "gitdir:../"]\n\tpath = ../outside\n')
            self.assert_tool_failure(root, head, "E-GIT-CONFIG-INDIRECTION")
            config.write_bytes(original_config)
            git(root, "config", "core.excludesFile", "../outside-ignore")
            self.assert_tool_failure(root, head, "E-GIT-CONFIG-INDIRECTION")
            git(root, "config", "--unset", "core.excludesFile")
            (root / ".git" / "commondir").write_bytes(b"../outside-git\n")
            self.assert_tool_failure(root, head, "E-GIT-COMMONDIR")
            (root / ".git" / "commondir").unlink()
            (root / ".gitignore").write_bytes(b"coverage/\n")
            git(root, "add", ".gitignore")
            head = commit(root, "unignore evidence")
            self.assert_tool_failure(root, head, "E-SOURCE-OUTPUT-IGNORE")
            (root / ".git" / "info" / "exclude").write_bytes(b"artifacts/\n")
            self.assert_tool_failure(root, head, "E-SOURCE-OUTPUT-IGNORE")

    def test_tracked_output_path_fails_even_when_ignored(self) -> None:
        with repository() as (root, head):
            output = root / SOURCE_MANIFEST
            output.parent.mkdir(parents=True)
            output.write_bytes(b"tracked evidence\n")
            git(root, "add", "-f", SOURCE_MANIFEST.as_posix())
            head = commit(root, "track forbidden output")
            self.assert_tool_failure(root, head, "E-SOURCE-OUTPUT-TRACKED")

    def test_local_config_budget_and_physical_boundary_fail_closed(self) -> None:
        with repository() as (root, head):
            (root / ".git" / "config").write_bytes(
                b"#" * (MAX_GIT_OUTPUT_BYTES + 1)
            )
            self.assert_tool_failure(root, head, "E-GIT-CONFIG")
        with repository() as (root, _):
            config = root / ".git" / "config"
            original = Path.lstat
            def lstat(path: Path):
                if path == config:
                    return SimpleNamespace(st_mode=stat.S_IFLNK)
                return original(path)
            with mock.patch.object(Path, "lstat", lstat), \
                    self.assertRaises(ToolError) as raised:
                reject_config_indirection(root)
            self.assertEqual(raised.exception.code, "E-GIT-CONFIG")

    def test_physical_prefix_and_partial_write_are_fail_closed(self) -> None:
        for parts, directory in ((('pack',), True), (('info',), True),
                                 (('ab',), True), (('ab', 'object'), False)):
            with self.subTest(parts=parts), tempfile.TemporaryDirectory() as location:
                root = Path(location)
                target = root / ".git" / "objects" / Path(*parts)
                target.mkdir(parents=True) if directory else (
                    target.parent.mkdir(parents=True), target.write_bytes(b"x"))
                original = Path.lstat
                with mock.patch.object(Path, "lstat", lambda path, target=target:
                        SimpleNamespace(st_mode=stat.S_IFLNK) if path == target else original(path)), \
                        self.assertRaises(ToolError) as objects:
                    require_physical_git_objects(root)
                self.assertEqual(objects.exception.code, "E-GIT-OBJECTS")
        with tempfile.TemporaryDirectory() as location, mock.patch.dict(
                require_physical_git_objects.__globals__, {"MAX_GIT_OBJECT_ENTRIES": 0}), \
                self.assertRaises(ToolError):
            (Path(location) / ".git" / "objects" / "info").mkdir(parents=True)
            require_physical_git_objects(Path(location))
        with repository() as (root, head):
            (root / "artifacts").mkdir()
            original = Path.lstat
            def lstat(path: Path):
                if path == root / "artifacts":
                    return SimpleNamespace(st_mode=stat.S_IFLNK)
                return original(path)
            with mock.patch.object(Path, "lstat", lstat), self.assertRaises(ToolError):
                require_directories(root, ("artifacts",), create=False)
        with repository() as (root, head):
            original_cwd = Path.cwd()
            os.chdir(root)
            try:
                with mock.patch.object(os, "fsync", side_effect=OSError), \
                        self.assertRaises(ToolError) as raised:
                    freeze_source(head)
                self.assertEqual(raised.exception.code, "E-SOURCE-OUTPUT-WRITE")
                self.assertTrue((root / SOURCE_MANIFEST).is_file())
                with self.assertRaises(ToolError) as repeated:
                    freeze_source(head)
                self.assertEqual(repeated.exception.code, "E-SOURCE-OUTPUT-EXISTS")
            finally:
                os.chdir(original_cwd)

    def test_unexpected_boundary_errors_have_one_stable_code(self) -> None:
        error = io.StringIO()
        with mock.patch.dict(ENGINE_GLOBALS, {
            "verify_source": mock.Mock(side_effect=PermissionError)
        }), mock.patch.object(sys, "argv", [str(SCRIPT), "verify-source",
                                             "--source-commit", "0" * 40]), \
                redirect_stderr(error):
            self.assertEqual(main(), 1)
        self.assertEqual(error.getvalue(),
                         "E-BOUNDARY: local source boundary operation failed\n")
    def test_altered_or_nonregular_manifest_fails_without_rewrite(self) -> None:
        with repository() as (root, head):
            self.assertEqual(tool(root, "freeze-source", head).returncode, 0)
            output = root / SOURCE_MANIFEST
            altered = output.read_bytes().replace(b'"sourceTree": "', b'"sourceTree": "0')
            output.write_bytes(altered)
            self.assert_tool_failure(
                root, head, "E-SOURCE-MANIFEST-MISMATCH", "verify-source"
            )
            self.assertEqual(output.read_bytes(), altered)
            output.unlink()
            output.mkdir()
            self.assert_tool_failure(root, head, "E-SOURCE-MANIFEST-FILE",
                                     "verify-source")

    def test_verify_rechecks_manifest_prefix_after_read(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            output = root / SOURCE_MANIFEST
            output.parent.mkdir(parents=True)
            output.write_bytes(b"{}\n")
            manifest = {"files": [], "sourceCommit": "1" * 40,
                        "sourceTree": "2" * 40}
            original = Path.cwd()
            os.chdir(root)
            try:
                events: list[str] = []
                directories = mock.Mock(side_effect=lambda *_, **__: events.append("prefix"))
                manifest_read = mock.Mock(side_effect=lambda *_, **__: (
                    events.append("read"), b"{}\n"
                )[1])
                with mock.patch.dict(ENGINE_GLOBALS, {
                    "build_source_manifest": mock.Mock(return_value=(b"{}\n", manifest)),
                    "require_directories": directories,
                    "read_regular": manifest_read,
                    "report": mock.Mock(),
                }):
                    verify_source("1" * 40)
                self.assertEqual(events, ["prefix", "read", "prefix"])
            finally:
                os.chdir(original)
    def test_executable_symlink_and_submodule_modes_fail(self) -> None:
        for mode in ("100755", "120000", "160000"):
            with self.subTest(mode=mode), repository() as (root, head):
                if mode == "100755":
                    git(root, "update-index", "--chmod=+x", "src/value.txt")
                else:
                    object_id = head
                    if mode == "120000":
                        object_id = git(
                            root, "hash-object", "-w", "--stdin", input_bytes=b"target"
                        ).decode().strip()
                    git(root, "update-index", "--add", "--cacheinfo",
                        f"{mode},{object_id},bad-{mode}")
                head = commit(root, f"mode {mode}")
                original = Path.cwd()
                os.chdir(root)
                try:
                    with self.assertRaises(ToolError) as raised:
                        source_entries(commit_tree(head))
                    self.assertEqual(raised.exception.code, "E-SOURCE-MODE")
                finally:
                    os.chdir(original)

    def test_portable_path_and_collision_policy(self) -> None:
        for path in ("/root", "a\\b", "a/../b", "a//b", "NUL.txt",
                     "français.txt", "a?b", "a/#b"):
            with self.subTest(path=path), self.assertRaises(ToolError):
                canonical_repo_path(path)
        with self.assertRaisesRegex(ToolError, "collide case-insensitively"):
            validate_paths(["A.txt", "a.txt"])

    def test_raw_tree_topology_and_object_preflight_fail_before_blob_read(self) -> None:
        root_id, first_id, second_id = "1" * 40, "2" * 40, "3" * 40
        slash_tree = b"100644 a/b\0" + bytes.fromhex(first_id)
        with mock.patch.dict(ENGINE_GLOBALS, {
            "git_object": mock.Mock(return_value=slash_tree)
        }), self.assertRaises(ToolError) as slash:
            source_entries(root_id)
        self.assertEqual(slash.exception.code, "E-SOURCE-TREE")
        collision_tree = (b"40000 A\0" + bytes.fromhex(first_id)
                          + b"40000 a\0" + bytes.fromhex(second_id))
        objects = mock.Mock(side_effect=lambda _, object_id, __:
                            collision_tree if object_id == root_id else b"")
        with mock.patch.dict(ENGINE_GLOBALS, {"git_object": objects}), \
                self.assertRaises(ToolError) as collision:
            source_entries(root_id)
        self.assertEqual(collision.exception.code, "E-SOURCE-PATH-COLLISION")

        calls: list[list[str]] = []
        def oversized(arguments, limit=0, **_):
            calls.append(arguments)
            return (b"blob\n", 0) if arguments[1] == "-t" else (b"9\n", 0)
        with mock.patch.dict(git_object_size.__globals__, {"git": oversized}), \
                self.assertRaises(ToolError) as blob:
            git_object_size("blob", "4" * 40, 8)
        self.assertEqual(blob.exception.code, "E-SOURCE-BLOB-LIMIT")
        self.assertEqual([call[1] for call in calls], ["-t", "-s"])

        one_blob = b"100644 value\0" + bytes.fromhex(first_id)
        per_blob_content = mock.Mock(side_effect=lambda _, object_id, __:
                                     one_blob if object_id == root_id else b"unreachable")
        with mock.patch.dict(ENGINE_GLOBALS, {
            "git_object": per_blob_content,
            "git_object_size": mock.Mock(side_effect=ToolError(
                "E-SOURCE-BLOB-LIMIT", "blob byte budget exceeded"
            )),
        }), self.assertRaises(ToolError) as per_blob:
            source_entries(root_id)
        self.assertEqual(per_blob.exception.code, "E-SOURCE-BLOB-LIMIT")
        self.assertEqual(per_blob_content.call_count, 1)

        content = mock.Mock(side_effect=lambda _, object_id, __:
                            one_blob if object_id == root_id else b"unreachable")
        with mock.patch.dict(ENGINE_GLOBALS, {
            "git_object": content,
            "git_object_size": mock.Mock(return_value=2),
            "MAX_TOTAL_BYTES": 1,
        }), self.assertRaises(ToolError) as total:
            source_entries(root_id)
        self.assertEqual(total.exception.code, "E-SOURCE-TOTAL-LIMIT")
        self.assertEqual(content.call_count, 1)

    def test_all_input_budgets_fail_closed(self) -> None:
        with repository() as (root, head):
            original = Path.cwd()
            os.chdir(root)
            try:
                globals_ = ENGINE_GLOBALS
                for name, value, code in (
                    ("MAX_FILES", 1, "E-SOURCE-FILE-LIMIT"),
                    ("MAX_TREES", 0, "E-SOURCE-TREE-LIMIT"),
                    ("MAX_TREE_DEPTH", -1, "E-SOURCE-TREE-LIMIT"),
                    ("MAX_BLOB_BYTES", 1, "E-SOURCE-BLOB-LIMIT"),
                    ("MAX_TOTAL_BYTES", 1, "E-SOURCE-TOTAL-LIMIT"),
                    ("MAX_MANIFEST_BYTES", 10, "E-SOURCE-MANIFEST-LIMIT"),
                ):
                    with self.subTest(limit=name), mock.patch.dict(
                        globals_, {name: value}
                    ), self.assertRaises(ToolError) as raised:
                        build_source_manifest(head)
                    self.assertEqual(raised.exception.code, code)
                with self.assertRaises(ToolError) as raised:
                    run_bounded(
                        [sys.executable, "-c",
                         "import sys;sys.stdout.buffer.write(b'x'*4)"], 3
                    )
                self.assertEqual(raised.exception.code, "E-GIT-OUTPUT-LIMIT")
            finally:
                os.chdir(original)

class SameBytePackageTest(unittest.TestCase):
    def assert_package_failure(self, root: Path, head: str, command: str,
                               code: str, message: str | None = None) -> None:
        result = tool(root, command, head)
        self.assertEqual(result.returncode, 1, result.stderr)
        self.assertEqual(result.stdout, "")
        if message is None:
            self.assertRegex(result.stderr, rf"\A{re.escape(code)}: [^\r\n]+\n\Z")
        else:
            self.assertEqual(result.stderr, f"{code}: {message}\n")

    @staticmethod
    def staged(root: Path) -> dict[Path, bytes]:
        return {path: (root / path).read_bytes()
                for path in (STAGE_ARCHIVE, STAGE_MANIFEST, STAGE_LEDGER)}

    def test_stage_is_canonical_and_environment_independent(self) -> None:
        with package_repository() as (root, head):
            first = tool(root, "stage-package", head)
            self.assertEqual(first.returncode, 0, first.stderr)
            initial = self.staged(root)
            verified = tool(root, "verify-package", head)
            self.assertEqual(verified.returncode, 0, verified.stderr)
            self.assertEqual(json.loads(verified.stdout)["status"], "verified")
            raw_manifest = initial[STAGE_MANIFEST]
            parsed = json.loads(raw_manifest)
            self.assertEqual(parsed["sourceProvenance"]["statement"],
                "Records the declared source commit and distributable byte inventory; this manifest does not establish build qualification or a packaging commit.")
            self.assertEqual(
                raw_manifest,
                (json.dumps(parsed, ensure_ascii=True, indent=2,
                            separators=(",", ": ")) + "\n").encode(),
            )
            with ZipFile(io.BytesIO(initial[STAGE_ARCHIVE])) as package:
                self.assertEqual([item.filename for item in package.infolist()],
                                 [item["path"] for item in parsed["files"]])
                for item in package.infolist():
                    self.assertEqual(item.compress_type, ZIP_STORED)
                    self.assertEqual(item.date_time, (1980, 1, 1, 0, 0, 0))
                    self.assertEqual(item.external_attr,
                                     (stat.S_IFREG | 0o644) << 16)
                    self.assertEqual((item.extra, item.comment, item.flag_bits),
                                     (b"", b"", 0))
            shutil.rmtree(root / STAGE_ROOT)
            hostile = fixture_git_environment()
            hostile.update({"TZ": "Pacific/Kiritimati", "LC_ALL": "tr_TR.UTF-8",
                            "LANG": "ja_JP.UTF-8"})
            second = tool(root, "stage-package", head, env=hostile)
            self.assertEqual(second.returncode, 0, second.stderr)
            self.assertEqual(self.staged(root), initial)

    def test_mismatches_shapes_and_budgets_fail_without_rewrite(self) -> None:
        with package_repository() as (root, head):
            self.assertEqual(tool(root, "stage-package", head).returncode, 0)
            for path, code in ((STAGE_ARCHIVE, "E-PACKAGE-ARCHIVE"),
                               (STAGE_MANIFEST, "E-PACKAGE-STAGE-MISMATCH"),
                               (STAGE_LEDGER, "E-PACKAGE-STAGE-MISMATCH")):
                original = (root / path).read_bytes()
                (root / path).write_bytes(original + b"x")
                self.assert_package_failure(root, head, "verify-package", code)
                self.assertEqual((root / path).read_bytes(), original + b"x")
                (root / path).write_bytes(original)
            extra = root / STAGE_ROOT / "extra"
            extra.write_bytes(b"x")
            self.assert_package_failure(root, head, "verify-package",
                                        "E-PACKAGE-STAGE-SHAPE")
            extra.unlink()
            dist_extra = root / "dist" / "extra.txt"
            dist_extra.write_bytes(b"x")
            self.assert_package_failure(root, head, "verify-package",
                                        "E-PACKAGE-DIST-SHAPE")
            dist_extra.unlink()
            source = root / SOURCE_MANIFEST
            original = source.read_bytes()
            source.write_bytes(original + b" ")
            self.assert_package_failure(root, head, "verify-package",
                                        "E-SOURCE-MANIFEST-MISMATCH")
            source.write_bytes(original)
            cwd = Path.cwd()
            os.chdir(root)
            try:
                with mock.patch.dict(scan_dist.__globals__, {"MAX_RELEASE_BYTES": 1}), \
                        self.assertRaises(ToolError) as raised:
                    scan_dist()
                self.assertEqual(raised.exception.code, "E-PACKAGE-DIST-FILE")
            finally:
                os.chdir(cwd)

    def test_partial_stage_and_promotion_remain_blocking(self) -> None:
        with package_repository() as (root, head):
            cwd = Path.cwd()
            os.chdir(root)
            try:
                with mock.patch.object(os, "fsync", side_effect=OSError), \
                        self.assertRaises(ToolError) as raised:
                    stage_package(head)
                self.assertEqual(raised.exception.code, "E-PACKAGE-STAGE-WRITE")
                self.assertTrue((root / STAGE_ARCHIVE).is_file())
                with self.assertRaises(ToolError) as repeated:
                    stage_package(head)
                self.assertEqual(repeated.exception.code, "E-PACKAGE-STAGE-EXISTS")
            finally:
                os.chdir(cwd)
        with package_repository() as (root, head):
            self.assertEqual(tool(root, "stage-package", head).returncode, 0)
            cwd = Path.cwd()
            os.chdir(root)
            try:
                with mock.patch.object(os, "fsync", side_effect=OSError), \
                        self.assertRaises(ToolError) as raised:
                    promote_package(head)
                self.assertEqual(raised.exception.code,
                                 "E-PACKAGE-PROMOTION-WRITE")
                self.assertTrue((root / FINAL_ARCHIVE).is_file())
                with self.assertRaises(ToolError) as repeated:
                    promote_package(head)
                self.assertEqual(repeated.exception.code, "E-PACKAGE-FINAL-EXISTS")
            finally:
                os.chdir(cwd)

    def test_mutable_ignore_cannot_hide_package_inputs(self) -> None:
        with package_repository() as (root, _):
            (root / SOURCE_MANIFEST).unlink()
            (root / ".gitignore").write_bytes(b"artifacts/\n")
            git(root, "add", ".gitignore")
            head = commit(root, "remove committed dist ignore")
            (root / ".git" / "info" / "exclude").write_bytes(b"dist/\n")
            self.assertEqual(tool(root, "freeze-source", head).returncode, 0)
            self.assert_package_failure(root, head, "stage-package",
                                        "E-PACKAGE-OUTPUT-IGNORE")

    def test_future_path_case_variants_fail_before_staging(self) -> None:
        for future in (FINAL_ARCHIVE, FINAL_MANIFEST):
            with self.subTest(future=future), package_repository() as (root, _):
                (root / SOURCE_MANIFEST).unlink()
                with (root / "SHA256SUMS").open("ab") as ledger:
                    ledger.write(f"{'A' * 64}  {future.as_posix().upper()}\n".encode())
                git(root, "add", "SHA256SUMS")
                head = commit(root, "case-variant future path")
                self.assertEqual(tool(root, "freeze-source", head).returncode, 0)
                self.assert_package_failure(root, head, "stage-package",
                    "E-PACKAGE-LEDGER", "source ledger has a duplicate or Preview 3 path")
                self.assertFalse((root / STAGE_ROOT).exists())

    def test_hardlinked_ledger_fails_before_final_writes(self) -> None:
        with package_repository() as (root, head), tempfile.TemporaryDirectory() as outside:
            self.assertEqual(tool(root, "stage-package", head).returncode, 0)
            linked = Path(outside) / "linked-ledger"
            os.link(root / "SHA256SUMS", linked)
            original = linked.read_bytes()
            self.assert_package_failure(root, head, "promote-package",
                                        "E-PACKAGE-PROMOTION-WRITE")
            self.assertEqual(linked.read_bytes(), original)
            self.assertFalse((root / FINAL_ARCHIVE).exists())
            self.assertFalse((root / FINAL_MANIFEST).exists())

    def test_prewrite_and_postwrite_drift_fail_closed(self) -> None:
        with package_repository() as (root, head):
            self.assertEqual(tool(root, "stage-package", head).returncode, 0)
            parent = (root / "SHA256SUMS").read_bytes()
            original_verify = ENGINE_GLOBALS["verify_package_stage"]
            def drift_after_verify(spec: ReleaseSpec, source: str):
                values = original_verify(spec, source)
                (root / STAGE_ARCHIVE).write_bytes(values["archive"] + b"x")
                return values
            cwd = Path.cwd()
            os.chdir(root)
            try:
                with mock.patch.dict(ENGINE_GLOBALS,
                                     {"verify_package_stage": drift_after_verify}), \
                        self.assertRaises(ToolError) as raised:
                    promote_package(head)
                self.assertEqual(raised.exception.code, "E-PACKAGE-STAGE-DRIFT")
                self.assertFalse((root / FINAL_ARCHIVE).exists())
                self.assertFalse((root / FINAL_MANIFEST).exists())
                self.assertEqual((root / "SHA256SUMS").read_bytes(), parent)
            finally:
                os.chdir(cwd)
        for target in (STAGE_ARCHIVE, Path("dist/index.html")):
            with self.subTest(target=target), package_repository() as (root, head):
                self.assertEqual(tool(root, "stage-package", head).returncode, 0)
                append = ENGINE_GLOBALS["append_ledger"]
                def append_then_drift(parent: bytes, tail: bytes) -> None:
                    append(parent, tail)
                    path = root / target
                    path.write_bytes(path.read_bytes() + b"x")
                cwd = Path.cwd()
                os.chdir(root)
                try:
                    with mock.patch.dict(ENGINE_GLOBALS,
                                         {"append_ledger": append_then_drift}), \
                            self.assertRaises(ToolError) as raised:
                        promote_package(head)
                    self.assertEqual(raised.exception.code,
                                     "E-PACKAGE-PROMOTION-WRITE")
                    self.assertTrue((root / FINAL_ARCHIVE).is_file())
                    self.assertTrue((root / FINAL_MANIFEST).is_file())
                    self.assertEqual((root / "SHA256SUMS").read_bytes(),
                                     (root / STAGE_LEDGER).read_bytes())
                finally:
                    os.chdir(cwd)

    def test_promotion_copies_stage_and_appends_ledger_once(self) -> None:
        with package_repository() as (root, head):
            self.assertEqual(tool(root, "stage-package", head).returncode, 0)
            staged = self.staged(root)
            parent = (root / "SHA256SUMS").read_bytes()
            cwd = Path.cwd()
            os.chdir(root)
            try:
                with mock.patch.object(os, "write", wraps=os.write) as writes, \
                        redirect_stderr(io.StringIO()), \
                        mock.patch("sys.stdout", new=io.StringIO()):
                    promote_package(head)
                self.assertEqual(writes.call_count, 1)
            finally:
                os.chdir(cwd)
            self.assertEqual((root / FINAL_ARCHIVE).read_bytes(), staged[STAGE_ARCHIVE])
            self.assertEqual((root / FINAL_MANIFEST).read_bytes(), staged[STAGE_MANIFEST])
            self.assertEqual((root / "SHA256SUMS").read_bytes(), staged[STAGE_LEDGER])
            self.assertTrue(staged[STAGE_LEDGER].startswith(parent))
            self.assert_package_failure(root, head, "promote-package",
                "E-PACKAGE-FINAL-EXISTS", "Preview 3 final output already exists")

    def test_promoted_seven_path_commit_passes_existing_verifier(self) -> None:
        with package_repository() as (root, head):
            self.assertEqual(tool(root, "stage-package", head).returncode, 0)
            self.assertEqual(tool(root, "promote-package", head).returncode, 0)
            for name in PACKAGING_PATHS[1:5]:
                path = root.joinpath(*name.split("/"))
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(f"synthetic {name}\n".encode())
            git(root, "add", *PACKAGING_PATHS)
            commit(root, "synthetic packaging commit")
            cwd = Path.cwd()
            os.chdir(root)
            try:
                manifest = load_release_manifest(Path(FINAL_MANIFEST))
                checksums = verify_checksums(PREVIEW3_SPEC, Path("SHA256SUMS"))
                require_checksum(
                    PREVIEW3_SPEC, checksums, Path(FINAL_ARCHIVE), "archive")
                require_checksum(
                    PREVIEW3_SPEC, checksums, Path(FINAL_MANIFEST), "manifest")
                verify_packaging_commit(head, Path("SHA256SUMS"),
                                        Path(FINAL_ARCHIVE), Path(FINAL_MANIFEST))
                output = root / "verified-output"
                verify_and_extract(Path(FINAL_ARCHIVE), manifest, output)
                self.assertEqual(sorted(path.relative_to(output).as_posix()
                                        for path in output.rglob("*") if path.is_file()),
                                 [item["path"] for item in manifest["files"]])
            finally:
                os.chdir(cwd)


if __name__ == "__main__":
    unittest.main()
