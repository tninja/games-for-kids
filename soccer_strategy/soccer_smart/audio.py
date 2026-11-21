"""Locally synthesized soccer sound effects; zero external audio assets."""

from array import array
from functools import lru_cache
from math import isfinite, pi, sin

import pygame

EFFECTS: dict[str, tuple[tuple[int, ...], float]] = {
    "click": ((640,), 0.035),
    "kick": ((190, 130), 0.045),
    "loft": ((260, 390, 520), 0.055),
    "whistle": ((1760, 1980, 1760), 0.06),
    "intercept": ((310, 220), 0.06),
    "save": ((440, 330), 0.065),
    "goal": ((523, 659, 784, 1047), 0.085),
    "good": ((523, 659, 784), 0.065),
    "risk": ((330, 262), 0.085),
    "rewind": ((587, 440, 330), 0.045),
    "complete": ((523, 659, 784, 1047), 0.095),
}


@lru_cache(maxsize=32)
def make_tone(notes: tuple[int, ...], seconds: float, rate: int, channels: int) -> bytes:
    if not notes or not isfinite(seconds) or seconds <= 0 or rate <= 0 or channels not in (1, 2):
        raise ValueError("Use notes, positive duration/rate, and mono or stereo")
    samples = array("h")
    count = max(2, int(rate * seconds))
    for frequency in notes:
        for index in range(count):
            env = min(1.0, index / max(1.0, rate * 0.008), (count - 1 - index) / max(1.0, rate * 0.018))
            value = round(7600 * env * sin(2 * pi * frequency * index / rate))
            samples.extend([value] * channels)
    return samples.tobytes()


class SoundBank:
    def __init__(self, muted: bool = False):
        self.available = False
        self.enabled = not muted
        self.sounds: dict[str, pygame.mixer.Sound] = {}
        self.played: dict[str, int] = {}
        try:
            spec = pygame.mixer.get_init()
            if spec is None:
                pygame.mixer.init(frequency=22050, size=-16, channels=1, buffer=512, allowedchanges=0)
                spec = (22050, -16, 1)
            rate, fmt, channels = spec
            if (fmt, channels) not in ((-16, 1), (-16, 2)):
                self.enabled = False
                return
            for name, (notes, duration) in EFFECTS.items():
                snd = pygame.mixer.Sound(buffer=make_tone(notes, duration, rate, channels))
                snd.set_volume(0.45)
                self.sounds[name] = snd
            self.available = True
        except pygame.error:
            self.enabled = False

    def play(self, name: str) -> bool:
        if name not in EFFECTS:
            raise ValueError("Unknown sound effect")
        if not self.available or not self.enabled or pygame.mixer.get_init() is None:
            return False
        channel = self.sounds[name].play()
        if channel is None:
            return False
        self.played[name] = self.played.get(name, 0) + 1
        return True

    def toggle(self) -> bool:
        if not self.available or pygame.mixer.get_init() is None:
            self.enabled = False
            return False
        self.enabled = not self.enabled
        if not self.enabled:
            for snd in self.sounds.values():
                snd.stop()
        else:
            self.play("click")
        return self.enabled
