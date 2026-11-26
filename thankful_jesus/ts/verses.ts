import { AgeMode, QuizQuestionDef, VerseDef, VerseId, VerseTileDef } from "./types";

// NIV English + CUV Chinese (ASCII-safe \uXXXX escapes) Bible verses and reflection quizzes.

export const VERSE_ORDER: VerseId[] = [
  "john_6_11",
  "luke_17_15_16",
  "psalm_100_4",
  "psalm_107_1",
  "thess_5_18"
];

export const VERSES: Record<VerseId, VerseDef> = {
  john_6_11: {
    id: "john_6_11",
    reference: {
      en: "John 6:11 (NIV)",
      zh: "\u7ea6\u7ff0\u798f\u97f3 6:11"
    },
    text: {
      en: "Jesus then took the loaves, gave thanks, and distributed to those who were seated as much as they wanted.",
      zh: "\u8036\u7a23\u62ff\u8d77\u997c\u6765\uff0c\u795d\u8c22\u4e86\uff0c\u5c31\u5206\u7ed9\u90a3\u5750\u7740\u7684\u4eba\uff1b\u5206\u9c7c\u4e5f\u662f\u8fd9\u6837\uff0c\u90fd\u968f\u7740\u4ed6\u4eec\u6240\u8981\u7684\u3002"
    },
    explorerTiles: [
      { id: "j1", icon: "bread", text: { en: "Jesus took the loaves,", zh: "\u8036\u7a23\u62ff\u8d77\u997c\u6765\uff0c" } },
      { id: "j2", icon: "hands", text: { en: "gave thanks,", zh: "\u795d\u8c22\u4e86\uff0c" } },
      { id: "j3", icon: "fish", text: { en: "and shared with everyone", zh: "\u5c31\u5206\u7ed9\u90a3\u5750\u7740\u7684\u4eba" } },
      { id: "j4", icon: "heart", text: { en: "as much as they wanted.", zh: "\u90fd\u968f\u7740\u4ed6\u4eec\u6240\u8981\u7684\u3002" } }
    ],
    adventurerTiles: [
      { id: "j1", icon: "bread", text: { en: "Jesus took the loaves,", zh: "\u8036\u7a23\u62ff\u8d77\u997c\u6765\uff0c" } },
      { id: "j2", icon: "hands", text: { en: "gave thanks,", zh: "\u795d\u8c22\u4e86\uff0c" } },
      { id: "j3", icon: "fish", text: { en: "and shared with everyone", zh: "\u5c31\u5206\u7ed9\u90a3\u5750\u7740\u7684\u4eba" } },
      { id: "j4", icon: "heart", text: { en: "as much as they wanted.", zh: "\u90fd\u968f\u7740\u4ed6\u4eec\u6240\u8981\u7684\u3002" } }
    ]
  },
  luke_17_15_16: {
    id: "luke_17_15_16",
    reference: {
      en: "Luke 17:15-16 (NIV)",
      zh: "\u8def\u52a0\u798f\u97f3 17:15-16"
    },
    text: {
      en: "One of them, when he saw he was healed, came back, praising God in a loud voice. He threw himself at Jesus' feet and thanked him.",
      zh: "\u5185\u4e2d\u6709\u4e00\u4e2a\u89c1\u81ea\u5df1\u5df2\u7ecf\u597d\u4e86\uff0c\u5c31\u56de\u6765\u5927\u58f0\u5f52\u8363\u8000\u4e0e\u795e\uff0c\u53c8\u4fef\u4f0f\u5728\u8036\u7a23\u811a\u524d\u611f\u8c22\u4ed6\u3002"
    },
    explorerTiles: [
      { id: "l1", icon: "star", text: { en: "One saw he was healed,", zh: "\u5185\u4e2d\u6709\u4e00\u4e2a\u89c1\u81ea\u5df1\u597d\u4e86\uff0c" } },
      { id: "l2", icon: "sun", text: { en: "came back praising God,", zh: "\u5c31\u56de\u6765\u5927\u58f0\u5f52\u8363\u8000\u4e0e\u795e\uff0c" } },
      { id: "l3", icon: "cross", text: { en: "fell at Jesus' feet", zh: "\u53c8\u4fef\u4f0f\u5728\u8036\u7a23\u811a\u524d" } },
      { id: "l4", icon: "hands", text: { en: "and thanked him.", zh: "\u611f\u8c22\u4ed6\u3002" } }
    ],
    adventurerTiles: [
      { id: "l1", icon: "star", text: { en: "One saw he was healed,", zh: "\u5185\u4e2d\u6709\u4e00\u4e2a\u89c1\u81ea\u5df1\u597d\u4e86\uff0c" } },
      { id: "l2", icon: "sun", text: { en: "came back praising God,", zh: "\u5c31\u56de\u6765\u5927\u58f0\u5f52\u8363\u8000\u4e0e\u795e\uff0c" } },
      { id: "l3", icon: "cross", text: { en: "fell at Jesus' feet", zh: "\u53c8\u4fef\u4f0f\u5728\u8036\u7a23\u811a\u524d" } },
      { id: "l4", icon: "hands", text: { en: "and thanked him.", zh: "\u611f\u8c22\u4ed6\u3002" } }
    ]
  },
  psalm_100_4: {
    id: "psalm_100_4",
    reference: {
      en: "Psalm 100:4 (NIV)",
      zh: "\u8bd7\u7bc7 100:4"
    },
    text: {
      en: "Enter his gates with thanksgiving and his courts with praise; give thanks to him and praise his name.",
      zh: "\u5f53\u79f0\u8c22\u8fdb\u5165\u4ed6\u7684\u95e8\uff0c\u5f53\u8d5e\u7f8e\u8fdb\u5165\u4ed6\u7684\u9662\uff1b\u5f53\u611f\u8c22\u4ed6\uff0c\u79f0\u9882\u4ed6\u7684\u540d\uff01"
    },
    explorerTiles: [
      { id: "h1", icon: "hands", text: { en: "Enter his gates with thanksgiving", zh: "\u5f53\u79f0\u8c22\u8fdb\u5165\u4ed6\u7684\u95e8\uff0c" } },
      { id: "h2", icon: "sun", text: { en: "and his courts with praise;", zh: "\u5f53\u8d5e\u7f8e\u8fdb\u5165\u4ed6\u7684\u9662\uff1b" } },
      { id: "h3", icon: "heart", text: { en: "give thanks to him", zh: "\u5f53\u611f\u8c22\u4ed6\uff0c" } },
      { id: "h4", icon: "star", text: { en: "and praise his name.", zh: "\u79f0\u9882\u4ed6\u7684\u540d\uff01" } }
    ],
    adventurerTiles: [
      { id: "h1", icon: "hands", text: { en: "Enter his gates with thanksgiving", zh: "\u5f53\u79f0\u8c22\u8fdb\u5165\u4ed6\u7684\u95e8\uff0c" } },
      { id: "h2", icon: "sun", text: { en: "and his courts with praise;", zh: "\u5f53\u8d5e\u7f8e\u8fdb\u5165\u4ed6\u7684\u9662\uff1b" } },
      { id: "h3", icon: "heart", text: { en: "give thanks to him", zh: "\u5f53\u611f\u8c22\u4ed6\uff0c" } },
      { id: "h4", icon: "star", text: { en: "and praise his name.", zh: "\u79f0\u9882\u4ed6\u7684\u540d\uff01" } }
    ]
  },
  psalm_107_1: {
    id: "psalm_107_1",
    reference: {
      en: "Psalm 107:1 (NIV)",
      zh: "\u8bd7\u7bc7 107:1"
    },
    text: {
      en: "Give thanks to the LORD, for he is good; his love endures forever.",
      zh: "\u4f60\u4eec\u8981\u79f0\u8c22\u8036\u548c\u534e\uff0c\u56e0\u4ed6\u672c\u4e3a\u5584\uff0c\u4ed6\u7684\u6148\u7231\u6c38\u8fdc\u957f\u5b58\uff01"
    },
    explorerTiles: [
      { id: "p1", icon: "hands", text: { en: "Give thanks to the LORD,", zh: "\u4f60\u4eec\u8981\u79f0\u8c22\u8036\u548c\u534e\uff0c" } },
      { id: "p2", icon: "sun", text: { en: "for he is good;", zh: "\u56e0\u4ed6\u672c\u4e3a\u5584\uff0c" } },
      { id: "p3", icon: "heart", text: { en: "his love", zh: "\u4ed6\u7684\u6148\u7231" } },
      { id: "p4", icon: "star", text: { en: "endures forever.", zh: "\u6c38\u8fdc\u957f\u5b58\uff01" } }
    ],
    adventurerTiles: [
      { id: "pa1", icon: "hands", text: { en: "Give thanks", zh: "\u4f60\u4eec\u8981" } },
      { id: "pa2", icon: "cross", text: { en: "to the LORD,", zh: "\u79f0\u8c22\u8036\u548c\u534e\uff0c" } },
      { id: "pa3", icon: "sun", text: { en: "for he is good;", zh: "\u56e0\u4ed6\u672c\u4e3a\u5584\uff0c" } },
      { id: "pa4", icon: "heart", text: { en: "his love", zh: "\u4ed6\u7684\u6148\u7231" } },
      { id: "pa5", icon: "scroll", text: { en: "endures", zh: "\u6c38\u8fdc" } },
      { id: "pa6", icon: "star", text: { en: "forever.", zh: "\u957f\u5b58\uff01" } }
    ],
    adventurerDecoy: {
      id: "pa_decoy",
      icon: "sun",
      text: { en: "tall mountains", zh: "\u9ad8\u9ad8\u5c71\u4e18" }
    }
  },
  thess_5_18: {
    id: "thess_5_18",
    reference: {
      en: "1 Thessalonians 5:18 (NIV)",
      zh: "\u5e16\u6492\u7f57\u5c3c\u8fe6\u524d\u4e66 5:18"
    },
    text: {
      en: "Give thanks in all circumstances; for this is God's will for you in Christ Jesus.",
      zh: "\u51e1\u4e8b\u8c22\u6069\uff0c\u56e0\u4e3a\u8fd9\u662f\u795e\u5728\u57fa\u7763\u8036\u7a23\u91cc\u5411\u4f60\u4eec\u6240\u5b9a\u7684\u65e8\u610f\u3002"
    },
    explorerTiles: [
      { id: "t1", icon: "hands", text: { en: "Give thanks in all circumstances;", zh: "\u51e1\u4e8b\u8c22\u6069\uff0c" } },
      { id: "t2", icon: "scroll", text: { en: "for this is God's will", zh: "\u56e0\u4e3a\u8fd9\u662f\u795e" } },
      { id: "t3", icon: "cross", text: { en: "in Christ Jesus", zh: "\u5728\u57fa\u7763\u8036\u7a23\u91cc" } },
      { id: "t4", icon: "heart", text: { en: "for you.", zh: "\u5411\u4f60\u4eec\u6240\u5b9a\u7684\u65e8\u610f\u3002" } }
    ],
    adventurerTiles: [
      { id: "ta1", icon: "hands", text: { en: "Give thanks", zh: "\u51e1\u4e8b" } },
      { id: "ta2", icon: "sun", text: { en: "in all circumstances;", zh: "\u8c22\u6069\uff0c" } },
      { id: "ta3", icon: "scroll", text: { en: "for this is God's", zh: "\u56e0\u4e3a\u8fd9\u662f\u795e" } },
      { id: "ta4", icon: "cross", text: { en: "in Christ Jesus", zh: "\u5728\u57fa\u7763\u8036\u7a23\u91cc" } },
      { id: "ta5", icon: "heart", text: { en: "will for you", zh: "\u5411\u4f60\u4eec\u6240\u5b9a\u7684" } },
      { id: "ta6", icon: "star", text: { en: "always.", zh: "\u65e8\u610f\u3002" } }
    ],
    adventurerDecoy: {
      id: "ta_decoy",
      icon: "scroll",
      text: { en: "maybe tomorrow", zh: "\u660e\u5929\u518d\u8bf4" }
    }
  }
};

export const BUILDER_VERSE_QUEUE: VerseId[] = ["psalm_107_1", "thess_5_18"];

export const ADVENTURER_QUIZ_ORDER: string[] = ["q_loaves", "q_leper", "q_harp"];

export const QUIZ_QUESTIONS: Record<string, QuizQuestionDef> = {
  q_loaves: {
    id: "q_loaves",
    verseId: "john_6_11",
    question: {
      en: "In John 6, what did Jesus do first before sharing the loaves and fish?",
      zh: "\u5728\u4e94\u997c\u4e8c\u9c7c\u7684\u6545\u4e8b\u91cc\uff0c\u8036\u7a23\u5206\u997c\u4e4b\u524d\u5148\u505a\u4e86\u4ec0\u4e48\uff1f"
    },
    choices: [
      {
        en: "Took the loaves and gave thanks to God",
        zh: "\u5148\u62ff\u8d77\u997c\u5411\u5929\u7236\u795d\u8c22"
      },
      {
        en: "Asked everyone to go home and nap",
        zh: "\u8bf7\u5927\u5bb6\u5148\u56de\u5bb6\u7761\u89c9"
      },
      {
        en: "Hid the basket inside a cave",
        zh: "\u628a\u98df\u7269\u85cf\u8fdb\u5c71\u6d1e\u91cc"
      }
    ],
    correctIndex: 0,
    encouragement: {
      en: "Yes! Jesus gave thanks first before sharing, reminding us to thank God too!",
      zh: "\u662f\u7684\uff01\u8036\u7a23\u5148\u795d\u8c22\u518d\u5206\u4eab\uff0c\u63d0\u9192\u6211\u4eec\u5403\u996d\u524d\u4e5f\u8981\u611f\u8c22\u795e\uff01"
    }
  },
  q_leper: {
    id: "q_leper",
    verseId: "luke_17_15_16",
    question: {
      en: "In Luke 17, what did the one thankful man do after Jesus healed him?",
      zh: "\u8def\u52a0\u798f\u97f317\u7ae0\u91cc\uff0c\u90a3\u4f4d\u5fc3\u6000\u611f\u6069\u7684\u4eba\u5f97\u533b\u6cbb\u540e\u505a\u4e86\u4ec0\u4e48\uff1f"
    },
    choices: [
      {
        en: "Rushed to the market to buy toys",
        zh: "\u6025\u5fd9\u8dd1\u53bb\u96c6\u5e02\u4e70\u73a9\u5177"
      },
      {
        en: "Praised God loudly and ran back to Jesus' feet to thank Him",
        zh: "\u5927\u58f0\u8d5e\u7f8e\u795e\u5e76\u8dd1\u56de\u8036\u7a23\u811a\u524d\u8bf4\u8c22\u8c22"
      },
      {
        en: "Forgot who had helped him",
        zh: "\u5fd8\u8bb0\u662f\u8c01\u5e2e\u52a9\u4e86\u4ed6"
      }
    ],
    correctIndex: 1,
    encouragement: {
      en: "Wonderful! He turned right around and thanked Jesus with a joyful heart!",
      zh: "\u771f\u68d2\uff01\u4ed6\u7acb\u523b\u8f6c\u8eab\u56de\u6765\u4fef\u4f0f\u5728\u8036\u7a23\u811a\u524d\u732e\u4e0a\u611f\u8c22\uff01"
    }
  },
  q_harp: {
    id: "q_harp",
    verseId: "psalm_100_4",
    question: {
      en: "In Psalm 100:4, how should we enter God's gates and courts?",
      zh: "\u8bd7\u7bc7100\u7bc74\u8282\u63d0\u9192\u6211\u4eec\uff0c\u8fdb\u5165\u795e\u7684\u95e8\u548c\u9662\u65f6\u8981\u5e26\u7740\u4ec0\u4e48\u5fc3\uff1f"
    },
    choices: [
      {
        en: "With thanksgiving and joyful praise to God",
        zh: "\u5e26\u7740\u79f0\u8c22\u548c\u8d5e\u7f8e\u7684\u5fc3\u611f\u8c22\u795e"
      },
      {
        en: "With a grumpy face and no words",
        zh: "\u6101\u7709\u82e6\u8138\u4e00\u53e5\u8bdd\u4e5f\u4e0d\u8bf4"
      },
      {
        en: "Pretending we never noticed His blessings",
        zh: "\u5047\u88c5\u4ec0\u4e48\u90fd\u6ca1\u770b\u89c1"
      }
    ],
    correctIndex: 0,
    encouragement: {
      en: "Yes! God loves when we come to Him and Jesus with thanksgiving and praise!",
      zh: "\u7b54\u5bf9\u5566\uff01\u5e26\u7740\u79f0\u8c22\u548c\u8d5e\u7f8e\u6765\u5230\u795e\u548c\u8036\u7a23\u9762\u524d\uff0c\u5929\u7236\u6700\u559c\u60a6\uff01"
    }
  }
};

export function getVerseById(id: VerseId): VerseDef {
  return VERSES[id];
}

export function getVerseTiles(verseId: VerseId, ageMode: AgeMode): VerseTileDef[] {
  const verse = VERSES[verseId];
  return ageMode === "adventurer" ? verse.adventurerTiles : verse.explorerTiles;
}

export function getVerseDecoyTile(verseId: VerseId, ageMode: AgeMode): VerseTileDef | null {
  if (ageMode !== "adventurer") {
    return null;
  }
  return VERSES[verseId].adventurerDecoy || null;
}
