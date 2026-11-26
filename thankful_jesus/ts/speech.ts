import { LangMode, LocalizedText } from "./types";

export interface SpeechVoiceLike {
  lang: string;
  name: string;
  localService?: boolean;
}

export interface SpeechUtteranceLike {
  text: string;
  lang: string;
  rate: number;
  pitch: number;
  voice: SpeechVoiceLike | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

export interface SpeechSynthesisLike {
  cancel(): void;
  speak(utterance: SpeechUtteranceLike): void;
  getVoices?(): SpeechVoiceLike[];
  onvoiceschanged?: (() => void) | null;
}

export interface SpeechHost {
  synth: SpeechSynthesisLike | null;
  createUtterance: ((text: string) => SpeechUtteranceLike) | null;
}

function getDefaultHost(): SpeechHost {
  if (typeof window === "undefined") {
    return { synth: null, createUtterance: null };
  }
  const win = window as unknown as {
    speechSynthesis?: SpeechSynthesisLike;
    SpeechSynthesisUtterance?: new (text: string) => SpeechUtteranceLike;
  };
  if (!win.speechSynthesis || !win.SpeechSynthesisUtterance) {
    return { synth: null, createUtterance: null };
  }
  const UtteranceCtor = win.SpeechSynthesisUtterance;
  return {
    synth: win.speechSynthesis,
    createUtterance: (text: string) => new UtteranceCtor(text)
  };
}

export class JourneySpeech {
  private host: SpeechHost;
  private muted = false;
  private voices: SpeechVoiceLike[] = [];
  private generation = 0;

  constructor(host?: SpeechHost) {
    this.host = host || getDefaultHost();
    this.refreshVoices();
    if (this.host.synth && "onvoiceschanged" in this.host.synth) {
      this.host.synth.onvoiceschanged = () => {
        this.refreshVoices();
      };
    }
  }

  public isSupported(): boolean {
    return Boolean(this.host.synth && this.host.createUtterance);
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) {
      this.stop();
    }
  }

  public stop(): void {
    this.generation += 1;
    if (this.host.synth) {
      try {
        this.host.synth.cancel();
      } catch {
        // Ignore browser cancel errors
      }
    }
  }

  public refreshVoices(): void {
    if (!this.host.synth || typeof this.host.synth.getVoices !== "function") {
      return;
    }
    try {
      const list = this.host.synth.getVoices();
      if (Array.isArray(list)) {
        this.voices = list;
      }
    } catch {
      // Ignore getVoices errors
    }
  }

  public speakLocalized(content: LocalizedText, langMode: LangMode): boolean {
    if (this.muted || !this.host.synth || !this.host.createUtterance) {
      return false;
    }
    this.refreshVoices();
    this.stop();
    const token = this.generation;

    if (langMode === "en") {
      return this.speakSingle(content.en, "en-US", 0.92, 1.04, token, null);
    }
    if (langMode === "zh") {
      return this.speakSingle(content.zh, "zh-CN", 0.90, 1.03, token, null);
    }
    return this.speakSingle(content.en, "en-US", 0.92, 1.04, token, () => {
      if (this.muted || this.generation !== token) {
        return;
      }
      this.speakSingle(content.zh, "zh-CN", 0.90, 1.03, token, null);
    });
  }

  public speakPlain(text: string, langTag: "en-US" | "zh-CN"): boolean {
    if (this.muted || !this.host.synth || !this.host.createUtterance) {
      return false;
    }
    const clean = text.trim();
    if (!clean) {
      return false;
    }
    this.refreshVoices();
    this.stop();
    const token = this.generation;
    const rate = langTag === "zh-CN" ? 0.90 : 0.92;
    return this.speakSingle(clean, langTag, rate, 1.04, token, null);
  }

  private pickVoice(langPrefix: "en" | "zh"): SpeechVoiceLike | null {
    if (this.voices.length === 0) {
      return null;
    }
    const preferred =
      langPrefix === "en" ? ["en-us", "en-gb", "en"] : ["zh-cn", "zh-tw", "zh-hk", "zh"];
    for (let p = 0; p < preferred.length; p++) {
      const prefix = preferred[p];
      let fallbackMatch: SpeechVoiceLike | null = null;
      for (let i = 0; i < this.voices.length; i++) {
        const v = this.voices[i];
        const lower = (v.lang || "").toLowerCase();
        if (lower === prefix || lower.startsWith(prefix + "-") || lower.startsWith(prefix + "_")) {
          if (v.localService) {
            return v;
          }
          if (!fallbackMatch) {
            fallbackMatch = v;
          }
        }
      }
      if (fallbackMatch) {
        return fallbackMatch;
      }
    }
    return null;
  }

  private speakSingle(
    text: string,
    langTag: "en-US" | "zh-CN",
    rate: number,
    pitch: number,
    token: number,
    onDone: (() => void) | null
  ): boolean {
    if (!this.host.synth || !this.host.createUtterance) {
      return false;
    }
    const clean = text.trim();
    if (!clean) {
      if (onDone) {
        onDone();
      }
      return false;
    }
    try {
      const utt = this.host.createUtterance(clean);
      utt.lang = langTag;
      utt.rate = rate;
      utt.pitch = pitch;
      const voice = this.pickVoice(langTag === "zh-CN" ? "zh" : "en");
      if (voice) {
        utt.voice = voice;
      }
      utt.onend = () => {
        if (this.generation === token && onDone) {
          onDone();
        }
      };
      utt.onerror = () => {
        if (this.generation === token && onDone) {
          onDone();
        }
      };
      this.host.synth.speak(utt);
      return true;
    } catch {
      return false;
    }
  }
}
