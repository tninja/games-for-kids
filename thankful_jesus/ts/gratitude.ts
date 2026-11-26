import { MAX_CUSTOM_NOTE_LEN, MAX_PRAYERS, TREE_LEAF_SLOTS } from "./constants";
import { CHURCH_PROMPTS, STICKER_PRESETS, UI_TEXT, formatLocalized, formatPrimary } from "./i18n";
import { LangMode, LeafColor, LocalizedText, PrayerLeaf, StickerId, StickerPreset } from "./types";

export function getStickerPreset(id: StickerId): StickerPreset {
  for (let i = 0; i < STICKER_PRESETS.length; i++) {
    if (STICKER_PRESETS[i].id === id) {
      return STICKER_PRESETS[i];
    }
  }
  return STICKER_PRESETS[0];
}

export function sanitizeNote(raw: string, fallback: string): string {
  const collapsed = raw.replace(/\s+/g, " ").trim();
  if (!collapsed) {
    return fallback;
  }
  const chars = Array.from(collapsed);
  if (chars.length <= MAX_CUSTOM_NOTE_LEN) {
    return collapsed;
  }
  return chars.slice(0, MAX_CUSTOM_NOTE_LEN).join("").trim();
}

export function createPrayerLeaf(
  existingCount: number,
  stickerId: StickerId,
  leafColor: LeafColor,
  customMessage: string,
  authorLabel: string,
  langMode: LangMode
): PrayerLeaf | null {
  if (existingCount >= MAX_PRAYERS) {
    return null;
  }
  const preset = getStickerPreset(stickerId);
  const defaultMsg = formatLocalized(preset.caption, langMode, " / ");
  const message = sanitizeNote(customMessage, defaultMsg);
  const defaultAuthor = formatPrimary(UI_TEXT.friendPrefix, langMode) + " " + String(existingCount + 1);
  const cleanAuthor = sanitizeNote(authorLabel, defaultAuthor);
  return {
    id: "prayer_" + String(existingCount + 1),
    authorLabel: cleanAuthor,
    stickerId,
    message,
    leafColor,
    treeSlot: existingCount % TREE_LEAF_SLOTS.length
  };
}

export function getChurchPrompt(index: number): LocalizedText {
  if (CHURCH_PROMPTS.length === 0) {
    return { en: "Say thank you to Jesus today!", zh: "\u4eca\u5929\u5411\u8036\u7a23\u8bf4\u4e00\u58f0\u8c22\u8c22\uff01" };
  }
  const safe = ((index % CHURCH_PROMPTS.length) + CHURCH_PROMPTS.length) % CHURCH_PROMPTS.length;
  return CHURCH_PROMPTS[safe];
}
