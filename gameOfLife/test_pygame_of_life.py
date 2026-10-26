
from unittest import TestCase

import pygame
from pygame.locals import *

from pygame_of_life import PyGameOfLife
from pygame_of_life import Cell


class PyGameOfLifeTestCase(TestCase):
    def spikePyGame(self):
        pygame.init()
        pygame.display.set_caption("Spike PyGame")
        screen_res = [640, 480]
        screen = pygame.display.set_mode(screen_res)
        finished = False
        while not finished:
            for event in pygame.event.get():
                if event.type == QUIT:
                    finished = True
            pygame.display.update()
        pygame.quit()

    def spikeSprite(self):
        pygame.init()
        pygame.display.set_caption("Spike Sprite")
        screen_res = [640, 480]
        screen = pygame.display.set_mode(screen_res)
        sprites = pygame.sprite.Group()
        cell1 = Cell(0, 20)
        sprites.add(cell1)
        cell2 = Cell(20, 0)
        sprites.add(cell2)
        cell3 = Cell(10, 10)
        sprites.add(cell3)
        sprites.draw(screen)
        finished = False
        while not finished:
            for event in pygame.event.get():
                if event.type == QUIT:
                    finished = True
            pygame.display.update()
        pygame.quit()

    def testBuildCellList(self):
        board = [[0,1,0],
                 [0,0,1],
                 [1,1,1],
                 [0,0,0]]
        game = PyGameOfLife(board)
        cellList = game.buildCellList(board)
        self.assertEqual(5, len(cellList))

    def spikePlotBoard(self):
        game = PyGameOfLife.startWithRandomBoard(20, 20, 0.3)
        board = game.board
        screen = game.initPyGameAndGetScreen()
        sprites, _ = game.initSpirites(board)
        sprites.draw(screen)
        finished = False
        while not finished:
            for event in pygame.event.get():
                if event.type == QUIT:
                    finished = True
            pygame.display.update()
        pygame.quit()

    def spikePlotBoardAndNextRound(self):
        game = PyGameOfLife.startWithRandomBoard(20, 20, 0.2)
        board = game.board
        screen = game.initPyGameAndGetScreen()
        sprites, cellList = game.initSpirites(board)
        sprites.draw(screen)
        finished = False
        import time
        while not finished:
            print("==========")
            game.gol.printBoard(board)
            for event in pygame.event.get():
                if event.type == QUIT:
                    finished = True
            time.sleep(1)
            board, sprites, cellList = game.updateSpritesWithNextRound(board, sprites, cellList)
            game.clearScreenAndPlot(screen, sprites)
            if len(cellList) == 0:
                finished = True
        pygame.quit()

    def testPlay(self):
        game = PyGameOfLife.startWithRandomBoard(20, 20, 0.2)
        game.cellSize=50
        game.play()

    def testGetJustDeadCellBoard(self):
        game = PyGameOfLife.startWithRandomBoard(20, 20, 0.2)
        input = [[0,1,0],
                 [0,0,1],
                 [1,1,1],
                 [0,0,0]]
        output = [[0,0,0],
                  [1,0,1],
                  [0,1,1],
                  [0,1,0]]
        dead = [[0,1,0],
                [0,0,0],
                [1,0,0],
                [0,0,0]]
        self.assertListEqual(dead, game.getJustDeadCellBoard(input, output))
