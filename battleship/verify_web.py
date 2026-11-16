"""Reproducible verification gauntlet for docs/battleship web migration.

Run from repo root:
    python3 battleship/verify_web.py
"""

from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import random
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parent.parent
BATTLESHIP = ROOT / "battleship"
DOCS = ROOT / "docs"

MUTANTS = (
    (
        "duplicate shot allowed to consume turn",
        "if (this.player.hasTried(row, col)) {\n      return { accepted: false, reason: \"already_fired\", coord: encodeLoc(row, col) };\n    }",
        "if (false) {\n      return { accepted: false, reason: \"already_fired\", coord: encodeLoc(row, col) };\n    }",
    ),
    (
        "reroll allowed after battle starts",
        "if (this.shotsFired > 0 || this.gameOver) {\n      return false;\n    }",
        "if (this.gameOver) {\n      return false;\n    }",
    ),
    (
        "cursor movement ignores upper bound",
        "this.cursor[1] = Math.max(0, this.cursor[1] - 1);",
        "this.cursor[1] = this.cursor[1] - 1;",
    ),
    (
        "AI ignores aligned line extension",
        "if (hitsInProgress.length > 1) {",
        "if (false) {",
    ),
    (
        "firing allowed after gameOver",
        "if (this.gameOver) {\n      return { accepted: false, reason: \"game_over\" };\n    }",
        "if (false) {\n      return { accepted: false, reason: \"game_over\" };\n    }",
    ),
    (
        "muted sound still triggers playback",
        "SoundEffects.prototype.play = function (kind) {\n    if (this.muted) {\n      return false;\n    }",
        "SoundEffects.prototype.play = function (kind) {\n    if (false) {\n      return false;\n    }",
    ),
    (
        "enemy reveal ignores pending projectile",
        "BattleshipWebApp.prototype.isEnemyCellRevealed = function (row, col) {\n    return Boolean(this.game.player.hitRecordAt(row, col)) && !this.pendingEnemyKeys[row + \",\" + col];\n  };",
        "BattleshipWebApp.prototype.isEnemyCellRevealed = function (row, col) {\n    return Boolean(this.game.player.hitRecordAt(row, col));\n  };",
    ),
    (
        "mobile mode keeps desktop cell size",
        "var cellSize = this.mobileMode ? (n === 10 ? 46 : 66) : (n === 10 ? 42 : 58);",
        "var cellSize = n === 10 ? 42 : 58;",
    ),
)


def _flatten(suite: unittest.TestSuite) -> list[unittest.TestCase]:
    out: list[unittest.TestCase] = []
    for item in suite:
        out.extend(_flatten(item) if isinstance(item, unittest.TestSuite) else [item])
    return out


def run_unit_suites() -> dict[str, int]:
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    suite.addTests(loader.discover(str(BATTLESHIP), pattern="test_*.py", top_level_dir=str(BATTLESHIP)))
    suite.addTests(loader.loadTestsFromName("battleship.test_web"))
    suite.addTests(loader.loadTestsFromName("soccer_strategy.soccer_smart.test_web"))
    suite.addTests(loader.loadTestsFromName("soccer_strategy.soccer_smarter.test_web"))
    result = unittest.TextTestRunner(verbosity=1).run(suite)
    if not result.wasSuccessful() or result.testsRun == 0:
        raise RuntimeError(
            f"Suite failed: run={result.testsRun}, failures={len(result.failures)}, errors={len(result.errors)}"
        )
    return {"tests": result.testsRun, "failures": 0, "errors": 0}


def run_suite_health() -> dict[str, int]:
    loader = unittest.TestLoader()
    tests = _flatten(loader.loadTestsFromName("battleship.test_web"))
    random.Random(2026).shuffle(tests)
    result = unittest.TextTestRunner(verbosity=0).run(unittest.TestSuite(tests))
    if not tests or not result.wasSuccessful():
        raise RuntimeError("Shuffled-order repeat failed")
    return {"shuffled_tests": result.testsRun, "failures": 0}


def run_js_syntax_and_lint() -> dict[str, int]:
    node = shutil.which("node")
    if not node:
        raise RuntimeError("node is required")
    app_js = DOCS / "battleship/app.js"
    check = subprocess.run([node, "--check", str(app_js)], capture_output=True, text=True, check=False)
    if check.returncode != 0:
        raise RuntimeError(f"JS syntax check failed: {check.stderr}")

    # Negative control: broken JS must fail node --check
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False) as tmp:
        tmp.write("function broken( { return 1; }\n")
        tmp_path = Path(tmp.name)
    try:
        neg = subprocess.run([node, "--check", str(tmp_path)], capture_output=True, text=True, check=False)
        if neg.returncode == 0:
            raise RuntimeError("Negative control passed node --check unexpectedly")
    finally:
        tmp_path.unlink(missing_ok=True)

    checked_files = [DOCS / "index.html", DOCS / "battleship/index.html", app_js, BATTLESHIP / "test_web.py"]
    for path in checked_files:
        text = path.read_text(encoding="utf-8")
        if not text.isascii() or any("\t" in line or line != line.rstrip() for line in text.splitlines()):
            raise RuntimeError(f"ASCII/whitespace violation in {path}")
    return {"js_syntax_errors": 0, "ascii_whitespace_violations": 0, "negative_control_rejected": 1}


def run_mutations() -> dict[str, int]:
    killed = 0
    for name, original, replacement in MUTANTS:
        with tempfile.TemporaryDirectory(prefix="bs-mutant-") as tmp:
            root = Path(tmp)
            shutil.copytree(BATTLESHIP, root / "battleship", ignore=shutil.ignore_patterns("__pycache__"))
            shutil.copytree(DOCS, root / "docs")
            target = root / "docs/battleship/app.js"
            source = target.read_text(encoding="utf-8")
            if source.count(original) != 1:
                raise RuntimeError(f"Mutant not uniquely applicable: {name}")
            mutated = source.replace(original, replacement, 1)
            target.write_text(mutated, encoding="utf-8")
            if target.read_text(encoding="utf-8") == source:
                raise RuntimeError(f"Mutant not written: {name}")
            run = subprocess.run(
                [sys.executable, "-m", "unittest", "battleship.test_web", "-q"],
                cwd=root,
                capture_output=True,
                text=True,
                check=False,
            )
            if run.returncode == 0:
                raise RuntimeError(f"Mutant survived: {name}")
            killed += 1
    return {"killed": killed, "total": len(MUTANTS)}


def run_real_execution() -> dict[str, object]:
    node = shutil.which("node")
    if not node:
        raise RuntimeError("node is required")
    script = (
        'const bs = require("./docs/battleship/app.js");'
        'const ctx = {font:"16px sans-serif",globalAlpha:1,measureText:(s)=>({width:String(s).length*7.2}),'
        'fillText(){},fillRect(){},strokeRect(){},beginPath(){},roundRect(){},rect(){},fill(){},stroke(){},'
        'arc(){},moveTo(){},lineTo(){},closePath(){},setLineDash(){},save(){},restore(){},translate(){}};'
        'const app = new bs.BattleshipWebApp({getContext:()=>ctx},{seed:123});'
        'app.handleKeyDown("f");app.handleKeyDown("ArrowRight");app.handleKeyDown("Enter");'
        'app.tick(0.3);app.draw();app.tick(0.5);app.draw();'
        'if(app.layoutErrors.length) process.exit(1);'
        'console.log(JSON.stringify({shots:app.game.shotsFired,compShots:app.game.computer.hitHistory.length,sounds:app.sound.played}));'
    )
    res = subprocess.run([node, "-e", script], cwd=ROOT, capture_output=True, text=True, check=True)
    return json.loads(res.stdout.strip())


def tree_hash() -> str:
    digest = hashlib.sha256()
    for rel in ("docs/index.html", "docs/battleship/index.html", "docs/battleship/app.js", "battleship/test_web.py"):
        path = ROOT / rel
        digest.update(rel.encode("utf-8"))
        digest.update(path.read_bytes())
    return digest.hexdigest()


def main() -> None:
    if str(ROOT) not in sys.path:
        sys.path.insert(0, str(ROOT))
    os.environ.setdefault("SDL_VIDEODRIVER", "dummy")
    os.environ.setdefault("SDL_AUDIODRIVER", "dummy")
    os.environ.setdefault("PYGAME_HIDE_SUPPORT_PROMPT", "1")

    results = {
        "tree_sha256": tree_hash(),
        "unit_suites": run_unit_suites(),
        "suite_health": run_suite_health(),
        "js_syntax_and_lint": run_js_syntax_and_lint(),
        "mutations": run_mutations(),
        "real_execution": run_real_execution(),
    }
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
