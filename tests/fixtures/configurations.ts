import type {
  InterpreterRecipeConfiguration,
  VoiceRecipeConfiguration,
  WrittenRecipeConfiguration,
} from "../../src/domain";
import { CANONICAL_LANGUAGE_REGISTRY_REF } from "../../src/packs";

export const validWrittenConfiguration: WrittenRecipeConfiguration = {
  schemaVersion: 1,
  languageRegistry: CANONICAL_LANGUAGE_REGISTRY_REF,
  recipe: { id: "written-translator", version: "0.0.0-test" },
  promptSurface: { id: "instructions-en", version: "0.0.0-test" },
  languages: {
    home: { id: "en", version: "0.0.0-test" },
    target: { id: "ja", version: "0.0.0-test" },
  },
  socialContext: {
    relationship: "unspecified",
    hierarchy: "unspecified",
  },
  register: { strategy: "preserve" },
  ambiguity: "ask-if-blocking",
  codeSwitching: "preserve",
  dataHandling: { strategy: "preserve-as-written" },
  titleHandling: "preserve-marked-title",
  unknownName: "preserve-and-ask",
  destination: {
    userEvidence: "text-or-transcript",
    assistantOutput: "text",
    interruptionSignal: "unavailable",
    silenceSignal: "unavailable",
    playbackRateControl: "unavailable",
  },
  settings: { modality: "written", outputDetail: "concise" },
};

export const validVoiceConfiguration: VoiceRecipeConfiguration = {
  ...validWrittenConfiguration,
  recipe: { id: "live-voice-coach", version: "0.0.0-test" },
  destination: {
    userEvidence: "audible-audio",
    assistantOutput: "spoken",
    interruptionSignal: "unknown",
    silenceSignal: "unknown",
    playbackRateControl: "unknown",
  },
  settings: {
    modality: "live-voice",
    correction: { timing: "after-turn", focus: "balanced" },
    pronunciation: "on-request",
    teachingDepth: "brief",
    pace: "natural",
  },
};

export const validInterpreterConfiguration: InterpreterRecipeConfiguration = {
  ...validWrittenConfiguration,
  recipe: { id: "interpreter", version: "0.0.0-test" },
  settings: {
    modality: "interpreting",
    turnMode: "consecutive",
    clarification: "ask-if-blocking",
  },
};

export function jsonClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
