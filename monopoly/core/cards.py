import random
from typing import Dict, Any, Optional
from .player import Player
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .game import GameState


class CardDeck:
    """Represents a deck of cards (Chance or Community Chest)."""
    
    def __init__(self, card_type: str):
        self.card_type = card_type
        self.cards = self._initialize_cards()
        self.discard_pile = []
        self.shuffle()
        
    def _initialize_cards(self) -> list:
        """Initialize the card deck with appropriate cards."""
        if self.card_type == "Chance":
            return self._get_chance_cards()
        elif self.card_type == "Community Chest":
            return self._get_community_chest_cards()
        return []
        
    def _get_chance_cards(self) -> list:
        """Return the list of Chance cards."""
        return [
            {
                "text": "Advance to GO (Collect $200)",
                "action": "move_to_go",
                "amount": 200
            },
            {
                "text": "Advance to Illinois Ave",
                "action": "move_to_position",
                "position": 24
            },
            {
                "text": "Advance to St. Charles Place",
                "action": "move_to_position",
                "position": 11
            },
            {
                "text": "Advance token to nearest utility",
                "action": "move_to_nearest_utility"
            },
            {
                "text": "Advance token to nearest railroad",
                "action": "move_to_nearest_railroad"
            },
            {
                "text": "Bank pays you dividend of $50",
                "action": "collect_money",
                "amount": 50
            },
            {
                "text": "Get out of jail free",
                "action": "get_out_of_jail_free"
            },
            {
                "text": "Go back 3 spaces",
                "action": "move_back",
                "spaces": 3
            },
            {
                "text": "Go to jail",
                "action": "go_to_jail"
            },
            {
                "text": "Make general repairs on your property",
                "action": "pay_repairs",
                "house_cost": 25,
                "hotel_cost": 100
            },
            {
                "text": "Pay poor tax of $15",
                "action": "pay_money",
                "amount": 15
            },
            {
                "text": "Take a trip to Reading Railroad",
                "action": "move_to_position",
                "position": 5
            },
            {
                "text": "Take a walk on the Boardwalk",
                "action": "move_to_position",
                "position": 39
            },
            {
                "text": "You have been elected chairman of the board",
                "action": "collect_money",
                "amount": 150
            },
            {
                "text": "Your building loan matures",
                "action": "collect_money",
                "amount": 150
            }
        ]
        
    def _get_community_chest_cards(self) -> list:
        """Return the list of Community Chest cards."""
        return [
            {
                "text": "Advance to GO (Collect $200)",
                "action": "move_to_go",
                "amount": 200
            },
            {
                "text": "Bank error in your favor",
                "action": "collect_money",
                "amount": 200
            },
            {
                "text": "Doctor's fees",
                "action": "pay_money",
                "amount": 50
            },
            {
                "text": "From sale of stock you get $50",
                "action": "collect_money",
                "amount": 50
            },
            {
                "text": "Get out of jail free",
                "action": "get_out_of_jail_free"
            },
            {
                "text": "Go to jail",
                "action": "go_to_jail"
            },
            {
                "text": "Grand opera opening",
                "action": "collect_money",
                "amount": 50
            },
            {
                "text": "Holiday fund matures",
                "action": "collect_money",
                "amount": 100
            },
            {
                "text": "Income tax refund",
                "action": "collect_money",
                "amount": 20
            },
            {
                "text": "It is your birthday",
                "action": "collect_money",
                "amount": 10
            },
            {
                "text": "Life insurance matures",
                "action": "collect_money",
                "amount": 100
            },
            {
                "text": "Pay hospital fees of $100",
                "action": "pay_money",
                "amount": 100
            },
            {
                "text": "Pay school fees of $150",
                "action": "pay_money",
                "amount": 150
            },
            {
                "text": "Receive $25 consultancy fee",
                "action": "collect_money",
                "amount": 25
            },
            {
                "text": "You have won a crossword competition",
                "action": "collect_money",
                "amount": 100
            }
        ]
        
    def shuffle(self):
        """Shuffle the deck."""
        self.cards.extend(self.discard_pile)
        self.discard_pile.clear()
        random.shuffle(self.cards)
        
    def draw_card(self) -> Dict[str, Any]:
        """Draw a card from the deck."""
        if not self.cards:
            self.shuffle()
            
        card = self.cards.pop(0)
        self.discard_pile.append(card)
        
        # Reshuffle if we're running low
        if len(self.cards) < 5:
            self.shuffle()
            
        return card
        
    def execute_card(self, card: Dict[str, Any], player: Player, game_state) -> str:
        """Execute the card action."""
        action = card["action"]
        
        if action == "move_to_go":
            go_bonus = player.move_forward(40 - player.position)  # Move to GO
            player.add_money(card.get("amount", 0))
            return f"Moved to GO and collected ${card.get('amount', 0)}"
            
        elif action == "move_to_position":
            old_position = player.position
            player.position = card["position"]
            
            # Check if passed GO
            if old_position > card["position"]:
                player.add_money(200)
                return f"Moved to position {card['position']} and passed GO"
            return f"Moved to position {card['position']}"
            
        elif action == "move_to_nearest_utility":
            utilities = [12, 28]  # Electric Company, Water Works
            nearest = min(utilities, key=lambda x: abs(x - player.position))
            player.position = nearest
            return f"Moved to nearest utility at position {nearest}"
            
        elif action == "move_to_nearest_railroad":
            railroads = [5, 15, 25, 35]  # Reading, Pennsylvania, B&O, Short Line
            nearest = min(railroads, key=lambda x: abs(x - player.position))
            player.position = nearest
            return f"Moved to nearest railroad at position {nearest}"
            
        elif action == "move_back":
            player.position = (player.position - card["spaces"]) % 40
            return f"Moved back {card['spaces']} spaces"
            
        elif action == "collect_money":
            player.add_money(card["amount"])
            return f"Collected ${card['amount']}"
            
        elif action == "pay_money":
            player.deduct_money(card["amount"])
            return f"Paid ${card['amount']}"
            
        elif action == "pay_repairs":
            # Count houses and hotels
            player_properties = [p for p in game_state.board.properties.values() 
                              if p.owner == player.name]
            houses = sum(p.houses for p in player_properties)
            hotels = sum(1 for p in player_properties if p.houses >= 5)
            
            total_cost = (houses * card["house_cost"] + 
                         hotels * card["hotel_cost"])
            player.deduct_money(total_cost)
            return f"Paid ${total_cost} for repairs"
            
        elif action == "get_out_of_jail_free":
            player.get_out_of_jail_free += 1
            return "Received get out of jail free card"
            
        elif action == "go_to_jail":
            player.position = 10
            player.in_jail = True
            player.jail_turns = 0
            return "Sent to jail"
            
        return "Card action completed"