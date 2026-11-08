"""Optional growth choices never write to the tactical score ledger."""

import unittest

from soccer_strategy.soccer_smarter.notebook import Notebook
from soccer_strategy.soccer_smarter.session import Session


class NotebookTests(unittest.TestCase):
    def test_principle_requires_real_evidence_and_supports_revision(self):
        book = Notebook()
        book.start("X01", ("M02.A/root: I compared both routes",))
        self.assertEqual(book.activity, "X01")
        self.assertTrue(book.choose(0))
        self.assertTrue(book.choose(0))
        self.assertIn("M02.A/root", book.entries["X01"]["evidence"])
        self.assertTrue(book.choose(1))
        self.assertIsNone(book.step)
        self.assertTrue(book.back())
        book.choose(2)
        self.assertIn("pressure", book.entries["X01"]["revision"])

    def test_empty_evidence_skip_edit_and_invalid_choices(self):
        book = Notebook()
        self.assertFalse(book.back())
        self.assertFalse(book.skip())
        self.assertFalse(book.choose(0))
        with self.assertRaises(ValueError):
            book.start("invalid")
        book.start("X01")
        self.assertFalse(book.back())
        self.assertFalse(book.choose(-1))
        self.assertFalse(book.choose(8))
        book.skip()
        self.assertFalse(book.choose(0))
        book.skip()
        book.skip()
        self.assertFalse(book.skip())
        self.assertNotIn("evidence", book.entries["X01"])
        self.assertFalse(book.choose(0))

    def test_support_plan_retains_edits_and_does_not_change_scores(self):
        session = Session()
        session.skip()
        session.choose(0)
        before = dict(session.results)
        book = Notebook()
        book.start("X02")
        for index in (0, 3, 0, 1, 1):
            self.assertTrue(book.choose(index))
        self.assertEqual(book.entries["X02"]["helper"], "Ask later")
        self.assertIsNone(book.step)
        self.assertEqual(session.results, before)
        book.start("X02")
        book.choose(1)
        self.assertEqual(len(book.entries["X02"]), 5)
        self.assertNotEqual(book.entries["X02"]["goal"], "Notice the exit before turning")

    def test_pro_watch_and_try_it_covers_named_players_and_evidence(self):
        book = Notebook()
        book.start("X03", ("M07.A/root: Pass forward through the line to CM",))
        self.assertEqual(book.activity, "X03")
        options = " ".join(book.step.options)
        for name in ("Girma", "Bonmati", "Pulisic", "Mbappe"):
            self.assertIn(name, options)
        for index in (0, 0, 0, 2):
            self.assertTrue(book.choose(index))
        self.assertIsNone(book.step)
        self.assertIn("Girma", book.entries["X03"]["pro"])
        self.assertIn("M07.A/root", book.entries["X03"]["evidence"])
        self.assertIn("heading", book.entries["X03"]["try_it"])


if __name__ == "__main__":
    unittest.main()
