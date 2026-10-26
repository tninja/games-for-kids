from unittest import TestCase
import pygame
from pygame.locals import *
from game import Game
from monsters import Monster, Tractor

class PyGameTestCase(TestCase):
    """Test case for Pygame game logic."""

    def setUp(self):
        """Set up the Pygame environment for testing."""
        self.width = 1200
        self.height = 900
        self.game = Game(self.width, self.height)

    def test_play(self):
        self.game.play()
