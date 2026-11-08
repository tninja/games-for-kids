"""Known-bad negative controls prove custom quality sensors reject violations."""

import sys
import tempfile
import unittest
from pathlib import Path

from soccer_strategy.soccer_smart.quality import Coverage, boundaries, lint


class QualityTests(unittest.TestCase):
    def test_lint_and_boundaries_negative_controls(self) -> None:
        self.assertTrue(lint("import os\n", "example.py"))
        self.assertTrue(lint("x = 1  \n", "example.py"))
        self.assertFalse(lint("x = 1\n", "example.py"))
        self.assertTrue(boundaries("import subprocess\n", "app.py"))
        self.assertTrue(boundaries("import pygame\n", "session.py"))
        self.assertFalse(boundaries("from dataclasses import replace\n", "model.py"))

    def test_coverage_rejects_unexecuted_branch_and_accepts_both(self) -> None:
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "control.py"
            source = "def choose(flag):\n    if flag:\n        return 1\n    return 0\n"
            path.write_text(source)
            coverage = Coverage([path])
            namespace: dict[str, object] = {}
            previous = sys.gettrace()
            try:
                sys.settrace(coverage.trace)
                exec(compile(source, str(path), "exec"), namespace)
                func = namespace["choose"]
                assert callable(func)
                func(True)
            finally:
                sys.settrace(previous)
            with self.assertRaises(ValueError):
                coverage.require_complete()
            try:
                sys.settrace(coverage.trace)
                func = namespace["choose"]
                assert callable(func)
                func(False)
            finally:
                sys.settrace(previous)
            report = coverage.require_complete()["control.py"]
            self.assertEqual(report["covered_edges"], 2)


if __name__ == "__main__":
    unittest.main()
