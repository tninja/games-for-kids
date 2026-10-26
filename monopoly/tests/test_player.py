import unittest
from core.player import Player


class TestPlayer(unittest.TestCase):
    
    def setUp(self):
        self.player = Player("Alice", "Car")
        
    def test_initial_state(self):
        self.assertEqual(self.player.name, "Alice")
        self.assertEqual(self.player.token, "Car")
        self.assertEqual(self.player.money, 1500)
        self.assertEqual(self.player.position, 0)
        self.assertEqual(self.player.in_jail, False)
        self.assertEqual(self.player.jail_turns, 0)
        self.assertEqual(self.player.get_out_of_jail_free, 0)
        
    def test_add_money(self):
        self.player.add_money(100)
        self.assertEqual(self.player.money, 1600)
        
    def test_deduct_money_success(self):
        result = self.player.deduct_money(500)
        self.assertTrue(result)
        self.assertEqual(self.player.money, 1000)
        
    def test_deduct_money_failure(self):
        result = self.player.deduct_money(2000)
        self.assertFalse(result)
        self.assertEqual(self.player.money, 1500)
        
    def test_move_to_position(self):
        self.player.move_to_position(15)
        self.assertEqual(self.player.position, 15)
        
    def test_move_forward(self):
        self.player.position = 35
        bonus = self.player.move_forward(10)
        self.assertEqual(self.player.position, 5)
        self.assertEqual(bonus, 200)
        
    def test_add_property(self):
        self.player.add_property("Park Place")
        self.assertIn("Park Place", self.player.properties)
        
    def test_remove_property(self):
        self.player.add_property("Park Place")
        self.player.remove_property("Park Place")
        self.assertNotIn("Park Place", self.player.properties)
        
    def test_can_afford(self):
        self.assertTrue(self.player.can_afford(1000))
        self.assertFalse(self.player.can_afford(2000))
        
    def test_is_bankrupt(self):
        self.player.money = -100
        self.assertTrue(self.player.is_bankrupt())
        self.player.money = 100
        self.assertFalse(self.player.is_bankrupt())


if __name__ == '__main__':
    unittest.main()