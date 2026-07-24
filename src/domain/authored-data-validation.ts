import {
  RECIPE_IDS,
  type RecipeConfiguration,
  type RecipeId,
} from "./configuration";
import type {
  Clause,
  LimitationSpec,
  ModalityRecipe,
  PairDirection,
  PairPack,
  SummaryItemSpec,
} from "./authored";
import { validateClause } from "./clause-validation";
import { validateRecipeConfiguration } from "./configuration-validation";
import {
  languageRegistryRef,
  type CanonicalLanguageRegistry,
  type LanguageProfileRef,
  validateLanguageProfileRef,
  validateLanguageRegistryRef,
} from "./language-identity";
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
    issue(issues, "artifact-identity", "E-EMPTY-STRING", childPath(path, key));
    return undefined;
  }
  return value;
}

function recipeIdValue(
  record: InspectedRecord | undefined,
  path: string,
  issues: ValidationIssue[],
): RecipeId | undefined {
  const value = stringValue(record, "id", path, issues);
  if (
    value !== undefined &&
    !(RECIPE_IDS as readonly string[]).includes(value)
  ) {
    issue(issues, "authored-data", "E-INVALID-ENUM", childPath(path, "id"), {
      value,
    });
    return undefined;
  }
  return value as RecipeId | undefined;
}

function parseArray<T>(
  input: unknown,
  path: string,
  validator: (value: unknown) => ValidationResult<T>,
  issues: ValidationIssue[],
): readonly (T | undefined)[] | undefined {
  const inspected = inspectArray(input, path, issues);
  if (inspected === undefined) {
    return undefined;
  }
  return inspected.values.map((value, index) =>
    collectNestedValidation(validator(value), indexPath(path, index), issues),
  );
}

function rejectDuplicate<T>(
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
    const key = identity(value);
    const firstIndex = firstIndexByIdentity.get(key);
    if (firstIndex === undefined) {
      firstIndexByIdentity.set(key, index);
    } else {
      issue(
        issues,
        "authored-data",
        code,
        `${indexPath(path, index)}.${field}`,
        { [field]: key, firstIndex },
      );
    }
  }
}

function validatedDefaults(
  input: unknown,
  recipeId: RecipeId | undefined,
  recipeVersion: string | undefined,
  registry: CanonicalLanguageRegistry,
  issues: ValidationIssue[],
): ModalityRecipe["defaults"] | undefined {
  const path = "$.defaults";
  const keys = [
    "socialContext",
    "register",
    "ambiguity",
    "codeSwitching",
    "dataHandling",
    "titleHandling",
    "unknownName",
    "destination",
    "settings",
  ] as const;
  const record = inspectRecord(input, path, keys, keys, issues);
  if (
    record === undefined ||
    recipeId === undefined ||
    recipeVersion === undefined
  ) {
    return undefined;
  }

  const homeId = registry.canonicalTags[0];
  const targetId = registry.canonicalTags.find((id) => id !== homeId);
  if (homeId === undefined || targetId === undefined) {
    issue(
      issues,
      "authored-data",
      "E-DEFAULTS-IDENTITY-UNAVAILABLE",
      path,
    );
    return undefined;
  }

  const candidate = {
    schemaVersion: 1,
    languageRegistry: languageRegistryRef(registry),
    recipe: { id: recipeId, version: recipeVersion },
    promptSurface: { id: "defaults-validation", version: "1" },
    languages: {
      home: { id: homeId, version: "defaults-validation" },
      target: { id: targetId, version: "defaults-validation" },
    },
    socialContext: dataValue(record, "socialContext"),
    register: dataValue(record, "register"),
    ambiguity: dataValue(record, "ambiguity"),
    codeSwitching: dataValue(record, "codeSwitching"),
    dataHandling: dataValue(record, "dataHandling"),
    titleHandling: dataValue(record, "titleHandling"),
    unknownName: dataValue(record, "unknownName"),
    destination: dataValue(record, "destination"),
    settings: dataValue(record, "settings"),
  };
  const validated = collectNestedValidation(
    validateRecipeConfiguration(candidate, registry),
    path,
    issues,
  );
  if (validated === undefined) {
    return undefined;
  }

  return {
    socialContext: validated.socialContext,
    register: validated.register,
    ambiguity: validated.ambiguity,
    codeSwitching: validated.codeSwitching,
    dataHandling: validated.dataHandling,
    titleHandling: validated.titleHandling,
    unknownName: validated.unknownName,
    destination: validated.destination,
    settings: validated.settings,
  } as ModalityRecipe["defaults"];
}

export function validateModalityRecipe(
  input: unknown,
  registry: CanonicalLanguageRegistry,
): ValidationResult<ModalityRecipe> {
  const issues: ValidationIssue[] = [];
  const keys = [
    "id",
    "version",
    "settingsSchemaVersion",
    "clauses",
    "summaryItems",
    "defaults",
    "knownLimitations",
  ] as const;
  const root = inspectRecord(input, "$", keys, keys, issues);
  if (root === undefined) {
    return failure(issues);
  }

  const id = recipeIdValue(root, "$", issues);
  const version = stringValue(root, "version", "$", issues);
  const settingsSchemaVersion = dataValue(root, "settingsSchemaVersion");
  if (settingsSchemaVersion !== 1) {
    issue(
      issues,
      typeof settingsSchemaVersion === "number"
        ? "configuration"
        : "input-shape",
      typeof settingsSchemaVersion === "number"
        ? "E-SETTINGS-SCHEMA-VERSION"
        : "E-EXPECTED-SAFE-INTEGER",
      "$.settingsSchemaVersion",
    );
  }

  const clauses = root.values.has("clauses")
    ? parseArray(
        dataValue(root, "clauses"),
        "$.clauses",
        validateClause,
        issues,
      )
    : undefined;
  const summaryItems = root.values.has("summaryItems")
    ? parseArray(
        dataValue(root, "summaryItems"),
        "$.summaryItems",
        validateSummaryItemSpec,
        issues,
      )
    : undefined;
  const limitations = root.values.has("knownLimitations")
    ? parseArray(
        dataValue(root, "knownLimitations"),
        "$.knownLimitations",
        validateLimitationSpec,
        issues,
      )
    : undefined;
  const defaults = root.values.has("defaults")
    ? validatedDefaults(
        dataValue(root, "defaults"),
        id,
        version,
        registry,
        issues,
      )
    : undefined;

  for (const [index, clause] of clauses?.entries() ?? []) {
    if (clause !== undefined && clause.origin !== "recipe") {
      issue(
        issues,
        "authored-data",
        "E-RECIPE-CLAUSE-OWNERSHIP",
        `${indexPath("$.clauses", index)}.origin`,
        { origin: clause.origin },
      );
    }
  }
  rejectDuplicate(
    clauses ?? [],
    "$.clauses",
    "id",
    "E-DUPLICATE-CLAUSE-ID",
    (value: Clause) => value.id,
    issues,
  );
  rejectDuplicate(
    summaryItems ?? [],
    "$.summaryItems",
    "id",
    "E-DUPLICATE-SUMMARY-ID",
    (value: SummaryItemSpec) => value.id,
    issues,
  );
  rejectDuplicate(
    limitations ?? [],
    "$.knownLimitations",
    "code",
    "E-DUPLICATE-LIMITATION-CODE",
    (value: LimitationSpec) => value.code,
    issues,
  );

  if (issues.length > 0) {
    return failure(issues);
  }
  if (
    id === undefined ||
    version === undefined ||
    settingsSchemaVersion !== 1 ||
    clauses === undefined ||
    summaryItems === undefined ||
    defaults === undefined ||
    limitations === undefined ||
    clauses.some((value) => value === undefined) ||
    summaryItems.some((value) => value === undefined) ||
    limitations.some((value) => value === undefined)
  ) {
    issue(issues, "authored-data", "E-VALIDATION-INCOMPLETE", "$");
    return failure(issues);
  }

  return {
    ok: true,
    value: {
      id,
      version,
      settingsSchemaVersion,
      clauses: clauses as Clause[],
      summaryItems: summaryItems as SummaryItemSpec[],
      defaults,
      knownLimitations: limitations as LimitationSpec[],
    },
  };
}

function direction(
  input: unknown,
  path: string,
  registry: CanonicalLanguageRegistry,
  issues: ValidationIssue[],
): PairDirection | undefined {
  const keys = [
    "languageRegistry",
    "home",
    "target",
    "clauses",
    "knownLimitations",
  ] as const;
  const root = inspectRecord(input, path, keys, keys, issues);
  if (root === undefined) {
    return undefined;
  }

  const registryRef = collectNestedValidation(
    validateLanguageRegistryRef(dataValue(root, "languageRegistry"), registry),
    childPath(path, "languageRegistry"),
    issues,
  );
  const home = collectNestedValidation(
    validateLanguageProfileRef(dataValue(root, "home"), registry),
    childPath(path, "home"),
    issues,
  );
  const target = collectNestedValidation(
    validateLanguageProfileRef(dataValue(root, "target"), registry),
    childPath(path, "target"),
    issues,
  );
  if (home !== undefined && target !== undefined && home.id === target.id) {
    issue(
      issues,
      "authored-data",
      "E-IDENTICAL-LANGUAGES",
      path,
      { id: home.id },
    );
  }

  const clauses = root.values.has("clauses")
    ? parseArray(
        dataValue(root, "clauses"),
        childPath(path, "clauses"),
        validateClause,
        issues,
      )
    : undefined;
  const limitations = root.values.has("knownLimitations")
    ? parseArray(
        dataValue(root, "knownLimitations"),
        childPath(path, "knownLimitations"),
        validateLimitationSpec,
        issues,
      )
    : undefined;

  for (const [index, clause] of clauses?.entries() ?? []) {
    if (
      clause !== undefined &&
      (clause.origin !== "pair-pack" || clause.authority !== "pair-pack")
    ) {
      issue(
        issues,
        "authored-data",
        "E-PAIR-CLAUSE-OWNERSHIP",
        `${indexPath(childPath(path, "clauses"), index)}.origin`,
        { authority: clause.authority, origin: clause.origin },
      );
    }
  }
  rejectDuplicate(
    clauses ?? [],
    childPath(path, "clauses"),
    "id",
    "E-DUPLICATE-CLAUSE-ID",
    (value: Clause) => value.id,
    issues,
  );
  rejectDuplicate(
    limitations ?? [],
    childPath(path, "knownLimitations"),
    "code",
    "E-DUPLICATE-LIMITATION-CODE",
    (value: LimitationSpec) => value.code,
    issues,
  );

  if (
    registryRef === undefined ||
    home === undefined ||
    target === undefined ||
    home.id === target.id ||
    clauses === undefined ||
    limitations === undefined ||
    clauses.some((value) => value === undefined) ||
    limitations.some((value) => value === undefined)
  ) {
    return undefined;
  }

  return {
    languageRegistry: registryRef,
    home,
    target,
    clauses: clauses as Clause[],
    knownLimitations: limitations as LimitationSpec[],
  };
}

function directionIdentity(value: PairDirection): string {
  return [
    value.home.id,
    value.home.version,
    value.target.id,
    value.target.version,
  ].join("\u0000");
}

export function validatePairPack(
  input: unknown,
  registry: CanonicalLanguageRegistry,
): ValidationResult<PairPack> {
  const issues: ValidationIssue[] = [];
  const root = inspectRecord(
    input,
    "$",
    ["id", "version", "directions"],
    ["id", "version", "directions"],
    issues,
  );
  if (root === undefined) {
    return failure(issues);
  }

  const id = stringValue(root, "id", "$", issues);
  const version = stringValue(root, "version", "$", issues);
  const inspectedDirections = root.values.has("directions")
    ? inspectArray(dataValue(root, "directions"), "$.directions", issues)
    : undefined;
  if (inspectedDirections?.values.length === 0) {
    issue(issues, "authored-data", "E-EMPTY-PAIR-DIRECTIONS", "$.directions");
  }
  const directions =
    inspectedDirections?.values.map((value, index) =>
      direction(
        value,
        indexPath("$.directions", index),
        registry,
        issues,
      ),
    ) ?? [];
  rejectDuplicate(
    directions,
    "$.directions",
    "home",
    "E-DUPLICATE-PAIR-DIRECTION",
    directionIdentity,
    issues,
  );

  if (issues.length > 0) {
    return failure(issues);
  }
  if (
    id === undefined ||
    version === undefined ||
    inspectedDirections === undefined ||
    directions.some((value) => value === undefined)
  ) {
    issue(issues, "authored-data", "E-VALIDATION-INCOMPLETE", "$");
    return failure(issues);
  }

  return {
    ok: true,
    value: {
      id,
      version,
      directions: directions as PairDirection[],
    },
  };
}

export function recipeDefaultsFor(
  recipe: ModalityRecipe,
): Omit<
  RecipeConfiguration,
  | "schemaVersion"
  | "languageRegistry"
  | "recipe"
  | "promptSurface"
  | "languages"
> {
  return recipe.defaults;
}

export function sameProfileRef(
  left: LanguageProfileRef,
  right: LanguageProfileRef,
): boolean {
  return left.id === right.id && left.version === right.version;
}
