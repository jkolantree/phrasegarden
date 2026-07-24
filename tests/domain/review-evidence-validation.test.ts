import { describe, expect, it } from "vitest";

import {
  compareValidationIssues,
  validateImmutableEvidenceRef,
  validateReviewEvidenceBundle,
  type ValidationIssue,
} from "../../src/domain";
import { canonicalLanguageRegistry } from "../../src/packs";
import { jsonClone } from "../fixtures/configurations";
import {
  REVIEW_EVIDENCE_FIXTURE_PROVENANCE,
  syntheticEvidence,
  validCommunityReviewBundle,
  validFlagshipReviewBundle,
  validProfileReviewBundle,
  validReviewedReviewBundle,
} from "../fixtures/review-evidence";

type PathPart = string | number;

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("test fixture path does not address a record");
  }
  return value as Record<string, unknown>;
}

function array(value: unknown): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error("test fixture path does not address an array");
  }
  return value;
}

function valueAt(input: unknown, path: readonly PathPart[]): unknown {
  let value = input;
  for (const part of path) {
    value =
      typeof part === "number"
        ? array(value)[part]
        : record(value)[part];
  }
  return value;
}

function setAt(
  input: unknown,
  path: readonly PathPart[],
  value: unknown,
): void {
  const parent = valueAt(input, path.slice(0, -1));
  const key = path.at(-1);
  if (typeof key === "number") {
    array(parent)[key] = value;
  } else if (typeof key === "string") {
    record(parent)[key] = value;
  } else {
    throw new Error("test fixture path is empty");
  }
}

function deleteAt(input: unknown, path: readonly PathPart[]): void {
  const parent = valueAt(input, path.slice(0, -1));
  const key = path.at(-1);
  if (typeof key !== "string") {
    throw new Error("test deletion path must end in a field");
  }
  delete record(parent)[key];
}

function issueKeys(issues: readonly ValidationIssue[]): string[] {
  return issues.map(
    (item) => `${item.stage}|${item.code}|${item.path}`,
  );
}

function bundleIssues(input: unknown): readonly ValidationIssue[] {
  const result = validateReviewEvidenceBundle(
    input,
    canonicalLanguageRegistry,
  );
  expect(result.ok).toBe(false);
  return result.ok ? [] : result.issues;
}

function evidenceIssues(input: unknown): readonly ValidationIssue[] {
  const result = validateImmutableEvidenceRef(input);
  expect(result.ok).toBe(false);
  return result.ok ? [] : result.issues;
}

function expectBundleCode(input: unknown, code: string): void {
  expect(bundleIssues(input).map((item) => item.code)).toContain(code);
}

function recursivelyDetached(
  source: unknown,
  reconstructed: unknown,
): boolean {
  if (
    typeof source !== "object" ||
    source === null ||
    typeof reconstructed !== "object" ||
    reconstructed === null
  ) {
    return true;
  }
  if (source === reconstructed) {
    return false;
  }
  if (Array.isArray(source) !== Array.isArray(reconstructed)) {
    return false;
  }
  return Object.keys(source).every((key) =>
    recursivelyDetached(
      (source as Record<string, unknown>)[key],
      (reconstructed as Record<string, unknown>)[key],
    ),
  );
}

function reviewedBundleWithTwoRecords(): unknown {
  const input = jsonClone(validReviewedReviewBundle);
  const secondRecord = jsonClone(valueAt(input, ["records", 0]));
  setAt(
    secondRecord,
    ["id"],
    "synthetic-qualified-speaker-review-z",
  );
  setAt(
    secondRecord,
    ["evidence", "repoPath"],
    "synthetic-development/reviews/qualified-speaker-z.json",
  );
  setAt(secondRecord, ["evidence", "sha256"], "4".repeat(64));
  setAt(
    secondRecord,
    ["evidence", "stableId"],
    "synthetic-development-qualified-speaker-review-z",
  );
  array(valueAt(input, ["records"])).push(secondRecord);

  const secondRef = jsonClone(
    valueAt(input, [
      "evidenceClass",
      "qualifiedSpeakerReviewRefs",
      0,
    ]),
  );
  setAt(
    secondRef,
    ["recordId"],
    "synthetic-qualified-speaker-review-z",
  );
  array(
    valueAt(input, [
      "evidenceClass",
      "qualifiedSpeakerReviewRefs",
    ]),
  ).push(secondRef);
  return input;
}

describe("development-only fixture boundary", () => {
  it("labels all structural examples as development and disclaims evidence bytes", () => {
    expect(REVIEW_EVIDENCE_FIXTURE_PROVENANCE).toEqual({
      state: "development",
      purpose: "synthetic structural validation only",
      evidenceBytes: "not-qualified",
      humanReviewOccurrence: "not-claimed",
    });
  });
});

describe("immutable evidence references", () => {
  it("reconstructs a canonical content address without qualifying its bytes", () => {
    const input = syntheticEvidence(
      "synthetic-development/evidence/item.json",
      "A",
      0,
      "synthetic-development-item",
    );
    const result = validateImmutableEvidenceRef(input);
    expect(result).toEqual({ ok: true, value: input });
    if (result.ok) {
      expect(result.value).not.toBe(input);
    }
  });

  it.each([
    ["C:/mutable/file.json", "E-EVIDENCE-PATH-ABSOLUTE"],
    ["/absolute/file.json", "E-EVIDENCE-PATH-ABSOLUTE"],
    ["https://example.test/file.json", "E-EVIDENCE-PATH-URL"],
    ["folder\\file.json", "E-EVIDENCE-PATH-BACKSLASH"],
    ["folder/../file.json", "E-EVIDENCE-PATH-TRAVERSAL"],
    ["folder/./file.json", "E-EVIDENCE-PATH-DOT-SEGMENT"],
    ["folder//file.json", "E-EVIDENCE-PATH-EMPTY-SEGMENT"],
    ["folder/file.json/", "E-EVIDENCE-PATH-EMPTY-SEGMENT"],
    ["folder/file.json?mutable=1", "E-EVIDENCE-PATH-URL-MATERIAL"],
    ["folder/file.json#latest", "E-EVIDENCE-PATH-URL-MATERIAL"],
    ["folder/not canonical.json", "E-EVIDENCE-PATH-NONCANONICAL-SEGMENT"],
  ] as const)("rejects noncanonical path %s as %s", (repoPath, code) => {
    const input = syntheticEvidence(repoPath, "A", 1);
    expect(evidenceIssues(input).map((item) => item.code)).toContain(code);
  });

  it("rejects empty and control-bearing paths", () => {
    expect(
      evidenceIssues(syntheticEvidence("", "A", 1)).map(
        (item) => item.code,
      ),
    ).toContain("E-EMPTY-STRING");
    for (const repoPath of [
      "folder/\u0000file.json",
      "folder/file\n.json",
      "folder/file\t.json",
    ]) {
      expect(
        evidenceIssues(syntheticEvidence(repoPath, "A", 1)).map(
          (item) => item.code,
        ),
      ).toContain("E-EVIDENCE-PATH-CONTROL");
    }
  });

  it.each([
    ["a".repeat(64), 1, "E-SHA256-FORMAT"],
    ["A".repeat(63), 1, "E-SHA256-FORMAT"],
    ["G".repeat(64), 1, "E-SHA256-FORMAT"],
    ["A".repeat(64), -1, "E-BYTE-LENGTH"],
    ["A".repeat(64), -0, "E-BYTE-LENGTH"],
    ["A".repeat(64), 1.5, "E-BYTE-LENGTH"],
    ["A".repeat(64), Number.MAX_SAFE_INTEGER + 1, "E-BYTE-LENGTH"],
  ] as const)("rejects malformed hash/length metadata", (sha256, byteLength, code) => {
    expect(
      evidenceIssues({
        repoPath: "synthetic-development/evidence/item.json",
        sha256,
        byteLength,
      }).map((item) => item.code),
    ).toContain(code);
  });

  it("fails closed on unsupported fields", () => {
    expect(
      issueKeys(
        evidenceIssues({
          ...syntheticEvidence(
            "synthetic-development/evidence/item.json",
            "A",
            1,
          ),
          mutableUrl: "https://example.test/latest",
        }),
      ),
    ).toEqual([
      "input-shape|E-UNKNOWN-FIELD|$.mutableUrl",
    ]);
  });
});

describe("closed structural qualification variants", () => {
  it.each([
    ["Community", validCommunityReviewBundle],
    ["Reviewed", validReviewedReviewBundle],
    ["Flagship", validFlagshipReviewBundle],
    ["profile", validProfileReviewBundle],
  ] as const)("accepts the synthetic %s structure without assigning a tier", (_label, fixture) => {
    const input = jsonClone(fixture);
    const result = validateReviewEvidenceBundle(
      input,
      canonicalLanguageRegistry,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.bundle).toEqual(fixture);
      expect(result.value.bundle).not.toBe(input);
      expect(recursivelyDetached(input, result.value.bundle)).toBe(true);
      expect(result.value.bundle.languageRegistry).not.toBe(
        valueAt(input, ["languageRegistry"]),
      );
      expect(result.value.bundle.suite).not.toBe(
        valueAt(input, ["suite"]),
      );
      expect(result.value.bundle.suite.definition).not.toBe(
        valueAt(input, ["suite", "definition"]),
      );
      expect(result.value.bundle.records).not.toBe(
        valueAt(input, ["records"]),
      );
      expect(result.value.bundle.records[0]).not.toBe(
        valueAt(input, ["records", 0]),
      );
      expect(result.value.bundle.records[0]?.candidate).not.toBe(
        valueAt(input, ["records", 0, "candidate"]),
      );
      expect(result.value.bundle.records[0]?.evidence).not.toBe(
        valueAt(input, ["records", 0, "evidence"]),
      );
      if (result.value.bundle.kind === "direction-review") {
        expect(result.value.bundle.direction).not.toBe(
          valueAt(input, ["direction"]),
        );
        expect(result.value.bundle.candidate).not.toBe(
          valueAt(input, ["candidate"]),
        );
        expect(result.value.bundle.evidenceClass).not.toBe(
          valueAt(input, ["evidenceClass"]),
        );
        const refs =
          result.value.bundle.evidenceClass.kind === "community-evidence"
            ? result.value.bundle.evidenceClass.communityReviewRefs
            : result.value.bundle.evidenceClass.qualifiedSpeakerReviewRefs;
        const inputRefs =
          result.value.bundle.evidenceClass.kind === "community-evidence"
            ? valueAt(input, ["evidenceClass", "communityReviewRefs"])
            : valueAt(input, [
                "evidenceClass",
                "qualifiedSpeakerReviewRefs",
              ]);
        expect(refs).not.toBe(inputRefs);
        expect(refs[0]).not.toBe(array(inputRefs)[0]);
      }
      expect(result.value.assurance).toEqual({
        metadata: "structurally-valid",
        evidenceBytes: "not-qualified",
        externalArtifactExistence: "not-qualified",
        evidenceTruthfulness: "not-qualified",
        suitePublication: "not-qualified",
        reviewerQualification: "not-qualified",
        humanReviewOccurrence: "not-qualified",
        linguisticCorrectness: "not-qualified",
        supportTier: "not-assigned",
      });
    }
  });

  it("accepts any real calendar day without consulting ambient recency", () => {
    const input = jsonClone(validReviewedReviewBundle);
    setAt(input, ["records", 0, "reviewedOn"], "9999-12-31");
    expect(
      validateReviewEvidenceBundle(input, canonicalLanguageRegistry).ok,
    ).toBe(true);
  });

  it.each([
    ["root", "reviewClaim"],
    ["records.0", "reviewClaim"],
    ["candidate", "reviewClaim"],
    ["records.0.scope", "profile"],
    ["evidenceClass", "communityReviewRefs"],
  ] as const)("closes keys for %s discriminated data", (location, extraField) => {
    const input = jsonClone(validReviewedReviewBundle);
    const path: PathPart[] =
      location === "root"
        ? []
        : location.split(".").map((part) =>
            /^[0-9]+$/u.test(part) ? Number(part) : part,
          );
    record(valueAt(input, path))[extraField] = "unsupported";
    expectBundleCode(input, "E-UNKNOWN-FIELD");
  });

  it.each([
    [
      validCommunityReviewBundle,
      "deterministicSuitePass",
    ],
    [
      validReviewedReviewBundle,
      "contribution",
    ],
    [
      validFlagshipReviewBundle,
      "communityReviewRefs",
    ],
  ] as const)("closes every direction evidence-class variant", (fixture, extraField) => {
    const input = jsonClone(fixture);
    record(valueAt(input, ["evidenceClass"]))[extraField] = {};
    expectBundleCode(input, "E-UNKNOWN-FIELD");
  });

  it("closes the profile-scope variant", () => {
    const input = jsonClone(validProfileReviewBundle);
    record(valueAt(input, ["records", 0, "scope"])).home = {
      id: "en",
      version: "0.0.0-synthetic-development",
    };
    expectBundleCode(input, "E-UNKNOWN-FIELD");
  });

  it("keeps profile evidence separate from direction evidence and support tiers", () => {
    const evidenceClass = jsonClone(
      validReviewedReviewBundle.evidenceClass,
    );
    const withDirectionEvidence = {
      ...jsonClone(validProfileReviewBundle),
      evidenceClass,
    };
    expectBundleCode(withDirectionEvidence, "E-UNKNOWN-FIELD");

    const withTier = {
      ...jsonClone(validProfileReviewBundle),
      supportTier: "reviewed",
    };
    expectBundleCode(withTier, "E-UNKNOWN-FIELD");
  });
});

describe("exact candidate, suite, scope, and registry bindings", () => {
  it("rejects a review record bound to another candidate version", () => {
    const input = jsonClone(validReviewedReviewBundle);
    setAt(
      input,
      ["records", 0, "candidate", "version"],
      "0.0.1-another-candidate",
    );
    expectBundleCode(input, "E-REVIEW-CANDIDATE-MISMATCH");
  });

  it.each([
    [["records", 0, "candidate", "id"], "synthetic-development-other-pair"],
    [
      ["records", 0, "candidate", "artifact", "repoPath"],
      "synthetic-development/candidates/other-pair.json",
    ],
    [["records", 0, "candidate", "artifact", "sha256"], "9".repeat(64)],
    [["records", 0, "candidate", "artifact", "byteLength"], 2401],
    [
      ["records", 0, "candidate", "artifact", "stableId"],
      "synthetic-development-other-pair-candidate",
    ],
  ] as const)("rejects every exact candidate identity component mismatch", (path, value) => {
    const input = jsonClone(validReviewedReviewBundle);
    setAt(input, path, value);
    expectBundleCode(input, "E-REVIEW-CANDIDATE-MISMATCH");
  });

  it.each([
    [["records", 0, "suite", "id"], "synthetic-development-other-suite"],
    [["records", 0, "suite", "version"], "0.0.1-another-suite"],
    [
      ["records", 0, "suite", "definition", "repoPath"],
      "synthetic-development/suites/other-suite.json",
    ],
    [["records", 0, "suite", "definition", "sha256"], "8".repeat(64)],
    [["records", 0, "suite", "definition", "byteLength"], 1201],
    [
      ["records", 0, "suite", "definition", "stableId"],
      "synthetic-development-other-suite-definition",
    ],
  ] as const)("rejects a published-suite identity mismatch", (path, value) => {
    const input = jsonClone(validReviewedReviewBundle);
    setAt(input, path, value);
    expectBundleCode(input, "E-REVIEW-SUITE-MISMATCH");
  });

  it("rejects direction reversal without treating the pair as unordered", () => {
    const input = jsonClone(validReviewedReviewBundle);
    const home = jsonClone(
      valueAt(input, ["records", 0, "scope", "home"]),
    );
    const target = jsonClone(
      valueAt(input, ["records", 0, "scope", "target"]),
    );
    setAt(input, ["records", 0, "scope", "home"], target);
    setAt(input, ["records", 0, "scope", "target"], home);
    expectBundleCode(input, "E-REVIEW-DIRECTION-REVERSED");
  });

  it("rejects a single direction endpoint-version mismatch", () => {
    const input = jsonClone(validReviewedReviewBundle);
    setAt(
      input,
      ["records", 0, "scope", "home", "version"],
      "0.0.1-other-home-profile",
    );
    expectBundleCode(input, "E-REVIEW-SCOPE-MISMATCH");
  });

  it.each([
    [
      validProfileReviewBundle,
      ["records", 0, "scope"] as const,
      {
        kind: "direction",
        home: { id: "en", version: "0.0.0-synthetic-development" },
        target: { id: "ja", version: "0.0.0-synthetic-development" },
      },
    ],
    [
      validReviewedReviewBundle,
      ["records", 0, "scope"] as const,
      {
        kind: "profile",
        profile: { id: "ja", version: "0.0.0-synthetic-development" },
      },
    ],
  ] as const)("rejects profile-versus-direction scope confusion", (fixture, path, scope) => {
    const input = jsonClone(fixture);
    setAt(input, path, scope);
    expectBundleCode(input, "E-REVIEW-SCOPE-MISMATCH");
  });

  it("rejects registry version and hash mismatches", () => {
    const wrongVersion = jsonClone(validReviewedReviewBundle);
    setAt(
      wrongVersion,
      ["languageRegistry", "version"],
      "2025-01-01.1",
    );
    expectBundleCode(wrongVersion, "E-LANGUAGE-REGISTRY-VERSION");

    const wrongHash = jsonClone(validReviewedReviewBundle);
    setAt(
      wrongHash,
      ["languageRegistry", "contentSha256"],
      "0".repeat(64),
    );
    expectBundleCode(wrongHash, "E-LANGUAGE-REGISTRY-HASH");
  });

  it("rejects profile candidate and bundle-profile version confusion", () => {
    const input = jsonClone(validProfileReviewBundle);
    setAt(input, ["candidate", "version"], "0.0.1-other-profile");
    setAt(
      input,
      ["records", 0, "candidate", "version"],
      "0.0.1-other-profile",
    );
    expectBundleCode(input, "E-PROFILE-CANDIDATE-MISMATCH");
  });

  it("isolates profile record candidate and scope bindings", () => {
    const candidateMismatch = jsonClone(validProfileReviewBundle);
    setAt(
      candidateMismatch,
      ["records", 0, "candidate", "version"],
      "0.0.1-other-profile-candidate",
    );
    expectBundleCode(candidateMismatch, "E-REVIEW-CANDIDATE-MISMATCH");

    const scopeMismatch = jsonClone(validProfileReviewBundle);
    setAt(
      scopeMismatch,
      ["records", 0, "scope", "profile", "version"],
      "0.0.1-other-profile-scope",
    );
    expectBundleCode(scopeMismatch, "E-REVIEW-SCOPE-MISMATCH");
  });

  it("rejects profile and pair candidate kinds at the opposite bundle boundary", () => {
    const profileInput = jsonClone(validProfileReviewBundle);
    setAt(profileInput, ["candidate", "kind"], "pair-pack");
    expectBundleCode(profileInput, "E-EXPECTED-PROFILE-CANDIDATE");

    const directionInput = jsonClone(validReviewedReviewBundle);
    setAt(directionInput, ["candidate", "kind"], "language-profile");
    setAt(directionInput, ["candidate", "id"], "ja");
    expectBundleCode(directionInput, "E-EXPECTED-PAIR-CANDIDATE");
  });
});

describe("bundle-local review record identity", () => {
  it("allows the same local record ID in two different exact bundle identities", () => {
    const first = jsonClone(validReviewedReviewBundle);
    const second = jsonClone(validReviewedReviewBundle);
    setAt(second, ["id"], "synthetic-development-reviewed-bundle-copy");
    setAt(
      second,
      [
        "evidenceClass",
        "qualifiedSpeakerReviewRefs",
        0,
        "bundle",
        "id",
      ],
      "synthetic-development-reviewed-bundle-copy",
    );
    expect(
      validateReviewEvidenceBundle(first, canonicalLanguageRegistry).ok,
    ).toBe(true);
    expect(
      validateReviewEvidenceBundle(second, canonicalLanguageRegistry).ok,
    ).toBe(true);
  });

  it("accepts two distinct, sorted, exactly covered record references", () => {
    expect(
      validateReviewEvidenceBundle(
        reviewedBundleWithTwoRecords(),
        canonicalLanguageRegistry,
      ).ok,
    ).toBe(true);
  });

  it("rejects an empty qualification reference set", () => {
    const input = jsonClone(validReviewedReviewBundle);
    setAt(
      input,
      ["evidenceClass", "qualifiedSpeakerReviewRefs"],
      [],
    );
    expectBundleCode(input, "E-EMPTY-RECORD-REFS");
  });

  it("rejects distinct record references in reverse code-unit order", () => {
    const input = reviewedBundleWithTwoRecords();
    const refs = array(
      valueAt(input, [
        "evidenceClass",
        "qualifiedSpeakerReviewRefs",
      ]),
    );
    refs.reverse();
    expectBundleCode(input, "E-UNSORTED-RECORD-REFS");
  });

  it("rejects duplicate record IDs within one bundle", () => {
    const input = jsonClone(validReviewedReviewBundle);
    const duplicate = jsonClone(valueAt(input, ["records", 0]));
    array(valueAt(input, ["records"])).push(duplicate);
    expectBundleCode(input, "E-DUPLICATE-RECORD-ID");
  });

  it("rejects record references carrying another bundle identity", () => {
    const input = jsonClone(validReviewedReviewBundle);
    setAt(
      input,
      [
        "evidenceClass",
        "qualifiedSpeakerReviewRefs",
        0,
        "bundle",
        "id",
      ],
      "synthetic-development-other-bundle",
    );
    expectBundleCode(input, "E-CROSS-BUNDLE-RECORD-REF");
  });

  it("rejects a record reference carrying another bundle version", () => {
    const input = jsonClone(validReviewedReviewBundle);
    setAt(
      input,
      [
        "evidenceClass",
        "qualifiedSpeakerReviewRefs",
        0,
        "bundle",
        "version",
      ],
      "0.0.1-other-bundle",
    );
    expectBundleCode(input, "E-CROSS-BUNDLE-RECORD-REF");
  });

  it("rejects a missing referenced record and preserves the unreferenced negative", () => {
    const input = jsonClone(validReviewedReviewBundle);
    setAt(
      input,
      [
        "evidenceClass",
        "qualifiedSpeakerReviewRefs",
        0,
        "recordId",
      ],
      "synthetic-missing-record",
    );
    const codes = bundleIssues(input).map((item) => item.code);
    expect(codes).toContain("E-MISSING-REVIEW-RECORD");
    expect(codes).toContain("E-UNREFERENCED-REVIEW-RECORD");
  });

  it("rejects duplicate and noncanonical record-reference order", () => {
    const input = jsonClone(validReviewedReviewBundle);
    const ref = jsonClone(
      valueAt(input, [
        "evidenceClass",
        "qualifiedSpeakerReviewRefs",
        0,
      ]),
    );
    array(
      valueAt(input, [
        "evidenceClass",
        "qualifiedSpeakerReviewRefs",
      ]),
    ).push(ref);
    const codes = bundleIssues(input).map((item) => item.code);
    expect(codes).toContain("E-DUPLICATE-RECORD-REF");
    expect(codes).toContain("E-UNSORTED-RECORD-REFS");
  });

  it("rejects structurally valid records that the evidence class does not reference", () => {
    const input = jsonClone(validReviewedReviewBundle);
    const second = jsonClone(valueAt(input, ["records", 0]));
    setAt(second, ["id"], "synthetic-unreferenced-review");
    setAt(
      second,
      ["evidence", "repoPath"],
      "synthetic-development/reviews/unreferenced.json",
    );
    setAt(second, ["evidence", "sha256"], "7".repeat(64));
    array(valueAt(input, ["records"])).push(second);
    expectBundleCode(input, "E-UNREFERENCED-REVIEW-RECORD");
  });
});

describe("Community, Reviewed, and Flagship structural boundaries", () => {
  it("rejects the wrong reviewer role for the selected evidence class", () => {
    const input = jsonClone(validReviewedReviewBundle);
    setAt(
      input,
      ["records", 0, "declaredRole"],
      "community-reviewer",
    );
    expectBundleCode(input, "E-REVIEW-ROLE-MISMATCH");
  });

  it("requires an explicit supported role and a passing review outcome", () => {
    const invalidRole = jsonClone(validReviewedReviewBundle);
    setAt(invalidRole, ["records", 0, "declaredRole"], "expert");
    expectBundleCode(invalidRole, "E-INVALID-ENUM");

    const failedReview = jsonClone(validReviewedReviewBundle);
    setAt(failedReview, ["records", 0, "outcome"], "fail");
    expectBundleCode(failedReview, "E-INVALID-LITERAL");
  });

  it.each([
    [validCommunityReviewBundle, "qualified-speaker"],
    [validCommunityReviewBundle, "maintainer"],
    [validFlagshipReviewBundle, "community-reviewer"],
    [validFlagshipReviewBundle, "maintainer"],
  ] as const)("enforces the selected direction evidence-class role", (fixture, role) => {
    const input = jsonClone(fixture);
    setAt(input, ["records", 0, "declaredRole"], role);
    expectBundleCode(input, "E-REVIEW-ROLE-MISMATCH");
  });

  it.each([
    "qualified-speaker",
    "community-reviewer",
    "maintainer",
  ] as const)("accepts declared profile-review role %s without qualifying it", (role) => {
    const input = jsonClone(validProfileReviewBundle);
    setAt(input, ["records", 0, "declaredRole"], role);
    const result = validateReviewEvidenceBundle(
      input,
      canonicalLanguageRegistry,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.assurance.reviewerQualification).toBe(
        "not-qualified",
      );
    }
  });

  it("does not promote Community evidence by relabeling its variant", () => {
    const input = jsonClone(validCommunityReviewBundle);
    const refs = jsonClone(
      valueAt(input, ["evidenceClass", "communityReviewRefs"]),
    );
    setAt(input, ["evidenceClass", "kind"], "reviewed-evidence");
    deleteAt(input, ["evidenceClass", "contribution"]);
    deleteAt(input, ["evidenceClass", "communityReviewRefs"]);
    setAt(input, ["evidenceClass", "qualifiedSpeakerReviewRefs"], refs);
    expectBundleCode(input, "E-REVIEW-ROLE-MISMATCH");
  });

  it("does not promote Reviewed evidence to Flagship without a suite pass", () => {
    const input = jsonClone(validReviewedReviewBundle);
    setAt(input, ["evidenceClass", "kind"], "flagship-evidence");
    expect(issueKeys(bundleIssues(input))).toContain(
      "input-shape|E-MISSING-FIELD|$.evidenceClass.deterministicSuitePass",
    );
  });

  it("rejects a Flagship suite pass bound to an older candidate", () => {
    const input = jsonClone(validFlagshipReviewBundle);
    setAt(
      input,
      [
        "evidenceClass",
        "deterministicSuitePass",
        "candidate",
        "version",
      ],
      "0.0.0-stale-candidate",
    );
    expectBundleCode(input, "E-SUITE-PASS-CANDIDATE-MISMATCH");
  });

  it("rejects a Flagship suite pass bound to another suite definition", () => {
    const input = jsonClone(validFlagshipReviewBundle);
    setAt(
      input,
      [
        "evidenceClass",
        "deterministicSuitePass",
        "suite",
        "definition",
        "sha256",
      ],
      "6".repeat(64),
    );
    expectBundleCode(input, "E-SUITE-PASS-SUITE-MISMATCH");
  });

  it("requires a content-addressed checker identity and passing outcome", () => {
    const malformedChecker = jsonClone(validFlagshipReviewBundle);
    setAt(
      malformedChecker,
      [
        "evidenceClass",
        "deterministicSuitePass",
        "checker",
        "artifact",
        "sha256",
      ],
      "lowercase".repeat(8),
    );
    expectBundleCode(malformedChecker, "E-SHA256-FORMAT");

    const failedOutcome = jsonClone(validFlagshipReviewBundle);
    setAt(
      failedOutcome,
      ["evidenceClass", "deterministicSuitePass", "outcome"],
      "fail",
    );
    expectBundleCode(failedOutcome, "E-INVALID-LITERAL");
  });

  it("validates the deterministic suite-pass date independently", () => {
    const input = jsonClone(validFlagshipReviewBundle);
    setAt(
      input,
      ["evidenceClass", "deterministicSuitePass", "passedOn"],
      "2023-02-29",
    );
    expectBundleCode(input, "E-CALENDAR-DATE");
  });
});

describe("clock-free calendar and deterministic execution", () => {
  it.each([
    ["2023-02-29", "non-leap day"],
    ["1900-02-29", "century non-leap day"],
    ["2024-02-30", "day overflow"],
    ["2024-04-31", "short-month overflow"],
    ["2024-13-01", "month overflow"],
    ["0000-01-01", "year zero"],
    ["24-02-29", "noncanonical year"],
  ] as const)("rejects %s as an invalid %s", (reviewedOn, _description) => {
    const input = jsonClone(validReviewedReviewBundle);
    setAt(input, ["records", 0, "reviewedOn"], reviewedOn);
    expectBundleCode(input, "E-CALENDAR-DATE");
  });

  it("accepts Gregorian century leap days", () => {
    const input = jsonClone(validReviewedReviewBundle);
    setAt(input, ["records", 0, "reviewedOn"], "2000-02-29");
    expect(
      validateReviewEvidenceBundle(input, canonicalLanguageRegistry).ok,
    ).toBe(true);
  });

  it("returns byte-identical results with hostile clock, Intl, locale, and zone", () => {
    const input = jsonClone(validFlagshipReviewBundle);
    const expected = JSON.stringify(
      validateReviewEvidenceBundle(input, canonicalLanguageRegistry),
    );
    const originalDate = globalThis.Date;
    const originalIntl = globalThis.Intl;
    const originalLang = process.env.LANG;
    const originalTz = process.env.TZ;
    Object.defineProperty(globalThis, "Date", {
      configurable: true,
      value: new Proxy(originalDate, {
        construct() {
          throw new Error("ambient clock must not be read");
        },
        apply() {
          throw new Error("ambient clock must not be read");
        },
      }),
    });
    Object.defineProperty(globalThis, "Intl", {
      configurable: true,
      value: new Proxy(originalIntl, {
        get() {
          throw new Error("ambient Intl must not be read");
        },
      }),
    });
    process.env.LANG = "tr_TR.UTF-8";
    process.env.TZ = "Pacific/Kiritimati";
    try {
      const actual = JSON.stringify(
        validateReviewEvidenceBundle(input, canonicalLanguageRegistry),
      );
      expect(actual).toBe(expected);
    } finally {
      Object.defineProperty(globalThis, "Date", {
        configurable: true,
        value: originalDate,
      });
      Object.defineProperty(globalThis, "Intl", {
        configurable: true,
        value: originalIntl,
      });
      if (originalLang === undefined) {
        delete process.env.LANG;
      } else {
        process.env.LANG = originalLang;
      }
      if (originalTz === undefined) {
        delete process.env.TZ;
      } else {
        process.env.TZ = originalTz;
      }
    }
  });

  it("emits stable stage/code/path ordering", () => {
    const input = jsonClone(validReviewedReviewBundle);
    setAt(input, ["records", 0, "reviewedOn"], "2023-02-29");
    setAt(
      input,
      ["records", 0, "evidence", "sha256"],
      "a".repeat(64),
    );
    record(input).unsupported = true;
    const first = validateReviewEvidenceBundle(
      input,
      canonicalLanguageRegistry,
    );
    const second = validateReviewEvidenceBundle(
      input,
      canonicalLanguageRegistry,
    );
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    if (!first.ok) {
      expect(first.issues).toEqual(
        [...first.issues].sort(compareValidationIssues),
      );
    }
  });
});

describe("hostile input and fresh reconstruction", () => {
  it("never invokes root or nested accessors", () => {
    const rootAccessor = jsonClone(validReviewedReviewBundle);
    let rootCalls = 0;
    Object.defineProperty(rootAccessor, "id", {
      enumerable: true,
      get() {
        rootCalls += 1;
        throw new Error("root accessor must not run");
      },
    });
    expectBundleCode(rootAccessor, "E-ACCESSOR-FIELD");
    expect(rootCalls).toBe(0);

    const nestedAccessor = jsonClone(validReviewedReviewBundle);
    const nestedCandidate = record(
      valueAt(nestedAccessor, ["records", 0, "candidate"]),
    );
    let nestedCalls = 0;
    Object.defineProperty(nestedCandidate, "version", {
      enumerable: true,
      get() {
        nestedCalls += 1;
        throw new Error("nested accessor must not run");
      },
    });
    expectBundleCode(nestedAccessor, "E-ACCESSOR-FIELD");
    expect(nestedCalls).toBe(0);
  });

  it("fails a revoked proxy without throwing", () => {
    const revocable = Proxy.revocable({}, {});
    revocable.revoke();
    expect(() =>
      validateReviewEvidenceBundle(
        revocable.proxy,
        canonicalLanguageRegistry,
      ),
    ).not.toThrow();
    expectBundleCode(revocable.proxy, "E-UNSAFE-OBJECT");
  });

  it("rejects sparse records and sparse or decorated reference arrays", () => {
    const sparseRecords = jsonClone(validReviewedReviewBundle);
    setAt(sparseRecords, ["records"], new Array(1));
    expectBundleCode(sparseRecords, "E-SPARSE-ARRAY");

    const sparseRefs = jsonClone(validReviewedReviewBundle);
    setAt(
      sparseRefs,
      ["evidenceClass", "qualifiedSpeakerReviewRefs"],
      new Array(1),
    );
    expectBundleCode(sparseRefs, "E-SPARSE-ARRAY");

    const decoratedRefs = jsonClone(validReviewedReviewBundle);
    const refs = array(
      valueAt(decoratedRefs, [
        "evidenceClass",
        "qualifiedSpeakerReviewRefs",
      ]),
    );
    Object.defineProperty(refs, "extra", {
      enumerable: true,
      value: "unsupported",
    });
    expectBundleCode(decoratedRefs, "E-UNKNOWN-FIELD");
  });
});

describe("structural assurance boundary", () => {
  it("accepts nonexistent-looking evidence metadata while explicitly withholding byte proof", () => {
    const input = jsonClone(validProfileReviewBundle);
    setAt(
      input,
      ["records", 0, "evidence", "repoPath"],
      "synthetic-development/not-byte-qualified/absent.json",
    );
    const result = validateReviewEvidenceBundle(
      input,
      canonicalLanguageRegistry,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.assurance.evidenceBytes).toBe("not-qualified");
      expect(result.value.assurance.externalArtifactExistence).toBe(
        "not-qualified",
      );
      expect(result.value.assurance.evidenceTruthfulness).toBe(
        "not-qualified",
      );
      expect(result.value.assurance.suitePublication).toBe(
        "not-qualified",
      );
      expect(result.value.assurance.humanReviewOccurrence).toBe(
        "not-qualified",
      );
      expect(result.value.assurance.linguisticCorrectness).toBe(
        "not-qualified",
      );
      expect(result.value.assurance.supportTier).toBe("not-assigned");
    }
  });
});
