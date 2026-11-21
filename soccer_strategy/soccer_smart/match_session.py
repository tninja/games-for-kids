"""Match Day session: freeze-frame tactical chain, instant Rewind What-If, and Coach Demo."""

from dataclasses import replace

from .campaign import MatchSpec, MomentSpec, match_by_id
from .sim_kernel import simulate_beat, snap_action
from .sim_model import BeatResult, SimAction, SimFrame, SimState

INTRO_SECONDS = 0.65
BEAT_PLAY_SECONDS = 1.35
MAX_BEATS = 4
TERMINAL_OUTCOMES = ("goal", "conceded", "saved", "offside", "out_of_bounds", "corner")


class MatchSession:
    def __init__(self, match_id: str, rules_override: str | None = None):
        self.match: MatchSpec = match_by_id(match_id)
        self.rules_override = rules_override
        self.moment_index = 0
        self.home_goals = self.match.base_home
        self.away_goals = self.match.base_away
        self.phase = "intro"
        self.elapsed = 0.0
        self.loft = False
        self.offball_intent = "call"
        self.pro_vision = False
        self.preview_action: SimAction | None = None
        self.state_stack: list[SimState] = []
        self.beat_results: list[BeatResult] = []
        self.coach_results: list[BeatResult] = []
        self.coach_index = 0
        self.moment_stars: list[int] = []
        self.earned_badges: list[str] = []
        self.radar_delta: dict[str, int] = {"vision": 0, "spacing": 0, "timing": 0, "defending": 0}
        self._load_moment()

    @property
    def moment(self) -> MomentSpec:
        return self.match.moments[self.moment_index]

    @property
    def state(self) -> SimState:
        return self.state_stack[-1]

    @property
    def active_result(self) -> BeatResult | None:
        if self.phase == "coach" and self.coach_results:
            return self.coach_results[min(self.coach_index, len(self.coach_results) - 1)]
        return self.beat_results[-1] if self.beat_results else None

    @property
    def current_frame(self) -> SimFrame:
        res = self.active_result
        if self.phase in ("resolve", "coach") and res is not None and res.frames:
            frac = min(1.0, self.elapsed / BEAT_PLAY_SECONDS)
            idx = min(len(res.frames) - 1, int(frac * (len(res.frames) - 1)))
            return res.frames[idx]
        if self.phase == "review" and res is not None and res.frames:
            return res.frames[-1]
        st = self.state
        pts = tuple((p.key, p.x, p.y, p.hx, p.hy) for p in st.players)
        return SimFrame(pts, (st.ball.x, st.ball.y, st.ball.z), None, st.build_out_active, st.event)

    def _load_moment(self) -> None:
        st = self.moment.initial_state
        if self.rules_override == "9v9":
            st = replace(st, rules_mode="9v9", offside_on=st.set_piece not in ("throw_in", "corner", "goal_kick"))
        elif self.rules_override == "7v7":
            st = replace(st, rules_mode="7v7")
        st = replace(st, home_score=self.home_goals, away_score=self.away_goals)
        self.state_stack = [st]
        self.beat_results = []
        self.coach_results = []
        self.coach_index = 0
        self.loft = False
        self.offball_intent = "call"
        self.preview_action = None
        self.phase = "intro"
        self.elapsed = 0.0

    def tick(self, seconds: float) -> str | None:
        if seconds < 0.0:
            return None
        if self.phase == "intro":
            self.elapsed += seconds
            if self.elapsed >= INTRO_SECONDS:
                self.phase, self.elapsed = "freeze", 0.0
            return None
        if self.phase == "resolve":
            self.elapsed += seconds
            if self.elapsed >= BEAT_PLAY_SECONDS:
                return self._finish_resolve()
            return None
        if self.phase == "coach":
            self.elapsed += seconds
            if self.elapsed >= BEAT_PLAY_SECONDS:
                if self.coach_index + 1 < len(self.coach_results):
                    self.coach_index += 1
                    self.elapsed = 0.0
                else:
                    self.phase, self.elapsed = "review", 0.0
            return None
        return None

    def _finish_resolve(self) -> str:
        res = self.beat_results[-1]
        self.state_stack.append(res.end_state)
        self.elapsed = 0.0
        self.preview_action = None
        end_now = (
            res.outcome in TERMINAL_OUTCOMES
            or len(self.beat_results) >= MAX_BEATS
            or (res.outcome == "intercepted" and len(self.beat_results) >= 2)
            or (res.outcome == "won_ball" and self.moment.objective == "defend")
        )
        self.phase = "review" if end_now else "freeze"
        return res.outcome

    def preview_point(self, x: float, y: float) -> SimAction | None:
        if self.phase != "freeze":
            return None
        self.preview_action = snap_action(self.state, x, y, self.loft, self.offball_intent)
        return self.preview_action

    def commit_action(self, action: SimAction) -> BeatResult | None:
        if self.phase != "freeze":
            return None
        res = simulate_beat(self.state, action)
        self.beat_results.append(res)
        self.preview_action = action
        self.phase = "resolve"
        self.elapsed = 0.0
        return res

    def commit_point(self, x: float, y: float) -> BeatResult | None:
        act = snap_action(self.state, x, y, self.loft, self.offball_intent)
        return self.commit_action(act)

    def rewind_beat(self) -> bool:
        if not self.beat_results or self.phase not in ("freeze", "review"):
            return False
        if self.phase == "review" or len(self.state_stack) > len(self.beat_results):
            if len(self.state_stack) > 1:
                self.state_stack.pop()
        self.beat_results.pop()
        self.preview_action = None
        self.phase = "freeze"
        self.elapsed = 0.0
        return True

    def start_coach_demo(self) -> bool:
        if self.phase not in ("review", "freeze"):
            return False
        st = self.state_stack[0]
        results: list[BeatResult] = []
        for act in self.moment.coach_actions:
            res = simulate_beat(st, act)
            results.append(res)
            st = res.end_state
        if not results:
            return False
        self.coach_results = results
        self.coach_index = 0
        self.phase = "coach"
        self.elapsed = 0.0
        return True

    def skip_phase(self) -> None:
        if self.phase == "intro":
            self.phase, self.elapsed = "freeze", 0.0
        elif self.phase == "resolve":
            self._finish_resolve()
        elif self.phase == "coach":
            self.phase, self.elapsed = "review", 0.0

    def next_moment(self) -> bool:
        if self.phase != "review":
            return False
        self._commit_moment_summary()
        if self.moment_index + 1 < len(self.match.moments):
            self.moment_index += 1
            self._load_moment()
        else:
            self.phase = "match_summary"
        return True

    def _commit_moment_summary(self) -> None:
        if not self.beat_results:
            return
        last = self.beat_results[-1]
        self.home_goals = last.end_state.home_score
        self.away_goals = last.end_state.away_score
        best_stars = max(r.stars for r in self.beat_results)
        self.moment_stars.append(best_stars)
        for res in self.beat_results:
            for b in res.badges:
                if b not in self.earned_badges:
                    self.earned_badges.append(b)
            for axis, val in res.radar_delta.items():
                self.radar_delta[axis] = self.radar_delta.get(axis, 0) + val

    def summary(self) -> tuple[int, bool, int, int]:
        avg_stars = round(sum(self.moment_stars) / max(1, len(self.moment_stars)))
        won = self.home_goals >= self.away_goals and (self.home_goals > self.away_goals or avg_stars >= 2)
        return avg_stars, won, self.home_goals, self.away_goals
