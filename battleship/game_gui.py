import math
import sys

import pygame

from game import (
    BADGE_LABELS,
    BattleshipMatch,
    DIFFICULTY_LABELS,
    FLEET_LABELS,
    FLEET_NAMES,
    FLEET_SIZES,
    ProfileStore,
    RULE_LABELS,
    encode_loc,
)
from sound_py import PygameSoundEffects

WIDTH = 1280
HEIGHT = 880

COLORS = {
    'INK': (240, 249, 255),
    'MUTED': (172, 206, 224),
    'NAVY': (12, 42, 68),
    'PANEL': (20, 60, 92),
    'CARD': (30, 78, 114),
    'BORDER': (74, 134, 172),
    'OCEAN': (18, 92, 144),
    'OCEAN_ALT': (22, 102, 156),
    'OCEAN_HOVER': (42, 134, 192),
    'OCEAN_MISS': (17, 68, 108),
    'WAVE': (108, 196, 240),
    'SHIP_SUNK': (98, 54, 68),
    'GREEN': (138, 242, 168),
    'SONAR': (82, 236, 178),
    'GOLD': (255, 214, 92),
    'CORAL': (255, 118, 102),
    'ORANGE': (255, 162, 76),
    'BLUE': (104, 206, 255),
    'PURPLE': (190, 152, 255),
}

HULL_PALETTES = {
    'carrier': ((122, 152, 174), (218, 232, 242), (82, 108, 128)),
    'battleship': ((142, 168, 186), (255, 214, 92), (98, 122, 140)),
    'cruiser': ((120, 176, 196), (164, 238, 255), (78, 124, 146)),
    'submarine': ((76, 154, 158), (255, 214, 92), (52, 114, 120)),
    'destroyer': ((148, 184, 172), (236, 248, 242), (96, 132, 122)),
}

PLAYER_PANEL = pygame.Rect(34, 118, 590, 526)
ENEMY_PANEL = pygame.Rect(656, 118, 590, 526)
ROSTER_PANEL = pygame.Rect(34, 660, 590, 196)
LOG_PANEL = pygame.Rect(656, 660, 590, 196)


class GameGUI:
    def __init__(self, seed=None, persist_profile=True, profile_path=None):
        if not pygame.get_init():
            pygame.init()
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        pygame.display.set_caption("Battleship - Kids Naval Strategy")
        self.clock_obj = pygame.time.Clock()
        self.font_title = pygame.font.Font(None, 44)
        self.font_h2 = pygame.font.Font(None, 30)
        self.font_md = pygame.font.Font(None, 24)
        self.font_sm = pygame.font.Font(None, 20)

        self.sound = PygameSoundEffects()
        self.profile = ProfileStore(path=profile_path, persist=persist_profile)
        self.base_seed = seed
        self.game_count = 0
        self.board_size = 7
        self.play_mode = '1p'
        self.difficulty = 'normal'
        self.rule_mode = 'classic'
        self.helper_mode = False

        self.hover = (-1, -1)
        self.hover_enemy = None
        self.hover_player = None
        self.cursor = [0, 0]
        self.time = 0.0
        self.projectiles = []
        self.particles = []
        self.ripples = []
        self.popups = []
        self.pending_events = []
        self.pending_enemy = set()
        self.pending_player = set()
        self.shake_time = 0.0
        self.shake_duration = 0.35
        self.shake_intensity = 0.0

        self.weapon = 'shot'
        self.placing_mode = False
        self.placing_side = 0
        self.placing_handoff_p2 = False
        self.selected_ship = 'carrier'
        self.place_direction = 'horizontal'
        self.status_message = ''
        self.status_color = COLORS['GREEN']
        self.summary = None
        self.summary_recorded = False

        self.start_new_game(self.board_size)

    def _next_seed(self):
        if self.base_seed is not None:
            self.game_count += 1
            return self.base_seed + self.game_count - 1
        return None

    def clear_visuals(self):
        self.projectiles = []
        self.particles = []
        self.ripples = []
        self.popups = []
        self.pending_events = []
        self.pending_enemy = set()
        self.pending_player = set()
        self.shake_time = 0.0
        self.shake_intensity = 0.0

    def start_new_game(self, board_size):
        self.clear_visuals()
        self.board_size = 10 if board_size == 10 else 7
        self.match = BattleshipMatch(
            board_size=self.board_size,
            seed=self._next_seed(),
            play_mode=self.play_mode,
            difficulty=self.difficulty,
            rule_mode=self.rule_mode,
            helper_mode=self.helper_mode,
        )
        self.cursor = [0, 0]
        self.weapon = 'shot'
        self.selected_ship = 'carrier'
        self.place_direction = 'horizontal'
        self.placing_handoff_p2 = False
        self.summary = None
        self.summary_recorded = False
        if self.play_mode == '2p':
            self.placing_mode = True
            self.placing_side = 0
            self.status_message = "Player 1: Place your fleet or click Random, then Ready!"
            self.status_color = COLORS['GOLD']
        else:
            self.placing_mode = False
            self.placing_side = 0
            self.status_message = f"Your turn! Aim at Enemy Fleet ({self.board_size}x{self.board_size})."
            self.status_color = COLORS['GREEN']

    def phase(self):
        if self.match.game_over:
            return 'gameover'
        if self.placing_handoff_p2 or self.match.waiting_handoff:
            return 'handoff'
        if self.placing_mode:
            return 'place'
        return 'battle'

    def handoff_title(self):
        if self.placing_handoff_p2:
            return "PASS TO PLAYER 2 TO PLACE SHIPS"
        if self.match.waiting_handoff:
            nxt = "PLAYER 2" if self.match.active_player_index == 0 else "PLAYER 1"
            return f"PASS TO {nxt}"
        return ""

    def grid_metrics(self, panel):
        n = self.board_size
        cell_size = 42 if n == 10 else 58
        grid_px = n * cell_size
        origin_x = panel.x + (panel.width - grid_px) // 2 + 12
        origin_y = panel.y + 72
        return origin_x, origin_y, cell_size, grid_px

    def cell_center(self, panel, row, col):
        ox, oy, cs, _ = self.grid_metrics(panel)
        return (ox + (col + 0.5) * cs, oy + (row + 0.5) * cs)

    def cell_at_point(self, panel, pos):
        ox, oy, cs, _ = self.grid_metrics(panel)
        col = (pos[0] - ox) // cs
        row = (pos[1] - oy) // cs
        if 0 <= row < self.board_size and 0 <= col < self.board_size:
            return (int(row), int(col))
        return None

    def is_enemy_revealed(self, row, col):
        side = self.match.player if self.play_mode == '1p' else self.match.active_player()
        return side.hit_record_at(row, col) is not None and (row, col) not in self.pending_enemy

    def is_player_revealed(self, row, col):
        side = self.match.player if self.play_mode == '1p' else self.match.active_player()
        return side.was_hit_at(row, col) and (row, col) not in self.pending_player

    def revealed_hit_count(self, fleet, is_player_side):
        count = 0
        for hx, hy in fleet.hits:
            rev = self.is_player_revealed(hx, hy) if is_player_side else self.is_enemy_revealed(hx, hy)
            if rev:
                count += 1
        return count

    def primary_buttons(self):
        can_reroll = self.match.shots_fired == 0 and not self.match.game_over and not self.placing_handoff_p2
        return [
            {'rect': pygame.Rect(528, 14, 162, 42), 'label': 'Sound: Off (M)' if self.sound.muted else 'Sound: On (M)', 'action': 'toggle_sound', 'disabled': False},
            {'rect': pygame.Rect(702, 14, 164, 42), 'label': 'Re-roll (F)', 'action': 'reroll', 'disabled': not can_reroll},
            {'rect': pygame.Rect(878, 14, 190, 42), 'label': f'Board: {self.board_size}x{self.board_size} (G)', 'action': 'toggle_size', 'disabled': False},
            {'rect': pygame.Rect(1080, 14, 166, 42), 'label': 'New Game (R)', 'action': 'new_game', 'disabled': False},
        ]

    def mode_buttons(self):
        can_place = self.match.shots_fired == 0 and not self.match.game_over and not self.placing_handoff_p2
        return [
            {'rect': pygame.Rect(34, 68, 126, 36), 'label': 'Mode: 2P' if self.play_mode == '2p' else 'Mode: 1P', 'action': 'toggle_mode', 'disabled': False, 'active': self.play_mode == '2p'},
            {'rect': pygame.Rect(170, 68, 152, 36), 'label': f'AI: {DIFFICULTY_LABELS[self.difficulty]}', 'action': 'cycle_ai', 'disabled': self.play_mode == '2p'},
            {'rect': pygame.Rect(332, 68, 166, 36), 'label': f'Rules: {RULE_LABELS[self.rule_mode]}', 'action': 'cycle_rules', 'disabled': False, 'active': self.rule_mode != 'classic'},
            {'rect': pygame.Rect(508, 68, 148, 36), 'label': 'Helper: On' if self.helper_mode else 'Helper: Off', 'action': 'toggle_helper', 'disabled': False, 'active': self.helper_mode},
            {'rect': pygame.Rect(666, 68, 146, 36), 'label': 'Done Place' if self.placing_mode else 'Place Ships', 'action': 'finish_place' if self.placing_mode else 'toggle_place', 'disabled': not can_place, 'active': self.placing_mode},
        ]

    def skill_buttons(self):
        idx = self.match.active_player_index
        in_battle = self.phase() == 'battle'
        sonar_left = self.match.sonar_left[idx]
        bomb_left = self.match.bomb_left[idx]
        return [
            {'rect': pygame.Rect(850, 68, 112, 36), 'label': 'Shot (1)', 'action': 'select_shot', 'disabled': not in_battle, 'active': self.weapon == 'shot', 'accent': COLORS['BLUE']},
            {'rect': pygame.Rect(972, 68, 132, 36), 'label': f'Sonar:{sonar_left} (2)', 'action': 'select_sonar', 'disabled': (not in_battle) or sonar_left <= 0 or self.match.sonar_used_turn[idx] == self.match.turn_number, 'active': self.weapon == 'sonar', 'accent': COLORS['SONAR']},
            {'rect': pygame.Rect(1114, 68, 132, 36), 'label': f'Bomb:{bomb_left} (3)', 'action': 'select_bomb', 'disabled': (not in_battle) or bomb_left <= 0, 'active': self.weapon == 'bomb', 'accent': COLORS['ORANGE']},
        ]

    def dock_rects(self):
        cards = []
        for i, name in enumerate(FLEET_NAMES):
            cards.append((name, pygame.Rect(ENEMY_PANEL.x + 28, ENEMY_PANEL.y + 84 + i * 62, ENEMY_PANEL.width - 56, 52)))
        btn_y = ENEMY_PANEL.y + ENEMY_PANEL.height - 116
        half_w = (ENEMY_PANEL.width - 70) // 2
        rot_label = 'Rotate: Horiz (T)' if self.place_direction == 'horizontal' else 'Rotate: Vert (T)'
        ready_label = 'Player 1 Ready -> Pass to P2' if (self.play_mode == '2p' and self.placing_side == 0) else 'Start Battle!'
        return {
            'cards': cards,
            'rotate': {'rect': pygame.Rect(ENEMY_PANEL.x + 28, btn_y, half_w, 42), 'label': rot_label, 'action': 'rotate_ship', 'disabled': False},
            'random': {'rect': pygame.Rect(ENEMY_PANEL.x + 42 + half_w, btn_y, half_w, 42), 'label': 'Random Fleet (F)', 'action': 'reroll', 'disabled': False},
            'ready': {'rect': pygame.Rect(ENEMY_PANEL.x + 28, btn_y + 52, ENEMY_PANEL.width - 56, 46), 'label': ready_label, 'action': 'finish_place', 'disabled': False, 'active': True, 'accent': COLORS['GREEN']},
        }

    def handoff_button_rect(self):
        return pygame.Rect(WIDTH // 2 - 170, HEIGHT // 2 + 24, 340, 58)

    def _add_popup(self, pos, text, color):
        self.popups.append({'x': pos[0], 'y': pos[1] - 8, 'text': text, 'color': color, 'life': 1.0, 'max_life': 1.0})

    def _spawn_impact(self, center, kind):
        is_hit = kind in ('hit', 'sunk')
        ring_color = COLORS['GOLD'] if kind == 'sunk' else COLORS['CORAL'] if is_hit else COLORS['BLUE']
        self.ripples.append({'x': center[0], 'y': center[1], 'life': 0.55 if kind == 'sunk' else 0.4, 'max_life': 0.55 if kind == 'sunk' else 0.4, 'max_r': 46 if kind == 'sunk' else 28, 'color': ring_color, 'lw': 4 if kind == 'sunk' else 3})
        count = 20 if kind == 'sunk' else 12 if is_hit else 8
        for i in range(count):
            angle = (math.pi * 2 * i) / count + (i % 2) * 0.2
            speed = (135 if kind == 'sunk' else 95 if is_hit else 55) * (0.5 + (i % 3) * 0.25)
            col = (COLORS['CORAL'] if i % 2 == 0 else COLORS['GOLD']) if is_hit else COLORS['BLUE']
            self.particles.append({'x': center[0], 'y': center[1], 'vx': math.cos(angle) * speed, 'vy': math.sin(angle) * speed - (24 if is_hit else 14), 'life': 0.65 if kind == 'sunk' else 0.45, 'max_life': 0.65 if kind == 'sunk' else 0.45, 'color': col, 'size': 5 if kind == 'sunk' else 4})

    def _spawn_sonar_pulse(self, center):
        self.ripples.append({'x': center[0], 'y': center[1], 'life': 0.75, 'max_life': 0.75, 'max_r': 96, 'color': COLORS['SONAR'], 'lw': 4})

    def _spawn_confetti(self):
        palette = (COLORS['GREEN'], COLORS['GOLD'], COLORS['BLUE'], COLORS['CORAL'], COLORS['PURPLE'])
        for i in range(40):
            angle = -math.pi + (math.pi * i) / 40
            speed = 140 + (i % 5) * 45
            self.particles.append({'x': ENEMY_PANEL.centerx, 'y': ENEMY_PANEL.y + 180, 'vx': math.cos(angle) * speed, 'vy': math.sin(angle) * speed, 'life': 1.15, 'max_life': 1.15, 'color': palette[i % len(palette)], 'size': 5})

    def _trigger_shake(self, intensity=8.0):
        self.shake_duration = 0.35
        self.shake_time = self.shake_duration
        self.shake_intensity = intensity

    def _finalize_summary(self):
        if self.summary_recorded or not self.match.game_over:
            return
        self.summary_recorded = True
        eval_idx = 0 if self.play_mode == '1p' else (1 if self.match.winner == self.match.players[1].name else 0)
        res = self.match.evaluate_badges(eval_idx)
        won = (self.match.winner == 'You') if self.play_mode == '1p' else True
        new_badges = self.profile.record_match(won, res['stars'], res['badges'])
        self.summary = {
            'winner': self.match.winner or 'You',
            'player_won': won,
            'accuracy': res['accuracy'],
            'stars': res['stars'],
            'best_streak': self.match.best_streak[eval_idx],
            'new_badges': new_badges,
            'rank_name': self.profile.rank_name(),
            'total_stars': self.profile.data['stars'],
        }

    def flush_visual_queue(self):
        while self.pending_events or self.projectiles:
            for p in self.projectiles:
                if not p['resolved']:
                    p['resolved'] = True
                    p['on_impact'](True)
            self.projectiles = []
            if self.pending_events:
                evts = self.pending_events[:]
                self.pending_events = []
                for evt in evts:
                    evt['fn'](True)
        self.pending_enemy.clear()
        self.pending_player.clear()
        self.particles = []
        self.ripples = []
        self.popups = []
        self.shake_time = 0.0

    def tick(self, dt):
        dt = max(0.0, float(dt))
        self.time += dt

        rem_events = []
        for evt in self.pending_events:
            evt['delay'] -= dt
            if evt['delay'] <= 0:
                evt['fn'](False)
            else:
                rem_events.append(evt)
        self.pending_events = rem_events

        rem_proj = []
        for p in self.projectiles:
            p['elapsed'] += dt
            if p['elapsed'] >= p['duration']:
                if not p['resolved']:
                    p['resolved'] = True
                    p['on_impact'](False)
            else:
                rem_proj.append(p)
        self.projectiles = rem_proj

        rem_parts = []
        for pt in self.particles:
            pt['life'] -= dt
            if pt['life'] > 0:
                pt['x'] += pt['vx'] * dt
                pt['y'] += pt['vy'] * dt
                pt['vy'] += 140 * dt
                rem_parts.append(pt)
        self.particles = rem_parts

        self.ripples = [rp for rp in self.ripples if self._step_life(rp, dt)]
        rem_pops = []
        for pop in self.popups:
            pop['life'] -= dt
            if pop['life'] > 0:
                pop['y'] -= 28 * dt
                rem_pops.append(pop)
        self.popups = rem_pops

        if self.shake_time > 0:
            self.shake_time = max(0.0, self.shake_time - dt)

    @staticmethod
    def _step_life(item, dt):
        item['life'] -= dt
        return item['life'] > 0

    def activate(self, action):
        if action == 'toggle_sound':
            muted = self.sound.toggle()
            if not muted:
                self.sound.play('click')
            self.status_message = 'Sound muted.' if muted else 'Sound enabled.'
            self.status_color = COLORS['MUTED']
        elif action == 'reroll':
            self.flush_visual_queue()
            side = self.placing_side if self.placing_mode else 0
            if self.match.reroll_side_fleet(side):
                self.sound.play('click')
                self.status_message = 'Re-rolled fleet positions.'
                self.status_color = COLORS['GOLD']
            else:
                self.status_message = 'Fleet locked after battle starts.'
                self.status_color = COLORS['MUTED']
        elif action == 'toggle_size':
            self.start_new_game(10 if self.board_size == 7 else 7)
            self.sound.play('click')
        elif action == 'new_game':
            self.start_new_game(self.board_size)
            self.sound.play('click')
        elif action == 'toggle_mode':
            self.play_mode = '2p' if self.play_mode == '1p' else '1p'
            self.start_new_game(self.board_size)
            self.sound.play('click')
        elif action == 'cycle_ai':
            if self.play_mode == '2p':
                return
            order = ('easy', 'normal', 'hard')
            self.difficulty = order[(order.index(self.difficulty) + 1) % len(order)]
            self.start_new_game(self.board_size)
            self.sound.play('click')
        elif action == 'cycle_rules':
            order = ('classic', 'streak', 'salvo')
            self.rule_mode = order[(order.index(self.rule_mode) + 1) % len(order)]
            self.start_new_game(self.board_size)
            self.sound.play('click')
        elif action == 'toggle_helper':
            self.helper_mode = not self.helper_mode
            self.match.helper_mode = self.helper_mode
            self.sound.play('click')
            self.status_message = 'Helper On: Marks dead zones and hints after 4 misses.' if self.helper_mode else 'Helper Off.'
            self.status_color = COLORS['BLUE']
        elif action == 'toggle_place':
            if self.match.shots_fired > 0 or self.match.game_over:
                return
            self.placing_mode = not self.placing_mode
            self.placing_side = 0
            self.sound.play('click')
            self.status_message = f"Click YOUR FLEET to place {FLEET_LABELS[self.selected_ship]} (T or Right-Click to rotate)." if self.placing_mode else 'Your turn! Aim at Enemy Fleet.'
            self.status_color = COLORS['GOLD'] if self.placing_mode else COLORS['GREEN']
        elif action == 'rotate_ship':
            self.place_direction = 'vertical' if self.place_direction == 'horizontal' else 'horizontal'
            self.sound.play('rotate')
        elif action == 'finish_place':
            if not self.placing_mode:
                return
            self.sound.play('click')
            if self.play_mode == '2p' and self.placing_side == 0:
                self.placing_handoff_p2 = True
                self.status_message = 'Pass device to Player 2 to place ships.'
                self.status_color = COLORS['GOLD']
            else:
                self.placing_mode = False
                self.placing_side = 0
                if self.play_mode == '2p':
                    self.match.active_player_index = 1
                    self.match.waiting_handoff = True
                    self.status_message = 'All ships placed! Pass to Player 1 to start battle.'
                    self.status_color = COLORS['GOLD']
                else:
                    self.status_message = 'Fleet locked! Fire at Enemy Fleet!'
                    self.status_color = COLORS['GREEN']
        elif action == 'confirm_handoff':
            self.sound.play('click')
            if self.placing_handoff_p2:
                self.placing_handoff_p2 = False
                self.placing_side = 1
                self.placing_mode = True
                self.status_message = 'Player 2: Place your fleet or click Random, then Start Battle!'
                self.status_color = COLORS['GOLD']
            elif self.match.waiting_handoff:
                self.flush_visual_queue()
                self.match.confirm_handoff()
                self.weapon = 'shot'
                self.status_message = f"{self.match.active_player().name}'s turn! Fire at Enemy Fleet."
                self.status_color = COLORS['GREEN']
        elif action == 'select_shot':
            self.weapon = 'shot'
            self.sound.play('click')
            self.status_message = 'Standard Shot ready.'
            self.status_color = COLORS['BLUE']
        elif action == 'select_sonar':
            idx = self.match.active_player_index
            if self.match.sonar_left[idx] > 0 and self.match.sonar_used_turn[idx] != self.match.turn_number:
                self.weapon = 'sonar'
                self.sound.play('click')
                self.status_message = 'Sonar ready! Click Enemy Fleet to scan 3x3.'
                self.status_color = COLORS['SONAR']
        elif action == 'select_bomb':
            if self.match.bomb_left[self.match.active_player_index] > 0:
                self.weapon = 'bomb'
                self.sound.play('click')
                self.status_message = 'Cross Bomb ready! Click center cell to blast + pattern.'
                self.status_color = COLORS['ORANGE']

    def _schedule_computer_shots(self, res, initial_delay):
        comp_shots = res.get('computer_shots', [])
        for idx, comp in enumerate(comp_shots):
            key = (comp['row'], comp['col'])
            target_pos = self.cell_center(PLAYER_PANEL, comp['row'], comp['col'])
            is_last = idx == len(comp_shots) - 1

            def make_launch(c_info=comp, c_key=key, t_pos=target_pos, last=is_last):
                def launch_fn(ff):
                    if not ff:
                        self.sound.play('launch')

                    def on_imp(ff_imp):
                        self.pending_player.discard(c_key)
                        kind = 'sunk' if c_info['sunk'] else 'hit' if c_info['hit'] else 'miss'
                        if not ff and not ff_imp:
                            self._spawn_impact(t_pos, kind)
                            self.sound.play(kind)
                            if c_info['sunk']:
                                self._trigger_shake(8.0)
                                self._add_popup(t_pos, 'SUNK!', COLORS['CORAL'])
                        if last and res.get('game_over') and res.get('winner') == 'Computer':
                            self._finalize_summary()
                            self.status_message = 'DEFEAT! Computer sank all your ships.'
                            self.status_color = COLORS['CORAL']
                            if not ff and not ff_imp:
                                self.sound.play('lose')
                        elif last and not res.get('hit') and not res.get('sunk'):
                            self.status_message = f"Miss at {res['coord']}. Your turn!"
                            self.status_color = COLORS['BLUE']

                    self.projectiles.append({'from': ENEMY_PANEL.center, 'to': t_pos, 'elapsed': 0.0, 'duration': 0.22, 'color': COLORS['CORAL'], 'radius': 6, 'resolved': False, 'on_impact': on_imp})

                return launch_fn

            self.pending_events.append({'delay': initial_delay + idx * 0.28, 'fn': make_launch()})

    def fire_at(self, row, col):
        if self.phase() in ('handoff', 'place'):
            return {'accepted': False, 'reason': 'not_ready'}
        if self.match.game_over:
            self.flush_visual_queue()
            self._finalize_summary()
            return {'accepted': False, 'reason': 'game_over'}

        if self.weapon == 'sonar':
            res = self.match.use_sonar(row, col)
            if res['accepted']:
                center = self.cell_center(ENEMY_PANEL, row, col)
                self._spawn_sonar_pulse(center)
                self.sound.play('sonar')
                self._add_popup(center, f"SONAR: {res['count']}", COLORS['SONAR'])
                self.weapon = 'shot'
                self.status_message = f"Sonar at {res['coord']}: {res['count']} ship cell(s) in 3x3! Now fire!"
                self.status_color = COLORS['SONAR']
            return res

        if self.weapon == 'bomb':
            self.flush_visual_queue()
            res = self.match.use_cross_bomb(row, col)
            if not res['accepted']:
                self.status_message = 'Pick an untried target area for Cross Bomb.'
                self.status_color = COLORS['GOLD']
                return res
            self.weapon = 'shot'
            cells = res['cells']
            for c_info in cells:
                self.pending_enemy.add((c_info['row'], c_info['col']))
            for cs in res.get('computer_shots', []):
                self.pending_player.add((cs['row'], cs['col']))
            target_center = self.cell_center(ENEMY_PANEL, row, col)
            self.sound.play('launch')
            self.status_message = f"Launching Cross Bomb at {res['coord']}..."
            self.status_color = COLORS['ORANGE']

            def on_bomb_impact(ff):
                hit_count = 0
                for c_info in cells:
                    self.pending_enemy.discard((c_info['row'], c_info['col']))
                    if c_info['hit']:
                        hit_count += 1
                    if not ff:
                        kind = 'sunk' if c_info['sunk'] else 'hit' if c_info['hit'] else 'miss'
                        self._spawn_impact(self.cell_center(ENEMY_PANEL, c_info['row'], c_info['col']), kind)
                if not ff:
                    self.sound.play('bomb')
                    self._trigger_shake(10.0)
                    self._add_popup(target_center, f'BOMB x{hit_count}!', COLORS['ORANGE'])
                if res.get('game_over'):
                    self._finalize_summary()
                    self.status_message = f"VICTORY! {res['winner']} sank all enemy ships!"
                    self.status_color = COLORS['GREEN']
                    if not ff:
                        self._spawn_confetti()
                        self.sound.play('win')
                elif res.get('bonus_turn'):
                    self.status_message = f"Cross Bomb hit {hit_count}! Bonus shot earned!"
                    self.status_color = COLORS['GOLD']
                    if not ff:
                        self.sound.play('combo')
                elif res.get('handoff_required'):
                    self.status_message = f"Cross Bomb hit {hit_count}! Pass to next player."
                    self.status_color = COLORS['GOLD']
                else:
                    self.status_message = f"Cross Bomb hit {hit_count}! Incoming fire..."
                    self.status_color = COLORS['ORANGE']

            self.projectiles.append({'from': PLAYER_PANEL.center, 'to': target_center, 'elapsed': 0.0, 'duration': 0.28, 'color': COLORS['ORANGE'], 'radius': 8, 'resolved': False, 'on_impact': on_bomb_impact})
            self._schedule_computer_shots(res, 0.34)
            return res

        shooter = self.match.active_player()
        if shooter.has_tried(row, col):
            self.status_message = f"Already fired at {encode_loc(row, col)}. Pick another cell."
            self.status_color = COLORS['GOLD']
            return {'accepted': False, 'reason': 'already_fired'}

        self.flush_visual_queue()
        res = self.match.fire(row, col)
        if not res['accepted']:
            return res

        self.pending_enemy.add((row, col))
        for cs in res.get('computer_shots', []):
            self.pending_player.add((cs['row'], cs['col']))

        target_center = self.cell_center(ENEMY_PANEL, row, col)
        self.sound.play('launch')
        self.status_message = f"Firing at {res['coord']}..."
        self.status_color = COLORS['GOLD']

        def on_shot_impact(ff):
            self.pending_enemy.discard((row, col))
            kind = 'sunk' if res['sunk'] else 'hit' if res['hit'] else 'miss'
            if not ff:
                self._spawn_impact(target_center, kind)
                self.sound.play(kind)
                if res['sunk']:
                    self._trigger_shake(8.0)
                    self._add_popup(target_center, 'SUNK!', COLORS['GOLD'])
                elif res['hit']:
                    st = res.get('streak_count', 1)
                    self._add_popup(target_center, f'{st}x COMBO!' if st >= 2 else 'HIT!', COLORS['GOLD'] if st >= 2 else COLORS['CORAL'])
                    if st >= 2:
                        self.sound.play('combo')
            if res.get('game_over') and res.get('winner') != 'Computer':
                self._finalize_summary()
                self.status_message = f"VICTORY! {res['winner']} sank all enemy ships!"
                self.status_color = COLORS['GREEN']
                if not ff:
                    self._spawn_confetti()
                    self.sound.play('win')
            elif res.get('bonus_turn') and self.rule_mode == 'salvo':
                self.status_message = f"Salvo! {res.get('salvo_remaining', 1)} more shot(s) this turn."
                self.status_color = COLORS['GOLD']
            elif res.get('bonus_turn') and self.rule_mode == 'streak':
                self.status_message = f"Hit at {res['coord']}! {res.get('streak_count', 1)}x streak - Fire again!"
                self.status_color = COLORS['GOLD']
            elif res['sunk']:
                self.status_message = f"Direct hit at {res['coord']}! Enemy {FLEET_LABELS[res['sunk']]} sunk!"
                self.status_color = COLORS['GREEN']
            elif res['hit']:
                self.status_message = f"Hit at {res['coord']}! ({FLEET_LABELS[res['hit']]})"
                self.status_color = COLORS['GOLD']
            elif res.get('handoff_required'):
                self.status_message = f"Miss at {res['coord']}. Pass to next player."
                self.status_color = COLORS['BLUE']
            else:
                self.status_message = f"Miss at {res['coord']}. Incoming fire..."
                self.status_color = COLORS['BLUE']

        self.projectiles.append({'from': PLAYER_PANEL.center, 'to': target_center, 'elapsed': 0.0, 'duration': 0.22, 'color': COLORS['GOLD'], 'radius': 6, 'resolved': False, 'on_impact': on_shot_impact})
        self._schedule_computer_shots(res, 0.28)
        return res

    def place_selected_at(self, row, col):
        if not self.match.place_ship(self.placing_side, self.selected_ship, row, col, self.place_direction):
            self.status_message = f"Cannot place {FLEET_LABELS[self.selected_ship]} there."
            self.status_color = COLORS['CORAL']
            return False
        self.sound.play('place')
        idx = FLEET_NAMES.index(self.selected_ship)
        self.selected_ship = FLEET_NAMES[(idx + 1) % len(FLEET_NAMES)]
        self.status_message = f"Placed! Next: {FLEET_LABELS[self.selected_ship]}."
        self.status_color = COLORS['GREEN']
        return True

    def handle_motion(self, pos):
        self.hover = pos
        self.hover_enemy = self.cell_at_point(ENEMY_PANEL, pos)
        self.hover_player = self.cell_at_point(PLAYER_PANEL, pos)

    def handle_click(self, pos, button=1):
        self.hover = pos
        if button == 3:
            if self.placing_mode:
                self.activate('rotate_ship')
            return

        if self.phase() == 'handoff':
            if self.handoff_button_rect().collidepoint(pos):
                self.activate('confirm_handoff')
            return

        for btn in self.primary_buttons() + self.mode_buttons() + self.skill_buttons():
            if not btn['disabled'] and btn['rect'].collidepoint(pos):
                self.activate(btn['action'])
                return

        if self.placing_mode:
            dock = self.dock_rects()
            for name, rect in dock['cards']:
                if rect.collidepoint(pos):
                    self.selected_ship = name
                    self.sound.play('click')
                    return
            for key in ('rotate', 'random', 'ready'):
                if dock[key]['rect'].collidepoint(pos):
                    self.activate(dock[key]['action'])
                    return
            cell = self.cell_at_point(PLAYER_PANEL, pos)
            if cell is not None:
                self.place_selected_at(cell[0], cell[1])
            return

        if self.play_mode == '1p' and self.match.shots_fired == 0 and not self.match.game_over:
            p_cell = self.cell_at_point(PLAYER_PANEL, pos)
            if p_cell is not None:
                fl = self.match.player.fleet_group.find_at(p_cell[0], p_cell[1])
                if fl is not None:
                    self.placing_mode = True
                    self.placing_side = 0
                    self.selected_ship = fl.name
                    self.place_direction = fl.direction
                    self.sound.play('click')
                    self.status_message = f"Moving {FLEET_LABELS[fl.name]}. Click a spot or press T to rotate."
                    self.status_color = COLORS['GOLD']
                    return

        e_cell = self.cell_at_point(ENEMY_PANEL, pos)
        if e_cell is not None:
            self.cursor = [e_cell[0], e_cell[1]]
            self.fire_at(e_cell[0], e_cell[1])

    def handle_key(self, key):
        if self.phase() == 'handoff':
            if key in (pygame.K_RETURN, pygame.K_SPACE):
                self.activate('confirm_handoff')
            return
        max_idx = self.board_size - 1
        if key in (pygame.K_UP, pygame.K_w):
            self.cursor[0] = max(0, self.cursor[0] - 1)
        elif key in (pygame.K_DOWN, pygame.K_s):
            self.cursor[0] = min(max_idx, self.cursor[0] + 1)
        elif key in (pygame.K_LEFT, pygame.K_a):
            self.cursor[1] = max(0, self.cursor[1] - 1)
        elif key in (pygame.K_RIGHT, pygame.K_d):
            self.cursor[1] = min(max_idx, self.cursor[1] + 1)
        elif key in (pygame.K_RETURN, pygame.K_SPACE):
            if self.placing_mode:
                self.place_selected_at(self.cursor[0], self.cursor[1])
            else:
                self.fire_at(self.cursor[0], self.cursor[1])
        elif key == pygame.K_t and self.placing_mode:
            self.activate('rotate_ship')
        elif key == pygame.K_p:
            self.activate('finish_place' if self.placing_mode else 'toggle_place')
        elif key == pygame.K_1:
            self.activate('select_shot')
        elif key == pygame.K_2:
            self.activate('select_sonar')
        elif key == pygame.K_3:
            self.activate('select_bomb')
        elif key == pygame.K_h:
            self.activate('toggle_helper')
        elif key == pygame.K_f:
            self.activate('reroll')
        elif key == pygame.K_g:
            self.activate('toggle_size')
        elif key == pygame.K_m:
            self.activate('toggle_sound')
        elif key == pygame.K_r:
            self.activate('new_game')

    def _draw_button(self, surf, btn, small=False):
        rect = btn['rect']
        disabled = btn['disabled']
        active = btn.get('active', False)
        accent = btn.get('accent', COLORS['GREEN'])
        is_hover = (not disabled) and rect.collidepoint(self.hover)
        bg = (20, 48, 70) if disabled else (36, 98, 128) if active else (44, 108, 146) if is_hover else COLORS['CARD']
        border = (46, 82, 106) if disabled else accent if active else COLORS['GOLD'] if is_hover else COLORS['BORDER']
        txt_col = COLORS['MUTED'] if disabled else accent if active else COLORS['INK']
        pygame.draw.rect(surf, bg, rect, border_radius=10)
        pygame.draw.rect(surf, border, rect, width=2, border_radius=10)
        font = self.font_sm if small else self.font_md
        txt = font.render(btn['label'], True, txt_col)
        surf.blit(txt, txt.get_rect(center=rect.center))

    def _draw_ship_hull(self, surf, fleet, panel, sunk=False, ghost=False, selected=False):
        if not fleet.coordinates:
            return
        ox, oy, cs, _ = self.grid_metrics(panel)
        r0, c0 = fleet.coordinates[0]
        is_horiz = fleet.direction == 'horizontal'
        pad = max(4, int(cs * 0.12))
        x = ox + c0 * cs + pad
        y = oy + r0 * cs + pad
        w = (fleet.size * cs if is_horiz else cs) - pad * 2
        h = (cs if is_horiz else fleet.size * cs) - pad * 2

        main_c, trim_c, deck_c = HULL_PALETTES.get(fleet.name, HULL_PALETTES['destroyer'])
        if sunk:
            main_c, trim_c, deck_c = COLORS['SHIP_SUNK'], (176, 112, 118), (68, 36, 46)
        border_c = COLORS['GOLD'] if selected else trim_c

        layer = pygame.Surface((w + 8, h + 8), pygame.SRCALPHA)
        lx, ly = 4, 4
        if fleet.name == 'submarine':
            pygame.draw.rect(layer, main_c, pygame.Rect(lx, ly, w, h), border_radius=min(w, h) // 2)
            pygame.draw.rect(layer, border_c, pygame.Rect(lx, ly, w, h), width=3 if selected else 2, border_radius=min(w, h) // 2)
        elif is_horiz:
            bow = int(min(cs * 0.42, w * 0.24))
            pts = [(lx + 4, ly + 2), (lx + w - bow, ly + 2), (lx + w, ly + h // 2), (lx + w - bow, ly + h - 2), (lx + 4, ly + h - 2), (lx, ly + int(h * 0.72)), (lx, ly + int(h * 0.28))]
            pygame.draw.polygon(layer, main_c, pts)
            pygame.draw.polygon(layer, border_c, pts, 3 if selected else 2)
        else:
            bow = int(min(cs * 0.42, h * 0.24))
            pts = [(lx + w // 2, ly), (lx + w - 2, ly + bow), (lx + w - 2, ly + h - 4), (lx + int(w * 0.72), ly + h), (lx + int(w * 0.28), ly + h), (lx + 2, ly + h - 4), (lx + 2, ly + bow)]
            pygame.draw.polygon(layer, main_c, pts)
            pygame.draw.polygon(layer, border_c, pts, 3 if selected else 2)

        cx, cy = lx + w // 2, ly + h // 2
        if fleet.name == 'carrier':
            if is_horiz:
                pygame.draw.rect(layer, deck_c, pygame.Rect(lx + 8, ly + 6, max(4, w - 24), max(4, h - 12)))
                pygame.draw.line(layer, trim_c, (lx + 12, cy), (lx + w - 18, cy), 2)
            else:
                pygame.draw.rect(layer, deck_c, pygame.Rect(lx + 6, ly + 14, max(4, w - 12), max(4, h - 22)))
                pygame.draw.line(layer, trim_c, (cx, ly + 18), (cx, ly + h - 10), 2)
        elif fleet.name == 'battleship':
            rt = max(4, int(min(w, h) * 0.22))
            pos_list = [(int(lx + w * 0.28), cy), (int(lx + w * 0.68), cy)] if is_horiz else [(cx, int(ly + h * 0.32)), (cx, int(ly + h * 0.72))]
            for tx, ty in pos_list:
                pygame.draw.circle(layer, deck_c, (tx, ty), rt)
                if is_horiz:
                    pygame.draw.line(layer, trim_c, (tx, ty), (tx + rt + 6, ty), 3)
                else:
                    pygame.draw.line(layer, trim_c, (tx, ty), (tx, ty - rt - 6), 3)
        elif fleet.name == 'submarine':
            rt = max(4, int(min(w, h) * 0.22))
            pygame.draw.circle(layer, deck_c, (cx, cy), rt)
            pygame.draw.circle(layer, trim_c, (cx, cy), max(2, rt // 2))
        elif fleet.name == 'cruiser':
            bw = int(w * (0.36 if is_horiz else 0.5))
            bh = int(h * (0.5 if is_horiz else 0.36))
            pygame.draw.rect(layer, deck_c, pygame.Rect(cx - bw // 2, cy - bh // 2, bw, bh))
            pygame.draw.circle(layer, trim_c, (cx, cy), max(3, int(min(w, h) * 0.16)), 2)
        else:
            pygame.draw.circle(layer, deck_c, (cx, cy), max(3, int(min(w, h) * 0.18)))
            pygame.draw.rect(layer, trim_c, pygame.Rect(cx - 2, cy - 2, 4, 4))

        if sunk:
            for i in range(3):
                t = (self.time * 0.8 + i * 0.33) % 1.0
                bx = int(lx + w * (0.25 + i * 0.25))
                by = int(ly + h * 0.75 - t * min(h, 24))
                pygame.draw.circle(layer, COLORS['BLUE'], (bx, by), 2 + i, 1)

        if ghost:
            layer.set_alpha(135)
        surf.blit(layer, (x - 4, y - 4))

    def _draw_board(self, surf, panel, title, subtitle, is_player):
        pygame.draw.rect(surf, COLORS['PANEL'], panel, border_radius=16)
        pygame.draw.rect(surf, COLORS['BORDER'], panel, width=2, border_radius=16)
        surf.blit(self.font_h2.render(title, True, COLORS['BLUE'] if is_player else COLORS['GOLD']), (panel.x + 22, panel.y + 14))
        sub_s = self.font_sm.render(subtitle, True, COLORS['MUTED'])
        surf.blit(sub_s, (panel.right - 22 - sub_s.get_width(), panel.y + 20))

        ox, oy, cs, gpx = self.grid_metrics(panel)
        n = self.board_size
        view_side = self.match.players[self.placing_side] if self.placing_mode else (self.match.player if self.play_mode == '1p' else self.match.active_player())
        target_side = self.match.computer if self.play_mode == '1p' else self.match.opponent_player()
        helper_dead = self.match.impossible_enemy_cells() if (not is_player and self.helper_mode) else set()
        hint = self.match.helper_hint() if (not is_player and self.helper_mode) else None

        for i in range(n):
            col_hi = hint and hint['axis'] == 'col' and hint['index'] == i
            row_hi = hint and hint['axis'] == 'row' and hint['index'] == i
            cl = self.font_sm.render(str(i + 1), True, COLORS['GOLD'] if col_hi else COLORS['MUTED'])
            surf.blit(cl, cl.get_rect(center=(ox + i * cs + cs // 2, oy - 14)))
            rl = self.font_sm.render(chr(65 + i), True, COLORS['GOLD'] if row_hi else COLORS['MUTED'])
            surf.blit(rl, rl.get_rect(center=(ox - 16, oy + i * cs + cs // 2)))

        for r in range(n):
            for c in range(n):
                rect = pygame.Rect(ox + c * cs, oy + r * cs, cs, cs)
                fill = COLORS['OCEAN'] if (r + c) % 2 == 0 else COLORS['OCEAN_ALT']
                if not is_player:
                    rec = view_side.hit_record_at(r, c) if self.is_enemy_revealed(r, c) else None
                    if rec is not None and not rec[2]:
                        fill = COLORS['OCEAN_MISS']
                    elif self.hover_enemy == (r, c) and not self.match.game_over:
                        fill = COLORS['OCEAN_HOVER']
                pygame.draw.rect(surf, fill, rect)
                shift = int(math.sin(self.time * 2.2 + r * 0.9 + c * 0.7) * 3)
                pygame.draw.line(surf, (42, 134, 186), (rect.x + 8 + shift, rect.y + int(cs * 0.35)), (rect.right - 10 + shift, rect.y + int(cs * 0.35)), 1)
                pygame.draw.rect(surf, (48, 122, 168), rect, 1)
                if (r, c) in helper_dead:
                    pygame.draw.circle(surf, COLORS['MUTED'], rect.center, 3)

        if is_player:
            for fl in view_side.fleet_group.fleets:
                sunk = self.revealed_hit_count(fl, True) == fl.size
                self._draw_ship_hull(surf, fl, panel, sunk=sunk, selected=(self.placing_mode and fl.name == self.selected_ship))
            if self.placing_mode:
                anchor = self.hover_player if self.hover_player is not None else tuple(self.cursor)
                size = FLEET_SIZES[self.selected_ship]
                valid = self.match.can_place_ship(self.placing_side, self.selected_ship, anchor[0], anchor[1], self.place_direction)
                ov = pygame.Surface((cs - 6, cs - 6), pygame.SRCALPHA)
                ov.fill((138, 242, 168, 125) if valid else (255, 118, 102, 125))
                for k in range(size):
                    rr = anchor[0] + k if self.place_direction == 'vertical' else anchor[0]
                    cc = anchor[1] + k if self.place_direction == 'horizontal' else anchor[1]
                    if 0 <= rr < n and 0 <= cc < n:
                        surf.blit(ov, (ox + cc * cs + 3, oy + rr * cs + 3))
        else:
            for fl in target_side.fleet_group.fleets:
                sunk = self.revealed_hit_count(fl, False) == fl.size
                if sunk:
                    self._draw_ship_hull(surf, fl, panel, sunk=True)
                elif self.match.game_over:
                    self._draw_ship_hull(surf, fl, panel, sunk=False, ghost=True)

        for r in range(n):
            for c in range(n):
                rect = pygame.Rect(ox + c * cs, oy + r * cs, cs, cs)
                is_hit_mark = False
                is_miss_mark = False
                if is_player and self.is_player_revealed(r, c):
                    fl = view_side.fleet_group.find_at(r, c)
                    is_hit_mark = fl is not None and fl.has_hit(r, c)
                    is_miss_mark = not is_hit_mark
                elif not is_player and self.is_enemy_revealed(r, c):
                    rec = view_side.hit_record_at(r, c)
                    if rec is not None:
                        is_hit_mark = bool(rec[2])
                        is_miss_mark = not rec[2]
                if is_hit_mark:
                    pulse = 1.0 + 0.14 * math.sin(self.time * 11 + rect.x * 0.1)
                    ro = max(7, int(cs * 0.25 * pulse))
                    pygame.draw.circle(surf, COLORS['CORAL'], (rect.centerx, rect.centery + 2), ro)
                    pygame.draw.circle(surf, COLORS['GOLD'], rect.center, max(4, int(ro * 0.55)))
                    pad = int(cs * 0.28)
                    pygame.draw.line(surf, (255, 246, 210), (rect.x + pad, rect.y + pad), (rect.right - pad, rect.bottom - pad), 3)
                    pygame.draw.line(surf, (255, 246, 210), (rect.right - pad, rect.y + pad), (rect.x + pad, rect.bottom - pad), 3)
                elif is_miss_mark:
                    pygame.draw.circle(surf, COLORS['BLUE'], rect.center, max(5, int(cs * 0.18)), 2)
                    pygame.draw.circle(surf, COLORS['INK'], rect.center, max(2, int(cs * 0.08)))

        if not is_player:
            for scan in self.match.sonar_scans[self.match.active_player_index]:
                r0, c0 = max(0, scan['row'] - 1), max(0, scan['col'] - 1)
                r1, c1 = min(n - 1, scan['row'] + 1), min(n - 1, scan['col'] + 1)
                pygame.draw.rect(surf, COLORS['SONAR'], pygame.Rect(ox + c0 * cs + 2, oy + r0 * cs + 2, (c1 - c0 + 1) * cs - 4, (r1 - r0 + 1) * cs - 4), 2)
                cx, cy = int(ox + (scan['col'] + 0.5) * cs), int(oy + (scan['row'] + 0.5) * cs)
                pygame.draw.circle(surf, (14, 64, 58), (cx, cy), 13)
                pygame.draw.circle(surf, COLORS['SONAR'], (cx, cy), 13, 2)
                st = self.font_sm.render(str(scan['count']), True, COLORS['SONAR'])
                surf.blit(st, st.get_rect(center=(cx, cy)))

            if not self.match.game_over:
                aim = self.hover_enemy if self.hover_enemy is not None else tuple(self.cursor)
                if self.weapon in ('sonar', 'bomb'):
                    ov = pygame.Surface((cs - 4, cs - 4), pygame.SRCALPHA)
                    ov.fill((82, 236, 178, 64) if self.weapon == 'sonar' else (255, 162, 76, 80))
                    offsets = [(dr, dc) for dr in (-1, 0, 1) for dc in (-1, 0, 1)] if self.weapon == 'sonar' else [(0, 0), (-1, 0), (1, 0), (0, -1), (0, 1)]
                    for dr, dc in offsets:
                        rr, cc = aim[0] + dr, aim[1] + dc
                        if 0 <= rr < n and 0 <= cc < n:
                            surf.blit(ov, (ox + cc * cs + 2, oy + rr * cs + 2))
                cur_c = COLORS['SONAR'] if self.weapon == 'sonar' else COLORS['ORANGE'] if self.weapon == 'bomb' else COLORS['GOLD']
                pygame.draw.rect(surf, cur_c, pygame.Rect(ox + self.cursor[1] * cs + 2, oy + self.cursor[0] * cs + 2, cs - 4, cs - 4), 3)

        pygame.draw.rect(surf, COLORS['BORDER'], pygame.Rect(ox, oy, gpx, gpx), 2)

    def _draw_dock(self, surf):
        pygame.draw.rect(surf, COLORS['PANEL'], ENEMY_PANEL, border_radius=16)
        pygame.draw.rect(surf, COLORS['GOLD'], ENEMY_PANEL, width=2, border_radius=16)
        side_name = self.match.players[self.placing_side].name.upper()
        surf.blit(self.font_h2.render(f"{side_name} SHIP DOCK", True, COLORS['GOLD']), (ENEMY_PANEL.x + 24, ENEMY_PANEL.y + 16))
        surf.blit(self.font_sm.render("Pick a ship, then click YOUR FLEET to place it.", True, COLORS['MUTED']), (ENEMY_PANEL.x + 24, ENEMY_PANEL.y + 50))
        dock = self.dock_rects()
        for name, rect in dock['cards']:
            sel = name == self.selected_ship
            pygame.draw.rect(surf, (38, 104, 142) if sel else COLORS['CARD'], rect, border_radius=10)
            pygame.draw.rect(surf, COLORS['GOLD'] if sel else COLORS['BORDER'], rect, width=2, border_radius=10)
            size = FLEET_SIZES[name]
            surf.blit(self.font_md.render(f"{FLEET_LABELS[name]} ({size} cells)", True, COLORS['GOLD'] if sel else COLORS['INK']), (rect.x + 14, rect.y + 15))
            for i in range(size):
                pygame.draw.rect(surf, COLORS['GOLD'] if sel else COLORS['BLUE'], pygame.Rect(rect.right - 26 - i * 18, rect.y + 18, 13, 15))
        for key in ('rotate', 'random', 'ready'):
            self._draw_button(surf, dock[key], small=(key != 'ready'))

    def _draw_captain_portrait(self, surf, rect, cap):
        hat_col = COLORS['BLUE'] if cap['difficulty'] == 'easy' else COLORS['PURPLE'] if cap['difficulty'] == 'hard' else COLORS['GOLD']
        pygame.draw.circle(surf, COLORS['CARD'], rect.center, rect.width // 2)
        pygame.draw.circle(surf, hat_col, rect.center, rect.width // 2, 2)
        cx, cy = rect.centerx, rect.centery + 4
        r = int(rect.width * 0.34)
        pygame.draw.circle(surf, (255, 224, 186), (cx, cy), r)
        pygame.draw.rect(surf, hat_col, pygame.Rect(cx - int(r * 0.95), cy - int(r * 1.15), int(r * 1.9), int(r * 0.5)))
        pygame.draw.rect(surf, COLORS['NAVY'], pygame.Rect(cx - int(r * 1.05), cy - int(r * 0.72), int(r * 2.1), max(3, int(r * 0.2))))
        pygame.draw.circle(surf, COLORS['NAVY'], (cx - int(r * 0.34), cy - int(r * 0.12)), 3)
        pygame.draw.circle(surf, COLORS['NAVY'], (cx + int(r * 0.34), cy - int(r * 0.12)), 3)
        if cap['mood'] == 'shocked':
            pygame.draw.circle(surf, COLORS['NAVY'], (cx, cy + int(r * 0.35)), max(3, int(r * 0.2)), 2)
        else:
            pygame.draw.line(surf, COLORS['NAVY'], (cx - 6, cy + int(r * 0.32)), (cx + 6, cy + int(r * 0.32)), 2)

    def _draw_roster_and_log(self, surf):
        pygame.draw.rect(surf, COLORS['PANEL'], ROSTER_PANEL, border_radius=16)
        pygame.draw.rect(surf, COLORS['BORDER'], ROSTER_PANEL, width=2, border_radius=16)
        view_side = self.match.players[self.placing_side] if self.placing_mode else (self.match.player if self.play_mode == '1p' else self.match.active_player())
        target_side = self.match.computer if self.play_mode == '1p' else self.match.opponent_player()
        surf.blit(self.font_md.render(f"{view_side.name.upper()} SHIPS", True, COLORS['BLUE']), (ROSTER_PANEL.x + 20, ROSTER_PANEL.y + 12))
        surf.blit(self.font_md.render(f"{target_side.name.upper()} SHIPS", True, COLORS['GOLD']), (ROSTER_PANEL.x + 310, ROSTER_PANEL.y + 12))

        for fleets, sx, is_p in ((view_side.fleet_group.fleets, ROSTER_PANEL.x + 20, True), (target_side.fleet_group.fleets, ROSTER_PANEL.x + 310, False)):
            for i, fl in enumerate(fleets):
                y = ROSTER_PANEL.y + 44 + i * 28
                hits = self.revealed_hit_count(fl, is_p)
                sunk = hits == fl.size
                surf.blit(self.font_sm.render(FLEET_LABELS[fl.name], True, COLORS['CORAL'] if sunk else COLORS['INK']), (sx, y))
                for pip in range(fl.size):
                    col = COLORS['CORAL'] if sunk else COLORS['GOLD'] if pip < hits else COLORS['GREEN']
                    pygame.draw.rect(surf, col, pygame.Rect(sx + 122 + pip * 16, y + 3, 11, 11))
                st = self.font_sm.render('SUNK' if sunk else f"{fl.size - hits}/{fl.size}", True, COLORS['CORAL'] if sunk else COLORS['MUTED'])
                surf.blit(st, (sx + 260 - st.get_width(), y))

        border_c = COLORS['BORDER'] if not self.match.game_over else (COLORS['CORAL'] if self.match.winner == 'Computer' else COLORS['GREEN'])
        pygame.draw.rect(surf, COLORS['PANEL'], LOG_PANEL, border_radius=16)
        pygame.draw.rect(surf, border_c, LOG_PANEL, width=2, border_radius=16)
        cap = self.match.captain_info()
        cx = LOG_PANEL.x + (96 if cap else 20)
        if cap:
            self._draw_captain_portrait(surf, pygame.Rect(LOG_PANEL.x + 14, LOG_PANEL.y + 16, 68, 68), cap)
            nm = self.font_sm.render(cap['name'], True, COLORS['GOLD'])
            surf.blit(nm, nm.get_rect(centerx=LOG_PANEL.x + 48, top=LOG_PANEL.y + 92))
            surf.blit(self.font_md.render(f'"{cap["line"]}"', True, COLORS['BLUE']), (cx, LOG_PANEL.y + 14))

        if self.match.game_over and self.summary:
            s = self.summary
            star_txt = f"Stars: {'*' * s['stars']}" if s['stars'] > 0 else 'Keep trying!'
            surf.blit(self.font_md.render(f"{s['winner']} Wins! {star_txt} | Acc: {s['accuracy']}%", True, COLORS['GREEN'] if s['player_won'] else COLORS['CORAL']), (cx, LOG_PANEL.y + (44 if cap else 18)))
            badge_line = (
                "New Badges: " + ", ".join(BADGE_LABELS[b] for b in s['new_badges'])
                if s['new_badges']
                else f"Rank: {s['rank_name']} ({s['total_stars']} stars) | Best Streak: {s['best_streak']}"
            )
            surf.blit(self.font_sm.render(badge_line, True, COLORS['GOLD']), (cx, LOG_PANEL.y + (78 if cap else 54)))
            surf.blit(self.font_sm.render("Enemy ships revealed above! Press R or New Game to play again.", True, COLORS['MUTED']), (cx, LOG_PANEL.y + 158))
            return

        surf.blit(self.font_md.render(self.status_message[:60], True, self.status_color), (cx, LOG_PANEL.y + (42 if cap else 16)))
        for i, line in enumerate(self.match.logs[:3]):
            surf.blit(self.font_sm.render(line[:64], True, COLORS['MUTED']), (cx, LOG_PANEL.y + (76 if cap else 52) + i * 24))
        hint = self.match.helper_hint()
        footer = f"{hint['label']} | Shots: {self.match.shots_fired}" if hint else f"Target: {encode_loc(self.cursor[0], self.cursor[1])} | Shots: {self.match.shots_fired} | 1/2/3 Weapons, P Place"
        surf.blit(self.font_sm.render(footer, True, COLORS['GOLD']), (cx, LOG_PANEL.y + 162))

    def _draw_effects(self, surf):
        for rp in self.ripples:
            frac = 1.0 - rp['life'] / rp['max_life']
            pygame.draw.circle(surf, rp['color'], (int(rp['x']), int(rp['y'])), int(6 + frac * rp['max_r']), rp['lw'])
        for p in self.projectiles:
            t = min(1.0, p['elapsed'] / p['duration'])
            lift = math.sin(math.pi * t) * 58
            px = p['from'][0] + (p['to'][0] - p['from'][0]) * t
            py = p['from'][1] + (p['to'][1] - p['from'][1]) * t - lift
            tail_t = max(0.0, t - 0.14)
            tail_lift = math.sin(math.pi * tail_t) * 58
            tx = p['from'][0] + (p['to'][0] - p['from'][0]) * tail_t
            ty = p['from'][1] + (p['to'][1] - p['from'][1]) * tail_t - tail_lift
            pygame.draw.line(surf, p['color'], (int(tx), int(ty)), (int(px), int(py)), 5)
            pygame.draw.circle(surf, COLORS['INK'], (int(px), int(py)), p['radius'])
        for pt in self.particles:
            pygame.draw.rect(surf, pt['color'], pygame.Rect(int(pt['x'] - pt['size'] / 2), int(pt['y'] - pt['size'] / 2), pt['size'], pt['size']))
        for pop in self.popups:
            s = self.font_h2.render(pop['text'], True, pop['color'])
            surf.blit(s, s.get_rect(center=(int(pop['x']), int(pop['y']))))

    def _draw_handoff_overlay(self, surf):
        ov = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
        ov.fill((10, 32, 54, 240))
        surf.blit(ov, (0, 0))
        card = pygame.Rect(WIDTH // 2 - 270, HEIGHT // 2 - 120, 540, 230)
        pygame.draw.rect(surf, COLORS['PANEL'], card, border_radius=20)
        pygame.draw.rect(surf, COLORS['GOLD'], card, width=3, border_radius=20)
        t1 = self.font_h2.render(self.handoff_title(), True, COLORS['GOLD'])
        surf.blit(t1, t1.get_rect(center=(WIDTH // 2, card.y + 52)))
        t2 = self.font_sm.render("Keep your ships secret! Click Ready or press Space.", True, COLORS['MUTED'])
        surf.blit(t2, t2.get_rect(center=(WIDTH // 2, card.y + 102)))
        self._draw_button(surf, {'rect': self.handoff_button_rect(), 'label': "I'M READY! (Space)", 'action': 'confirm_handoff', 'disabled': False, 'active': True, 'accent': COLORS['GREEN']})

    def draw(self):
        canvas = pygame.Surface((WIDTH, HEIGHT))
        canvas.fill(COLORS['NAVY'])

        canvas.blit(self.font_title.render("BATTLESHIP", True, COLORS['GREEN']), (34, 14))
        rank_txt = f"Rank: {self.profile.rank_name()} | Stars: {self.profile.data['stars']} | Badges: {len(self.profile.data['badges'])}"
        canvas.blit(self.font_sm.render(rank_txt, True, COLORS['GOLD']), (256, 26))

        for btn in self.primary_buttons():
            self._draw_button(canvas, btn, small=False)
        for btn in self.mode_buttons() + self.skill_buttons():
            self._draw_button(canvas, btn, small=True)

        view_title = f"{self.match.players[self.placing_side].name.upper()} FLEET" if self.placing_mode else (f"{self.match.active_player().name.upper()} FLEET" if self.play_mode == '2p' else "YOUR FLEET")
        self._draw_board(canvas, PLAYER_PANEL, view_title, "Click cell to place (T rotate)" if self.placing_mode else "Click ship before battle to move", True)
        if self.placing_mode:
            self._draw_dock(canvas)
        else:
            enemy_title = f"{self.match.opponent_player().name.upper()} WATERS" if self.play_mode == '2p' else "ENEMY FLEET"
            self._draw_board(canvas, ENEMY_PANEL, enemy_title, f"Target: {encode_loc(self.cursor[0], self.cursor[1])}", False)

        self._draw_roster_and_log(canvas)
        self._draw_effects(canvas)
        if self.phase() == 'handoff':
            self._draw_handoff_overlay(canvas)

        dx = dy = 0
        if self.shake_time > 0:
            ratio = self.shake_time / self.shake_duration
            dx = int(math.sin(self.time * 70) * self.shake_intensity * ratio)
            dy = int(math.cos(self.time * 85) * self.shake_intensity * ratio)
        self.screen.fill(COLORS['NAVY'])
        self.screen.blit(canvas, (dx, dy))
        pygame.display.flip()

    def run(self):
        while True:
            dt = min(self.clock_obj.tick(60) / 1000.0, 0.1)
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                elif event.type == pygame.MOUSEMOTION:
                    self.handle_motion(event.pos)
                elif event.type == pygame.MOUSEBUTTONDOWN:
                    self.handle_click(event.pos, button=event.button)
                elif event.type == pygame.KEYDOWN:
                    self.handle_key(event.key)
            self.tick(dt)
            self.draw()


if __name__ == '__main__':
    gui = GameGUI()
    gui.run()
