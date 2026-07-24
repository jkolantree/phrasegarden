import {
  sameLanguageRegistryRef,
  type CanonicalLanguageRegistry,
  type LanguageProfileRef,
  validateCanonicalLanguageId,
  validateLanguageProfileRef,
  validateLanguageRegistryRef,
} from "./language-identity";
import { collectNestedValidation } from "./nested-validation";
import {
  compareCodeUnits,
  compareValidationIssues,
} from "./primitives";
import type {
  ValidationIssue,
  ValidationResult,
  ValidationStage,
} from "./results";
import {
  REVIEW_ROLES,
  type BundleRecordRef,
  type CandidateArtifactRef,
  type ContentAddressedArtifactRef,
  type DeterministicSuitePass,
  type DirectionEvidenceClass,
  type DirectionReviewBundle,
  type ImmutableEvidenceRef,
  type LanguageProfileCandidateRef,
  type PairPackCandidateRef,
  type ProfileReviewBundle,
  type PublishedSuiteRef,
  type ReviewBundleIdentity,
  type ReviewEvidenceBundle,
  type ReviewRecord,
  type ReviewRole,
  type ReviewScope,
  type StructurallyValidatedReviewEvidence,
} from "./review-evidence";
import {
  addValidationIssue as issue,
  childPath,
  dataValue,
  indexPath,
  inspectArray,
  inspectRecord,
  type InspectedRecord,
} from "./validation-input";

const SHA256 = /^[0-9A-F]{64}$/u;
const REPOSITORY_SEGMENT = /^[A-Za-z0-9._-]+$/u;
const DRIVE_ABSOLUTE = /^[A-Za-z]:/u;
const URL_SCHEME = /^[A-Za-z][A-Za-z0-9+.-]*:/u;
const CONTROL_CHARACTER = /[\u0000-\u001f\u007f]/u;
const CALENDAR_DAY = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/u;

const EVIDENCE_KEYS = [
  "repoPath",
  "sha256",
  "byteLength",
  "stableId",
] as const;
const ARTIFACT_KEYS = ["id", "version", "artifact"] as const;
const CANDIDATE_KEYS = ["kind", ...ARTIFACT_KEYS] as const;
const SUITE_KEYS = ["id", "version", "definition"] as const;
const PROFILE_SCOPE_KEYS = ["kind", "profile"] as const;
const DIRECTION_SCOPE_KEYS = ["kind", "home", "target"] as const;
const SCOPE_KEYS = [
  ...PROFILE_SCOPE_KEYS,
  ...DIRECTION_SCOPE_KEYS,
] as const;
const REVIEW_RECORD_KEYS = [
  "id",
  "publicReviewerId",
  "declaredRole",
  "scope",
  "candidate",
  "suite",
  "reviewedOn",
  "outcome",
  "evidence",
] as const;
const BUNDLE_IDENTITY_KEYS = ["id", "version"] as const;
const RECORD_REF_KEYS = ["bundle", "recordId"] as const;
const SUITE_PASS_KEYS = [
  "candidate",
  "suite",
  "checker",
  "passedOn",
  "outcome",
  "evidence",
] as const;
const COMMUNITY_EVIDENCE_KEYS = [
  "kind",
  "contribution",
  "communityReviewRefs",
] as const;
const REVIEWED_EVIDENCE_KEYS = [
  "kind",
  "qualifiedSpeakerReviewRefs",
] as const;
const FLAGSHIP_EVIDENCE_KEYS = [
  "kind",
  "qualifiedSpeakerReviewRefs",
  "deterministicSuitePass",
] as const;
const EVIDENCE_CLASS_KEYS = [
  ...COMMUNITY_EVIDENCE_KEYS,
  ...REVIEWED_EVIDENCE_KEYS,
  ...FLAGSHIP_EVIDENCE_KEYS,
] as const;
const BUNDLE_COMMON_KEYS = [
  "schemaVersion",
  "kind",
  "id",
  "version",
  "languageRegistry",
  "suite",
  "records",
] as const;
const PROFILE_BUNDLE_KEYS = [
  ...BUNDLE_COMMON_KEYS,
  "profile",
  "candidate",
] as const;
const DIRECTION_BUNDLE_KEYS = [
  ...BUNDLE_COMMON_KEYS,
  "direction",
  "candidate",
  "evidenceClass",
] as const;
const REVIEW_BUNDLE_KEYS = [
  ...PROFILE_BUNDLE_KEYS,
  ...DIRECTION_BUNDLE_KEYS,
] as const;
const DIRECTION_KEYS = ["home", "target"] as const;

interface ParsedArray<T> {
  readonly values: readonly (T | undefined)[];
}

function failure(issues: ValidationIssue[]): ValidationResult<never> {
  return { ok: false, issues: [...issues].sort(compareValidationIssues) };
}

function stringField(
  record: InspectedRecord | undefined,
  key: string,
  path: string,
  issues: ValidationIssue[],
  emptyStage: ValidationStage = "artifact-identity",
): string | undefined {
  if (record === undefined || !record.values.has(key)) {
    return undefined;
  }
  const value = dataValue(record, key);
  if (typeof value !== "string") {
    issue(issues, "input-shape", "E-EXPECTED-STRING", childPath(path, key));
    return undefined;
  }
  if (value.length === 0) {
    issue(issues, emptyStage, "E-EMPTY-STRING", childPath(path, key));
    return undefined;
  }
  return value;
}

function literalStringField<T extends string>(
  record: InspectedRecord | undefined,
  key: string,
  path: string,
  expected: T,
  issues: ValidationIssue[],
): T | undefined {
  const value = stringField(record, key, path, issues, "authored-data");
  if (value === undefined) {
    return undefined;
  }
  if (value !== expected) {
    issue(
      issues,
      "authored-data",
      "E-INVALID-LITERAL",
      childPath(path, key),
      { actual: value, expected },
    );
    return undefined;
  }
  return expected;
}

function enumField<T extends string>(
  record: InspectedRecord | undefined,
  key: string,
  path: string,
  allowed: readonly T[],
  issues: ValidationIssue[],
): T | undefined {
  const value = stringField(record, key, path, issues, "authored-data");
  if (value === undefined) {
    return undefined;
  }
  if (!(allowed as readonly string[]).includes(value)) {
    issue(
      issues,
      "authored-data",
      "E-INVALID-ENUM",
      childPath(path, key),
      { value },
    );
    return undefined;
  }
  return value as T;
}

function requireVariantFields(
  record: InspectedRecord,
  keys: readonly string[],
  path: string,
  issues: ValidationIssue[],
): void {
  for (const key of keys) {
    if (!record.present.has(key)) {
      issue(
        issues,
        "input-shape",
        "E-MISSING-FIELD",
        childPath(path, key),
      );
    }
  }
}

function rejectVariantFields(
  record: InspectedRecord,
  allowed: readonly string[],
  variantUnion: readonly string[],
  path: string,
  issues: ValidationIssue[],
): void {
  const allowedSet = new Set(allowed);
  const unionSet = new Set(variantUnion);
  for (const key of record.present) {
    if (unionSet.has(key) && !allowedSet.has(key)) {
      issue(
        issues,
        "input-shape",
        "E-UNKNOWN-FIELD",
        childPath(path, key),
      );
    }
  }
}

function immutableEvidenceRef(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
): ImmutableEvidenceRef | undefined {
  const start = issues.length;
  const record = inspectRecord(
    input,
    path,
    EVIDENCE_KEYS,
    ["repoPath", "sha256", "byteLength"],
    issues,
  );
  if (record === undefined) {
    return undefined;
  }

  const repoPath = stringField(record, "repoPath", path, issues);
  if (repoPath !== undefined) {
    const pathField = childPath(path, "repoPath");
    if (
      repoPath.startsWith("/") ||
      DRIVE_ABSOLUTE.test(repoPath) ||
      repoPath.startsWith("\\")
    ) {
      issue(
        issues,
        "artifact-identity",
        "E-EVIDENCE-PATH-ABSOLUTE",
        pathField,
      );
    }
    if (URL_SCHEME.test(repoPath) && !DRIVE_ABSOLUTE.test(repoPath)) {
      issue(
        issues,
        "artifact-identity",
        "E-EVIDENCE-PATH-URL",
        pathField,
      );
    }
    if (repoPath.includes("\\")) {
      issue(
        issues,
        "artifact-identity",
        "E-EVIDENCE-PATH-BACKSLASH",
        pathField,
      );
    }
    if (repoPath.includes("?") || repoPath.includes("#")) {
      issue(
        issues,
        "artifact-identity",
        "E-EVIDENCE-PATH-URL-MATERIAL",
        pathField,
      );
    }
    if (CONTROL_CHARACTER.test(repoPath)) {
      issue(
        issues,
        "artifact-identity",
        "E-EVIDENCE-PATH-CONTROL",
        pathField,
      );
    }

    const segments = repoPath.split("/");
    if (segments.some((segment) => segment.length === 0)) {
      issue(
        issues,
        "artifact-identity",
        "E-EVIDENCE-PATH-EMPTY-SEGMENT",
        pathField,
      );
    }
    if (segments.includes("..")) {
      issue(
        issues,
        "artifact-identity",
        "E-EVIDENCE-PATH-TRAVERSAL",
        pathField,
      );
    }
    if (segments.includes(".")) {
      issue(
        issues,
        "artifact-identity",
        "E-EVIDENCE-PATH-DOT-SEGMENT",
        pathField,
      );
    }
    if (
      segments.some(
        (segment) =>
          segment.length > 0 &&
          segment !== "." &&
          segment !== ".." &&
          !REPOSITORY_SEGMENT.test(segment),
      )
    ) {
      issue(
        issues,
        "artifact-identity",
        "E-EVIDENCE-PATH-NONCANONICAL-SEGMENT",
        pathField,
      );
    }
  }

  const sha256 = stringField(record, "sha256", path, issues);
  if (sha256 !== undefined && !SHA256.test(sha256)) {
    issue(
      issues,
      "artifact-identity",
      "E-SHA256-FORMAT",
      childPath(path, "sha256"),
    );
  }

  const byteLengthInput = dataValue(record, "byteLength");
  let byteLength: number | undefined;
  if (record.values.has("byteLength")) {
    if (
      typeof byteLengthInput !== "number" ||
      !Number.isSafeInteger(byteLengthInput) ||
      byteLengthInput < 0 ||
      Object.is(byteLengthInput, -0)
    ) {
      issue(
        issues,
        "artifact-identity",
        "E-BYTE-LENGTH",
        childPath(path, "byteLength"),
      );
    } else {
      byteLength = byteLengthInput;
    }
  }

  const stableId = record.present.has("stableId")
    ? stringField(record, "stableId", path, issues)
    : undefined;

  if (
    issues.length !== start ||
    repoPath === undefined ||
    sha256 === undefined ||
    byteLength === undefined
  ) {
    return undefined;
  }
  return stableId === undefined
    ? { repoPath, sha256, byteLength }
    : { repoPath, sha256, byteLength, stableId };
}

export function validateImmutableEvidenceRef(
  input: unknown,
): ValidationResult<ImmutableEvidenceRef> {
  const issues: ValidationIssue[] = [];
  const value = immutableEvidenceRef(input, "$", issues);
  return value === undefined ? failure(issues) : { ok: true, value };
}

function contentAddressedArtifact(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
): ContentAddressedArtifactRef | undefined {
  const start = issues.length;
  const record = inspectRecord(
    input,
    path,
    ARTIFACT_KEYS,
    ARTIFACT_KEYS,
    issues,
  );
  if (record === undefined) {
    return undefined;
  }
  const id = stringField(record, "id", path, issues);
  const version = stringField(record, "version", path, issues);
  const artifact = record.values.has("artifact")
    ? immutableEvidenceRef(
        dataValue(record, "artifact"),
        childPath(path, "artifact"),
        issues,
      )
    : undefined;
  return issues.length !== start ||
    id === undefined ||
    version === undefined ||
    artifact === undefined
    ? undefined
    : { id, version, artifact };
}

function candidateArtifact(
  input: unknown,
  path: string,
  registry: CanonicalLanguageRegistry,
  issues: ValidationIssue[],
): CandidateArtifactRef | undefined {
  const start = issues.length;
  const record = inspectRecord(
    input,
    path,
    CANDIDATE_KEYS,
    CANDIDATE_KEYS,
    issues,
  );
  if (record === undefined) {
    return undefined;
  }
  const kind = enumField(
    record,
    "kind",
    path,
    ["language-profile", "pair-pack"] as const,
    issues,
  );
  const rawId = dataValue(record, "id");
  let id: string | undefined;
  if (record.values.has("id")) {
    if (kind === "language-profile") {
      id = collectNestedValidation(
        validateCanonicalLanguageId(rawId, registry),
        childPath(path, "id"),
        issues,
      );
    } else {
      id = stringField(record, "id", path, issues);
    }
  }
  const version = stringField(record, "version", path, issues);
  const artifact = record.values.has("artifact")
    ? immutableEvidenceRef(
        dataValue(record, "artifact"),
        childPath(path, "artifact"),
        issues,
      )
    : undefined;
  if (
    issues.length !== start ||
    kind === undefined ||
    id === undefined ||
    version === undefined ||
    artifact === undefined
  ) {
    return undefined;
  }
  return kind === "language-profile"
    ? {
        kind,
        id,
        version,
        artifact,
      }
    : {
        kind,
        id,
        version,
        artifact,
      };
}

function publishedSuite(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
): PublishedSuiteRef | undefined {
  const start = issues.length;
  const record = inspectRecord(
    input,
    path,
    SUITE_KEYS,
    SUITE_KEYS,
    issues,
  );
  if (record === undefined) {
    return undefined;
  }
  const id = stringField(record, "id", path, issues);
  const version = stringField(record, "version", path, issues);
  const definition = record.values.has("definition")
    ? immutableEvidenceRef(
        dataValue(record, "definition"),
        childPath(path, "definition"),
        issues,
      )
    : undefined;
  return issues.length !== start ||
    id === undefined ||
    version === undefined ||
    definition === undefined
    ? undefined
    : { id, version, definition };
}

function profileRef(
  input: unknown,
  path: string,
  registry: CanonicalLanguageRegistry,
  issues: ValidationIssue[],
): LanguageProfileRef | undefined {
  return collectNestedValidation(
    validateLanguageProfileRef(input, registry),
    path,
    issues,
  );
}

function reviewScope(
  input: unknown,
  path: string,
  registry: CanonicalLanguageRegistry,
  issues: ValidationIssue[],
): ReviewScope | undefined {
  const start = issues.length;
  const record = inspectRecord(
    input,
    path,
    SCOPE_KEYS,
    ["kind"],
    issues,
  );
  if (record === undefined) {
    return undefined;
  }
  const kind = enumField(
    record,
    "kind",
    path,
    ["profile", "direction"] as const,
    issues,
  );
  if (kind === "profile") {
    requireVariantFields(record, ["profile"], path, issues);
    rejectVariantFields(
      record,
      PROFILE_SCOPE_KEYS,
      SCOPE_KEYS,
      path,
      issues,
    );
    const profile = record.values.has("profile")
      ? profileRef(
          dataValue(record, "profile"),
          childPath(path, "profile"),
          registry,
          issues,
        )
      : undefined;
    return issues.length !== start || profile === undefined
      ? undefined
      : { kind, profile };
  }
  if (kind === "direction") {
    requireVariantFields(record, ["home", "target"], path, issues);
    rejectVariantFields(
      record,
      DIRECTION_SCOPE_KEYS,
      SCOPE_KEYS,
      path,
      issues,
    );
    const home = record.values.has("home")
      ? profileRef(
          dataValue(record, "home"),
          childPath(path, "home"),
          registry,
          issues,
        )
      : undefined;
    const target = record.values.has("target")
      ? profileRef(
          dataValue(record, "target"),
          childPath(path, "target"),
          registry,
          issues,
        )
      : undefined;
    if (home !== undefined && target !== undefined && sameProfile(home, target)) {
      issue(
        issues,
        "authored-data",
        "E-DIRECTION-ENDPOINTS-IDENTICAL",
        path,
      );
    }
    return issues.length !== start ||
      home === undefined ||
      target === undefined
      ? undefined
      : { kind, home, target };
  }
  return undefined;
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    const leap =
      year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    return leap ? 29 : 28;
  }
  return month === 4 || month === 6 || month === 9 || month === 11
    ? 30
    : 31;
}

function calendarValue(
  record: InspectedRecord | undefined,
  key: string,
  path: string,
  issues: ValidationIssue[],
): string | undefined {
  const value = stringField(record, key, path, issues, "authored-data");
  if (value === undefined) {
    return undefined;
  }
  const match = CALENDAR_DAY.exec(value);
  let valid = match !== null;
  if (match !== null) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    valid =
      year >= 1 &&
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= daysInMonth(year, month);
  }
  if (!valid) {
    issue(
      issues,
      "authored-data",
      "E-CALENDAR-DATE",
      childPath(path, key),
      { value },
    );
    return undefined;
  }
  return value;
}

function reviewRecord(
  input: unknown,
  path: string,
  registry: CanonicalLanguageRegistry,
  issues: ValidationIssue[],
): ReviewRecord | undefined {
  const start = issues.length;
  const record = inspectRecord(
    input,
    path,
    REVIEW_RECORD_KEYS,
    REVIEW_RECORD_KEYS,
    issues,
  );
  if (record === undefined) {
    return undefined;
  }
  const id = stringField(record, "id", path, issues);
  const publicReviewerId = stringField(
    record,
    "publicReviewerId",
    path,
    issues,
  );
  const declaredRole = enumField(
    record,
    "declaredRole",
    path,
    REVIEW_ROLES,
    issues,
  );
  const scope = record.values.has("scope")
    ? reviewScope(
        dataValue(record, "scope"),
        childPath(path, "scope"),
        registry,
        issues,
      )
    : undefined;
  const candidate = record.values.has("candidate")
    ? candidateArtifact(
        dataValue(record, "candidate"),
        childPath(path, "candidate"),
        registry,
        issues,
      )
    : undefined;
  const suite = record.values.has("suite")
    ? publishedSuite(
        dataValue(record, "suite"),
        childPath(path, "suite"),
        issues,
      )
    : undefined;
  const reviewedOn = calendarValue(
    record,
    "reviewedOn",
    path,
    issues,
  );
  const outcome = literalStringField(
    record,
    "outcome",
    path,
    "pass",
    issues,
  );
  const evidence = record.values.has("evidence")
    ? immutableEvidenceRef(
        dataValue(record, "evidence"),
        childPath(path, "evidence"),
        issues,
      )
    : undefined;
  return issues.length !== start ||
    id === undefined ||
    publicReviewerId === undefined ||
    declaredRole === undefined ||
    scope === undefined ||
    candidate === undefined ||
    suite === undefined ||
    reviewedOn === undefined ||
    outcome === undefined ||
    evidence === undefined
    ? undefined
    : {
        id,
        publicReviewerId,
        declaredRole,
        scope,
        candidate,
        suite,
        reviewedOn,
        outcome,
        evidence,
      };
}

function reviewRecords(
  input: unknown,
  path: string,
  registry: CanonicalLanguageRegistry,
  issues: ValidationIssue[],
): ParsedArray<ReviewRecord> | undefined {
  const array = inspectArray(input, path, issues);
  if (array === undefined) {
    return undefined;
  }
  if (array.values.length === 0) {
    issue(
      issues,
      "authored-data",
      "E-EMPTY-REVIEW-RECORDS",
      path,
    );
  }
  const values = array.values.map((value, index) =>
    reviewRecord(value, indexPath(path, index), registry, issues),
  );
  const firstIndexById = new Map<string, number>();
  for (const [index, value] of values.entries()) {
    if (value === undefined) {
      continue;
    }
    const firstIndex = firstIndexById.get(value.id);
    if (firstIndex === undefined) {
      firstIndexById.set(value.id, index);
    } else {
      issue(
        issues,
        "authored-data",
        "E-DUPLICATE-RECORD-ID",
        childPath(indexPath(path, index), "id"),
        { firstIndex, recordId: value.id },
      );
    }
  }
  return { values };
}

function bundleIdentity(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
): ReviewBundleIdentity | undefined {
  const start = issues.length;
  const record = inspectRecord(
    input,
    path,
    BUNDLE_IDENTITY_KEYS,
    BUNDLE_IDENTITY_KEYS,
    issues,
  );
  if (record === undefined) {
    return undefined;
  }
  const id = stringField(record, "id", path, issues);
  const version = stringField(record, "version", path, issues);
  return issues.length !== start || id === undefined || version === undefined
    ? undefined
    : { id, version };
}

function recordReference(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
): BundleRecordRef | undefined {
  const start = issues.length;
  const record = inspectRecord(
    input,
    path,
    RECORD_REF_KEYS,
    RECORD_REF_KEYS,
    issues,
  );
  if (record === undefined) {
    return undefined;
  }
  const bundle = record.values.has("bundle")
    ? bundleIdentity(
        dataValue(record, "bundle"),
        childPath(path, "bundle"),
        issues,
      )
    : undefined;
  const recordId = stringField(record, "recordId", path, issues);
  return issues.length !== start ||
    bundle === undefined ||
    recordId === undefined
    ? undefined
    : { bundle, recordId };
}

function recordReferences(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
): ParsedArray<BundleRecordRef> | undefined {
  const array = inspectArray(input, path, issues);
  if (array === undefined) {
    return undefined;
  }
  if (array.values.length === 0) {
    issue(
      issues,
      "authored-data",
      "E-EMPTY-RECORD-REFS",
      path,
    );
  }
  const values = array.values.map((value, index) =>
    recordReference(value, indexPath(path, index), issues),
  );

  const firstIndexByIdentity = new Map<string, number>();
  let previousValue: BundleRecordRef | undefined;
  for (const [index, value] of values.entries()) {
    if (value === undefined) {
      continue;
    }
    const identity = JSON.stringify([
      value.bundle.id,
      value.bundle.version,
      value.recordId,
    ]);
    const firstIndex = firstIndexByIdentity.get(identity);
    if (firstIndex === undefined) {
      firstIndexByIdentity.set(identity, index);
    } else {
      issue(
        issues,
        "authored-data",
        "E-DUPLICATE-RECORD-REF",
        childPath(indexPath(path, index), "recordId"),
        { firstIndex, recordId: value.recordId },
      );
    }
    if (
      previousValue !== undefined &&
      (compareCodeUnits(previousValue.bundle.id, value.bundle.id) ||
        compareCodeUnits(
          previousValue.bundle.version,
          value.bundle.version,
        ) ||
        compareCodeUnits(previousValue.recordId, value.recordId)) >= 0
    ) {
      issue(
        issues,
        "authored-data",
        "E-UNSORTED-RECORD-REFS",
        indexPath(path, index),
      );
    }
    previousValue = value;
  }
  return { values };
}

function pairPackCandidate(
  input: unknown,
  path: string,
  registry: CanonicalLanguageRegistry,
  issues: ValidationIssue[],
): PairPackCandidateRef | undefined {
  const candidate = candidateArtifact(input, path, registry, issues);
  if (candidate === undefined) {
    return undefined;
  }
  if (candidate.kind !== "pair-pack") {
    issue(
      issues,
      "artifact-identity",
      "E-EXPECTED-PAIR-CANDIDATE",
      childPath(path, "kind"),
    );
    return undefined;
  }
  return candidate;
}

function suitePass(
  input: unknown,
  path: string,
  registry: CanonicalLanguageRegistry,
  issues: ValidationIssue[],
): DeterministicSuitePass | undefined {
  const start = issues.length;
  const record = inspectRecord(
    input,
    path,
    SUITE_PASS_KEYS,
    SUITE_PASS_KEYS,
    issues,
  );
  if (record === undefined) {
    return undefined;
  }
  const candidate = record.values.has("candidate")
    ? pairPackCandidate(
        dataValue(record, "candidate"),
        childPath(path, "candidate"),
        registry,
        issues,
      )
    : undefined;
  const suite = record.values.has("suite")
    ? publishedSuite(
        dataValue(record, "suite"),
        childPath(path, "suite"),
        issues,
      )
    : undefined;
  const checker = record.values.has("checker")
    ? contentAddressedArtifact(
        dataValue(record, "checker"),
        childPath(path, "checker"),
        issues,
      )
    : undefined;
  const passedOn = calendarValue(record, "passedOn", path, issues);
  const outcome = literalStringField(
    record,
    "outcome",
    path,
    "pass",
    issues,
  );
  const evidence = record.values.has("evidence")
    ? immutableEvidenceRef(
        dataValue(record, "evidence"),
        childPath(path, "evidence"),
        issues,
      )
    : undefined;
  return issues.length !== start ||
    candidate === undefined ||
    suite === undefined ||
    checker === undefined ||
    passedOn === undefined ||
    outcome === undefined ||
    evidence === undefined
    ? undefined
    : {
        candidate,
        suite,
        checker,
        passedOn,
        outcome,
        evidence,
      };
}

function directionEvidenceClass(
  input: unknown,
  path: string,
  registry: CanonicalLanguageRegistry,
  issues: ValidationIssue[],
): DirectionEvidenceClass | undefined {
  const start = issues.length;
  const record = inspectRecord(
    input,
    path,
    EVIDENCE_CLASS_KEYS,
    ["kind"],
    issues,
  );
  if (record === undefined) {
    return undefined;
  }
  const kind = enumField(
    record,
    "kind",
    path,
    [
      "community-evidence",
      "reviewed-evidence",
      "flagship-evidence",
    ] as const,
    issues,
  );
  if (kind === "community-evidence") {
    requireVariantFields(
      record,
      ["contribution", "communityReviewRefs"],
      path,
      issues,
    );
    rejectVariantFields(
      record,
      COMMUNITY_EVIDENCE_KEYS,
      EVIDENCE_CLASS_KEYS,
      path,
      issues,
    );
    const contribution = record.values.has("contribution")
      ? contentAddressedArtifact(
          dataValue(record, "contribution"),
          childPath(path, "contribution"),
          issues,
        )
      : undefined;
    const refs = record.values.has("communityReviewRefs")
      ? recordReferences(
          dataValue(record, "communityReviewRefs"),
          childPath(path, "communityReviewRefs"),
          issues,
        )
      : undefined;
    if (
      issues.length !== start ||
      contribution === undefined ||
      refs === undefined ||
      refs.values.some((value) => value === undefined)
    ) {
      return undefined;
    }
    return {
      kind,
      contribution,
      communityReviewRefs: refs.values as readonly BundleRecordRef[],
    };
  }
  if (kind === "reviewed-evidence") {
    requireVariantFields(
      record,
      ["qualifiedSpeakerReviewRefs"],
      path,
      issues,
    );
    rejectVariantFields(
      record,
      REVIEWED_EVIDENCE_KEYS,
      EVIDENCE_CLASS_KEYS,
      path,
      issues,
    );
    const refs = record.values.has("qualifiedSpeakerReviewRefs")
      ? recordReferences(
          dataValue(record, "qualifiedSpeakerReviewRefs"),
          childPath(path, "qualifiedSpeakerReviewRefs"),
          issues,
        )
      : undefined;
    if (
      issues.length !== start ||
      refs === undefined ||
      refs.values.some((value) => value === undefined)
    ) {
      return undefined;
    }
    return {
      kind,
      qualifiedSpeakerReviewRefs:
        refs.values as readonly BundleRecordRef[],
    };
  }
  if (kind === "flagship-evidence") {
    requireVariantFields(
      record,
      ["qualifiedSpeakerReviewRefs", "deterministicSuitePass"],
      path,
      issues,
    );
    rejectVariantFields(
      record,
      FLAGSHIP_EVIDENCE_KEYS,
      EVIDENCE_CLASS_KEYS,
      path,
      issues,
    );
    const refs = record.values.has("qualifiedSpeakerReviewRefs")
      ? recordReferences(
          dataValue(record, "qualifiedSpeakerReviewRefs"),
          childPath(path, "qualifiedSpeakerReviewRefs"),
          issues,
        )
      : undefined;
    const deterministicSuitePass = record.values.has(
      "deterministicSuitePass",
    )
      ? suitePass(
          dataValue(record, "deterministicSuitePass"),
          childPath(path, "deterministicSuitePass"),
          registry,
          issues,
        )
      : undefined;
    if (
      issues.length !== start ||
      refs === undefined ||
      refs.values.some((value) => value === undefined) ||
      deterministicSuitePass === undefined
    ) {
      return undefined;
    }
    return {
      kind,
      qualifiedSpeakerReviewRefs:
        refs.values as readonly BundleRecordRef[],
      deterministicSuitePass,
    };
  }
  return undefined;
}

function sameEvidence(
  left: ImmutableEvidenceRef,
  right: ImmutableEvidenceRef,
): boolean {
  return (
    left.repoPath === right.repoPath &&
    left.sha256 === right.sha256 &&
    left.byteLength === right.byteLength &&
    left.stableId === right.stableId
  );
}

function sameArtifact(
  left: ContentAddressedArtifactRef,
  right: ContentAddressedArtifactRef,
): boolean {
  return (
    left.id === right.id &&
    left.version === right.version &&
    sameEvidence(left.artifact, right.artifact)
  );
}

function sameCandidate(
  left: CandidateArtifactRef,
  right: CandidateArtifactRef,
): boolean {
  return left.kind === right.kind && sameArtifact(left, right);
}

function sameSuite(
  left: PublishedSuiteRef,
  right: PublishedSuiteRef,
): boolean {
  return (
    left.id === right.id &&
    left.version === right.version &&
    sameEvidence(left.definition, right.definition)
  );
}

function sameProfile(
  left: LanguageProfileRef,
  right: LanguageProfileRef,
): boolean {
  return left.id === right.id && left.version === right.version;
}

function sameScope(left: ReviewScope, right: ReviewScope): boolean {
  if (left.kind !== right.kind) {
    return false;
  }
  if (left.kind === "profile" && right.kind === "profile") {
    return sameProfile(left.profile, right.profile);
  }
  return (
    left.kind === "direction" &&
    right.kind === "direction" &&
    sameProfile(left.home, right.home) &&
    sameProfile(left.target, right.target)
  );
}

function directionScope(
  home: LanguageProfileRef,
  target: LanguageProfileRef,
): ReviewScope {
  return { kind: "direction", home, target };
}

function recordBindingIssues(
  records: readonly ReviewRecord[],
  expectedScope: ReviewScope,
  candidate: CandidateArtifactRef,
  suite: PublishedSuiteRef,
  issues: ValidationIssue[],
): void {
  for (const [index, record] of records.entries()) {
    const path = indexPath("$.records", index);
    if (!sameCandidate(record.candidate, candidate)) {
      issue(
        issues,
        "authored-data",
        "E-REVIEW-CANDIDATE-MISMATCH",
        childPath(path, "candidate"),
        { recordId: record.id },
      );
    }
    if (!sameSuite(record.suite, suite)) {
      issue(
        issues,
        "authored-data",
        "E-REVIEW-SUITE-MISMATCH",
        childPath(path, "suite"),
        { recordId: record.id },
      );
    }
    if (!sameScope(record.scope, expectedScope)) {
      const reversed =
        expectedScope.kind === "direction" &&
        record.scope.kind === "direction" &&
        sameProfile(record.scope.home, expectedScope.target) &&
        sameProfile(record.scope.target, expectedScope.home);
      issue(
        issues,
        "authored-data",
        reversed
          ? "E-REVIEW-DIRECTION-REVERSED"
          : "E-REVIEW-SCOPE-MISMATCH",
        childPath(path, "scope"),
        { recordId: record.id },
      );
    }
  }
}

function evidenceReferenceIssues(
  evidenceClass: DirectionEvidenceClass,
  identity: ReviewBundleIdentity,
  records: readonly ReviewRecord[],
  issues: ValidationIssue[],
): void {
  const expectedRole: ReviewRole =
    evidenceClass.kind === "community-evidence"
      ? "community-reviewer"
      : "qualified-speaker";
  const refs =
    evidenceClass.kind === "community-evidence"
      ? evidenceClass.communityReviewRefs
      : evidenceClass.qualifiedSpeakerReviewRefs;
  const refsPath =
    evidenceClass.kind === "community-evidence"
      ? "$.evidenceClass.communityReviewRefs"
      : "$.evidenceClass.qualifiedSpeakerReviewRefs";
  const recordsById = new Map(records.map((record) => [record.id, record]));
  const referenced = new Set<string>();

  for (const [index, ref] of refs.entries()) {
    const path = indexPath(refsPath, index);
    if (
      ref.bundle.id !== identity.id ||
      ref.bundle.version !== identity.version
    ) {
      issue(
        issues,
        "authored-data",
        "E-CROSS-BUNDLE-RECORD-REF",
        childPath(path, "bundle"),
        { recordId: ref.recordId },
      );
      continue;
    }
    const record = recordsById.get(ref.recordId);
    if (record === undefined) {
      issue(
        issues,
        "authored-data",
        "E-MISSING-REVIEW-RECORD",
        childPath(path, "recordId"),
        { recordId: ref.recordId },
      );
      continue;
    }
    referenced.add(record.id);
    if (record.declaredRole !== expectedRole) {
      issue(
        issues,
        "authored-data",
        "E-REVIEW-ROLE-MISMATCH",
        childPath(path, "recordId"),
        {
          actualRole: record.declaredRole,
          expectedRole,
          recordId: record.id,
        },
      );
    }
  }

  for (const [index, record] of records.entries()) {
    if (!referenced.has(record.id)) {
      issue(
        issues,
        "authored-data",
        "E-UNREFERENCED-REVIEW-RECORD",
        childPath(indexPath("$.records", index), "id"),
        { recordId: record.id },
      );
    }
  }
}

function suitePassBindingIssues(
  pass: DeterministicSuitePass,
  candidate: PairPackCandidateRef,
  suite: PublishedSuiteRef,
  issues: ValidationIssue[],
): void {
  if (!sameCandidate(pass.candidate, candidate)) {
    issue(
      issues,
      "authored-data",
      "E-SUITE-PASS-CANDIDATE-MISMATCH",
      "$.evidenceClass.deterministicSuitePass.candidate",
    );
  }
  if (!sameSuite(pass.suite, suite)) {
    issue(
      issues,
      "authored-data",
      "E-SUITE-PASS-SUITE-MISMATCH",
      "$.evidenceClass.deterministicSuitePass.suite",
    );
  }
}

function directionValue(
  input: unknown,
  path: string,
  registry: CanonicalLanguageRegistry,
  issues: ValidationIssue[],
): { readonly home: LanguageProfileRef; readonly target: LanguageProfileRef } | undefined {
  const start = issues.length;
  const record = inspectRecord(
    input,
    path,
    DIRECTION_KEYS,
    DIRECTION_KEYS,
    issues,
  );
  if (record === undefined) {
    return undefined;
  }
  const home = record.values.has("home")
    ? profileRef(
        dataValue(record, "home"),
        childPath(path, "home"),
        registry,
        issues,
      )
    : undefined;
  const target = record.values.has("target")
    ? profileRef(
        dataValue(record, "target"),
        childPath(path, "target"),
        registry,
        issues,
      )
    : undefined;
  if (home !== undefined && target !== undefined && sameProfile(home, target)) {
    issue(
      issues,
      "authored-data",
      "E-DIRECTION-ENDPOINTS-IDENTICAL",
      path,
    );
  }
  return issues.length !== start || home === undefined || target === undefined
    ? undefined
    : { home, target };
}

function schemaVersion(
  record: InspectedRecord,
  path: string,
  issues: ValidationIssue[],
): 1 | undefined {
  const value = dataValue(record, "schemaVersion");
  if (!record.values.has("schemaVersion")) {
    return undefined;
  }
  if (typeof value !== "number") {
    issue(
      issues,
      "input-shape",
      "E-EXPECTED-NUMBER",
      childPath(path, "schemaVersion"),
    );
    return undefined;
  }
  if (value !== 1) {
    issue(
      issues,
      "artifact-identity",
      "E-UNSUPPORTED-SCHEMA-VERSION",
      childPath(path, "schemaVersion"),
      { actual: value, expected: 1 },
    );
    return undefined;
  }
  return 1;
}

export function validateReviewEvidenceBundle(
  input: unknown,
  registry: CanonicalLanguageRegistry,
): ValidationResult<StructurallyValidatedReviewEvidence> {
  const issues: ValidationIssue[] = [];
  const root = inspectRecord(
    input,
    "$",
    REVIEW_BUNDLE_KEYS,
    BUNDLE_COMMON_KEYS,
    issues,
  );
  if (root === undefined) {
    return failure(issues);
  }

  const versionNumber = schemaVersion(root, "$", issues);
  const kind = enumField(
    root,
    "kind",
    "$",
    ["profile-review", "direction-review"] as const,
    issues,
  );
  const id = stringField(root, "id", "$", issues);
  const version = stringField(root, "version", "$", issues);
  const languageRegistry = root.values.has("languageRegistry")
    ? collectNestedValidation(
        validateLanguageRegistryRef(
          dataValue(root, "languageRegistry"),
          registry,
        ),
        "$.languageRegistry",
        issues,
      )
    : undefined;
  const suite = root.values.has("suite")
    ? publishedSuite(dataValue(root, "suite"), "$.suite", issues)
    : undefined;
  const parsedRecords = root.values.has("records")
    ? reviewRecords(
        dataValue(root, "records"),
        "$.records",
        registry,
        issues,
      )
    : undefined;
  const records = parsedRecords?.values.every(
    (value): value is ReviewRecord => value !== undefined,
  )
    ? parsedRecords.values
    : undefined;

  let bundle: ReviewEvidenceBundle | undefined;
  if (kind === "profile-review") {
    requireVariantFields(root, ["profile", "candidate"], "$", issues);
    rejectVariantFields(
      root,
      PROFILE_BUNDLE_KEYS,
      REVIEW_BUNDLE_KEYS,
      "$",
      issues,
    );
    const profile = root.values.has("profile")
      ? profileRef(
          dataValue(root, "profile"),
          "$.profile",
          registry,
          issues,
        )
      : undefined;
    const candidateValue = root.values.has("candidate")
      ? candidateArtifact(
          dataValue(root, "candidate"),
          "$.candidate",
          registry,
          issues,
        )
      : undefined;
    let candidate: LanguageProfileCandidateRef | undefined;
    if (candidateValue !== undefined) {
      if (candidateValue.kind !== "language-profile") {
        issue(
          issues,
          "artifact-identity",
          "E-EXPECTED-PROFILE-CANDIDATE",
          "$.candidate.kind",
        );
      } else {
        candidate = candidateValue;
      }
    }
    if (
      profile !== undefined &&
      candidate !== undefined &&
      (profile.id !== candidate.id || profile.version !== candidate.version)
    ) {
      issue(
        issues,
        "authored-data",
        "E-PROFILE-CANDIDATE-MISMATCH",
        "$.candidate",
      );
    }
    if (
      profile !== undefined &&
      candidate !== undefined &&
      records !== undefined &&
      suite !== undefined
    ) {
      recordBindingIssues(
        records,
        { kind: "profile", profile },
        candidate,
        suite,
        issues,
      );
    }
    if (
      issues.length === 0 &&
      versionNumber !== undefined &&
      id !== undefined &&
      version !== undefined &&
      languageRegistry !== undefined &&
      suite !== undefined &&
      records !== undefined &&
      profile !== undefined &&
      candidate !== undefined
    ) {
      bundle = {
        schemaVersion: versionNumber,
        kind,
        id,
        version,
        languageRegistry,
        suite,
        records,
        profile,
        candidate,
      } satisfies ProfileReviewBundle;
    }
  } else if (kind === "direction-review") {
    requireVariantFields(
      root,
      ["direction", "candidate", "evidenceClass"],
      "$",
      issues,
    );
    rejectVariantFields(
      root,
      DIRECTION_BUNDLE_KEYS,
      REVIEW_BUNDLE_KEYS,
      "$",
      issues,
    );
    const direction = root.values.has("direction")
      ? directionValue(
          dataValue(root, "direction"),
          "$.direction",
          registry,
          issues,
        )
      : undefined;
    const candidate = root.values.has("candidate")
      ? pairPackCandidate(
          dataValue(root, "candidate"),
          "$.candidate",
          registry,
          issues,
        )
      : undefined;
    const evidenceClass = root.values.has("evidenceClass")
      ? directionEvidenceClass(
          dataValue(root, "evidenceClass"),
          "$.evidenceClass",
          registry,
          issues,
        )
      : undefined;
    if (
      direction !== undefined &&
      candidate !== undefined &&
      records !== undefined &&
      suite !== undefined
    ) {
      recordBindingIssues(
        records,
        directionScope(direction.home, direction.target),
        candidate,
        suite,
        issues,
      );
    }
    if (
      id !== undefined &&
      version !== undefined &&
      evidenceClass !== undefined &&
      records !== undefined
    ) {
      evidenceReferenceIssues(
        evidenceClass,
        { id, version },
        records,
        issues,
      );
    }
    if (
      evidenceClass?.kind === "flagship-evidence" &&
      candidate !== undefined &&
      suite !== undefined
    ) {
      suitePassBindingIssues(
        evidenceClass.deterministicSuitePass,
        candidate,
        suite,
        issues,
      );
    }
    if (
      issues.length === 0 &&
      versionNumber !== undefined &&
      id !== undefined &&
      version !== undefined &&
      languageRegistry !== undefined &&
      suite !== undefined &&
      records !== undefined &&
      direction !== undefined &&
      candidate !== undefined &&
      evidenceClass !== undefined
    ) {
      bundle = {
        schemaVersion: versionNumber,
        kind,
        id,
        version,
        languageRegistry,
        suite,
        records,
        direction,
        candidate,
        evidenceClass,
      } satisfies DirectionReviewBundle;
    }
  }

  if (
    languageRegistry !== undefined &&
    !sameLanguageRegistryRef(languageRegistry, registry)
  ) {
    issue(
      issues,
      "artifact-identity",
      "E-LANGUAGE-REGISTRY-MISMATCH",
      "$.languageRegistry",
    );
  }
  if (issues.length > 0 || bundle === undefined) {
    return failure(issues);
  }
  return {
    ok: true,
    value: {
      bundle,
      assurance: {
        metadata: "structurally-valid",
        evidenceBytes: "not-qualified",
        externalArtifactExistence: "not-qualified",
        evidenceTruthfulness: "not-qualified",
        suitePublication: "not-qualified",
        reviewerQualification: "not-qualified",
        humanReviewOccurrence: "not-qualified",
        linguisticCorrectness: "not-qualified",
        supportTier: "not-assigned",
      },
    },
  };
}
