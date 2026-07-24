import {
  RECIPE_IDS,
  type RecipeConfiguration,
  type RecipeId,
} from "./configuration";
import type {
  CompilerCatalog,
  DefaultSelection,
} from "./catalog";
import { validateModalityRecipe } from "./authored-data-validation";
import { validateRecipeConfiguration } from "./configuration-validation";
import {
  sameLanguageRegistryRef,
  validateCanonicalLanguageId,
} from "./language-identity";
import { collectNestedValidation } from "./nested-validation";
import { compareValidationIssues } from "./primitives";
import type {
  ValidationIssue,
  ValidationResult,
} from "./results";
import {
  addValidationIssue as issue,
  dataValue,
  inspectRecord,
} from "./validation-input";

function failure(issues: ValidationIssue[]): ValidationResult<never> {
  return { ok: false, issues: [...issues].sort(compareValidationIssues) };
}

function selectionRecipeId(
  value: unknown,
  issues: ValidationIssue[],
): RecipeId | undefined {
  if (typeof value !== "string") {
    issue(issues, "input-shape", "E-EXPECTED-STRING", "$.recipeId");
    return undefined;
  }
  if (!(RECIPE_IDS as readonly string[]).includes(value)) {
    issue(issues, "configuration", "E-INVALID-ENUM", "$.recipeId", { value });
    return undefined;
  }
  return value as RecipeId;
}

function exactlyOne<T>(
  values: readonly T[],
  path: string,
  missingCode: string,
  ambiguousCode: string,
  issues: ValidationIssue[],
): T | undefined {
  if (values.length === 0) {
    issue(issues, "artifact-identity", missingCode, path);
    return undefined;
  }
  if (values.length > 1) {
    issue(issues, "artifact-identity", ambiguousCode, path, {
      count: values.length,
    });
    return undefined;
  }
  return values[0];
}

export function materializeSelection(
  input: unknown,
  catalog: CompilerCatalog,
): ValidationResult<RecipeConfiguration> {
  const issues: ValidationIssue[] = [];
  const root = inspectRecord(
    input,
    "$",
    ["homeLanguageId", "targetLanguageId", "recipeId"],
    ["homeLanguageId", "targetLanguageId", "recipeId"],
    issues,
  );
  if (root === undefined) {
    return failure(issues);
  }

  const homeId = collectNestedValidation(
    validateCanonicalLanguageId(
      dataValue(root, "homeLanguageId"),
      catalog.languageRegistry,
    ),
    "$.homeLanguageId",
    issues,
  );
  const targetId = collectNestedValidation(
    validateCanonicalLanguageId(
      dataValue(root, "targetLanguageId"),
      catalog.languageRegistry,
    ),
    "$.targetLanguageId",
    issues,
  );
  const recipeId = selectionRecipeId(dataValue(root, "recipeId"), issues);

  if (homeId !== undefined && homeId === targetId) {
    issue(
      issues,
      "configuration",
      "E-IDENTICAL-LANGUAGES",
      "$.targetLanguageId",
      { id: homeId },
    );
  }
  if (
    !sameLanguageRegistryRef(
      catalog.manifest.languageRegistry,
      catalog.languageRegistry,
    )
  ) {
    issue(
      issues,
      "artifact-identity",
      "E-LANGUAGE-REGISTRY-VERSION",
      "$catalog.manifest.languageRegistry",
    );
  }

  const homeRef =
    homeId === undefined
      ? undefined
      : exactlyOne(
          catalog.manifest.profiles.filter((profile) => profile.id === homeId),
          "$catalog.manifest.profiles",
          "E-PROFILE-NOT-ACTIVE",
          "E-PROFILE-ACTIVE-AMBIGUOUS",
          issues,
        );
  const targetRef =
    targetId === undefined
      ? undefined
      : exactlyOne(
          catalog.manifest.profiles.filter(
            (profile) => profile.id === targetId,
          ),
          "$catalog.manifest.profiles",
          "E-PROFILE-NOT-ACTIVE",
          "E-PROFILE-ACTIVE-AMBIGUOUS",
          issues,
        );
  const recipeRef =
    recipeId === undefined
      ? undefined
      : exactlyOne(
          catalog.manifest.recipes.filter((recipe) => recipe.id === recipeId),
          "$catalog.manifest.recipes",
          "E-RECIPE-NOT-ACTIVE",
          "E-RECIPE-ACTIVE-AMBIGUOUS",
          issues,
        );
  const recipe =
    recipeRef === undefined
      ? undefined
      : exactlyOne(
          catalog.recipes.filter(
            (candidate) =>
              candidate.id === recipeRef.id &&
              candidate.version === recipeRef.version,
          ),
          "$catalog.recipes",
          "E-RECIPE-NOT-FOUND",
          "E-RECIPE-AMBIGUOUS",
          issues,
        );
  const validatedRecipe =
    recipe === undefined
      ? undefined
      : collectNestedValidation(
          validateModalityRecipe(recipe, catalog.languageRegistry),
          "$catalog.recipes",
          issues,
        );

  if (
    issues.length > 0 ||
    homeRef === undefined ||
    targetRef === undefined ||
    recipeRef === undefined ||
    validatedRecipe === undefined
  ) {
    return failure(issues);
  }

  const candidate = {
    schemaVersion: 1,
    languageRegistry: catalog.manifest.languageRegistry,
    recipe: recipeRef,
    promptSurface: catalog.manifest.promptSurface,
    languages: { home: homeRef, target: targetRef },
    ...validatedRecipe.defaults,
  };

  return validateRecipeConfiguration(candidate, catalog.languageRegistry);
}

export function isDefaultSelection(value: unknown): value is DefaultSelection {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.homeLanguageId === "string" &&
    typeof record.targetLanguageId === "string" &&
    typeof record.recipeId === "string" &&
    (RECIPE_IDS as readonly string[]).includes(record.recipeId)
  );
}
