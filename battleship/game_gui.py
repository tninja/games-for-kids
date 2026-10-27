import pygame
import sys
from game import Game, HumanPlayer, ComputerPlayer

# Initialize Pygame
pygame.init()

# Constants
WINDOW_SIZE = 1000
GRID_SIZE = 7
CELL_SIZE = 50
MARGIN = 100
GRID_OFFSET = 50
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
BLUE = (0, 0, 255)
RED = (255, 0, 0)
GRAY = (128, 128, 128)
GREEN = (0, 255, 0)

class GameGUI:
    def __init__(self):
        self.screen = pygame.display.set_mode((WINDOW_SIZE, WINDOW_SIZE))
        pygame.display.set_caption("Battleship Game")
        self.font = pygame.font.Font(None, 36)
        self.game = Game(['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer'], (GRID_SIZE, GRID_SIZE))
        self.player = HumanPlayer("You", (GRID_SIZE, GRID_SIZE))
        self.computer = ComputerPlayer("Computer", (GRID_SIZE, GRID_SIZE))
        self.player.random_init(self.game.fleet_names)
        self.computer.random_init(self.game.fleet_names)
        self.game.add_players(self.player, self.computer)
        self.selected_cell = None
        self.game_over = False
        self.winner = None

    def draw_grid(self, offset_x, offset_y, is_player):
        # Draw grid labels
        for i in range(GRID_SIZE):
            # Draw row labels (A-G)
            label = self.font.render(chr(65 + i), True, BLACK)
            self.screen.blit(label, (offset_x - 30, offset_y + i * CELL_SIZE + CELL_SIZE // 2))
            # Draw column labels (1-7)
            label = self.font.render(str(i + 1), True, BLACK)
            self.screen.blit(label, (offset_x + i * CELL_SIZE + CELL_SIZE // 2, offset_y - 30))

        # Draw grid cells
        for i in range(GRID_SIZE):
            for j in range(GRID_SIZE):
                rect = pygame.Rect(offset_x + j * CELL_SIZE, offset_y + i * CELL_SIZE, CELL_SIZE, CELL_SIZE)
                pygame.draw.rect(self.screen, BLACK, rect, 1)

                if is_player:
                    # Draw player's ships and hits
                    cell_state = self.get_player_cell_state(i, j)
                else:
                    # Draw computer's known hits/misses
                    cell_state = self.get_computer_cell_state(i, j)

                if cell_state == 'ship':
                    pygame.draw.rect(self.screen, GRAY, rect)
                elif cell_state == 'hit':
                    pygame.draw.rect(self.screen, RED, rect)
                elif cell_state == 'miss':
                    pygame.draw.circle(self.screen, BLUE, rect.center, CELL_SIZE // 4)

    def get_player_cell_state(self, x, y):
        # Check if there's a ship at this location
        for fleet in self.player.fleet_group.fleets:
            if (x, y) in fleet.coordinates:
                if (x, y) in fleet.hits:
                    return 'hit'
                return 'ship'
        # Check if this location was hit but missed
        for hit in self.player.was_hit_history:
            if hit[0] == x and hit[1] == y:
                return 'miss'
        return None

    def get_computer_cell_state(self, x, y):
        for hit in self.player.hit_history:
            if hit[0] == x and hit[1] == y:
                return 'hit' if hit[2] else 'miss'
        return None

    def handle_click(self, pos):
        if self.game_over:
            return

        # Calculate grid cell from mouse position
        x = (pos[0] - (WINDOW_SIZE // 2 + GRID_OFFSET)) // CELL_SIZE
        y = (pos[1] - GRID_OFFSET) // CELL_SIZE

        if 0 <= x < GRID_SIZE and 0 <= y < GRID_SIZE:
            # Player's turn
            hit_result = self.player.hit(self.computer, y, x)  # Swap x,y to match game logic
            if self.computer.all_sunk():
                self.game_over = True
                self.winner = self.player.name
            else:
                # Computer's turn
                self.computer.input_and_hit(self.player)
                if self.player.all_sunk():
                    self.game_over = True
                    self.winner = self.computer.name

    def draw(self):
        self.screen.fill(WHITE)
        
        # Draw player's grid
        self.draw_grid(MARGIN, GRID_OFFSET, True)
        player_label = self.font.render("Your Fleet", True, BLACK)
        self.screen.blit(player_label, (MARGIN, 10))

        # Draw computer's grid
        self.draw_grid(WINDOW_SIZE // 2 + GRID_OFFSET, GRID_OFFSET, False)
        computer_label = self.font.render("Enemy Fleet", True, BLACK)
        self.screen.blit(computer_label, (WINDOW_SIZE // 2 + GRID_OFFSET, 10))

        if self.game_over:
            winner_text = self.font.render(f"{self.winner} wins!", True, RED)
            self.screen.blit(winner_text, (WINDOW_SIZE // 2 - 100, WINDOW_SIZE - 50))

        pygame.display.flip()

    def run(self):
        while True:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                elif event.type == pygame.MOUSEBUTTONDOWN and not self.game_over:
                    self.handle_click(event.pos)

            self.draw()

if __name__ == '__main__':
    game_gui = GameGUI()
    game_gui.run()
