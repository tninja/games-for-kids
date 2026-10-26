from typing import Dict, List, Tuple, Optional
from .property import Property, PropertyGroup
from .player import Player


class Board:
    """Represents the Monopoly game board."""
    
    def __init__(self):
        self.properties = self._initialize_properties()
        self.spaces = self._initialize_spaces()
        
    def _initialize_properties(self) -> Dict[str, Property]:
        """Initialize all properties on the board."""
        properties = {
            # Brown properties
            "Mediterranean Avenue": Property(
                "Mediterranean Avenue", PropertyGroup.BROWN, 60, [2, 10, 30, 90, 160, 250], 50),
            "Baltic Avenue": Property(
                "Baltic Avenue", PropertyGroup.BROWN, 60, [4, 20, 60, 180, 320, 450], 50),
            
            # Light Blue properties
            "Oriental Avenue": Property(
                "Oriental Avenue", PropertyGroup.LIGHT_BLUE, 100, [6, 30, 90, 270, 400, 550], 50),
            "Vermont Avenue": Property(
                "Vermont Avenue", PropertyGroup.LIGHT_BLUE, 100, [6, 30, 90, 270, 400, 550], 50),
            "Connecticut Avenue": Property(
                "Connecticut Avenue", PropertyGroup.LIGHT_BLUE, 120, [8, 40, 100, 300, 450, 600], 50),
            
            # Pink properties
            "St. Charles Place": Property(
                "St. Charles Place", PropertyGroup.PINK, 140, [10, 50, 150, 450, 625, 750], 100),
            "States Avenue": Property(
                "States Avenue", PropertyGroup.PINK, 140, [10, 50, 150, 450, 625, 750], 100),
            "Virginia Avenue": Property(
                "Virginia Avenue", PropertyGroup.PINK, 160, [12, 60, 180, 500, 700, 900], 100),
            
            # Orange properties
            "St. James Place": Property(
                "St. James Place", PropertyGroup.ORANGE, 180, [14, 70, 200, 550, 750, 950], 100),
            "Tennessee Avenue": Property(
                "Tennessee Avenue", PropertyGroup.ORANGE, 180, [14, 70, 200, 550, 750, 950], 100),
            "New York Avenue": Property(
                "New York Avenue", PropertyGroup.ORANGE, 200, [16, 80, 220, 600, 800, 1000], 100),
            
            # Red properties
            "Kentucky Avenue": Property(
                "Kentucky Avenue", PropertyGroup.RED, 220, [18, 90, 250, 700, 875, 1050], 150),
            "Indiana Avenue": Property(
                "Indiana Avenue", PropertyGroup.RED, 220, [18, 90, 250, 700, 875, 1050], 150),
            "Illinois Avenue": Property(
                "Illinois Avenue", PropertyGroup.RED, 240, [20, 100, 300, 750, 925, 1100], 150),
            
            # Yellow properties
            "Atlantic Avenue": Property(
                "Atlantic Avenue", PropertyGroup.YELLOW, 260, [22, 110, 330, 800, 975, 1150], 150),
            "Ventnor Avenue": Property(
                "Ventnor Avenue", PropertyGroup.YELLOW, 260, [22, 110, 330, 800, 975, 1150], 150),
            "Marvin Gardens": Property(
                "Marvin Gardens", PropertyGroup.YELLOW, 280, [24, 120, 360, 850, 1025, 1200], 150),
            
            # Green properties
            "Pacific Avenue": Property(
                "Pacific Avenue", PropertyGroup.GREEN, 300, [26, 130, 390, 900, 1100, 1275], 200),
            "North Carolina Avenue": Property(
                "North Carolina Avenue", PropertyGroup.GREEN, 300, [26, 130, 390, 900, 1100, 1275], 200),
            "Pennsylvania Avenue": Property(
                "Pennsylvania Avenue", PropertyGroup.GREEN, 320, [28, 150, 450, 1000, 1200, 1400], 200),
            
            # Dark Blue properties
            "Park Place": Property(
                "Park Place", PropertyGroup.DARK_BLUE, 350, [35, 175, 500, 1100, 1300, 1500], 200),
            "Boardwalk": Property(
                "Boardwalk", PropertyGroup.DARK_BLUE, 400, [50, 200, 600, 1400, 1700, 2000], 200),
            
            # Railroads
            "Reading Railroad": Property("Reading Railroad", PropertyGroup.RAILROAD, 200, [25, 50, 100, 200]),
            "Pennsylvania Railroad": Property("Pennsylvania Railroad", PropertyGroup.RAILROAD, 200, [25, 50, 100, 200]),
            "B. & O. Railroad": Property("B. & O. Railroad", PropertyGroup.RAILROAD, 200, [25, 50, 100, 200]),
            "Short Line": Property("Short Line", PropertyGroup.RAILROAD, 200, [25, 50, 100, 200]),
            
            # Utilities
            "Electric Company": Property("Electric Company", PropertyGroup.UTILITY, 150, [4, 10]),
            "Water Works": Property("Water Works", PropertyGroup.UTILITY, 150, [4, 10])
        }
        return properties
        
    def _initialize_spaces(self) -> List[str]:
        """Initialize all spaces on the board in order."""
        return [
            "GO", "Mediterranean Avenue", "Community Chest", "Baltic Avenue", "Income Tax",
            "Reading Railroad", "Oriental Avenue", "Chance", "Vermont Avenue", "Connecticut Avenue",
            "Jail", "St. Charles Place", "Electric Company", "States Avenue", "Virginia Avenue",
            "Pennsylvania Railroad", "St. James Place", "Community Chest", "Tennessee Avenue", "New York Avenue",
            "Free Parking", "Kentucky Avenue", "Chance", "Indiana Avenue", "Illinois Avenue",
            "B. & O. Railroad", "Atlantic Avenue", "Ventnor Avenue", "Water Works", "Marvin Gardens",
            "Go To Jail", "Pacific Avenue", "North Carolina Avenue", "Community Chest", "Pennsylvania Avenue",
            "Short Line", "Chance", "Park Place", "Luxury Tax", "Boardwalk"
        ]
        
    def get_property_at_position(self, position: int) -> Optional[Property]:
        """Get the property at a specific board position."""
        if position < 0 or position >= len(self.spaces):
            return None
            
        space_name = self.spaces[position]
        return self.properties.get(space_name)
        
    def get_space_name(self, position: int) -> str:
        """Get the name of the space at a specific position."""
        if position < 0 or position >= len(self.spaces):
            return "Invalid Position"
        return self.spaces[position]
        
    def get_position_of_property(self, property_name: str) -> int:
        """Get the board position of a specific property."""
        try:
            return self.spaces.index(property_name)
        except ValueError:
            return -1
            
    def get_all_properties_for_player(self, player_name: str) -> List[Property]:
        """Get all properties owned by a specific player."""
        return [prop for prop in self.properties.values() if prop.owner == player_name]
        
    def get_monopoly_groups(self) -> Dict[PropertyGroup, List[str]]:
        """Get all properties grouped by their color group."""
        groups = {}
        for prop_name, prop in self.properties.items():
            if prop.group not in groups:
                groups[prop.group] = []
            groups[prop.group].append(prop_name)
        return groups
        
    def get_property_values(self) -> Dict[str, int]:
        """Get the value of all properties for net worth calculation."""
        values = {}
        for prop_name, prop in self.properties.items():
            value = prop.price
            if prop.houses > 0:
                value += prop.houses * prop.house_cost
            if prop.is_mortgaged:
                value -= prop.mortgage_value
            values[prop_name] = value
        return values