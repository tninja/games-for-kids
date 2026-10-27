import sys

import pygame


def QuitGame(use_pygame=True):
    if use_pygame:
        pygame.quit()
    sys.exit()


def InitPygame(screensize, title="Flappy Bird", init_mixer=True):
    pygame.init()
    if init_mixer:
        pygame.mixer.init()
    screen = pygame.display.set_mode(screensize)
    pygame.display.set_caption(title)
    return screen


class PygameResourceLoader:
    def __init__(
        self,
        image_paths_dict=None,
        sound_paths_dict=None,
        font_paths_dict=None,
        bgm_path=None,
        **kwargs,
    ):
        self.bgm_path = bgm_path
        self.fonts = self.fontload(font_paths_dict)
        self.images = self.defaultload(image_paths_dict, pygame.image.load)
        self.sounds = self.defaultload(sound_paths_dict, pygame.mixer.Sound)

    def defaultload(self, resources_dict, load_func):
        if resources_dict is None:
            return {}
        if not isinstance(resources_dict, dict):
            raise TypeError("resources_dict must be a dictionary")

        resources = {}
        for key, value in resources_dict.items():
            if isinstance(value, dict):
                resources[key] = self.defaultload(value, load_func)
            elif isinstance(value, list):
                resources[key] = [load_func(path) for path in value]
            else:
                resources[key] = load_func(value)
        return resources

    def fontload(self, font_paths_dict):
        if font_paths_dict is None:
            return {}
        if not isinstance(font_paths_dict, dict):
            raise TypeError("font_paths_dict must be a dictionary")

        fonts = {}
        for key, value in font_paths_dict.items():
            if value.get("system_font", False):
                fonts[key] = pygame.font.SysFont(value["name"], value["size"])
            else:
                fonts[key] = pygame.font.Font(value["name"], value["size"])
        return fonts

    def playbgm(self):
        pygame.mixer.music.load(self.bgm_path)
        pygame.mixer.music.play(-1, 0.0)


class PygameBaseGame:
    def __init__(self, config, **kwargs):
        self.config = config
        self.initialize()
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)

    def run(self):
        raise NotImplementedError("Subclasses must implement run()")

    def initialize(self):
        self.screen = InitPygame(
            screensize=self.config.SCREENSIZE,
            title=self.config.TITLE,
        )
        self.resource_loader = PygameResourceLoader(
            bgm_path=getattr(self.config, "BGM_PATH", None),
            font_paths_dict=getattr(self.config, "FONT_PATHS_DICT", None),
            image_paths_dict=getattr(self.config, "IMAGE_PATHS_DICT", None),
            sound_paths_dict=getattr(self.config, "SOUND_PATHS_DICT", None),
        )
