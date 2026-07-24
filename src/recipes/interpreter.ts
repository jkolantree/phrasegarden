import type { ModalityRecipe } from "../domain";
import {
  COMMON_CHOICE_CLAUSES,
  COMMON_DEFAULTS,
  COMMON_SUMMARY_ITEMS,
  choiceClauses,
  choiceSummaries,
} from "./shared";

export const INTERPRETER_VERSION = "1.0.0";

const INTERPRETER_COMMON_CHOICE_CLAUSES = COMMON_CHOICE_CLAUSES.filter(
  (clause) =>
    clause.effect.key !== "setting.ambiguity" &&
    clause.effect.key !== "setting.unknown-name",
);

const INTERPRETER_COMMON_SUMMARY_ITEMS = COMMON_SUMMARY_ITEMS.filter(
  (item) => !item.id.startsWith("behavior.ambiguity."),
);

export const INTERPRETER_RECIPE: ModalityRecipe = {
  id: "interpreter",
  version: INTERPRETER_VERSION,
  settingsSchemaVersion: 1,
  clauses: [
    {
      id: "recipe.interpreter.identity",
      origin: "recipe",
      authority: "modality",
      section: 1,
      order: 300,
      whenAll: [],
      renderingKey: "recipe.interpreter.identity",
      effect: {
        key: "recipe.identity",
        value: "portable-one-way-interpreter",
      },
    },
    {
      id: "recipe.interpreter.procedure",
      origin: "recipe",
      authority: "modality",
      section: 4,
      order: 300,
      whenAll: [],
      renderingKey: "recipe.interpreter.procedure",
      effect: {
        key: "recipe.procedure",
        value: "relay-complete-home-turn-to-target",
      },
    },
    {
      id: "recipe.interpreter.channel-boundary",
      origin: "recipe",
      authority: "modality",
      section: 4,
      order: 310,
      whenAll: [],
      renderingKey: "recipe.interpreter.channel-boundary",
      effect: {
        key: "recipe.channel-boundary",
        value: "use-only-host-supplied-complete-turns",
      },
    },
    ...INTERPRETER_COMMON_CHOICE_CLAUSES,
    ...choiceClauses(
      "interpreter-ambiguity",
      "ambiguity",
      [
        { value: "preserve-and-note" },
        { value: "ask-if-blocking" },
        { value: "marked-best-effort" },
      ],
      430,
      "setting.ambiguity",
    ),
    ...choiceClauses(
      "interpreter-unknown-name",
      "unknownName",
      [{ value: "preserve-and-ask" }, { value: "preserve-and-note" }],
      450,
      "setting.unknown-name",
    ),
    ...choiceClauses(
      "interpreter-turn-mode",
      "settings.turnMode",
      [{ value: "consecutive" }, { value: "short-relay" }],
      460,
      "setting.interpreter-turn-mode",
    ),
    {
      id: "recipe.interpreter.output-contract",
      origin: "recipe",
      authority: "modality",
      section: 7,
      order: 300,
      whenAll: [],
      renderingKey: "recipe.interpreter.output-contract",
      effect: {
        key: "recipe.output-contract",
        value: "relay-only-no-answer-or-advice",
      },
    },
    {
      id: "recipe.interpreter.source-state",
      origin: "recipe",
      authority: "modality",
      section: 8,
      order: 300,
      whenAll: [],
      renderingKey: "recipe.interpreter.source-state",
      effect: {
        key: "recipe.source-state",
        value: "each-complete-message-is-source-turn",
      },
    },
  ],
  summaryItems: [
    {
      id: "behavior.tool.interpreter",
      order: 200,
      whenAll: [],
      values: {},
    },
    {
      id: "behavior.interpreter.relay-only",
      order: 210,
      whenAll: [],
      values: {},
    },
    {
      id: "behavior.interpreter.host-boundary",
      order: 220,
      whenAll: [],
      values: {},
    },
    ...INTERPRETER_COMMON_SUMMARY_ITEMS,
    ...choiceSummaries(
      "behavior",
      "interpreter-ambiguity",
      "ambiguity",
      ["preserve-and-note", "ask-if-blocking", "marked-best-effort"],
      330,
    ),
    ...choiceSummaries(
      "behavior",
      "interpreter-turn-mode",
      "settings.turnMode",
      ["consecutive", "short-relay"],
      340,
    ),
    ...choiceSummaries(
      "behavior",
      "interpreter-clarification",
      "settings.clarification",
      ["ask-if-blocking", "mark-uncertainty"],
      350,
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
      modality: "interpreting",
      turnMode: "consecutive",
      clarification: "ask-if-blocking",
    },
  },
  knownLimitations: [],
};
