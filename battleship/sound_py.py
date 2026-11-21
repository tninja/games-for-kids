import array
import math
import random

import pygame


class PygameSoundEffects:
    """Zero-dependency procedural sound synthesizer for Pygame Battleship."""

    def __init__(self):
        self.muted = False
        self.played = []
        self.sample_rate = 22050
        self._sounds = {}
        self._ready = False
        self._init_mixer()

    def _init_mixer(self):
        try:
            if not pygame.mixer.get_init():
                pygame.mixer.init(frequency=self.sample_rate, size=-16, channels=1, buffer=512)
            self._ready = True
            self._build_all()
        except Exception:
            self._ready = False

    def _make_sound(self, samples):
        buf = array.array('h', (max(-32767, min(32767, int(v * 32767))) for v in samples))
        return pygame.mixer.Sound(buffer=buf.tobytes())

    def _synth_tone(self, duration, f_start, f_end, wave='sine', volume=0.35, noise_mix=0.0):
        count = max(1, int(self.sample_rate * duration))
        out = []
        phase = 0.0
        rng = random.Random(int(f_start * 10 + duration * 1000))
        for i in range(count):
            t = i / count
            freq = f_start + (f_end - f_start) * t
            phase += 2.0 * math.pi * freq / self.sample_rate
            if wave == 'triangle':
                sig = 2.0 * abs(2.0 * ((phase / (2.0 * math.pi)) % 1.0) - 1.0) - 1.0
            elif wave == 'saw':
                sig = 2.0 * ((phase / (2.0 * math.pi)) % 1.0) - 1.0
            elif wave == 'square':
                sig = 1.0 if math.sin(phase) >= 0 else -1.0
            else:
                sig = math.sin(phase)
            if noise_mix > 0.0:
                sig = sig * (1.0 - noise_mix) + (rng.random() * 2.0 - 1.0) * noise_mix
            env = (1.0 - t) ** 1.4
            out.append(sig * env * volume)
        return out

    def _concat(self, *segments):
        merged = []
        for seg in segments:
            merged.extend(seg)
        return merged

    def _build_all(self):
        self._sounds['launch'] = self._make_sound(self._synth_tone(0.14, 520, 170, 'triangle', 0.25))
        self._sounds['miss'] = self._make_sound(self._synth_tone(0.18, 300, 110, 'sine', 0.25, 0.35))
        self._sounds['hit'] = self._make_sound(self._synth_tone(0.24, 180, 46, 'saw', 0.34, 0.45))
        self._sounds['sunk'] = self._make_sound(
            self._concat(
                self._synth_tone(0.22, 160, 44, 'saw', 0.38, 0.45),
                self._synth_tone(0.26, 120, 32, 'square', 0.32, 0.35),
            )
        )
        self._sounds['sonar'] = self._make_sound(self._synth_tone(0.36, 1180, 1120, 'sine', 0.28))
        self._sounds['bomb'] = self._make_sound(self._synth_tone(0.42, 150, 28, 'saw', 0.42, 0.55))
        self._sounds['combo'] = self._make_sound(
            self._concat(
                self._synth_tone(0.1, 587, 587, 'triangle', 0.26),
                self._synth_tone(0.15, 880, 880, 'triangle', 0.3),
            )
        )
        self._sounds['place'] = self._make_sound(self._synth_tone(0.08, 320, 440, 'triangle', 0.24))
        self._sounds['rotate'] = self._make_sound(self._synth_tone(0.05, 520, 680, 'sine', 0.2))
        self._sounds['click'] = self._make_sound(self._synth_tone(0.05, 640, 480, 'sine', 0.18))
        self._sounds['win'] = self._make_sound(
            self._concat(
                self._synth_tone(0.11, 523, 523, 'triangle', 0.26),
                self._synth_tone(0.11, 659, 659, 'triangle', 0.26),
                self._synth_tone(0.11, 784, 784, 'triangle', 0.28),
                self._synth_tone(0.24, 1046, 1046, 'triangle', 0.32),
            )
        )
        self._sounds['lose'] = self._make_sound(
            self._concat(
                self._synth_tone(0.16, 392, 392, 'saw', 0.22),
                self._synth_tone(0.16, 311, 311, 'saw', 0.22),
                self._synth_tone(0.28, 261, 210, 'saw', 0.26),
            )
        )

    def toggle(self):
        self.muted = not self.muted
        return self.muted

    def play(self, kind):
        if self.muted:
            return False
        self.played.append(kind)
        if len(self.played) > 64:
            self.played.pop(0)
        if self._ready and kind in self._sounds:
            try:
                self._sounds[kind].play()
            except Exception:
                pass
        return True
