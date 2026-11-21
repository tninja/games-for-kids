import json
import os
import random
import sys
from pathlib import Path

from fleet import Fleet, FleetGroup

FLEET_NAMES = ('carrier', 'battleship', 'cruiser', 'submarine', 'destroyer')

FLEET_SIZES = {
    'carrier': 5,
    'battleship': 4,
    'cruiser': 3,
    'submarine': 3,
    'destroyer': 3,
    'patrol boat': 1,
    'boater': 2,
    'bomber': 6,
    'speed boat': 3,
    'smasher': 2,
    'f-1': 2,
}

FLEET_LABELS = {
    'carrier': 'Carrier',
    'battleship': 'Battleship',
    'cruiser': 'Cruiser',
    'submarine': 'Submarine',
    'destroyer': 'Destroyer',
}

DIFFICULTY_LABELS = {
    'easy': 'Easy',
    'normal': 'Normal',
    'hard': 'Hard',
}

RULE_LABELS = {
    'classic': 'Classic',
    'streak': 'Streak',
    'salvo': 'Salvo',
}

BADGE_LABELS = {
    'first_win': 'First Win',
    'sharpshooter': 'Sharpshooter',
    'comeback_kid': 'Comeback Kid',
    'sonar_detective': 'Sonar Detective',
    'bomb_blast': 'Bomb Blast',
    'hot_streak': 'Hot Streak',
    'admiral_slayer': 'Admiral Slayer',
}

RANK_TIERS = (
    (28, 'Admiral'),
    (16, 'Commander'),
    (8, 'Captain'),
    (3, 'Ensign'),
    (0, 'Sailor'),
)

CAPTAIN_PROFILES = {
    'easy': {'name': 'Cadet Pip', 'title': 'Easy AI', 'intro': 'Ahoy! Ready to play?'},
    'normal': {'name': 'Captain Morgan', 'title': 'Normal AI', 'intro': 'All hands on deck!'},
    'hard': {'name': 'Admiral Nova', 'title': 'Hard AI', 'intro': 'Show me your best tactics!'},
}


def encode_loc(row, col):
    return chr(ord('A') + row) + str(col + 1)


def orthogonal_neighbors(row, col, board_size):
    rows, cols = board_size if isinstance(board_size, tuple) else (board_size, board_size)
    out = []
    for nr, nc in ((row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)):
        if 0 <= nr < rows and 0 <= nc < cols:
            out.append((nr, nc))
    return out


def rank_for_stars(stars):
    for min_stars, name in RANK_TIERS:
        if stars >= min_stars:
            return name
    return 'Sailor'


class ProfileStore:
    def __init__(self, path=None, persist=True):
        self.persist = persist
        self.path = Path(path) if path else Path(os.path.expanduser('~/.battleship_kids_profile.json'))
        self.data = self.load() if persist else {'wins': 0, 'games': 0, 'stars': 0, 'badges': []}

    def load(self):
        default = {'wins': 0, 'games': 0, 'stars': 0, 'badges': []}
        if not self.persist or not self.path.is_file():
            return default
        try:
            parsed = json.loads(self.path.read_text(encoding='utf-8'))
            return {
                'wins': max(0, int(parsed.get('wins', 0))),
                'games': max(0, int(parsed.get('games', 0))),
                'stars': max(0, int(parsed.get('stars', 0))),
                'badges': list(parsed.get('badges', [])),
            }
        except Exception:
            return default

    def save(self):
        if not self.persist:
            return
        try:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            self.path.write_text(json.dumps(self.data, indent=2), encoding='utf-8')
        except Exception:
            pass

    def rank_name(self):
        return rank_for_stars(self.data['stars'])

    def record_match(self, won, stars_earned, candidate_badges):
        self.data['games'] += 1
        if won:
            self.data['wins'] += 1
            self.data['stars'] += max(0, int(stars_earned))
        newly_unlocked = []
        for badge in candidate_badges:
            if badge not in self.data['badges']:
                self.data['badges'].append(badge)
                newly_unlocked.append(badge)
        self.save()
        return newly_unlocked


class Player:

    def __init__(self, name, board_size=(10, 10)):
        self.name = name
        self.board_size = board_size if isinstance(board_size, tuple) else (board_size, board_size)
        self.fleet_group = FleetGroup()
        self.hit_history = []
        self.was_hit_history = []

    def has_tried(self, x, y):
        return any(hx == x and hy == y for hx, hy, _ in self.hit_history)

    def hit_record_at(self, x, y):
        for rec in self.hit_history:
            if rec[0] == x and rec[1] == y:
                return rec
        return None

    def was_hit_at(self, x, y):
        return (x, y) in self.was_hit_history

    def random_init(self, fleet_names=None, rng=None):
        if fleet_names is None:
            fleet_names = list(FLEET_NAMES)
        gen = rng if rng is not None else random
        rows, cols = self.board_size

        for _ in range(50):
            board = [[0] * cols for _ in range(rows)]
            group = FleetGroup()
            failed = False

            for name in fleet_names:
                size = FLEET_SIZES[name]
                placed = False
                for _ in range(250):
                    direction = gen.choice(['vertical', 'horizontal'])
                    if direction == 'vertical':
                        if rows < size:
                            continue
                        x = gen.randint(0, rows - size)
                        y = gen.randint(0, cols - 1)
                        clear = all(board[x + i][y] == 0 for i in range(size))
                    else:
                        if cols < size:
                            continue
                        x = gen.randint(0, rows - 1)
                        y = gen.randint(0, cols - size)
                        clear = all(board[x][y + i] == 0 for i in range(size))

                    if clear:
                        for i in range(size):
                            if direction == 'vertical':
                                board[x + i][y] = 1
                            else:
                                board[x][y + i] = 1
                        group.add(Fleet(x, y, size, direction, name))
                        placed = True
                        break

                if not placed:
                    failed = True
                    break

            if not failed:
                self.fleet_group = group
                return

        raise RuntimeError(f"Failed to place fleet on board of size {self.board_size}")

    def hit(self, player, x, y):
        player.was_hit_history.append((x, y))
        result = player.fleet_group.hit(x, y)
        self.hit_history.append((x, y, result is not None))
        return result

    def was_hit(self, x, y):
        self.was_hit_history.append((x, y))
        return self.fleet_group.hit(x, y)

    def all_sunk(self):
        return self.fleet_group.all_sunk()

    def show_myself(self):
        board_size = self.board_size
        board = [['.'] * board_size[1] for _ in range(board_size[0])]
        for fleet in self.fleet_group.fleets:
            for coord in fleet.coordinates:
                if coord in fleet.hits:
                    board[coord[0]][coord[1]] = 'X'
                else:
                    board[coord[0]][coord[1]] = 'O'
        for hx, hy in self.was_hit_history:
            if board[hx][hy] == '.':
                board[hx][hy] = '*'
        print('  ' + ' '.join([str(i) for i in range(1, board_size[1] + 1)]))
        for i in range(board_size[0]):
            ch = chr(ord('A') + i)
            print(ch + ' ' + ' '.join(board[i]))

    def show_enemy(self):
        board_size = self.board_size
        board = [['.'] * board_size[1] for _ in range(board_size[0])]
        for hx, hy, is_hit in self.hit_history:
            board[hx][hy] = 'X' if is_hit else '*'
        print('  ' + ' '.join([str(i) for i in range(1, board_size[1] + 1)]))
        for i in range(board_size[0]):
            ch = chr(ord('A') + i)
            print(ch + ' ' + ' '.join(board[i]))

    def log_hit(self, x, y, hit_result):
        loc = self.encodeLoc(x, y)
        print(f"{self.name} shoot on {loc}: ({x}, {y})")
        if hit_result:
            print(f"{self.name} hit on " + hit_result)
        else:
            print(f"{self.name} miss")

    def print_board(self):
        print(f"{self.name}'s hit history: ")
        self.show_enemy()
        print("-------------------------------------")
        print(f"{self.name}'s board: ")
        self.show_myself()

    def encodeLoc(self, x, y):
        return encode_loc(x, y)


class HumanPlayer(Player):

    def input_and_hit(self, player):
        while True:
            loc = input(f"{self.name}, enter location to hit (A1 to J10): ")
            if loc in ('exit', 'quit'):
                print("Game ended")
                sys.exit()
            try:
                x, y = self.decodeLoc(loc)
                if 0 <= x < self.board_size[0] and 0 <= y < self.board_size[1]:
                    break
            except Exception:
                pass
            print("Invalid location, please try again")
        hit_result = self.hit(player, x, y)
        self.log_hit(x, y, hit_result)
        self.print_board()
        print("=====================================")
        return hit_result

    def decodeLoc(self, loc):
        x = ord(loc[0].upper()) - ord('A')
        y = int(loc[1:]) - 1
        return x, y


class ComputerPlayer(Player):

    def __init__(self, name, board_size=(10, 10), difficulty='normal'):
        super().__init__(name, board_size)
        self.difficulty = difficulty

    def _untried_cells(self):
        rows, cols = self.board_size
        return [
            (x, y)
            for x in range(rows)
            for y in range(cols)
            if not self.has_tried(x, y)
        ]

    def _random_shot(self, rng, use_parity=False):
        possible = self._untried_cells()
        if use_parity:
            priority = [(x, y) for x, y in possible if (x + y) % 2 == 0]
            if priority:
                return rng.choice(priority)
        return rng.choice(possible)

    def _probability_shot(self, opponent, rng):
        rows, cols = self.board_size
        scores = [[0] * cols for _ in range(rows)]
        unsunk_sizes = [fl.size for fl in opponent.fleet_group.fleets if not fl.is_sunk()]

        def is_blocked(r, c):
            rec = self.hit_record_at(r, c)
            if rec is None:
                return False
            if not rec[2]:
                return True
            return any(fl.is_sunk() and fl.has_coord(r, c) for fl in opponent.fleet_group.fleets)

        for size in unsunk_sizes:
            for r in range(rows):
                for c in range(cols - size + 1):
                    if all(not is_blocked(r, c + k) for k in range(size)):
                        for k in range(size):
                            if not self.has_tried(r, c + k):
                                scores[r][c + k] += 1
            for r in range(rows - size + 1):
                for c in range(cols):
                    if all(not is_blocked(r + k, c) for k in range(size)):
                        for k in range(size):
                            if not self.has_tried(r + k, c):
                                scores[r + k][c] += 1

        best_score = -1
        best = []
        for r in range(rows):
            for c in range(cols):
                if self.has_tried(r, c):
                    continue
                val = scores[r][c] * 2 + (1 if (r + c) % 2 == 0 else 0)
                if val > best_score:
                    best_score = val
                    best = [(r, c)]
                elif val == best_score:
                    best.append((r, c))
        if best:
            return rng.choice(best)
        return self._random_shot(rng, use_parity=True)

    def choose_next_shot(self, opponent, rng=None):
        gen = rng if rng is not None else random
        rows, cols = self.board_size

        hits_in_progress = []
        for hx, hy, is_hit in self.hit_history:
            if not is_hit:
                continue
            if not any(fl.is_sunk() and fl.has_coord(hx, hy) for fl in opponent.fleet_group.fleets):
                hits_in_progress.append((hx, hy))

        if self.difficulty == 'easy':
            if hits_in_progress and gen.random() < 0.4:
                neighbors = []
                for hx, hy in hits_in_progress:
                    for ax, ay in orthogonal_neighbors(hx, hy, self.board_size):
                        if not self.has_tried(ax, ay):
                            neighbors.append((ax, ay))
                if neighbors:
                    return gen.choice(neighbors)
            return gen.choice(self._untried_cells())

        if hits_in_progress:
            candidates = []
            if len(hits_in_progress) > 1:
                points = sorted(hits_in_progress)
                if points[0][0] == points[1][0]:
                    row = points[0][0]
                    row_cols = [pt[1] for pt in points if pt[0] == row]
                    if min(row_cols) - 1 >= 0:
                        candidates.append((row, min(row_cols) - 1))
                    if max(row_cols) + 1 < cols:
                        candidates.append((row, max(row_cols) + 1))
                else:
                    col = points[0][1]
                    col_rows = [pt[0] for pt in points if pt[1] == col]
                    if min(col_rows) - 1 >= 0:
                        candidates.append((min(col_rows) - 1, col))
                    if max(col_rows) + 1 < rows:
                        candidates.append((max(col_rows) + 1, col))
            else:
                candidates = orthogonal_neighbors(
                    hits_in_progress[0][0], hits_in_progress[0][1], self.board_size
                )

            candidates = [(cx, cy) for cx, cy in candidates if not self.has_tried(cx, cy)]

            if not candidates and len(hits_in_progress) > 1:
                for hx, hy in hits_in_progress:
                    for ax, ay in orthogonal_neighbors(hx, hy, self.board_size):
                        if not self.has_tried(ax, ay):
                            candidates.append((ax, ay))

            if candidates:
                return gen.choice(candidates)

        if self.difficulty == 'hard':
            return self._probability_shot(opponent, gen)

        return self._random_shot(gen, use_parity=False)

    def input_and_hit(self, player):
        x, y = self.choose_next_shot(player)
        hit_result = self.hit(player, x, y)
        self.log_hit(x, y, hit_result)
        print(f"{player.name}'s board: ")
        player.show_myself()
        print("=====================================")
        return hit_result


class BattleshipMatch:
    """Full-featured kids Battleship game engine shared with Pygame GUI."""

    def __init__(
        self,
        board_size=7,
        seed=None,
        play_mode='1p',
        difficulty='normal',
        rule_mode='classic',
        helper_mode=False,
    ):
        self.board_size = 10 if board_size == 10 else 7
        self.play_mode = '2p' if play_mode == '2p' else '1p'
        self.difficulty = difficulty if difficulty in ('easy', 'normal', 'hard') else 'normal'
        self.rule_mode = rule_mode if rule_mode in ('classic', 'streak', 'salvo') else 'classic'
        self.helper_mode = bool(helper_mode)
        self.seed = seed if seed is not None else random.randint(1, 2**31 - 1)
        self.rng = random.Random(self.seed)

        p1_name = 'Player 1' if self.play_mode == '2p' else 'You'
        p2_name = 'Player 2' if self.play_mode == '2p' else 'Computer'
        self.player = Player(p1_name, (self.board_size, self.board_size))
        self.computer = ComputerPlayer(p2_name, (self.board_size, self.board_size), self.difficulty)
        self.players = [self.player, self.computer]
        self.player.random_init(list(FLEET_NAMES), self.rng)
        self.computer.random_init(list(FLEET_NAMES), self.rng)

        self.active_player_index = 0
        self.waiting_handoff = False
        self.turn_number = 1
        self.shots_fired = 0
        self.shots_per_side = [0, 0]
        self.hits_per_side = [0, 0]
        self.current_streak = [0, 0]
        self.best_streak = [0, 0]
        self.miss_streak = [0, 0]
        self.salvo_remaining = self.player.fleet_group.remaining_count() if self.rule_mode == 'salvo' else 1
        self.sonar_left = [2, 2]
        self.bomb_left = [1, 1]
        self.sonar_used_turn = [0, 0]
        self.sonar_scans = [[], []]
        self.last_sonar_center = [None, None]
        self.sonar_detective_earned = [False, False]
        self.bomb_blast_earned = [False, False]
        self.captain_line = CAPTAIN_PROFILES[self.difficulty]['intro']
        self.captain_mood = 'neutral'
        self.game_over = False
        self.winner = None
        self.logs = ['Fleet deployed. Aim with arrows/WASD or click Enemy Fleet.']

    def active_player(self):
        return self.players[self.active_player_index]

    def opponent_player(self):
        return self.players[1 - self.active_player_index]

    def captain_info(self):
        if self.play_mode == '2p':
            return None
        base = CAPTAIN_PROFILES[self.difficulty]
        return {
            'difficulty': self.difficulty,
            'name': base['name'],
            'title': base['title'],
            'line': self.captain_line,
            'mood': self.captain_mood,
        }

    def _set_captain_quip(self, event):
        if self.play_mode == '2p':
            return
        table = {
            'easy': {
                'player_miss': ('Splash! Safe for now!', 'happy'),
                'player_hit': ('Whoa, nice shot!', 'shocked'),
                'player_sunk': ('Oh no, my ship sank!', 'shocked'),
                'ai_hit': ('Yay! I found one!', 'happy'),
                'ai_sunk': ('Woohoo! Down it goes!', 'taunt'),
                'sonar': ('Ooh, radar ping!', 'shocked'),
                'bomb': ('Kaboom! Big splash!', 'shocked'),
                'win': ('You win! Great job!', 'defeated'),
                'lose': ('I won! Play again?', 'proud'),
            },
            'normal': {
                'player_miss': ('Nothing but ocean!', 'taunt'),
                'player_hit': ('Direct hit! Ouch!', 'shocked'),
                'player_sunk': ('You sank my warship!', 'shocked'),
                'ai_hit': ('Right on target!', 'taunt'),
                'ai_sunk': ('One ship down!', 'proud'),
                'sonar': ('Clever sonar sweep!', 'neutral'),
                'bomb': ('Brace for cross blast!', 'shocked'),
                'win': ('Well fought, Captain!', 'defeated'),
                'lose': ('Victory is mine!', 'proud'),
            },
            'hard': {
                'player_miss': ('Wasted shell, rookie.', 'taunt'),
                'player_hit': ('Impressive calculation.', 'neutral'),
                'player_sunk': ('Hull breached! Well played.', 'shocked'),
                'ai_hit': ('Target locked.', 'proud'),
                'ai_sunk': ('Fleet neutralized.', 'proud'),
                'sonar': ('Counter-ping detected.', 'neutral'),
                'bomb': ('Heavy ordnance incoming!', 'shocked'),
                'win': ('You outsmarted the Admiral!', 'defeated'),
                'lose': ('Strategy prevails!', 'proud'),
            },
        }
        self.captain_line, self.captain_mood = table[self.difficulty][event]

    def _push_log(self, line):
        self.logs.insert(0, line)
        if len(self.logs) > 6:
            del self.logs[6:]

    def can_place_ship(self, side_index, name, row, col, direction):
        side = self.players[side_index]
        size = FLEET_SIZES[name]
        return side.fleet_group.is_valid_placement(
            row, col, size, direction, self.board_size, ignore_name=name
        )

    def place_ship(self, side_index, name, row, col, direction):
        if self.shots_fired > 0 or self.game_over:
            return False
        if not self.can_place_ship(side_index, name, row, col, direction):
            return False
        size = FLEET_SIZES[name]
        self.players[side_index].fleet_group.replace_or_add(Fleet(row, col, size, direction, name))
        return True

    def reroll_side_fleet(self, side_index):
        if self.shots_fired > 0 or self.game_over:
            return False
        self.players[side_index].random_init(list(FLEET_NAMES), self.rng)
        self._push_log(f"{self.players[side_index].name} shuffled fleet positions.")
        return True

    def confirm_handoff(self):
        if not self.waiting_handoff:
            return
        self.waiting_handoff = False
        self.active_player_index = 1 - self.active_player_index
        self.turn_number += 1
        self._reset_turn_salvo(self.active_player_index)
        self._push_log(f"{self.active_player().name}'s turn!")

    def _untried_count(self, shooter):
        return self.board_size * self.board_size - len(shooter.hit_history)

    def _reset_turn_salvo(self, side_index):
        if self.rule_mode == 'salvo':
            alive = self.players[side_index].fleet_group.remaining_count()
            untried = self._untried_count(self.players[side_index])
            self.salvo_remaining = max(1, min(alive, untried))
        else:
            self.salvo_remaining = 1

    def use_sonar(self, row, col):
        if self.game_over:
            return {'accepted': False, 'reason': 'game_over'}
        if self.waiting_handoff:
            return {'accepted': False, 'reason': 'not_ready'}
        if not (0 <= row < self.board_size and 0 <= col < self.board_size):
            return {'accepted': False, 'reason': 'out_of_bounds'}
        idx = self.active_player_index
        if self.sonar_left[idx] <= 0:
            return {'accepted': False, 'reason': 'no_charges'}
        if self.sonar_used_turn[idx] == self.turn_number:
            return {'accepted': False, 'reason': 'already_scanned_turn'}

        target = self.opponent_player()
        count = 0
        for r in range(max(0, row - 1), min(self.board_size, row + 2)):
            for c in range(max(0, col - 1), min(self.board_size, col + 2)):
                fl = target.fleet_group.find_at(r, c)
                if fl is not None and not fl.has_hit(r, c):
                    count += 1

        self.sonar_left[idx] -= 1
        self.sonar_used_turn[idx] = self.turn_number
        self.last_sonar_center[idx] = (row, col)
        loc = encode_loc(row, col)
        self.sonar_scans[idx].append({'row': row, 'col': col, 'count': count, 'turn': self.turn_number})
        noun = 'ship cell' if count == 1 else 'ship cells'
        self._push_log(f"{self.active_player().name} sonar at {loc}: {count} {noun} in 3x3!")
        self._set_captain_quip('sonar')
        return {'accepted': True, 'row': row, 'col': col, 'coord': loc, 'count': count}

    def _run_computer_turn(self):
        shots = []
        max_shots = (
            max(1, min(self.computer.fleet_group.remaining_count(), self._untried_count(self.computer)))
            if self.rule_mode == 'salvo'
            else 1
        )
        remaining = max_shots
        while remaining > 0 and not self.player.all_sunk() and self._untried_count(self.computer) > 0:
            tr, tc = self.computer.choose_next_shot(self.player, self.rng)
            loc = encode_loc(tr, tc)
            hit_name = self.computer.hit(self.player, tr, tc)
            self.shots_per_side[1] += 1
            if hit_name:
                self.hits_per_side[1] += 1
            fl = self.player.fleet_group.find_at(tr, tc) if hit_name else None
            sunk_name = fl.name if (fl is not None and fl.is_sunk()) else None

            if sunk_name:
                self._push_log(f"Computer fired {loc}: SUNK your {FLEET_LABELS[sunk_name]}!")
                self._set_captain_quip('ai_sunk')
            elif hit_name:
                self._push_log(f"Computer fired {loc}: Hit your {FLEET_LABELS[hit_name]}.")
                self._set_captain_quip('ai_hit')
            else:
                self._push_log(f"Computer fired {loc}: Miss.")

            shots.append({'coord': loc, 'row': tr, 'col': tc, 'hit': hit_name, 'sunk': sunk_name})
            if self.player.all_sunk():
                self.game_over = True
                self.winner = 'Computer'
                self._push_log('Defeat! Computer sank all your ships.')
                self._set_captain_quip('lose')
                break

            if self.rule_mode == 'streak':
                if not hit_name:
                    remaining = 0
            else:
                remaining -= 1

        if not self.game_over:
            self.turn_number += 1
            self._reset_turn_salvo(0)
        return shots

    def use_cross_bomb(self, row, col):
        if self.game_over:
            return {'accepted': False, 'reason': 'game_over'}
        if self.waiting_handoff:
            return {'accepted': False, 'reason': 'not_ready'}
        if not (0 <= row < self.board_size and 0 <= col < self.board_size):
            return {'accepted': False, 'reason': 'out_of_bounds'}
        idx = self.active_player_index
        if self.bomb_left[idx] <= 0:
            return {'accepted': False, 'reason': 'no_charges'}

        shooter = self.active_player()
        target = self.opponent_player()
        raw = [(row, col), (row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)]
        valid = [
            (r, c)
            for r, c in raw
            if 0 <= r < self.board_size and 0 <= c < self.board_size and not shooter.has_tried(r, c)
        ]
        if not valid:
            return {'accepted': False, 'reason': 'already_fired', 'coord': encode_loc(row, col)}

        self.bomb_left[idx] -= 1
        outcomes = []
        hit_count = 0
        last_hit = None
        last_sunk = None
        for r, c in valid:
            self.shots_fired += 1
            self.shots_per_side[idx] += 1
            loc = encode_loc(r, c)
            hit_name = shooter.hit(target, r, c)
            fl = target.fleet_group.find_at(r, c) if hit_name else None
            sunk_name = fl.name if (fl is not None and fl.is_sunk()) else None
            if hit_name:
                hit_count += 1
                self.hits_per_side[idx] += 1
                last_hit = hit_name
                if sunk_name:
                    last_sunk = sunk_name
            outcomes.append({'coord': loc, 'row': r, 'col': c, 'hit': hit_name, 'sunk': sunk_name})

        if hit_count >= 2:
            self.bomb_blast_earned[idx] = True
        if hit_count > 0:
            self.current_streak[idx] += hit_count
            self.best_streak[idx] = max(self.best_streak[idx], self.current_streak[idx])
            self.miss_streak[idx] = 0
        else:
            self.current_streak[idx] = 0
            self.miss_streak[idx] += 1

        center_loc = encode_loc(row, col)
        self._push_log(f"{shooter.name} Cross Bomb at {center_loc}: {hit_count} hit(s)!")
        self._set_captain_quip('bomb')

        if target.all_sunk():
            self.game_over = True
            self.winner = shooter.name
            self._push_log(f"Victory! {shooter.name} sank the entire enemy fleet.")
            self._set_captain_quip('win')
            return {
                'accepted': True,
                'coord': center_loc,
                'hit': last_hit,
                'sunk': last_sunk,
                'cells': outcomes,
                'computer_shots': [],
                'game_over': True,
                'winner': self.winner,
            }

        if self.rule_mode == 'streak' and hit_count > 0:
            return {
                'accepted': True,
                'coord': center_loc,
                'hit': last_hit,
                'sunk': last_sunk,
                'cells': outcomes,
                'computer_shots': [],
                'bonus_turn': True,
                'streak_count': self.current_streak[idx],
                'game_over': False,
                'winner': None,
            }

        if self.play_mode == '2p':
            self.waiting_handoff = True
            return {
                'accepted': True,
                'coord': center_loc,
                'hit': last_hit,
                'sunk': last_sunk,
                'cells': outcomes,
                'computer_shots': [],
                'handoff_required': True,
                'game_over': False,
                'winner': None,
            }

        comp_shots = self._run_computer_turn()
        return {
            'accepted': True,
            'coord': center_loc,
            'hit': last_hit,
            'sunk': last_sunk,
            'cells': outcomes,
            'computer_shots': comp_shots,
            'game_over': self.game_over,
            'winner': self.winner,
        }

    def fire(self, row, col):
        if self.game_over:
            return {'accepted': False, 'reason': 'game_over'}
        if self.waiting_handoff:
            return {'accepted': False, 'reason': 'not_ready'}
        if not (0 <= row < self.board_size and 0 <= col < self.board_size):
            return {'accepted': False, 'reason': 'out_of_bounds'}
        idx = self.active_player_index
        shooter = self.active_player()
        target = self.opponent_player()
        if shooter.has_tried(row, col):
            return {'accepted': False, 'reason': 'already_fired', 'coord': encode_loc(row, col)}

        self.shots_fired += 1
        self.shots_per_side[idx] += 1
        loc = encode_loc(row, col)
        hit_name = shooter.hit(target, row, col)
        fl = target.fleet_group.find_at(row, col) if hit_name else None
        sunk_name = fl.name if (fl is not None and fl.is_sunk()) else None

        if hit_name:
            self.hits_per_side[idx] += 1
            self.current_streak[idx] += 1
            self.best_streak[idx] = max(self.best_streak[idx], self.current_streak[idx])
            self.miss_streak[idx] = 0
            last_c = self.last_sonar_center[idx]
            if (
                last_c is not None
                and self.sonar_used_turn[idx] == self.turn_number
                and abs(last_c[0] - row) <= 1
                and abs(last_c[1] - col) <= 1
            ):
                self.sonar_detective_earned[idx] = True
        else:
            self.current_streak[idx] = 0
            self.miss_streak[idx] += 1

        if sunk_name:
            self._push_log(f"{shooter.name} fired {loc}: HIT and SUNK enemy {FLEET_LABELS[sunk_name]}!")
            self._set_captain_quip('player_sunk')
        elif hit_name:
            self._push_log(f"{shooter.name} fired {loc}: HIT enemy {FLEET_LABELS[hit_name]}!")
            self._set_captain_quip('player_hit')
        else:
            self._push_log(f"{shooter.name} fired {loc}: Miss.")
            self._set_captain_quip('player_miss')

        outcome = {'coord': loc, 'row': row, 'col': col, 'hit': hit_name, 'sunk': sunk_name}

        if target.all_sunk():
            self.game_over = True
            self.winner = shooter.name
            self._push_log(f"Victory! {shooter.name} sank the entire enemy fleet.")
            self._set_captain_quip('win')
            return {
                'accepted': True,
                'coord': loc,
                'hit': hit_name,
                'sunk': sunk_name,
                'cells': [outcome],
                'computer_shots': [],
                'streak_count': self.current_streak[idx],
                'game_over': True,
                'winner': self.winner,
            }

        if self.rule_mode == 'streak' and hit_name:
            return {
                'accepted': True,
                'coord': loc,
                'hit': hit_name,
                'sunk': sunk_name,
                'cells': [outcome],
                'computer_shots': [],
                'bonus_turn': True,
                'streak_count': self.current_streak[idx],
                'game_over': False,
                'winner': None,
            }

        if self.rule_mode == 'salvo':
            self.salvo_remaining = max(0, self.salvo_remaining - 1)
            if self.salvo_remaining > 0 and self._untried_count(shooter) > 0:
                return {
                    'accepted': True,
                    'coord': loc,
                    'hit': hit_name,
                    'sunk': sunk_name,
                    'cells': [outcome],
                    'computer_shots': [],
                    'bonus_turn': True,
                    'salvo_remaining': self.salvo_remaining,
                    'streak_count': self.current_streak[idx],
                    'game_over': False,
                    'winner': None,
                }

        if self.play_mode == '2p':
            self.waiting_handoff = True
            return {
                'accepted': True,
                'coord': loc,
                'hit': hit_name,
                'sunk': sunk_name,
                'cells': [outcome],
                'computer_shots': [],
                'handoff_required': True,
                'streak_count': self.current_streak[idx],
                'game_over': False,
                'winner': None,
            }

        comp_shots = self._run_computer_turn()
        return {
            'accepted': True,
            'coord': loc,
            'hit': hit_name,
            'sunk': sunk_name,
            'cells': [outcome],
            'computer_shots': comp_shots,
            'streak_count': self.current_streak[idx],
            'game_over': self.game_over,
            'winner': self.winner,
        }

    def impossible_enemy_cells(self, side_index=None):
        if side_index is None:
            side_index = self.active_player_index
        shooter = self.players[side_index]
        target = self.players[1 - side_index]
        n = self.board_size
        min_size = target.fleet_group.min_unsunk_size()
        if min_size <= 1:
            return set()

        def is_blocked(r, c):
            rec = shooter.hit_record_at(r, c)
            if rec is None:
                return False
            if not rec[2]:
                return True
            return any(fl.is_sunk() and fl.has_coord(r, c) for fl in target.fleet_group.fleets)

        can_fit = [[False] * n for _ in range(n)]
        unsunk_sizes = [fl.size for fl in target.fleet_group.fleets if not fl.is_sunk()]
        for size in unsunk_sizes:
            for r in range(n):
                for c in range(n - size + 1):
                    if all(not is_blocked(r, c + k) for k in range(size)):
                        for k in range(size):
                            can_fit[r][c + k] = True
            for r in range(n - size + 1):
                for c in range(n):
                    if all(not is_blocked(r + k, c) for k in range(size)):
                        for k in range(size):
                            can_fit[r + k][c] = True

        return {
            (r, c)
            for r in range(n)
            for c in range(n)
            if not shooter.has_tried(r, c) and not can_fit[r][c]
        }

    def helper_hint(self, side_index=None):
        if side_index is None:
            side_index = self.active_player_index
        if not self.helper_mode or self.game_over or self.miss_streak[side_index] < 4:
            return None
        target = self.players[1 - side_index]
        for fl in target.fleet_group.fleets:
            if fl.is_sunk():
                continue
            for r, c in fl.coordinates:
                if not fl.has_hit(r, c):
                    if (r + c) % 2 == 0:
                        return {'axis': 'row', 'index': r, 'label': f"Hint: Try Row {chr(65 + r)}!"}
                    return {'axis': 'col', 'index': c, 'label': f"Hint: Try Col {c + 1}!"}
        return None

    def evaluate_badges(self, side_index):
        shots = self.shots_per_side[side_index]
        hits = self.hits_per_side[side_index]
        accuracy = round((hits * 100) / shots) if shots > 0 else 0
        side = self.players[side_index]
        won = self.game_over and self.winner == side.name
        stars = (3 if accuracy >= 45 else 2 if accuracy >= 30 else 1) if won else 0

        badges = []
        if won:
            badges.append('first_win')
            if accuracy >= 50:
                badges.append('sharpshooter')
            if side.fleet_group.remaining_count() == 1:
                badges.append('comeback_kid')
            if self.play_mode == '1p' and side_index == 0 and self.difficulty == 'hard':
                badges.append('admiral_slayer')
        if self.sonar_detective_earned[side_index]:
            badges.append('sonar_detective')
        if self.bomb_blast_earned[side_index]:
            badges.append('bomb_blast')
        if self.best_streak[side_index] >= 3:
            badges.append('hot_streak')
        return {'stars': stars, 'accuracy': accuracy, 'badges': badges}


class Game:

    def __init__(self, fleet_names, board_size):
        self.fleet_names = fleet_names
        self.board_size = board_size
        self.players = []

    def add_players(self, player1, player2):
        self.players.append(player1)
        print(f"{player1.name} join the game")
        self.players.append(player2)
        print(f"{player2.name} join the game")

    def run(self):
        player1, player2 = self.players
        n = 1
        while not player1.all_sunk() and not player2.all_sunk():
            print(f"Round {n}")
            player1.input_and_hit(player2)
            if player2.all_sunk():
                print(f"{player1.name} wins!")
                break
            player2.input_and_hit(player1)
            if player1.all_sunk():
                print(f"{player2.name} wins!")
                break
            n += 1

    def two_player_games(self):
        player1 = HumanPlayer("You", self.board_size)
        player2 = ComputerPlayer("Play Kang", self.board_size)
        player1.random_init(self.fleet_names)
        player2.random_init(self.fleet_names)
        self.add_players(player1, player2)
        self.run()


if __name__ == '__main__':
    game = Game(list(FLEET_NAMES), (7, 7))
    game.two_player_games()
