import pygame
import random

class Monster(pygame.sprite.Sprite):
    def __init__(self, x, y, size=32, dx=0, dy=0, img='./wolf.png'):
        pygame.sprite.Sprite.__init__(self)
        self.x = x
        self.y = y
        self.dx = dx
        self.dy = dy
        self.rect = pygame.Rect(x, y, size, size)
        image = pygame.image.load(img)
        self.image = pygame.transform.scale(image, (size, size))
        self.hit = False

    def move(self):
        self.x = self.x + self.dx
        self.y = self.y + self.dy
        self.rect.topleft = (self.x, self.y)

    @staticmethod
    def getRndDxDy(maxstep, minimal):
        dx = dy = 0
        while (abs(dx) + abs(dy) < minimal):
            dx = int(random.uniform(-maxstep, maxstep))
            dy = int(random.uniform(-maxstep, maxstep))
        return dx,dy

    @staticmethod
    def getRndInitXY(width, height):
        x = int(random.uniform(0, 1) * width)
        y = int(random.uniform(0, 1) * height)
        return x, y

    @staticmethod
    def buildWolf(width, height, maxstep):
        x, y = Monster.getRndInitXY(width, height)
        dx, dy = Monster.getRndDxDy(maxstep, 2)
        size = int(random.uniform(0, 1) * 30) + 30
        wolf = Monster(x, y, size, dx, dy, './wolf.png')
        wolf.lv = 1
        wolf.type = 'wolf'
        return wolf

    @staticmethod
    def buildTiger(width, height, maxstep):
        x, y = Monster.getRndInitXY(width, height)
        dx, dy = Monster.getRndDxDy(maxstep, 2)
        size = int(random.uniform(0, 1) * 70) + 70
        tiger = Monster(x, y, size, dx, dy, './small_tiger.jpg')
        tiger.lv = 2
        tiger.type = 'tiger'
        return tiger
        
class Tractor(Monster):
    def __init__(self, x, y, dx=0, dy=0, board_width=1200, board_height=900):
        pygame.sprite.Sprite.__init__(self)
        self.x = x
        self.y = y
        self.dx = dx
        self.dy = dy
        self.board_width = board_width
        self.board_height = board_height
        width = 180
        height = 240
        self.image_width = width
        self.image_height = height
        self.rect = pygame.Rect(x, y, width, height)
        image = pygame.image.load("./small_tractor.jpg")
        self.image = pygame.transform.rotate(image, 270)
        self.image = pygame.transform.scale(self.image, (width, height))
        self.lv = 3
        self.hit = False
        self.type = 'tractor'

    def move(self):
        if self.x < 0 and self.dx < 0:
            self.dx = - self.dx
        if self.y < 0 and self.dy < 0:
            self.dy = - self.dy
        if self.x + self.image_width > self.board_width and self.dx > 0:
            self.dx = - self.dx
        if self.y + self.image_height > self.board_height and self.dy > 0:
            self.dy = - self.dy
        self.x = self.x + self.dx
        self.y = self.y + self.dy
        self.rect.topleft = (self.x, self.y)
