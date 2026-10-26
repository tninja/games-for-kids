from game.game_engine import GameEngine, GamePhase
from game.player import Player
from game.card import PokemonCard, EnergyCard, TrainerCard
from game.ai_player import AIPlayer

class CLI:
    def __init__(self, game_engine: GameEngine):
        self.game_engine = game_engine

    def display_card(self, card):
        if isinstance(card, PokemonCard):
            energy = "".join([f"[{e.energy_type[0]}]" for e in card.energy_attached])
            return f"{card.name} (HP: {card.hp}, DMG: {card.damage_counters}) {energy}"
        return card.name

    def display_board(self):
        player = self.game_engine.get_current_player()
        opponent = self.game_engine.get_opponent()

        is_human_turn = not hasattr(player, 'is_ai')
        your_player = player if is_human_turn else opponent
        opponent_player = opponent if is_human_turn else player
        
        print("\n" + "="*50)
        print(f"OPPONENT: {opponent_player.name}")
        print("-"*50)

        opp_active = self.display_card(opponent_player.active_pokemon) if opponent_player.active_pokemon else "None"
        print(f"Active: {opp_active}")
        print(f"Bench: {len(opponent_player.bench)} | Hand: {len(opponent_player.hand)} | Prizes: {len(opponent_player.prize_cards)}")

        print("\n" + "-"*20 + " BATTLEFIELD " + "-"*20 + "\n")

        p_active = self.display_card(your_player.active_pokemon) if your_player.active_pokemon else "None"
        print(f"YOUR ACTIVE: {p_active}")
        
        benched_pokemon = [self.display_card(p) for p in your_player.bench]
        print(f"YOUR BENCH: {', '.join(benched_pokemon) if benched_pokemon else 'Empty'}")
        print(f"YOUR HAND: {len(your_player.hand)} | Prizes: {len(your_player.prize_cards)}")
        print("="*50 + "\n")

    def display_hand(self, player: Player):
        print(f"Your hand ({len(player.hand)} cards):")
        if not player.hand:
            print("  (Empty)")
            return
        for i, card in enumerate(player.hand):
            print(f"  {i+1}. {self.display_card(card)}")

    def get_player_action(self):
        player = self.game_engine.get_current_player()

        if isinstance(player, AIPlayer):
            # Check if AI needs to promote a pokemon
            if not player.active_pokemon:
                player.promote_pokemon_ai(self.game_engine)
                if not player.active_pokemon: # if promotion failed
                    self.game_engine.check_win_conditions()
                    return
            player.take_turn_ai(self.game_engine)
            return

        # Human player logic
        if not player.active_pokemon:
            self.promote_pokemon_cli(player)
            if not player.active_pokemon: # if promotion failed
                self.game_engine.check_win_conditions()
                return

        while self.game_engine.game_phase == GamePhase.PLAYER_TURN:
            print(f"It's your turn, {player.name}. Choose an action:")
            print("  1. View Hand")
            print("  2. Play Pokémon to Bench")
            print("  3. Attach Energy")
            print("  4. Play Trainer Card")
            print("  5. Retreat")
            print("  6. Attack")
            print("  7. End Turn")
            
            choice = input("> ")
            if choice == "1":
                self.display_hand(player)
            elif choice == "2":
                self.play_pokemon_to_bench_cli()
            elif choice == "3":
                self.attach_energy_cli()
            elif choice == "4":
                self.play_trainer_card_cli()
            elif choice == "5":
                self.retreat_cli()
            elif choice == "6":
                self.game_engine.attack()
                break 
            elif choice == "7":
                self.game_engine.end_turn()
                break
            else:
                print("Invalid choice.")

    def select_pokemon_from_field_cli(self, player, include_active=True, include_bench=True, prompt="Select a Pokémon"):
        """Helper to select a pokemon from the player's field."""
        options = {}
        idx = 1
        if include_active and player.active_pokemon:
            options[idx] = player.active_pokemon
            idx += 1
        if include_bench:
            for p in player.bench:
                options[idx] = p
                idx += 1
        
        if not options:
            print("No Pokémon to select.")
            return None

        print(prompt)
        for i, p in options.items():
            print(f"  {i}. {self.display_card(p)}")

        while True:
            try:
                choice = int(input("Enter number (or 0 to cancel): "))
                if choice == 0: return None
                if choice in options:
                    return options[choice]
                else:
                    print("Invalid selection.")
            except ValueError:
                print("Invalid input.")

    def play_pokemon_to_bench_cli(self):
        player = self.game_engine.get_current_player()
        self.display_hand(player)
        
        options = {i + 1: card for i, card in enumerate(player.hand) if isinstance(card, PokemonCard) and card.stage == 0}
        if not options:
            print("You have no Basic Pokémon in your hand to play.")
            return

        if len(player.bench) >= 5:
            print("Your bench is full.")
            return

        print("Select a Pokémon to play to your bench:")
        for i, card in options.items():
            print(f"  {i}. {self.display_card(card)}")

        while True:
            try:
                choice = int(input("Enter number (or 0 to cancel): "))
                if choice == 0: return
                if choice in options:
                    self.game_engine.play_pokemon_to_bench(player, options[choice])
                    return
                else:
                    print("Invalid selection.")
            except ValueError:
                print("Invalid input.")

    def attach_energy_cli(self):
        player = self.game_engine.get_current_player()
        if player.energy_attached_this_turn:
            print("You've already attached an energy this turn.")
            return

        self.display_hand(player)
        energy_options = {i + 1: card for i, card in enumerate(player.hand) if isinstance(card, EnergyCard)}
        if not energy_options:
            print("You have no Energy cards in your hand.")
            return

        print("Select an Energy card to attach:")
        for i, card in energy_options.items():
            print(f"  {i}. {self.display_card(card)}")
        
        energy_choice = None
        while True:
            try:
                choice = int(input("Enter number (or 0 to cancel): "))
                if choice == 0: return
                if choice in energy_options:
                    energy_choice = energy_options[choice]
                    break
                else:
                    print("Invalid selection.")
            except ValueError:
                print("Invalid input.")
        
        target_pokemon = self.select_pokemon_from_field_cli(player, prompt="Select a Pokémon to attach the energy to:")
        if target_pokemon:
            self.game_engine.attach_energy(player, energy_choice, target_pokemon)

    def play_trainer_card_cli(self):
        player = self.game_engine.get_current_player()
        self.display_hand(player)
        trainer_options = {i + 1: card for i, card in enumerate(player.hand) if isinstance(card, TrainerCard)}
        if not trainer_options:
            print("You have no Trainer cards in your hand.")
            return

        print("Select a Trainer card to play:")
        for i, card in trainer_options.items():
            print(f"  {i}. {self.display_card(card)}")

        trainer_choice = None
        while True:
            try:
                choice = int(input("Enter number (or 0 to cancel): "))
                if choice == 0: return
                if choice in trainer_options:
                    trainer_choice = trainer_options[choice]
                    break
                else:
                    print("Invalid selection.")
            except ValueError:
                print("Invalid input.")

        target = None
        if trainer_choice.name == "Potion":
            target = self.select_pokemon_from_field_cli(player, prompt="Select a Pokémon to use the Potion on:")
        
        if target:
            self.game_engine.play_trainer_card(player, trainer_choice, target)
        elif trainer_choice.name == "Potion" and not target:
            print("Canceled using Potion.")
        else: # For trainer cards that don't need a target
            self.game_engine.play_trainer_card(player, trainer_choice)

    def retreat_cli(self):
        player = self.game_engine.get_current_player()
        active_pokemon = player.active_pokemon
        
        if player.has_retreated_this_turn:
            print("You have already retreated this turn.")
            return

        if not active_pokemon:
            print("You have no active Pokémon to retreat.")
            return

        if not player.bench:
            print("You have no Pokémon on your bench to switch to.")
            return

        cost = active_pokemon.retreat_cost
        if len(active_pokemon.energy_attached) < cost:
            print(f"You don't have enough energy to retreat. Cost: {cost}")
            return

        print(f"Retreating {active_pokemon.name} will cost {cost} energy.")
        # This simplified version automatically discards the required energy.
        # A full version would let the user choose which energy to discard.

        pokemon_to_promote = self.select_pokemon_from_field_cli(player, include_active=False, prompt="Choose a Pokémon to promote from your bench:")
        if not pokemon_to_promote:
            print("Retreat canceled.")
            return

        self.game_engine.retreat(player, pokemon_to_promote)

    def promote_pokemon_cli(self, player):
        print("Your Active Pokémon was knocked out!")
        if not player.bench:
            print("You have no Pokémon on your bench to promote.")
            return

        target = self.select_pokemon_from_field_cli(player, include_active=False, prompt="Choose a Pokémon to promote to the Active position:")
        if target:
            player.active_pokemon = target
            player.bench.remove(target)

    def setup_phase_cli(self):
        print("--- SETUP PHASE ---")
        for player in self.game_engine.players:
            if isinstance(player, AIPlayer):
                print(f"\nAI player {player.name} is choosing its Active Pokémon...")
                if not player.choose_active_pokemon_ai(self.game_engine):
                    print(f"AI {player.name} has no Basic Pokémon and would take a mulligan.")
                    self.game_engine.game_phase = GamePhase.GAME_OVER
                    return
                continue

            while True:
                print(f"\n{player.name}, choose your Active Pokémon.")
                self.display_hand(player)
                
                basic_pokemon_in_hand = {i + 1: card for i, card in enumerate(player.hand) if isinstance(card, PokemonCard) and card.stage == 0}
                if not basic_pokemon_in_hand:
                    print(f"You have no Basic Pokémon in your hand! This would be a mulligan.")
                    self.game_engine.game_phase = GamePhase.GAME_OVER
                    return

                try:
                    choice = int(input("Enter the number of the Pokémon to be your Active Pokémon: "))
                    if choice in basic_pokemon_in_hand:
                        if self.game_engine.set_active_pokemon(player, basic_pokemon_in_hand[choice]):
                            break
                    else:
                        print("Invalid choice.")
                except ValueError:
                    print("Please enter a number.")
        
    def run(self):
        self.game_engine.setup_game()
        if self.game_engine.game_phase == GamePhase.GAME_OVER:
            return
            
        self.setup_phase_cli()
        if self.game_engine.game_phase == GamePhase.GAME_OVER:
            return

        self.game_engine.start_turn()

        while self.game_engine.game_phase != GamePhase.GAME_OVER:
            self.display_board()
            self.get_player_action()
        
        print("--- GAME OVER ---")
