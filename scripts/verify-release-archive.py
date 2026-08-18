#!/usr/bin/env python3
"""Pinned Preview 3 release-archive verifier and documented checksum facade."""

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from release_archive_verifier import (
    RELEASE_SPECS,
    run_for,
    verify_checksums as _verify_checksums,
)

_SPEC = RELEASE_SPECS["preview3"]

def verify_checksums(path: Path) -> dict[str, str]:
    return _verify_checksums(_SPEC, path)


if __name__ == "__main__":
    raise SystemExit(run_for("preview3"))
