import os
import sys
import pygame
from typing import List, Dict, Optional, Tuple, Union

from ui.base_ui import BaseUI
from core.player import Player
from core.board import Board
from core.property import PropertyGroup

# Constants
SCREEN_WIDTH = 1280
SCREEN_HEIGHT = 1024
BOARD_SIZE = 800
BOARD_OFFSET_X = (SCREEN_WIDTH - BOARD_SIZE) // 2
BOARD_OFFSET_Y = (SCREEN_HEIGHT - BOARD_SIZE) // 2
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GRAY = (200, 200, 200)
LIGHT_BLUE_BG = (204, 229, 255)

GROUP_COLORS = {
    PropertyGroup.BROWN: (149, 81, 51),
    PropertyGroup.LIGHT_BLUE: (173, 216, 230),
    PropertyGroup.PINK: (217, 59, 150),
    PropertyGroup.ORANGE: (247, 148, 29),
    PropertyGroup.RED: (237, 27, 36),
    PropertyGroup.YELLOW: (254, 242, 0),
    PropertyGroup.GREEN: (31, 178, 90),
    PropertyGroup.DARK_BLUE: (0, 114, 187),
    PropertyGroup.RAILROAD: (200, 200, 200),
    PropertyGroup.UTILITY: (210, 210, 210),
}

SPECIAL_COLORS = {
    "Chance": (200, 200, 255),
    "Community Chest": (255, 200, 200),
    "Income Tax": (180, 180, 180),
    "Luxury Tax": (180, 180, 180),
}

class PygameUI(BaseUI):
    """Pygame-based user interface for Monopoly game."""

    def __init__(self):
        super().__init__()
        pygame.init()
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("Monopoly")
        self.font = pygame.font.Font(None, 36)
        self.small_font = pygame.font.Font(None, 20)
        self.board_surface = self._create_board_surface()

    def _draw_text_on_square(self, surface, text, position, rect):
        x, y, w, h = rect
        font = self.small_font
        is_side_row = (10 < position < 20) or (30 < position < 40)
        if is_side_row:
            font = pygame.font.Font(None, 16)
        words = text.split(' ')
        lines = []
        current_line = ""
        for word in words:
            if font.size(current_line + " " + word)[0] < (w - 4):
                current_line += " " + word
            else:
                if current_line: lines.append(current_line.strip())
                current_line = word
        if current_line: lines.append(current_line.strip())
        line_height = font.get_linesize()
        total_text_height = len(lines) * line_height
        v_offset = (h - total_text_height) // 2
        for i, line in enumerate(lines):
            line_surf = font.render(line, True, BLACK)
            line_rect = line_surf.get_rect(center=(x + w // 2, y + v_offset + i * line_height))
            surface.blit(line_surf, line_rect)

    def _create_board_surface(self):
        try:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            image_path = os.path.join(script_dir, '..', 'board.png')
            board_image = pygame.image.load(image_path)
            board_surface = pygame.transform.scale(board_image, (BOARD_SIZE, BOARD_SIZE))
        except (pygame.error, FileNotFoundError):
            board_surface = pygame.Surface((BOARD_SIZE, BOARD_SIZE))
            board_surface.fill(LIGHT_BLUE_BG)
            temp_board = Board()
            for i in range(40):
                x, y, w, h = self._get_square_rect(i)
                space_name = temp_board.get_space_name(i)
                prop = temp_board.get_property_at_position(i)
                bg_color = WHITE
                if prop:
                    bg_color = GROUP_COLORS.get(prop.group, WHITE)
                elif space_name in SPECIAL_COLORS:
                    bg_color = SPECIAL_COLORS[space_name]
                pygame.draw.rect(board_surface, bg_color, (x, y, w, h))
                pygame.draw.rect(board_surface, BLACK, (x, y, w, h), 2)
                self._draw_text_on_square(board_surface, space_name, i, (x, y, w, h))
        return board_surface

    def _get_square_rect(self, position):
        side_length = BOARD_SIZE // 11
        if 0 <= position <= 10:
            x = BOARD_SIZE - side_length - (position * side_length)
            y = BOARD_SIZE - side_length
        elif 11 <= position <= 20:
            x = 0
            y = BOARD_SIZE - side_length - ((position - 10) * side_length)
        elif 21 <= position <= 30:
            x = (position - 20) * side_length
            y = 0
        else:
            x = BOARD_SIZE - side_length
            y = (position - 30) * side_length
        return x, y, side_length, side_length

    def clear_screen(self):
        self.screen.fill(GRAY)

    def display_welcome(self) -> str:
        self.clear_screen()
        title_text = self.font.render("Welcome to Monopoly!", True, BLACK)
        title_rect = title_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 100))
        self.screen.blit(title_text, title_rect)
        new_game_button = pygame.Rect(SCREEN_WIDTH // 2 - 100, SCREEN_HEIGHT // 2, 200, 50)
        load_game_button = pygame.Rect(SCREEN_WIDTH // 2 - 100, SCREEN_HEIGHT // 2 + 70, 200, 50)
        pygame.draw.rect(self.screen, GRAY, new_game_button)
        pygame.draw.rect(self.screen, GRAY, load_game_button)
        new_game_text = self.font.render("New Game", True, BLACK)
        load_game_text = self.font.render("Load Game", True, BLACK)
        self.screen.blit(new_game_text, new_game_text.get_rect(center=new_game_button.center))
        self.screen.blit(load_game_text, load_game_text.get_rect(center=load_game_button.center))
        pygame.display.flip()
        while True:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                if event.type == pygame.MOUSEBUTTONDOWN:
                    if new_game_button.collidepoint(event.pos):
                        return "new"
                    if load_game_button.collidepoint(event.pos):
                        return "load"

    def get_player_names(self) -> List[Union[str, Dict[str, str]]]:
        players = []
        num_players = 2
        friendly_names = ["John", "Kang", "Peng", "Luke"]
        input_box = pygame.Rect(SCREEN_WIDTH // 2 - 100, SCREEN_HEIGHT // 2 - 25, 200, 50)
        color_inactive = pygame.Color('lightskyblue3')
        color_active = pygame.Color('dodgerblue2')
        color = color_inactive
        active = False
        text = str(num_players)
        prompt_text = self.font.render("Enter number of players (2-4):", True, BLACK)
        prompt_rect = prompt_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 60))
        done = False
        while not done:
            for event in pygame.event.get():
                if event.type == pygame.QUIT: pygame.quit(); sys.exit()
                if event.type == pygame.MOUSEBUTTONDOWN:
                    active = input_box.collidepoint(event.pos)
                    color = color_active if active else color_inactive
                if event.type == pygame.KEYDOWN and active:
                    if event.key == pygame.K_RETURN:
                        try:
                            num = int(text)
                            if 2 <= num <= 4: num_players = num; done = True
                        except ValueError: pass
                    elif event.key == pygame.K_BACKSPACE: text = text[:-1]
                    else: text += event.unicode
            self.screen.fill(GRAY)
            self.screen.blit(prompt_text, prompt_rect)
            txt_surface = self.font.render(text, True, color)
            input_box.w = max(200, txt_surface.get_width()+10)
            self.screen.blit(txt_surface, (input_box.x+5, input_box.y+5))
            pygame.draw.rect(self.screen, color, input_box, 2)
            pygame.display.flip()
        for i in range(num_players):
            name = friendly_names[i % len(friendly_names)]
            player_type = "human"
            prompt_text = self.font.render(f"Configure Player {i+1}:", True, BLACK)
            name_input_box = pygame.Rect(SCREEN_WIDTH // 2 - 150, SCREEN_HEIGHT // 2 - 25, 300, 50)
            human_button = pygame.Rect(SCREEN_WIDTH // 2 - 150, SCREEN_HEIGHT // 2 + 50, 140, 50)
            ai_button = pygame.Rect(SCREEN_WIDTH // 2 + 10, SCREEN_HEIGHT // 2 + 50, 140, 50)
            next_button = pygame.Rect(SCREEN_WIDTH // 2 - 75, SCREEN_HEIGHT // 2 + 120, 150, 50)
            done = False
            active = True
            while not done:
                for event in pygame.event.get():
                    if event.type == pygame.QUIT: pygame.quit(); sys.exit()
                    if event.type == pygame.MOUSEBUTTONDOWN:
                        if human_button.collidepoint(event.pos): player_type = "human"
                        elif ai_button.collidepoint(event.pos): player_type = "ai"
                        elif next_button.collidepoint(event.pos):
                            if name.strip(): done = True
                    if event.type == pygame.KEYDOWN and active:
                        if event.key == pygame.K_RETURN:
                            if name.strip(): done = True
                        elif event.key == pygame.K_BACKSPACE: name = name[:-1]
                        else: name += event.unicode
                self.screen.fill(GRAY)
                self.screen.blit(prompt_text, prompt_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 60)))
                pygame.draw.rect(self.screen, color_active, name_input_box, 2)
                txt_surface = self.font.render(name, True, BLACK)
                self.screen.blit(txt_surface, (name_input_box.x + 5, name_input_box.y + 5))
                pygame.draw.rect(self.screen, color_active if player_type == "human" else color_inactive, human_button)
                pygame.draw.rect(self.screen, color_active if player_type == "ai" else color_inactive, ai_button)
                human_text = self.font.render("Human", True, BLACK)
                ai_text = self.font.render("AI", True, BLACK)
                self.screen.blit(human_text, human_text.get_rect(center=human_button.center))
                self.screen.blit(ai_text, ai_text.get_rect(center=ai_button.center))
                pygame.draw.rect(self.screen, color_inactive, next_button)
                next_text = self.font.render("Next", True, BLACK)
                self.screen.blit(next_text, next_text.get_rect(center=next_button.center))
                pygame.display.flip()
            if player_type == "human":
                players.append(name)
            else:
                players.append({"name": name, "difficulty": "medium"})
        return players

    def display_game_state(self):
        self.clear_screen()
        self.screen.blit(self.board_surface, (BOARD_OFFSET_X, BOARD_OFFSET_Y))
        if self.game:
            for i in range(40):
                prop = self.game.board.get_property_at_position(i)
                if prop and prop.owner:
                    owner_color = None
                    for p in self.game.players:
                        if p.name == prop.owner:
                            owner_color = p.token_color
                            break
                    if owner_color:
                        x, y, w, h = self._get_square_rect(i)
                        indicator_rect = pygame.Rect(BOARD_OFFSET_X + x, BOARD_OFFSET_Y + y, w, 10)
                        pygame.draw.rect(self.screen, owner_color, indicator_rect)
            for player in self.game.players:
                x, y, w, h = self._get_square_rect(player.position)
                player_x = BOARD_OFFSET_X + x + (w // 2) + (self.game.players.index(player) * 5)
                player_y = BOARD_OFFSET_Y + y + (h // 2) + (self.game.players.index(player) * 5)
                pygame.draw.circle(self.screen, player.token_color, (player_x, player_y), 10)
                pygame.draw.circle(self.screen, BLACK, (player_x, player_y), 10, 1)
            info_panel_x = BOARD_OFFSET_X + BOARD_SIZE + 20
            current_player = self.game.get_current_player()
            turn_text = f"Current Turn: {current_player.name}"
            text_surface = self.font.render(turn_text, True, BLACK)
            self.screen.blit(text_surface, (info_panel_x, BOARD_OFFSET_Y))
            y_offset = BOARD_OFFSET_Y + 50
            for player in self.game.players:
                is_current = player == current_player
                color = player.token_color if is_current else BLACK
                pygame.draw.rect(self.screen, player.token_color, (info_panel_x, y_offset, 20, 20))
                player_info = f"{player.name}: ${player.money}"
                text = self.small_font.render(player_info, True, color)
                self.screen.blit(text, (info_panel_x + 30, y_offset))
                y_offset += 30
        pygame.display.flip()

    def display_player_details(self, player: Player): pass
    def display_board_position(self, position: int): pass
    def get_player_action(self, prompt: str, valid_actions: List[str]) -> str: return ""

    def display_turn_menu(self) -> str:
        self.display_game_state() 
        menu_width = 200
        menu_height = 300
        margin = 20
        menu_rect = pygame.Rect(margin, BOARD_OFFSET_Y, menu_width, menu_height)
        pygame.draw.rect(self.screen, WHITE, menu_rect)
        pygame.draw.rect(self.screen, BLACK, menu_rect, 2)
        options = ["Roll Dice", "Manage Properties", "Save Game", "End Turn"]
        button_rects = []
        button_height = 50
        button_width = menu_width - (margin * 2)
        v_padding = 15
        for i, option in enumerate(options):
            text_surf = self.small_font.render(option, True, BLACK)
            button_y = menu_rect.y + v_padding + i * (button_height + v_padding)
            rect = pygame.Rect(menu_rect.x + margin, button_y, button_width, button_height)
            pygame.draw.rect(self.screen, GRAY, rect)
            text_rect = text_surf.get_rect(center=rect.center)
            self.screen.blit(text_surf, text_rect)
            button_rects.append(rect)
        pygame.display.flip()
        while True:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                if event.type == pygame.MOUSEBUTTONDOWN:
                    if event.button == 1:
                        for i, rect in enumerate(button_rects):
                            if rect.collidepoint(event.pos):
                                if i == 0: return "1"
                                if i == 1: return "5"
                                if i == 2: return "8"
                                if i == 3: return "end_turn"
        return ""

    def display_roll_result(self, player: Player, die1: int, die2: int, new_position: int):
        self.display_game_state()
        total_roll = die1 + die2
        space_name = self.game.board.get_space_name(new_position)
        
        message_line1 = f"{player.name} rolled {die1} + {die2} = {total_roll}."
        if die1 == die2:
            message_line1 += " (Doubles!)"
        message_line2 = f"Landed on {space_name}."

        text1 = self.font.render(message_line1, True, BLACK)
        text2 = self.font.render(message_line2, True, BLACK)
        
        self.screen.blit(text1, (20, SCREEN_HEIGHT - 120))
        self.screen.blit(text2, (20, SCREEN_HEIGHT - 80))
        
        pygame.display.flip()
        self.pause_for_continue()

    def display_property_purchase_prompt(self, property_name: str, price: int) -> bool:
        self.display_game_state()
        
        line1 = f"You landed on {property_name}, which is unowned."
        line2 = f"Do you want to buy it for ${price}?"
        
        text1 = self.font.render(line1, True, BLACK)
        text2 = self.font.render(line2, True, BLACK)
        self.screen.blit(text1, (20, SCREEN_HEIGHT - 120))
        self.screen.blit(text2, (20, SCREEN_HEIGHT - 80))

        yes_button = pygame.Rect(20, SCREEN_HEIGHT - 60, 100, 40)
        no_button = pygame.Rect(140, SCREEN_HEIGHT - 60, 100, 40)
        pygame.draw.rect(self.screen, (0, 255, 0), yes_button)
        pygame.draw.rect(self.screen, (255, 0, 0), no_button)
        yes_text = self.font.render("Yes", True, BLACK)
        no_text = self.font.render("No", True, BLACK)
        self.screen.blit(yes_text, (yes_button.x + 30, yes_button.y + 10))
        self.screen.blit(no_text, (no_button.x + 35, no_button.y + 10))
        pygame.display.flip()
        while True:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    return False
                if event.type == pygame.MOUSEBUTTONDOWN:
                    if yes_button.collidepoint(event.pos): return True
                    if no_button.collidepoint(event.pos): return False

    def display_rent_payment(self, player: Player, owner: str, amount: int, property_name: str):
        self.display_game_state()
        line1 = f"Rent due! You landed on {property_name}, owned by {owner}."
        line2 = f"{player.name} pays ${amount} in rent."
        
        text1 = self.font.render(line1, True, BLACK)
        text2 = self.font.render(line2, True, BLACK)
        self.screen.blit(text1, (20, SCREEN_HEIGHT - 120))
        self.screen.blit(text2, (20, SCREEN_HEIGHT - 80))

        pygame.display.flip()
        self.pause_for_continue()

    def display_insufficient_funds(self, player: Player, amount_needed: int):
        self.display_game_state()
        line1 = f"Insufficient funds! You need ${amount_needed} but only have ${player.money}."
        line2 = "You must sell assets or mortgage properties."
        
        text1 = self.font.render(line1, True, (255,0,0))
        text2 = self.font.render(line2, True, (255,0,0))
        self.screen.blit(text1, (20, SCREEN_HEIGHT - 120))
        self.screen.blit(text2, (20, SCREEN_HEIGHT - 80))

        pygame.display.flip()
        self.pause_for_continue()

    def display_bankruptcy(self, player: Player):
        self.display_game_state()
        line1 = f"!!! BANKRUPTCY !!!"
        line2 = f"{player.name} is out of the game!"
        
        text1 = self.font.render(line1, True, (255,0,0))
        text2 = self.font.render(line2, True, (255,0,0))
        self.screen.blit(text1, (20, SCREEN_HEIGHT - 120))
        self.screen.blit(text2, (20, SCREEN_HEIGHT - 80))

        pygame.display.flip()
        self.pause_for_continue()

    def display_winner(self, winner: str):
        self.display_game_state()
        line1 = f"*** GAME OVER ***"
        line2 = f"Congratulations, {winner}! You win!"
        
        text1 = self.font.render(line1, True, (0,150,0))
        text2 = self.font.render(line2, True, (0,150,0))
        self.screen.blit(text1, (20, SCREEN_HEIGHT - 120))
        self.screen.blit(text2, (20, SCREEN_HEIGHT - 80))

        pygame.display.flip()
        self.pause_for_continue()

    def display_all_players_status(self): pass
    def display_jail_options(self, player: Player) -> str:
        self.display_game_state()
        menu_width = 400
        menu_height = 300
        menu_rect = pygame.Rect(SCREEN_WIDTH // 2 - menu_width // 2, SCREEN_HEIGHT // 2 - menu_height // 2, menu_width, menu_height)
        pygame.draw.rect(self.screen, WHITE, menu_rect)
        pygame.draw.rect(self.screen, BLACK, menu_rect, 2)

        title = self.font.render(f"{player.name} is in Jail!", True, BLACK)
        self.screen.blit(title, (menu_rect.x + 20, menu_rect.y + 20))

        options = ["Roll for doubles"]
        if player.get_out_of_jail_free > 0:
            options.append("Use Get Out of Jail Free card")
        options.append("Pay $50 fine")
        
        button_rects = []
        button_height = 50
        button_width = menu_width - 40
        v_padding = 15
        for i, option in enumerate(options):
            text_surf = self.small_font.render(option, True, BLACK)
            button_y = menu_rect.y + 80 + i * (button_height + v_padding)
            rect = pygame.Rect(menu_rect.x + 20, button_y, button_width, button_height)
            pygame.draw.rect(self.screen, GRAY, rect)
            text_rect = text_surf.get_rect(center=rect.center)
            self.screen.blit(text_surf, text_rect)
            button_rects.append(rect)
        
        pygame.display.flip()

        while True:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
                    for i, rect in enumerate(button_rects):
                        if rect.collidepoint(event.pos):
                            choice_text = options[i]
                            if "Roll" in choice_text:
                                return "1"
                            elif "Use" in choice_text:
                                return "2"
                            elif "Pay" in choice_text:
                                return "3"
        return "1" # Default
    def display_house_building_menu(self, player: Player) -> Tuple[str, int]: return None, 0
    def display_property_selling_menu(self, player: Player) -> Tuple[str, int]: return None, 0

    def pause_for_continue(self):
        wait_text = self.small_font.render("Click to continue...", True, BLACK)
        self.screen.blit(wait_text, (SCREEN_WIDTH - 200, SCREEN_HEIGHT - 40))
        pygame.display.flip()
        waiting = True
        while waiting:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                if event.type == pygame.MOUSEBUTTONDOWN:
                    waiting = False
    
    def display_error(self, message: str):
        self.display_game_state()
        text = self.font.render(f"ERROR: {message}", True, (255,0,0))
        self.screen.blit(text, (20, SCREEN_HEIGHT - 100))
        pygame.display.flip()
        self.pause_for_continue()

    def display_success(self, message: str):
        """Display success message."""
        self.display_game_state()
        text = self.font.render(f"SUCCESS: {message}", True, (0,255,0))
        self.screen.blit(text, (20, SCREEN_HEIGHT - 100))
        pygame.display.flip()
        self.pause_for_continue()

    def display_load_game_menu(self, saved_games: List[str]) -> Optional[str]:
        """Displays a menu of saved games to load."""
        self.clear_screen()
        title_text = self.font.render("Select a game to load:", True, BLACK)
        title_rect = title_text.get_rect(center=(SCREEN_WIDTH // 2, 50))
        self.screen.blit(title_text, title_rect)

        if not saved_games:
            no_saves_text = self.small_font.render("No saved games found.", True, BLACK)
            self.screen.blit(no_saves_text, (SCREEN_WIDTH // 2 - 100, 150))
            pygame.display.flip()
            pygame.time.wait(2000)
            return None

        button_rects = []
        v_padding = 15
        button_height = 50
        button_width = 400

        for i, filename in enumerate(saved_games):
            text_surf = self.small_font.render(filename, True, BLACK)
            button_y = 100 + i * (button_height + v_padding)
            rect = pygame.Rect(SCREEN_WIDTH // 2 - button_width // 2, button_y, button_width, button_height)
            pygame.draw.rect(self.screen, GRAY, rect)
            text_rect = text_surf.get_rect(center=rect.center)
            self.screen.blit(text_surf, text_rect)
            button_rects.append(rect)

        pygame.display.flip()

        while True:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                if event.type == pygame.MOUSEBUTTONDOWN:
                    if event.button == 1:
                        for i, rect in enumerate(button_rects):
                            if rect.collidepoint(event.pos):
                                return saved_games[i]
        return None