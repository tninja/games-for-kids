import unittest
from ai.ai_player import AIPlayer
from core.game import GameState
from core.property import PropertyGroup


class TestAIPlayer(unittest.TestCase):
    
    def setUp(self):
        self.ai_player = AIPlayer("AI_Test", "Car", "medium")
        self.game = GameState([{"name": "AI_Test", "difficulty": "medium"}, "Human"])
        
    def test_ai_initialization(self):
        self.assertEqual(self.ai_player.name, "AI_Test")
        self.assertEqual(self.ai_player.token, "Car")
        self.assertEqual(self.ai_player.difficulty, "medium")
        self.assertEqual(self.ai_player.aggression_level, 0.6)
        self.assertEqual(self.ai_player.risk_tolerance, 0.5)
        
    def test_property_buying_decision(self):
        # Test buying Mediterranean Avenue (cheap property)
        mediterranean = self.game.board.properties["Mediterranean Avenue"]
        decision = self.ai_player.decide_buy_property(
            "Mediterranean Avenue", mediterranean.price, self.game
        )
        self.assertIsInstance(decision, bool)
        
    def test_jail_decision(self):
        self.ai_player.money = 2000
        decision = self.ai_player.decide_jail_action(self.game)
        self.assertIn(decision, ["use_card", "pay", "roll"])
        
    def test_house_building_decision(self):
        # Buy brown properties to test house building
        self.game.buy_property(self.ai_player, "Mediterranean Avenue")
        self.game.buy_property(self.ai_player, "Baltic Avenue")
        
        decision = self.ai_player.decide_build_house(self.game)
        # Should be None or a property name
        self.assertTrue(decision is None or isinstance(decision, str))
        
    def test_mortgage_decision(self):
        # Buy a property first
        self.game.buy_property(self.ai_player, "Mediterranean Avenue")
        
        decision = self.ai_player.decide_mortgage_property(100, self.game)
        self.assertTrue(decision is None or decision == "Mediterranean Avenue")
        
    def test_difficulty_levels(self):
        easy_ai = AIPlayer("Easy", "Car", "easy")
        hard_ai = AIPlayer("Hard", "Car", "hard")
        
        self.assertLess(easy_ai.aggression_level, hard_ai.aggression_level)
        self.assertGreater(easy_ai.risk_tolerance, hard_ai.risk_tolerance)


if __name__ == '__main__':
    unittest.main()