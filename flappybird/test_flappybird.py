
from .flappybird import FlappyBirdGame
from .configs import Resource
from .interfaces import GameStartInterface

import unittest
import itertools
import random


class TestFlappyBirdGame(unittest.TestCase):

    def testRun(self):
        game = FlappyBirdGame()
        with self.assertRaises(SystemExit):
            game.run()

    def testNext(self):
        a = itertools.cycle([2, 3, 1])
        print(next(a))
        print(next(a))
        print(next(a))

    def testGameStartInterface(self):
        game = FlappyBirdGame()
        screen, resource_loader, cfg = game.screen, game.resource_loader, game.cfg
        resource = Resource(resource_loader)
        GameStartInterface(screen, resource, cfg)
