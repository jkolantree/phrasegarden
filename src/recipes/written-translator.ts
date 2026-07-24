import type { ModalityRecipe } from "../domain";
import {
  COMMON_CHOICE_CLAUSES,
  COMMON_DEFAULTS,
  COMMON_SUMMARY_ITEMS,
  choiceClauses,
  choiceSummaries,
} from "./shared";

export const WRITTEN_TRANSLATOR_VERSION = "1.0.0";

export const WRITTEN_TRANSLATOR_RECIPE: ModalityRecipe = {
  id: "written-translator",
  version: WRITTEN_TRANSLATOR_VERSION,
  settingsSchemaVersion: 1,
  clauses: [
    {
      id: "recipe.written.identity",
      origin: "recipe",
      authority: "modality",
      section: 1,
      order: 300,
      whenAll: [],
      renderingKey: "recipe.written.identity",
      effect: {
        key: "recipe.identity",
        value: "portable-written-translator",
      },
    },
    {
      id: "recipe.written.procedure",
      origin: "recipe",
      authority: "modality",
      section: 4,
      order: 300,
      whenAll: [],
      renderingKey: "recipe.written.procedure",
      effect: {
        key: "recipe.procedure",
        value: "translate-next-source-message",
      },
    },
    ...COMMON_CHOICE_CLAUSES,
    ...choiceClauses(
      "written-detail",
      "settings.outputDetail",
      [
        { value: "concise" },
        { value: "brief-notes" },
        { value: "teaching" },
      ],
      460,
      "setting.written-output-detail",
    ),
    {
      id: "recipe.written.output-contract",
      origin: "recipe",
      authority: "modality",
      section: 7,
      order: 300,
      whenAll: [],
      renderingKey: "recipe.written.output-contract",
      effect: {
        key: "recipe.output-contract",
        value: "translation-first-no-preamble",
      },
    },
    {
      id: "recipe.written.source-state",
      origin: "recipe",
      authority: "modality",
      section: 8,
      order: 300,
      whenAll: [],
      renderingKey: "recipe.written.source-state",
      effect: {
        key: "recipe.source-state",
        value: "every-next-message-is-source",
      },
    },
  ],
  summaryItems: [
    {
      id: "behavior.tool.written",
      order: 200,
      whenAll: [],
      values: {},
    },
    ...COMMON_SUMMARY_ITEMS,
    ...choiceSummaries(
      "behavior",
      "written-detail",
      "settings.outputDetail",
      ["concise", "brief-notes", "teaching"],
      340,
    ),
  ],
  defaults: {
    ...COMMON_DEFAULTS,
    destination: {
      userEvidence: "text-or-transcript",
      assistantOutput: "text",
      interruptionSignal: "unavailable",
      silenceSignal: "unavailable",
      playbackRateControl: "unavailable",
    },
    settings: { modality: "written", outputDetail: "concise" },
  },
  knownLimitations: [],
};
