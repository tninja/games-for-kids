import random
from typing import List, Dict, Optional, Tuple, Union
from .board import Board
from .player import Player
from .property import Property, PropertyGroup
from .cards import CardDeck


class GameState:
    """Represents the current state of the game."""
    
    def __init__(self, players: List[Union[str, Dict[str, str]]]):
        self.board = Board()
        self.players = []
        self.chance_deck = CardDeck("Chance")
        self.community_chest_deck = CardDeck("Community Chest")
        
        tokens = ["Car", "Hat", "Shoe", "Battleship"]
        token_colors = [
            (255, 0, 0),    # Red
            (0, 0, 255),    # Blue
            (0, 255, 0),    # Green
            (255, 255, 0),  # Yellow
        ]
        friendly_names = ["John", "Kang", "Peng", "Luke"]
        
        for i, player_info in enumerate(players):
            color = token_colors[i % len(token_colors)]
            if isinstance(player_info, str):
                # Human player - use friendly names
                name = player_info if player_info and player_info.strip() else friendly_names[i % len(friendly_names)]
                self.players.append(Player(name, tokens[i], token_color=color))
            else:
                # AI player - use friendly names with AI prefix
                ai_name = player_info.get("name", f"{friendly_names[i % len(friendly_names)]} (AI)")
                if not ai_name or not ai_name.strip():
                    ai_name = f"{friendly_names[i % len(friendly_names)]} (AI)"
                difficulty = player_info.get("difficulty", "medium")
                if difficulty not in ["easy", "medium", "hard"]:
                    difficulty = "medium"
                
                import sys
                import os
                sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                from ai.ai_player import AIPlayer
                self.players.append(AIPlayer(ai_name, tokens[i], difficulty, token_color=color))
                
        self.current_player_index = 0
        self.game_over = False
        self.winner = None
        self.doubles_count = 0
        self.last_dice_roll = (0, 0)
        
    def get_current_player(self) -> Player:
        """Get the current player."""
        return self.players[self.current_player_index]
        
    def next_player(self) -> None:
        """Move to the next player."""
        self.current_player_index = (self.current_player_index + 1) % len(self.players)
        self.doubles_count = 0
        
    def roll_dice(self) -> Tuple[int, int]:
        """Roll two dice."""
        die1 = random.randint(1, 6)
        die2 = random.randint(1, 6)
        self.last_dice_roll = (die1, die2)
        
        if die1 == die2:
            self.doubles_count += 1
        else:
            self.doubles_count = 0
            
        return die1, die2
        
    def move_player(self, player: Player, steps: int) -> int:
        """Move a player and return GO bonus if applicable."""
        return player.move_forward(steps)
        
    def handle_property_action(self, player: Player, property_name: str) -> str:
        """Handle actions when player lands on a property."""
        prop = self.board.properties.get(property_name)
        if not prop:
            return "No property to act on"
            
        if prop.owner is None:
            return "PROPERTY_AVAILABLE"
        elif prop.owner == player.name:
            return "OWNED_BY_PLAYER"
        elif prop.is_mortgaged:
            return "PROPERTY_MORTGAGED"
        else:
            return "PAY_RENT"
            
    def buy_property(self, player: Player, property_name: str) -> bool:
        """Buy a property for a player."""
        prop = self.board.properties.get(property_name)
        if not prop or prop.owner is not None:
            return False
            
        if player.can_afford(prop.price):
            if player.deduct_money(prop.price):
                prop.owner = player.name
                player.add_property(property_name)
                return True
        return False
        
    def pay_rent(self, player: Player, property_name: str, dice_roll: int = 0) -> Tuple[bool, int]:
        """Handle rent payment. Returns (success, amount_paid)."""
        prop = self.board.properties.get(property_name)
        if not prop or prop.owner is None or prop.is_mortgaged:
            return False, 0
            
        rent_amount = prop.get_rent(dice_roll, self.board.properties)
        if rent_amount <= 0:
            return False, 0
            
        if player.deduct_money(rent_amount):
            # Find owner and add money
            owner = next((p for p in self.players if p.name == prop.owner), None)
            if owner:
                owner.add_money(rent_amount)
            return True, rent_amount
        else:
            return False, rent_amount
            
    def build_house(self, player: Player, property_name: str) -> bool:
        """Build a house on a property."""
        prop = self.board.properties.get(property_name)
        if not prop or prop.owner != player.name:
            return False
            
        if prop.can_build_house(self.board.properties) and player.can_afford(prop.house_cost):
            if player.deduct_money(prop.house_cost):
                prop.houses += 1
                return True
        return False
        
    def sell_house(self, player: Player, property_name: str) -> bool:
        """Sell a house from a property."""
        prop = self.board.properties.get(property_name)
        if not prop or prop.owner != player.name or prop.houses <= 0:
            return False
            
        # Check if selling maintains balance
        group_properties = [p for p in self.board.properties.values() 
                           if p.group == prop.group and p.owner == player.name]
        
        max_houses = max(p.houses for p in group_properties)
        if prop.houses == max_houses:
            prop.houses -= 1
            player.add_money(prop.house_cost // 2)
            return True
        return False
        
    def mortgage_property(self, player: Player, property_name: str) -> bool:
        """Mortgage a property."""
        prop = self.board.properties.get(property_name)
        if not prop or prop.owner != player.name or prop.houses > 0:
            return False
            
        mortgage_value = prop.mortgage()
        if mortgage_value > 0:
            player.add_money(mortgage_value)
            return True
        return False
        
    def unmortgage_property(self, player: Player, property_name: str) -> bool:
        """Unmortgage a property."""
        prop = self.board.properties.get(property_name)
        if not prop or prop.owner != player.name or not prop.is_mortgaged:
            return False
            
        unmortgage_cost = prop.unmortgage()
        if player.can_afford(unmortgage_cost):
            if player.deduct_money(unmortgage_cost):
                return True
            else:
                # Refund if payment fails
                prop.mortgage()
                return False
        return False
        
    def handle_special_spaces(self, player: Player, space_name: str) -> Tuple[str, int]:
        """Handle special spaces like Chance, Community Chest, Tax, etc."""
        if space_name == "GO":
            return "GO", 0
        elif space_name == "Income Tax":
            tax = min(200, player.money // 10)  # $200 or 10%
            player.deduct_money(tax)
            return "INCOME_TAX", tax
        elif space_name == "Luxury Tax":
            player.deduct_money(100)
            return "LUXURY_TAX", 100
        elif space_name == "Go To Jail":
            player.position = 10  # Jail position
            player.in_jail = True
            player.jail_turns = 0
            return "GO_TO_JAIL", 0
        elif space_name == "Jail":
            return "JUST_VISITING", 0
        elif space_name == "Community Chest":
            return "COMMUNITY_CHEST", 0
        elif space_name == "Chance":
            return "CHANCE", 0
        elif space_name == "Free Parking":
            return "FREE_PARKING", 0
        else:
            return "NORMAL", 0
            
    def draw_chance_card(self, player: Player) -> str:
        """Draw and execute a Chance card."""
        card = self.chance_deck.draw_card()
        return self.chance_deck.execute_card(card, player, self)
        
    def draw_community_chest_card(self, player: Player) -> str:
        """Draw and execute a Community Chest card."""
        card = self.community_chest_deck.draw_card()
        return self.community_chest_deck.execute_card(card, player, self)
            
    def check_bankruptcy(self, player: Player) -> bool:
        """Check if a player is bankrupt."""
        if player.money < 0:
            # Check if player can raise money by selling houses/mortgaging
            player_properties = self.board.get_all_properties_for_player(player.name)
            
            # Calculate total possible liquid assets
            total_value = player.money
            
            for prop in player_properties:
                if prop.houses > 0:
                    total_value += (prop.houses * prop.house_cost) // 2
                if not prop.is_mortgaged:
                    total_value += prop.mortgage_value
                    
            bankrupt = total_value < 0
            
            # More explicit bankruptcy check - if money is negative and no assets to liquidate
            if player.money < 0:
                # Check if any assets can be liquidated
                can_sell_anything = False
                for prop in player_properties:
                    if prop.houses > 0 or not prop.is_mortgaged:
                        can_sell_anything = True
                        break
                
                # If no assets to liquidate and negative money, definitely bankrupt
                if not can_sell_anything:
                    bankrupt = True
                    print(f"    ❌ {player.name} is bankrupt: ${player.money} with no assets to liquidate")
            
            # Debug output
            if bankrupt:
                print(f"    ❌ {player.name} is bankrupt: ${total_value} total after liquidation")
            
            return bankrupt
        return False
        
    def eliminate_player(self, player: Player) -> None:
        """Eliminate a bankrupt player from the game."""
        # Reset ownership of all properties
        player_properties = self.board.get_all_properties_for_player(player.name)
        for prop in player_properties:
            prop.owner = None
            prop.houses = 0
            prop.is_mortgaged = False
            
        # Remove player from game - safely handle case where player might not be in list
        if player in self.players:
            # Find the index of the player to remove
            player_index = self.players.index(player)
            self.players.remove(player)
            
            # Adjust current player index if necessary
            if player_index < self.current_player_index:
                self.current_player_index = max(0, self.current_player_index - 1)
            elif self.current_player_index >= len(self.players):
                self.current_player_index = 0
        
        # Check for game over
        if len(self.players) == 1:
            self.game_over = True
            self.winner = self.players[0].name
            
    def get_game_status(self) -> Dict:
        """Get current game status summary."""
        return {
            "current_player": self.get_current_player().name,
            "players_left": len(self.players),
            "game_over": self.game_over,
            "winner": self.winner,
            "player_statuses": [
                {
                    "name": p.name,
                    "money": p.money,
                    "position": p.position,
                    "properties": len(p.properties),
                    "net_worth": p.get_net_worth(self.board.get_property_values())
                }
                for p in self.players
            ]
        }