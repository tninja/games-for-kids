import os
from typing import List, Dict, Optional, Tuple, Union
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ui.base_ui import BaseUI
from core.game import GameState
from core.player import Player
from core.property import Property, PropertyGroup


class TextUI(BaseUI):
    """Text-based user interface for Monopoly game."""
    
    def __init__(self):
        self.game = None
        
    def clear_screen(self):
        """Clear the console screen."""
        os.system('cls' if os.name == 'nt' else 'clear')
        
    def display_welcome(self):
        """Display welcome message."""
        self.clear_screen()
        print("=" * 60)
        print("          MONOPOLY - TEXT VERSION")
        print("=" * 60)
        print()
        
    def get_player_names(self) -> List[Union[str, Dict[str, str]]]:
        """Get player names and types from user input with automatic naming."""
        print("Welcome to Monopoly!")
        print("This game supports 2-4 players (mix of human and AI).")
        print("Press Enter to use default names.\n")
        
        while True:
            try:
                num_players = int(input("How many players (2-4)? "))
                if 2 <= num_players <= 4:
                    break
                else:
                    print("Please enter a number between 2 and 4.")
            except ValueError:
                print("Please enter a valid number.")
                
        players = []
        used_names = set()
        
        friendly_names = ["John", "Kang", "Peng", "Luke"]
        
        for i in range(num_players):
            print(f"\nPlayer {i+1}:")
            
            # Player type with Enter as default
            player_type = input("  Human (h) or AI (a)? [h/a/Enter=h]: ").strip().lower()
            if not player_type:
                player_type = 'h'
            
            if player_type in ['h', 'human']:
                # Human player name with auto-generation
                name = input("  Enter name [Enter={}]: ".format(friendly_names[i % len(friendly_names)])).strip()
                if not name:
                    name = friendly_names[i % len(friendly_names)]
                
                # Ensure unique name
                counter = 1
                unique_name = name
                while unique_name in used_names:
                    unique_name = f"{name} {counter}"
                    counter += 1
                
                players.append(unique_name)
                used_names.add(unique_name)
                
            elif player_type in ['a', 'ai']:
                # AI player name with auto-generation
                name = input("  Enter AI name [Enter={} AI]: ".format(friendly_names[i % len(friendly_names)])).strip()
                if not name:
                    name = f"{friendly_names[i % len(friendly_names)]} AI"
                
                # Ensure unique name
                counter = 1
                unique_name = name
                while unique_name in used_names:
                    unique_name = f"{name} {counter}"
                    counter += 1
                
                # AI difficulty with Enter as default
                difficulty = input("  Difficulty [easy/medium/hard/Enter=medium]: ").strip().lower()
                if not difficulty:
                    difficulty = 'medium'
                elif difficulty not in ['easy', 'medium', 'hard']:
                    difficulty = 'medium'
                
                players.append({"name": unique_name, "difficulty": difficulty})
                used_names.add(unique_name)
                
        return players
        
    def display_game_state(self):
        """Display the current game state."""
        if not self.game:
            return
            
        self.clear_screen()
        print("=" * 80)
        print("MONOPOLY GAME STATUS")
        print("=" * 80)
        
        # Current player
        current = self.game.get_current_player()
        print(f"Current Player: {current.name} ({current.token})")
        print(f"Money: ${current.money}")
        print(f"Position: {self.game.board.get_space_name(current.position)} ({current.position})")
        print(f"Properties: {len(current.properties)}")
        print()
        
        # All players summary
        print("PLAYER SUMMARY:")
        print("-" * 80)
        for player in self.game.players:
            space_name = self.game.board.get_space_name(player.position)
            print(f"{player.name:15} | ${player.money:5} | {space_name}")
        print()
        
    def display_player_details(self, player: Player):
        """Display detailed information about a player."""
        print(f"\n=== {player.name}'s Details ===")
        print(f"Money: ${player.money}")
        print(f"Position: {self.game.board.get_space_name(player.position)} ({player.position})")
        print(f"Properties ({len(player.properties)}):")
        
        if player.properties:
            for prop_name in sorted(player.properties):
                prop = self.game.board.properties.get(prop_name)
                if prop:
                    status = "(Mortgaged)" if prop.is_mortgaged else f"({prop.houses} houses)"
                    print(f"  - {prop_name} {status}")
        else:
            print("  None")
            
    def display_board_position(self, position: int):
        """Display information about a board position."""
        space_name = self.game.board.get_space_name(position)
        prop = self.game.board.get_property_at_position(position)
        
        print(f"\n=== {space_name} ===")
        
        if prop:
            print(f"Type: {prop.group.value}")
            print(f"Price: ${prop.price}")
            print(f"Mortgage Value: ${prop.mortgage_value}")
            
            if prop.group not in [PropertyGroup.RAILROAD, PropertyGroup.UTILITY]:
                print(f"House Cost: ${prop.house_cost}")
                print(f"Rent: {', '.join(f'${r}' for r in prop.rent)}")
                print(f"Current Houses: {prop.houses}")
                
            if prop.owner:
                print(f"Owner: {prop.owner}")
                if prop.is_mortgaged:
                    print("Status: Mortgaged")
                else:
                    rent = prop.get_rent(0, self.game.board.properties)
                    print(f"Current Rent: ${rent}")
            else:
                print("Status: Available for purchase")
        
    def get_player_action(self, prompt: str, valid_actions: List[str]) -> str:
        """Get player action with validation."""
        while True:
            action = input(prompt).strip().upper()
            if action in [a.upper() for a in valid_actions]:
                return action
            print(f"Invalid action. Please choose from: {', '.join(valid_actions)}")
            
    def display_turn_menu(self) -> str:
        """Display turn menu and get player choice."""
        print("\n=== YOUR TURN ===")
        print("1. Roll Dice")
        print("2. View Properties")
        print("3. Buy Houses")
        print("4. Sell Houses")
        print("5. Manage Properties (Mortgage/Unmortgage)")
        print("6. Trade")
        print("7. View Board")
        print("8. Save Game")
        print("9. View All Players Status")
        print("10. Quit Game")
        
        choice = input("\nChoose action (1-10) [Enter=1]: ").strip()
        return choice if choice else "1"
        
    def display_roll_result(self, player: Player, die1: int, die2: int, new_position: int):
        """Display dice roll result."""
        total_roll = die1 + die2
        print(f"\n{player.name} rolled {die1} + {die2} = {total_roll}.")
        if die1 == die2:
            print("Rolled doubles!")
        
        space_name = self.game.board.get_space_name(new_position)
        print(f"{player.name} moves {total_roll} spaces and lands on {space_name} (Position {new_position}).")
        
    def display_property_purchase_prompt(self, property_name: str, price: int) -> bool:
        """Display property purchase prompt."""
        print(f"\n=== PROPERTY FOR SALE ===")
        print(f"You landed on {property_name}, which is unowned.")
        print(f"Property: {property_name}")
        print(f"Price: ${price}")
        
        choice = input("Do you want to buy this property? (Y/n): ").strip().lower()
        return choice != 'n'
        
    def display_rent_payment(self, player: Player, owner: str, amount: int, property_name: str):
        """Display rent payment information."""
        print(f"\nRent due! {player.name} landed on {property_name}, which is owned by {owner}.")
        print(f"{player.name} pays ${amount} in rent to {owner}.")
        
    def display_insufficient_funds(self, player: Player, amount_needed: int):
        """Display insufficient funds message."""
        print(f"\n--- INSUFFICIENT FUNDS ---")
        print(f"{player.name}, you do not have enough money.")
        print(f"You have: ${player.money}")
        print(f"You need: ${amount_needed}")
        print(f"Shortfall: ${amount_needed - player.money}")
        print("You must raise funds by selling houses or mortgaging properties to avoid bankruptcy.")
        
    def display_bankruptcy(self, player: Player):
        """Display bankruptcy message."""
        print(f"\n!!! BANKRUPTCY !!!")
        print(f"*** {player.name} is bankrupt! ***")
        print(f"Unfortunately, {player.name} could not raise enough funds and is out of the game.")
        print(f"Their properties will be returned to the bank.")
        
    def display_winner(self, winner: str):
        """Display game winner."""
        print("\n" + "=" * 60)
        print(f"*** GAME OVER ***")
        print(f"All other players have gone bankrupt.")
        print(f"The last player standing is {winner}.")
        print(f"*** CONGRATULATIONS, {winner}! YOU WIN! ***")
        print("=" * 60)
        
    def display_all_players_status(self):
        """Display detailed status of all players."""
        if not self.game:
            return
            
        print(f"\n=== ALL PLAYERS STATUS ===")
        print("=" * 80)
        
        for i, player in enumerate(self.game.players, 1):
            print(f"\n{i}. {player.name} ({player.token})")
            print(f"   Money: ${player.money}")
            print(f"   Position: {self.game.board.get_space_name(player.position)} ({player.position})")
            print(f"   In Jail: {'Yes' if player.in_jail else 'No'}")
            print(f"   Get Out of Jail Free: {player.get_out_of_jail_free}")
            
            # Calculate net worth
            net_worth = player.money
            player_properties = []
            mortgaged_properties = []
            houses_total = 0
            
            for prop_name in player.properties:
                prop = self.game.board.properties.get(prop_name)
                if prop:
                    if prop.is_mortgaged:
                        mortgaged_properties.append(prop_name)
                        net_worth += prop.mortgage_value
                    else:
                        player_properties.append(prop_name)
                        net_worth += prop.price
                        
                    if prop.houses > 0:
                        houses_total += prop.houses
                        net_worth += (prop.houses * prop.house_cost) // 2
            
            print(f"   Properties Owned: {len(player.properties)}")
            if player_properties:
                print(f"     Unmortgaged: {', '.join(player_properties)}")
            if mortgaged_properties:
                print(f"     Mortgaged: {', '.join(mortgaged_properties)}")
            if houses_total > 0:
                print(f"     Houses: {houses_total}")
            
            print(f"   Net Worth: ${net_worth}")
            print("-" * 50)
        
    def display_jail_options(self, player: Player) -> str:
        """Display jail options for player."""
        print(f"\n--- IN JAIL ---")
        print(f"{player.name}, you are in jail.")
        print(f"This is your turn #{player.jail_turns + 1} in jail.")
        print(f"You have {player.get_out_of_jail_free} 'Get Out of Jail Free' card(s).")
        print("\nHow would you like to proceed?")
        print("1. Try to roll doubles.")
        if player.get_out_of_jail_free > 0:
            print("2. Use a 'Get Out of Jail Free' card.")
        print("3. Pay a $50 fine to get out.")
        
        choice = input("Choose option (1-3): ").strip()
        return choice
        
    def display_house_building_menu(self, player: Player) -> Tuple[str, int]:
        """Display house building menu."""
        print(f"\n=== BUILD HOUSES ===")
        print(f"{player.name}'s Money: ${player.money}")
        print()
        
        # Get properties that can have houses built
        buildable = []
        for prop_name in player.properties:
            prop = self.game.board.properties.get(prop_name)
            if prop and prop.can_build_house(self.game.board.properties):
                buildable.append((prop_name, prop.house_cost, prop.houses))
                
        if not buildable:
            print("No properties available for house building.")
            return None, 0
            
        print("Properties available for house building:")
        for i, (name, cost, houses) in enumerate(buildable, 1):
            print(f"{i}. {name} - House cost: ${cost} - Current houses: {houses}")
            
        try:
            choice = int(input("\nChoose property (0 to cancel): "))
            if choice == 0:
                return None, 0
            if 1 <= choice <= len(buildable):
                prop_name, cost, _ = buildable[choice - 1]
                return prop_name, cost
        except ValueError:
            pass
            
        return None, 0
        
    def display_property_selling_menu(self, player: Player) -> Tuple[str, int]:
        """Display property selling menu."""
        print(f"\n=== SELL/MORTGAGE PROPERTIES ===")
        print(f"{player.name}'s Money: ${player.money}")
        print()
        
        if not player.properties:
            print("You don't own any properties.")
            return None, 0
            
        print("Your properties:")
        properties = []
        for i, prop_name in enumerate(sorted(player.properties), 1):
            prop = self.game.board.properties.get(prop_name)
            if prop:
                if prop.houses > 0:
                    sell_value = (prop.house_cost * prop.houses) // 2
                    print(f"{i}. {prop_name} - Sell houses: ${sell_value} ({prop.houses} houses)")
                    properties.append((prop_name, "house", sell_value))
                elif not prop.is_mortgaged:
                    mortgage_value = prop.mortgage_value
                    print(f"{i}. {prop_name} - Mortgage: ${mortgage_value}")
                    properties.append((prop_name, "mortgage", mortgage_value))
                else:
                    unmortgage_cost = int(prop.mortgage_value * 1.1)
                    print(f"{i}. {prop_name} - Unmortgage: ${unmortgage_cost}")
                    properties.append((prop_name, "unmortgage", unmortgage_cost))
                    
        try:
            choice = int(input("\nChoose property (0 to cancel): "))
            if choice == 0:
                return None, 0
            if 1 <= choice <= len(properties):
                prop_name, action, value = properties[choice - 1]
                return prop_name, value
        except ValueError:
            pass
            
        return None, 0
        
    def pause_for_continue(self):
        """Pause for user to continue."""
        input("\nPress Enter to continue...")
        
    def display_error(self, message: str):
        """Display error message."""
        print(f"\n[ERROR] {message}")
        self.pause_for_continue()
        
    def display_success(self, message: str):
        """Display success message."""
        print(f"\nSUCCESS: {message}")