"""Export deterministic static JSON and JS bundles for GitHub Pages."""

from dataclasses import asdict
import json
from pathlib import Path
import re
from typing import Any

from .book import lessons
from .book_cards import build_book_cards
from .book_tactics import build_book_scenes
from .book_view import CATEGORIES
from .catalog import build_catalog, build_practice_cards
from .curriculum import GROUPS, SECTIONS

ROOT = Path(__file__).resolve().parent.parent.parent
DEFAULT_DOCS = ROOT / "docs"
REQUIRED_WEB_FILES = (
    "index.html",
    "soccer_smart/index.html",
    "soccer_smart/app.js",
    "soccer_smart/data.json",
    "soccer_smart/data.js",
)
WORD_MAP = {
    '"key": "john"': '"key": "you"',
    '"label": "JOHN"': '"label": "YOU"',
    "John's": "your",
    "behind him": "behind you",
    "John and ": "You and ",
    "John is ": "You are ",
    "John was ": "You were ",
    "John can ": "you can ",
    "John carries": "You carry",
    "John charges past R and opens": "You charge past R and open",
    "John chases": "You chase",
    "John crowds": "You crowd",
    "John cushions": "You cushion",
    "John delays": "You delay",
    "John dribbles": "You dribble",
    "John drifts": "You drift",
    "John drops": "You drop",
    "John duplicates M's press and vacates": "You duplicate M's press and vacate",
    "John follows": "You follow",
    "John gets": "You get",
    "John holds": "You hold",
    "John intercepts": "You intercept",
    "John keeps": "You keep",
    "John lunges": "You lunge",
    "John moves": "You move",
    "John opens": "You open",
    "John reaches the exposed touch first and wins": "You reach the exposed touch first and win",
    "John recovers": "You recover",
    "John retreats too deep and leaves": "You retreat too deep and leave",
    "John retreats": "You retreat",
    "John runs": "You run",
    "John shields": "You shield",
    "John slides": "You slide",
    "John starts": "You start",
    "John stays": "You stay",
    "John steps into A's path and delays": "You step into A's path and delay",
    "while John moves": "while you move",
    "while John steps": "while you step",
    "John steps": "You step",
    "John takes": "You take",
    "John touches": "You touch",
    "John turns and carries": "You turn and carry",
    "John turns": "You turn",
    "John": "you",
}
JOHN_PATTERN = re.compile("|".join(WORD_MAP))


def _replace_match(match: re.Match[str]) -> str:
    return WORD_MAP[match.group(0)]


def build_web_payload() -> dict[str, Any]:
    raw_payload = {
        "version": 1,
        "sections": [asdict(s) for s in SECTIONS],
        "groups": {g.id: asdict(g) for g in GROUPS},
        "categories": [list(item) for item in CATEGORIES],
        "starter_scenes": [asdict(s) for s in build_catalog()],
        "book_scenes": [asdict(s) for s in build_book_scenes()],
        "starter_cards": [asdict(c) for c in build_practice_cards()],
        "book_cards": [asdict(c) for c in build_book_cards()],
        "lessons": [asdict(entry) for entry in lessons()],
    }
    personalized = JOHN_PATTERN.sub(_replace_match, json.dumps(raw_payload))
    return json.loads(personalized)


def format_bundle(payload: dict[str, Any]) -> tuple[str, str]:
    raw_json = json.dumps(payload, indent=2, sort_keys=True) + "\n"
    compact_json = json.dumps(payload, separators=(",", ":"), sort_keys=True)
    raw_js = f"window.SOCCER_SMART_DATA = {compact_json};\n"
    return raw_json, raw_js


def export_web(docs_dir: Path = DEFAULT_DOCS) -> dict[str, int]:
    payload = build_web_payload()
    raw_json, raw_js = format_bundle(payload)
    target = docs_dir / "soccer_smart"
    target.mkdir(parents=True, exist_ok=True)
    (target / "data.json").write_text(raw_json, encoding="utf-8")
    (target / "data.js").write_text(raw_js, encoding="utf-8")
    return {
        "starter_scenes": len(payload["starter_scenes"]),
        "book_scenes": len(payload["book_scenes"]),
        "starter_cards": len(payload["starter_cards"]),
        "book_cards": len(payload["book_cards"]),
        "lessons": len(payload["lessons"]),
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
    actual_json = (docs_dir / "soccer_smart/data.json").read_text(encoding="utf-8")
    actual_js = (docs_dir / "soccer_smart/data.js").read_text(encoding="utf-8")
    if actual_json != expected_json or actual_js != expected_js:
        raise ValueError("Web data bundle is out of sync with Python catalog")
    return {
        "web_files": len(REQUIRED_WEB_FILES),
        "scenes": len(payload["starter_scenes"]) + len(payload["book_scenes"]),
        "cards": len(payload["starter_cards"]) + len(payload["book_cards"]),
        "lessons": len(payload["lessons"]),
    }
