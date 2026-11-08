"""Curriculum sections, topic membership, and honest book-theme provenance."""

import unittest

from soccer_strategy.soccer_smart.curriculum import (
    CARDS_STAGE,
    GROUPS,
    GROUP_IDS,
    MIXED_STAGE,
    PLAYABLE_STAGES,
    SECTIONS,
    SECTION_IDS,
    group_for_id,
    section_for_topic,
)


class CurriculumTests(unittest.TestCase):
    def test_four_tactical_sections_partition_twelve_topics(self) -> None:
        self.assertEqual(SECTION_IDS, (1, 2, 3, 4))
        self.assertEqual(PLAYABLE_STAGES, (1, 2, 3, 4, 5))
        self.assertEqual(MIXED_STAGE, 5)
        self.assertEqual(CARDS_STAGE, 6)
        topics = [topic for section in SECTIONS for topic in section.topics]
        self.assertEqual(topics, list(range(1, 13)))
        self.assertEqual([len(section.topics) for section in SECTIONS], [3, 3, 3, 3])
        self.assertEqual(section_for_topic(1), 1)
        self.assertEqual(section_for_topic(5), 2)
        self.assertEqual(section_for_topic(9), 3)
        self.assertEqual(section_for_topic(12), 4)

    def test_unassigned_topic_raises_value_error(self) -> None:
        for bad in (0, 13, -1):
            with self.assertRaises(ValueError):
                section_for_topic(bad)

    def test_twenty_three_theme_groups_have_honest_provenance(self) -> None:
        self.assertEqual(len(GROUPS), 23)
        self.assertEqual(GROUP_IDS, tuple(f"G{i:02d}" for i in range(1, 24)))
        for group in GROUPS:
            self.assertEqual(group.review_status, "FULL_TEXT_PENDING")
            if group.id == "G23":
                self.assertEqual(group.evidence, "OVERVIEW_ONLY")
                self.assertEqual(group.locators, ())
            else:
                self.assertEqual(group.evidence, "INDEX_ONLY")
                self.assertTrue(len(group.locators) >= 1)
                self.assertTrue(all(1 <= page <= 174 for page in group.locators))
        self.assertEqual(group_for_id("G01").locators, (20, 22, 24))
        self.assertEqual(group_for_id("G23").evidence, "OVERVIEW_ONLY")
        with self.assertRaises(ValueError):
            group_for_id("G99")


if __name__ == "__main__":
    unittest.main()
