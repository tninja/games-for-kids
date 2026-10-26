
from unittest import TestCase

from game_of_life import GameOfLife


class GameOfLifeTestCase(TestCase):
    def setUp(self):
        self.solution = GameOfLife()

    def testEmptyCase(self):
        self.assertEqual(0, len(self.solution.getNextRound([])))
        self.assertListEqual([[], []], self.solution.getNextRound([[], []]))

    def testSimpleCases(self):
        self.assertListEqual([[0]], self.solution.getNextRound([[1]]))
        self.assertListEqual([[1, 1], [1, 1]], self.solution.getNextRound([[0, 1], [1, 1]]))
        self.assertListEqual([[0, 0], [0, 0]], self.solution.getNextRound([[0, 1], [1, 0]]))

    def testExampleCase(self):
        input = [[0,1,0],
                 [0,0,1],
                 [1,1,1],
                 [0,0,0]]
        output = [[0,0,0],
                  [1,0,1],
                  [0,1,1],
                  [0,1,0]]
        self.assertListEqual(output, self.solution.getNextRound(input))

    def testGetNextLife(self):
        self.assertEqual(0, self.solution.getNextLife([[1]], 0, 0))
        self.assertEqual(1, self.solution.getNextLife([[0, 1], [1, 1]], 0, 0))

    def testGetNextLife0(self):
        self.assertEqual(0, self.solution.getNextLife0(1, 0))
        self.assertEqual(0, self.solution.getNextLife0(1, 1))
        self.assertEqual(1, self.solution.getNextLife0(1, 2))
        self.assertEqual(1, self.solution.getNextLife0(1, 3))
        self.assertEqual(0, self.solution.getNextLife0(1, 4))

        self.assertEqual(0, self.solution.getNextLife0(0, 0))
        self.assertEqual(0, self.solution.getNextLife0(0, 1))
        self.assertEqual(0, self.solution.getNextLife0(0, 2))
        self.assertEqual(1, self.solution.getNextLife0(0, 3))
        self.assertEqual(0, self.solution.getNextLife0(0, 4))

    def testGetNeighbors(self):
        self.assertEqual(0, len(self.solution.getNeighbors(0, 0, 1, 1)))

        self.assertEqual(1, len(self.solution.getNeighbors(0, 0, 1, 2)))
        self.assertEqual(1, len(self.solution.getNeighbors(0, 1, 1, 2)))

        self.assertEqual(3, len(self.solution.getNeighbors(0, 0, 2, 2)))
        self.assertEqual(3, len(self.solution.getNeighbors(0, 1, 2, 2)))

        self.assertEqual(5, len(self.solution.getNeighbors(0, 1, 3, 3)))
        self.assertEqual(8, len(self.solution.getNeighbors(1, 1, 3, 3)))

    def testFailedCases(self):
        self.assertListEqual([[0,0,0],[1,0,1],[0,1,1],[0,1,0]], self.solution.getNextRound([[0,1,0],[0,0,1],[1,1,1],[0,0,0]]))

    def testPrintBoard(self):
        input = [[0,1,0],
                 [0,0,1],
                 [1,1,1],
                 [0,0,0]]
        self.solution.printBoard(input)

    def testGenerateRandomBoard(self):
        halfBoard = self.solution.generateRandomBoard(9, 16, 0.5)
        height, width = self.solution.getDim(halfBoard)
        self.assertEqual(9, height)
        self.assertEqual(16, width)
        oneBoard = self.solution.generateRandomBoard(9, 16, 1)
        height, width = self.solution.getDim(oneBoard)
        for y in range(height):
            for x in range(width):
                cell = oneBoard[y][x]
                self.assertEqual(1, cell)
        zeroBoard = self.solution.generateRandomBoard(10, 10, 0)
        height, width = self.solution.getDim(zeroBoard)
        for y in range(height):
            for x in range(width):
                cell = zeroBoard[y][x]
                self.assertEqual(0, cell)
        littleBoard = self.solution.generateRandomBoard(9, 16, 0.1)
        self.solution.printBoard(littleBoard)
