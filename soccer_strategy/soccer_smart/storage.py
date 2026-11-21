"""Pure local JSON progress persistence for stars, cups, badges, and Soccer IQ radar."""

import json
from pathlib import Path
from typing import Any

DEFAULT_RADAR = {"vision": 35, "spacing": 35, "timing": 35, "defending": 35}


def default_data() -> dict[str, Any]:
    return {
        "version": 2,
        "classic_best": {},
        "match_results": {},
        "badges": [],
        "radar": dict(DEFAULT_RADAR),
        "rules_tier": "7v7",
    }


class ProgressStore:
    def __init__(self, path: Path | None = None):
        self.path = path
        self.data: dict[str, Any] = default_data()
        self.load()

    def load(self) -> None:
        if self.path is None or not self.path.is_file():
            return
        try:
            raw = json.loads(self.path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return
        if isinstance(raw, dict):
            base = default_data()
            for key in ("classic_best", "match_results", "radar"):
                if isinstance(raw.get(key), dict):
                    base[key].update(raw[key])
            if isinstance(raw.get("badges"), list):
                base["badges"] = [str(b) for b in raw["badges"]]
            if raw.get("rules_tier") in ("7v7", "9v9"):
                base["rules_tier"] = raw["rules_tier"]
            self.data = base

    def save(self) -> None:
        if self.path is None:
            return
        try:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            self.path.write_text(json.dumps(self.data, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        except OSError:
            return

    def record_classic(self, scene_id: str, rating: int) -> None:
        best = self.data["classic_best"]
        if rating > int(best.get(scene_id, -1)):
            best[scene_id] = rating
            self.save()

    def record_match(self, match_id: str, stars: int, won: bool, home: int, away: int,
                     badges: list[str], radar_delta: dict[str, int]) -> None:
        prior = self.data["match_results"].get(match_id, {})
        self.data["match_results"][match_id] = {
            "stars": max(stars, int(prior.get("stars", 0))),
            "won": bool(won or prior.get("won", False)),
            "home": home,
            "away": away,
        }
        seen = set(self.data["badges"])
        for badge in badges:
            if badge not in seen:
                self.data["badges"].append(badge)
                seen.add(badge)
        for axis, delta in radar_delta.items():
            if axis in self.data["radar"]:
                self.data["radar"][axis] = max(0, min(100, int(self.data["radar"][axis]) + delta))
        self.save()

    def set_tier(self, tier: str) -> None:
        if tier in ("7v7", "9v9"):
            self.data["rules_tier"] = tier
            self.save()
