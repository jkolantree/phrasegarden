import type { RecipeConfiguration } from "./configuration";

export const FAILURE_CLASSES = [
  "compiler",
  "recipe",
  "language-profile",
  "pair-pack",
  "model-behavior",
  "interface",
  "accessibility",
  "unsupported-capability",
] as const;
export type FailureClass = (typeof FAILURE_CLASSES)[number];

export const FIXTURE_TURN_ROLES = [
  "source",
  "learner",
  "coach",
  "control",
  "host-event",
] as const;
export type FixtureTurnRole = (typeof FIXTURE_TURN_ROLES)[number];

export const FIXTURE_EVIDENCE_TYPES = [
  "text",
  "transcript",
  "audible-audio",
  "host-signal",
] as const;
export type FixtureEvidenceType = (typeof FIXTURE_EVIDENCE_TYPES)[number];

export const FIXTURE_HOST_EVENTS = [
  "interrupt",
  "silence",
  "repeat",
  "slower",
] as const;
export type FixtureHostEvent = (typeof FIXTURE_HOST_EVENTS)[number];

export const COVERAGE_OWNERS = [
  "construction",
  "validator",
  "prompt",
  "ui",
  "semantic-evaluation",
  "host-qualification",
] as const;
export type CoverageOwner = (typeof COVERAGE_OWNERS)[number];

export interface AcceptanceFixtureDefinition {
  readonly id: string;
  readonly revision: number;
  readonly family: string;
  readonly applicableSupport: "preview-en-ja";
  readonly configuration: RecipeConfiguration;
  readonly providedContext: readonly {
    readonly id: string;
    readonly language: string;
    readonly exactText: string;
    readonly appliesToTurnIndexes: readonly number[];
  }[];
  readonly turns: readonly {
    readonly index: number;
    readonly role: FixtureTurnRole;
    readonly language: string | "none";
    readonly evidence: FixtureEvidenceType;
    readonly exactText?: string;
    readonly event?: FixtureHostEvent;
    readonly annotations?: readonly {
      readonly kind: "intentional-code-switch";
      readonly startUtf8Byte: number;
      readonly endUtf8ByteExclusive: number;
      readonly language: string;
      readonly preservation: "verbatim";
    }[];
  }[];
  readonly mustPreserve: readonly string[];
  readonly mustNot: readonly string[];
  readonly expectedWarningCodes: readonly string[];
  readonly coverage: readonly {
    readonly requirement: string;
    readonly expectedOwners: readonly CoverageOwner[];
  }[];
}

export const FIXTURE_STATES = [
  "untouched holdout",
  "prospective evaluation",
  "exposed",
  "development",
  "regression",
  "transport qualification",
  "contaminated",
  "unknown provenance",
] as const;
export type FixtureState = (typeof FIXTURE_STATES)[number];

export interface FixtureLedgerEvent {
  readonly fixture: {
    readonly id: string;
    readonly revision: number;
    readonly definitionSha256: string;
  };
  readonly sequence: number;
  readonly at: string;
  readonly actor: string;
  readonly from: FixtureState | "unregistered";
  readonly to: FixtureState;
  readonly reason: string;
  readonly influence: readonly string[];
  readonly prospectiveEligible: boolean;
  readonly eligibilityEvidence: readonly string[];
}

export interface FixtureRunEvidence {
  readonly fixture: {
    readonly id: string;
    readonly revision: number;
    readonly definitionSha256: string;
  };
  readonly freezeManifestSha256: string;
  readonly result: "pass" | "fail" | "invalid";
  readonly failureClassification?: FailureClass;
  readonly rawEvidencePaths: readonly string[];
}
