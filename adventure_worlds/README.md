# Adventure Worlds

A small, illustrated with original SVG scenes, bilingual story adventure. Four worlds, twelve scenes each; beginner Chinese with tone-marked pinyin above words, English on request, optional Mandarin browser speech. Each world starts with short concrete instructions; later scenes introduce negation and sequencing. Wrong actions have funny consequences and never lock the player out. Pinyin defaults to always on; Tap words and Learning mode are optional. Fixed 25 XP is awarded once per scene, regardless of help or retries, and help never prevents treasure collection. Word counts reflect unassisted first-try Tap words scenes, not verified recognition. All original characters and local saves; no server.

Run `npm ci`, `npm run typecheck:adventure_worlds`, `npm run build:adventure_worlds`, `npm run test:adventure_worlds`. Serve `docs/` over HTTP for browser play. Test Mandarin speech on the target device; voices depend on OS/browser. Add scenes in `ts/content.ts` using `汉字|pinyin/词语|pinyin` tokens; punctuation uses an empty pinyin field. The initial version uses emoji and color-themed cards, not free-roaming maps or full battle simulation.

Easy (default) starts with very short clues; Normal uses longer contextual sentences with the same story and actions. Choose difficulty in the world hub. Progress and treasures are separate per difficulty, with shared XP and reading practice. Both have all pinyin and English help available.

Each four-scene chapter has a milestone treasure and a break option. Hero levels increase every 100 XP. Tap clue words to hear them, reveal pinyin, use slow sentence or choice speech. Device Mandarin voices vary. Existing first four scenes and saves are retained. Art is original vector scenery with recurring illustrated characters and scene-specific props. The illustrations set the mood rather than depict exact puzzle positions.

Story depth: every main scene now has three distinct action choices, contextual Chinese clues, and character dialogue. At scenes 5 and 9 each world offers two routes; both are legitimate, with different scene text, challenges and a callback in the following scene. Route choices persist independently for Easy and Normal; replay can explore alternate routes without duplicate XP or changing saved route history.

Artwork: vector scene props replace the circular emoji overlays, with original illustrated food, gates, lamps, books, creatures, crystals, trophies and alternate-route objects. World cards now preview the art. Illustrations remain stylized and reusable rather than full bespoke painted backgrounds.

Normal mode also has twelve authored sets of more demanding answer choices (contrast, order, spatial relationships), so it is more than longer clues.

Reading comprehension update: all 56 main and alternate challenges use revised clues and actions, including same-vocabulary contrasts and reversed action order. Both difficulties share the action sets; Normal includes richer context and explicit conditions. Choices shuffle once at scene entry and stay fixed through hints and retries. After solving, a short English explanation explains why the action follows from the clue. The automated keyword-overlap check is a heuristic, not a substitute for actual reading tests with children.
