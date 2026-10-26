from game.card import PokemonCard, EnergyCard, TrainerCard, Attack, TrainerType
from game.deck import Deck
from game.player import Player
from game.ai_player import AIPlayer
from game.game_engine import GameEngine
from ui.cli import CLI

def create_sample_deck():
    # Create some cards
    pikachu = PokemonCard(name="Pikachu", hp=60, attacks=[Attack(name="Thunder Shock", cost=["Electric", "Colorless"], damage=20)], retreat_cost=1)
    charmander = PokemonCard(name="Charmander", hp=70, attacks=[Attack(name="Scratch", cost=["Colorless"], damage=10), Attack(name="Ember", cost=["Fire", "Colorless"], damage=30)], retreat_cost=1)
    squirtle = PokemonCard(name="Squirtle", hp=60, attacks=[Attack(name="Bubble", cost=["Water"], damage=10)], retreat_cost=1)
    
    fire_energy = EnergyCard(name="Fire Energy", energy_type="Fire")
    water_energy = EnergyCard(name="Water Energy", energy_type="Water")
    electric_energy = EnergyCard(name="Electric Energy", energy_type="Electric")
    
    potion = TrainerCard(name="Potion", trainer_type=TrainerType.ITEM, effect="Heal 30 damage from 1 of your Pokémon.")

    # Create a deck
    deck_cards = ([pikachu] * 8 + [charmander] * 8 + [squirtle] * 8 + 
                  [fire_energy] * 8 + [water_energy] * 8 + [electric_energy] * 8 + [potion] * 12)
    
    # Make sure deck is 60 cards for rules
    # 8*3 (pokemon) + 8*3 (energy) + 12 (trainer) = 24 + 24 + 12 = 60
    
    return Deck(deck_cards)

def main():
    print("Welcome to the Pokémon Trading Card Game!")
    
    ui_choice = ""
    while ui_choice.lower() not in ['cli', 'gui']:
        ui_choice = input("Choose your interface: 'CLI' or 'GUI': ")

    # Create decks
    deck1 = create_sample_deck()
    deck2 = create_sample_deck()

    # Create players
    player1 = Player(name="Ash", deck=deck1)
    player2 = AIPlayer(name="Gary (AI)", deck=deck2)

    # Setup game engine
    game_engine = GameEngine([player1, player2])

    # Setup UI
    if ui_choice.lower() == 'gui':
        try:
            from ui.gui import GUI
            ui = GUI(game_engine)
        except ImportError as e:
            print(f"Could not import GUI. Error: {e}")
            print("Please make sure you have pygame installed (`pip install pygame`).")
            print("Falling back to CLI.")
            ui = CLI(game_engine)
    else:
        ui = CLI(game_engine)

    # Run the game
    ui.run()

if __name__ == "__main__":
    main()
