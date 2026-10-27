import pygame
import sys
from game import Board, Player, HumanPlayer, ComputerPlayer

# 颜色常量
BLUE = (0, 0, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
YELLOW = (255, 255, 0)

# 游戏界面常量
SQUARESIZE = 100
RADIUS = SQUARESIZE//2 - 5

class GUIGame:
    def __init__(self, player1, player2):
        self.board = Board()
        self.players = [player1, player2]
        self.current_player = 0
        
        # 初始化 pygame
        pygame.init()
        
        # 设置窗口大小
        self.width = self.board.cols * SQUARESIZE
        self.height = (self.board.rows + 1) * SQUARESIZE
        self.screen = pygame.display.set_mode((self.width, self.height))
        pygame.display.set_caption('Connect Four')
        
        self.font = pygame.font.SysFont("monospace", 75)
        
    def draw_board(self):
        # 清空屏幕
        self.screen.fill(BLACK)
        
        # 画棋盘格子
        for c in range(self.board.cols):
            for r in range(self.board.rows):
                pygame.draw.rect(self.screen, BLUE, 
                               (c*SQUARESIZE, (r+1)*SQUARESIZE, SQUARESIZE, SQUARESIZE))
                pygame.draw.circle(self.screen, BLACK,
                                 (c*SQUARESIZE + SQUARESIZE//2, (r+1)*SQUARESIZE + SQUARESIZE//2),
                                 RADIUS)
        
        # 画已放置的棋子
        for c in range(self.board.cols):
            for r in range(self.board.rows):
                if self.board.board[r][c] == 1:
                    color = RED
                elif self.board.board[r][c] == 2:
                    color = YELLOW
                else:
                    continue
                pygame.draw.circle(self.screen, color,
                                 (c*SQUARESIZE + SQUARESIZE//2, (r+1)*SQUARESIZE + SQUARESIZE//2),
                                 RADIUS)
                
        pygame.display.update()
        
    def handle_computer_move(self):
        """处理电脑玩家的移动"""
        player = self.players[self.current_player]
        col = player.get_move(self.board)
        result = self.board.drop_token(col, player.number)
        if result:
            row, col = result
            return row, col
        return None
        
    def play(self):
        game_over = False
        
        while not game_over:
            self.draw_board()
            
            # 如果当前玩家是电脑
            if isinstance(self.players[self.current_player], ComputerPlayer):
                result = self.handle_computer_move()
                if result:
                    row, col = result
                    if self.board.check_win(row, col, self.players[self.current_player].number):
                        self.draw_board()
                        label = self.font.render(f"{self.players[self.current_player].name} wins!", 1, 
                                               RED if self.current_player == 0 else YELLOW)
                        self.screen.blit(label, (40, 10))
                        pygame.display.update()
                        pygame.time.wait(3000)
                        game_over = True
                        break
                    self.current_player = 1 - self.current_player
                continue
            
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    sys.exit()
                    
                if event.type == pygame.MOUSEMOTION:
                    # 清除顶部区域
                    pygame.draw.rect(self.screen, BLACK, (0, 0, self.width, SQUARESIZE))
                    # 显示当前玩家的棋子
                    color = RED if self.current_player == 0 else YELLOW
                    pygame.draw.circle(self.screen, color,
                                     (event.pos[0], SQUARESIZE//2),
                                     RADIUS)
                    pygame.display.update()
                    
                if event.type == pygame.MOUSEBUTTONDOWN:
                    player = self.players[self.current_player]
                    
                    # 获取点击的列
                    col = event.pos[0] // SQUARESIZE
                    
                    if not self.board.is_valid_move(col):
                        continue
                        
                    result = self.board.drop_token(col, player.number)
                    if result is None:
                        continue
                        
                    row, col = result
                    
                    # 检查获胜
                    if self.board.check_win(row, col, player.number):
                        self.draw_board()
                        label = self.font.render(f"{player.name} wins!", 1, 
                                               RED if player.number == 1 else YELLOW)
                        self.screen.blit(label, (40, 10))
                        pygame.display.update()
                        pygame.time.wait(3000)
                        game_over = True
                        break
                        
                    # 检查平局
                    if self.board.is_full():
                        self.draw_board()
                        label = self.font.render("Draw!", 1, BLUE)
                        self.screen.blit(label, (40, 10))
                        pygame.display.update()
                        pygame.time.wait(3000)
                        game_over = True
                        break
                        
                    # 切换玩家
                    self.current_player = 1 - self.current_player
                    
        pygame.quit()

def main():
    player1 = HumanPlayer(1, "Player 1")
    player2 = ComputerPlayer(2, "Play Kang")
    game = GUIGame(player1, player2)
    game.play()

if __name__ == "__main__":
    main()
