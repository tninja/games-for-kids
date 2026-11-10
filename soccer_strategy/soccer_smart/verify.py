"""Reproduce local evidence: python3 -m soccer_strategy.soccer_smart.verify.

No missing tool or failed gate is counted as success. Diagnostic MCP status is
recorded separately in EVIDENCE.md because a subprocess cannot query the editor.
"""

import argparse
import hashlib
import json
import os
import random
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from typing import Any, Callable

from .quality import Coverage, RUNTIME, boundaries, lint

PACKAGE = Path(__file__).resolve().parent
CHECKED_MODULES = (*RUNTIME, "web_export.py", "play_model.py", "play_content.py", "play_session.py", "play_view.py")
ROOT = PACKAGE.parent.parent
ARTIFACTS = PACKAGE / ".verification"
COMMANDS: list[dict[str, Any]] = []
DOCS = ("README.md", "DESIGN.md", "CURRICULUM.md", "SCENARIOS.md",
        "SOURCES.md", "SPEC.md", "EVIDENCE.md", "BOOK_COVERAGE.md", "CONTINUOUS_PLAY.md", "COACHING_REVIEW.md")
MUTANTS = (
    ("every choice rated strong", "catalog.py",
     "Choice(c.key, c.label, c.target, c.rating, c.explanation,",
     "Choice(c.key, c.label, c.target, 2, c.explanation,"),
    ("retry overwrites first attempt", "session.py",
     "self.results.setdefault(self.scene.id, self.scene.choices[index].rating)",
     "self.results[self.scene.id] = self.scene.choices[index].rating"),
    ("choose allowed during observation", "session.py",
     'if self.phase != "decide" or not 0 <= index < 3:',
     'if not 0 <= index < 3:'),
    ("ball stays still on outcome", "presentation.py",
     "return actors, lerp(scene.ball, choice.ball_end, ball_t)",
     "return actors, scene.ball"),
    ("pass leaves before contact", "presentation.py",
     "ball_t = outgoing_fraction(t) if choice.action_kind in RELEASE_KINDS else t",
     "ball_t = t"),
    ("pass arrow points to John step instead of receiver", "presentation.py",
     "return choice.ball_end if choice.action_kind in RELEASE_KINDS else choice.target",
     "return choice.target"),
    ("transfer loses base identity", "model.py",
     'return self.id.split(":")[0]',
     "return self.id"),
    ("coach route hidden in feedback", "app.py",
     'if distinct or s.phase == "coach":',
     "if False:"),
    ("offside index entry missing", "book.py",
     '        strategy(75, "Time the run", "G10", added(75)),\n', ""),
    ("offside diagram ignores the ball", "book_tactics.py",
     'OFFSIDE, 20. if behind_ball else 30.)', 'OFFSIDE, 30.)'),
    ("book pagination cannot advance", "book_view.py",
     'self.page + delta', 'self.page'),
    ("web export drops book scenes", "web_export.py",
     '"book_scenes": [asdict(s) for s in build_book_scenes()],',
     '"book_scenes": [],'),
    ("web export skips You personalization", "web_export.py",
     "personalized = JOHN_PATTERN.sub(_replace_match, json.dumps(raw_payload))",
     "personalized = json.dumps(raw_payload)"),
    ("continuous ignores selected branch", "play_session.py",
     'destination = dict(self.play.node(self.node_id).exits)[self.feedback.key]',
     'destination = dict(self.play.node(self.node_id).exits)[self.scene.choices[0].key]'),
    ("continuous practice inflates first-run scores", "play_session.py",
     'if not self.practice_only:', 'if True:'),
    ("continuous permits teleporting links", "play_model.py",
     'raise ValueError("Play link teleports actors or ball")', 'pass'),
    ("continuous loses third opening", "play_content.py",
     'for family in range(1,9) for v in "ABC"', 'for family in range(1,9) for v in "AB"'),
    ("web continuous returns to root", "../../docs/soccer_smart/app.js",
     'this.nodeId = target;', 'this.nodeId = this.play.nodes[0].scene.id;'),
    ("web practice scores unvisited branch", "../../docs/soccer_smart/app.js",
     'if (!this.practiceOnly && !(this.scene.id in this.results)) {',
     'if (!(this.scene.id in this.results)) {'),
    ("safe opening alternative loses credit", "play_content.py",
     'rating = 0 if bad else 2', 'rating = 0 if bad else 1 if key == "left" else 2'),
    ("recovery awards an unreleased ball", "play_content.py",
     'option("recover","Recover toward goal-side cover",2,target,ball,"move",',
     'option("recover","Recover toward goal-side cover",2,target,target,"intercept",'),
    ("shot corner ignores keeper", "play_content.py",
     'corner = max(((44.,0.),(56.,0.)),key=lambda p:clearance(ball,p,people,keepers=True))',
     'corner = max(((44.,0.),(56.,0.)),key=lambda p:clearance(ball,p,people,keepers=False))'),
    ("coach replaces a correct chosen route", "presentation.py",
     'if scene.stage == 8 and selected is not None and scene.choices[selected].rating == 2:', 'if False:'),
    ("web coach replaces a correct chosen route", "../../docs/soccer_smart/app.js",
     'if (scene.stage === 8 && selected !== null && selected !== undefined && scene.choices[selected].rating === 2) {',
     'if (false) {'),
)


def execute(command: list[str], cwd: Path = ROOT,
            timeout: int = 90) -> subprocess.CompletedProcess[str]:
    env = dict(os.environ, SDL_VIDEODRIVER="dummy", SDL_AUDIODRIVER="dummy",
               PYGAME_HIDE_SUPPORT_PROMPT="1", PYTHONDONTWRITEBYTECODE="1",
               NO_COLOR="1", PYTHON_COLORS="0")
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
    sensor = Coverage([PACKAGE / name for name in CHECKED_MODULES])
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
        raise RuntimeError(
            f"Tests: {result.testsRun}, failures: {len(result.failures)}, errors: {len(result.errors)}"
        )
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


def _check_docs_and_preservation() -> dict[str, int]:
    fence = chr(96) * 3
    links_checked = 0
    for name in DOCS:
        path = PACKAGE / name
        if not path.is_file():
            raise RuntimeError(f"Missing document: {name}")
        text = path.read_text()
        if not text.isascii() or any(line != line.rstrip() or "\t" in line for line in text.splitlines()):
            raise RuntimeError(f"ASCII or whitespace violation in {name}")
        prose = re.sub(f"{fence}.*?{fence}", "", text, flags=re.S)
        for link in re.findall(r"\[[^\]\n]+\]\(([^)]+)\)", prose):
            if link.startswith(("https://", "http://", "#")):
                continue
            target = (path.parent / link.split("#", 1)[0]).resolve()
            if not (target.is_relative_to(ROOT) and target.is_file()):
                raise RuntimeError(f"Broken local link in {name}: {link}")
            links_checked += 1
    records = {}
    for sibling in ("john", "luke"):
        for path in (ROOT / "soccer_strategy" / sibling).rglob("*"):
            if path.is_file() and not any(p in ("__pycache__", ".verification") for p in path.parts):
                records[str(path.relative_to(ROOT))] = hashlib.sha256(path.read_bytes()).hexdigest()
    preserved = hashlib.sha256()
    for rel, digest in sorted(records.items()):
        preserved.update(rel.encode())
        preserved.update(digest.encode())
    if preserved.hexdigest() != "5727d1586f543e159fb6f3abb23a1221465f978cd03aaa9968f15ab640d79e70":
        raise RuntimeError("Existing John/Luke game files were modified")
    org = (ROOT / ".ai.code.files/task_20261026_soccer_strategy_game.org").read_bytes()
    if hashlib.sha256(org[:33741]).hexdigest() != "5422f615b9b12c01d1e53e6310a51cbe5badcc471dbdfd78c440bc576ed862bb":
        raise RuntimeError("Original Org prefix was modified")
    if hashlib.sha256((PACKAGE / "content.py").read_bytes()).hexdigest() != "8c797af7fefc30bc1befb7bed4c340e8f40f2ce84e76daf05e63a7a8e3494f60":
        raise RuntimeError("Original 36 scenes and 7 cards were changed")
    return {"docs": len(DOCS), "links": links_checked, "preserved_files": len(records)}


def static_checks() -> dict[str, int]:
    from .web_export import verify_web_export

    files = list(PACKAGE.glob("*.py"))
    failures = {p.name: lint(p.read_text(), p.name) for p in files}
    for name in CHECKED_MODULES:
        pure = name in ("web_export.py","play_model.py","play_content.py","play_session.py")
        failures[name].extend(boundaries((PACKAGE / name).read_text(), "model.py" if pure else name))
    bad = {name: messages for name, messages in failures.items() if messages}
    if bad:
        raise RuntimeError(str(bad))
    doc_stats = _check_docs_and_preservation()
    web_stats = verify_web_export()
    coaching_stats = coaching_checks()
    ledger = (PACKAGE / "BOOK_COVERAGE.md").read_text()
    coverage_stats = check_book_ledger(ledger)
    broken = ledger.replace("bk008", "missing-card", 1)
    if broken == ledger:
        raise RuntimeError("Coverage negative control was not applied")
    try:
        check_book_ledger(broken)
    except ValueError as error:
        if "Coverage row differs" not in str(error):
            raise
    else:
        raise RuntimeError("Coverage ledger accepted a wrong destination")
    return {"files": len(files), "violations": 0, "max_function_lines": 60,
            "max_decisions": 15, **doc_stats, **web_stats, **coverage_stats, **coaching_stats, "bad_coverage_row_rejected": 1}


def check_coaching_ledger(source: str) -> dict[str,int]:
    from .play_content import build_plays, owner

    expected = {}
    for play in build_plays():
        for node in play.nodes:
            holder = owner(node.scene.actors,node.scene.ball)
            grades = "; ".join(f"{c.key}={c.rating}" for c in node.scene.choices)
            expected[node.scene.id] = ("loose" if holder is None else holder.key,grades)
    rows = re.findall(r"^\| (P\d{2}\.[ABC]\.[^ |]+) \| ([^|]+) \| ([^|]+) \|$",source,re.M)
    if len(rows) != len(expected) or {r[0] for r in rows} != set(expected):
        raise ValueError("Missing or duplicate coaching rows")
    for ident,holder,grades in rows:
        if (holder.strip(),grades.strip()) != expected[ident]:
            raise ValueError("Coaching grades or possession differ: "+ident)
    return {"coaching_nodes":len(rows),"coaching_choices":len(rows)*3}


def coaching_checks() -> dict[str,int]:
    source = (PACKAGE / "COACHING_REVIEW.md").read_text()
    stats = check_coaching_ledger(source)
    bad = source.replace("carry=2","carry=0",1)
    assert bad != source,"Coaching negative control not applied"
    try:
        check_coaching_ledger(bad)
    except ValueError as error:
        assert "Coaching grades" in str(error)
    else:
        raise RuntimeError("Coaching ledger false green")
    return {**stats,"bad_coaching_grade_rejected":1}


def check_book_ledger(source: str) -> dict[str, int]:
    from .book import lessons

    expected = {entry.page: entry for entry in lessons()}
    pattern = r"^\| (\d+) \| (\w+) \| ([^|]+) \| (\w+) \| ([^|]+) \| (\w+) \|$"
    rows = re.findall(pattern, source, re.M)
    if len(rows) != 57 or {int(row[0]) for row in rows} != set(expected):
        raise ValueError("Missing or duplicate coverage rows")
    for page, category, title, status, refs, _ in rows:
        entry = expected[int(page)]
        identifiers = ", ".join(entry.scene_ids) if entry.scene_ids else entry.card_id
        if (category, title.strip(), status, refs.strip()) != (entry.category, entry.title, entry.status, identifiers):
            raise ValueError("Coverage row differs: " + page)
    return {"indexed_entries": len(rows), "adapted_entries": sum(e.status != "DEFERRED" for e in expected.values()),
            "deferred_entries": sum(e.status == "DEFERRED" for e in expected.values()), "verified_chapter_bodies": 0}


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
        "include": [os.path.relpath(PACKAGE / n, ARTIFACTS) for n in CHECKED_MODULES],
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
    if (run.returncode or summary["errorCount"]
            or summary["warningCount"] or summary["filesAnalyzed"] != len(CHECKED_MODULES)):
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
        with tempfile.TemporaryDirectory(prefix="soccer-smart-mutant-") as folder:
            root = Path(folder)
            shutil.copytree(PACKAGE, root / "soccer_strategy" / "soccer_smart",
                            ignore=shutil.ignore_patterns("__pycache__", ".verification"))
            shutil.copytree(ROOT / "docs", root / "docs")
            path = root / "soccer_strategy" / "soccer_smart" / filename
            source = path.read_text()
            if source.count(original) != 1:
                raise RuntimeError(f"Mutant was not uniquely applicable: {name}")
            changed = source.replace(original, replacement)
            path.write_text(changed)
            if path.read_text() == source or replacement not in path.read_text():
                raise RuntimeError(f"Mutant was not applied: {name}")
            run = execute([
                sys.executable, "-m", "unittest",
                "soccer_strategy.soccer_smart.test_model",
                "soccer_strategy.soccer_smart.test_catalog",
                "soccer_strategy.soccer_smart.test_session",
                "soccer_strategy.soccer_smart.test_ui",
                "soccer_strategy.soccer_smart.test_book",
                "soccer_strategy.soccer_smart.test_book_ui",
                "soccer_strategy.soccer_smart.test_web",
                "soccer_strategy.soccer_smart.test_play",
                "soccer_strategy.soccer_smart.test_play_ui",
                "soccer_strategy.soccer_smart.test_play_web",
                "soccer_strategy.soccer_smart.test_play_coaching",
                "-q",
            ], root)
            killed = run.returncode == 1 and "FAIL:" in run.stdout
            results.append({"name": name, "applied": True, "executed": True,
                            "killed": killed, "output": run.stdout})
            if not killed:
                raise RuntimeError(f"Mutant survived or failed without an assertion: {name}: {run.stdout}")
    (ARTIFACTS / "mutations.json").write_text(json.dumps(results, indent=2))
    return {"killed": len(results), "total": len(MUTANTS)}


def real_execution() -> dict[str, Any]:
    run = execute([sys.executable, "-m", "soccer_strategy.soccer_smart", "--smoke",
                   "--screenshot", str(ARTIFACTS / "feedback.png")])
    if run.returncode or "quit passed" not in run.stdout:
        raise RuntimeError(run.stdout)
    john_smoke = execute([sys.executable, "-m", "soccer_strategy.john", "--smoke"])
    if john_smoke.returncode or "quit passed" not in john_smoke.stdout:
        raise RuntimeError(john_smoke.stdout)
    node = shutil.which("node")
    if not node:
        raise RuntimeError("UNAVAILABLE: node required for web smoke check")
    script = (
        'const fs=require("fs"),d=JSON.parse(fs.readFileSync("docs/soccer_smart/data.json","utf8")),'
        'w=require("./docs/soccer_smart/app.js"),c={font:"16px sans-serif",measureText:(s)=>({width:s.length*7}),'
        'fillText(){},fillRect(){},strokeRect(){},beginPath(){},roundRect(){},rect(){},fill(){},stroke(){},'
        'arc(){},ellipse(){},moveTo(){},lineTo(){},closePath(){}},'
        'a=new w.SoccerSmartWebApp(d,{getContext:()=>c},{getItem:()=>null,setItem(){}});'
        'a.activate("stage:1");a.handleKeyDown(" ");a.handlePointerDown([850,440],"touch");'
        'a.handlePointerDown([850,440],"touch");a.handleKeyDown(" ");a.activate("book");a.draw();'
        'if(a.layoutErrors.length)process.exit(1);console.log("web smoke passed");'
    )
    web_smoke = execute([node, "-e", script])
    if web_smoke.returncode or "web smoke passed" not in web_smoke.stdout:
        raise RuntimeError(web_smoke.stdout)
    return {"exit_code": run.returncode, "screenshot": "feedback.png",
            "output": run.stdout.strip(), "john_smoke_exit": john_smoke.returncode,
            "web_smoke_exit": web_smoke.returncode}


def source_hash() -> str:
    digest = hashlib.sha256()
    for path in sorted(PACKAGE.rglob("*")):
        if (path.is_file() and ".verification" not in path.parts
                and "__pycache__" not in path.parts and path.name != "EVIDENCE.md"):
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
        ("tests_and_coverage", unit_and_coverage),
        ("lint_boundaries_complexity", static_checks),
        ("types", types),
        ("mutation", mutations),
        ("suite_health", suite_health),
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
