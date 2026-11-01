"""Real SDL mixer output and device/mute failure paths."""

from array import array
import os
import unittest

os.environ["SDL_AUDIODRIVER"] = "dummy"
os.environ["PYGAME_HIDE_SUPPORT_PROMPT"] = "1"

import pygame

from soccer_strategy.luke.audio import EFFECTS, SoundBank, make_tone


class AudioTests(unittest.TestCase):
    def tearDown(self):
        pygame.mixer.quit()
        os.environ["SDL_AUDIODRIVER"] = "dummy"

    def test_generated_tone_has_nonzero_faded_signed_samples(self):
        raw = make_tone((440, 660), .08, 8000, 1)
        samples = array("h")
        samples.frombytes(raw)
        self.assertEqual(len(samples), 1280)
        self.assertEqual(samples[0], 0)
        self.assertEqual(samples[-1], 0)
        self.assertGreater(max(samples), 1000)
        self.assertLess(max(abs(value) for value in samples), 12000)
        stereo = array("h")
        stereo.frombytes(make_tone((440,), .08, 8000, 2))
        self.assertEqual(stereo[::2], stereo[1::2])
        for notes, seconds, rate, channels in (((), .1, 8000, 1), ((440,), 0, 8000, 1),
                                               ((440,), float("nan"), 8000, 1),
                                               ((440,), .1, 0, 1), ((440,), .1, 8000, 3)):
            with self.assertRaises(ValueError):
                make_tone(notes, seconds, rate, channels)

    def test_mixer_plays_real_effects_and_mute_stops_them(self):
        pygame.mixer.quit()
        audio = SoundBank()
        self.assertTrue(audio.available)
        self.assertTrue(audio.enabled)
        self.assertTrue(audio.play("success"))
        self.assertGreater(audio.sounds["success"].get_num_channels(), 0)
        self.assertEqual(audio.played["success"], 1)
        self.assertFalse(audio.toggle())
        self.assertEqual(audio.sounds["success"].get_num_channels(), 0)
        self.assertFalse(audio.play("success"))
        self.assertEqual(audio.played["success"], 1)
        self.assertTrue(audio.toggle())
        with self.assertRaises(ValueError):
            audio.play("unknown")
        pygame.mixer.set_num_channels(0)
        self.assertFalse(audio.play("catch"))

    def test_existing_stereo_mixer_and_initial_mute(self):
        pygame.mixer.quit()
        pygame.mixer.init(frequency=8000, size=-16, channels=2, allowedchanges=0)
        audio = SoundBank(muted=True)
        self.assertTrue(audio.available)
        self.assertFalse(audio.enabled)
        self.assertEqual(pygame.mixer.get_init(), (8000, -16, 2))
        self.assertTrue(audio.toggle())
        self.assertTrue(audio.play("roll"))

    def test_unavailable_device_and_unsupported_format_stay_silent(self):
        pygame.mixer.quit()
        os.environ["SDL_AUDIODRIVER"] = "no-such-audio-driver"
        unavailable = SoundBank()
        self.assertFalse(unavailable.available)
        self.assertFalse(unavailable.play("try"))
        self.assertFalse(unavailable.toggle())
        os.environ["SDL_AUDIODRIVER"] = "dummy"
        pygame.mixer.init(frequency=8000, size=8, channels=1, allowedchanges=0)
        unsupported = SoundBank()
        self.assertFalse(unsupported.available)

    def test_losing_the_mixer_does_not_crash_play_or_mute(self):
        audio = SoundBank()
        pygame.mixer.quit()
        self.assertFalse(audio.play("catch"))
        self.assertFalse(audio.available)
        audio = SoundBank()
        pygame.mixer.quit()
        self.assertFalse(audio.toggle())
        self.assertFalse(audio.enabled)

    def test_invalid_sound_data_is_not_hidden_as_a_device_failure(self):
        original = EFFECTS["click"]
        try:
            EFFECTS["click"] = ((), .1)
            with self.assertRaises(ValueError):
                SoundBank()
        finally:
            EFFECTS["click"] = original
