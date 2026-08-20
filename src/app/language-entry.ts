import { materializeSelection, type RecipeConfiguration } from "../domain";
import type { InterfaceLocaleId } from "../locales";
import { PHRASEGARDEN_CATALOG } from "./runtime-catalog";

export type LanguageEntryPhase = "starting" | "preserve-work";

export const START_PRESET_BY_LOCALE = Object.freeze({
  en: Object.freeze({
    homeLanguageId: "en",
    targetLanguageId: "ja",
    recipeId: "written-translator",
  }),
  ja: Object.freeze({
    homeLanguageId: "ja",
    targetLanguageId: "en",
    recipeId: "written-translator",
  }),
} as const);

export type LanguageEntryDecision =
  | {
      readonly kind: "apply-start-preset";
      readonly locale: InterfaceLocaleId;
      readonly configuration: RecipeConfiguration;
    }
  | {
      readonly kind: "change-interface-only";
      readonly locale: InterfaceLocaleId;
    };

export function decideLanguageEntry(
  phase: LanguageEntryPhase,
  locale: InterfaceLocaleId,
): LanguageEntryDecision {
  if (phase === "preserve-work") {
    return { kind: "change-interface-only", locale };
  }
  const materialized = materializeSelection(
    START_PRESET_BY_LOCALE[locale],
    PHRASEGARDEN_CATALOG,
  );
  if (!materialized.ok) {
    throw new Error(
      `Invalid language-entry preset: ${materialized.issues
        .map((issue) => `${issue.code}:${issue.path}`)
        .join(",")}`,
    );
  }
  return {
    kind: "apply-start-preset",
    locale,
    configuration: materialized.value,
  };
}
