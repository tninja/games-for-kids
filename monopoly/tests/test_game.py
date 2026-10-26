import unittest
from core.game import GameState
from core.player import Player


class TestGameState(unittest.TestCase):
    
    def setUp(self):
        self.game = GameState(["Alice", "Bob", "Charlie"])
        
    def test_initial_state(self):
        self.assertEqual(len(self.game.players), 3)
        self.assertEqual(self.game.current_player_index, 0)
        self.assertFalse(self.game.game_over)
        self.assertIsNone(self.game.winner)
        
    def test_get_current_player(self):
        current = self.game.get_current_player()
        self.assertEqual(current.name, "Alice")
        
    def test_next_player(self):
        self.game.next_player()
        self.assertEqual(self.game.current_player_index, 1)
        
    def test_roll_dice(self):
        die1, die2 = self.game.roll_dice()
        self.assertTrue(1 <= die1 <= 6)
        self.assertTrue(1 <= die2 <= 6)
        
    def test_buy_property(self):
        player = self.game.get_current_player()
        initial_money = player.money
        
        success = self.game.buy_property(player, "Mediterranean Avenue")
        self.assertTrue(success)
        self.assertEqual(player.money, initial_money - 60)
        self.assertIn("Mediterranean Avenue", player.properties)
        
    def test_pay_rent(self):
        alice = self.game.players[0]
        bob = self.game.players[1]
        
        # Alice buys a property
        self.game.buy_property(alice, "Mediterranean Avenue")
        
        # Move Bob to Mediterranean Avenue
        bob.move_to_position(1)
        
        # Bob pays rent
        alice_initial = alice.money
        bob_initial = bob.money
        success, amount = self.game.pay_rent(bob, "Mediterranean Avenue")
        
        self.assertTrue(success)
        self.assertEqual(amount, 2)
        self.assertEqual(alice.money, alice_initial + 2)
        self.assertEqual(bob.money, bob_initial - 2)
        
    def test_build_house(self):
        player = self.game.get_current_player()
        
        # Buy all brown properties
        self.game.buy_property(player, "Mediterranean Avenue")
        self.game.buy_property(player, "Baltic Avenue")
        
        initial_money = player.money
        success = self.game.build_house(player, "Mediterranean Avenue")
        
        if success:
            prop = self.game.board.properties["Mediterranean Avenue"]
            self.assertEqual(prop.houses, 1)
            self.assertEqual(player.money, initial_money - 50)
        else:
            self.assertEqual(player.money, initial_money)
            
    def test_mortgage_property(self):
        player = self.game.get_current_player()
        
        # Buy a property
        self.game.buy_property(player, "Mediterranean Avenue")
        initial_money = player.money
        
        success = self.game.mortgage_property(player, "Mediterranean Avenue")
        self.assertTrue(success)
        
        prop = self.game.board.properties["Mediterranean Avenue"]
        self.assertTrue(prop.is_mortgaged)
        self.assertEqual(player.money, initial_money + 30)
        
    def test_eliminate_player(self):
        player = self.game.players[0]
        player.money = -1000  # Make bankrupt
        
        # Give player a property
        self.game.buy_property(player, "Mediterranean Avenue")
        
        initial_count = len(self.game.players)
        self.game.eliminate_player(player)
        
        self.assertEqual(len(self.game.players), initial_count - 1)
        prop = self.game.board.properties["Mediterranean Avenue"]
        self.assertIsNone(prop.owner)
        self.assertEqual(prop.houses, 0)
        self.assertFalse(prop.is_mortgaged)


if __name__ == '__main__':
    unittest.main()