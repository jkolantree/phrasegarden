import type {
  CompilerPolicy,
  LanguageProfile,
  ModalityRecipe,
  PairPack,
  PromptSurface,
  SummaryCatalog,
} from "./authored";
import type { RecipeId, VersionRef } from "./configuration";
import type {
  CanonicalLanguageRegistry,
  LanguageProfileRef,
  LanguageRegistryRef,
} from "./language-identity";

export const PHRASEGARDEN_COMPILER_VERSION = "0.1.0-preview.1";

export interface CompilerManifest {
  readonly compilerVersion: string;
  readonly languageRegistry: LanguageRegistryRef;
  readonly profiles: readonly LanguageProfileRef[];
  readonly recipes: readonly {
    readonly id: RecipeId;
    readonly version: string;
  }[];
  readonly promptSurface: VersionRef;
  readonly compilerPolicyVersion: string;
  readonly summaryCatalog: {
    readonly locale: string;
    readonly version: string;
  };
}

export interface CompilerCatalog {
  readonly manifest: CompilerManifest;
  readonly languageRegistry: CanonicalLanguageRegistry;
  readonly profiles: readonly LanguageProfile[];
  readonly pairPacks: readonly PairPack[];
  readonly recipes: readonly ModalityRecipe[];
  readonly promptSurfaces: readonly PromptSurface[];
  readonly compilerPolicies: readonly CompilerPolicy[];
  readonly summaryCatalogs: readonly SummaryCatalog[];
}

export interface DefaultSelection {
  readonly homeLanguageId: string;
  readonly targetLanguageId: string;
  readonly recipeId: RecipeId;
}
