"""Fail-closed verification; reuse sibling quality sensors without copying its app."""

import hashlib
import json
import os
from pathlib import Path
import random
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
from typing import Any

from ..soccer_smart.quality import Coverage, boundaries, lint
from ..soccer_smart.verify import flatten, pyright_command

PACKAGE = Path(__file__).resolve().parent
ROOT = PACKAGE.parent.parent
ARTIFACTS = PACKAGE / ".verification"
RUNTIME = ("model.py", "content.py", "session.py", "notebook.py", "rendering.py", "app.py", "main.py", "web_export.py")
COMMANDS: list[dict[str, Any]] = []
MUTANTS = (
    ("retry records new nodes as first attempts", "session.py",
     "self.practice_only = True\n        self.selected = None", "self.practice_only = False\n        self.selected = None"),
    ("successor discarded", "session.py", "destination = self.feedback.next_node", "destination = None"),
    ("curve becomes a corner", "model.py", 'if self.kind == "curve":', 'if self.kind == "never":'),
    ("ball leaves before contact", "model.py", "fraction - self.contact", "fraction"),
    ("new passing angle still graded blocked", "content.py",
     'action(end, "wide", "Pass from the new angle to RW", 2,',
     'action(end, "wide", "Pass from the new angle to RW", 0,'),
    ("blocked penalty-box shot graded good in B", "content.py",
     'action(end, "shoot", "Shoot low at the marked target", 0,',
     'action(end, "shoot", "Shoot low at the marked target", 2,'),
    ("web export drops episodes", "web_export.py",
     '"episodes": [asdict(ep) for ep in episodes()],', '"episodes": [],'),
    ("web export leaves John unreplaced", "web_export.py",
     '\'"john"\': \'"you"\',', '\'"john"\': \'"john"\','),
)


def execute(command: list[str], cwd: Path = ROOT) -> subprocess.CompletedProcess[str]:
    env = dict(os.environ, SDL_VIDEODRIVER="dummy", SDL_AUDIODRIVER="dummy",
               PYGAME_HIDE_SUPPORT_PROMPT="1", PYTHONDONTWRITEBYTECODE="1", PYTHON_COLORS="0")
    result = subprocess.run(command, cwd=cwd, env=env, text=True,
                            stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=90)
    COMMANDS.append({"command": command, "exit_code": result.returncode})
    return result


def tests_and_coverage() -> dict[str, Any]:
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
        raise RuntimeError(f"Tests: {result.testsRun}; failures: {len(result.failures)}; errors: {len(result.errors)}")
    sensor.require_complete()
    return {"tests": result.testsRun, "statements": sum(r["statements"] for r in report.values()),
            "branch_edges": sum(r["branch_edges"] for r in report.values()), "missing": 0}


def static_checks() -> dict[str, Any]:
    from .web_export import verify_web_export

    failures = {p.name: lint(p.read_text(), p.name) for p in PACKAGE.glob("*.py")}
    for name in RUNTIME:
        checked_as = "model.py" if name in ("notebook.py", "web_export.py") else name
        failures[name] += boundaries((PACKAGE / name).read_text(), checked_as)
    if any(failures.values()):
        raise RuntimeError(str({n: v for n, v in failures.items() if v}))
    assert lint("import os\n", "control.py"), "Lint sensor false green"
    assert boundaries("import socket\n", "model.py"), "Boundary sensor false green"
    spec = (PACKAGE / "SPEC.md").read_text()
    marker = "\n<!-- design-check -->\n```python\n"
    assert spec.count(marker) == 1
    namespace: dict[str, Any] = {}
    exec(spec.split(marker, 1)[1].split("\n```", 1)[0], namespace)
    assert namespace.get("verification_complete") is True
    org = (ROOT / ".ai.code.files/task_20261026_soccer_strategy_game.org").read_bytes()
    assert hashlib.sha256(org[:38214]).hexdigest() == "434e6e8da456a56fcc65820dbcefcd8341be5a07b1b21e98b3a23b8e0f4e475b"
    review = (PACKAGE / "COACHING_REVIEW.md").read_text()
    ledger = review_ledger(review)
    bad = review.replace("turn=2:", "turn=0:", 1)
    assert bad != review, "Coaching negative control was not applied"
    try:
        review_ledger(bad)
    except AssertionError as error:
        assert "Coaching grades differ" in str(error)
    else:
        raise RuntimeError("Coaching ledger false green")
    web_bundle = verify_web_export()
    return {"python_files": len(failures), "violations": 0, "preserved_game_files": 56,
            "complexity_limits": "60 lines / 15 decisions", "lint_boundary_controls_rejected": 2,
            "coaching_ledger": ledger, "bad_coaching_grade_rejected": 1, "web_bundle": web_bundle}


def review_ledger(source: str) -> dict[str, int]:
    from .content import episodes

    assert source.isascii() and all(line == line.rstrip() for line in source.splitlines()), "Review formatting"
    expected = {episode.id + "/" + node.id: {c.key: c.rating for c in node.choices}
                for episode in episodes() for node in episode.nodes}
    rows = re.findall(r"^\| (M\d{2}\.[AB]/\w+) \|(.+)$", source, re.M)
    assert len(rows) == len(expected) and {key for key, _ in rows} == set(expected), "Missing coaching rows"
    for key, body in rows:
        scores = re.findall(r"\b(\w+)=(\d):", body)
        assert len(scores) == 3 and {k: int(v) for k, v in scores} == expected[key], "Coaching grades differ: " + key
    return {"decisions": len(rows), "choices": sum(len(v) for v in expected.values())}


def coverage_control() -> dict[str, int]:
    path = ARTIFACTS / "coverage_control.py"
    source = "value = 1\nif value:\n    result = 2\nelse:\n    result = 3\n"
    path.write_text(source)
    sensor = Coverage([path])
    prior = sys.gettrace()
    try:
        sys.settrace(sensor.trace)
        exec(compile(source, str(path), "exec"), {})
    finally:
        sys.settrace(prior)
    try:
        sensor.require_complete()
    except ValueError as error:
        assert "Uncovered behavior" in str(error)
        return {"known_uncovered_branch_rejected": 1}
    raise RuntimeError("Coverage sensor false green")


def types() -> dict[str, Any]:
    command = pyright_command()
    config: dict[str, Any] = {"include": [os.path.relpath(PACKAGE / n, ARTIFACTS) for n in RUNTIME],
                              "extraPaths": [p for p in sys.path if p], "pythonVersion": "3.13",
                              "typeCheckingMode": "basic"}
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
    bad = ARTIFACTS / "type_control.py"
    bad.write_text('value: int = "wrong"\n')
    config["include"].append(bad.name)
    path.write_text(json.dumps(config))
    control = execute(command + ["--project", str(path), "--outputjson"])
    config["include"].pop()
    path.write_text(json.dumps(config))
    negative = json.loads(control.stdout[control.stdout.index("{"):])
    assert control.returncode == 1 and negative["summary"]["errorCount"] == 1, "Type sensor false green"
    return {"version": raw["version"], **summary, "negative_control_rejected": 1}


def mutations() -> dict[str, int]:
    records = []
    for label, filename, original, replacement in MUTANTS:
        with tempfile.TemporaryDirectory(prefix="soccer-smarter-mutant-") as folder:
            root = Path(folder)
            for name in ("soccer_smart", "soccer_smarter"):
                shutil.copytree(PACKAGE.parent / name, root / "soccer_strategy" / name,
                                ignore=shutil.ignore_patterns("__pycache__", ".verification"))
            shutil.copytree(ROOT / "docs", root / "docs")
            path = root / "soccer_strategy/soccer_smarter" / filename
            source = path.read_text()
            assert source.count(original) == 1, "Mutant is not uniquely applicable: " + label
            path.write_text(source.replace(original, replacement))
            assert path.read_text() != source and replacement in path.read_text(), "Mutant not applied"
            run = execute([sys.executable, "-m", "unittest", "soccer_strategy.soccer_smarter.test_model",
                           "soccer_strategy.soccer_smarter.test_session",
                           "soccer_strategy.soccer_smarter.test_coaching",
                           "soccer_strategy.soccer_smarter.test_web", "-q"], root)
            killed = run.returncode == 1 and "FAIL:" in run.stdout
            records.append({"mutant": label, "applied": True, "executed": True,
                            "killed": killed, "output": run.stdout})
            if not killed:
                raise RuntimeError("Surviving or crashed mutant: " + label + "\n" + run.stdout)
    (ARTIFACTS / "mutations.json").write_text(json.dumps(records, indent=2))
    return {"killed": len(records), "total": len(MUTANTS)}


def suite_health() -> dict[str, int]:
    tests = flatten(unittest.defaultTestLoader.discover(str(PACKAGE), top_level_dir=str(ROOT)))
    random.Random(917).shuffle(tests)
    result = unittest.TextTestRunner(verbosity=0).run(unittest.TestSuite(tests))
    assert tests and result.wasSuccessful(), "Shuffled repeat failed"
    return {"tests": result.testsRun, "failures": 0}


def real_execution() -> dict[str, Any]:
    outputs = {}
    for name in ("soccer_smarter", "soccer_smart", "john", "luke"):
        command = [sys.executable, "-m", "soccer_strategy." + name, "--smoke"]
        if name == "soccer_smarter":
            command += ["--screenshot", str(ARTIFACTS / "feedback.png")]
        run = execute(command)
        if run.returncode or "quit passed" not in run.stdout:
            raise RuntimeError(run.stdout)
        outputs[name] = {"exit_code": 0, "output": run.stdout.strip()}
    node = shutil.which("node")
    assert node is not None, "node not found"
    web_run = execute([
        node, "-e",
        'const fs=require("fs"),d=JSON.parse(fs.readFileSync("docs/soccer_smarter/data.json","utf8")),'
        'w=require("./docs/soccer_smarter/app.js"),'
        'ctx={font:"16px sans-serif",measureText:(s)=>({width:s.length*7.2}),fillText(){},'
        'fillRect(){},strokeRect(){},beginPath(){},roundRect(){},rect(){},fill(){},stroke(){},'
        'arc(){},ellipse(){},moveTo(){},lineTo(){},closePath(){}},'
        'app=new w.SoccerSmarterWebApp(d,{getContext:()=>ctx},null);'
        'app.activate("M01");app.activate("skip");app.activate("choice:0");app.activate("skip");app.draw();'
        'if(app.layoutErrors.length)process.exit(1);console.log("web smoke passed");',
    ])
    if web_run.returncode or "web smoke passed" not in web_run.stdout:
        raise RuntimeError(web_run.stdout)
    outputs["web_smarter"] = {"exit_code": 0, "output": web_run.stdout.strip()}
    return outputs


def source_hash() -> str:
    digest = hashlib.sha256()
    for path in sorted(PACKAGE.rglob("*")):
        if path.is_file() and not {"__pycache__", ".verification"}.intersection(path.parts) and path.name != "EVIDENCE.md":
            digest.update(str(path.relative_to(PACKAGE)).encode())
            digest.update(path.read_bytes())
    return digest.hexdigest()


def main() -> None:
    if ARTIFACTS.exists():
        shutil.rmtree(ARTIFACTS)
    ARTIFACTS.mkdir()
    COMMANDS.clear()
    report: dict[str, Any] = {"python": sys.version, "source_sha256": source_hash(), "gates": {}, "commands": COMMANDS}
    gates = (tests_and_coverage, coverage_control, static_checks, types, mutations, suite_health, real_execution)
    for gate in gates:
        try:
            result = gate()
            report["gates"][gate.__name__] = {"status": "pass", "result": result}
            print(f"PASS {gate.__name__}: {result}", flush=True)
        except Exception as error:
            report["gates"][gate.__name__] = {"status": "fail", "error": str(error)}
            print(f"FAIL {gate.__name__}: {str(error)[:1600]}", flush=True)
    (ARTIFACTS / "report.json").write_text(json.dumps(report, indent=2))
    if any(g["status"] != "pass" for g in report["gates"].values()):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
