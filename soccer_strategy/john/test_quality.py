"""Known-bad controls prove custom sensors can actually reject violations."""

import sys
import tempfile
import unittest
from pathlib import Path

from soccer_strategy.john.quality import Coverage, boundaries, lint


class QualityTests(unittest.TestCase):
    def test_lint_negative_controls(self):
        self.assertTrue(lint("import os\n", "example.py"))
        self.assertTrue(lint("x = 1  \n", "example.py"))
        self.assertFalse(lint("x = 1\n", "example.py"))
        self.assertTrue(boundaries("import subprocess\n", "app.py"))
        self.assertTrue(boundaries("import pygame\n", "session.py"))
        self.assertFalse(boundaries("from dataclasses import replace\n", "model.py"))

    def test_coverage_rejects_unexecuted_branch_and_accepts_both(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "control.py"
            source = "def choose(flag):\n    if flag:\n        return 1\n    return 0\n"
            path.write_text(source)
            coverage = Coverage([path])
            namespace = {}
            previous = sys.gettrace()
            try:
                sys.settrace(coverage.trace)
                exec(compile(source, str(path), "exec"), namespace)
                namespace["choose"](True)
            finally:
                sys.settrace(previous)
            with self.assertRaises(ValueError):
                coverage.require_complete()
            try:
                sys.settrace(coverage.trace)
                namespace["choose"](False)
            finally:
                sys.settrace(previous)
            report = coverage.require_complete()["control.py"]
            self.assertEqual(report["covered_edges"], 2)


if __name__ == "__main__":
    unittest.main()
