"""Section membership and coverage of the complete training catalog."""

import unittest
from dataclasses import asdict
from hashlib import sha256
import json
from pathlib import Path

from soccer_strategy.catalog import build_catalog
from soccer_strategy.curriculum import SECTIONS, SECTION_IDS, section_for_topic


class CurriculumTests(unittest.TestCase):
    def test_reviewed_content_matches_persisted_baseline(self):
        records = []
        for scene in build_catalog():
            record = asdict(scene)
            record.pop("stage")
            records.append(record)
        encoded = json.dumps(records, sort_keys=True, separators=(",", ":")).encode()
        baseline = Path(__file__).with_name("case_content.sha256").read_text().strip()
        self.assertEqual(sha256(encoded).hexdigest(), baseline)

    def test_all_topics_belong_to_exactly_one_section(self):
        topics = [topic for section in SECTIONS for topic in section.topics]
        self.assertEqual(sorted(topics), list(range(1, 30)))
        self.assertEqual(len(topics), len(set(topics)))
        self.assertEqual(SECTION_IDS, (1, 2, 3, 4, 5, 6))
        for section in SECTIONS:
            self.assertGreaterEqual(3 * len(section.topics), 8)

    def test_catalog_uses_the_canonical_membership(self):
        catalog = build_catalog()
        for section in SECTIONS:
            self.assertEqual({s.topic for s in catalog if s.stage == section.id},
                             set(section.topics))
        self.assertEqual(section_for_topic(25), 5)
        self.assertEqual(section_for_topic(28), 2)
        self.assertEqual(section_for_topic(29), 5)
        self.assertEqual(section_for_topic(24), 6)

    def test_unassigned_topics_are_rejected(self):
        for topic in (0, 30):
            with self.assertRaises(ValueError):
                section_for_topic(topic)


if __name__ == "__main__":
    unittest.main()
