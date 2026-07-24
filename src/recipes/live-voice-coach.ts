import type { ModalityRecipe } from "../domain";
import {
  COMMON_CHOICE_CLAUSES,
  COMMON_DEFAULTS,
  COMMON_SUMMARY_ITEMS,
  choiceClauses,
  choiceSummaries,
} from "./shared";

export const LIVE_VOICE_COACH_VERSION = "1.0.0";

export const LIVE_VOICE_COACH_RECIPE: ModalityRecipe = {
  id: "live-voice-coach",
  version: LIVE_VOICE_COACH_VERSION,
  settingsSchemaVersion: 1,
  clauses: [
    {
      id: "recipe.voice.identity",
      origin: "recipe",
      authority: "modality",
      section: 1,
      order: 300,
      whenAll: [],
      renderingKey: "recipe.voice.identity",
      effect: {
        key: "recipe.identity",
        value: "portable-live-voice-coach",
      },
    },
    {
      id: "recipe.voice.procedure",
      origin: "recipe",
      authority: "modality",
      section: 4,
      order: 300,
      whenAll: [],
      renderingKey: "recipe.voice.procedure",
      effect: {
        key: "recipe.procedure",
        value: "short-audio-first-coaching-turns",
      },
    },
    {
      id: "recipe.voice.screenless",
      origin: "recipe",
      authority: "modality",
      section: 4,
      order: 310,
      whenAll: [],
      renderingKey: "recipe.voice.screenless",
      effect: {
        key: "recipe.screenless",
        value: "audible-without-visual-formatting",
      },
    },
    ...COMMON_CHOICE_CLAUSES,
    ...choiceClauses(
      "voice-correction-timing",
      "settings.correction.timing",
      [
        { value: "on-request" },
        { value: "after-turn" },
        { value: "blocking-only" },
        { value: "after-each-turn" },
      ],
      460,
      "setting.voice-correction-timing",
    ),
    ...choiceClauses(
      "voice-correction-focus",
      "settings.correction.focus",
      [
        { value: "meaning-and-force" },
        { value: "balanced" },
        { value: "form-detail" },
      ],
      470,
      "setting.voice-correction-focus",
    ),
    ...choiceClauses(
      "pronunciation",
      "settings.pronunciation",
      [
        { value: "off" },
        { value: "on-request" },
        { value: "when-helpful" },
      ],
      480,
      "setting.pronunciation",
    ),
    ...choiceClauses(
      "teaching-depth",
      "settings.teachingDepth",
      [
        { value: "minimal" },
        { value: "brief" },
        { value: "guided" },
        { value: "deep" },
      ],
      490,
      "setting.teaching-depth",
    ),
    ...choiceClauses(
      "voice-pace",
      "settings.pace",
      [{ value: "natural" }, { value: "slower" }],
      500,
      "setting.voice-pace",
    ),
    {
      id: "recipe.voice.turn-taking",
      origin: "recipe",
      authority: "modality",
      section: 7,
      order: 300,
      whenAll: [],
      renderingKey: "recipe.voice.turn-taking",
      effect: {
        key: "recipe.turn-taking",
        value: "learner-speaks-most-one-focus-per-turn",
      },
    },
    {
      id: "recipe.voice.semantic-controls",
      origin: "recipe",
      authority: "modality",
      section: 7,
      order: 310,
      whenAll: [],
      renderingKey: "recipe.voice.semantic-controls",
      effect: {
        key: "recipe.semantic-controls",
        value: "interrupt-wait-repeat-slower",
      },
    },
    {
      id: "recipe.voice.recovery",
      origin: "recipe",
      authority: "modality",
      section: 8,
      order: 300,
      whenAll: [],
      renderingKey: "recipe.voice.recovery",
      effect: {
        key: "recipe.recovery",
        value: "clarify-blocking-meaning-with-one-short-question",
      },
    },
  ],
  summaryItems: [
    {
      id: "behavior.tool.voice",
      order: 200,
      whenAll: [],
      values: {},
    },
    ...COMMON_SUMMARY_ITEMS,
    ...choiceSummaries(
      "behavior",
      "voice-correction-timing",
      "settings.correction.timing",
      ["on-request", "after-turn", "blocking-only", "after-each-turn"],
      340,
    ),
    ...choiceSummaries(
      "behavior",
      "voice-correction-focus",
      "settings.correction.focus",
      ["meaning-and-force", "balanced", "form-detail"],
      345,
    ),
    ...choiceSummaries(
      "behavior",
      "pronunciation",
      "settings.pronunciation",
      ["off", "on-request", "when-helpful"],
      350,
    ),
    ...choiceSummaries(
      "behavior",
      "teaching-depth",
      "settings.teachingDepth",
      ["minimal", "brief", "guided", "deep"],
      360,
    ),
    ...choiceSummaries(
      "behavior",
      "voice-pace",
      "settings.pace",
      ["natural", "slower"],
      370,
    ),
  ],
  defaults: {
    ...COMMON_DEFAULTS,
    destination: {
      userEvidence: "unknown",
      assistantOutput: "unknown",
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
  },
  knownLimitations: [
    {
      code: "L-VOICE-AUDIO-EVIDENCE-UNKNOWN",
      order: 200,
      whenAll: [
        { path: "destination.userEvidence", op: "eq", value: "unknown" },
      ],
      renderingKey: "limitation.voice.audio-evidence-unknown",
    },
    {
      code: "L-VOICE-PRONUNCIATION-TRANSCRIPT",
      order: 210,
      whenAll: [
        {
          path: "destination.userEvidence",
          op: "eq",
          value: "text-or-transcript",
        },
        {
          path: "settings.pronunciation",
          op: "in",
          values: ["on-request", "when-helpful"],
        },
      ],
      renderingKey: "limitation.voice.pronunciation-transcript",
    },
    {
      code: "L-VOICE-OUTPUT-UNKNOWN",
      order: 220,
      whenAll: [
        { path: "destination.assistantOutput", op: "eq", value: "unknown" },
      ],
      renderingKey: "limitation.voice.output-unknown",
    },
    {
      code: "L-VOICE-INTERRUPTION-UNKNOWN",
      order: 230,
      whenAll: [
        {
          path: "destination.interruptionSignal",
          op: "eq",
          value: "unknown",
        },
      ],
      renderingKey: "limitation.voice.interruption-unknown",
    },
    {
      code: "L-VOICE-INTERRUPTION-UNAVAILABLE",
      order: 230,
      whenAll: [
        {
          path: "destination.interruptionSignal",
          op: "eq",
          value: "unavailable",
        },
      ],
      renderingKey: "limitation.voice.interruption-unavailable",
    },
    {
      code: "L-VOICE-SILENCE-UNKNOWN",
      order: 240,
      whenAll: [
        {
          path: "destination.silenceSignal",
          op: "eq",
          value: "unknown",
        },
      ],
      renderingKey: "limitation.voice.silence-unknown",
    },
    {
      code: "L-VOICE-SILENCE-UNAVAILABLE",
      order: 240,
      whenAll: [
        {
          path: "destination.silenceSignal",
          op: "eq",
          value: "unavailable",
        },
      ],
      renderingKey: "limitation.voice.silence-unavailable",
    },
    {
      code: "L-VOICE-PLAYBACK-UNKNOWN",
      order: 250,
      whenAll: [
        {
          path: "destination.playbackRateControl",
          op: "eq",
          value: "unknown",
        },
      ],
      renderingKey: "limitation.voice.playback-unknown",
    },
    {
      code: "L-VOICE-PLAYBACK-UNAVAILABLE",
      order: 250,
      whenAll: [
        {
          path: "destination.playbackRateControl",
          op: "eq",
          value: "unavailable",
        },
      ],
      renderingKey: "limitation.voice.playback-unavailable",
    },
  ],
};
