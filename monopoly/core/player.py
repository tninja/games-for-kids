from typing import List, Optional, Tuple
from dataclasses import dataclass, field


@dataclass
class Player:
    """Represents a player in the Monopoly game."""
    name: str
    token: str
    money: int = 1500
    position: int = 0
    in_jail: bool = False
    jail_turns: int = 0
    get_out_of_jail_free: int = 0
    token_color: Tuple[int, int, int] = field(default_factory=lambda: (255, 0, 0))
    
    def __post_init__(self):
        self.properties: List[str] = []
        
    def add_money(self, amount: int) -> None:
        """Add money to player's balance."""
        self.money += amount
        
    def deduct_money(self, amount: int) -> bool:
        """Deduct money from player's balance. Returns True if successful."""
        if self.money >= amount:
            self.money -= amount
            return True
        return False
        
    def move_to_position(self, position: int) -> None:
        """Move player to specific position."""
        self.position = position % 40
        
    def move_forward(self, steps: int) -> int:
        """Move player forward by steps. Returns new position."""
        old_position = self.position
        self.position = (self.position + steps) % 40
        
        # Check if player passed GO
        if old_position + steps >= 40:
            return 200  # GO salary
        return 0
        
    def add_property(self, property_name: str) -> None:
        """Add property to player's portfolio."""
        if property_name not in self.properties:
            self.properties.append(property_name)
            
    def remove_property(self, property_name: str) -> None:
        """Remove property from player's portfolio."""
        if property_name in self.properties:
            self.properties.remove(property_name)
            
    def get_net_worth(self, property_values: dict) -> int:
        """Calculate player's net worth including properties."""
        total = self.money
        for prop in self.properties:
            if prop in property_values:
                total += property_values[prop]
        return total
        
    def can_afford(self, amount: int) -> bool:
        """Check if player can afford a purchase."""
        return self.money >= amount
        
    def is_bankrupt(self) -> bool:
        """Check if player is bankrupt."""
        return self.money < 0
