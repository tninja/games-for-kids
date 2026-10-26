
import pygame
from pygame.locals import *

import random
import os

from abc import ABC, abstractmethod


class AbstractFishGroup(pygame.sprite.Sprite, ABC):
    def __init__(self, x, y, screen_width, screen_height, dx=-2, dy=0):
        pygame.sprite.Sprite.__init__(self)
        self.x, self.y = x, y
        self.screen_width = screen_width
        self.screen_height = screen_height
        self.dx = dx

    def getImageFile(self):
        imgList = ['./fish1.png', './fish2.png', './fish3.png', './john.fish.png']
        ix = int(random.uniform(0, len(imgList)))
        return imgList[ix]

    def generateAndRegisterFish(self, sprites, spirit_list, fish_width=100, fish_gap=10):
        fish_pos_list = self.getFishPosList()
        self.sprites = sprites
        self.spirit_list = spirit_list
        self.generateFishList(fish_pos_list, fish_width, fish_gap)

    def generateFishList(self, fish_pos_list, fish_width, fish_gap):
        dummy_fish = Fish(0, 0, self.screen_width, self.screen_height, width=fish_width)
        fish_height = dummy_fish.image.get_height()
        fish_list = []
        imageFile = self.getImageFile()
        for fx, fy in fish_pos_list:
            x = self.x + round(fx * (fish_width + fish_gap))
            y = self.y + round(fy * (fish_height + fish_gap))
            fish = Fish(x, y, self.screen_width, self.screen_height, dx=self.dx, width=fish_width, imageFile=imageFile)
            fish_list.append(fish)
            self.sprites.add(fish)
            self.spirit_list.append(fish)
        return fish_list

    @abstractmethod
    def getFishPosList(self):
        pass

class TriFishGroup(AbstractFishGroup):
    def setGroupSize(self, fish_nx=3):
        self.fish_nx = fish_nx

    def getFishPosList(self):
        n = self.fish_nx
        fish_pos_list = []
        for i in range(n):
            fx = i * 0.67
            fishes_i = i + 1
            fishes_height = i
            start_fy = - fishes_height / 2
            end_fy = fishes_height / 2
            stepy = 1
            count = 0
            fy = start_fy
            while count < fishes_i:
                fish_pos_list.append((fx, fy))
                fy = fy + stepy
                count += 1
        # fish_pos_list = [(0, 0), (0.67, 0.5), (0.67, -0.5), (1.33, 0.0), (1.33, 1.0), (1.33, -1.0)]
        print(fish_pos_list)
        return fish_pos_list
    
class RectFishGroup(AbstractFishGroup):
    def setGroupSize(self, fish_nx=4, fish_ny=3):
        self.fish_nx = fish_nx
        self.fish_ny = fish_ny
        
    def getFishPosList(self):
        fish_pos_list = []
        for x in range(0, self.fish_nx):
            for y in range(0, self.fish_ny):
                pos = (x, y)
                fish_pos_list.append(pos)
        return fish_pos_list

class DiamondFishGroup(AbstractFishGroup):
    def setGroupSize(self, fish_nx=3):
        self.fish_nx = fish_nx
        
    def getFishPosList(self):
        n = self.fish_nx
        fish_pos_list = []
        for i in range(n):
            fx = i * 0.67
            fishes_i = i + 1
            fishes_height = i
            start_fy = - fishes_height / 2
            end_fy = fishes_height / 2
            stepy = 1
            count = 0
            fy = start_fy
            while count < fishes_i:
                fish_pos_list.append((fx, fy))
                fy = fy + stepy
                count += 1
        for j in range(n-1):
            i = n - 2 - j
            fx = (n + j) * 0.67
            fishes_i = i + 1
            fishes_height = i
            start_fy = - fishes_height / 2
            end_fy = fishes_height / 2
            stepy = 1
            count = 0
            fy = start_fy
            while count < fishes_i:
                fish_pos_list.append((fx, fy))
                fy = fy + stepy
                count += 1
        print(fish_pos_list)
        return fish_pos_list

class Fish(pygame.sprite.Sprite):
    def __init__(self, x, y, screen_width, screen_height, dx=3, dy=0, width=100, imageFile='./john.fish.png'):
        pygame.sprite.Sprite.__init__(self)
        self.x, self.y = x, y
        self.screen_width, self.screen_height = screen_width, screen_height
        self.dx, self.dy = dx, dy
        image = pygame.image.load(imageFile)
        self.originalImage = image
        self.image = Submarine.resizeImage(image, width)
        if dx < 0:
            self.image = pygame.transform.flip(self.image, True, False)
        self.width, self.height = self.image.get_width(), self.image.get_height()
        self.rect = pygame.Rect(x, y, self.width, self.height)
        self.follower = []

    def move(self):
        self.x = self.x + self.dx
        if self.x > self.screen_width:
            self.x = - self.width
        elif self.x + self.width < 0:
            self.x = self.screen_width
        self.y = self.y + self.dy
        self.rect.topleft = (self.x, self.y)

class Command(pygame.sprite.Sprite):
    def __init__(self, submarine, scale_factor=1.2):
        pygame.sprite.Sprite.__init__(self)
        self.submarine = submarine
        image = pygame.image.load('./dialog.nobg.png')
        self.image = submarine.resizeImage(image, int(submarine.width * scale_factor))
        self.width = submarine.width * scale_factor * 1.2
        self.height = self.image.get_height() * submarine.width / self.image.get_width()
        self.gap = 0
        x, y = self.getPosition()
        self.rect = pygame.Rect(x, y, self.width, self.height)
        self.words = []
        self.maxSize = 18

    def getPosition(self):
        x = self.submarine.x
        y = self.submarine.y - self.height - self.gap
        return (x, y)

    def move(self):
        x, y = self.getPosition()
        self.rect.topleft = (x, y)

    def print(self, screen):
        if len(self.words) > 0:
            label = ''.join(self.words[(-self.maxSize):])
            font = pygame.font.Font('freesansbold.ttf', 40)
            black = (0, 0, 0) 
            text = font.render(label, True, black)
            x, y = self.getPosition()
            tx = x + 50
            ty = y + self.height / 2
            screen.blit(text, (tx, ty))

    def command(self, sprites, spirit_list):
        if self.checkCommand('right'):
            self.submarine.turnRight()
            self.words = []
        elif self.checkCommand('left'):
            self.submarine.turnLeft()
            self.words = []
        elif self.checkCommand('hello') or self.checkCommand('follow'):
            self.submarine.newFollower(sprites, spirit_list)
            self.words = []
        elif self.checkCommand('bye'):
            self.submarine.byebye()
            self.words = []
        elif self.checkCommand('jump'):
            for i in range(11):
                dolphine = Dolphine(self.submarine.screen_width,
                                    self.submarine.screen_height,
                                    i)
                sprites.add(dolphine)
                spirit_list.append(dolphine)
            os.system('say "Starting dolphine jump." &')
            self.words = []
        elif self.checkCommand('fish'):
            x = random.uniform(0, self.submarine.screen_width)
            y = random.uniform(100, self.submarine.screen_height * 2 // 3)
            fish = Fish(x, y, self.submarine.screen_width, self.submarine.screen_height)
            sprites.add(fish)
            spirit_list.append(fish)
            os.system('say "Fish appended." &')
            self.words = []
        elif self.checkCommand('rect'):
            fish_group = self.buildFishGroup()
            fish_nx = round(random.uniform(2, 6))
            fish_ny = round(random.uniform(2, 5))
            fish_group.setGroupSize(fish_nx=fish_nx, fish_ny=fish_ny)
            fish_width = int(random.uniform(40, 100))
            fish_gap = fish_width // 10
            fish_group.generateAndRegisterFish(sprites, spirit_list, fish_width=fish_width, fish_gap=fish_gap)
            os.system('say "Rectangle fish group created." &')
            self.words = []
        elif self.checkCommand('tri'):
            fish_group = self.buildFishGroup()
            fish_nx = round(random.uniform(2, 6))
            fish_group.setGroupSize(fish_nx=fish_nx)
            fish_width = int(random.uniform(40, 100))
            fish_gap = fish_width // 10
            fish_group.generateAndRegisterFish(sprites, spirit_list, fish_width=fish_width, fish_gap=fish_gap)
            os.system('say "Triangle fish group created." &')
            self.words = []
        elif self.checkCommand('dia'):
            fish_group = self.buildFishGroup()
            fish_nx = round(random.uniform(2, 5))
            fish_group.setGroupSize(fish_nx=fish_nx)
            fish_width = int(random.uniform(40, 100))
            fish_gap = fish_width // 10
            fish_group.generateAndRegisterFish(sprites, spirit_list, fish_width=fish_width, fish_gap=fish_gap)
            os.system('say "Diamond fish group created." &')
            self.words = []
        else:
            if len(self.words) > self.maxSize:
                os.system('say "Mr. John Tu, I don\'t understand your command." &')
                self.words = []

    def buildFishGroup(self):
            x = random.uniform(0, self.submarine.screen_width)
            y = random.uniform(100, self.submarine.screen_height * 1 // 3)
            dx = 0
            while dx == 0:
                dx = int(random.uniform(-6, 6))
            if self.checkCommand('rect'):
                fish_group = RectFishGroup(x, y, self.submarine.screen_width, self.submarine.screen_height, dx=dx)
            elif self.checkCommand('tri'):
                fish_group = TriFishGroup(x, y, self.submarine.screen_width, self.submarine.screen_height, dx=dx)
            elif self.checkCommand('dia'):
                fish_group = DiamondFishGroup(x, y, self.submarine.screen_width, self.submarine.screen_height, dx=dx)
            return fish_group

    def read(self):
        if len(self.words) > 0:
            label = ''.join(self.words)
            os.system('say "%s" &' % label)
                
    def checkCommand(self, command):
        if len(self.words) >= len(command):
            if ''.join(self.words[-len(command):]) == command:
                return True
        return False
            
class Driver(pygame.sprite.Sprite):
    def __init__(self, submarine, width=80):
        pygame.sprite.Sprite.__init__(self)
        self.submarine = submarine
        self.width = width
        image = pygame.image.load('./john.tu.home.human.png')
        self.height = self.width / image.get_width() * image.get_height()
        self.image = submarine.resizeImage(image, self.width)
        x, y = self.getPosition()
        self.rect = pygame.Rect(x, y, self.width, self.height)

    def getPosition(self):
        x = self.submarine.x + self.submarine.width / 2 - self.width / 2
        y = self.submarine.y + self.submarine.height / 2# - self.height / 2
        return (x, y)

    def move(self):
        x, y = self.getPosition()
        self.rect.topleft = (x, y)

class Bubble(pygame.sprite.Sprite):
    def __init__(self, staff, dy=-3, width=160):
        pygame.sprite.Sprite.__init__(self)
        self.staff = staff
        self.width = width
        imgFile = self.getBubbleImg()
        image = pygame.image.load(imgFile)
        self.height = self.width / image.get_width() * image.get_height()
        self.image = Submarine.resizeImage(image, self.width)
        self.x, self.y = self.initPosition()
        self.dy = dy
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)
        print("bubble created with x=%d and y=%d" % (self.x, self.y))

    def getBubbleImg(self):
        imgList = ['./bubble1.nobg.png', './bubble2.nobg.png', './bubble3.nobg.png']
        ix = int(random.uniform(0, len(imgList)))
        return imgList[ix]

    def initPosition(self):
        x = self.staff.x + self.staff.width / 2 - self.width / 2
        y = self.staff.y + self.staff.height / 2 - self.height / 2
        return (x, y)

    def move(self):
        self.y = self.y + self.dy
        self.rect.topleft = (self.x, self.y)

class Submarine(pygame.sprite.Sprite):
    def __init__(self, x, y, screen_width, screen_height, dx=-2, dy=0, width=320):
        pygame.sprite.Sprite.__init__(self)
        self.x, self.y = x, y
        self.screen_width, self.screen_height = screen_width, screen_height
        self.dx, self.dy = dx, dy
        imageFile = self.getSubMarineImg()
        image = pygame.image.load(imageFile)
        self.originalImage = image
        self.image = self.resizeImage(image, width)
        self.width, self.height = self.image.get_width(), self.image.get_height()
        self.rect = pygame.Rect(x, y, self.width, self.height)
        self.follower = []

    def getSubMarineImg(self):
        imgList = ['./ys1.png', './ys2.png', './ys3.png', './ys4.png']
        ix = int(random.uniform(0, len(imgList)))
        return imgList[ix]

    def turnRight(self):
        if self.dx <= 0:
            os.system('say "Mr. John Tu, Submarine turn right now." &')
        else:
            os.system('say "Mr. John Tu, Submarine already moving right." &')
        self.dx = abs(self.dx)
        self.image = self.resizeImage(self.originalImage, self.width)
        self.image = pygame.transform.flip(self.image, True, False)

    def turnLeft(self):
        if self.dx >= 0:
            os.system('say "Mr. John Tu, Submarine turn left now." &')
        else:
            os.system('say "Mr. John Tu, Submarine already moving left." &')
        self.dx = - abs(self.dx)
        self.image = self.resizeImage(self.originalImage, self.width)

    def newFollower(self, sprites, spirit_list):
        shark = Shark(self, sprites, spirit_list)
        os.system('say "Hello!, here come a new follower" &')

    def bubble(self, sprites, spirit_list):
        bubble = Bubble(self)
        sprites.add(bubble)
        spirit_list.append(bubble)
        print("#followers=%d" % len(self.follower))
        for staff in self.follower:
            bubble0 = Bubble(staff, width=100)
            sprites.add(bubble0)
            spirit_list.append(bubble0)

    def byebye(self):
        if len(self.follower) > 0:
            shark = self.follower.pop()
            shark.goodbye()
            os.system('say "Bye bye!" &')
        else:
            os.system('say "There is no follower" &')

    @staticmethod
    def resizeImage(image, width):
        assert width > 0
        original_width = image.get_width()
        scale_factor = width * 1.0 / original_width
        original_height = image.get_height()
        height = int(scale_factor * original_height)
        resizedImage = pygame.transform.scale(image, (width, height))
        return resizedImage
        
    def move(self):
        self.x = self.x + self.dx
        if self.x > self.screen_width:
            self.x = - self.width
        elif self.x + self.width < 0:
            self.x = self.screen_width
        self.y = self.y + self.dy
        self.rect.topleft = (self.x, self.y)

class Shark(pygame.sprite.Sprite):
    def __init__(self, submarine, sprites, spirit_list):
        pygame.sprite.Sprite.__init__(self)
        self.submarine = submarine
        self.submarine.follower.append(self)
        self.rnk = len(self.submarine.follower)
        imgFile = self.getSharkImg()
        image = pygame.image.load(imgFile)
        if image.get_height() < image.get_width(): # horizontal figure
            self.height = submarine.height // 2
        else:
            self.height = submarine.height // 3 * 2
        self.width = int(self.height / image.get_height() * image.get_width())
        self.image = submarine.resizeImage(image, self.width)
        x, y = self.getPosition()
        self.rect = pygame.Rect(x, y, self.width, self.height)
        sprites.add(self)
        spirit_list.append(self)
        self.dx = self.submarine.dx
        self.byebye = False

    def getSharkImg(self):
        imgList = ['./shark1.png', './shark2.png', './dino1.png']
        ix = int(random.uniform(0, len(imgList)))
        return imgList[ix]

    def getPosition(self):
        y = self.submarine.y + self.submarine.height // 2
        gap = 20
        if self.submarine.dx <= 0:
            if self.rnk == 1:
                x = self.submarine.x + self.submarine.width + gap
            else:
                prevShark = self.submarine.follower[self.rnk - 2]
                x = prevShark.x + prevShark.width + gap
            while x > self.submarine.screen_width:
                x = x - self.submarine.screen_width
        else:
            if self.rnk == 1:
                x = self.submarine.x - self.width - gap
            else:
                prevShark = self.submarine.follower[self.rnk - 2]
                x = prevShark.x - self.width - gap
            while x + self.width < 0:
                x = x + self.submarine.screen_width
        self.x, self.y = x, y
        return (x, y)

    def move(self):
        if self.byebye:
            self.y = self.y + self.dy
            self.rect.topleft = (self.x, self.y)
        else:
            x, y = self.getPosition()
            self.rect.topleft = (x, y)

    def goodbye(self):
        self.byebye = True
        self.dy = -3

class Dolphine(pygame.sprite.Sprite):
    def __init__(self, screen_width, screen_height, n=0, width=160):
        pygame.sprite.Sprite.__init__(self)
        self.screen_width, self.screen_height = screen_width, screen_height
        self.x = round(random.uniform(round(screen_width * 0.2), screen_width))
        self.y = screen_height + 2 * screen_height * n // 5
        self.dx = -3
        self.dy = -11
        imgFile = self.getDolphineImg()
        image = pygame.image.load(imgFile)
        self.width = width
        self.height = self.width / image.get_width() * image.get_height()
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)
        self.image = Submarine.resizeImage(image, self.width)

    def getDolphineImg(self):
        imgList = ['./dolphin1.png', './dolphin2.png', './dolphin3.jpg', './dolphin4.flop.png', './dolphin5.jpg']
        ix = int(random.uniform(0, len(imgList)))
        return imgList[ix]

    def move(self):
        if self.y > self.screen_height and self.y + self.dy <= self.screen_height:
            self.playMissle()
        self.x = self.x + self.dx
        self.y = self.y + self.dy
        self.rect.topleft = (self.x, self.y)

    def playMissle(self):
        channel = int(random.uniform(0, 5))
        self.playSoundEffect('./missle.mp3', channel)
        os.system('say "Jump." &')

    def playSoundEffect(self, mp3file, channel=0):
        ## https://stackoverflow.com/questions/53617967/play-music-and-sound-effects-on-top-of-each-other-pygame
        pygame.mixer.Channel(channel).play(pygame.mixer.Sound(mp3file), maxtime=6000)
