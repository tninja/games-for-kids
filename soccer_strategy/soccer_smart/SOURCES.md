# Sources and attribution boundaries

## Runtime coverage audit, 2026-11-07

The S3 contents were checked again against the same 2016 paperback. They expose
17 skill entries, 27 strategy entries, six profiles, five parent entries and
two introductory entries. [BOOK_COVERAGE.md](BOOK_COVERAGE.md) maps all 57 leads;
labels are paraphrased. Reusing a theme tag is not counted as chapter-body review.
The new game adds original decisions/cards for gaps and an explicit deferred
heading entry. Profile cards do not assert book anecdotes or reproduce biographies.

S1 and S3 still expose descriptions/index rather than the full body; the S4
Sample Pages label did not yield readable chapters in this session. Thus there
are still zero FULL_TEXT_VERIFIED chapters, and full book-case coverage cannot
be established. Unavailable text is not replaced with invented book examples.

The rule-specific additions use current primary sources separately from the
book index: [IFAB Law 11](https://www.theifab.com/laws/latest/offside/) for
release-time, level/behind-ball positions and the direct-throw-in exception;
[IFAB Law 15](https://www.theifab.com/laws/latest/the-throw-in/) for the assumed
legal overhead throw. Other added pictures explicitly use no-offside training.
This is a stated practice profile, not an assertion about every local youth league.

Checked on 2026-11-07. The book body was not available in the repository or in
the accessed public pages. No full-book text, illustration or exercise has been
downloaded, copied or reconstructed for this design.

## Source register

| ID | Source | What was actually verified | Limit |
|---|---|---|---|
| S1 | [Sourcebooks product record](https://www.sourcebooks.com/9781623156909-soccer-smarts-for-kids-tp.html) | Andrew Latham; paperback ISBN 9781623156909; 2016-02-17; 174 pages; publisher description | Description and bibliographic facts only |
| S2 | [Google Books record](https://books.google.com/books/about/Soccer_Smarts_for_Kids.html?id=nbdwjwEACAAJ) | Full title, subtitle, edition metadata | Catalog description, not chapter text |
| S3 | [Better World Books / Ingram contents](https://www.betterworldbooks.com/product/detail/soccer-smarts-for-kids-60-skills-strategies-and-secrets-9781623156909/new) | Topic locations and broad sections in the displayed contents | Secondary index; its embedded preview is marked unavailable |
| S4 | [Christianbook edition record](https://www.christianbook.com/soccer-smarts-kids-skills-strategies-secrets/andrew-latham/9781623156909/pd/15690X) | Matching 2016 paperback edition | A Sample Pages label was visible, but no readable sample body was obtained |
| J1 | [John README](../john/README.md) | Current seven sections, 38 topics, 114 scenes and interaction contract | Existing project behavior, not book evidence |
| J2 | [John session](../john/session.py) | First-attempt scoring, retries, playlist and held-out variants | Existing implementation reference |
| J3 | [John model](../john/model.py) | Actor/choice geometry and current scenario restrictions | Not a reusable general whole-field model without changes |
| J4 | [John coaching review](../john/COACHING_REVIEW.md) | Parent-supplied player context and existing teaching limits | Project context, not independent validation of these new scenes |

The target title is *Soccer Smarts for Kids: 60 Skills, Strategies, and Secrets*.
The publisher description addresses ages 8-12; its structured age metadata is
broader. The younger reading target here follows the description and John's
project profile, not a claim that every chapter suits every nine-year-old. [S1]

## Evidence labels

- PUBLISHER_VERIFIED: bibliographic facts or broad scope supported by S1.
- INDEX_ONLY: a topic location supported by S3, with no chapter-body verification.
- FULL_TEXT_PENDING: the relevant instructions, examples and emphasis still
  need the actual chapter and edition to be reviewed.
- ORIGINAL: a proposed game objective, scene, feedback explanation or practice
  activity authored for this project. Its book link is thematic, not textual.

Every curriculum group below uses INDEX_ONLY plus FULL_TEXT_PENDING unless it
explicitly says OVERVIEW_ONLY. Every game proposal is ORIGINAL. There are zero
FULL_TEXT_VERIFIED chapters in this delivery.

The public contents have apparent transcription mistakes in two skill labels.
The curriculum uses paraphrased theme names and lists page locations rather
than silently presenting those strings as authoritative chapter titles. Page
locations are catalog leads, not quotations or checked page ranges. [S3]

The subtitle's number 60 is not treated as a verified count of playable lessons.
The catalog separates skills, strategies, profiles and parent material; the
design does not invent missing numbered chapters to fit the marketing number.
Only the grouped index in CURRICULUM.md is claimed as coverage planning. [S2, S3]

## How to finish book alignment

For each group, an editor should check the actual edition, confirm its locator,
record the reviewed pages and a short original learning objective, and identify
any disagreement with the proposed game. Then a coach reviews the scene facts,
grades, receiver readiness and age/competition assumptions. A source review and
a coaching review are separate records; neither substitutes for the other.

Do not mark an ORIGINAL scene as an example from the book after merely finding
a similar heading. If a later chapter review changes the design, retain the
old rationale and record the new evidence. Keep local competition settings
separate from a 2016 publication; no current rule is verified by the book date.

Before calling a future release a faithful book companion, complete that
review and resolve all FULL_TEXT_PENDING entries used by its lessons. Until
then describe it as an original decision trainer mapped to public book themes.
Book-specific biographies, quotations, photos and diagrams are deferred until
their content and intended use have been reviewed. The initial design needs
no player likenesses or licensed media.
