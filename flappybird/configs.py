
import os
import random
import pygame


'''配置类'''
class Config():
    # 根目录
    rootdir = os.path.split(os.path.abspath(__file__))[0]
    # FPS
    FPS = 60
    # 屏幕大小
    SCREENSIZE = (288, 512)
    # 管道之间的空隙
    # PIPE_GAP_SIZE = 100
    PIPE_GAP_SIZE = 150
    # BIRD SPEED
    DROPPING_SPEED = 12
    FLAPPING_SPEED = 3
    FLYING_SPEED = 4
    # 标题
    TITLE = 'Flappy Bird —— Charles的皮卡丘'
    # 游戏声音路径
    SOUND_PATHS_DICT = {
        'die': os.path.join(rootdir, 'resources/audios/die.wav'),
        'hit': os.path.join(rootdir, 'resources/audios/hit.wav'),
        'point': os.path.join(rootdir, 'resources/audios/point.wav'),
        'swoosh': os.path.join(rootdir, 'resources/audios/swoosh.wav'),
        'wing': os.path.join(rootdir, 'resources/audios/wing.wav'),
    }
    # 游戏图片路径
    IMAGE_PATHS_DICT = {
        'number': {
            '0': os.path.join(rootdir, 'resources/images/0.png'), '1': os.path.join(rootdir, 'resources/images/1.png'),
            '2': os.path.join(rootdir, 'resources/images/2.png'), '3': os.path.join(rootdir, 'resources/images/3.png'),
            '4': os.path.join(rootdir, 'resources/images/4.png'), '5': os.path.join(rootdir, 'resources/images/5.png'),
            '6': os.path.join(rootdir, 'resources/images/6.png'), '7': os.path.join(rootdir, 'resources/images/7.png'),
            '8': os.path.join(rootdir, 'resources/images/8.png'), '9': os.path.join(rootdir, 'resources/images/9.png'),
        },
        'bird': {
            'red': {
                'up': os.path.join(rootdir, 'resources/images/redbird-upflap.png'),
                'mid': os.path.join(rootdir, 'resources/images/redbird-midflap.png'),
                'down': os.path.join(rootdir, 'resources/images/redbird-downflap.png')
            },
            'blue': {
                'up': os.path.join(rootdir, 'resources/images/bluebird-upflap.png'),
                'mid': os.path.join(rootdir, 'resources/images/bluebird-midflap.png'),
                'down': os.path.join(rootdir, 'resources/images/bluebird-downflap.png')
            },
            'yellow': {
                'up': os.path.join(rootdir, 'resources/images/yellowbird-upflap.png'),
                'mid': os.path.join(rootdir, 'resources/images/yellowbird-midflap.png'),
                'down': os.path.join(rootdir, 'resources/images/yellowbird-downflap.png')
            },
        },
        'background': {
            'day': os.path.join(rootdir, 'resources/images/background-day.png'),
            'night': os.path.join(rootdir, 'resources/images/background-night.png'),
        },
        'pipe': {
            'green': os.path.join(rootdir, 'resources/images/pipe-green.png'),
            'red': os.path.join(rootdir, 'resources/images/pipe-red.png'),
        },
        'others': {
            'gameover': os.path.join(rootdir, 'resources/images/gameover.png'),
            'message': os.path.join(rootdir, 'resources/images/message.png'),
            'base': os.path.join(rootdir, 'resources/images/base.png'),
        },
    }


class Resource(object):

    def __init__(self, resource_loader):
        # 定义游戏资源
        # --音频
        self.sounds = resource_loader.sounds
        # --数字图片
        self.number_images = resource_loader.images['number']
        for key in self.number_images:
            self.number_images[key] = self.number_images[key].convert_alpha()
        # --管道
        self.pipe_images = dict()
        self.pipe_images['bottom'] = random.choice(
            list(resource_loader.images['pipe'].values())
        ).convert_alpha()
        self.pipe_images['top'] = pygame.transform.rotate(self.pipe_images['bottom'], 180)
        # --小鸟图片
        bird_img_idx = random.randint(0, len(resource_loader.images['bird']) - 1)
        bird2_img_idx = 0
        while bird_img_idx == bird2_img_idx:
            bird2_img_idx = random.randint(0, len(resource_loader.images['bird']) - 1)
        bird_images_list = list(resource_loader.images['bird'].values())
        self.bird_images = bird_images_list[bird_img_idx]
        self.bird2_images = bird_images_list[bird2_img_idx]
        for key in self.bird_images:
            self.bird_images[key] = self.bird_images[key].convert_alpha()
        for key in self.bird2_images:
            self.bird2_images[key] = self.bird2_images[key].convert_alpha()
        # --背景图片
        self.backgroud_image = random.choice(list(
            resource_loader.images['background'].values())).convert_alpha()
        # --其他图片
        self.other_images = resource_loader.images['others']
        for key in self.other_images:
            self.other_images[key] = self.other_images[key].convert_alpha()

