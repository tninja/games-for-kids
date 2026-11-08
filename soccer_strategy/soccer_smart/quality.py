"""Fail-closed standard-library quality sensors used by the verification command."""

import ast
import dis
from pathlib import Path
from types import CodeType, FrameType
from typing import Any

RUNTIME = ("curriculum.py", "model.py", "content.py", "catalog.py", "session.py",
           "presentation.py", "drawing.py", "app.py", "main.py",
           "book.py", "book_cards.py", "book_tactics.py", "book_view.py")


def statement_lines(source: str) -> set[int]:
    tree = ast.parse(source)
    docstrings = {id(n.body[0]) for n in ast.walk(tree)
                  if isinstance(n, (ast.Module, ast.ClassDef, ast.FunctionDef))
                  and n.body and isinstance(n.body[0], ast.Expr)
                  and isinstance(n.body[0].value, ast.Constant)
                  and isinstance(n.body[0].value.value, str)}
    return {n.lineno for n in ast.walk(tree) if isinstance(n, ast.stmt)
            and id(n) not in docstrings
            and not (isinstance(n, ast.AnnAssign) and n.value is None)}


def branch_edges(code: CodeType) -> set[tuple[str, int, int]]:
    result: set[tuple[str, int, int]] = set()
    if code.co_name == "__annotate__":
        return result
    instructions = list(dis.get_instructions(code))

    def traced_target(offset: int) -> int:
        while True:
            position = next(i for i, op in enumerate(instructions) if op.offset == offset)
            if instructions[position].opname != "END_FOR":
                return offset
            offset = instructions[position + 1].offset

    for index, instruction in enumerate(instructions[:-1]):
        if (index >= 2 and instructions[index - 1].opname == "IS_OP"
                and instructions[index - 2].opname == "LOAD_COMMON_CONSTANT"):
            continue
        if ("JUMP_IF" in instruction.opname
                or instruction.opname.startswith("POP_JUMP")
                or instruction.opname == "FOR_ITER"):
            result.add((code.co_qualname, instruction.offset, traced_target(int(instruction.argval))))
            result.add((code.co_qualname, instruction.offset, traced_target(instructions[index + 1].offset)))
    for constant in code.co_consts:
        if isinstance(constant, CodeType):
            result.update(branch_edges(constant))
    return result


class Coverage:
    def __init__(self, paths: list[Path]):
        if not paths or any(not p.is_file() for p in paths):
            raise ValueError("Coverage needs readable source files")
        self.paths = {str(p.resolve()): p for p in paths}
        self.lines: dict[str, set[int]] = {name: set() for name in self.paths}
        self.edges: dict[str, set[tuple[str, int, int]]] = {name: set() for name in self.paths}
        self.previous: dict[int, int] = {}

    def trace(self, frame: FrameType, event: str, arg: Any) -> Any:
        name = frame.f_code.co_filename
        if name not in self.paths or frame.f_code.co_name == "__annotate__":
            return None
        frame.f_trace_opcodes = True
        if event == "line":
            self.lines[name].add(frame.f_lineno)
        elif event == "opcode":
            prior = self.previous.get(id(frame))
            if prior is not None:
                self.edges[name].add((frame.f_code.co_qualname, prior, frame.f_lasti))
            self.previous[id(frame)] = frame.f_lasti
        elif event == "return":
            self.previous.pop(id(frame), None)
        return self.trace

    def report(self) -> dict[str, dict[str, Any]]:
        result = {}
        for name, path in self.paths.items():
            source = path.read_text()
            lines = statement_lines(source)
            edges = branch_edges(compile(source, name, "exec"))
            missing_edges = sorted(edges - self.edges[name])
            result[path.name] = {
                "statements": len(lines), "covered": len(lines & self.lines[name]),
                "missing_lines": sorted(lines - self.lines[name]),
                "branch_edges": len(edges), "covered_edges": len(edges & self.edges[name]),
                "missing_edges": missing_edges,
            }
        return result

    def require_complete(self) -> dict[str, dict[str, Any]]:
        report = self.report()
        if any(r["missing_lines"] or r["missing_edges"] for r in report.values()):
            raise ValueError(f"Uncovered behavior: {report}")
        return report


def lint(source: str, filename: str) -> list[str]:
    tree = ast.parse(source, filename)
    failures = []
    if not source.isascii():
        failures.append("Source must be English ASCII")
    for number, line in enumerate(source.splitlines(), 1):
        if line.rstrip() != line or "\t" in line:
            failures.append(f"Whitespace drift at line {number}")
    used = {n.id for n in ast.walk(tree) if isinstance(n, ast.Name)}
    for node in ast.walk(tree):
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            for alias in node.names:
                name = alias.asname or alias.name.split(".")[0]
                if name not in used:
                    failures.append(f"Unused import: {name}")
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            if (node.end_lineno or node.lineno) - node.lineno > 60:
                failures.append(f"Function exceeds 60 lines: {node.name}")
            decisions = sum(isinstance(n, (ast.If, ast.For, ast.While, ast.IfExp,
                                          ast.ExceptHandler, ast.comprehension))
                            for n in ast.walk(node))
            if decisions > 15:
                failures.append(f"Function exceeds 15 decisions: {node.name}")
    return failures


def boundaries(source: str, filename: str) -> list[str]:
    tree = ast.parse(source, filename)
    forbidden = {"requests", "httpx", "socket", "subprocess", "urllib", "pickle"}
    if filename in ("curriculum.py", "model.py", "content.py", "catalog.py", "session.py", "presentation.py",
                    "book.py", "book_cards.py", "book_tactics.py"):
        forbidden.add("pygame")
    imports = {a.name.split(".")[0] for n in ast.walk(tree)
               if isinstance(n, (ast.Import, ast.ImportFrom)) for a in n.names}
    imports.update(n.module.split(".")[0] for n in ast.walk(tree)
                   if isinstance(n, ast.ImportFrom) and n.module)
    return sorted(forbidden & imports)
