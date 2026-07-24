import type {
  CompilerWarningCode,
} from "../domain";

export const LIMITATION_MESSAGES_EN: Readonly<Record<string, string>> = {
  "L-PREVIEW-EXTERNAL-REVIEW":
    "This language direction uses guidance built into PhraseGarden. Independent language review is not complete.",
  "L-GENERIC-NO-PAIR-GUIDANCE":
    "PhraseGarden has no built-in guide for this language direction. This prompt uses general guidance only.",
  "L-EN-JA-UNKNOWN-NAME-READING":
    "Spelling alone is not enough to know how an unfamiliar Japanese name is pronounced.",
  "L-JA-EN-UNKNOWN-NAME-READING":
    "Japanese characters alone are not enough to know how an unfamiliar name should be written in Latin letters.",
  "L-VOICE-AUDIO-EVIDENCE-UNKNOWN":
    "It is not known whether your language tool provides audio. Without audio, the coach cannot assess what you actually pronounced.",
  "L-VOICE-PRONUNCIATION-TRANSCRIPT":
    "A transcript can help teach pronunciation, but it cannot show what you actually pronounced.",
  "L-VOICE-OUTPUT-UNKNOWN":
    "It is not known whether your language tool can speak the coach's replies aloud.",
  "L-VOICE-INTERRUPTION-UNKNOWN":
    "It is not known whether your language tool can detect interruptions.",
  "L-VOICE-INTERRUPTION-UNAVAILABLE":
    "Your language tool cannot detect interruptions.",
  "L-VOICE-SILENCE-UNKNOWN":
    "It is not known whether your language tool can detect silence.",
  "L-VOICE-SILENCE-UNAVAILABLE":
    "Your language tool cannot detect silence.",
  "L-VOICE-PLAYBACK-UNKNOWN":
    "It is not known whether your language tool can change speaking speed.",
  "L-VOICE-PLAYBACK-UNAVAILABLE":
    "Your language tool cannot change speaking speed.",
};

export const WARNING_MESSAGES_EN: Readonly<
  Record<CompilerWarningCode, string>
> = {
  "W-GENERIC-LIMITED":
    "This Generic prompt uses general guidance only. It has no guidance written for this exact language direction.",
  "W-PREVIEW-EXTERNAL-REVIEW":
    "This Preview guidance has not completed independent language review.",
  "W-USER-EVIDENCE-UNKNOWN":
    "It is not known whether your language tool receives audio, text, or a transcript.",
  "W-ASSISTANT-OUTPUT-UNKNOWN":
    "It is not known whether your language tool can speak the coach's replies aloud.",
  "W-INTERRUPTION-UNKNOWN":
    "It is not known whether your language tool can detect interruptions.",
  "W-INTERRUPTION-UNAVAILABLE":
    "Your language tool cannot detect interruptions.",
  "W-SILENCE-UNKNOWN":
    "It is not known whether your language tool can detect silence.",
  "W-SILENCE-UNAVAILABLE":
    "Your language tool cannot detect silence.",
  "W-PLAYBACK-RATE-UNKNOWN":
    "It is not known whether your language tool can change speaking speed.",
  "W-PLAYBACK-RATE-UNAVAILABLE":
    "Your language tool cannot change speaking speed.",
  "W-PRONUNCIATION-TRANSCRIPT":
    "A transcript cannot show what you actually pronounced.",
  "W-PROMPT-BUDGET":
    "This prompt is close to PhraseGarden's maximum prompt size.",
};

export const OPTION_LABELS_EN: Readonly<Record<string, string>> = {
  unspecified: "Not specified",
  strangers: "Strangers",
  acquaintances: "Acquaintances",
  friends: "Friends",
  "close-relationship": "Close relationship",
  family: "Family",
  "romantic-partners": "Romantic partners",
  coworkers: "Coworkers",
  "customer-service": "Customer and service worker",
  "teacher-learner": "Teacher and learner",
  other: "Something else",
  peers: "About equal",
  "source-speaker-higher": "Speaker or writer has higher status",
  "addressee-higher": "Listener or reader has higher status",
  preserve: "Keep the original tone and formality",
  casual: "More casual",
  neutral: "Neutral",
  polite: "More polite",
  formal: "More formal",
  concise: "Translation first, minimal notes",
  "brief-notes": "Translation + short notes",
  teaching: "Translation + teaching notes",
  "on-request": "Only when asked",
  "after-turn": "After a turn, when useful",
  "blocking-only":
    "Only when it blocks understanding or changes meaning or tone",
  "after-each-turn": "After every turn",
  "meaning-and-force": "Meaning and tone",
  balanced: "Balanced",
  "form-detail": "Grammar and wording",
  off: "No pronunciation help",
  "when-helpful": "When it would help",
  minimal: "Very short",
  brief: "Short explanation",
  guided: "Guided retry",
  deep: "Detailed teaching",
  natural: "Natural pace",
  slower: "Slower, shorter phrases",
  "preserve-and-note": "Keep it and add a note",
  "ask-if-blocking": "Ask one short question only if needed",
  "marked-best-effort": "Make a careful best effort",
  consecutive: "One complete turn or message",
  "short-relay": "One short, complete chunk",
  "mark-uncertainty": "Continue carefully and mark uncertainty",
  "preserve-marked-title":
    "Keep the title, marking it if there is no safe equivalent",
  "adapt-only-known-role": "Adapt only when the person's role is clear",
  "preserve-and-ask": "Keep the name and ask if its reading is needed",
  unknown: "I don't know",
  "text-or-transcript": "Text or transcript only",
  "audible-audio": "The tool can hear audio",
  text: "Text only",
  spoken: "Spoken audio",
  available: "Yes",
  unavailable: "No",
};
