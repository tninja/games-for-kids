import json
import os
from typing import Dict, Any, List, TYPE_CHECKING
if TYPE_CHECKING:
    from .game import GameState

class GameSaveManager:
    """Manages saving and loading game states."""
    
    @staticmethod
    def save_game(game, filename: str) -> bool:
        """Save the current game state to a file."""
        try:
            save_data = {
                "players": [],
                "properties": {},
                "current_player_index": game.current_player_index,
                "game_over": game.game_over,
                "winner": game.winner,
                "doubles_count": game.doubles_count,
                "last_dice_roll": list(game.last_dice_roll),
                "chance_deck": {
                    "cards": game.chance_deck.cards,
                    "discard_pile": game.chance_deck.discard_pile
                },
                "community_chest_deck": {
                    "cards": game.community_chest_deck.cards,
                    "discard_pile": game.community_chest_deck.discard_pile
                }
            }
            
            # Save player data
            for player in game.players:
                player_data = {
                    "name": player.name,
                    "money": player.money,
                    "position": player.position,
                    "properties": player.properties,
                    "in_jail": player.in_jail,
                    "jail_turns": player.jail_turns,
                    "get_out_of_jail_free": player.get_out_of_jail_free,
                    "token": player.token,
                    "type": "human" if not hasattr(player, 'difficulty') else "ai",
                    "difficulty": getattr(player, 'difficulty', None)
                }
                save_data["players"].append(player_data)
            
            # Save property data
            for prop_name, prop in game.board.properties.items():
                prop_data = {
                    "owner": prop.owner,
                    "houses": prop.houses,
                    "is_mortgaged": prop.is_mortgaged
                }
                save_data["properties"][prop_name] = prop_data
            
            with open(filename, 'w') as f:
                json.dump(save_data, f, indent=2)
            
            return True
            
        except Exception as e:
            print(f"Error saving game: {e}")
            return False
    
    @staticmethod
    def load_game(filename: str):
        """Load a game state from a file."""
        from .game import GameState
        import json

        try:
            with open(filename, 'r') as f:
                save_data = json.load(f)
            
            # Create player list with proper types
            players = []
            for player_data in save_data["players"]:
                if player_data["type"] == "ai":
                    players.append({
                        "name": player_data["name"],
                        "difficulty": player_data["difficulty"]
                    })
                else:
                    players.append(player_data["name"])
            
            # Create new game state
            game = GameState(players)
            
            # Restore game state
            game.current_player_index = save_data["current_player_index"]
            game.game_over = save_data["game_over"]
            game.winner = save_data["winner"]
            game.doubles_count = save_data["doubles_count"]
            game.last_dice_roll = tuple(save_data["last_dice_roll"])
            
            # Restore card decks
            game.chance_deck.cards = save_data["chance_deck"]["cards"]
            game.chance_deck.discard_pile = save_data["chance_deck"]["discard_pile"]
            game.community_chest_deck.cards = save_data["community_chest_deck"]["cards"]
            game.community_chest_deck.discard_pile = save_data["community_chest_deck"]["discard_pile"]
            
            # Restore player states
            for i, player_data in enumerate(save_data["players"]):
                player = game.players[i]
                player.money = player_data["money"]
                player.position = player_data["position"]
                player.properties = list(player_data["properties"])
                player.in_jail = player_data["in_jail"]
                player.jail_turns = player_data["jail_turns"]
                player.get_out_of_jail_free = player_data["get_out_of_jail_free"]
                if "token" in player_data:
                    player.token = player_data["token"]
            
            # Restore property states
            for prop_name, prop_data in save_data["properties"].items():
                if prop_name in game.board.properties:
                    prop = game.board.properties[prop_name]
                    prop.owner = prop_data["owner"]
                    prop.houses = prop_data["houses"]
                    prop.is_mortgaged = prop_data["is_mortgaged"]
            
            return game
            
        except FileNotFoundError:
            print(f"Error: Save file '{filename}' not found.")
            return None
        except json.JSONDecodeError:
            print(f"Error: Save file '{filename}' is corrupt or not a valid JSON file.")
            return None
        except (KeyError, TypeError) as e:
            print(f"Error: Save file '{filename}' has an invalid format. Missing key: {e}")
            return None
        except Exception as e:
            print(f"An unexpected error occurred while loading game: {e}")
            return None
    
    @staticmethod
    def list_saved_games() -> List[str]:
        """List all saved game files."""
        try:
            return [f for f in os.listdir('.') if f.endswith('.monopoly')]
        except:
            return []