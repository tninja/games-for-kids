
from unittest import TestCase

import pygame
from pygame.locals import *

import time
import random
import os

from yellowSubmarine import Command, Driver, Submarine, Bubble

class YellowSubmarineTestCase(TestCase):

    def setUp(self):
        pygame.init()
        pygame.mixer.init()
        self.width = 1800
        self.height = 800
        imageFile = self.getBgImg()
        print("imageFile=%s" % imageFile)
        image = pygame.image.load(imageFile)
        self.background = pygame.transform.scale(image, (self.width, self.height))
        screen_res = [self.width, self.height]
        self.screen = pygame.display.set_mode(screen_res)

    def spikePlay(self):
        self.playBgm()
        pygame.display.set_caption("Yellow Submarine")
        submarine = Submarine(400, 500, self.width, self.height)
        command = Command(submarine)
        driver = Driver(submarine)
        sprites = pygame.sprite.Group()
        sprites.add(submarine)
        sprites.add(command)
        sprites.add(driver)
        spirit_list = [submarine, command, driver]
        finished = False
        while not finished:
            for event in pygame.event.get():
                if event.type == QUIT:
                    finished = True
                elif event.type == pygame.KEYDOWN:
                    if event.key is not None:
                        if event.key == pygame.K_RSHIFT:
                            submarine.bubble(sprites, spirit_list)
                            self.playBubble()
                        elif event.key == pygame.K_RETURN:
                            command.read()
                        elif event.key == pygame.K_RIGHT:
                            submarine.turnRight()
                        elif event.key == pygame.K_LEFT:
                            submarine.turnLeft()
                        elif event.key == pygame.K_BACKSPACE or event.key == pygame.K_DELETE:
                            command.words = []
                        elif event.key < 256:
                            ch = chr(event.key)
                            if False: #ch == ';':
                                import speech_recognition as sr
                                r = sr.Recognizer()
                                mic = sr.Microphone()
                                with mic as source:
                                    print("going to adjust_for_ambient_noise")
                                    r.adjust_for_ambient_noise(source)
                                    print("going to listen")
                                    audio = r.listen(source)
                                    print("listening finished")
                                    transcript = r.recognize_google(audio)
                                    print(transcript)
                                    for ch in list(transcript):
                                        command.words.append(ch)
                                    self.playKeyInput(transcript)
                            else:
                                self.playKeyInput(ch)
                                command.words.append(ch)
                                print(command.words)
            for monster in spirit_list:
                monster.move()
            self.refreshBackground()
            sprites.draw(self.screen)
            
            command.print(self.screen)
            pygame.display.update()
            command.command(sprites, spirit_list)
            time.sleep(0.02)

    def refreshBackground(self):
        self.screen.blit(self.background, (0, 0))

    def getBgImg(self):
        imgList = ['./ocean.bg1.jpg', './ocean.bg2.jpg']
        ix = int(random.uniform(0, len(imgList)))
        return imgList[ix]
        
    def playBgm(self):
        pygame.mixer.music.load('./yellowSubmarine1hour.mp3')
        pygame.mixer.music.set_volume(0.1)
        pygame.mixer.music.play(loops=-1)  # loop forever

    def playKeyInput(self, ch):
        self.playSoundEffect('./key.input.mp3')
        os.system("say '%s' &" % ch)

    def playBubble(self):
        channel = int(random.uniform(0, 5))
        self.playSoundEffect('./bubble.mp3', channel)

    def playSoundEffect(self, mp3file, channel=0):
        ## https://stackoverflow.com/questions/53617967/play-music-and-sound-effects-on-top-of-each-other-pygame
        pygame.mixer.Channel(channel).play(pygame.mixer.Sound(mp3file), maxtime=6000)

    def spikeTTS(self):
        os.system('say Hello world!')

    def spikeArraySlice(self):
        cmd = 'lright'
        print(cmd[-5:])
