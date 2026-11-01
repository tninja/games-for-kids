"""Reproduce local evidence: python3 -m soccer_strategy.luke.verify.

No missing tool or failed gate is counted as success. Diagnostic MCP status is
recorded separately in EVIDENCE.md because a subprocess cannot query the editor.
"""

import argparse
import hashlib
import json
import os
import random
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from typing import Any, Callable

from ..john.quality import Coverage, boundaries, lint

RUNTIME = ("model.py", "content.py", "session.py", "animation.py", "audio.py",
           "drawing.py", "app.py", "main.py", "match_content.py", "match_motion.py", "club.py")

PACKAGE = Path(__file__).resolve().parent
ROOT = PACKAGE.parent.parent
ARTIFACTS = PACKAGE / ".verification"
COMMANDS: list[dict[str, Any]] = []
MUTANTS = (
    ("skips the wrong-choice animation", "session.py",
     'self.phase = "show" if good else "attempt"', 'self.phase = "show"'),
    ("retry rewrites stars", "session.py", "self.results.setdefault(self.picture.id, good)",
     "self.results[self.picture.id] = good"),
    ("ignores the third match choice", "session.py", 'index < len(self.picture.choices)',
     'index < min(2, len(self.picture.choices))'),
    ("sweeps outside with hands", "match_motion.py", 'return _feet(p, t)', 'return _receive(p, t)'),
    ("reveals the answer halo", "app.py",
     'if s.phase == "feedback":\n            target = picture.ball_target',
     'if s.phase in ("choose", "feedback"):\n            target = picture.ball_target'),
    ("ignores warmup input", "app.py", 'if self.fun.pop():', 'if False:'),
    ("high fives award first-try stars", "app.py", 'self.audio.play("highfive")',
     'self.audio.play("highfive")\n                self.session.results[self.session.picture.id] = True'),
    ("redrawing repeats a sound", "app.py", 'draw_club_party(self.canvas, self.fun)',
     'draw_club_party(self.canvas, self.fun)\n            self.audio.play("highfive")'),
    ("warmup interrupts lessons", "app.py",
     'return self.session is None or self.session.phase == "summary"', 'return True'),
)


def execute(command: list[str], cwd: Path = ROOT, timeout: int = 90) -> subprocess.CompletedProcess[str]:
    env = dict(os.environ, SDL_VIDEODRIVER="dummy", SDL_AUDIODRIVER="dummy",
               PYGAME_HIDE_SUPPORT_PROMPT="1", PYTHONDONTWRITEBYTECODE="1")
    result = subprocess.run(command, cwd=cwd, env=env, text=True,
                            stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=timeout)
    COMMANDS.append({"command": command, "cwd": str(cwd), "exit_code": result.returncode})
    return result


def flatten(suite: unittest.TestSuite) -> list[unittest.TestCase]:
    result: list[unittest.TestCase] = []
    for test in suite:
        result.extend(flatten(test) if isinstance(test, unittest.TestSuite) else [test])
    return result


def unit_and_coverage() -> dict[str, Any]:
    sensor = Coverage([PACKAGE / name for name in RUNTIME])
    prior = sys.gettrace()
    try:
        sys.settrace(sensor.trace)
        suite = unittest.defaultTestLoader.discover(str(PACKAGE), top_level_dir=str(ROOT))
        result = unittest.TextTestRunner(verbosity=1).run(suite)
    finally:
        sys.settrace(prior)
    report = sensor.report()
    (ARTIFACTS / "coverage.json").write_text(json.dumps(report, indent=2))
    if not result.wasSuccessful() or result.testsRun == 0:
        raise RuntimeError(f"Tests: {result.testsRun}, failures: {len(result.failures)}, errors: {len(result.errors)}")
    sensor.require_complete()
    return {"tests": result.testsRun,
            "statements": sum(r["statements"] for r in report.values()),
            "covered": sum(r["covered"] for r in report.values()),
            "branch_edges": sum(r["branch_edges"] for r in report.values()),
            "covered_edges": sum(r["covered_edges"] for r in report.values())}


def suite_health() -> dict[str, int]:
    suite = unittest.defaultTestLoader.discover(str(PACKAGE), top_level_dir=str(ROOT))
    tests = flatten(suite)
    random.Random(734).shuffle(tests)
    result = unittest.TextTestRunner(verbosity=0).run(unittest.TestSuite(tests))
    if not tests or not result.wasSuccessful():
        raise RuntimeError("Shuffled-order repeat failed")
    return {"repeated_tests": result.testsRun, "failures": 0}


def static_checks() -> dict[str, int]:
    files = list(PACKAGE.glob("*.py"))
    failures = {p.name: lint(p.read_text(), p.name) for p in files}
    for name in RUNTIME:
        rule_name = "presentation.py" if name in ("animation.py", "match_motion.py", "club.py") else name
        rule_name = "content.py" if name == "match_content.py" else rule_name
        failures[name].extend(boundaries((PACKAGE / name).read_text(), rule_name))
    bad = {name: messages for name, messages in failures.items() if messages}
    if bad:
        raise RuntimeError(str(bad))
    if not lint("import os\n", "bad_control.py"):
        raise RuntimeError("Hygiene sensor accepted an unused import")
    if "pygame" not in boundaries("import pygame\n", "model.py"):
        raise RuntimeError("Boundary sensor accepted rendering in the model")
    return {"files": len(files), "violations": 0, "max_function_lines": 60,
            "max_decisions": 15, "negative_controls": 2}


def pyright_command() -> list[str]:
    installed = shutil.which("pyright")
    if installed:
        return [installed]
    cache = Path.home() / ".cache/uv/wheels-v6/pypi/pyright"
    matches = sorted(cache.glob("*/pyright/dist/index.js"))
    node = shutil.which("node")
    if matches and node:
        return [node, str(matches[-1])]
    raise RuntimeError("UNAVAILABLE: install pyright to run the static type gate")


def types() -> dict[str, Any]:
    command = pyright_command()
    config: dict[str, Any] = {
        "include": [os.path.relpath(PACKAGE / n, ARTIFACTS) for n in RUNTIME],
        "extraPaths": [p for p in sys.path if p], "pythonVersion": "3.13",
        "typeCheckingMode": "basic",
    }
    if command[-1].endswith("index.js"):
        config["typeshedPath"] = str((Path(command[-1]).parent / "dist/typeshed-fallback").resolve())
    path = ARTIFACTS / "pyrightconfig.json"
    path.write_text(json.dumps(config))
    run = execute(command + ["--project", str(path), "--outputjson"])
    raw = json.loads(run.stdout[run.stdout.index("{"):])
    (ARTIFACTS / "types.json").write_text(json.dumps(raw, indent=2))
    summary = raw["summary"]
    if run.returncode or summary["errorCount"] or summary["warningCount"] or summary["filesAnalyzed"] != len(RUNTIME):
        raise RuntimeError(run.stdout)
    control = ARTIFACTS / "typing_control.py"
    control.write_text('value: int = "not an integer"\n')
    config["include"].append(control.name)
    path.write_text(json.dumps(config))
    negative = execute(command + ["--project", str(path), "--outputjson"])
    path.write_text(json.dumps({**config, "include": config["include"][:-1]}))
    negative_raw = json.loads(negative.stdout[negative.stdout.index("{"):])
    if negative.returncode != 1 or negative_raw["summary"]["errorCount"] != 1:
        raise RuntimeError("Type checker did not reject its known-bad control")
    return {"version": raw["version"], **summary, "negative_control_rejected": True}


def mutations() -> dict[str, Any]:
    results = []
    for name, filename, original, replacement in MUTANTS:
        with tempfile.TemporaryDirectory(prefix="luke-mutant-") as folder:
            root = Path(folder)
            target = root / "soccer_strategy" / "luke"
            shutil.copytree(PACKAGE, target,
                            ignore=shutil.ignore_patterns("__pycache__", ".verification"))
            path = target / filename
            source = path.read_text()
            if source.count(original) != 1:
                raise RuntimeError(f"Mutant was not uniquely applicable: {name}")
            changed = source.replace(original, replacement)
            path.write_text(changed)
            if path.read_text() == source or replacement not in path.read_text():
                raise RuntimeError(f"Mutant was not applied: {name}")
            run = execute([sys.executable, "-m", "unittest", "discover", "-s",
                           "soccer_strategy/luke", "-t", ".", "-q"], root)
            killed = run.returncode == 1 and "FAIL:" in run.stdout
            results.append({"name": name, "applied": True, "executed": True,
                            "killed": killed, "output": run.stdout})
            if not killed:
                raise RuntimeError(f"Mutant survived or failed without assertions: {name}: {run.stdout}")
    (ARTIFACTS / "mutations.json").write_text(json.dumps(results, indent=2))
    return {"killed": len(results), "total": len(MUTANTS)}


def real_execution() -> dict[str, Any]:
    run = execute([sys.executable, "-m", "soccer_strategy.luke", "--smoke", "--screenshot",
                   str(ARTIFACTS / "feedback.png")])
    if run.returncode or "summary and quit passed" not in run.stdout:
        raise RuntimeError(run.stdout)
    return {"exit_code": run.returncode, "screenshot": "feedback.png", "output": run.stdout}


def source_hash() -> str:
    digest = hashlib.sha256()
    sensor = PACKAGE.parent / "john" / "quality.py"
    digest.update(b"../john/quality.py")
    digest.update(sensor.read_bytes())
    for path in sorted(PACKAGE.rglob("*")):
        if path.is_file() and ".verification" not in path.parts and "__pycache__" not in path.parts and path.name != "EVIDENCE.md":
            digest.update(str(path.relative_to(PACKAGE)).encode())
            digest.update(path.read_bytes())
    return digest.hexdigest()


def main() -> None:
    argparse.ArgumentParser(description=__doc__).parse_args()
    if ARTIFACTS.exists():
        shutil.rmtree(ARTIFACTS)
    ARTIFACTS.mkdir()
    report: dict[str, Any] = {"python": sys.version, "source_sha256": source_hash(),
                            "gates": {}, "commands": COMMANDS}
    gates: tuple[tuple[str, Callable[[], Any]], ...] = (
        ("tests_and_coverage", unit_and_coverage), ("lint_boundaries_complexity", static_checks),
        ("types", types), ("mutation", mutations), ("suite_health", suite_health),
        ("real_execution", real_execution),
    )
    for name, check in gates:
        try:
            result = check()
            report["gates"][name] = {"status": "pass", "result": result}
            print(f"PASS {name}: {result}", flush=True)
        except Exception as error:
            report["gates"][name] = {"status": "fail", "error": str(error)}
            print(f"FAIL {name}: {error}", flush=True)
    (ARTIFACTS / "report.json").write_text(json.dumps(report, indent=2))
    if any(g["status"] != "pass" for g in report["gates"].values()):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
