import type {
  DirectionReviewBundle,
  ImmutableEvidenceRef,
  LanguageProfileCandidateRef,
  PairPackCandidateRef,
  ProfileReviewBundle,
  PublishedSuiteRef,
  ReviewRecord,
} from "../../src/domain";
import { CANONICAL_LANGUAGE_REGISTRY_REF } from "../../src/packs";

export const REVIEW_EVIDENCE_FIXTURE_PROVENANCE = Object.freeze({
  state: "development" as const,
  purpose: "synthetic structural validation only",
  evidenceBytes: "not-qualified" as const,
  humanReviewOccurrence: "not-claimed" as const,
});

const PROFILE_VERSION = "0.0.0-synthetic-development";
const BUNDLE_VERSION = "0.0.0-synthetic-development";

export const syntheticHomeProfile = {
  id: "en",
  version: PROFILE_VERSION,
} as const;

export const syntheticTargetProfile = {
  id: "ja",
  version: PROFILE_VERSION,
} as const;

export function syntheticEvidence(
  repoPath: string,
  hashCharacter: string,
  byteLength: number,
  stableId?: string,
): ImmutableEvidenceRef {
  const base = {
    repoPath,
    sha256: hashCharacter.repeat(64),
    byteLength,
  };
  return stableId === undefined ? base : { ...base, stableId };
}

export const syntheticPublishedSuite: PublishedSuiteRef = {
  id: "synthetic-development-published-suite",
  version: "0.0.0-synthetic-development",
  definition: syntheticEvidence(
    "synthetic-development/suites/published-suite.json",
    "A",
    1200,
    "synthetic-development-suite-definition",
  ),
};

export const syntheticPairCandidate: PairPackCandidateRef = {
  kind: "pair-pack",
  id: "synthetic-development-en-ja-pair",
  version: "0.0.0-synthetic-development",
  artifact: syntheticEvidence(
    "synthetic-development/candidates/en-ja-pair.json",
    "B",
    2400,
    "synthetic-development-pair-candidate",
  ),
};

export const syntheticProfileCandidate: LanguageProfileCandidateRef = {
  kind: "language-profile",
  id: "ja",
  version: PROFILE_VERSION,
  artifact: syntheticEvidence(
    "synthetic-development/candidates/ja-profile.json",
    "C",
    1600,
    "synthetic-development-profile-candidate",
  ),
};

function directionRecord(
  id: string,
  declaredRole: ReviewRecord["declaredRole"],
  hashCharacter: string,
): ReviewRecord {
  return {
    id,
    publicReviewerId: "synthetic-development-reviewer-not-a-person",
    declaredRole,
    scope: {
      kind: "direction",
      home: syntheticHomeProfile,
      target: syntheticTargetProfile,
    },
    candidate: syntheticPairCandidate,
    suite: syntheticPublishedSuite,
    reviewedOn: "2024-02-29",
    outcome: "pass",
    evidence: syntheticEvidence(
      `synthetic-development/reviews/${id}.json`,
      hashCharacter,
      900,
      `synthetic-development-${id}`,
    ),
  };
}

const syntheticCommunityRecord = directionRecord(
  "synthetic-community-review",
  "community-reviewer",
  "D",
);

const syntheticQualifiedSpeakerRecord = directionRecord(
  "synthetic-qualified-speaker-review",
  "qualified-speaker",
  "E",
);

export const validCommunityReviewBundle: DirectionReviewBundle = {
  schemaVersion: 1,
  kind: "direction-review",
  id: "synthetic-development-community-bundle",
  version: BUNDLE_VERSION,
  languageRegistry: CANONICAL_LANGUAGE_REGISTRY_REF,
  suite: syntheticPublishedSuite,
  records: [syntheticCommunityRecord],
  direction: {
    home: syntheticHomeProfile,
    target: syntheticTargetProfile,
  },
  candidate: syntheticPairCandidate,
  evidenceClass: {
    kind: "community-evidence",
    contribution: {
      id: "synthetic-development-contribution",
      version: "0.0.0-synthetic-development",
      artifact: syntheticEvidence(
        "synthetic-development/contributions/contribution.json",
        "F",
        800,
        "synthetic-development-contribution",
      ),
    },
    communityReviewRefs: [
      {
        bundle: {
          id: "synthetic-development-community-bundle",
          version: BUNDLE_VERSION,
        },
        recordId: syntheticCommunityRecord.id,
      },
    ],
  },
};

export const validReviewedReviewBundle: DirectionReviewBundle = {
  schemaVersion: 1,
  kind: "direction-review",
  id: "synthetic-development-reviewed-bundle",
  version: BUNDLE_VERSION,
  languageRegistry: CANONICAL_LANGUAGE_REGISTRY_REF,
  suite: syntheticPublishedSuite,
  records: [syntheticQualifiedSpeakerRecord],
  direction: {
    home: syntheticHomeProfile,
    target: syntheticTargetProfile,
  },
  candidate: syntheticPairCandidate,
  evidenceClass: {
    kind: "reviewed-evidence",
    qualifiedSpeakerReviewRefs: [
      {
        bundle: {
          id: "synthetic-development-reviewed-bundle",
          version: BUNDLE_VERSION,
        },
        recordId: syntheticQualifiedSpeakerRecord.id,
      },
    ],
  },
};

export const validFlagshipReviewBundle: DirectionReviewBundle = {
  ...validReviewedReviewBundle,
  id: "synthetic-development-flagship-bundle",
  evidenceClass: {
    kind: "flagship-evidence",
    qualifiedSpeakerReviewRefs: [
      {
        bundle: {
          id: "synthetic-development-flagship-bundle",
          version: BUNDLE_VERSION,
        },
        recordId: syntheticQualifiedSpeakerRecord.id,
      },
    ],
    deterministicSuitePass: {
      candidate: syntheticPairCandidate,
      suite: syntheticPublishedSuite,
      checker: {
        id: "synthetic-development-suite-checker",
        version: "0.0.0-synthetic-development",
        artifact: syntheticEvidence(
          "synthetic-development/checkers/suite-checker.js",
          "1",
          3200,
          "synthetic-development-suite-checker",
        ),
      },
      passedOn: "2024-02-29",
      outcome: "pass",
      evidence: syntheticEvidence(
        "synthetic-development/suite-passes/current-candidate.json",
        "2",
        1100,
        "synthetic-development-suite-pass",
      ),
    },
  },
};

const syntheticProfileRecord: ReviewRecord = {
  id: "synthetic-profile-review",
  publicReviewerId: "synthetic-development-reviewer-not-a-person",
  declaredRole: "qualified-speaker",
  scope: { kind: "profile", profile: syntheticTargetProfile },
  candidate: syntheticProfileCandidate,
  suite: syntheticPublishedSuite,
  reviewedOn: "2024-02-29",
  outcome: "pass",
  evidence: syntheticEvidence(
    "synthetic-development/reviews/profile-review.json",
    "3",
    700,
    "synthetic-development-profile-review",
  ),
};

export const validProfileReviewBundle: ProfileReviewBundle = {
  schemaVersion: 1,
  kind: "profile-review",
  id: "synthetic-development-profile-bundle",
  version: BUNDLE_VERSION,
  languageRegistry: CANONICAL_LANGUAGE_REGISTRY_REF,
  suite: syntheticPublishedSuite,
  records: [syntheticProfileRecord],
  profile: syntheticTargetProfile,
  candidate: syntheticProfileCandidate,
};
