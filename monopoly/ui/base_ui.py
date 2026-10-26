
from abc import ABC, abstractmethod
from typing import List, Dict, Optional, Tuple, Union

# Add parent directory to path to allow imports from core
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.player import Player

class BaseUI(ABC):
    """Abstract base class for Monopoly UI."""

    def __init__(self):
        self.game = None

    @abstractmethod
    def clear_screen(self):
        """Clear the console screen."""
        pass

    @abstractmethod
    def display_welcome(self):
        """Display welcome message."""
        pass

    @abstractmethod
    def get_player_names(self) -> List[Union[str, Dict[str, str]]]:
        """Get player names and types from user input."""
        pass

    @abstractmethod
    def display_game_state(self):
        """Display the current game state."""
        pass

    @abstractmethod
    def display_player_details(self, player: Player):
        """Display detailed information about a player."""
        pass

    @abstractmethod
    def display_board_position(self, position: int):
        """Display information about a board position."""
        pass

    @abstractmethod
    def get_player_action(self, prompt: str, valid_actions: List[str]) -> str:
        """Get player action with validation."""
        pass

    @abstractmethod
    def display_turn_menu(self) -> str:
        """Display turn menu and get player choice."""
        pass

    @abstractmethod
    def display_roll_result(self, player: Player, die1: int, die2: int, new_position: int):
        """Display dice roll result."""
        pass

    @abstractmethod
    def display_property_purchase_prompt(self, property_name: str, price: int) -> bool:
        """Display property purchase prompt."""
        pass

    @abstractmethod
    def display_rent_payment(self, player: Player, owner: str, amount: int, property_name: str):
        """Display rent payment information."""
        pass

    @abstractmethod
    def display_insufficient_funds(self, player: Player, amount_needed: int):
        """Display insufficient funds message."""
        pass

    @abstractmethod
    def display_bankruptcy(self, player: Player):
        """Display bankruptcy message."""
        pass

    @abstractmethod
    def display_winner(self, winner: str):
        """Display game winner."""
        pass

    @abstractmethod
    def display_all_players_status(self):
        """Display detailed status of all players."""
        pass

    @abstractmethod
    def display_jail_options(self, player: Player) -> str:
        """Display jail options for player."""
        pass

    @abstractmethod
    def display_house_building_menu(self, player: Player) -> Tuple[str, int]:
        """Display house building menu."""
        pass

    @abstractmethod
    def display_property_selling_menu(self, player: Player) -> Tuple[str, int]:
        """Display property selling menu."""
        pass

    @abstractmethod
    def pause_for_continue(self):
        """Pause for user to continue."""
        pass

    @abstractmethod
    def display_error(self, message: str):
        """Display error message."""
        pass

    @abstractmethod
    def display_success(self, message: str):
        """Display success message."""
        pass
