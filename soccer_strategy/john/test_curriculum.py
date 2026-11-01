"""Section membership and coverage of the complete training catalog."""

import unittest
from dataclasses import asdict
from hashlib import sha256
import json
from pathlib import Path

from soccer_strategy.john.catalog import build_catalog
from soccer_strategy.john.curriculum import SECTIONS, SECTION_IDS, section_for_topic


class CurriculumTests(unittest.TestCase):
    def test_original_102_pictures_are_unchanged(self):
        records = []
        for scene in build_catalog():
            if scene.topic <= 34:
                record = asdict(scene)
                record.pop("stage")
                records.append(record)
        self.assertEqual(len(records), 102)
        encoded = json.dumps(records, sort_keys=True, separators=(",", ":")).encode()
        self.assertEqual(sha256(encoded).hexdigest(),
                         "d90a4ad034f1237645d3c003e97756a83f6d0b8cbfa9448b89008cb753dd6113")

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
        self.assertEqual(sorted(topics), list(range(1, 39)))
        self.assertEqual(len(topics), len(set(topics)))
        self.assertEqual(SECTION_IDS, (1, 2, 3, 4, 5, 6, 7))
        for section in SECTIONS:
            self.assertGreaterEqual(3 * len(section.topics), 8)

    def test_catalog_uses_the_canonical_membership(self):
        catalog = build_catalog()
        for section in SECTIONS:
            self.assertEqual({s.topic for s in catalog if s.stage == section.id},
                             set(section.topics))
        self.assertEqual(section_for_topic(25), 5)
        self.assertEqual(section_for_topic(28), 1)
        self.assertEqual(section_for_topic(29), 5)
        self.assertEqual(section_for_topic(24), 6)
        self.assertEqual(section_for_topic(30), 3)

    def test_direct_shooting_threats_share_a_named_section(self):
        shooting = next(section for section in SECTIONS if section.title == "Defend shooting")
        self.assertEqual(set(shooting.topics), {4, 31, 32, 33, 34})
        for topic in shooting.topics:
            self.assertEqual(section_for_topic(topic), shooting.id)
        self.assertTrue(all(section_for_topic(topic) == 4 for topic in (15, 16, 17)))
        self.assertEqual(section_for_topic(11), 3)
        self.assertEqual(section_for_topic(12), 4)
        self.assertEqual(section_for_topic(18), 5)

    def test_unassigned_topics_are_rejected(self):
        for topic in (0, 39):
            with self.assertRaises(ValueError):
                section_for_topic(topic)

    def test_receiving_has_its_own_section_without_changing_existing_sections(self):
        section = next(s for s in SECTIONS if s.title == "Receive and decide")
        self.assertEqual(section.id, 7)
        self.assertEqual(section.topics, (35, 36, 37, 38))
        self.assertEqual(SECTIONS[4].topics, (18, 19, 20, 21, 25, 26, 27, 29))
        self.assertTrue(all(section_for_topic(topic) == 7 for topic in section.topics))


if __name__ == "__main__":
    unittest.main()
