#!/usr/bin/env python3
"""Fetch the Django OpenAPI spec and (re)generate the Angular API client.

Usage:
    python3 scripts/generate_api.py [SPEC_URL]

The spec URL defaults to http://localhost:8000/api/openapi.json and can be
overridden with the OPENAPI_URL environment variable or a positional argument.

There is intentionally no ng-openapi-gen.json: every generator option is passed
on the command line from this script.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import NoReturn

# --- configuration -----------------------------------------------------------

FRONTEND_DIR = Path(__file__).resolve().parent.parent
SPEC_RELPATH = Path("openapi") / "openapi.json"
SPEC_PATH = FRONTEND_DIR / SPEC_RELPATH
OUTPUT_DIR = "src/app/api"
GENERATOR = FRONTEND_DIR / "node_modules" / ".bin" / "ng-openapi-gen"

DEFAULT_SPEC_URL = os.environ.get(
    "OPENAPI_URL", "http://localhost:8000/api/openapi.json"
)

# Passed straight to ng-openapi-gen (instead of a config file).
GEN_OPTIONS = [
    "--promises",
    "false",  # return Observables, not Promises
    "--services",
    "true",  # one injectable service per tag
]


def fail(message: str, hints: list[str]) -> NoReturn:
    print(f"\n\u2717 {message}", file=sys.stderr)
    for hint in hints:
        print(f"    {hint}", file=sys.stderr)
    sys.exit(1)


def fetch_spec(url: str) -> None:
    print(f"\u2192 Fetching OpenAPI spec: {url}")
    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            raw = response.read()
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as err:
        fail(
            f"Could not reach the API spec at {url} ({err}).",
            [
                "Is the Django backend running?",
                "    cd backend && ../.venv/bin/python manage.py runserver",
                "Check the host/port (the default spec URL is :8000/api/openapi.json).",
                "Point elsewhere with: OPENAPI_URL=https://... python3 scripts/generate_api.py",
            ],
        )

    try:
        spec = json.loads(raw)
    except json.JSONDecodeError:
        fail(
            f"{url} did not return JSON.",
            [
                "Make sure the URL points at the schema, not the HTML docs:",
                "    schema: .../api/openapi.json      docs: .../api/docs",
            ],
        )

    version = spec.get("openapi")
    if not version:
        fail(
            "The response is not an OpenAPI document (missing 'openapi' version).",
            ["Double-check the spec URL."],
        )

    SPEC_PATH.parent.mkdir(parents=True, exist_ok=True)
    SPEC_PATH.write_text(json.dumps(spec, indent=2) + "\n", encoding="utf-8")
    print(f"    saved spec (OpenAPI {version}) \u2192 {SPEC_RELPATH}")


def generate() -> None:
    if not GENERATOR.exists():
        fail(
            "The Angular API generator is not installed.",
            [
                "Install it as a dev dependency, then re-run:",
                "    cd frontend && npm i -D ng-openapi-gen",
            ],
        )

    cmd = [
        str(GENERATOR),
        "--input",
        SPEC_RELPATH.as_posix(),
        "--output",
        OUTPUT_DIR,
        *GEN_OPTIONS,
    ]
    print(f"\u2192 Generating client \u2192 {OUTPUT_DIR}/")
    result = subprocess.run(cmd, cwd=FRONTEND_DIR)
    if result.returncode != 0:
        fail(
            "ng-openapi-gen failed.",
            [
                "Inspect available options with: npx ng-openapi-gen --help",
                f"Re-run against a known-good spec at {SPEC_RELPATH.as_posix()}.",
            ],
        )

    print(f"\n\u2713 Done. Client generated in {OUTPUT_DIR}/")


def main() -> None:
    url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SPEC_URL
    fetch_spec(url)
    generate()


if __name__ == "__main__":
    main()
