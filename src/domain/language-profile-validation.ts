import {
  LANGUAGE_DIRECTIONS,
  type Clause,
  type LanguageDirection,
  type LanguageProfile,
} from "./authored";
import { validateClause } from "./clause-validation";
import {
  type CanonicalLanguageRegistry,
  validateCanonicalLanguageId,
  validateLanguageRegistryRef,
} from "./language-identity";
import { collectNestedValidation } from "./nested-validation";
import { compareValidationIssues } from "./primitives";
import type {
  ValidationIssue,
  ValidationResult,
  ValidationStage,
} from "./results";
import {
  addValidationIssue as issue,
  childPath,
  dataValue,
  indexPath,
  inspectArray,
  inspectRecord,
  type InspectedRecord,
} from "./validation-input";

const PROFILE_KEYS = [
  "languageRegistry",
  "id",
  "version",
  "bcp47",
  "autonym",
  "searchableNames",
  "direction",
  "scripts",
  "monolingualClauses",
] as const;
const SCRIPT_CODE = /^[A-Z][a-z]{3}$/u;

function failure(issues: ValidationIssue[]): ValidationResult<never> {
  return { ok: false, issues: [...issues].sort(compareValidationIssues) };
}

function stringValue(
  record: InspectedRecord | undefined,
  key: string,
  path: string,
  issues: ValidationIssue[],
  emptyStage: ValidationStage,
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
    issue(issues, emptyStage, "E-EMPTY-STRING", childPath(path, key));
    return undefined;
  }
  return value;
}

function directionValue(
  record: InspectedRecord | undefined,
  issues: ValidationIssue[],
): LanguageDirection | undefined {
  const value = stringValue(record, "direction", "$", issues, "authored-data");
  if (value === undefined) {
    return undefined;
  }
  if (!(LANGUAGE_DIRECTIONS as readonly string[]).includes(value)) {
    issue(
      issues,
      "authored-data",
      "E-INVALID-ENUM",
      "$.direction",
      { value },
    );
    return undefined;
  }
  return value as LanguageDirection;
}

function uniqueStringArray(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
  kind: "searchable-name" | "script",
): readonly string[] | undefined {
  const inspected = inspectArray(input, path, issues);
  if (inspected === undefined) {
    return undefined;
  }
  if (inspected.values.length === 0) {
    issue(
      issues,
      "authored-data",
      kind === "script" ? "E-EMPTY-SCRIPTS" : "E-EMPTY-SEARCHABLE-NAMES",
      path,
    );
    return undefined;
  }

  const values: string[] = [];
  const firstIndexByValue = new Map<string, number>();
  let valid = true;
  for (const [index, inputValue] of inspected.values.entries()) {
    const itemPath = indexPath(path, index);
    if (typeof inputValue !== "string") {
      issue(issues, "input-shape", "E-EXPECTED-STRING", itemPath);
      valid = false;
      continue;
    }
    if (inputValue.length === 0) {
      issue(issues, "authored-data", "E-EMPTY-STRING", itemPath);
      valid = false;
      continue;
    }
    if (kind === "script" && !SCRIPT_CODE.test(inputValue)) {
      issue(
        issues,
        "authored-data",
        "E-SCRIPT-CASING",
        itemPath,
        { value: inputValue },
      );
      valid = false;
      continue;
    }
    const firstIndex = firstIndexByValue.get(inputValue);
    if (firstIndex !== undefined) {
      issue(
        issues,
        "authored-data",
        kind === "script"
          ? "E-DUPLICATE-SCRIPT"
          : "E-DUPLICATE-SEARCHABLE-NAME",
        itemPath,
        { firstIndex, value: inputValue },
      );
      valid = false;
      continue;
    }
    firstIndexByValue.set(inputValue, index);
    values.push(inputValue);
  }
  return valid ? values : undefined;
}

function profileClauses(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
): readonly Clause[] | undefined {
  const inspected = inspectArray(input, path, issues);
  if (inspected === undefined) {
    return undefined;
  }

  const clauses: Clause[] = [];
  const firstIndexById = new Map<string, number>();
  let valid = true;
  for (const [index, item] of inspected.values.entries()) {
    const itemPath = indexPath(path, index);
    const clause = collectNestedValidation(
      validateClause(item),
      itemPath,
      issues,
    );
    if (clause === undefined) {
      valid = false;
      continue;
    }
    if (clause.origin !== "profile" || clause.authority !== "profile") {
      issue(
        issues,
        "authored-data",
        "E-PROFILE-CLAUSE-OWNERSHIP",
        childPath(itemPath, "origin"),
        { authority: clause.authority, origin: clause.origin },
      );
      valid = false;
      continue;
    }
    const firstIndex = firstIndexById.get(clause.id);
    if (firstIndex !== undefined) {
      issue(
        issues,
        "authored-data",
        "E-DUPLICATE-CLAUSE-ID",
        childPath(itemPath, "id"),
        { firstIndex, id: clause.id },
      );
      valid = false;
      continue;
    }
    firstIndexById.set(clause.id, index);
    clauses.push(clause);
  }
  return valid ? clauses : undefined;
}

export function validateLanguageProfile(
  input: unknown,
  registry: CanonicalLanguageRegistry,
): ValidationResult<LanguageProfile> {
  const issues: ValidationIssue[] = [];
  const root = inspectRecord(
    input,
    "$",
    PROFILE_KEYS,
    PROFILE_KEYS,
    issues,
  );
  if (root === undefined) {
    return failure(issues);
  }

  const registryRef = collectNestedValidation(
    validateLanguageRegistryRef(dataValue(root, "languageRegistry"), registry),
    "$.languageRegistry",
    issues,
  );
  const id = root.values.has("id")
    ? collectNestedValidation(
        validateCanonicalLanguageId(dataValue(root, "id"), registry),
        "$.id",
        issues,
      )
    : undefined;
  const bcp47 = root.values.has("bcp47")
    ? collectNestedValidation(
        validateCanonicalLanguageId(dataValue(root, "bcp47"), registry),
        "$.bcp47",
        issues,
      )
    : undefined;

  const rawId = dataValue(root, "id");
  const rawBcp47 = dataValue(root, "bcp47");
  if (
    typeof rawId === "string" &&
    typeof rawBcp47 === "string" &&
    rawId !== rawBcp47
  ) {
    issue(
      issues,
      "artifact-identity",
      "E-LANGUAGE-IDENTITY-MISMATCH",
      "$.bcp47",
      { bcp47: rawBcp47, id: rawId },
    );
  }

  const version = stringValue(
    root,
    "version",
    "$",
    issues,
    "artifact-identity",
  );
  if (
    root.values.has("version") &&
    (typeof dataValue(root, "version") !== "string" ||
      dataValue(root, "version") === "")
  ) {
    issue(
      issues,
      "artifact-identity",
      "E-MISSING-PINNED-VERSION",
      "$.version",
    );
  }
  const autonym = stringValue(
    root,
    "autonym",
    "$",
    issues,
    "authored-data",
  );
  const direction = directionValue(root, issues);
  const searchableNames = root.values.has("searchableNames")
    ? uniqueStringArray(
        dataValue(root, "searchableNames"),
        "$.searchableNames",
        issues,
        "searchable-name",
      )
    : undefined;
  const scripts = root.values.has("scripts")
    ? uniqueStringArray(
        dataValue(root, "scripts"),
        "$.scripts",
        issues,
        "script",
      )
    : undefined;
  const monolingualClauses = root.values.has("monolingualClauses")
    ? profileClauses(
        dataValue(root, "monolingualClauses"),
        "$.monolingualClauses",
        issues,
      )
    : undefined;

  if (issues.length > 0) {
    return failure(issues);
  }
  if (
    registryRef === undefined ||
    id === undefined ||
    bcp47 === undefined ||
    id !== bcp47 ||
    version === undefined ||
    autonym === undefined ||
    searchableNames === undefined ||
    direction === undefined ||
    scripts === undefined ||
    monolingualClauses === undefined
  ) {
    issue(issues, "authored-data", "E-VALIDATION-INCOMPLETE", "$");
    return failure(issues);
  }

  return {
    ok: true,
    value: {
      languageRegistry: registryRef,
      id,
      version,
      bcp47,
      autonym,
      searchableNames,
      direction,
      scripts,
      monolingualClauses,
    },
  };
}
