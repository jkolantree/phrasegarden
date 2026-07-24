import type {
  ValidationIssue,
  ValidationStage,
} from "./results";

export interface InspectedRecord {
  readonly values: ReadonlyMap<string, unknown>;
  readonly present: ReadonlySet<string>;
}

export interface InspectedArray {
  readonly values: readonly unknown[];
}

const UNSAFE_KEYS: ReadonlySet<string> = new Set([
  "__proto__",
  "constructor",
  "prototype",
]);
const ARRAY_INDEX = /^(0|[1-9][0-9]*)$/u;
const MAX_ARRAY_INDEX = 4_294_967_294;

export function addValidationIssue(
  issues: ValidationIssue[],
  stage: ValidationStage,
  code: string,
  path: string,
  values?: Readonly<Record<string, string | number | boolean>>,
): void {
  issues.push(
    values === undefined ? { stage, code, path } : { stage, code, path, values },
  );
}

export function childPath(parent: string, key: string): string {
  return !UNSAFE_KEYS.has(key) && /^[A-Za-z_$][A-Za-z0-9_$]*$/u.test(key)
    ? `${parent}.${key}`
    : `${parent}[${JSON.stringify(key)}]`;
}

export function indexPath(parent: string, index: number): string {
  return `${parent}[${index}]`;
}

export function inspectRecord(
  input: unknown,
  path: string,
  allowed: readonly string[] | null,
  required: readonly string[],
  issues: ValidationIssue[],
): InspectedRecord | undefined {
  if (typeof input !== "object" || input === null) {
    addValidationIssue(issues, "input-shape", "E-EXPECTED-RECORD", path);
    return undefined;
  }

  let isArray: boolean;
  try {
    isArray = Array.isArray(input);
  } catch {
    addValidationIssue(issues, "input-shape", "E-UNSAFE-OBJECT", path);
    return undefined;
  }
  if (isArray) {
    addValidationIssue(issues, "input-shape", "E-EXPECTED-RECORD", path);
    return undefined;
  }

  let prototype: object | null;
  try {
    prototype = Object.getPrototypeOf(input) as object | null;
  } catch {
    addValidationIssue(issues, "input-shape", "E-UNSAFE-OBJECT", path);
    return undefined;
  }

  if (prototype !== Object.prototype && prototype !== null) {
    addValidationIssue(issues, "input-shape", "E-UNSAFE-PROTOTYPE", path);
    return undefined;
  }

  let descriptors: Record<PropertyKey, PropertyDescriptor>;
  try {
    descriptors = Object.getOwnPropertyDescriptors(input) as Record<
      PropertyKey,
      PropertyDescriptor
    >;
  } catch {
    addValidationIssue(issues, "input-shape", "E-UNSAFE-OBJECT", path);
    return undefined;
  }

  const allowedKeys = allowed === null ? null : new Set(allowed);
  const present = new Set<string>();
  const values = new Map<string, unknown>();
  let reportedSymbol = false;

  for (const key of Reflect.ownKeys(descriptors)) {
    if (typeof key === "symbol") {
      if (!reportedSymbol) {
        addValidationIssue(issues, "input-shape", "E-SYMBOL-FIELD", path);
        reportedSymbol = true;
      }
      continue;
    }

    present.add(key);
    const fieldPath = childPath(path, key);
    const descriptor = descriptors[key];
    if (descriptor === undefined) {
      addValidationIssue(
        issues,
        "input-shape",
        "E-UNSAFE-OBJECT",
        fieldPath,
      );
      continue;
    }
    if (UNSAFE_KEYS.has(key)) {
      addValidationIssue(issues, "input-shape", "E-UNSAFE-KEY", fieldPath);
      continue;
    }
    if (allowedKeys !== null && !allowedKeys.has(key)) {
      addValidationIssue(issues, "input-shape", "E-UNKNOWN-FIELD", fieldPath);
      continue;
    }
    if (!("value" in descriptor)) {
      addValidationIssue(issues, "input-shape", "E-ACCESSOR-FIELD", fieldPath);
      continue;
    }
    if (descriptor.enumerable !== true) {
      addValidationIssue(
        issues,
        "input-shape",
        "E-NONENUMERABLE-FIELD",
        fieldPath,
      );
      continue;
    }
    values.set(key, descriptor.value);
  }

  for (const key of required) {
    if (!present.has(key)) {
      addValidationIssue(
        issues,
        "input-shape",
        "E-MISSING-FIELD",
        childPath(path, key),
      );
    }
  }

  return { values, present };
}

export function inspectDictionary(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
): InspectedRecord | undefined {
  return inspectRecord(input, path, null, [], issues);
}

export function inspectArray(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
): InspectedArray | undefined {
  if (typeof input !== "object" || input === null) {
    addValidationIssue(issues, "input-shape", "E-EXPECTED-ARRAY", path);
    return undefined;
  }

  let isArray: boolean;
  try {
    isArray = Array.isArray(input);
  } catch {
    addValidationIssue(issues, "input-shape", "E-UNSAFE-OBJECT", path);
    return undefined;
  }
  if (!isArray) {
    addValidationIssue(issues, "input-shape", "E-EXPECTED-ARRAY", path);
    return undefined;
  }

  let prototype: object | null;
  try {
    prototype = Object.getPrototypeOf(input) as object | null;
  } catch {
    addValidationIssue(issues, "input-shape", "E-UNSAFE-OBJECT", path);
    return undefined;
  }

  if (prototype !== Array.prototype) {
    addValidationIssue(issues, "input-shape", "E-UNSAFE-PROTOTYPE", path);
    return undefined;
  }

  let descriptors: Record<PropertyKey, PropertyDescriptor>;
  try {
    descriptors = Object.getOwnPropertyDescriptors(input) as Record<
      PropertyKey,
      PropertyDescriptor
    >;
  } catch {
    addValidationIssue(issues, "input-shape", "E-UNSAFE-OBJECT", path);
    return undefined;
  }

  const lengthDescriptor = descriptors.length;
  if (
    lengthDescriptor === undefined ||
    !("value" in lengthDescriptor) ||
    typeof lengthDescriptor.value !== "number" ||
    !Number.isInteger(lengthDescriptor.value) ||
    lengthDescriptor.value < 0 ||
    lengthDescriptor.value > MAX_ARRAY_INDEX + 1 ||
    lengthDescriptor.enumerable !== false
  ) {
    addValidationIssue(issues, "input-shape", "E-UNSAFE-ARRAY-LENGTH", path);
    return undefined;
  }

  const indexedValues: { readonly index: number; readonly value: unknown }[] =
    [];
  let safe = true;
  let reportedSymbol = false;

  for (const key of Reflect.ownKeys(descriptors)) {
    if (key === "length") {
      continue;
    }
    if (typeof key === "symbol") {
      if (!reportedSymbol) {
        addValidationIssue(issues, "input-shape", "E-SYMBOL-FIELD", path);
        reportedSymbol = true;
      }
      safe = false;
      continue;
    }

    const fieldPath = childPath(path, key);
    if (UNSAFE_KEYS.has(key)) {
      addValidationIssue(issues, "input-shape", "E-UNSAFE-KEY", fieldPath);
      safe = false;
      continue;
    }
    if (!ARRAY_INDEX.test(key)) {
      addValidationIssue(issues, "input-shape", "E-UNKNOWN-FIELD", fieldPath);
      safe = false;
      continue;
    }

    const index = Number(key);
    if (index > MAX_ARRAY_INDEX) {
      addValidationIssue(issues, "input-shape", "E-UNKNOWN-FIELD", fieldPath);
      safe = false;
      continue;
    }

    const descriptor = descriptors[key];
    if (descriptor === undefined) {
      addValidationIssue(
        issues,
        "input-shape",
        "E-UNSAFE-OBJECT",
        indexPath(path, index),
      );
      safe = false;
      continue;
    }
    if (!("value" in descriptor)) {
      addValidationIssue(
        issues,
        "input-shape",
        "E-ACCESSOR-FIELD",
        indexPath(path, index),
      );
      safe = false;
      continue;
    }
    if (descriptor.enumerable !== true) {
      addValidationIssue(
        issues,
        "input-shape",
        "E-NONENUMERABLE-FIELD",
        indexPath(path, index),
      );
      safe = false;
      continue;
    }
    indexedValues.push({ index, value: descriptor.value });
  }

  indexedValues.sort((left, right) => left.index - right.index);
  const length = lengthDescriptor.value;
  if (
    indexedValues.length !== length ||
    indexedValues.some((entry, position) => entry.index !== position)
  ) {
    addValidationIssue(issues, "input-shape", "E-SPARSE-ARRAY", path);
    safe = false;
  }

  return safe
    ? { values: indexedValues.map((entry) => entry.value) }
    : undefined;
}

export function dataValue(
  record: InspectedRecord | undefined,
  key: string,
): unknown {
  return record?.values.get(key);
}
