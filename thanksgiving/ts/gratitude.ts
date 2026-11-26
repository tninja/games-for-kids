import {
  MAX_CUSTOM_NOTE_LEN,
  MAX_LEAVES,
  STICKER_PRESETS,
  TABLE_PROMPTS,
  TREE_LEAF_SLOTS
} from "./constants";
import { GratitudeLeaf, LeafColor, StickerId, StickerPreset } from "./types";

export function getStickerPreset(id: StickerId): StickerPreset {
  for (let i = 0; i < STICKER_PRESETS.length; i++) {
    if (STICKER_PRESETS[i].id === id) {
      return STICKER_PRESETS[i];
    }
  }
  return STICKER_PRESETS[0];
}

export function sanitizeNote(
  raw: string,
  fallback: string,
  maxLen: number = MAX_CUSTOM_NOTE_LEN
): string {
  const collapsed = raw.replace(/\s+/g, " ").trim();
  if (!collapsed) {
    return fallback;
  }
  const chars = Array.from(collapsed);
  if (chars.length <= maxLen) {
    return collapsed;
  }
  return chars.slice(0, maxLen).join("").trim();
}

export function createGratitudeLeaf(
  existingCount: number,
  stickerId: StickerId,
  leafColor: LeafColor,
  customMessage: string,
  authorLabel: string
): GratitudeLeaf | null {
  if (existingCount >= MAX_LEAVES) {
    return null;
  }
  const preset = getStickerPreset(stickerId);
  const message = sanitizeNote(customMessage, preset.caption);
  const cleanAuthor = sanitizeNote(authorLabel, "Chef " + String(existingCount + 1));
  return {
    id: "leaf_" + String(existingCount + 1),
    authorLabel: cleanAuthor,
    stickerId,
    message,
    leafColor,
    treeSlot: existingCount % TREE_LEAF_SLOTS.length
  };
}

export function getTablePrompt(index: number): string {
  if (TABLE_PROMPTS.length === 0) {
    return "Share one happy moment from today!";
  }
  const safe = ((index % TABLE_PROMPTS.length) + TABLE_PROMPTS.length) % TABLE_PROMPTS.length;
  return TABLE_PROMPTS[safe];
}
