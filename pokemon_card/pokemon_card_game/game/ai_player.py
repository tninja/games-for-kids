from .player import Player
from .card import PokemonCard, EnergyCard, TrainerCard
import time

class AIPlayer(Player):
    def __init__(self, name: str, deck):
        super().__init__(name, deck)
        self.is_ai = True

    def choose_active_pokemon_ai(self, game_engine):
        """AI logic to choose an active Pokémon during setup."""
        basic_pokemon_in_hand = [card for card in self.hand if isinstance(card, PokemonCard) and card.stage == 0]
        if basic_pokemon_in_hand:
            # Simple AI: choose the one with the most HP
            chosen_card = max(basic_pokemon_in_hand, key=lambda p: p.hp)
            game_engine.set_active_pokemon(self, chosen_card)
            return True
        return False
    
    def promote_pokemon_ai(self, game_engine):
        """AI logic to promote a benched Pokémon."""
        if self.bench:
            # Simple AI: choose the benched Pokémon with the most HP
            new_active = max(self.bench, key=lambda p: p.hp)
            self.active_pokemon = new_active
            self.bench.remove(new_active)
            print(f"AI {self.name} promotes {new_active.name} to the active spot.")
            return True
        return False

    def take_turn_ai(self, game_engine):
        """AI logic for taking a turn."""
        print(f"AI player {self.name} is thinking...")
        time.sleep(1)

        # 1. Use a Potion if active is damaged
        if self.active_pokemon and self.active_pokemon.damage_counters > 0:
            potions = [card for card in self.hand if isinstance(card, TrainerCard) and card.name == "Potion"]
            if potions:
                game_engine.play_trainer_card(self, potions[0], self.active_pokemon)
                time.sleep(1)

        # 2. Attach energy to active Pokémon if possible
        if not self.energy_attached_this_turn and self.active_pokemon:
            energy_cards = [card for card in self.hand if isinstance(card, EnergyCard)]
            if energy_cards:
                game_engine.attach_energy(self, energy_cards[0], self.active_pokemon)
                time.sleep(1)

        # 3. Play a basic Pokémon to the bench if there is space
        if len(self.bench) < 5:
            basic_pokemon_in_hand = [card for card in self.hand if isinstance(card, PokemonCard) and card.stage == 0]
            if basic_pokemon_in_hand:
                game_engine.play_pokemon_to_bench(self, basic_pokemon_in_hand[0])
                time.sleep(1)

        # 4. Retreat if active is heavily damaged and there's a better option
        if (self.active_pokemon and 
            self.active_pokemon.damage_counters >= self.active_pokemon.hp / 2 and
            not self.has_retreated_this_turn and
            len(self.active_pokemon.energy_attached) >= self.active_pokemon.retreat_cost and
            self.bench):
            
            healthiest_benched = max(self.bench, key=lambda p: p.hp - p.damage_counters)
            if (healthiest_benched.hp - healthiest_benched.damage_counters) > (self.active_pokemon.hp - self.active_pokemon.damage_counters):
                print(f"AI {self.name} decides to retreat.")
                time.sleep(1)
                if game_engine.retreat(self, healthiest_benched):
                    # If retreat was successful, the turn continues, but we will just attack for now.
                    pass

        # 5. Always attack
        print(f"AI {self.name} decides to attack.")
        time.sleep(1)
        game_engine.attack()
