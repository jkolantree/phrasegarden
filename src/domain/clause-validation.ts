import {
  AUTHORITIES,
  CLAUSE_ORIGINS,
  CLAUSE_SECTIONS,
  CONDITION_PATHS,
  type Authority,
  type Clause,
  type ClauseCondition,
  type ClauseOrigin,
  type ClauseSection,
} from "./authored";
import { compareCodeUnits, compareValidationIssues } from "./primitives";
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

const CONDITION_KEYS = ["path", "op", "value", "values"] as const;
const CONDITION_KEY_SET: ReadonlySet<string> = new Set(CONDITION_KEYS);
const AUTHORITY_BY_ORIGIN: Readonly<
  Record<ClauseOrigin, readonly Authority[]>
> = {
  invariant: ["invariant"],
  recipe: ["normalized-setting", "modality", "fallback"],
  profile: ["profile"],
  "pair-pack": ["pair-pack"],
};

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

function enumValue<const Values extends readonly string[]>(
  record: InspectedRecord | undefined,
  key: string,
  path: string,
  allowed: Values,
  issues: ValidationIssue[],
): Values[number] | undefined {
  const value = stringValue(record, key, path, issues, "authored-data");
  if (value === undefined) {
    return undefined;
  }
  if (!(allowed as readonly string[]).includes(value)) {
    issue(issues, "authored-data", "E-INVALID-ENUM", childPath(path, key), {
      value,
    });
    return undefined;
  }
  return value as Values[number];
}

function safeIntegerValue(
  record: InspectedRecord | undefined,
  key: string,
  path: string,
  issues: ValidationIssue[],
): number | undefined {
  if (record === undefined || !record.values.has(key)) {
    return undefined;
  }
  const value = record.values.get(key);
  if (typeof value !== "number" || !Number.isSafeInteger(value)) {
    issue(
      issues,
      "input-shape",
      "E-EXPECTED-SAFE-INTEGER",
      childPath(path, key),
    );
    return undefined;
  }
  return value;
}

function sectionValue(
  record: InspectedRecord | undefined,
  path: string,
  issues: ValidationIssue[],
): ClauseSection | undefined {
  const value = safeIntegerValue(record, "section", path, issues);
  if (value === undefined) {
    return undefined;
  }
  if (!(CLAUSE_SECTIONS as readonly number[]).includes(value)) {
    issue(issues, "authored-data", "E-INVALID-SECTION", childPath(path, "section"), {
      value,
    });
    return undefined;
  }
  return value as ClauseSection;
}

function rejectConditionFields(
  record: InspectedRecord | undefined,
  allowed: readonly string[],
  path: string,
  issues: ValidationIssue[],
): void {
  if (record === undefined) {
    return;
  }
  const allowedSet = new Set(allowed);
  for (const key of record.present) {
    if (CONDITION_KEY_SET.has(key) && !allowedSet.has(key)) {
      issue(issues, "input-shape", "E-UNKNOWN-FIELD", childPath(path, key));
    }
  }
}

function inValues(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
): readonly string[] | undefined {
  const inspected = inspectArray(input, path, issues);
  if (inspected === undefined) {
    return undefined;
  }
  if (inspected.values.length === 0) {
    issue(issues, "authored-data", "E-EMPTY-IN-VALUES", path);
    return undefined;
  }

  let valid = true;
  const parsed = inspected.values.map((value, index): string | undefined => {
    const valuePath = indexPath(path, index);
    if (typeof value !== "string") {
      issue(issues, "input-shape", "E-EXPECTED-STRING", valuePath);
      valid = false;
      return undefined;
    }
    if (value.length === 0) {
      issue(issues, "authored-data", "E-EMPTY-STRING", valuePath);
      valid = false;
      return undefined;
    }
    return value;
  });
  if (!valid) {
    return undefined;
  }

  const values = parsed as string[];
  const firstIndexByValue = new Map<string, number>();
  let descending = false;
  for (const [index, value] of values.entries()) {
    const firstIndex = firstIndexByValue.get(value);
    if (firstIndex === undefined) {
      firstIndexByValue.set(value, index);
    } else {
      issue(
        issues,
        "authored-data",
        "E-DUPLICATE-IN-VALUE",
        indexPath(path, index),
        { value, firstIndex },
      );
      valid = false;
    }
    const previous = values[index - 1];
    if (previous !== undefined && compareCodeUnits(previous, value) > 0) {
      descending = true;
    }
  }
  if (descending) {
    issue(issues, "authored-data", "E-UNSORTED-IN-VALUES", path);
    valid = false;
  }

  return valid ? values : undefined;
}

function clauseCondition(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
): ClauseCondition | undefined {
  const record = inspectRecord(
    input,
    path,
    CONDITION_KEYS,
    ["path", "op"],
    issues,
  );
  const conditionPath = enumValue(
    record,
    "path",
    path,
    CONDITION_PATHS,
    issues,
  );
  const op = enumValue(
    record,
    "op",
    path,
    ["eq", "in", "present", "absent"] as const,
    issues,
  );

  if (op === "eq") {
    rejectConditionFields(record, ["path", "op", "value"], path, issues);
    if (record?.present.has("value") !== true) {
      issue(issues, "input-shape", "E-MISSING-FIELD", childPath(path, "value"));
    }
    const value = stringValue(
      record,
      "value",
      path,
      issues,
      "authored-data",
    );
    return conditionPath === undefined || value === undefined
      ? undefined
      : { path: conditionPath, op, value };
  }

  if (op === "in") {
    rejectConditionFields(record, ["path", "op", "values"], path, issues);
    if (record?.present.has("values") !== true) {
      issue(
        issues,
        "input-shape",
        "E-MISSING-FIELD",
        childPath(path, "values"),
      );
    }
    const values =
      record?.values.has("values") === true
        ? inValues(dataValue(record, "values"), childPath(path, "values"), issues)
        : undefined;
    return conditionPath === undefined || values === undefined
      ? undefined
      : { path: conditionPath, op, values };
  }

  if (op === "present" || op === "absent") {
    rejectConditionFields(record, ["path", "op"], path, issues);
    if (
      conditionPath !== undefined &&
      conditionPath !== "resolved.pairPack"
    ) {
      issue(
        issues,
        "authored-data",
        "E-INVALID-PRESENCE-PATH",
        childPath(path, "path"),
        { value: conditionPath },
      );
      return undefined;
    }
    return conditionPath === "resolved.pairPack"
      ? { path: conditionPath, op }
      : undefined;
  }

  return undefined;
}

export function inspectClauseConditions(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
): readonly ClauseCondition[] | undefined {
  const inspected = inspectArray(input, path, issues);
  if (inspected === undefined) {
    return undefined;
  }
  const parsed = inspected.values.map((condition, index) =>
    clauseCondition(condition, indexPath(path, index), issues),
  );
  return parsed.some((condition) => condition === undefined)
    ? undefined
    : (parsed as ClauseCondition[]);
}

function effect(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
): Clause["effect"] | undefined {
  const record = inspectRecord(
    input,
    path,
    ["key", "value"],
    ["key", "value"],
    issues,
  );
  const key = stringValue(record, "key", path, issues, "authored-data");
  const value = stringValue(record, "value", path, issues, "authored-data");
  return key === undefined || value === undefined ? undefined : { key, value };
}

function refinement(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
): NonNullable<Clause["refines"]>[number] | undefined {
  const record = inspectRecord(
    input,
    path,
    ["key", "value"],
    ["key"],
    issues,
  );
  const key = stringValue(record, "key", path, issues, "authored-data");
  const hasValue = record?.present.has("value") === true;
  const value = hasValue
    ? stringValue(record, "value", path, issues, "authored-data")
    : undefined;
  if (key === undefined || (hasValue && value === undefined)) {
    return undefined;
  }
  return value === undefined ? { key } : { key, value };
}

export function validateClause(input: unknown): ValidationResult<Clause> {
  const issues: ValidationIssue[] = [];
  const root = inspectRecord(
    input,
    "$",
    [
      "id",
      "origin",
      "authority",
      "section",
      "order",
      "whenAll",
      "renderingKey",
      "effect",
      "refines",
    ],
    [
      "id",
      "origin",
      "authority",
      "section",
      "order",
      "whenAll",
      "renderingKey",
      "effect",
    ],
    issues,
  );
  if (root === undefined) {
    return failure(issues);
  }

  const id = stringValue(root, "id", "$", issues, "authored-data");
  const origin = enumValue(root, "origin", "$", CLAUSE_ORIGINS, issues);
  const authority = enumValue(root, "authority", "$", AUTHORITIES, issues);
  const section = sectionValue(root, "$", issues);
  const order = safeIntegerValue(root, "order", "$", issues);
  const renderingKey = stringValue(
    root,
    "renderingKey",
    "$",
    issues,
    "authored-data",
  );

  const parsedConditions = root.values.has("whenAll")
    ? inspectClauseConditions(dataValue(root, "whenAll"), "$.whenAll", issues)
    : undefined;

  const parsedEffect = root.values.has("effect")
    ? effect(dataValue(root, "effect"), "$.effect", issues)
    : undefined;

  const hasRefines = root.present.has("refines");
  const inspectedRefines =
    root.values.has("refines")
      ? inspectArray(dataValue(root, "refines"), "$.refines", issues)
      : undefined;
  const parsedRefines =
    inspectedRefines?.values.map((item, index) =>
      refinement(item, indexPath("$.refines", index), issues),
    ) ?? [];

  if (
    origin !== undefined &&
    authority !== undefined &&
    !AUTHORITY_BY_ORIGIN[origin].includes(authority)
  ) {
    issue(
      issues,
      "authored-data",
      "E-ILLEGAL-ORIGIN-AUTHORITY",
      "$.authority",
      { origin, authority },
    );
  }

  if (issues.length > 0) {
    return failure(issues);
  }

  if (
    id === undefined ||
    origin === undefined ||
    authority === undefined ||
    section === undefined ||
    order === undefined ||
    renderingKey === undefined ||
    parsedConditions === undefined ||
    parsedEffect === undefined ||
    (hasRefines &&
      (inspectedRefines === undefined ||
        parsedRefines.some((item) => item === undefined)))
  ) {
    issue(issues, "authored-data", "E-VALIDATION-INCOMPLETE", "$");
    return failure(issues);
  }

  const clause: Clause = {
    id,
    origin,
    authority,
    section,
    order,
    whenAll: parsedConditions,
    renderingKey,
    effect: parsedEffect,
    ...(hasRefines
      ? {
          refines: parsedRefines as NonNullable<Clause["refines"]>,
        }
      : {}),
  };
  return { ok: true, value: clause };
}
