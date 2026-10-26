import pygame
import numpy as np
from typing import Optional, List, Dict

from game.game_engine import GameEngine, GamePhase
from game.player import Player
from game.card import Card, PokemonCard, EnergyCard, TrainerCard, Attack
from game.ai_player import AIPlayer

# Constants
SCREEN_WIDTH = 1280
SCREEN_HEIGHT = 720
BACKGROUND_COLOR = (0, 102, 0)  # Dark Green
PLAYER_AREA_COLOR = (0, 128, 0) # Green
TEXT_COLOR = (255, 255, 255)
HIGHLIGHT_COLOR = (255, 255, 0) # Yellow
CARD_WIDTH = 100
CARD_HEIGHT = 140
CARD_COLOR = (200, 200, 200)
BUTTON_COLOR = (100, 100, 200)
BUTTON_TEXT_COLOR = (255, 255, 255)

class SoundGenerator:
    def __init__(self):
        self.sounds: Dict[str, Optional[pygame.mixer.Sound]] = {}
        self.sample_rate = 44100
        self.audio_format = -16  # Signed 16-bit
        self.channels = 2  # Stereo, to match pygame's default mixer settings

    def _generate_tone(self, frequency, duration_ms, volume=0.1):
        """Generates a numpy array for a single tone, compatible with a stereo mixer."""
        num_samples = int(self.sample_rate * duration_ms / 1000.0)
        t = np.linspace(0, duration_ms / 1000.0, num_samples, False)
        
        # Generate a mono sine wave
        tone = np.sin(frequency * t * 2 * np.pi)
        
        # Normalize to 16-bit range and apply volume
        audio_mono = (tone * (2**15 - 1) * volume).astype(np.int16)
        
        # Convert mono to stereo by duplicating the channel
        audio_stereo = np.column_stack([audio_mono, audio_mono])
        
        return audio_stereo

    def load_sounds(self):
        try:
            pygame.mixer.init(self.sample_rate, self.audio_format, self.channels, 512)
        except pygame.error as e:
            print(f"Warning: Could not initialize pygame mixer. No sounds will be played. Error: {e}")
            return

        sound_definitions = {
            "click": {"func": self._generate_tone, "args": [1200, 50]},
            "attack": {"func": self._generate_tone, "args": [440, 200]},
            "place_card": {"func": self._generate_tone, "args": [880, 100]},
            "draw_card": {"func": self._generate_tone, "args": [1000, 75, 0.05]},
            "win": {"func": np.concatenate, "args": [[self._generate_tone(f, 100) for f in [523, 659, 784, 1046]]]},
            "lose": {"func": np.concatenate, "args": [[self._generate_tone(f, 150) for f in [523, 392, 330, 261]]]}
        }

        for key, definition in sound_definitions.items():
            try:
                sound_array = definition["func"](*definition["args"])
                self.sounds[key] = pygame.sndarray.make_sound(sound_array)
            except (ValueError, pygame.error) as e:
                print(f"Warning: Could not create sound '{key}'. Game will continue without it. Error: {e}")
                self.sounds[key] = None

    def play(self, key: str):
        if self.sounds.get(key):
            try:
                self.sounds[key].play()
            except pygame.error as e:
                print(f"Warning: Could not play sound '{key}'. Error: {e}")

class GUI:
    def __init__(self, game_engine: GameEngine):
        self.game_engine = game_engine
        self.screen: Optional[pygame.Surface] = None
        self.font: Optional[pygame.font.Font] = None
        self.running = False
        self.message = ""
        self.buttons: Dict[str, pygame.Rect] = {}
        self.selected_hand_card_index: Optional[int] = None
        self.selected_pokemon_on_field: Optional[PokemonCard] = None
        self.sound_generator = SoundGenerator()

    def init_pygame(self):
        try:
            pygame.init()
            self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
            pygame.display.set_caption("Pokémon TCG")
            self.font = pygame.font.Font(None, 24)
            self.sound_generator.load_sounds()
            self.running = True
        except pygame.error as e:
            print(f"Fatal Error: Could not initialize pygame. Error: {e}")
            self.running = False


    def run(self):
        self.init_pygame()
        
        if not self.running:
            return # Exit if pygame initialization failed

        try:
            self.game_engine.setup_game()

            if self.game_engine.game_phase != GamePhase.GAME_OVER:
                self.setup_phase_gui()

            if self.game_engine.game_phase != GamePhase.GAME_OVER:
                self.game_engine.start_turn()
                self.sound_generator.play("draw_card")

            while self.running:
                for event in pygame.event.get():
                    if event.type == pygame.QUIT:
                        self.running = False
                    if event.type == pygame.MOUSEBUTTONDOWN:
                        self.handle_click(event.pos)

                self.update()
                self.draw()
        finally:
            pygame.quit()

    def setup_phase_gui(self):
        # Handle AI setup first
        for player in self.game_engine.players:
            if isinstance(player, AIPlayer):
                if not player.choose_active_pokemon_ai(self.game_engine):
                    self.message = f"AI {player.name} has no Basic Pokémon. Mulligan!"
                    self.game_engine.game_phase = GamePhase.GAME_OVER
                    return
        
        # Handle human player setup
        player = self.game_engine.players[0] # Assuming player 1 is human
        basic_pokemon_in_hand = [card for card in player.hand if isinstance(card, PokemonCard) and card.stage == 0]
        
        if not basic_pokemon_in_hand:
            self.message = "You have no Basic Pokémon in your hand! Mulligan!"
            self.game_engine.game_phase = GamePhase.GAME_OVER
            return

        self.message = "Choose your Active Pokémon from your hand."
        chosen = False
        while not chosen and self.running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                if event.type == pygame.MOUSEBUTTONDOWN:
                    self.sound_generator.play("click")
                    clicked_card_index = self.get_clicked_hand_card_index(player, event.pos)
                    if clicked_card_index is not None:
                        card = player.hand[clicked_card_index]
                        if isinstance(card, PokemonCard) and card.stage == 0:
                            if self.game_engine.set_active_pokemon(player, card):
                                self.sound_generator.play("place_card")
                                self.message = f"You chose {card.name} as your Active Pokémon."
                                chosen = True
                                break
            self.draw() # Keep drawing the scene while in this loop
        
    def update(self):
        current_player = self.game_engine.get_current_player()
        if isinstance(current_player, AIPlayer) and self.game_engine.game_phase == GamePhase.PLAYER_TURN:
            if not current_player.active_pokemon:
                current_player.promote_pokemon_ai(self.game_engine)
                if not current_player.active_pokemon:
                    self.game_engine.check_win_conditions()
                    return
            current_player.take_turn_ai(self.game_engine)
            self.sound_generator.play("draw_card") # AI draws a card
            self.message = f"{current_player.name} is taking their turn..."
            self.draw() # Redraw to show AI's move
            pygame.time.wait(1000) # Pause to see AI's actions

    def handle_click(self, pos):
        player = self.game_engine.get_current_player()
        if isinstance(player, AIPlayer):
            return # Ignore clicks during AI's turn

        self.sound_generator.play("click")

        # Check if a button was clicked
        for action, rect in self.buttons.items():
            if rect.collidepoint(pos):
                self.handle_action_button(action)
                return

        # Check if a card in hand was clicked
        clicked_card_index = self.get_clicked_hand_card_index(player, pos)
        if clicked_card_index is not None:
            self.selected_hand_card_index = clicked_card_index
            self.selected_pokemon_on_field = None # Deselect field pokemon
            self.message = f"Selected {player.hand[clicked_card_index].name} from hand."
            return

        # Check if a pokemon on the field was clicked
        clicked_pokemon = self.get_clicked_field_pokemon(player, pos)
        if clicked_pokemon is not None:
            self.handle_field_pokemon_click(clicked_pokemon)
            return

    def handle_field_pokemon_click(self, pokemon: PokemonCard):
        player = self.game_engine.get_current_player()
        
        if self.selected_hand_card_index is not None:
            card_from_hand = player.hand[self.selected_hand_card_index]
            if isinstance(card_from_hand, EnergyCard):
                if self.game_engine.attach_energy(player, card_from_hand, pokemon):
                    self.sound_generator.play("place_card")
                    self.message = f"Attached {card_from_hand.name} to {pokemon.name}."
                    self.selected_hand_card_index = None
                else:
                    self.message = "Cannot attach energy. Already attached or invalid target."
            elif isinstance(card_from_hand, TrainerCard) and card_from_hand.name == "Potion":
                 if self.game_engine.play_trainer_card(player, card_from_hand, pokemon):
                    self.sound_generator.play("place_card")
                    self.message = f"Used {card_from_hand.name} on {pokemon.name}."
                    self.selected_hand_card_index = None
                 else:
                    self.message = "Could not use Potion."
            else:
                self.selected_pokemon_on_field = pokemon
                self.selected_hand_card_index = None
                self.message = f"Selected {pokemon.name} on the field."
        else:
            self.selected_pokemon_on_field = pokemon
            self.selected_hand_card_index = None
            self.message = f"Selected {pokemon.name} on the field."


    def handle_action_button(self, action: str):
        player = self.game_engine.get_current_player()

        if action == "Play Pokémon to Bench":
            if self.selected_hand_card_index is not None:
                card = player.hand[self.selected_hand_card_index]
                if isinstance(card, PokemonCard):
                    if self.game_engine.play_pokemon_to_bench(player, card):
                        self.sound_generator.play("place_card")
                        self.message = f"Played {card.name} to bench."
                        self.selected_hand_card_index = None
                    else:
                        self.message = "Cannot play this Pokémon to the bench. Is it a Basic Pokémon? Is the bench full?"
                else:
                    self.message = "Select a Pokémon card to play."
            else:
                self.message = "Select a card from your hand first."

        elif action == "Attack":
            if player.active_pokemon:
                success, message = self.game_engine.attack()
                if success:
                    self.sound_generator.play("attack")
                self.message = message
                self.selected_pokemon_on_field = None
                self.selected_hand_card_index = None
            else:
                self.message = "You have no active Pokémon to attack with."

        elif action == "Retreat":
            if player.active_pokemon and self.selected_pokemon_on_field and self.selected_pokemon_on_field in player.bench:
                if self.game_engine.retreat(player, self.selected_pokemon_on_field):
                    self.sound_generator.play("place_card")
                    self.message = f"Retreated {player.active_pokemon.name}, {self.selected_pokemon_on_field.name} is now active."
                    self.selected_pokemon_on_field = None
                else:
                    self.message = "Retreat failed. Check retreat cost or if you already retreated."
            else:
                self.message = "To retreat, select your active Pokémon, then select a benched Pokémon to promote."

        elif action == "End Turn":
            self.game_engine.end_turn()
            self.sound_generator.play("draw_card")
            self.message = f"Turn ended. It's now {self.game_engine.get_current_player().name}'s turn."
            self.selected_hand_card_index = None
            self.selected_pokemon_on_field = None
        
        opponent = self.game_engine.get_opponent()
        if not opponent.active_pokemon and opponent.bench:
            if isinstance(opponent, AIPlayer):
                opponent.promote_pokemon_ai(self.game_engine)
            else:
                self.promote_pokemon_gui(opponent)
        
        if self.game_engine.check_win_conditions():
            self.message = f"Game Over! {self.game_engine.get_current_player().name} wins!"
            if self.game_engine.get_current_player() is self.game_engine.players[0]:
                self.sound_generator.play("win")
            else:
                self.sound_generator.play("lose")
            self.game_engine.game_phase = GamePhase.GAME_OVER


    def draw(self):
        if not self.screen or not self.font:
            return
        self.screen.fill(BACKGROUND_COLOR)
        self.draw_player_areas()
        human_player = self.game_engine.players[0]
        opponent_player = self.game_engine.players[1]
        self.draw_player_state(human_player, is_opponent=False)
        self.draw_player_state(opponent_player, is_opponent=True)
        if self.game_engine.game_phase == GamePhase.PLAYER_TURN and not isinstance(self.game_engine.get_current_player(), AIPlayer):
            self.draw_buttons()
        self.draw_message_bar()
        pygame.display.flip()

    def draw_player_areas(self):
        pygame.draw.rect(self.screen, PLAYER_AREA_COLOR, (0, 0, SCREEN_WIDTH, SCREEN_HEIGHT // 2))
        pygame.draw.rect(self.screen, PLAYER_AREA_COLOR, (0, SCREEN_HEIGHT // 2, SCREEN_WIDTH, SCREEN_HEIGHT // 2))
        pygame.draw.line(self.screen, TEXT_COLOR, (0, SCREEN_HEIGHT // 2), (SCREEN_WIDTH, SCREEN_HEIGHT // 2), 2)

    def draw_player_state(self, player: Player, is_opponent: bool):
        if is_opponent:
            active_y = SCREEN_HEIGHT // 2 - CARD_HEIGHT - 10
            bench_y = active_y - CARD_HEIGHT - 10
            hand_y = 10
        else:
            active_y = SCREEN_HEIGHT // 2 + 10
            bench_y = active_y + CARD_HEIGHT + 10
            hand_y = SCREEN_HEIGHT - CARD_HEIGHT - 10

        if player.active_pokemon:
            is_selected = (self.selected_pokemon_on_field == player.active_pokemon)
            self.draw_card(player.active_pokemon, SCREEN_WIDTH // 2 - CARD_WIDTH // 2, active_y, is_selected=is_selected)

        bench_width = len(player.bench) * (CARD_WIDTH + 10)
        start_x = (SCREEN_WIDTH // 2) - bench_width // 2
        for i, card in enumerate(player.bench):
            is_selected = (self.selected_pokemon_on_field == card)
            self.draw_card(card, start_x + i * (CARD_WIDTH + 10), bench_y, is_selected=is_selected)

        if not is_opponent:
            self.draw_hand(player, hand_y)
        else:
            self.draw_hand(player, hand_y)

        self.draw_deck_discard_prizes(player, is_opponent)

    def draw_card(self, card: Card, x: int, y: int, is_selected: bool = False):
        card_rect = pygame.Rect(x, y, CARD_WIDTH, CARD_HEIGHT)
        original_clip = self.screen.get_clip()
        self.screen.set_clip(card_rect.clip(original_clip))
        pygame.draw.rect(self.screen, CARD_COLOR, card_rect)
        if is_selected:
            pygame.draw.rect(self.screen, HIGHLIGHT_COLOR, card_rect, 3)
        
        if self.font:
            name_text = self.font.render(card.name, True, (0,0,0))
            self.screen.blit(name_text, (x + 5, y + 5))
            if isinstance(card, PokemonCard):
                hp_text = self.font.render(f"HP: {card.hp}", True, (255,0,0))
                self.screen.blit(hp_text, (x + 5, y + 25))
                dmg_text = self.font.render(f"DMG: {card.damage_counters}", True, (255,0,0))
                self.screen.blit(dmg_text, (x + 5, y + 45))
                energy = "".join([f"[{e.energy_type[0]}]" for e in card.energy_attached])
                energy_text = self.font.render(energy, True, (0,0,255))
                self.screen.blit(energy_text, (x + 5, y + 65))
            elif isinstance(card, EnergyCard):
                type_text = self.font.render(f"Type: {card.energy_type}", True, (0,0,0))
                self.screen.blit(type_text, (x+5, y+25))
            elif isinstance(card, TrainerCard):
                type_text = self.font.render(f"Type: {card.trainer_type.value}", True, (0,0,0))
                self.screen.blit(type_text, (x+5, y+25))
        self.screen.set_clip(original_clip)

    def draw_hand(self, player: Player, y: int):
        if not self.font: return
        is_human = not isinstance(player, AIPlayer)
        if not player.hand: return
        
        hand_width = (len(player.hand) - 1) * (CARD_WIDTH // 2) + CARD_WIDTH
        start_x = (SCREEN_WIDTH // 2) - hand_width // 2
        
        if is_human:
            for i, card in enumerate(player.hand):
                x_pos = start_x + i * (CARD_WIDTH // 2)
                is_selected = (self.selected_hand_card_index == i)
                self.draw_card(card, x_pos, y, is_selected=is_selected)
        else:
            for i in range(len(player.hand)):
                x_pos = start_x + i * (CARD_WIDTH // 2)
                rect = pygame.Rect(x_pos, y, CARD_WIDTH, CARD_HEIGHT)
                pygame.draw.rect(self.screen, (100, 100, 100), rect)
                pygame.draw.rect(self.screen, (0,0,0), rect, 2)

    def draw_deck_discard_prizes(self, player: Player, is_opponent: bool):
        if not self.font: return
        y_pos = 10 if is_opponent else SCREEN_HEIGHT - CARD_HEIGHT - 10
        deck_rect = pygame.Rect(20, y_pos, CARD_WIDTH, CARD_HEIGHT)
        pygame.draw.rect(self.screen, (50, 50, 150), deck_rect)
        text = self.font.render(f"Deck: {len(player.deck.cards)}", True, TEXT_COLOR)
        self.screen.blit(text, (30, y_pos + 50))
        discard_rect = pygame.Rect(140, y_pos, CARD_WIDTH, CARD_HEIGHT)
        pygame.draw.rect(self.screen, (150, 50, 50), discard_rect)
        text = self.font.render(f"Discard: {len(player.discard_pile)}", True, TEXT_COLOR)
        self.screen.blit(text, (150, y_pos + 50))
        prize_rect = pygame.Rect(SCREEN_WIDTH - CARD_WIDTH - 20, y_pos, CARD_WIDTH, CARD_HEIGHT)
        pygame.draw.rect(self.screen, (200, 200, 50), prize_rect)
        text = self.font.render(f"Prizes: {len(player.prize_cards)}", True, (0,0,0))
        self.screen.blit(text, (SCREEN_WIDTH - CARD_WIDTH - 10, y_pos + 50))

    def draw_buttons(self):
        if not self.font: return
        self.buttons = {}
        actions = ["Play Pokémon to Bench", "Attack", "Retreat", "End Turn"]
        button_width = 200
        button_height = 40
        start_x = SCREEN_WIDTH - button_width - 20
        start_y = SCREEN_HEIGHT // 2 - (len(actions) * (button_height + 10)) // 2
        
        for i, action in enumerate(actions):
            rect = pygame.Rect(start_x, start_y + i * (button_height + 10), button_width, button_height)
            self.buttons[action] = rect
            pygame.draw.rect(self.screen, BUTTON_COLOR, rect)
            text = self.font.render(action, True, BUTTON_TEXT_COLOR)
            text_rect = text.get_rect(center=rect.center)
            self.screen.blit(text, text_rect)

    def draw_message_bar(self):
        if not self.font: return
        bar_rect = pygame.Rect(0, SCREEN_HEIGHT - 30, SCREEN_WIDTH, 30)
        pygame.draw.rect(self.screen, (50, 50, 50), bar_rect)
        message_text = self.font.render(self.message, True, TEXT_COLOR)
        self.screen.blit(message_text, (10, SCREEN_HEIGHT - 25))

    def get_clicked_hand_card_index(self, player: Player, pos) -> Optional[int]:
        hand_y = SCREEN_HEIGHT - CARD_HEIGHT - 10
        if not player.hand: return None
        hand_width = (len(player.hand) - 1) * (CARD_WIDTH // 2) + CARD_WIDTH
        start_x = (SCREEN_WIDTH // 2) - hand_width // 2
        for i in range(len(player.hand) - 1, -1, -1):
            x_pos = start_x + i * (CARD_WIDTH // 2)
            clickable_width = CARD_WIDTH if i == len(player.hand) - 1 else CARD_WIDTH // 2
            card_rect = pygame.Rect(x_pos, hand_y, clickable_width, CARD_HEIGHT)
            if card_rect.collidepoint(pos):
                return i
        return None

    def get_clicked_field_pokemon(self, player: Player, pos) -> Optional[PokemonCard]:
        active_y = SCREEN_HEIGHT // 2 + 10
        if player.active_pokemon:
            rect = pygame.Rect(SCREEN_WIDTH // 2 - CARD_WIDTH // 2, active_y, CARD_WIDTH, CARD_HEIGHT)
            if rect.collidepoint(pos):
                return player.active_pokemon
        bench_y = active_y + CARD_HEIGHT + 10
        bench_width = len(player.bench) * (CARD_WIDTH + 10)
        start_x = (SCREEN_WIDTH // 2) - bench_width // 2
        for i, card in enumerate(player.bench):
            rect = pygame.Rect(start_x + i * (CARD_WIDTH + 10), bench_y, CARD_WIDTH, CARD_HEIGHT)
            if rect.collidepoint(pos):
                return card
        return None

    def promote_pokemon_gui(self, player: Player):
        self.message = f"{player.name}, choose a Pokémon to promote."
        chosen = False
        while not chosen and self.running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                if event.type == pygame.MOUSEBUTTONDOWN:
                    self.sound_generator.play("click")
                    clicked_pokemon = self.get_clicked_field_pokemon(player, event.pos)
                    if clicked_pokemon and clicked_pokemon in player.bench:
                        self.sound_generator.play("place_card")
                        player.active_pokemon = clicked_pokemon
                        player.bench.remove(clicked_pokemon)
                        self.message = f"{player.name} promoted {clicked_pokemon.name}."
                        chosen = True
                        break
            self.draw()
