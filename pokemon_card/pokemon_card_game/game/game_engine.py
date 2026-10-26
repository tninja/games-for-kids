from enum import Enum
from typing import List
from .player import Player
from .card import PokemonCard, EnergyCard, TrainerCard

class GamePhase(Enum):
    SETUP = "Setup"
    PLAYER_TURN = "Player Turn"
    GAME_OVER = "Game Over"

class GameEngine:
    def __init__(self, players: List[Player]):
        self.players = players
        self.current_player_index = 0
        self.game_phase = GamePhase.SETUP
        self.turn_number = 0

    def get_current_player(self) -> Player:
        return self.players[self.current_player_index]

    def get_opponent(self) -> Player:
        return self.players[(self.current_player_index + 1) % 2]

    def setup_game(self):
        print("Setting up the game...")
        for player in self.players:
            player.draw_initial_hand()
            player.setup_prize_cards()
        
        self.game_phase = GamePhase.PLAYER_TURN
        self.turn_number = 1
        print("Setup complete. Starting game.")

    def start_turn(self):
        player = self.get_current_player()
        player.energy_attached_this_turn = False
        player.has_retreated_this_turn = False
        print(f"\n--- {player.name}'s Turn ({self.turn_number}) ---")
        drawn_card = player.deck.draw()
        if not drawn_card:
            print(f"{player.name} cannot draw a card. {self.get_opponent().name} wins!")
            self.game_phase = GamePhase.GAME_OVER
            return
        player.hand.extend(drawn_card)
        print(f"{player.name} drew a card.")

    def end_turn(self):
        # Check for win conditions
        if self.check_win_conditions():
            return

        self.current_player_index = (self.current_player_index + 1) % 2
        if self.current_player_index == 0:
            self.turn_number += 1
        
        # It's important to call start_turn for the *next* player
        self.start_turn()

    def check_win_conditions(self) -> bool:
        player = self.get_current_player()
        opponent = self.get_opponent()

        if len(player.prize_cards) == 0:
            print(f"{player.name} has taken all their prize cards and wins!")
            self.game_phase = GamePhase.GAME_OVER
            return True
        
        if not opponent.active_pokemon and not opponent.bench:
            print(f"{opponent.name} has no Pokémon in play. {player.name} wins!")
            self.game_phase = GamePhase.GAME_OVER
            return True
            
        return False

    def set_active_pokemon(self, player: Player, pokemon: PokemonCard) -> bool:
        if pokemon in player.hand and isinstance(pokemon, PokemonCard) and pokemon.stage == 0:
            player.active_pokemon = pokemon
            player.hand.remove(pokemon)
            print(f"{player.name} chose {player.active_pokemon.name} as Active.")
            return True
        return False

    def play_pokemon_to_bench(self, player: Player, pokemon: PokemonCard) -> bool:
        if len(player.bench) >= 5:
            print(f"{player.name}'s bench is full.")
            return False
        
        if pokemon in player.hand and isinstance(pokemon, PokemonCard) and pokemon.stage == 0:
            player.bench.append(pokemon)
            player.hand.remove(pokemon)
            print(f"{player.name} played {pokemon.name} to the bench.")
            return True
        return False

    def attach_energy(self, player: Player, energy_card: EnergyCard, target_pokemon: PokemonCard) -> bool:
        if player.energy_attached_this_turn:
            print("You have already attached an energy card this turn.")
            return False
        
        if energy_card in player.hand and target_pokemon in ([player.active_pokemon] + player.bench):
            target_pokemon.energy_attached.append(energy_card)
            player.hand.remove(energy_card)
            player.energy_attached_this_turn = True
            print(f"Attached {energy_card.name} to {target_pokemon.name}.")
            return True
        return False

    def play_trainer_card(self, player: Player, trainer_card: TrainerCard, target_pokemon: PokemonCard = None) -> bool:
        if trainer_card not in player.hand:
            return False

        # Handle Potion
        if trainer_card.name == "Potion":
            if target_pokemon and target_pokemon.damage_counters > 0:
                target_pokemon.damage_counters = max(0, target_pokemon.damage_counters - 30)
                print(f"Used Potion on {target_pokemon.name}, healing 30 damage. New damage: {target_pokemon.damage_counters}")
                player.hand.remove(trainer_card)
                player.discard_pile.append(trainer_card)
                return True
            else:
                print("Potion can only be used on a damaged Pokémon.")
                return False
        
        # Other trainer cards can be handled here
        return False

    def retreat(self, player: Player, pokemon_to_promote: PokemonCard) -> bool:
        active_pokemon = player.active_pokemon
        if not active_pokemon:
            print("No active Pokémon to retreat.")
            return False

        if player.has_retreated_this_turn:
            print("You have already retreated this turn.")
            return False

        if not player.bench:
            print("No Pokémon on the bench to switch to.")
            return False
            
        cost = active_pokemon.retreat_cost
        if len(active_pokemon.energy_attached) < cost:
            print(f"Not enough energy to retreat. Cost is {cost}, but only {len(active_pokemon.energy_attached)} is attached.")
            return False

        # For simplicity, discard the first {cost} energy cards.
        # A real implementation would let the user choose.
        for _ in range(cost):
            energy = active_pokemon.energy_attached.pop(0)
            player.discard_pile.append(energy)
            print(f"Discarded {energy.name} to pay for retreat cost.")

        print(f"{player.name} retreats {active_pokemon.name}.")
        player.bench.append(active_pokemon)
        
        player.active_pokemon = pokemon_to_promote
        player.bench.remove(pokemon_to_promote)
        print(f"{pokemon_to_promote.name} is now the active Pokémon.")
        
        player.has_retreated_this_turn = True
        return True

    def attack(self):
        player = self.get_current_player()
        opponent = self.get_opponent()

        if not player.active_pokemon:
            return False, "You have no active Pokémon to attack with!"

        if not player.active_pokemon.attacks:
            return False, f"{player.active_pokemon.name} has no attacks."
            
        # Simplified: check if there's enough energy for the first attack
        attack = player.active_pokemon.attacks[0]
        attached_energy_types = [e.energy_type for e in player.active_pokemon.energy_attached]
        
        can_attack = True
        # This is a very basic energy check, doesn't handle colorless well
        temp_attached_energy = list(attached_energy_types)
        for cost_type in attack.cost:
            if cost_type == "Colorless":
                if temp_attached_energy:
                    temp_attached_energy.pop(0)
                else:
                    can_attack = False
                    break
            elif cost_type in temp_attached_energy:
                temp_attached_energy.remove(cost_type)
            else:
                can_attack = False
                break
        
        if not can_attack:
            msg = f"{player.active_pokemon.name} doesn't have enough energy for {attack.name}."
            self.end_turn()
            return False, msg

        msg = f"{player.name}'s {player.active_pokemon.name} uses {attack.name} for {attack.damage} damage!"

        if opponent.active_pokemon:
            opponent.active_pokemon.damage_counters += attack.damage
            msg += f" {opponent.name}'s {opponent.active_pokemon.name} now has {opponent.active_pokemon.damage_counters} damage."

            if opponent.active_pokemon.damage_counters >= opponent.active_pokemon.hp:
                msg += f" {opponent.name}'s {opponent.active_pokemon.name} is knocked out!"
                opponent.discard_pile.append(opponent.active_pokemon)
                opponent.active_pokemon = None
                
                if player.prize_cards:
                    prize = player.prize_cards.pop(0) 
                    msg += f" {player.name} takes a prize card."
                    player.hand.append(prize)

                if not opponent.bench:
                    msg += f" {opponent.name} has no Pokémon to promote."
                    self.check_win_conditions()
        
        self.end_turn()
        return True, msg

