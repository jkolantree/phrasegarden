import type {
  CanonicalLanguageId,
  LanguageProfileRef,
  LanguageRegistryRef,
} from "./language-identity";

export const REVIEW_ROLES = [
  "qualified-speaker",
  "community-reviewer",
  "maintainer",
] as const;
export type ReviewRole = (typeof REVIEW_ROLES)[number];

export type Sha256Hex = string;
export type CalendarDate = string;

export interface ImmutableEvidenceRef {
  readonly repoPath: string;
  readonly sha256: Sha256Hex;
  readonly byteLength: number;
  readonly stableId?: string;
}

export interface ContentAddressedArtifactRef {
  readonly id: string;
  readonly version: string;
  readonly artifact: ImmutableEvidenceRef;
}

export interface LanguageProfileCandidateRef
  extends ContentAddressedArtifactRef {
  readonly kind: "language-profile";
  readonly id: CanonicalLanguageId;
}

export interface PairPackCandidateRef
  extends ContentAddressedArtifactRef {
  readonly kind: "pair-pack";
}

export type CandidateArtifactRef =
  | LanguageProfileCandidateRef
  | PairPackCandidateRef;

export interface PublishedSuiteRef {
  readonly id: string;
  readonly version: string;
  readonly definition: ImmutableEvidenceRef;
}

export type CheckerArtifactRef = ContentAddressedArtifactRef;
export type ContributionRef = ContentAddressedArtifactRef;

export type ReviewScope =
  | { readonly kind: "profile"; readonly profile: LanguageProfileRef }
  | {
      readonly kind: "direction";
      readonly home: LanguageProfileRef;
      readonly target: LanguageProfileRef;
    };

export interface ReviewRecord {
  readonly id: string;
  readonly publicReviewerId: string;
  readonly declaredRole: ReviewRole;
  readonly scope: ReviewScope;
  readonly candidate: CandidateArtifactRef;
  readonly suite: PublishedSuiteRef;
  readonly reviewedOn: CalendarDate;
  readonly outcome: "pass";
  readonly evidence: ImmutableEvidenceRef;
}

export interface ReviewBundleIdentity {
  readonly id: string;
  readonly version: string;
}

export interface ReviewEvidenceBundleRef
  extends ReviewBundleIdentity {
  readonly artifact: ImmutableEvidenceRef;
}

export interface BundleRecordRef {
  readonly bundle: ReviewBundleIdentity;
  readonly recordId: string;
}

export interface DeterministicSuitePass {
  readonly candidate: PairPackCandidateRef;
  readonly suite: PublishedSuiteRef;
  readonly checker: CheckerArtifactRef;
  readonly passedOn: CalendarDate;
  readonly outcome: "pass";
  readonly evidence: ImmutableEvidenceRef;
}

export type DirectionEvidenceClass =
  | {
      readonly kind: "community-evidence";
      readonly contribution: ContributionRef;
      readonly communityReviewRefs: readonly BundleRecordRef[];
    }
  | {
      readonly kind: "reviewed-evidence";
      readonly qualifiedSpeakerReviewRefs: readonly BundleRecordRef[];
    }
  | {
      readonly kind: "flagship-evidence";
      readonly qualifiedSpeakerReviewRefs: readonly BundleRecordRef[];
      readonly deterministicSuitePass: DeterministicSuitePass;
    };

interface ReviewBundleCommon {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly version: string;
  readonly languageRegistry: LanguageRegistryRef;
  readonly suite: PublishedSuiteRef;
  readonly records: readonly ReviewRecord[];
}

export interface ProfileReviewBundle
  extends ReviewBundleCommon {
  readonly kind: "profile-review";
  readonly profile: LanguageProfileRef;
  readonly candidate: LanguageProfileCandidateRef;
}

export interface DirectionReviewBundle
  extends ReviewBundleCommon {
  readonly kind: "direction-review";
  readonly direction: {
    readonly home: LanguageProfileRef;
    readonly target: LanguageProfileRef;
  };
  readonly candidate: PairPackCandidateRef;
  readonly evidenceClass: DirectionEvidenceClass;
}

export type ReviewEvidenceBundle =
  | ProfileReviewBundle
  | DirectionReviewBundle;

export interface StructuralEvidenceAssurance {
  readonly metadata: "structurally-valid";
  readonly evidenceBytes: "not-qualified";
  readonly externalArtifactExistence: "not-qualified";
  readonly evidenceTruthfulness: "not-qualified";
  readonly suitePublication: "not-qualified";
  readonly reviewerQualification: "not-qualified";
  readonly humanReviewOccurrence: "not-qualified";
  readonly linguisticCorrectness: "not-qualified";
  readonly supportTier: "not-assigned";
}

export interface StructurallyValidatedReviewEvidence {
  readonly bundle: ReviewEvidenceBundle;
  readonly assurance: StructuralEvidenceAssurance;
}
