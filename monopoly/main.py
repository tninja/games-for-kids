#!/usr/bin/env python3
"""
Monopoly Text-Based Game
Main entry point for the Monopoly game.
"""

import sys
import time
import os
import traceback
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import pygame
from ui.base_ui import BaseUI
from ui.text_ui import TextUI
from ui.pygame_ui import PygameUI
from core.game import GameState
from ai.ai_controller import AIController
from ai.ai_player import AIPlayer


class MonopolyGame:
    """Main game controller."""
    
    def __init__(self, ui: BaseUI):
        self.ui = ui
        self.game = None
        self.ai_controller = AIController()
        
    def setup_game(self):
        """Set up a new or loaded game."""
        from core.save_load import GameSaveManager
        
        if isinstance(self.ui, PygameUI):
            choice = self.ui.display_welcome()
            if choice == "load":
                saved_games = GameSaveManager.list_saved_games()
                filename = self.ui.display_load_game_menu(saved_games)
                if filename:
                    self.game = GameSaveManager.load_game(filename)
                    if self.game:
                        self.ui.game = self.game
                        self.ui.display_success(f"Loaded game: {filename}")
                        return
                    else:
                        self.ui.display_error("Failed to load game. Starting new game.")
            
            # Fallback to new game if load fails or is not chosen
            player_names = self.ui.get_player_names()
            self.game = GameState(player_names)
            self.ui.game = self.game

        else: # CLI setup
            self.ui.display_welcome()
            saved_games = GameSaveManager.list_saved_games()
            if saved_games:
                print(f"\nFound {len(saved_games)} saved game(s):")
                for i, game_file in enumerate(saved_games, 1):
                    print(f"  {i}. {game_file}")
                print("  0. Start new game")
                
                try:
                    choice = input("\nChoose option [Enter=0]: ").strip()
                    if choice and choice != "0":
                        game_index = int(choice) - 1
                        if 0 <= game_index < len(saved_games):
                            self.game = GameSaveManager.load_game(saved_games[game_index])
                            if self.game:
                                self.ui.game = self.game
                                print(f"Loaded game: {saved_games[game_index]}")
                                return
                            else:
                                print("Failed to load game, starting new one...")
                        else:
                            print("Invalid choice, starting new game...")
                except (ValueError, IndexError):
                    print("Invalid input, starting new game...")

            player_names = self.ui.get_player_names()
            self.game = GameState(player_names)
            self.ui.game = self.game
        
    def handle_turn(self):
        """Handle a single player's turn."""
        if not self.game or self.game.game_over:
            return False
            
        current_player = self.game.get_current_player()
        
        # Handle AI player
        if isinstance(current_player, AIPlayer):
            return self.handle_ai_turn(current_player)
            
        # Handle human player
        return self.handle_human_turn_logic()
        
    def handle_ai_turn(self, ai_player: AIPlayer) -> bool:
        """Handle AI player turn."""
        self.ui.display_game_state()
        print(f"\n{ai_player.name}'s turn (AI - {ai_player.difficulty})...")
        
        # Handle jail
        if ai_player.in_jail:
            jail_action = ai_player.decide_jail_action(self.game)
            if jail_action == "use_card" and ai_player.get_out_of_jail_free > 0:
                ai_player.get_out_of_jail_free -= 1
                ai_player.in_jail = False
                ai_player.jail_turns = 0
                print(f"{ai_player.name} used a get out of jail free card!")
            elif jail_action == "pay" and ai_player.can_afford(50):
                ai_player.deduct_money(50)
                ai_player.in_jail = False
                ai_player.jail_turns = 0
                print(f"{ai_player.name} paid $50 to get out of jail!")
            elif jail_action == "roll":
                pass
            else:
                # Roll dice for jail
                die1, die2 = self.game.roll_dice()
                if die1 == die2:
                    ai_player.in_jail = False
                    ai_player.jail_turns = 0
                    print(f"{ai_player.name} rolled doubles and is out of jail!")
                    steps = die1 + die2
                    self.move_player(ai_player, steps)
                    self.handle_ai_post_move(ai_player)
                    return True
                else:
                    ai_player.jail_turns += 1
                    if ai_player.jail_turns >= 3:
                        ai_player.in_jail = False
                        ai_player.jail_turns = 0
                        ai_player.deduct_money(50)
                        print(f"{ai_player.name} paid $50 and is out of jail!")
                        steps = die1 + die2
                        self.move_player(ai_player, steps)
                        self.handle_ai_post_move(ai_player)
                        return True
                    else:
                        print(f"{ai_player.name} failed to roll doubles. Still in jail.")
                        return True
        
        # Pre-move AI actions
        summary = self.ai_controller.handle_ai_turn(ai_player, self.game)
        
        # Roll dice and move
        die1, die2 = self.game.roll_dice()
        steps = die1 + die2
        
        print(f"{ai_player.name} rolled: {die1} + {die2} = {steps}")
        
        # Handle doubles for AI
        if die1 == die2 and self.game.doubles_count == 3:
            ai_player.position = 10
            ai_player.in_jail = True
            ai_player.jail_turns = 0
            print(f"{ai_player.name} rolled three doubles! Go to jail!")
            return True
            
        self.move_player(ai_player, steps)
        self.handle_ai_post_move(ai_player)
        
        # Pause briefly for AI actions
        time.sleep(1)
        
        return True
        
    def handle_human_turn_logic(self):
        """Handle human player turn logic."""
        current_player = self.game.get_current_player()
        
        # Handle jail
        if current_player.in_jail:
            if not self.handle_jail_turn(current_player):
                return True
                
        # Display game state
        self.ui.display_game_state()
        
        # Get player action
        while True:
            choice = self.ui.display_turn_menu()
            
            if choice == "1":
                return self.handle_dice_roll(current_player)
            elif choice == "2":
                self.ui.display_player_details(current_player)
                self.ui.pause_for_continue()
            elif choice == "3":
                self.handle_buy_houses(current_player)
            elif choice == "4":
                self.handle_sell_houses(current_player)
            elif choice == "5":
                self.handle_manage_properties(current_player)
            elif choice == "6":
                self.ui.display_error("Trading not implemented yet")
                self.ui.pause_for_continue()
            elif choice == "7":
                self.display_board(current_player.position)
            elif choice == "8":
                self.save_game()
            elif choice == "9":
                self.ui.display_all_players_status()
                self.ui.pause_for_continue()
            elif choice == "10":
                return False
            else:
                self.ui.display_error("Invalid choice")
                
        return True
        
    def _handle_property_actions(self, player):
        """Consolidated property action handling for both AI and human players."""
        current_pos = player.position
        prop = self.game.board.get_property_at_position(current_pos)
        
        if not prop:
            return
            
        # Handle property purchase
        if prop.owner is None:
            return self._handle_property_purchase(player, prop)
        elif prop.owner != player.name and not prop.is_mortgaged:
            return self._handle_rent_payment(player, prop)
    
    def _handle_property_purchase(self, player, prop):
        """Handle property purchase logic."""
        if isinstance(player, AIPlayer):
            if player.decide_buy_property(prop.name, prop.price, self.game) and player.can_afford(prop.price):
                if self.game.buy_property(player, prop.name):
                    print(f"{player.name} bought {prop.name} for ${prop.price}!")
                else:
                    print(f"{player.name} cannot afford {prop.name}")
            elif not player.can_afford(prop.price):
                print(f"{player.name} cannot afford {prop.name} (${prop.price})")
        else:
            # Human player - skip prompt if can't afford
            if player.can_afford(prop.price):
                if self.ui.display_property_purchase_prompt(prop.name, prop.price):
                    if self.game.buy_property(player, prop.name):
                        self.ui.display_success(f"{player.name} bought {prop.name} for ${prop.price}!")
                    else:
                        self.ui.display_error("Cannot afford this property!")
            else:
                print(f"{player.name} cannot afford {prop.name} (${prop.price})")
    
    def _handle_rent_payment(self, player, prop):
        """Handle rent payment logic."""
        rent = prop.get_rent(sum(self.game.last_dice_roll), self.game.board.properties)
        if rent <= 0:
            return
            
        success, paid = self.game.pay_rent(player, prop.name, sum(self.game.last_dice_roll))
        
        if success:
            if isinstance(player, AIPlayer):
                print(f"{player.name} paid ${rent} rent to {prop.owner}")
            else:
                self.ui.display_rent_payment(player, prop.owner, paid, prop.name)
        else:
            if isinstance(player, AIPlayer):
                print(f"{player.name} cannot afford ${rent} rent!")
                self.handle_ai_bankruptcy(player, rent)
            else:
                self.ui.display_insufficient_funds(player, rent)
                if self.handle_bankruptcy(player, rent):
                    return True
    
    def handle_ai_post_move(self, ai_player: AIPlayer):
        """Handle AI actions after moving."""
        # Post-move AI actions (property actions are handled in move_player)
        summary = self.ai_controller.handle_post_move_actions(ai_player, self.game)
        
        # Display AI actions
        if summary["houses_built"]:
            print(f"{ai_player.name} built houses on: {', '.join(summary['houses_built'])}")
        if summary["properties_mortgaged"]:
            print(f"{ai_player.name} mortgaged: {', '.join(summary['properties_mortgaged'])}")
        if summary["properties_unmortgaged"]:
            print(f"{ai_player.name} unmortgaged: {', '.join(summary['properties_unmortgaged'])}")
    
    def _show_player_assets(self, player):
        """Display player's assets for bankruptcy context."""
        print(f"  💰 Current money: ${player.money}")
        
        # Show available assets
        total_net_worth = player.money
        mortgaged_props = []
        unmortgaged_props = []
        properties_with_houses = []
        
        for prop_name in player.properties:
            prop = self.game.board.properties[prop_name]
            if prop:
                if prop.is_mortgaged:
                    mortgaged_props.append(prop_name)
                else:
                    unmortgaged_props.append(prop_name)
                    total_net_worth += prop.mortgage_value
                
                if prop.houses > 0:
                    properties_with_houses.append(f"{prop_name}({prop.houses}h)")
                    total_net_worth += (prop.houses * prop.house_cost) // 2
        
        print(f"  🏠 Houses: {len(properties_with_houses)} - {', '.join(properties_with_houses) if properties_with_houses else 'None'}")
        print(f"  🏦 Unmortgaged: {len(unmortgaged_props)} - {', '.join(unmortgaged_props) if unmortgaged_props else 'None'}")
        print(f"  🔒 Mortgaged: {len(mortgaged_props)} - {', '.join(mortgaged_props) if mortgaged_props else 'None'}")
        print(f"  📊 Total net worth after liquidation: ${total_net_worth}")
        
        return total_net_worth
    
    def handle_ai_bankruptcy(self, ai_player: AIPlayer, amount_needed: int):
        """Handle AI bankruptcy management."""
        print(f"{ai_player.name} is in bankruptcy - needs ${amount_needed}!")
        self._show_player_assets(ai_player)
        
        summary = self.ai_controller.handle_bankruptcy_management(ai_player, amount_needed, self.game)
        
        if summary["houses_sold"]:
            print(f"  ✅ Sold houses on: {', '.join(summary['houses_sold'])}")
        if summary["properties_mortgaged"]:
            print(f"  ✅ Mortgaged: {', '.join(summary['properties_mortgaged'])}")
            
        # Check if bankruptcy was resolved
        if ai_player.money < amount_needed:
            print(f"  ❌ Still need ${abs(ai_player.money - amount_needed)} after asset liquidation")
            print(f"  💀 {ai_player.name} is BANKRUPT!")
            self.game.eliminate_player(ai_player)
            print(f"  {ai_player.name} has been eliminated from the game.")
            print(f"  Players remaining: {len(self.game.players)}")
            if self.game.winner:
                print(f"  🎉 Game over! {self.game.winner} wins!")
        else:
            print(f"  ✅ Successfully raised funds! Current money: ${ai_player.money}")
            
    def handle_jail_turn(self, player) -> bool:
        """Handle a turn when player is in jail."""
        self.ui.display_game_state()
        choice = self.ui.display_jail_options(player)
        
        if choice == "1":
            # Roll dice
            die1, die2 = self.game.roll_dice()
            if die1 == die2:
                player.in_jail = False
                player.jail_turns = 0
                self.ui.display_success(f"{player.name} rolled doubles and is out of jail!")
                self.ui.pause_for_continue()
                steps = die1 + die2
                self.move_player(player, steps)
                return True
            else:
                player.jail_turns += 1
                if player.jail_turns >= 3:
                    player.in_jail = False
                    player.jail_turns = 0
                    player.deduct_money(50)
                    self.ui.display_success(f"{player.name} paid $50 and is out of jail!")
                    self.ui.pause_for_continue()
                    steps = die1 + die2
                    self.move_player(player, steps)
                    return True
                else:
                    self.ui.display_error(f"{player.name} failed to roll doubles. Still in jail.")
                    self.ui.pause_for_continue()
                    return True
                    
        elif choice == "2" and player.get_out_of_jail_free > 0:
            player.get_out_of_jail_free -= 1
            player.in_jail = False
            player.jail_turns = 0
            self.ui.display_success(f"{player.name} used a get out of jail free card!")
            self.ui.pause_for_continue()
            return True
            
        elif choice == "3":
            if player.deduct_money(50):
                player.in_jail = False
                player.jail_turns = 0
                self.ui.display_success(f"{player.name} paid $50 and is out of jail!")
                self.ui.pause_for_continue()
                return True
            else:
                self.ui.display_error("Not enough money to pay $50!")
                return False
                
        return True
        
    def handle_dice_roll(self, player) -> bool:
        """Handle dice roll and movement."""
        die1, die2 = self.game.roll_dice()
        steps = die1 + die2
        
        # Handle doubles
        if die1 == die2 and self.game.doubles_count == 3:
            player.position = 10  # Go to jail
            player.in_jail = True
            player.jail_turns = 0
            self.ui.display_success(f"{player.name} rolled three doubles! Go to jail!")
            return False
            
        # Move player
        go_bonus = self.move_player(player, steps)
        if go_bonus > 0:
            player.add_money(go_bonus)
            self.ui.display_success(f"{player.name} passed GO and collected ${go_bonus}!")
            
        return True
        
    def move_player(self, player, steps):
        """Move player and handle landing on spaces."""
        old_pos = player.position
        go_bonus = self.game.move_player(player, steps)
        new_pos = player.position
        
        self.ui.display_roll_result(player, *self.game.last_dice_roll, new_pos)
        
        # Handle special spaces
        space_name = self.game.board.get_space_name(new_pos)
        action_type, amount = self.game.handle_special_spaces(player, space_name)
        
        if action_type == "INCOME_TAX":
            self.ui.display_success(f"{player.name} paid ${amount} income tax!")
        elif action_type == "LUXURY_TAX":
            self.ui.display_success(f"{player.name} paid ${amount} luxury tax!")
        elif action_type == "GO_TO_JAIL":
            self.ui.display_success(f"{player.name} was sent to jail!")
            return go_bonus
            
        # Handle special spaces and card drawing
        space_name = self.game.board.get_space_name(new_pos)
        action_type, amount = self.game.handle_special_spaces(player, space_name)
        
        if action_type == "CHANCE":
            result = self.game.draw_chance_card(player)
            print(f"{player.name} drew a Chance card: {result}")
            # After card action, check new position and handle property
            self.handle_post_card_property_action(player)
        elif action_type == "COMMUNITY_CHEST":
            result = self.game.draw_community_chest_card(player)
            print(f"{player.name} drew a Community Chest card: {result}")
            # After card action, check new position and handle property
            self.handle_post_card_property_action(player)
        elif action_type == "INCOME_TAX":
            self.ui.display_success(f"{player.name} paid ${amount} income tax!")
        elif action_type == "LUXURY_TAX":
            self.ui.display_success(f"{player.name} paid ${amount} luxury tax!")
        elif action_type == "GO_TO_JAIL":
            self.ui.display_success(f"{player.name} was sent to jail!")
            return go_bonus
            
# Handle property actions
        if action_type not in ["CHANCE", "COMMUNITY_CHEST", "GO_TO_JAIL"]:
            self._handle_property_actions(player)
                        
        if not isinstance(player, AIPlayer):
            self.ui.pause_for_continue()
        return go_bonus
        
    def handle_bankruptcy(self, player, amount_needed) -> bool:
        """Handle bankruptcy situation."""
        print(f"💸 {player.name} is in bankruptcy - needs ${amount_needed}!")
        
        # Track if any actions were taken
        actions_taken = False
        
        while player.money < amount_needed:
            self.ui.display_insufficient_funds(player, amount_needed)
            
            # Check if player has any liquidatable assets
            can_sell_anything = False
            for prop_name in player.properties:
                prop = self.game.board.properties.get(prop_name)
                if prop and (prop.houses > 0 or not prop.is_mortgaged):
                    can_sell_anything = True
                    break
            
            # If no more assets to liquidate, declare bankruptcy immediately
            if not can_sell_anything:
                print(f"💀 {player.name} has no assets to liquidate - BANKRUPT!")
                self.game.eliminate_player(player)
                self.ui.display_bankruptcy(player)
                print(f"{player.name} has been eliminated from the game.")
                print(f"Players remaining: {len(self.game.players)}")
                if self.game.winner:
                    print(f"🎉 Game over! {self.game.winner} wins!")
                return True
            
            # Show options to raise money
            choice = self.ui.display_turn_menu()
            
            if choice == "4":
                self.handle_sell_houses(player)
                actions_taken = True
            elif choice == "5":
                self.handle_mortgage_properties(player)
                actions_taken = True
            elif choice == "9":
                return True
            
            # Check bankruptcy status
            if player.money < 0 and not can_sell_anything:
                print(f"💀 {player.name} is BANKRUPT!")
                self.game.eliminate_player(player)
                self.ui.display_bankruptcy(player)
                print(f"{player.name} has been eliminated from the game.")
                print(f"Players remaining: {len(self.game.players)}")
                if self.game.winner:
                    print(f"🎉 Game over! {self.game.winner} wins!")
                return True
                
            # If no actions were taken and player still can't pay, declare bankruptcy
            if player.money < 0 and not actions_taken:
                print(f"💀 {player.name} is BANKRUPT!")
                self.game.eliminate_player(player)
                self.ui.display_bankruptcy(player)
                print(f"{player.name} has been eliminated from the game.")
                print(f"Players remaining: {len(self.game.players)}")
                if self.game.winner:
                    print(f"🎉 Game over! {self.game.winner} wins!")
                return True
                
        return False
        
    def handle_buy_houses(self, player):
        """Handle house buying."""
        while True:
            prop_name, cost = self.ui.display_house_building_menu(player)
            if not prop_name:
                break
                
            if self.game.build_house(player, prop_name):
                self.ui.display_success(f"Built house on {prop_name} for ${cost}!")
            else:
                self.ui.display_error("Cannot build house on this property!")
                
            if input("Build another house? (y/n): ").lower() != 'y':
                break
                
    def handle_sell_houses(self, player):
        """Handle selling houses/mortgaging properties."""
        while True:
            prop_name, value = self.ui.display_property_selling_menu(player)
            if not prop_name:
                break
                
            prop = self.game.board.properties.get(prop_name)
            if prop and prop.houses > 0:
                if self.game.sell_house(player, prop_name):
                    self.ui.display_success(f"Sold house on {prop_name} for ${value}!")
            elif prop and not prop.is_mortgaged:
                if self.game.mortgage_property(player, prop_name):
                    self.ui.display_success(f"Mortgaged {prop.name} for ${value}!")
            elif prop and prop.is_mortgaged:
                if player.can_afford(value):
                    if self.game.unmortgage_property(player, prop_name):
                        self.ui.display_success(f"Unmortgaged {prop.name} for ${value}!")
                else:
                    self.ui.display_error(f"Cannot afford ${value} to unmortgage!")
                    
            if input("Perform another action? (y/n): ").lower() != 'y':
                break
                
    def handle_manage_properties(self, player):
        """Handle property management organized by groups with house-building info."""
        from core.property import PropertyGroup
        
        while True:
            print(f"\n=== MANAGE PROPERTIES ===")
            print(f"{player.name}'s Money: ${player.money}")
            print()
            
            if not player.properties:
                print("You don't own any properties.")
                input("Press Enter to continue...")
                return
            
            # Group properties by their groups
            groups = {}
            for prop_name in player.properties:
                prop = self.game.board.properties.get(prop_name)
                if prop:
                    group_name = prop.group.value
                    if group_name not in groups:
                        groups[group_name] = []
                    groups[group_name].append(prop)
            
            if not groups:
                print("No properties to manage.")
                input("Press Enter to continue...")
                return
            
            # Display properties by group with house-building info
            all_properties = []
            print("Your Properties by Group:")
            print("=" * 80)
            
            for group_name, props in sorted(groups.items()):
                print(f"\n{group_name}:")
                
                # Check if this group has monopoly
                group_props = [p for p in self.game.board.properties.values() 
                              if p.group.value == group_name]
                owned_in_group = [p for p in group_props if p.owner == player.name]
                has_monopoly = len(owned_in_group) == len(group_props)
                
                for prop in props:
                    all_properties.append(prop)
                    
                    # Build status info
                    status_parts = []
                    if prop.is_mortgaged:
                        status_parts.append("MORTGAGED")
                    else:
                        status_parts.append(f"{prop.houses} houses")
                    
                    # House building eligibility
                    can_build = False
                    build_info = ""
                    
                    if not prop.is_mortgaged and has_monopoly and prop.group not in [PropertyGroup.RAILROAD, PropertyGroup.UTILITY]:
                        if prop.houses < 5:  # Can build more houses
                            house_cost = prop.house_cost
                            if player.can_afford(house_cost):
                                can_build = True
                                build_info = f"Can build house (${house_cost})"
                            else:
                                build_info = f"Need ${house_cost} for house"
                        else:
                            build_info = "Max houses reached"
                    elif not prop.is_mortgaged and has_monopoly:
                        build_info = "Cannot build on railroads/utilities"
                    elif not prop.is_mortgaged:
                        build_info = "Need monopoly to build"
                    
                    # Mortgage/unmortgage info
                    if prop.is_mortgaged:
                        unmortgage_cost = int(prop.mortgage_value * 1.1)
                        mortgage_info = f"Unmortgage: ${unmortgage_cost}"
                    else:
                        if prop.houses > 0:
                            mortgage_info = "Cannot mortgage (has houses)"
                        else:
                            mortgage_info = f"Mortgage: ${prop.mortgage_value}"
                    
                    print(f"  {len(all_properties):2d}. {prop.name:20} | {', '.join(status_parts):12} | {mortgage_info}")
                    if build_info:
                        print(f"      {build_info}")
            
            print("\n0. Back to main menu")
            
            try:
                choice = input(f"\nChoose property to manage (0-{len(all_properties)}): ").strip()
                if not choice:
                    continue
                choice = int(choice)
                
                if choice == 0:
                    return
                elif 1 <= choice <= len(all_properties):
                    prop = all_properties[choice-1]
                    
                    print(f"\n=== {prop.name} ===")
                    print(f"Group: {prop.group.value}")
                    print(f"Current Houses: {prop.houses}")
                    print(f"Status: {'Mortgaged' if prop.is_mortgaged else 'Unmortgaged'}")
                    
                    if prop.is_mortgaged:
                        unmortgage_cost = int(prop.mortgage_value * 1.1)
                        print(f"Unmortgage Cost: ${unmortgage_cost}")
                        if player.can_afford(unmortgage_cost):
                            confirm = input("Unmortgage this property? (y/n): ").lower()
                            if confirm == 'y':
                                if self.game.unmortgage_property(player, prop.name):
                                    print(f"✅ Unmortgaged {prop.name} for ${unmortgage_cost}!")
                                else:
                                    print(f"❌ Failed to unmortgage {prop.name}")
                        else:
                            print(f"❌ Cannot afford ${unmortgage_cost} to unmortgage")
                    else:
                        if prop.houses > 0:
                            print("❌ Cannot mortgage - property has houses")
                        else:
                            print(f"Mortgage Value: ${prop.mortgage_value}")
                            confirm = input("Mortgage this property? (y/n): ").lower()
                            if confirm == 'y':
                                if self.game.mortgage_property(player, prop.name):
                                    print(f"✅ Mortgaged {prop.name} for ${prop.mortgage_value}!")
                                else:
                                    print(f"❌ Failed to mortgage {prop.name}")
                    
                    input("Press Enter to continue...")
                else:
                    print("Invalid choice")
                    
            except ValueError:
                print("Please enter a valid number")
        
    def handle_post_card_property_action(self, player):
        """Handle property purchase opportunity after card movement."""
        self._handle_property_actions(player)
    
    def display_board(self, current_position: int = None):
        """Display the game board."""
        self.ui.clear_screen()
        print("MONOPOLY BOARD")
        print("=" * 80)
        
        # Display first row (positions 0-9)
        print("\nTop Row:")
        for i in range(10):
            marker = " <- YOU" if i == current_position else ""
            space = self.game.board.get_space_name(i)
            print(f"{i:2d}: {space:20}{marker}")
            
        print("\nRight Side:")
        for i in range(10, 20):
            marker = " <- YOU" if i == current_position else ""
            space = self.game.board.get_space_name(i)
            print(f"{i:2d}: {space:20}{marker}")
            
        print("\nBottom Row:")
        for i in range(20, 30):
            marker = " <- YOU" if i == current_position else ""
            space = self.game.board.get_space_name(i)
            print(f"{i:2d}: {space:20}{marker}")
            
        print("\nLeft Side:")
        for i in range(30, 40):
            marker = " <- YOU" if i == current_position else ""
            space = self.game.board.get_space_name(i)
            print(f"{i:2d}: {space:20}{marker}")
            
        if current_position is not None:
            self.ui.display_board_position(current_position)
            
        self.ui.pause_for_continue()
    
    def save_game(self):
        """Save the current game state."""
        from core.save_load import GameSaveManager
        
        filename = input("Enter filename to save [game.monopoly]: ").strip()
        if not filename:
            filename = "game.monopoly"
        if not filename.endswith('.monopoly'):
            filename += '.monopoly'
        
        if GameSaveManager.save_game(self.game, filename):
            print(f"Game saved as: {filename}")
        else:
            print("Failed to save game.")
        
        self.ui.pause_for_continue()
        
    def play(self):
        """Main game loop, delegating to CLI or GUI."""
        self.setup_game()
        
        if isinstance(self.ui, PygameUI):
            self.play_gui()
        else:
            self.play_cli()

    def play_cli(self):
        """CLI-specific game loop."""
        while not self.game.game_over:
            if not self.handle_turn():
                break
                
            # Handle doubles (player gets another turn)
            if self.game.doubles_count > 0 and self.game.doubles_count < 3:
                continue
                
            # Check game over after each turn
            active_players = [p for p in self.game.players if not p.is_bankrupt()]
            if len(active_players) == 1:
                self.game.game_over = True
                self.game.winner = active_players[0].name
                break
                
            # Move to next player
            self.game.next_player()
            
            # Debug: Show current game state
            active_count = len([p for p in self.game.players if not p.is_bankrupt()])
            if active_count <= 2:
                print(f"\n🎮 Game State: {active_count} players remaining")
        
        if self.game.game_over and self.game.winner:
            self.ui.display_winner(self.game.winner)
            
        print("\nThanks for playing!")

    def play_gui(self):
        """GUI-specific game loop."""
        import pygame
        running = True
        while running and not self.game.game_over:
            
            if isinstance(self.game.get_current_player(), AIPlayer):
                self.handle_turn()
                self.game.next_player()
            else:
                self.ui.display_game_state()
                choice = self.ui.display_turn_menu()

                if choice == "1": # Roll Dice
                    self.handle_dice_roll(self.game.get_current_player())
                    self.game.next_player()
                elif choice == "5": # Manage Properties
                    self.handle_manage_properties(self.game.get_current_player())
                elif choice == "8": # Save Game
                    filename = self.ui.get_save_filename()
                    if filename:
                        self.save_game_from_gui(filename)
                elif choice == "10": # Quit
                    running = False

            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
            
            active_players = [p for p in self.game.players if not p.is_bankrupt()]
            if len(active_players) == 1:
                self.game.game_over = True
                self.game.winner = active_players[0].name
        
        if self.game.game_over and self.game.winner:
            self.ui.display_winner(self.game.winner)
            
        print("\nThanks for playing!")

    def save_game_from_gui(self, filename: str):
        """Helper to save the game from the GUI."""
        from core.save_load import GameSaveManager
        if not filename.endswith('.monopoly'):
            filename += '.monopoly'
        
        if GameSaveManager.save_game(self.game, filename):
            self.ui.display_success(f"Game saved as {filename}")
        else:
            self.ui.display_error("Failed to save game.")


def choose_ui() -> BaseUI:
    """Prompt user to choose a UI."""
    while True:
        choice = input("Choose interface: Command-Line (CLI) or Graphical (GUI)? [cli/gui]: ").strip().lower()
        if choice in ["cli", "c"]:
            return TextUI()
        elif choice in ["gui", "g"]:
            try:
                import pygame
                return PygameUI()
            except ImportError:
                print("Pygame not found. Please install it: pip install pygame")
                return TextUI()
        else:
            print("Invalid choice. Please enter 'cli' or 'gui'.")

def main():
    """Main entry point."""
    try:
        ui = choose_ui()
        game = MonopolyGame(ui)
        game.play()
    except KeyboardInterrupt:
        print("\n\nGame interrupted. Thanks for playing!")
        sys.exit(0)
    except Exception as e:
        print(f"\nAn error occurred: {e}")
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
