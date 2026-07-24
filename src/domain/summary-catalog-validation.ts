import type { SummaryCatalog } from "./authored";
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

const PART_KEYS = ["kind", "text", "name"] as const;
const PART_KEY_SET: ReadonlySet<string> = new Set(PART_KEYS);

type CatalogMessage = SummaryCatalog["messages"][number];
type CatalogPart = CatalogMessage["parts"][number];

interface ParsedMessage {
  readonly id?: string;
  readonly value?: CatalogMessage;
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
    if (PART_KEY_SET.has(key) && !allowedSet.has(key)) {
      issue(issues, "input-shape", "E-UNKNOWN-FIELD", childPath(path, key));
    }
  }
}

function catalogPart(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
): CatalogPart | undefined {
  const record = inspectRecord(input, path, PART_KEYS, ["kind"], issues);
  const kind = stringValue(
    record,
    "kind",
    path,
    issues,
    "authored-data",
  );
  if (kind !== undefined && kind !== "literal" && kind !== "value") {
    issue(issues, "authored-data", "E-INVALID-ENUM", childPath(path, "kind"), {
      value: kind,
    });
    return undefined;
  }

  if (kind === "literal") {
    rejectPartFields(record, ["kind", "text"], path, issues);
    if (record?.present.has("text") !== true) {
      issue(issues, "input-shape", "E-MISSING-FIELD", childPath(path, "text"));
    }
    const text = stringValue(record, "text", path, issues, null);
    return text === undefined ? undefined : { kind, text };
  }

  if (kind === "value") {
    rejectPartFields(record, ["kind", "name"], path, issues);
    if (record?.present.has("name") !== true) {
      issue(issues, "input-shape", "E-MISSING-FIELD", childPath(path, "name"));
    }
    const name = stringValue(
      record,
      "name",
      path,
      issues,
      "authored-data",
    );
    return name === undefined ? undefined : { kind, name };
  }

  return undefined;
}

function catalogMessage(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
): ParsedMessage {
  const record = inspectRecord(
    input,
    path,
    ["id", "parts"],
    ["id", "parts"],
    issues,
  );
  const id = stringValue(record, "id", path, issues, "authored-data");
  const inspectedParts =
    record?.values.has("parts") === true
      ? inspectArray(dataValue(record, "parts"), childPath(path, "parts"), issues)
      : undefined;
  if (inspectedParts === undefined) {
    return id === undefined ? {} : { id };
  }

  const parts = inspectedParts.values.map((part, index) =>
    catalogPart(part, indexPath(childPath(path, "parts"), index), issues),
  );
  if (id === undefined || parts.some((part) => part === undefined)) {
    return id === undefined ? {} : { id };
  }
  return {
    id,
    value: { id, parts: parts as CatalogPart[] },
  };
}

export function validateSummaryCatalog(
  input: unknown,
): ValidationResult<SummaryCatalog> {
  const issues: ValidationIssue[] = [];
  const root = inspectRecord(
    input,
    "$",
    ["locale", "version", "messages"],
    ["locale", "version", "messages"],
    issues,
  );
  if (root === undefined) {
    return failure(issues);
  }

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
  const inspectedMessages =
    root.values.has("messages")
      ? inspectArray(dataValue(root, "messages"), "$.messages", issues)
      : undefined;
  const parsedMessages =
    inspectedMessages?.values.map((message, index) =>
      catalogMessage(message, indexPath("$.messages", index), issues),
    ) ?? [];

  const firstIndexById = new Map<string, number>();
  for (const [index, message] of parsedMessages.entries()) {
    if (message.id === undefined) {
      continue;
    }
    const firstIndex = firstIndexById.get(message.id);
    if (firstIndex === undefined) {
      firstIndexById.set(message.id, index);
    } else {
      issue(
        issues,
        "authored-data",
        "E-DUPLICATE-SUMMARY-MESSAGE-ID",
        `${indexPath("$.messages", index)}.id`,
        { id: message.id, firstIndex },
      );
    }
  }

  if (issues.length > 0) {
    return failure(issues);
  }

  const messages = parsedMessages.map((message) => message.value);
  if (
    locale === undefined ||
    version === undefined ||
    inspectedMessages === undefined ||
    messages.some((message) => message === undefined)
  ) {
    issue(issues, "authored-data", "E-VALIDATION-INCOMPLETE", "$");
    return failure(issues);
  }

  return {
    ok: true,
    value: {
      locale,
      version,
      messages: messages as SummaryCatalog["messages"],
    },
  };
}
