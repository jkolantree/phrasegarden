import type {
  RecipeConfiguration,
  RecipeId,
} from "./configuration";
import type {
  CanonicalLanguageId,
  CanonicalLanguageRegistry,
  LanguageProfileRef,
  LanguageRegistryRef,
} from "./language-identity";

export const SUPPORT_TIERS = [
  "flagship",
  "reviewed",
  "community",
  "preview",
  "generic",
] as const;
export type SupportTier = (typeof SUPPORT_TIERS)[number];

export const AUTHORITIES = [
  "invariant",
  "normalized-setting",
  "modality",
  "pair-pack",
  "profile",
  "fallback",
] as const;
export type Authority = (typeof AUTHORITIES)[number];

export const CLAUSE_ORIGINS = [
  "invariant",
  "recipe",
  "profile",
  "pair-pack",
] as const;
export type ClauseOrigin = (typeof CLAUSE_ORIGINS)[number];

export const CLAUSE_SECTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export type ClauseSection = (typeof CLAUSE_SECTIONS)[number];

export const CONDITION_PATHS = [
  "recipe.id",
  "languages.home.id",
  "languages.target.id",
  "socialContext.relationship",
  "socialContext.hierarchy",
  "register.strategy",
  "register.level",
  "ambiguity",
  "codeSwitching",
  "dataHandling.strategy",
  "titleHandling",
  "unknownName",
  "destination.userEvidence",
  "destination.assistantOutput",
  "destination.interruptionSignal",
  "destination.silenceSignal",
  "destination.playbackRateControl",
  "settings.modality",
  "settings.outputDetail",
  "settings.correction.timing",
  "settings.correction.focus",
  "settings.pronunciation",
  "settings.teachingDepth",
  "settings.pace",
  "settings.turnMode",
  "settings.clarification",
  "resolved.supportTier",
  "resolved.pairPack",
] as const;
export type ConditionPath = (typeof CONDITION_PATHS)[number];

export type ClauseCondition =
  | {
      readonly path: ConditionPath;
      readonly op: "eq";
      readonly value: string;
    }
  | {
      readonly path: ConditionPath;
      readonly op: "in";
      readonly values: readonly string[];
    }
  | {
      readonly path: "resolved.pairPack";
      readonly op: "present" | "absent";
    };

export const RENDER_VALUE_PATHS = [
  "compiler.version",
  "compiler.policyVersion",
  "schema.version",
  "languageRegistry.version",
  "languageRegistry.contentSha256",
  "recipe.id",
  "recipe.version",
  "home.id",
  "home.version",
  "home.autonym",
  "target.id",
  "target.version",
  "target.autonym",
  "pairPack.id-or-none",
  "pairPack.version-or-none",
  "support.tier",
  "support.direction",
  "support.review-status",
  "support.review-date",
  "promptSurface.id",
  "promptSurface.locale",
  "promptSurface.version",
] as const;
export type RenderValuePath = (typeof RENDER_VALUE_PATHS)[number];

export const RENDER_VALUE_FORMATS = ["plain", "inline-code"] as const;
export type RenderValueFormat = (typeof RENDER_VALUE_FORMATS)[number];

export const LANGUAGE_DIRECTIONS = ["ltr", "rtl"] as const;
export type LanguageDirection = (typeof LANGUAGE_DIRECTIONS)[number];

export type RenderPart =
  | { readonly kind: "literal"; readonly text: string }
  | {
      readonly kind: "value";
      readonly path: RenderValuePath;
      readonly format: RenderValueFormat;
    };

export interface Clause {
  readonly id: string;
  readonly origin: ClauseOrigin;
  readonly authority: Authority;
  readonly section: ClauseSection;
  readonly order: number;
  readonly whenAll: readonly ClauseCondition[];
  readonly renderingKey: string;
  readonly effect: {
    readonly key: string;
    readonly value: string;
  };
  readonly refines?: readonly {
    readonly key: string;
    readonly value?: string;
  }[];
}

export interface PromptSurface {
  readonly id: string;
  readonly locale: string;
  readonly version: string;
  readonly renderings: readonly {
    readonly key: string;
    readonly parts: readonly RenderPart[];
  }[];
}

export interface SummaryItemSpec {
  readonly id: string;
  readonly order: number;
  readonly whenAll: readonly ClauseCondition[];
  readonly values: Readonly<Record<string, RenderValuePath | ConditionPath>>;
}

export interface SummaryCatalog {
  readonly locale: string;
  readonly version: string;
  readonly messages: readonly {
    readonly id: string;
    readonly parts: readonly (
      | { readonly kind: "literal"; readonly text: string }
      | { readonly kind: "value"; readonly name: string }
    )[];
  }[];
}

export interface LimitationSpec {
  readonly code: string;
  readonly order: number;
  readonly whenAll: readonly ClauseCondition[];
  readonly renderingKey: string;
}

export interface LanguageProfile {
  readonly languageRegistry: LanguageRegistryRef;
  readonly id: CanonicalLanguageId;
  readonly version: string;
  readonly bcp47: CanonicalLanguageId;
  readonly autonym: string;
  readonly searchableNames: readonly string[];
  readonly direction: LanguageDirection;
  readonly scripts: readonly string[];
  readonly monolingualClauses: readonly Clause[];
}

export interface PairDirection {
  readonly languageRegistry: LanguageRegistryRef;
  readonly home: LanguageProfileRef;
  readonly target: LanguageProfileRef;
  readonly clauses: readonly Clause[];
  readonly knownLimitations: readonly LimitationSpec[];
}

export interface PairPack {
  readonly id: string;
  readonly version: string;
  readonly directions: readonly PairDirection[];
}

export interface ModalityRecipe {
  readonly id: RecipeId;
  readonly version: string;
  readonly settingsSchemaVersion: number;
  readonly clauses: readonly Clause[];
  readonly summaryItems: readonly SummaryItemSpec[];
  readonly defaults: Omit<
    RecipeConfiguration,
    | "schemaVersion"
    | "languageRegistry"
    | "recipe"
    | "promptSurface"
    | "languages"
  >;
  readonly knownLimitations: readonly LimitationSpec[];
}

export interface CompilerPolicy {
  readonly version: string;
  readonly compatibleCompilerVersion: string;
  readonly invariantClauses: readonly Clause[];
  readonly summaryItems: readonly SummaryItemSpec[];
  readonly knownLimitations: readonly LimitationSpec[];
}

export interface CompilerInputs {
  readonly compilerVersion: string;
  readonly languageRegistry: CanonicalLanguageRegistry;
  readonly policy: CompilerPolicy;
  readonly configuration: RecipeConfiguration;
  readonly recipe: ModalityRecipe;
  readonly homeProfile: LanguageProfile;
  readonly targetProfile: LanguageProfile;
  readonly pairPack: PairPack | null;
  readonly promptSurface: PromptSurface;
}

export interface ResolvedConditionContext {
  readonly supportTier: SupportTier;
  readonly pairPack: "present" | "absent";
}
