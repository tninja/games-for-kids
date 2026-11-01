# Luke's Keeper Club

A colorful, offline Pygame goalkeeper decision game for Luke, age six. There
are **48 situations: 30 basic pictures and 18 match challenges**.
Basic skills use two big choices; challenges use three.
The game and coaching text are in short English. A grown-up can read the cues
aloud during the first few rounds.

## Play

Run from the repository root with the already installed Ubuntu Pygame package:

```sh
python3 -m soccer_strategy.luke
```

For a repeatable practice order, add `--seed 2`. The game draws its own players,
gloves, balls, goal/net and icons; no image download or audio package is needed.
Luke, coaches, friends and other players all have visible eyes and a smile.
The window can be resized. John's game remains in the separate `john/` folder.
Ordinary launches use a fresh seed. An explicit seed repeats the practice order;
the automated smoke uses a fixed default seed for reproducible verification.

## Playful Keeper Club extras

Before a round, **tap the big ball or press B** to bounce it. Tap it again
while it is in the air to keep it going. Luke cheers beside it, a gentle boing
plays, and the warmup counter counts taps. This toy is also available after a
round; it never changes first-try stars or the training ball.

On feedback, click **High five!** or press **H** for a glove bump, a short
sound and a confetti burst. Even a mistake earns a practice badge: Crab Feet,
Super Gloves, Pass Pal, Ball Detective or Match Explorer. The six glove badges
on the final screen celebrate completing the six plays; the separate stars
still record only the original first attempt. High fives, retries and replays
do not add stars. The toys have short tap cooldowns and are optional.

Some answer cards now have a short playful subtitle, such as **Scoop the
potato!** or **Crab shuffle!**. The large action label and icon still say what
the choice does. The same action gets the same joke whether it is right or
wrong for a picture. Feedback keeps the real coaching explanation alongside
varied encouragement. Confetti stays in the header, outside the football action.

## Choose a skill

| Menu | What Luke practises | Pictures |
|---|---|---|
| 1 / Line up | Follow the ball and get between it and goal | Nine pictures, including three visible switches before the serve |
| 2 / Catch and hug | Low hands or two hands at chest height | Six pictures: three ground rolls and three soft chest balls |
| 3 / Roll to a friend | Use a clear lane or briefly hold and look | Nine pictures, including two blocked lanes and a friend looking away |
| 4 / Loose balls | Collect if clearly first; otherwise stay ready | Six goal-area pictures with different arrival advantages |
| 5 / Match challenges | Read the situation and choose among three actions | 18 match situations, with six per round |
| 6 / Mix my skills | All five skills | One from each, plus one extra case from a randomly selected skill |

Every round has six distinct pictures. Larger skills rotate the pictures shown;
mixed rounds cover all five skills with one or two pictures per skill.
Every challenge round has one 1v1, angle, rebound, sweeping, distribution and
possession-change situation, so a round cannot fill up with similar pictures.
Answer positions are shuffled so Luke
does not learn a button number. There is no decision timer or reading-speed
score. The ball pauses while he thinks.

## Match challenges: try menu 5

These cues describe what is happening without naming the preferred action.
Look at the ball, the players and the marked area before choosing:

- **1v1:** distinguish a controlled dribble, a heavy touch and a shot starting.
  Take balanced steps while there is time; get set as the shot starts. A
  controlled ball is not a free ball to collect.
- **Protect the angle:** cover a near-post shot or move across after a pass.
- **Second ball:** collect a reachable rebound, or recover when an attacker is
  first. The next shot waits for the attacker to reach the rebound.
- **Proactive keeper:** collect an early through ball inside the area; sweep
  behind defenders and clear wide with feet when outside. If the attacker
  controls it first, recover rather than rush into their feet.
- **Distribution:** choose among three friends using both readiness and the
  passing lane. An orange player can move across and close a lane during watch.
- **Possession changes:** move into a passing lane for a teammate, then recover
  toward goal when the other team gains the ball. Receive a teammate's pass
  with feet in the support scene.

The white rectangle is the simplified penalty area; it is not a build-out line.
No local restart or back-pass rule is assumed. A wide clearance goes toward
empty space, not a promised successful pass. The beginner demonstrations stay
on the feet and leave space from other players.

After a wrong choice, **Your choice** first illustrates its consequence: the
ball passes a misplaced keeper, bounces away from the wrong hand position,
meets a player blocking a roll, stays uncollected, or reaches the nearer player.
These are gentle teaching illustrations, not
claims that every mistake causes a goal. The correct coach demonstration then
plays automatically. Correct choices go straight to the coach demonstration.

**Watch the coach's choice** demonstrates stepping into line, meeting a gentle
ball with both hands and bringing it toward the body, or lowering the held ball
before a ground roll. That correct demonstration still uses the picture's facts
independently of the score key. Gold rings appear on feedback, after choosing.

Positive feedback invites Luke to watch again, try again or move on. Stars
record the first attempt only; later practice never removes or adds first-try
stars. The final screen shows progress for the skills attempted and suggests
a concrete practice activity for a skill that needs help. It celebrates a
perfect round and offers another skill.

## Controls

- **Mouse:** click a big menu or action picture.
- **Menu keys 1-4:** basic skills. **5:** match challenges. **6:** mixed round.
- **Choice keys 1/2:** basic pictures. **1/2/3:** match challenges.
- **Space:** skip a watch/demo animation; it does not rush a decision.
- **B / big ball:** bounce the warmup ball on the menu or final screen.
- **H / High five:** optional glove bump on feedback.
- **M / Sound label:** mute or unmute the generated effects.
- **P:** replay the coach demonstration from feedback.
- **R:** try the picture again. **N:** next picture.
- **Escape / Menu:** choose a different skill. Close the window to quit.

Purple **LUKE** is the goalkeeper. Blue **L/R** players are friends; an orange
**PLAYER** blocks a rolling lane or approaches a free ball. Orange **COACH**
and **COACH 2** serve balls and show a visible pass across the field.
Match challenges use orange players as attackers and blue players as teammates,
with no coach serving the match ball. Opponent movement stops for the decision.
Arrow icons refer to directions on the picture. A ball's shadow stays on the
ground; a soft chest ball is drawn above its shadow.

New decisions change what Luke needs to do, not just the side of the screen:
follow a switch, wait for a ready friend, collect first, or protect goal rather
than race a nearer player. Loose-ball practice stays inside **YOUR AREA**.
Hold-and-look means a brief scan for an option, not indefinite possession.
The collection demonstration stays on the feet; it does not teach diving into
another player. Contact sounds are omitted when Luke only holds or stays ready.

## Sound

Gentle effects are on by default: selection, try again, catch/roll contact,
success, round completion, warmup boings and high fives. They play once on events rather than on every
animation frame. Tones are generated locally with Pygame's mixer; no audio asset
download, speech service or extra package is needed.

Click **Sound: ON/OFF** or press **M**. For a quiet launch:

```sh
python3 -m soccer_strategy.luke --mute
```

Muting stops this game's current effects. If audio cannot initialize, the game
continues and displays **Sound unavailable**; check the desktop audio output and
restart to try the device again. The effects use signed 16-bit mono/stereo PCM
and respect an existing supported mixer configuration.

## Coaching scope and sources

The beginner set starts with footwork, balanced ready hands, simple catches and
ground distribution. It uses gentle serves and does not introduce diving,
contested high balls or long kicks. Standing depth and ball height are teaching
illustrations, not measurements to copy on a real pitch. The roll is an attempt
toward an open friend; the game does not promise that the next touch succeeds.

- [FIFA grassroots: Learning the basics](https://www.fifatrainingcentre.com/media/native/test/FIFA_Session_Plan_Grassroots_053.pdf)
  provides a simpler progression using small throws and two hands, with positive
  feedback. Its faster/higher and one-hand extensions are not used here.
- [FIFA: Learning to catch](https://www.fifatrainingcentre.com/en/environment/fifa-goalkeeper-training/goalkeeping-fundamentals/learning-to-catch.php)
  supports body position, footwork and securing the ball. Luke's drawn animation
  is a simplified prompt, not a full technique assessment.
- [The FA foundation phase](https://thefa.com/learning/england-dna-foundation-phase)
  distinguishes guidance for ages 5-8 and 9-12 and emphasizes a positive,
  enjoyable first experience. Two choices and six-turn rounds are authored
  design decisions for Luke, not a format prescribed by that source.
- [FIFA: Read, close, set, wait, attack](https://www.fifatrainingcentre.com/en/game/tournaments/fu20wwc/2026/goalkeeper-1v1s-the-read-close-set-wait-attack-framework.php)
  supports distinguishing time to close space from the moment to set. This is
  elite analysis; only the simple read/position/balance principles are adapted.
- [FIFA: Defensive transitions](https://www.fifatrainingcentre.com/en/environment/fifa-goalkeeper-training/sessions/managing-defensive-offensive-defensive-transitions.php)
  supports repositioning after possession changes. It is not an age-six lesson
  plan, and the game's scenes simplify the choices.
- [IFAB Law 12](https://theifab.com/laws/latest/fouls-and-misconduct/)
  limits goalkeeper handling to their own penalty area. The outside-area
  challenge demonstrates feet, without inferring local youth restart sanctions.

Use the pictures as prompts for gentle practice with an adult. Game stars
measure decisions in these pictures, not physical catching ability.

## Verify

```sh
PYGAME_HIDE_SUPPORT_PROMPT=1 python3 -m soccer_strategy.luke.verify
```

The command runs the Luke suite, complete measured runtime statement/conditional
coverage, source hygiene/boundary/function-budget checks with bad controls,
Pyright with a rejected bad-type control, nine applied/executed mutants, a
shuffled repeat and an actual SDL smoke. It fails on any failed or unavailable
declared gate and writes `.verification/report.json` and `feedback.png`.

The development verifier reuses John's unchanged stdlib quality sensors, while
Luke's runtime is independent of John's game. Those sensors substitute for
Ruff/coverage.py and have narrower rule coverage. Pyright uses an installed or
locally cached package; no tool is silently installed. The recorded environment
is Python 3.14.4, Pygame 2.6.1, SDL 2.32.10 and Pyright 1.1.399.

For a quick real launch and a saved feedback screen:

```sh
python3 -m soccer_strategy.luke --smoke --screenshot /tmp/luke-feedback.png
```

See [SPEC.md](SPEC.md) for the acceptance criteria and [EVIDENCE.md](EVIDENCE.md)
for final results, source hash and unavailable editor diagnostics. Runtime
geometry, content, animation, cosmetic club effects, session state and drawing have separate
modules; `test_*.py` verifies both learning facts and real Pygame behavior.
