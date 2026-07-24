import {
  RENDER_VALUE_FORMATS,
  RENDER_VALUE_PATHS,
  type PromptSurface,
  type RenderPart,
} from "./authored";
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

const RENDER_PART_KEYS = ["kind", "text", "path", "format"] as const;
const RENDER_PART_KEY_SET: ReadonlySet<string> = new Set(RENDER_PART_KEYS);

interface ParsedRendering {
  readonly key?: string;
  readonly value?: PromptSurface["renderings"][number];
}

function failure(issues: ValidationIssue[]): ValidationResult<never> {
  return { ok: false, issues: [...issues].sort(compareValidationIssues) };
}

function stringValue(
  record: InspectedRecord | undefined,
  key: string,
  path: string,
  issues: ValidationIssue[],
  emptyStage: ValidationStage | null,
): string | undefined {
  if (record === undefined || !record.values.has(key)) {
    return undefined;
  }
  const value = record.values.get(key);
  if (typeof value !== "string") {
    issue(issues, "input-shape", "E-EXPECTED-STRING", childPath(path, key));
    return undefined;
  }
  if (value.length === 0 && emptyStage !== null) {
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

function rejectPartFields(
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
    if (RENDER_PART_KEY_SET.has(key) && !allowedSet.has(key)) {
      issue(issues, "input-shape", "E-UNKNOWN-FIELD", childPath(path, key));
    }
  }
}

function renderPart(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
): RenderPart | undefined {
  const record = inspectRecord(
    input,
    path,
    RENDER_PART_KEYS,
    ["kind"],
    issues,
  );
  const kind = enumValue(
    record,
    "kind",
    path,
    ["literal", "value"] as const,
    issues,
  );

  if (kind === "literal") {
    rejectPartFields(record, ["kind", "text"], path, issues);
    if (record?.present.has("text") !== true) {
      issue(issues, "input-shape", "E-MISSING-FIELD", childPath(path, "text"));
      return undefined;
    }
    const text = stringValue(record, "text", path, issues, null);
    return text === undefined ? undefined : { kind, text };
  }

  if (kind === "value") {
    rejectPartFields(record, ["kind", "path", "format"], path, issues);
    for (const key of ["path", "format"] as const) {
      if (record?.present.has(key) !== true) {
        issue(issues, "input-shape", "E-MISSING-FIELD", childPath(path, key));
      }
    }
    const valuePath = enumValue(
      record,
      "path",
      path,
      RENDER_VALUE_PATHS,
      issues,
    );
    const format = enumValue(
      record,
      "format",
      path,
      RENDER_VALUE_FORMATS,
      issues,
    );
    return valuePath === undefined || format === undefined
      ? undefined
      : { kind, path: valuePath, format };
  }

  return undefined;
}

function rendering(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
): ParsedRendering {
  const record = inspectRecord(
    input,
    path,
    ["key", "parts"],
    ["key", "parts"],
    issues,
  );
  const key = stringValue(record, "key", path, issues, "authored-data");
  const inspectedParts =
    record?.values.has("parts") === true
      ? inspectArray(dataValue(record, "parts"), childPath(path, "parts"), issues)
      : undefined;

  if (inspectedParts === undefined) {
    return key === undefined ? {} : { key };
  }

  const parsedParts = inspectedParts.values.map((part, index) =>
    renderPart(part, indexPath(childPath(path, "parts"), index), issues),
  );
  if (key === undefined || parsedParts.some((part) => part === undefined)) {
    return key === undefined ? {} : { key };
  }

  return {
    key,
    value: {
      key,
      parts: parsedParts as RenderPart[],
    },
  };
}

export function validatePromptSurface(
  input: unknown,
): ValidationResult<PromptSurface> {
  const issues: ValidationIssue[] = [];
  const root = inspectRecord(
    input,
    "$",
    ["id", "locale", "version", "renderings"],
    ["id", "locale", "version", "renderings"],
    issues,
  );
  if (root === undefined) {
    return failure(issues);
  }

  const id = stringValue(root, "id", "$", issues, "artifact-identity");
  const locale = stringValue(
    root,
    "locale",
    "$",
    issues,
    "artifact-identity",
  );
  const version = stringValue(
    root,
    "version",
    "$",
    issues,
    "artifact-identity",
  );
  const inspectedRenderings =
    root.values.has("renderings")
      ? inspectArray(dataValue(root, "renderings"), "$.renderings", issues)
      : undefined;

  const parsedRenderings =
    inspectedRenderings?.values.map((item, index) =>
      rendering(item, indexPath("$.renderings", index), issues),
    ) ?? [];

  const firstIndexByKey = new Map<string, number>();
  for (const [index, item] of parsedRenderings.entries()) {
    if (item.key === undefined) {
      continue;
    }
    const firstIndex = firstIndexByKey.get(item.key);
    if (firstIndex === undefined) {
      firstIndexByKey.set(item.key, index);
    } else {
      issue(
        issues,
        "authored-data",
        "E-DUPLICATE-RENDERING-KEY",
        `${indexPath("$.renderings", index)}.key`,
        { key: item.key, firstIndex },
      );
    }
  }

  if (issues.length > 0) {
    return failure(issues);
  }

  const renderings = parsedRenderings.map((item) => item.value);
  if (
    id === undefined ||
    locale === undefined ||
    version === undefined ||
    inspectedRenderings === undefined ||
    renderings.some((item) => item === undefined)
  ) {
    issue(issues, "authored-data", "E-VALIDATION-INCOMPLETE", "$");
    return failure(issues);
  }

  return {
    ok: true,
    value: {
      id,
      locale,
      version,
      renderings: renderings as PromptSurface["renderings"],
    },
  };
}
