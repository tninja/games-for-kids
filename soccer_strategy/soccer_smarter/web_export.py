"""Export deterministic static JSON and JS bundles for Soccer Smarter on GitHub Pages."""

from dataclasses import asdict
import json
from pathlib import Path
import re
from typing import Any

from .content import TITLES, episodes
from .notebook import PLAN, PRINCIPLES, PRO_WATCH

ROOT = Path(__file__).resolve().parent.parent.parent
DEFAULT_DOCS = ROOT / "docs"
REQUIRED_WEB_FILES = (
    "index.html",
    "soccer_smarter/index.html",
    "soccer_smarter/app.js",
    "soccer_smarter/data.json",
    "soccer_smarter/data.js",
)
SMARTER_MAP = {
    '"john"': '"you"',
    '"JOHN"': '"YOU"',
    "You still play John": "You move off the ball",
    "John is open": "YOU are open",
    "John supports": "YOU support",
    "John overlapped": "YOU overlapped",
    "John ran": "You ran",
    "John stepped up in support and has": "You stepped up in support and have",
    "John and F": "YOU and F",
    "ahead of John": "ahead of you",
    "to John": "to YOU",
    "overlapping John": "overlapping YOU",
}
JOHN_PATTERN = re.compile("|".join(SMARTER_MAP))


def _replace_match(match: re.Match[str]) -> str:
    return SMARTER_MAP[match.group(0)]


def build_web_payload() -> dict[str, Any]:
    raw_payload = {
        "version": 1,
        "missions": [{"id": f"M0{i + 1}", "title": title} for i, title in enumerate(TITLES)],
        "episodes": [asdict(ep) for ep in episodes()],
        "notebook": {
            "X01": [asdict(step) for step in PRINCIPLES],
            "X02": [asdict(step) for step in PLAN],
            "X03": [asdict(step) for step in PRO_WATCH],
        },
    }
    personalized = JOHN_PATTERN.sub(_replace_match, json.dumps(raw_payload))
    return json.loads(personalized)


def format_bundle(payload: dict[str, Any]) -> tuple[str, str]:
    raw_json = json.dumps(payload, indent=2, sort_keys=True) + "\n"
    compact_json = json.dumps(payload, separators=(",", ":"), sort_keys=True)
    raw_js = f"window.SOCCER_SMARTER_DATA = {compact_json};\n"
    return raw_json, raw_js


def export_web(docs_dir: Path = DEFAULT_DOCS) -> dict[str, int]:
    payload = build_web_payload()
    raw_json, raw_js = format_bundle(payload)
    target = docs_dir / "soccer_smarter"
    target.mkdir(parents=True, exist_ok=True)
    (target / "data.json").write_text(raw_json, encoding="utf-8")
    (target / "data.js").write_text(raw_js, encoding="utf-8")
    return {
        "missions": len(payload["missions"]),
        "episodes": len(payload["episodes"]),
        "notebook": len(payload["notebook"]),
    }


def verify_web_export(docs_dir: Path = DEFAULT_DOCS) -> dict[str, int]:
    for rel in REQUIRED_WEB_FILES:
        path = docs_dir / rel
        if not path.is_file():
            raise ValueError(f"Missing web file: {rel}")
        text = path.read_text(encoding="utf-8")
        if not text.isascii() or any(line != line.rstrip() or "\t" in line for line in text.splitlines()):
            raise ValueError(f"ASCII or whitespace violation in {rel}")
    payload = build_web_payload()
    expected_json, expected_js = format_bundle(payload)
    actual_json = (docs_dir / "soccer_smarter/data.json").read_text(encoding="utf-8")
    actual_js = (docs_dir / "soccer_smarter/data.js").read_text(encoding="utf-8")
    if actual_json != expected_json or actual_js != expected_js:
        raise ValueError("Web data bundle is out of sync with Python catalog")
    return {
        "web_files": len(REQUIRED_WEB_FILES),
        "missions": len(payload["missions"]),
        "episodes": len(payload["episodes"]),
        "notebook": len(payload["notebook"]),
    }
