# Public-index coverage audit

The previous game was a partial first release. This audit maps the 2016
paperback ISBN 9781623156909 to actual runtime destinations, using the public
[Ingram contents displayed by Better World Books](https://www.betterworldbooks.com/product/detail/soccer-smarts-for-kids-60-skills-strategies-and-secrets-9781623156909/new).
Labels below are paraphrased, not copied chapter instructions.

## What the numbers mean

- 57 indexed teaching, profile, adult and introductory entries: 17 skills,
  27 strategies, six player entries, five adult entries and two introductory entries.
- 56 have an original playable or activity adaptation; heading (p.61) has an
  information entry and remains deferred as physical practice for John's profile.
- 29 added tactical scenes plus 36 unchanged starter scenes = 65 unique scenes.
  The original seven cards plus 24 new activity/information cards = 31 unique cards.
- The new manifest reuses existing material for 18 rows, adds adaptations for
  38 rows and explicitly defers one. Repeated destinations are reuse, not extra scenes.
- Zero chapter bodies are verified. Profiles are observation prompts, not
  biographies; adult activities and physical demonstrations are original adaptations.

This does not establish coverage of every example, variation, drill or detail
inside the book. Neither 57 index entries nor 65 game scenes should be equated
with the subtitle's number 60. The complete book text is still unavailable.

## Entry-level destinations

SCENES means a scored original decision round. ACTIVITY means an unscored
schematic or discussion card. DEFERRED means an information card rather than
heading practice. Every row remains INDEX_ONLY / FULL_TEXT_PENDING.

| Page lead | Category | Adapted topic | Delivery | Runtime IDs | Change |
| --- | --- | --- | --- | --- | --- |
| 8 | start | Getting started | ACTIVITY | bk008 | Added |
| 11 | start | Read the pitch | ACTIVITY | bk011 | Added |
| 20 | skills | Ground control | ACTIVITY | touch-and-look | Reused |
| 22 | skills | Cushion a pass | ACTIVITY | touch-and-look | Reused |
| 24 | skills | Thigh and chest | ACTIVITY | bk024 | Added |
| 26 | skills | Short delivery | ACTIVITY | bk026 | Added |
| 29 | skills | Medium delivery | ACTIVITY | bk029 | Added |
| 32 | players | Watch David Beckham | ACTIVITY | bk032 | Added |
| 34 | skills | Long delivery | ACTIVITY | bk034 | Added |
| 36 | skills | Inside bend | ACTIVITY | bk036 | Added |
| 39 | skills | Lifted chip | ACTIVITY | bk039 | Added |
| 42 | skills | Volley choice | ACTIVITY | bk042 | Added |
| 44 | skills | Penalty routine | ACTIVITY | bk044 | Added |
| 46 | skills | Body protection | ACTIVITY | keep-it-close | Reused |
| 48 | skills | Ball familiarity | ACTIVITY | bk048 | Added |
| 50 | skills | Both feet | ACTIVITY | two-foot-explorer | Reused |
| 52 | skills | Box finishing | ACTIVITY | find-the-window | Reused |
| 54 | skills | Keeper picture | ACTIVITY | find-the-window | Reused |
| 56 | players | Watch Christine Sinclair | ACTIVITY | bk056 | Added |
| 58 | skills | Outside bend | ACTIVITY | bk058 | Added |
| 61 | skills | Heading overview | DEFERRED | bk061 | Deferred |
| 64 | tactics | Observe a match | ACTIVITY | watch-a-player | Reused |
| 67 | tactics | Anticipate a pattern | SCENES | B067.A, B067.B | Added |
| 70 | tactics | Use available space | SCENES | T04.A, T04.B, T04.C, T07.A, T07.B, T07.C | Reused |
| 73 | tactics | Prepare to receive | SCENES | T06.A, T06.B, T06.C, T01.A, T01.B, T01.C | Reused |
| 75 | tactics | Time the run | SCENES | B075.A, B075.B, B075.C | Added |
| 78 | tactics | Play from width | SCENES | T07.A, T07.B, T07.C | Reused |
| 81 | tactics | Recover goal-side | SCENES | T10.C | Reused |
| 84 | players | Watch Mia Hamm | ACTIVITY | bk084 | Added |
| 86 | tactics | Choose a throw | SCENES | B086.A, B086.B | Added |
| 88 | tactics | Offer for a throw | SCENES | B088.A, B088.B | Added |
| 90 | tactics | Combine in a pattern | SCENES | B090.A, B090.B | Added |
| 93 | tactics | Carry or release | SCENES | T04.A, T04.B, T04.C | Reused |
| 96 | players | Watch Lionel Messi | ACTIVITY | bk096 | Added |
| 98 | tactics | Progress past pressure | SCENES | B090.A, B090.B, B133.A, B133.B | Added |
| 103 | tactics | Separate without the ball | SCENES | B103.A, B103.B | Added |
| 105 | tactics | Pick a delivery | SCENES | T05.A, T05.B, T05.C | Reused |
| 109 | tactics | Support the carrier | SCENES | T06.A, T06.B, T06.C | Reused |
| 113 | tactics | Defend with support | SCENES | T11.A, T11.B, T11.C | Reused |
| 116 | players | Watch Alex Morgan | ACTIVITY | bk116 | Added |
| 118 | tactics | Read the defensive line | SCENES | B118.A, B118.B | Added |
| 123 | tactics | Deliver from width | SCENES | B123.A, B123.B | Added |
| 127 | tactics | Protect against delivery | SCENES | B127.A, B127.B | Added |
| 130 | tactics | Open space for others | SCENES | B130.A, B130.B | Added |
| 133 | tactics | Progress through a line | SCENES | B133.A, B133.B | Added |
| 138 | tactics | Use a triangle | SCENES | T08.A, T08.B, T08.C | Reused |
| 142 | players | Watch Cristiano Ronaldo | ACTIVITY | bk142 | Added |
| 144 | tactics | Defend a duel | SCENES | T10.A, T10.B | Reused |
| 147 | tactics | Regain possession | SCENES | T12.A, T12.B, T12.C | Reused |
| 150 | tactics | Move the line together | SCENES | B150.A, B150.B | Added |
| 153 | tactics | Re-form the triangle | SCENES | B153.A, B153.B | Added |
| 156 | tactics | Arrive for a chance | SCENES | B156.A, B156.B | Added |
| 160 | adults | Notice progress | ACTIVITY | bk160 | Added |
| 162 | adults | Make practice inviting | ACTIVITY | bk162 | Added |
| 163 | adults | An adult's role | ACTIVITY | bk163 | Added |
| 164 | adults | Support on match day | ACTIVITY | bk164 | Added |
| 165 | adults | Listen after play | ACTIVITY | bk165 | Added |

## Source and implementation boundary

The manifest is in [book.py](book.py), with added tactics in
[book_tactics.py](book_tactics.py), added cards in [book_cards.py](book_cards.py)
and navigation in [book_view.py](book_view.py). The entry-point verifier checks
this table against the live manifest and resolves every destination.

Offside and throw-in pictures state their practice rule profile explicitly;
see [IFAB Law 11](https://www.theifab.com/laws/latest/offside/) and
[IFAB Law 15](https://www.theifab.com/laws/latest/the-throw-in/).
Other added pictures are no-offside small-sided training. Physical contact is
never graded. Book rounds use authored contrasts instead of scaling rule lines
and touchlines into a different layout. No Heading drill or body-verification
claim is hidden behind the existence of an index entry.
