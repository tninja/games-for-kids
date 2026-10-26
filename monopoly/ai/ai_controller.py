from typing import Optional, Dict, Any
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai.ai_player import AIPlayer
from core.game import GameState


class AIController:
    """Controller to manage AI player turns."""
    
    def __init__(self):
        pass
        
    def handle_ai_turn(self, ai_player: AIPlayer, game_state: GameState) -> Dict[str, Any]:
        """Handle a complete AI turn and return action summary."""
        summary = {
            "player": ai_player.name,
            "actions": [],
            "dice_rolled": None,
            "moved_to": None,
            "property_bought": None,
            "rent_paid": None,
            "houses_built": [],
            "properties_mortgaged": [],
            "properties_unmortgaged": []
        }
        
        # Handle jail if needed
        if ai_player.in_jail:
            jail_action = ai_player.decide_jail_action(game_state)
            summary["actions"].append(f"Jail decision: {jail_action}")
            
            if jail_action == "use_card" and ai_player.get_out_of_jail_free > 0:
                ai_player.get_out_of_jail_free -= 1
                ai_player.in_jail = False
                ai_player.jail_turns = 0
            elif jail_action == "pay" and ai_player.can_afford(50):
                ai_player.deduct_money(50)
                ai_player.in_jail = False
                ai_player.jail_turns = 0
            elif jail_action == "roll":
                # Let the game handle dice rolling
                pass
                
        # Always try to unmortgage properties if possible
        self._handle_unmortgage_properties(ai_player, game_state, summary)
        
        # Try to build houses
        self._handle_house_building(ai_player, game_state, summary)
        
        return summary
        
    def handle_property_purchase(self, ai_player: AIPlayer, property_name: str, 
                               price: int, game_state: GameState) -> bool:
        """Handle AI property purchase decision."""
        return ai_player.decide_buy_property(property_name, price, game_state)
        
    def handle_post_move_actions(self, ai_player: AIPlayer, game_state: GameState) -> Dict[str, Any]:
        """Handle actions after movement (building houses, mortgaging, etc.)."""
        summary = {
            "houses_built": [],
            "properties_mortgaged": [],
            "properties_unmortgaged": []
        }
        
        # Proactive mortgage management when low on funds
        self._handle_proactive_mortgage_management(ai_player, game_state, summary)
        
        # Build houses if possible and have sufficient funds
        if ai_player.money > 300:  # Only build if we have buffer
            while True:
                prop_to_build = ai_player.decide_build_house(game_state)
                if prop_to_build:
                    if game_state.build_house(ai_player, prop_to_build):
                        summary["houses_built"].append(prop_to_build)
                    else:
                        break
                else:
                    break
                
        # Unmortgage properties if possible
        self._handle_unmortgage_properties(ai_player, game_state, summary)
        
        return summary
        
    def handle_bankruptcy_management(self, ai_player: AIPlayer, amount_needed: int, 
                                   game_state: GameState) -> Dict[str, Any]:
        """Handle AI bankruptcy management."""
        summary = {
            "houses_sold": [],
            "properties_mortgaged": []
        }
        
        print(f"  🔍 AI Bankruptcy: Need ${amount_needed}, have ${ai_player.money}")
        
        # Get all available properties for liquidation
        available_properties = []
        properties_with_houses = []
        
        for prop_name in ai_player.properties:
            prop = game_state.board.properties[prop_name]
            if prop.houses > 0:
                properties_with_houses.append(prop_name)
            elif not prop.is_mortgaged:
                available_properties.append(prop_name)
        
        print(f"  📊 Properties: {len(ai_player.properties)} total, {len(properties_with_houses)} with houses, {len(available_properties)} mortgagable")
        
        # Sell houses first - be more aggressive
        if properties_with_houses:
            print(f"  🏠 Trying to sell houses...")
            for prop_name in properties_with_houses:
                if ai_player.money >= amount_needed:
                    break
                if game_state.sell_house(ai_player, prop_name):
                    summary["houses_sold"].append(prop_name)
                    print(f"    ✅ Sold house on {prop_name}")
                    
        # Mortgage properties - be more aggressive
        if available_properties:
            print(f"  🏦 Trying to mortgage properties...")
            for prop_name in available_properties:
                if ai_player.money >= amount_needed:
                    break
                if game_state.mortgage_property(ai_player, prop_name):
                    summary["properties_mortgaged"].append(prop_name)
                    print(f"    ✅ Mortgaged {prop_name}")
                    
        # If still not enough, mortgage any remaining unmortgaged properties
        # This should not normally happen but ensures complete liquidation
        remaining_unmortgaged = []
        for prop_name in ai_player.properties:
            prop = game_state.board.properties[prop_name]
            if not prop.is_mortgaged and prop.houses == 0 and prop_name not in summary["properties_mortgaged"]:
                remaining_unmortgaged.append(prop_name)
        
        if remaining_unmortgaged and ai_player.money < amount_needed:
            print(f"  🏦 Liquidating remaining properties...")
            for prop_name in remaining_unmortgaged:
                if ai_player.money >= amount_needed:
                    break
                if game_state.mortgage_property(ai_player, prop_name):
                    summary["properties_mortgaged"].append(prop_name)
                    print(f"    ✅ Mortgaged {prop_name}")
                    
        print(f"  💰 After liquidation: ${ai_player.money} (need ${amount_needed})")
        
        # Check if bankruptcy was actually resolved
        if ai_player.money < 0:
            print(f"  ❌ AI still bankrupt with ${ai_player.money}")
        elif ai_player.money < amount_needed:
            print(f"  ❌ AI still needs ${abs(ai_player.money - amount_needed)} more")
        else:
            print(f"  ✅ AI successfully resolved bankruptcy")
            
        return summary
        
    def _handle_unmortgage_properties(self, ai_player: AIPlayer, game_state: GameState, 
                                    summary: Dict[str, Any]) -> None:
        """Handle unmortgaging properties when AI has excess cash."""
        # Only unmortgage if AI has good cash reserves
        if ai_player.money < 500:
            return
            
        while True:
            prop_to_unmortgage = ai_player.decide_unmortgage_property(game_state)
            if prop_to_unmortgage:
                prop = game_state.board.properties[prop_to_unmortgage]
                unmortgage_cost = int(prop.mortgage_value * 1.1)
                if game_state.unmortgage_property(ai_player, prop_to_unmortgage):
                    summary.setdefault("properties_unmortgaged", []).append(prop_to_unmortgage)
                else:
                    break
            else:
                break
                
    def _handle_house_building(self, ai_player: AIPlayer, game_state: GameState, 
                             summary: Dict[str, Any]) -> None:
        """Handle building houses when AI has excess cash."""
        # Only build if AI has good cash reserves
        if ai_player.money < 300:
            return
            
        while True:
            prop_to_build = ai_player.decide_build_house(game_state)
            if prop_to_build:
                prop = game_state.board.properties[prop_to_build]
                if game_state.build_house(ai_player, prop_to_build):
                    summary.setdefault("houses_built", []).append(prop_to_build)
                else:
                    break
            else:
                break

    def _handle_proactive_mortgage_management(self, ai_player: AIPlayer, game_state: GameState, 
                                            summary: Dict[str, Any]) -> None:
        """Handle proactive mortgage management when AI has low funds."""
        # Define low funds threshold (considering rent payments and basic expenses)
        low_funds_threshold = 200
        
        # If AI has very low funds, be more aggressive with mortgaging
        if ai_player.money < low_funds_threshold:
            # First, try to sell houses
            while ai_player.money < low_funds_threshold:
                prop_to_sell = ai_player.decide_sell_house(low_funds_threshold, game_state)
                if prop_to_sell:
                    if game_state.sell_house(ai_player, prop_to_sell):
                        summary.setdefault("houses_sold", []).append(prop_to_sell)
                    else:
                        break
                else:
                    break
            
            # Then mortgage properties if still needed
            while ai_player.money < low_funds_threshold:
                prop_to_mortgage = ai_player.decide_mortgage_property(low_funds_threshold, game_state)
                if prop_to_mortgage:
                    if game_state.mortgage_property(ai_player, prop_to_mortgage):
                        summary.setdefault("properties_mortgaged", []).append(prop_to_mortgage)
                    else:
                        break
                else:
                    break
        
        # If critically low (below $50), be even more aggressive
        critical_threshold = 50
        if ai_player.money < critical_threshold:
            # Mortgage any available properties regardless of strategic value
            for prop_name in list(ai_player.properties):
                prop = game_state.board.properties[prop_name]
                if not prop.is_mortgaged and prop.houses == 0:
                    if game_state.mortgage_property(ai_player, prop_name):
                        summary.setdefault("properties_mortgaged", []).append(prop_name)
                    if ai_player.money >= critical_threshold:
                        break