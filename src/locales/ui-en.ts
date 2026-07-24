import type {
  CompilerWarningCode,
} from "../domain";

export const LIMITATION_MESSAGES_EN: Readonly<Record<string, string>> = {
  "L-PREVIEW-EXTERNAL-REVIEW":
    "The built-in pair guidance is versioned, but external linguistic review has not been completed.",
  "L-GENERIC-NO-PAIR-GUIDANCE":
    "No exact directed pair pack exists, so this prompt contains no endpoint- or pair-specific linguistic guidance.",
  "L-EN-JA-UNKNOWN-NAME-READING":
    "An unknown Japanese name reading cannot be derived safely from spelling alone.",
  "L-JA-EN-UNKNOWN-NAME-READING":
    "An unknown Japanese name reading cannot be transliterated safely from characters alone.",
  "L-VOICE-AUDIO-EVIDENCE-UNKNOWN":
    "Audio evidence is unknown; the coach cannot honestly claim to hear pronunciation.",
  "L-VOICE-PRONUNCIATION-TRANSCRIPT":
    "A transcript can support pronunciation teaching, but not assessment of what was actually pronounced.",
  "L-VOICE-OUTPUT-UNKNOWN":
    "Spoken assistant output is not confirmed by the destination.",
  "L-VOICE-INTERRUPTION-UNKNOWN":
    "Host-level interruption signaling is unknown.",
  "L-VOICE-INTERRUPTION-UNAVAILABLE":
    "Host-level interruption signaling is unavailable.",
  "L-VOICE-SILENCE-UNKNOWN": "Silence detection is unknown.",
  "L-VOICE-SILENCE-UNAVAILABLE": "Silence detection is unavailable.",
  "L-VOICE-PLAYBACK-UNKNOWN": "Playback-rate control is unknown.",
  "L-VOICE-PLAYBACK-UNAVAILABLE": "Playback-rate control is unavailable.",
};

export const WARNING_MESSAGES_EN: Readonly<
  Record<CompilerWarningCode, string>
> = {
  "W-GENERIC-LIMITED":
    "Generic output intentionally omits endpoint- and pair-specific linguistic guidance.",
  "W-PREVIEW-EXTERNAL-REVIEW":
    "Preview guidance has not completed external linguistic review.",
  "W-USER-EVIDENCE-UNKNOWN":
    "The destination's input evidence is unknown.",
  "W-ASSISTANT-OUTPUT-UNKNOWN":
    "The destination's spoken-output capability is unknown.",
  "W-INTERRUPTION-UNKNOWN":
    "The destination's interruption signal is unknown.",
  "W-INTERRUPTION-UNAVAILABLE":
    "The destination cannot signal interruption.",
  "W-SILENCE-UNKNOWN": "The destination's silence signal is unknown.",
  "W-SILENCE-UNAVAILABLE": "The destination cannot signal silence.",
  "W-PLAYBACK-RATE-UNKNOWN":
    "The destination's playback-rate control is unknown.",
  "W-PLAYBACK-RATE-UNAVAILABLE":
    "The destination cannot control playback rate.",
  "W-PRONUNCIATION-TRANSCRIPT":
    "Transcript-only evidence cannot support pronunciation assessment.",
  "W-PROMPT-BUDGET":
    "The generated prompt is approaching the portable byte budget.",
};
