import type {
  LanguageProfileRef,
  LanguageRegistryRef,
} from "./language-identity";

export const RECIPE_IDS = [
  "written-translator",
  "live-voice-coach",
  "interpreter",
] as const;
export type RecipeId = (typeof RECIPE_IDS)[number];

export const RELATIONSHIPS = [
  "unspecified",
  "strangers",
  "acquaintances",
  "friends",
  "close-relationship",
  "family",
  "romantic-partners",
  "coworkers",
  "customer-service",
  "teacher-learner",
  "other",
] as const;
export type Relationship = (typeof RELATIONSHIPS)[number];

export const HIERARCHIES = [
  "unspecified",
  "peers",
  "source-speaker-higher",
  "addressee-higher",
] as const;
export type Hierarchy = (typeof HIERARCHIES)[number];

export const REGISTER_LEVELS = [
  "casual",
  "neutral",
  "polite",
  "formal",
] as const;
export type RegisterLevel = (typeof REGISTER_LEVELS)[number];

export const AMBIGUITY_STRATEGIES = [
  "preserve-and-note",
  "ask-if-blocking",
  "marked-best-effort",
] as const;
export type AmbiguityStrategy = (typeof AMBIGUITY_STRATEGIES)[number];

export const TITLE_HANDLING_STRATEGIES = [
  "preserve-marked-title",
  "adapt-only-known-role",
] as const;
export type TitleHandling = (typeof TITLE_HANDLING_STRATEGIES)[number];

export const UNKNOWN_NAME_STRATEGIES = [
  "preserve-and-ask",
  "preserve-and-note",
] as const;
export type UnknownNameHandling = (typeof UNKNOWN_NAME_STRATEGIES)[number];

export const USER_EVIDENCE_CAPABILITIES = [
  "unknown",
  "text-or-transcript",
  "audible-audio",
] as const;
export type UserEvidenceCapability =
  (typeof USER_EVIDENCE_CAPABILITIES)[number];

export const ASSISTANT_OUTPUT_CAPABILITIES = [
  "unknown",
  "text",
  "spoken",
] as const;
export type AssistantOutputCapability =
  (typeof ASSISTANT_OUTPUT_CAPABILITIES)[number];

export const SIGNAL_CAPABILITIES = [
  "unknown",
  "available",
  "unavailable",
] as const;
export type SignalCapability = (typeof SIGNAL_CAPABILITIES)[number];

export const WRITTEN_OUTPUT_DETAILS = [
  "concise",
  "brief-notes",
  "teaching",
] as const;
export type WrittenOutputDetail = (typeof WRITTEN_OUTPUT_DETAILS)[number];

export const VOICE_CORRECTION_TIMINGS = [
  "on-request",
  "after-turn",
  "blocking-only",
  "after-each-turn",
] as const;
export type VoiceCorrectionTiming =
  (typeof VOICE_CORRECTION_TIMINGS)[number];

export const VOICE_CORRECTION_FOCI = [
  "meaning-and-force",
  "balanced",
  "form-detail",
] as const;
export type VoiceCorrectionFocus = (typeof VOICE_CORRECTION_FOCI)[number];

export const PRONUNCIATION_MODES = [
  "off",
  "on-request",
  "when-helpful",
] as const;
export type PronunciationMode = (typeof PRONUNCIATION_MODES)[number];

export const TEACHING_DEPTHS = [
  "minimal",
  "brief",
  "guided",
  "deep",
] as const;
export type TeachingDepth = (typeof TEACHING_DEPTHS)[number];

export const VOICE_PACES = ["natural", "slower"] as const;
export type VoicePace = (typeof VOICE_PACES)[number];

export const INTERPRETER_TURN_MODES = [
  "consecutive",
  "short-relay",
] as const;
export type InterpreterTurnMode = (typeof INTERPRETER_TURN_MODES)[number];

export const INTERPRETER_CLARIFICATIONS = [
  "ask-if-blocking",
  "mark-uncertainty",
] as const;
export type InterpreterClarification =
  (typeof INTERPRETER_CLARIFICATIONS)[number];

export const MODALITIES = ["written", "live-voice", "interpreting"] as const;
export type Modality = (typeof MODALITIES)[number];

export const CODE_SWITCHING_STRATEGIES = ["preserve"] as const;
export type CodeSwitchingStrategy =
  (typeof CODE_SWITCHING_STRATEGIES)[number];

export const DATA_HANDLING_STRATEGIES = ["preserve-as-written"] as const;
export type DataHandlingStrategy =
  (typeof DATA_HANDLING_STRATEGIES)[number];

export interface VersionRef {
  readonly id: string;
  readonly version: string;
}

export type RegisterPreference =
  | { readonly strategy: "preserve" }
  | { readonly strategy: "adapt"; readonly level: RegisterLevel };

export interface DataHandling {
  readonly strategy: DataHandlingStrategy;
}

export interface DestinationCapabilities {
  readonly userEvidence: UserEvidenceCapability;
  readonly assistantOutput: AssistantOutputCapability;
  readonly interruptionSignal: SignalCapability;
  readonly silenceSignal: SignalCapability;
  readonly playbackRateControl: SignalCapability;
}

export interface WrittenSettings {
  readonly modality: "written";
  readonly outputDetail: WrittenOutputDetail;
}

export interface VoiceSettings {
  readonly modality: "live-voice";
  readonly correction: {
    readonly timing: VoiceCorrectionTiming;
    readonly focus: VoiceCorrectionFocus;
  };
  readonly pronunciation: PronunciationMode;
  readonly teachingDepth: TeachingDepth;
  readonly pace: VoicePace;
}

export interface InterpreterSettings {
  readonly modality: "interpreting";
  readonly turnMode: InterpreterTurnMode;
  readonly clarification: InterpreterClarification;
}

export type ModalitySettings =
  | WrittenSettings
  | VoiceSettings
  | InterpreterSettings;

interface ConfigurationCommon {
  readonly schemaVersion: 1;
  readonly languageRegistry: LanguageRegistryRef;
  readonly promptSurface: VersionRef;
  readonly languages: {
    readonly home: LanguageProfileRef;
    readonly target: LanguageProfileRef;
  };
  readonly socialContext: {
    readonly relationship: Relationship;
    readonly hierarchy: Hierarchy;
  };
  readonly register: RegisterPreference;
  readonly ambiguity: AmbiguityStrategy;
  readonly codeSwitching: CodeSwitchingStrategy;
  readonly dataHandling: DataHandling;
  readonly titleHandling: TitleHandling;
  readonly unknownName: UnknownNameHandling;
  readonly destination: DestinationCapabilities;
}

export type WrittenRecipeConfiguration = ConfigurationCommon & {
  readonly recipe: {
    readonly id: "written-translator";
    readonly version: string;
  };
  readonly settings: WrittenSettings;
};

export type VoiceRecipeConfiguration = ConfigurationCommon & {
  readonly recipe: {
    readonly id: "live-voice-coach";
    readonly version: string;
  };
  readonly settings: VoiceSettings;
};

export type InterpreterRecipeConfiguration = ConfigurationCommon & {
  readonly recipe: {
    readonly id: "interpreter";
    readonly version: string;
  };
  readonly settings: InterpreterSettings;
};

export type RecipeConfiguration =
  | WrittenRecipeConfiguration
  | VoiceRecipeConfiguration
  | InterpreterRecipeConfiguration;

export type SharePayloadV1 = {
  readonly shareVersion: 1;
  readonly languageRegistry: LanguageRegistryRef;
  readonly recipe: RecipeConfiguration["recipe"];
  readonly promptSurface: VersionRef;
  readonly languages: {
    readonly home: LanguageProfileRef;
    readonly target: LanguageProfileRef;
  };
  readonly register: RegisterPreference;
  readonly ambiguity: AmbiguityStrategy;
  readonly codeSwitching: CodeSwitchingStrategy;
  readonly dataHandling: DataHandling;
  readonly titleHandling: TitleHandling;
  readonly unknownName: UnknownNameHandling;
  readonly settings: ModalitySettings;
};
