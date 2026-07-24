import {
  CONDITION_PATHS,
  RENDER_VALUE_PATHS,
  type ConditionPath,
  type LimitationSpec,
  type RenderValuePath,
  type SummaryItemSpec,
} from "./authored";
import { inspectClauseConditions } from "./clause-validation";
import { compareCodeUnits, compareValidationIssues } from "./primitives";
import type {
  ValidationIssue,
  ValidationResult,
} from "./results";
import {
  addValidationIssue as issue,
  childPath,
  dataValue,
  inspectDictionary,
  inspectRecord,
  type InspectedRecord,
} from "./validation-input";

const MAPPED_PATHS: ReadonlySet<string> = new Set([
  ...CONDITION_PATHS,
  ...RENDER_VALUE_PATHS,
]);
const ARRAY_INDEX_NAME = /^(0|[1-9][0-9]*)$/u;
const MAX_ARRAY_INDEX = 4_294_967_294;

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
    issue(issues, "authored-data", "E-EMPTY-STRING", childPath(path, key));
    return undefined;
  }
  return value;
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

function arrayIndexName(value: string): number | null {
  if (!ARRAY_INDEX_NAME.test(value)) {
    return null;
  }
  const index = Number(value);
  return index <= MAX_ARRAY_INDEX ? index : null;
}

function compareMapKeys(left: string, right: string): number {
  const leftIndex = arrayIndexName(left);
  const rightIndex = arrayIndexName(right);
  if (leftIndex !== null && rightIndex !== null) {
    return leftIndex - rightIndex;
  }
  if (leftIndex !== null) {
    return -1;
  }
  if (rightIndex !== null) {
    return 1;
  }
  return compareCodeUnits(left, right);
}

function summaryValues(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
): Readonly<Record<string, RenderValuePath | ConditionPath>> | undefined {
  const record = inspectDictionary(input, path, issues);
  if (record === undefined) {
    return undefined;
  }

  let valid = true;
  const entries: [string, RenderValuePath | ConditionPath][] = [];
  for (const [name, value] of record.values) {
    const valuePath = childPath(path, name);
    if (name.length === 0) {
      issue(issues, "authored-data", "E-EMPTY-MAP-KEY", valuePath);
      valid = false;
    }
    if (typeof value !== "string") {
      issue(issues, "input-shape", "E-EXPECTED-STRING", valuePath);
      valid = false;
      continue;
    }
    if (!MAPPED_PATHS.has(value)) {
      issue(issues, "authored-data", "E-INVALID-MAPPED-PATH", valuePath, {
        value,
      });
      valid = false;
      continue;
    }
    entries.push([name, value as RenderValuePath | ConditionPath]);
  }

  if (!valid) {
    return undefined;
  }
  entries.sort(([left], [right]) => compareMapKeys(left, right));
  return Object.fromEntries(entries) as Readonly<
    Record<string, RenderValuePath | ConditionPath>
  >;
}

export function validateSummaryItemSpec(
  input: unknown,
): ValidationResult<SummaryItemSpec> {
  const issues: ValidationIssue[] = [];
  const root = inspectRecord(
    input,
    "$",
    ["id", "order", "whenAll", "values"],
    ["id", "order", "whenAll", "values"],
    issues,
  );
  if (root === undefined) {
    return failure(issues);
  }

  const id = stringValue(root, "id", "$", issues);
  const order = safeIntegerValue(root, "order", "$", issues);
  const whenAll = root.values.has("whenAll")
    ? inspectClauseConditions(dataValue(root, "whenAll"), "$.whenAll", issues)
    : undefined;
  const values = root.values.has("values")
    ? summaryValues(dataValue(root, "values"), "$.values", issues)
    : undefined;

  if (issues.length > 0) {
    return failure(issues);
  }
  if (
    id === undefined ||
    order === undefined ||
    whenAll === undefined ||
    values === undefined
  ) {
    issue(issues, "authored-data", "E-VALIDATION-INCOMPLETE", "$");
    return failure(issues);
  }

  return { ok: true, value: { id, order, whenAll, values } };
}

export function validateLimitationSpec(
  input: unknown,
): ValidationResult<LimitationSpec> {
  const issues: ValidationIssue[] = [];
  const root = inspectRecord(
    input,
    "$",
    ["code", "order", "whenAll", "renderingKey"],
    ["code", "order", "whenAll", "renderingKey"],
    issues,
  );
  if (root === undefined) {
    return failure(issues);
  }

  const code = stringValue(root, "code", "$", issues);
  const order = safeIntegerValue(root, "order", "$", issues);
  const whenAll = root.values.has("whenAll")
    ? inspectClauseConditions(dataValue(root, "whenAll"), "$.whenAll", issues)
    : undefined;
  const renderingKey = stringValue(root, "renderingKey", "$", issues);

  if (issues.length > 0) {
    return failure(issues);
  }
  if (
    code === undefined ||
    order === undefined ||
    whenAll === undefined ||
    renderingKey === undefined
  ) {
    issue(issues, "authored-data", "E-VALIDATION-INCOMPLETE", "$");
    return failure(issues);
  }

  return { ok: true, value: { code, order, whenAll, renderingKey } };
}
