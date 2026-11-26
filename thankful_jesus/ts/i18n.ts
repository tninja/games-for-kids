import { LangMode, LocalizedText, StageId, StickerPreset } from "./types";

// All Chinese text uses ASCII-safe \uXXXX escapes so code files and bundles stay strictly ASCII.

export const UI_TEXT = {
  gameTitle: {
    en: "Thankful Journey with Jesus",
    zh: "\u8ddf\u968f\u8036\u7a23\u7684\u611f\u6069\u4e4b\u65c5"
  },
  gameSubtitle: {
    en: "Church Thanksgiving Game for Ages 6-9",
    zh: "\u4e3b\u65e5\u5b66\u611f\u6069\u8282\u53cc\u8bed\u4e92\u52a8\u6e38\u620f"
  },
  backGames: {
    en: "Games",
    zh: "\u8fd4\u56de\u6e38\u620f"
  },
  langEn: { en: "EN", zh: "EN" },
  langZh: { en: "ZH", zh: "\u4e2d\u6587" },
  langDual: { en: "Dual", zh: "\u53cc\u8bed" },
  sfxOn: {
    en: "Sound: On",
    zh: "\u58f0\u97f3:\u5f00"
  },
  sfxOff: {
    en: "Muted",
    zh: "\u9759\u97f3"
  },
  autoReadOn: {
    en: "Auto-Read: On",
    zh: "\u81ea\u52a8\u6717\u8bfb:\u5f00"
  },
  autoReadOff: {
    en: "Tap to Read",
    zh: "\u6717\u8bfb:\u624b\u52a8"
  },
  listenBtn: {
    en: "Listen",
    zh: "\u542c\u4e00\u542c\u6717\u8bfb"
  },
  listenVerseBtn: {
    en: "Read Bible Verse",
    zh: "\u6717\u8bfb\u5723\u7ecf\u91d1\u53e5"
  },
  listenPrayerBtn: {
    en: "Read Verse & Prayers",
    zh: "\u6717\u8bfb\u91d1\u53e5\u4e0e\u7977\u544a"
  },
  explorerLabel: {
    en: "Explorer (6-7)",
    zh: "\u5c0f\u5c0f\u63a2\u7d22\u5bb6 (6-7\u5c81)"
  },
  adventurerLabel: {
    en: "Adventurer (8-9)",
    zh: "\u5723\u7ecf\u5c0f\u52c7\u58eb (8-9\u5c81)"
  },
  soloLabel: {
    en: "1P Solo",
    zh: "1\u4eba\u6e38\u73a9"
  },
  pass2Label: {
    en: "2P Pass",
    zh: "2\u4eba\u8f6e\u6d41"
  },
  pass3Label: {
    en: "3P Pass",
    zh: "3\u4eba\u8f6e\u6d41"
  },
  pass4Label: {
    en: "4P Pass",
    zh: "4\u4eba\u8f6e\u6d41"
  },
  startJourney: {
    en: "Start Thankful Journey!",
    zh: "\u5f00\u59cb\u611f\u6069\u4e4b\u65c5\uff01"
  },
  readyBtn: {
    en: "I'm Ready!",
    zh: "\u6211\u51c6\u5907\u597d\u5566\uff01"
  },
  beginStageBtn: {
    en: "Play This Stage!",
    zh: "\u5f00\u59cb\u8fd9\u4e00\u5173\uff01"
  },
  nextStageBtn: {
    en: "Next Stage!",
    zh: "\u4e0b\u4e00\u5173\uff01"
  },
  goPrayerBtn: {
    en: "Make Thank-You Card!",
    zh: "\u5199\u7ed9\u8036\u7a23\u7684\u611f\u6069\u5361\uff01"
  },
  friendPrefix: {
    en: "Friend",
    zh: "\u5c0f\u670b\u53cb"
  },
  passTitlePrefix: {
    en: "Pass the iPhone to",
    zh: "\u8bf7\u628a\u624b\u673a\u4f20\u7ed9"
  },
  s1PrayBtn: {
    en: "Give Thanks with Jesus!",
    zh: "\u4e0e\u8036\u7a23\u4e00\u8d77\u795d\u8c22\uff01"
  },
  s1SlideHint: {
    en: "Slide the basket to share loaves & fish!",
    zh: "\u5de6\u53f3\u6ed1\u52a8\u7f16\u7ec7\u7bee\uff0c\u5206\u997c\u5206\u9c7c\u5e76\u6536\u96c6\u91d1\u53e5\u7bee\uff01"
  },
  s1HudUnit: {
    en: "Shared",
    zh: "\u4efd\u5206\u4eab"
  },
  s2TurnPrompt: {
    en: "Crossroads! Tap fast to run back to Jesus!",
    zh: "\u5230\u5c94\u8def\u53e3\u5566\uff01\u5feb\u70b9\u6309\u94ae\u8f6c\u8eab\u8dd1\u56de\u8036\u7a23\u8eab\u8fb9\uff01"
  },
  s2TurnBtn: {
    en: "Turn Back to Thank Jesus!",
    zh: "\u8f6c\u8eab\u8dd1\u56de\u8c22\u8c22\u8036\u7a23\uff01"
  },
  s2LaneLeft: {
    en: "Left",
    zh: "\u5de6\u8def"
  },
  s2LaneMid: {
    en: "Middle",
    zh: "\u4e2d\u8def"
  },
  s2LaneRight: {
    en: "Right",
    zh: "\u53f3\u8def"
  },
  s2HudRoad: {
    en: "Sparkles",
    zh: "\u6069\u5178\u5149\u70b9"
  },
  s2HudTurn: {
    en: "Run to Jesus",
    zh: "\u56de\u5230\u8036\u7a23\u811a\u524d"
  },
  s3Hint: {
    en: "Tap tiles in order to build the verse (tapping reads aloud!)",
    zh: "\u6309\u987a\u5e8f\u8f7b\u70b9\u8bcd\u5757\u62fc\u51fa\u7ecf\u6587\uff08\u70b9\u51fb\u53ef\u542c\u8bfb\u97f3\uff09"
  },
  s3QuizKicker: {
    en: "Bible Story Question",
    zh: "\u5723\u7ecf\u5c0f\u601d\u8003"
  },
  s3QuizRetry: {
    en: "Good try! Think about the Gospel story and try again!",
    zh: "\u518d\u60f3\u60f3\u770b\uff0c\u4f60\u53ef\u4ee5\u7684\uff01"
  },
  s3QuizCorrect: {
    en: "Awesome answer!",
    zh: "\u7b54\u5bf9\u5566\uff01\u771f\u68d2\uff01"
  },
  stageCompletePrefix: {
    en: "Wonderful! Verse Unlocked:",
    zh: "\u592a\u68d2\u5566\uff01\u89e3\u9501\u7ecf\u6587\uff1a"
  },
  starsEarned: {
    en: "Stars",
    zh: "\u83b7\u5f97\u661f\u661f"
  },
  prayerHeader: {
    en: "Hang a Thankful Prayer Leaf beside Jesus",
    zh: "\u628a\u611f\u6069\u53f6\u5b50\u6302\u5728\u8036\u7a23\u65c1\u7684\u6811\u4e0a"
  },
  prayerNamePh: {
    en: "Name (optional)",
    zh: "\u540d\u5b57\uff08\u53ef\u9009\uff09"
  },
  prayerNotePh: {
    en: "Or type your own thank-you prayer to Jesus...",
    zh: "\u6216\u5199\u4e00\u53e5\u7ed9\u8036\u7a23\u7684\u611f\u6069\u7977\u544a..."
  },
  hangPrayerBtn: {
    en: "Hang Prayer Leaf!",
    zh: "\u6302\u4e0a\u611f\u6069\u7977\u544a\uff01"
  },
  finishJourneyBtn: {
    en: "Celebrate & View Keepsake!",
    zh: "\u5b8c\u6210\u65c5\u7a0b\uff0c\u770b\u7eaa\u5ff5\u5361\uff01"
  },
  finaleKicker: {
    en: "Church & Table Sharing Prompt",
    zh: "\u6559\u4f1a / \u9910\u684c\u611f\u6069\u5206\u4eab\u63d0\u95ee"
  },
  newPromptBtn: {
    en: "New Question",
    zh: "\u6362\u4e00\u4e2a\u5206\u4eab\u63d0\u95ee"
  },
  saveCardBtn: {
    en: "Save / Share Bilingual Card PNG",
    zh: "\u4fdd\u5b58/\u5206\u4eab\u53cc\u8bed\u611f\u6069\u7eaa\u5ff5\u5361 PNG"
  },
  playAgainBtn: {
    en: "Play Again!",
    zh: "\u518d\u73a9\u4e00\u6b21\uff01"
  },
  modalClose: {
    en: "Close",
    zh: "\u5173\u95ed"
  },
  modalShare: {
    en: "Share / Save PNG",
    zh: "\u5206\u4eab / \u4fdd\u5b58\u56fe\u7247"
  },
  modalTipIos: {
    en: "Tip: On iPhone, press and hold the image to Save to Photos.",
    zh: "\u63d0\u793a\uff1a\u5728 iPhone \u4e0a\u4e5f\u53ef\u957f\u6309\u56fe\u7247\u9009\u62e9\u4fdd\u5b58\u5230\u76f8\u518c\u3002"
  },
  modalShared: {
    en: "Opened native Share Sheet!",
    zh: "\u5df2\u6253\u5f00\u7cfb\u7edf\u5206\u4eab\u9762\u677f\uff01"
  },
  modalDownloaded: {
    en: "Downloaded your bilingual Thank-You Card PNG!",
    zh: "\u5df2\u4e0b\u8f7d\u53cc\u8bed\u611f\u6069\u7eaa\u5ff5\u5361 PNG\uff01"
  },
  pcTitle: {
    en: "Happy Thanksgiving!",
    zh: "\u611f\u6069\u8282\u5feb\u4e50\uff01"
  },
  pcSubtitle: {
    en: "Thankful Journey with Jesus",
    zh: "\u8ddf\u968f\u8036\u7a23\u7684\u611f\u6069\u4e4b\u65c5"
  },
  pcPrayerSection: {
    en: "Our Thank-You Prayers to Jesus",
    zh: "\u6211\u4eec\u732e\u7ed9\u8036\u7a23\u7684\u611f\u6069\u7977\u544a"
  },
  pcFooter: {
    en: "Give thanks in Christ Jesus - games-for-kids",
    zh: "\u5728\u57fa\u7763\u8036\u7a23\u91cc\u51e1\u4e8b\u8c22\u6069"
  }
} as const;

export type UiTextKey = keyof typeof UI_TEXT;

export const STAGE_TEXT: Record<
  StageId,
  { title: LocalizedText; shortTitle: LocalizedText; story: LocalizedText }
> = {
  loaves_and_fish: {
    title: {
      en: "Loaves & Fish Feast",
      zh: "\u4e94\u997c\u4e8c\u9c7c\uff1a\u5148\u5411\u8036\u7a23\u795d\u8c22"
    },
    shortTitle: {
      en: "Loaves & Fish",
      zh: "\u4e94\u997c\u4e8c\u9c7c"
    },
    story: {
      en: "By the Sea of Galilee, a boy offers five loaves and two fish. Tap to give thanks with Jesus, then slide your basket to share with everyone!",
      zh: "\u5728\u52a0\u5229\u5229\u6e56\u8fb9\uff0c\u5c0f\u7537\u5b69\u732e\u51fa\u4e94\u4e2a\u997c\u548c\u4e24\u6761\u9c7c\u3002\u6211\u4eec\u5148\u548c\u8036\u7a23\u4e00\u8d77\u795d\u8c22\uff0c\u518d\u628a\u6ee1\u6ee1\u7684\u6069\u5178\u5206\u7ed9\u5927\u5bb6\uff01"
    }
  },
  run_back_to_jesus: {
    title: {
      en: "Run Back to Thank Jesus",
      zh: "\u8f6c\u8eab\u8dd1\u56de\u8c22\u8c22\u8036\u7a23"
    },
    shortTitle: {
      en: "Run Back",
      zh: "\u56de\u5934\u611f\u6069"
    },
    story: {
      en: "Jesus healed ten men, and one paused to run back and thank Him! Dodge busy distractions, then turn back at the crossroads to praise Jesus!",
      zh: "\u8036\u7a23\u533b\u6cbb\u4e86\u5341\u4e2a\u4eba\uff0c\u53ea\u6709\u4e00\u4e2a\u4eba\u505c\u4e0b\u811a\u6b65\u8dd1\u56de\u8036\u7a23\u811a\u524d\u8bf4\u8c22\u8c22\uff01\u907f\u5f00\u5206\u5fc3\u6742\u7269\uff0c\u5230\u5c94\u8def\u53e3\u5feb\u8f6c\u8eab\u8c22\u8c22\u8036\u7a23\uff01"
    }
  },
  verse_builder: {
    title: {
      en: "Thankful Verse Builder",
      zh: "\u611f\u6069\u91d1\u53e5\u5b9d\u85cf\u62fc\u62fc\u4e50"
    },
    shortTitle: {
      en: "Verse Builder",
      zh: "\u62fc\u51fa\u91d1\u53e5"
    },
    story: {
      en: "Open the blessing scroll and tap the Bible verse tiles in order! Every tile reads aloud when you tap it.",
      zh: "\u628a\u6536\u96c6\u5230\u7684\u5723\u7ecf\u8bcd\u5757\u6309\u987a\u5e8f\u62fc\u6210\u611f\u6069\u91d1\u53e5\uff01\u70b9\u51fb\u4efb\u610f\u8bcd\u5757\u90fd\u53ef\u4ee5\u542c\u6717\u8bfb\u54e6\uff01"
    }
  }
};

export const STICKER_PRESETS: StickerPreset[] = [
  {
    id: "jesus_love",
    label: { en: "Jesus' Love", zh: "\u8036\u7a23\u7684\u7231" },
    caption: {
      en: "Thank You Jesus for loving me!",
      zh: "\u8c22\u8c22\u8036\u7a23\u8fd9\u4e48\u7231\u6211\uff01"
    },
    accent: "#D46A43"
  },
  {
    id: "bible",
    label: { en: "Bible", zh: "\u5723\u7ecf\u8bdd\u8bed" },
    caption: {
      en: "Thank You God for the Bible!",
      zh: "\u8c22\u8c22\u795e\u8d50\u7ed9\u6211\u4eec\u5723\u7ecf\uff01"
    },
    accent: "#8E5A3C"
  },
  {
    id: "family",
    label: { en: "Family", zh: "\u6211\u7684\u5bb6\u4eba" },
    caption: {
      en: "Thank You Jesus for my family!",
      zh: "\u8c22\u8c22\u8036\u7a23\u8d50\u7ed9\u6211\u6e29\u6696\u7684\u5bb6\u4eba\uff01"
    },
    accent: "#C64B3B"
  },
  {
    id: "church",
    label: { en: "Church", zh: "\u6559\u4f1a\u670b\u53cb" },
    caption: {
      en: "Thank You for our church friends!",
      zh: "\u8c22\u8c22\u4e3b\u65e5\u5b66\u8001\u5e08\u548c\u6559\u4f1a\u597d\u670b\u53cb\uff01"
    },
    accent: "#5A95B8"
  },
  {
    id: "food",
    label: { en: "Food", zh: "\u6bcf\u65e5\u996e\u98df" },
    caption: {
      en: "Thank You Jesus for our daily food!",
      zh: "\u8c22\u8c22\u8036\u7a23\u8d50\u7ed9\u6211\u4eec\u7f8e\u5473\u7684\u98df\u7269\uff01"
    },
    accent: "#E5A93B"
  },
  {
    id: "healing",
    label: { en: "Care", zh: "\u770b\u987e\u533b\u6cbb" },
    caption: {
      en: "Thank You Jesus for helping and healing us!",
      zh: "\u8c22\u8c22\u8036\u7a23\u770b\u987e\u5e76\u533b\u6cbb\u6211\u4eec\uff01"
    },
    accent: "#6F9463"
  },
  {
    id: "creation",
    label: { en: "World", zh: "\u5947\u5999\u4e16\u754c" },
    caption: {
      en: "Thank You God for Your wonderful world!",
      zh: "\u8c22\u8c22\u795e\u521b\u9020\u7f8e\u4e3d\u7684\u79cb\u53f6\u4e0e\u4e16\u754c\uff01"
    },
    accent: "#5D8A5A"
  },
  {
    id: "joy",
    label: { en: "Joy", zh: "\u559c\u4e50\u7684\u5fc3" },
    caption: {
      en: "Thank You Jesus for filling my heart with joy!",
      zh: "\u8c22\u8c22\u8036\u7a23\u8ba9\u6211\u5fc3\u91cc\u5145\u6ee1\u559c\u4e50\uff01"
    },
    accent: "#D98A2B"
  }
];

export const CHURCH_PROMPTS: LocalizedText[] = [
  {
    en: "Turn to a friend or parent and share one way Jesus helped or blessed you this week!",
    zh: "\u8f6c\u5411\u8eab\u8fb9\u4e00\u4f4d\u670b\u53cb\u6216\u5bb6\u4eba\uff0c\u5206\u4eab\u4e00\u4ef6\u8fd9\u5468\u8036\u7a23\u5e2e\u52a9\u4f60\u6216\u795d\u798f\u4f60\u7684\u4e8b\uff01"
  },
  {
    en: "If you were by the Sea of Galilee today, what gift would you love to share with Jesus?",
    zh: "\u5982\u679c\u4eca\u5929\u4f60\u5728\u52a0\u5229\u5229\u6e56\u8fb9\uff0c\u4f60\u6700\u60f3\u628a\u4ec0\u4e48\u793c\u7269\u732e\u7ed9\u8036\u7a23\uff1f"
  },
  {
    en: "Say 1 Thessalonians 5:18 together out loud: Give thanks in all circumstances!",
    zh: "\u5927\u58f0\u4e00\u8d77\u80cc\u4e00\u904d\uff1a\u51e1\u4e8b\u8c22\u6069\uff0c\u56e0\u4e3a\u8fd9\u662f\u795e\u5728\u57fa\u7763\u8036\u7a23\u91cc\u5411\u4f60\u4eec\u6240\u5b9a\u7684\u65e8\u610f\uff01"
  },
  {
    en: "Just like the thankful man in Luke 17, who is one person you can run over and thank today?",
    zh: "\u60f3\u60f3\u90a3\u4f4d\u56de\u5934\u8c22\u8c22\u8036\u7a23\u7684\u65c5\u4eba\uff0c\u4eca\u5929\u4f60\u60f3\u4e3b\u52a8\u5411\u8c01\u8bf4\u4e00\u58f0\u8c22\u8c22\uff1f"
  },
  {
    en: "Say a short one-sentence prayer thanking Jesus for food, church, and kind friends!",
    zh: "\u7528\u4e00\u53e5\u7b80\u77ed\u7684\u7977\u544a\uff0c\u8c22\u8c22\u8036\u7a23\u4eca\u5929\u8d50\u7ed9\u6211\u4eec\u7f8e\u98df\u3001\u6559\u4f1a\u548c\u597d\u670b\u53cb\uff01"
  },
  {
    en: "Which story about Jesus was your favorite today, and why?",
    zh: "\u4eca\u5929\u4e09\u5173\u91cc\uff0c\u4f60\u6700\u559c\u6b22\u54ea\u4e00\u4e2a\u5173\u4e8e\u8036\u7a23\u7684\u6545\u4e8b\uff1f\u4e3a\u4ec0\u4e48\uff1f"
  }
];

export function formatLocalized(
  text: LocalizedText,
  langMode: LangMode,
  separator = " / "
): string {
  if (langMode === "en") {
    return text.en;
  }
  if (langMode === "zh") {
    return text.zh;
  }
  return text.en + separator + text.zh;
}

export function formatPrimary(text: LocalizedText, langMode: LangMode): string {
  return langMode === "zh" ? text.zh : text.en;
}

export function formatSecondary(text: LocalizedText, langMode: LangMode): string | null {
  return langMode === "dual" ? text.zh : null;
}

export function ui(key: UiTextKey, langMode: LangMode, separator = " / "): string {
  return formatLocalized(UI_TEXT[key], langMode, separator);
}
