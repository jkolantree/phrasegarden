import type {
  Clause,
  CompilerPolicy,
  LimitationSpec,
  SummaryItemSpec,
} from "./authored";
import { validateClause } from "./clause-validation";
import { collectNestedValidation } from "./nested-validation";
import { compareValidationIssues } from "./primitives";
import type {
  ValidationIssue,
  ValidationResult,
} from "./results";
import {
  validateLimitationSpec,
  validateSummaryItemSpec,
} from "./spec-validation";
import {
  addValidationIssue as issue,
  childPath,
  dataValue,
  indexPath,
  inspectArray,
  inspectRecord,
  type InspectedRecord,
} from "./validation-input";

interface ParsedArray<T> {
  readonly values: readonly (T | undefined)[];
}

function failure(issues: ValidationIssue[]): ValidationResult<never> {
  return { ok: false, issues: [...issues].sort(compareValidationIssues) };
}

function stringValue(
  record: InspectedRecord | undefined,
  key: string,
  path: string,
  issues: ValidationIssue[],
): string | undefined {
  if (record === undefined || !record.values.has(key)) {
    return undefined;
  }
  const value = record.values.get(key);
  if (typeof value !== "string") {
    issue(issues, "input-shape", "E-EXPECTED-STRING", childPath(path, key));
    return undefined;
  }
  if (value.length === 0) {
    issue(
      issues,
      "artifact-identity",
      "E-EMPTY-STRING",
      childPath(path, key),
    );
    return undefined;
  }
  return value;
}

function childArray<T>(
  input: unknown,
  path: string,
  validator: (value: unknown) => ValidationResult<T>,
  issues: ValidationIssue[],
): ParsedArray<T> | undefined {
  const inspected = inspectArray(input, path, issues);
  if (inspected === undefined) {
    return undefined;
  }
  return {
    values: inspected.values.map((value, index) =>
      collectNestedValidation(validator(value), indexPath(path, index), issues),
    ),
  };
}

function rejectDuplicateIdentities<T>(
  values: readonly (T | undefined)[],
  path: string,
  field: string,
  code: string,
  identity: (value: T) => string,
  issues: ValidationIssue[],
): void {
  const firstIndexByIdentity = new Map<string, number>();
  for (const [index, value] of values.entries()) {
    if (value === undefined) {
      continue;
    }
    const id = identity(value);
    const firstIndex = firstIndexByIdentity.get(id);
    if (firstIndex === undefined) {
      firstIndexByIdentity.set(id, index);
    } else {
      issue(
        issues,
        "authored-data",
        code,
        `${indexPath(path, index)}.${field}`,
        { [field]: id, firstIndex },
      );
    }
  }
}

export function validateCompilerPolicy(
  input: unknown,
): ValidationResult<CompilerPolicy> {
  const issues: ValidationIssue[] = [];
  const root = inspectRecord(
    input,
    "$",
    [
      "version",
      "compatibleCompilerVersion",
      "invariantClauses",
      "summaryItems",
      "knownLimitations",
    ],
    [
      "version",
      "compatibleCompilerVersion",
      "invariantClauses",
      "summaryItems",
      "knownLimitations",
    ],
    issues,
  );
  if (root === undefined) {
    return failure(issues);
  }

  const version = stringValue(root, "version", "$", issues);
  const compatibleCompilerVersion = stringValue(
    root,
    "compatibleCompilerVersion",
    "$",
    issues,
  );
  const clauses = root.values.has("invariantClauses")
    ? childArray(
        dataValue(root, "invariantClauses"),
        "$.invariantClauses",
        validateClause,
        issues,
      )
    : undefined;
  const summaryItems = root.values.has("summaryItems")
    ? childArray(
        dataValue(root, "summaryItems"),
        "$.summaryItems",
        validateSummaryItemSpec,
        issues,
      )
    : undefined;
  const knownLimitations = root.values.has("knownLimitations")
    ? childArray(
        dataValue(root, "knownLimitations"),
        "$.knownLimitations",
        validateLimitationSpec,
        issues,
      )
    : undefined;

  for (const [index, clause] of clauses?.values.entries() ?? []) {
    if (clause !== undefined && clause.origin !== "invariant") {
      issue(
        issues,
        "authored-data",
        "E-POLICY-CLAUSE-ORIGIN",
        `${indexPath("$.invariantClauses", index)}.origin`,
        { value: clause.origin },
      );
    }
  }

  rejectDuplicateIdentities(
    clauses?.values ?? [],
    "$.invariantClauses",
    "id",
    "E-DUPLICATE-CLAUSE-ID",
    (clause: Clause) => clause.id,
    issues,
  );
  rejectDuplicateIdentities(
    summaryItems?.values ?? [],
    "$.summaryItems",
    "id",
    "E-DUPLICATE-SUMMARY-ID",
    (item: SummaryItemSpec) => item.id,
    issues,
  );
  rejectDuplicateIdentities(
    knownLimitations?.values ?? [],
    "$.knownLimitations",
    "code",
    "E-DUPLICATE-LIMITATION-CODE",
    (item: LimitationSpec) => item.code,
    issues,
  );

  if (issues.length > 0) {
    return failure(issues);
  }
  if (
    version === undefined ||
    compatibleCompilerVersion === undefined ||
    clauses === undefined ||
    summaryItems === undefined ||
    knownLimitations === undefined ||
    clauses.values.some((value) => value === undefined) ||
    summaryItems.values.some((value) => value === undefined) ||
    knownLimitations.values.some((value) => value === undefined)
  ) {
    issue(issues, "authored-data", "E-VALIDATION-INCOMPLETE", "$");
    return failure(issues);
  }

  return {
    ok: true,
    value: {
      version,
      compatibleCompilerVersion,
      invariantClauses: clauses.values as Clause[],
      summaryItems: summaryItems.values as SummaryItemSpec[],
      knownLimitations: knownLimitations.values as LimitationSpec[],
    },
  };
}
