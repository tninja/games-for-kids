
class GameOfLife(object):
    def getNextRound(self, board):
        """
        :type board: List[List[int]]
        :rtype: None Do not return anything, modify board in-place instead.
        """
        if len(board) == 0:
            return board
        elif len(board[0]) == 0:
            return board
        else:
            height, width = self.getDim(board)
            next_board = self.buildZeroBoard(height, width)
            for y in range(height):
                for x in range(width):
                    next_life = self.getNextLife(board, x, y)
                    next_board[y][x] = next_life
            return next_board

    def getNextLife(self, board, x, y):
        life = board[y][x]
        assert life in [0, 1]
        height, width = self.getDim(board)
        neighbors = self.getNeighbors(x, y, width, height)
        neighbors_value = [board[ny][nx] for nx, ny in neighbors]
        neighbors_lifes = sum(neighbors_value)
        return self.getNextLife0(life, neighbors_lifes)

    def getNextLife0(self, life, neighbors_lifes):
        if life == 1:
            if neighbors_lifes < 2:
                return 0  # under-population
            elif neighbors_lifes in [2, 3]:
                return 1
            else:  # neighbors_lifes > 3:
                return 0  # over-population
        else:  # life == 0
            if neighbors_lifes == 3:
                return 1  # reproduction
            else:
                return 0

    def getNeighbors(self, x, y, width, height):
        assert x >= 0 and x < width
        assert y >= 0 and y < height
        neighbors = []
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                if dx == 0 and dy == 0:
                    continue
                else:
                    nx = x + dx
                    ny = y + dy
                    if nx >= 0 and nx < width and ny >= 0 and ny < height:
                        neighbors.append((nx, ny))
        return neighbors

    def getDim(self, board):
        height = len(board)
        if height == 0:
            return height, 0
        else:
            width = len(board[0])
            return height, width

    def buildZeroBoard(self, height, width):
        zero_board = []
        for y in range(height):
            row = [0] * width
            zero_board.append(row)
        return zero_board

    def printBoard(self, board):
        height, width = self.getDim(board)
        for y in range(height):
            for x in range(width):
                cell = board[y][x]
                ch = 'o'
                if cell == 0:
                    ch = '.'
                print(ch, end='')
            print()

    def generateRandomBoard(self, height, width, liveProb):
        board = self.buildZeroBoard(height, width)
        import random
        for y in range(height):
            for x in range(width):
                p = random.uniform(0, 1)
                if p < liveProb:
                    cell = 1
                else:
                    cell = 0
                board[y][x] = cell
        return board
