import type { RecipeConfiguration } from "./configuration";
import type { SupportTier } from "./authored";
import type {
  LanguageProfileRef,
  LanguageRegistryRef,
} from "./language-identity";

export const VALIDATION_STAGES = [
  "input-shape",
  "configuration",
  "artifact-identity",
  "authored-data",
  "pair-resolution",
  "selection",
  "rendering",
  "budget",
] as const;
export type ValidationStage = (typeof VALIDATION_STAGES)[number];

export const VALIDATION_STAGE_ORDINAL: Readonly<
  Record<ValidationStage, number>
> = {
  "input-shape": 1,
  configuration: 2,
  "artifact-identity": 3,
  "authored-data": 4,
  "pair-resolution": 5,
  selection: 6,
  rendering: 7,
  budget: 8,
};

export interface ValidationIssue {
  readonly stage: ValidationStage;
  readonly code: string;
  readonly path: string;
  readonly values?: Readonly<Record<string, string | number | boolean>>;
}

export type ValidationResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly issues: readonly ValidationIssue[] };

export const COMPILER_WARNING_CODES = [
  "W-GENERIC-LIMITED",
  "W-PREVIEW-EXTERNAL-REVIEW",
  "W-USER-EVIDENCE-UNKNOWN",
  "W-ASSISTANT-OUTPUT-UNKNOWN",
  "W-INTERRUPTION-UNKNOWN",
  "W-INTERRUPTION-UNAVAILABLE",
  "W-SILENCE-UNKNOWN",
  "W-SILENCE-UNAVAILABLE",
  "W-PLAYBACK-RATE-UNKNOWN",
  "W-PLAYBACK-RATE-UNAVAILABLE",
  "W-PRONUNCIATION-TRANSCRIPT",
  "W-PROMPT-BUDGET",
] as const;
export type CompilerWarningCode = (typeof COMPILER_WARNING_CODES)[number];

export interface CompilerWarning {
  readonly code: CompilerWarningCode;
  readonly severity: "notice" | "warning";
  readonly values: Readonly<Record<string, string | number | boolean>>;
}

export interface ArtifactProvenance {
  readonly compilerVersion: string;
  readonly compilerPolicyVersion: string;
  readonly schemaVersion: 1;
  readonly languageRegistry: LanguageRegistryRef;
  readonly recipe: {
    readonly id: string;
    readonly version: string;
  };
  readonly homeProfile: LanguageProfileRef;
  readonly targetProfile: LanguageProfileRef;
  readonly pairPack:
    | { readonly id: string; readonly version: string }
    | "none";
  readonly supportTier: SupportTier;
  readonly supportDirection: string;
  readonly supportReviewStatus:
    | "external-review-not-completed"
    | "not-applicable"
    | "qualified";
  readonly supportReviewDate: string | "not-applicable";
  readonly promptSurface: {
    readonly id: string;
    readonly locale: string;
    readonly version: string;
  };
}

export interface CompileResult {
  readonly canonicalPrompt: string;
  readonly summaryItems: readonly {
    readonly id: string;
    readonly values: Readonly<Record<string, string>>;
  }[];
  readonly warnings: readonly CompilerWarning[];
  readonly limitationCodes: readonly string[];
  readonly normalizedConfiguration: RecipeConfiguration;
  readonly provenance: ArtifactProvenance;
}

export interface RenderedSummary {
  readonly text: string;
  readonly items: readonly {
    readonly id: string;
    readonly text: string;
  }[];
  readonly catalog: {
    readonly locale: string;
    readonly version: string;
  };
}
