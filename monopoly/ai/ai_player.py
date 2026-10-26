from typing import List, Dict, Optional, Tuple
import random
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.player import Player
from core.game import GameState
from core.property import Property, PropertyGroup


class AIPlayer(Player):
    """AI player with decision-making capabilities."""
    
    def __init__(self, name: str, token: str, difficulty: str = "medium", **kwargs):
        super().__init__(name, token, **kwargs)
        self.difficulty = difficulty
        self.aggression_level = self._set_aggression_level(difficulty)
        self.risk_tolerance = self._set_risk_tolerance(difficulty)
        
    def _set_aggression_level(self, difficulty: str) -> float:
        """Set AI aggression based on difficulty."""
        levels = {
            "easy": 0.3,
            "medium": 0.6,
            "hard": 0.9
        }
        return levels.get(difficulty, 0.6)
        
    def _set_risk_tolerance(self, difficulty: str) -> float:
        """Set AI risk tolerance based on difficulty."""
        levels = {
            "easy": 0.8,
            "medium": 0.5,
            "hard": 0.2
        }
        return levels.get(difficulty, 0.5)
        
    def decide_buy_property(self, property_name: str, price: int, game_state: GameState) -> bool:
        """Decide whether to buy a property."""
        prop = game_state.board.properties.get(property_name)
        if not prop:
            return False
            
        # Never buy if can't afford
        if not self.can_afford(price):
            return False
            
        # Calculate property value based on various factors
        property_value = self._calculate_property_value(prop, game_state)
        
        # Adjust for difficulty
        adjusted_price = price * (1.0 - self.aggression_level * 0.3)
        
        # Consider cash flow
        cash_ratio = self.money / price
        if cash_ratio < 2.0 and not self._is_critical_property(prop, game_state):
            return False
            
        return property_value >= adjusted_price
        
    def _calculate_property_value(self, prop: Property, game_state: GameState) -> float:
        """Calculate the strategic value of a property."""
        base_value = prop.price
        
        # Value based on group completion potential
        group_value = self._calculate_group_completion_value(prop, game_state)
        
        # Value based on rent potential
        rent_value = self._calculate_rent_value(prop)
        
        # Value based on monopoly potential
        monopoly_value = self._calculate_monopoly_value(prop, game_state)
        
        # Value based on blocking opponents
        blocking_value = self._calculate_blocking_value(prop, game_state)
        
        total_value = (base_value * 0.3 + 
                      group_value * 0.25 + 
                      rent_value * 0.2 + 
                      monopoly_value * 0.15 + 
                      blocking_value * 0.1)
                      
        return total_value
        
    def _calculate_group_completion_value(self, prop: Property, game_state: GameState) -> float:
        """Calculate value based on completing a color group."""
        owned_in_group = sum(1 for p_name in self.properties 
                           if game_state.board.properties[p_name].group == prop.group)
        
        group_sizes = {
            PropertyGroup.BROWN: 2,
            PropertyGroup.LIGHT_BLUE: 3,
            PropertyGroup.PINK: 3,
            PropertyGroup.ORANGE: 3,
            PropertyGroup.RED: 3,
            PropertyGroup.YELLOW: 3,
            PropertyGroup.GREEN: 3,
            PropertyGroup.DARK_BLUE: 2,
            PropertyGroup.RAILROAD: 4,
            PropertyGroup.UTILITY: 2
        }
        
        group_size = group_sizes.get(prop.group, 3)
        completion_ratio = owned_in_group / group_size
        
        # Higher value when close to completing a group
        return prop.price * (1 + completion_ratio * 2)
        
    def _calculate_rent_value(self, prop: Property) -> float:
        """Calculate value based on rent potential."""
        if prop.group in [PropertyGroup.RAILROAD, PropertyGroup.UTILITY]:
            return prop.price * 0.8  # Utilities and railroads have steady value
        else:
            # Value based on max rent potential
            max_rent = max(prop.rent)
            return (max_rent * 10) * 0.7  # Rough estimate of rent value
            
    def _calculate_monopoly_value(self, prop: Property, game_state: GameState) -> float:
        """Calculate value for creating monopolies."""
        if prop.group in [PropertyGroup.RAILROAD, PropertyGroup.UTILITY]:
            return prop.price * 0.5
            
        # Check if this would complete a monopoly
        group_properties = [p for p in game_state.board.properties.values() 
                          if p.group == prop.group]
        owned_by_others = [p for p in group_properties 
                          if p.owner and p.owner != self.name]
        
        if len(owned_by_others) == 1:
            return prop.price * 2.0  # High value for completing monopoly
        return 0
        
    def _calculate_blocking_value(self, prop: Property, game_state: GameState) -> float:
        """Calculate value for blocking opponents."""
        if prop.owner is not None:
            return 0
            
        # Check if opponents are close to completing this group
        group_properties = [p for p in game_state.board.properties.values() 
                          if p.group == prop.group]
        
        opponent_count = {}
        for p in group_properties:
            if p.owner and p.owner != self.name:
                opponent_count[p.owner] = opponent_count.get(p.owner, 0) + 1
                
        max_opponent = max(opponent_count.values()) if opponent_count else 0
        return prop.price * (max_opponent * 0.5)
        
    def _is_critical_property(self, prop: Property, game_state: GameState) -> bool:
        """Determine if a property is critical to own."""
        # Critical if it completes a monopoly or is a railroad/utility
        if prop.group in [PropertyGroup.RAILROAD, PropertyGroup.UTILITY]:
            return True
            
        return self._calculate_monopoly_value(prop, game_state) > 0
        
    def decide_build_house(self, game_state: GameState) -> Optional[str]:
        """Decide which property to build a house on."""
        best_property = None
        best_value = 0
        
        for prop_name in self.properties:
            prop = game_state.board.properties[prop_name]
            
            if not prop.can_build_house(game_state.board.properties):
                continue
                
            # Calculate ROI for building
            current_rent = prop.get_rent(0, game_state.board.properties)
            new_rent = prop.rent[min(prop.houses + 1, len(prop.rent) - 1)]
            rent_increase = new_rent - current_rent
            
            # Consider monopoly bonus
            has_monopoly = prop.has_monopoly(game_state.board.properties)
            if has_monopoly:
                rent_increase *= 1.5
                
            roi = rent_increase / prop.house_cost
            
            if roi > best_value and self.can_afford(prop.house_cost):
                best_value = roi
                best_property = prop_name
                
        # Require minimum ROI based on difficulty
        min_roi = 0.1 + (self.aggression_level * 0.2)
        
        return best_property if best_value >= min_roi else None
        
    def decide_mortgage_property(self, amount_needed: int, game_state: GameState) -> Optional[str]:
        """Decide which property to mortgage when needing cash."""
        best_candidate = None
        lowest_priority = float('inf')
        
        for prop_name in self.properties:
            prop = game_state.board.properties[prop_name]
            
            # Skip if already mortgaged or has houses
            if prop.is_mortgaged or prop.houses > 0:
                continue
                
            # Calculate priority (lower = better to mortgage)
            priority = self._calculate_mortgage_priority(prop, game_state)
            
            if priority < lowest_priority:
                lowest_priority = priority
                best_candidate = prop_name
                
        return best_candidate
        
    def _calculate_mortgage_priority(self, prop: Property, game_state: GameState) -> float:
        """Calculate priority for mortgaging a property."""
        # Lower priority means better to mortgage
        priority = 0
        
        # Priority based on group completion
        if prop.has_monopoly(game_state.board.properties):
            priority += 100  # Don't mortgage monopoly properties
            
        # Priority based on rent value
        rent_value = prop.get_rent(0, game_state.board.properties)
        priority -= rent_value / 100
        
        # Priority based on strategic value
        strategic_value = self._calculate_property_value(prop, game_state)
        priority += strategic_value / prop.price * 50
        
        return priority
        
    def decide_sell_house(self, amount_needed: int, game_state: GameState) -> Optional[str]:
        """Decide which house to sell when needing cash."""
        best_candidate = None
        lowest_priority = float('inf')
        
        for prop_name in self.properties:
            prop = game_state.board.properties[prop_name]
            
            if prop.houses == 0:
                continue
                
            # Check if selling maintains balance
            group_properties = [p for p in game_state.board.properties.values() 
                              if p.group == prop.group and p.owner == self.name]
            max_houses = max(p.houses for p in group_properties)
            
            if prop.houses == max_houses:
                # Calculate priority for selling
                current_rent = prop.get_rent(0, game_state.board.properties)
                prev_rent = prop.rent[max(prop.houses - 1, 0)]
                rent_loss = current_rent - prev_rent
                
                priority = rent_loss / prop.house_cost
                
                if priority < lowest_priority:
                    lowest_priority = priority
                    best_candidate = prop_name
                    
        return best_candidate
        
    def decide_unmortgage_property(self, game_state: GameState) -> Optional[str]:
        """Decide which property to unmortgage when having extra cash."""
        best_candidate = None
        best_value = 0
        
        for prop_name in self.properties:
            prop = game_state.board.properties[prop_name]
            
            if not prop.is_mortgaged:
                continue
                
            unmortgage_cost = int(prop.mortgage_value * 1.1)
            
            if not self.can_afford(unmortgage_cost):
                continue
                
            # Calculate value of unmortgaging
            rent_value = prop.get_rent(0, game_state.board.properties)
            roi = rent_value / unmortgage_cost
            
            # Strategic value for group completion
            strategic_value = self._calculate_property_value(prop, game_state)
            
            total_value = roi + (strategic_value / unmortgage_cost * 0.5)
            
            if total_value > best_value:
                best_value = total_value
                best_candidate = prop_name
                
        # Only unmortgage if ROI is reasonable
        min_roi = 0.05 + (self.aggression_level * 0.1)
        return best_candidate if best_value >= min_roi else None
        
    def decide_jail_action(self, game_state: GameState) -> str:
        """Decide what to do when in jail."""
        # Use get out of jail free card if available
        if self.get_out_of_jail_free > 0:
            return "use_card"
            
        # Pay $50 if rich enough
        if self.money > 1000:
            return "pay"
            
        # Roll if poor or moderate risk tolerance
        if self.money > 500 or self.risk_tolerance > 0.5:
            return "roll"
            
        return "pay"  # Default to pay when poor
        
    def should_trade(self, game_state: GameState) -> bool:
        """Determine if AI should consider trading."""
        # For now, AI doesn't trade
        return False
        
    def make_trade_offer(self, game_state: GameState) -> Optional[dict]:
        """Generate a trade offer."""
        return None  # Trading not implemented yet