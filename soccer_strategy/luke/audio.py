"""Gentle locally generated sound effects; no downloaded assets."""

from array import array
from functools import lru_cache
from math import isfinite, pi, sin

import pygame

EFFECTS: dict[str, tuple[tuple[int, ...], float]] = {
    "click": ((660,), .04), "try": ((392, 330), .12),
    "success": ((523, 659, 784), .09), "catch": ((180, 130), .04),
    "roll": ((220, 196), .06), "complete": ((523, 659, 784, 1047), .1),
    "boing": ((196, 330, 523), .045), "highfive": ((784, 1047), .065),
}


@lru_cache(maxsize=24)
def make_tone(notes: tuple[int, ...], seconds: float, rate: int, channels: int) -> bytes:
    if not notes or not isfinite(seconds) or seconds <= 0 or rate <= 0 or channels not in (1, 2):
        raise ValueError("Use notes, a positive duration/rate, and mono or stereo")
    samples = array("h")
    count = max(2, int(rate * seconds))
    for frequency in notes:
        for index in range(count):
            envelope = min(1., index / max(1., rate * .01), (count - 1 - index) / max(1., rate * .02))
            value = round(8192 * envelope * sin(2 * pi * frequency * index / rate))
            samples.extend([value] * channels)
    return samples.tobytes()


class SoundBank:
    def __init__(self, muted: bool = False):
        self.available = False
        self.enabled = not muted
        self.sounds: dict[str, pygame.mixer.Sound] = {}
        self.played: dict[str, int] = {}
        try:
            specification = pygame.mixer.get_init()
            if specification is None:
                pygame.mixer.init(frequency=22050, size=-16, channels=1, buffer=512, allowedchanges=0)
                specification = (22050, -16, 1)
            rate, sample_format, channels = specification
            if (sample_format, channels) not in ((-16, 1), (-16, 2)):
                self.enabled = False
                return
            for name, (notes, duration) in EFFECTS.items():
                sound = pygame.mixer.Sound(buffer=make_tone(notes, duration, rate, channels))
                sound.set_volume(.55)
                self.sounds[name] = sound
            self.available = True
        except pygame.error:
            self.enabled = False

    def play(self, name: str) -> bool:
        if name not in EFFECTS:
            raise ValueError("Unknown sound effect")
        if not self.available or not self.enabled:
            return False
        if pygame.mixer.get_init() is None:
            self.available = False
            self.enabled = False
            return False
        channel = self.sounds[name].play()
        if channel is None:
            return False
        self.played[name] = self.played.get(name, 0) + 1
        return True

    def toggle(self) -> bool:
        if not self.available or pygame.mixer.get_init() is None:
            self.available = False
            self.enabled = False
            return False
        self.enabled = not self.enabled
        if not self.enabled:
            for sound in self.sounds.values():
                sound.stop()
        else:
            self.play("click")
        return self.enabled
