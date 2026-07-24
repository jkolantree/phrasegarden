import {
  materializeSelection,
  PHRASEGARDEN_COMPILER_VERSION,
  type CompilerCatalog,
  type RecipeConfiguration,
} from "../domain";
import { SUMMARY_EN_CATALOG, SUMMARY_EN_VERSION } from "../locales";
import {
  CANONICAL_LANGUAGE_REGISTRY_REF,
  EN_JA_PREVIEW_PACK,
  LANGUAGE_PROFILES,
  LANGUAGE_PROFILE_REFS,
  canonicalLanguageRegistry,
} from "../packs";
import {
  COMPILER_POLICY,
  COMPILER_POLICY_VERSION,
  INSTRUCTIONS_EN_PROMPT_SURFACE,
  INSTRUCTIONS_EN_VERSION,
  LIVE_VOICE_COACH_RECIPE,
  LIVE_VOICE_COACH_VERSION,
  WRITTEN_TRANSLATOR_RECIPE,
  WRITTEN_TRANSLATOR_VERSION,
} from "../recipes";

export const PHRASEGARDEN_CATALOG: CompilerCatalog = Object.freeze({
  manifest: Object.freeze({
    compilerVersion: PHRASEGARDEN_COMPILER_VERSION,
    languageRegistry: CANONICAL_LANGUAGE_REGISTRY_REF,
    profiles: LANGUAGE_PROFILE_REFS,
    recipes: Object.freeze([
      Object.freeze({
        id: "written-translator" as const,
        version: WRITTEN_TRANSLATOR_VERSION,
      }),
      Object.freeze({
        id: "live-voice-coach" as const,
        version: LIVE_VOICE_COACH_VERSION,
      }),
    ]),
    promptSurface: Object.freeze({
      id: "instructions-en",
      version: INSTRUCTIONS_EN_VERSION,
    }),
    compilerPolicyVersion: COMPILER_POLICY_VERSION,
    summaryCatalog: Object.freeze({
      locale: "en",
      version: SUMMARY_EN_VERSION,
    }),
  }),
  languageRegistry: canonicalLanguageRegistry,
  profiles: LANGUAGE_PROFILES,
  pairPacks: Object.freeze([EN_JA_PREVIEW_PACK]),
  recipes: Object.freeze([
    WRITTEN_TRANSLATOR_RECIPE,
    LIVE_VOICE_COACH_RECIPE,
  ]),
  promptSurfaces: Object.freeze([INSTRUCTIONS_EN_PROMPT_SURFACE]),
  compilerPolicies: Object.freeze([COMPILER_POLICY]),
  summaryCatalogs: Object.freeze([SUMMARY_EN_CATALOG]),
});

function defaultConfiguration(
  recipeId: "written-translator" | "live-voice-coach",
): RecipeConfiguration {
  const result = materializeSelection(
    {
      homeLanguageId: "en",
      targetLanguageId: "ja",
      recipeId,
    },
    PHRASEGARDEN_CATALOG,
  );
  if (!result.ok) {
    throw new Error(
      `Invalid bundled ${recipeId} configuration: ${result.issues
        .map((item) => `${item.code}:${item.path}`)
        .join(", ")}`,
    );
  }
  return result.value;
}

export const DEFAULT_WRITTEN_CONFIGURATION = defaultConfiguration(
  "written-translator",
);
export const DEFAULT_VOICE_CONFIGURATION = defaultConfiguration(
  "live-voice-coach",
);
