from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum


class PropertyGroup(Enum):
    """Property color groups."""
    BROWN = "Brown"
    LIGHT_BLUE = "Light Blue"
    PINK = "Pink"
    ORANGE = "Orange"
    RED = "Red"
    YELLOW = "Yellow"
    GREEN = "Green"
    DARK_BLUE = "Dark Blue"
    RAILROAD = "Railroad"
    UTILITY = "Utility"


@dataclass
class Property:
    """Represents a property in Monopoly."""
    name: str
    group: PropertyGroup
    price: int
    rent: List[int]  # Base rent, 1 house, 2 houses, 3 houses, 4 houses, hotel
    house_cost: int = 0
    mortgage_value: int = 0
    
    def __post_init__(self):
        if self.mortgage_value == 0:
            self.mortgage_value = self.price // 2
        self.owner: Optional[str] = None
        self.houses: int = 0
        self.is_mortgaged: bool = False
        
    def get_rent(self, dice_roll: int = 0, all_properties: Dict[str, 'Property'] = None) -> int:
        """Calculate rent based on property state."""
        if self.is_mortgaged or not self.owner:
            return 0
            
        if self.group == PropertyGroup.RAILROAD:
            # Rent is 25, 50, 100, 200 based on number of railroads owned
            railroads_owned = self._count_railroads_owned(all_properties)
            return 25 * (2 ** (railroads_owned - 1))
            
        elif self.group == PropertyGroup.UTILITY:
            # Rent is 4x or 10x dice roll
            utilities_owned = self._count_utilities_owned(all_properties)
            if utilities_owned == 1:
                return 4 * dice_roll
            elif utilities_owned >= 2:
                return 10 * dice_roll
                
        else:
            # Regular property
            if self.houses == 0 and self.has_monopoly(all_properties):
                return self.rent[0] * 2  # Double rent for monopoly
            return self.rent[min(self.houses, len(self.rent) - 1)]
            
    def has_monopoly(self, all_properties: Dict[str, 'Property']) -> bool:
        """Check if this property is part of a monopoly."""
        if not self.owner:
            return False
            
        # Count properties in same group owned by this owner
        group_properties = [p for p in all_properties.values() 
                           if p.group == self.group and p.owner == self.owner]
        
        # Monopoly sizes
        monopoly_sizes = {
            PropertyGroup.BROWN: 2,
            PropertyGroup.LIGHT_BLUE: 3,
            PropertyGroup.PINK: 3,
            PropertyGroup.ORANGE: 3,
            PropertyGroup.RED: 3,
            PropertyGroup.YELLOW: 3,
            PropertyGroup.GREEN: 3,
            PropertyGroup.DARK_BLUE: 2
        }
        
        expected_size = monopoly_sizes.get(self.group, 0)
        return len(group_properties) == expected_size
        
    def _count_railroads_owned(self, all_properties: Dict[str, 'Property']) -> int:
        """Count how many railroads the owner has."""
        if not self.owner:
            return 0
        return sum(1 for p in all_properties.values() 
                  if p.group == PropertyGroup.RAILROAD and p.owner == self.owner)
                  
    def _count_utilities_owned(self, all_properties: Dict[str, 'Property']) -> int:
        """Count how many utilities the owner has."""
        if not self.owner:
            return 0
        return sum(1 for p in all_properties.values() 
                  if p.group == PropertyGroup.UTILITY and p.owner == self.owner)
                  
    def can_build_house(self, all_properties: Dict[str, 'Property']) -> bool:
        """Check if houses can be built on this property."""
        if self.group in [PropertyGroup.RAILROAD, PropertyGroup.UTILITY]:
            return False
        if self.is_mortgaged:
            return False
        if not self.has_monopoly(all_properties):
            return False
        if self.houses >= 5:  # Hotel already built
            return False
            
        # Check if building is balanced across monopoly
        group_properties = [p for p in all_properties.values() 
                           if p.group == self.group and p.owner == self.owner]
        
        # Can only build if this property has the fewest houses
        min_houses = min(p.houses for p in group_properties)
        return self.houses == min_houses
        
    def mortgage(self) -> int:
        """Mortgage the property and return mortgage value."""
        if self.is_mortgaged or self.houses > 0:
            return 0
        self.is_mortgaged = True
        return self.mortgage_value
        
    def unmortgage(self) -> int:
        """Unmortgage the property and return cost."""
        if not self.is_mortgaged:
            return 0
        self.is_mortgaged = False
        return int(self.mortgage_value * 1.1)  # 10% interest