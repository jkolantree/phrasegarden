import type {
  CompilerInputs,
  LanguageProfile,
  PairDirection,
  PairPack,
  SummaryCatalog,
} from "./authored";
import {
  validateModalityRecipe,
  validatePairPack,
} from "./authored-data-validation";
import type { CompilerCatalog } from "./catalog";
import { validateCompilerPolicy } from "./compiler-policy-validation";
import type { RecipeConfiguration, VersionRef } from "./configuration";
import { validateRecipeConfiguration } from "./configuration-validation";
import { validateLanguageProfile } from "./language-profile-validation";
import {
  sameLanguageRegistryRef,
  type LanguageProfileRef,
} from "./language-identity";
import { collectNestedValidation } from "./nested-validation";
import {
  compareValidationIssues,
  sameVersionRef,
} from "./primitives";
import { validatePromptSurface } from "./prompt-surface-validation";
import type {
  ValidationIssue,
  ValidationResult,
} from "./results";
import { validateSummaryCatalog } from "./summary-catalog-validation";
import { addValidationIssue as issue } from "./validation-input";

export interface ResolvedCompilerArtifacts {
  readonly inputs: CompilerInputs;
  readonly summaryCatalog: SummaryCatalog;
}

function failure(issues: ValidationIssue[]): ValidationResult<never> {
  return { ok: false, issues: [...issues].sort(compareValidationIssues) };
}

function resolveExactlyOne<T>(
  candidates: readonly T[],
  path: string,
  missingCode: string,
  ambiguousCode: string,
  issues: ValidationIssue[],
): T | undefined {
  if (candidates.length === 0) {
    issue(issues, "artifact-identity", missingCode, path);
    return undefined;
  }
  if (candidates.length > 1) {
    issue(issues, "artifact-identity", ambiguousCode, path, {
      count: candidates.length,
    });
    return undefined;
  }
  return candidates[0];
}

function profileMatchesRef(
  profile: LanguageProfile,
  reference: LanguageProfileRef,
): boolean {
  return profile.id === reference.id && profile.version === reference.version;
}

function directionMatchesConfiguration(
  direction: PairDirection,
  configuration: RecipeConfiguration,
): boolean {
  return (
    direction.home.id === configuration.languages.home.id &&
    direction.home.version === configuration.languages.home.version &&
    direction.target.id === configuration.languages.target.id &&
    direction.target.version === configuration.languages.target.version
  );
}

function sameDirectionIds(
  direction: PairDirection,
  configuration: RecipeConfiguration,
): boolean {
  return (
    direction.home.id === configuration.languages.home.id &&
    direction.target.id === configuration.languages.target.id
  );
}

function activeProfileRef(
  reference: LanguageProfileRef,
  catalog: CompilerCatalog,
): boolean {
  return catalog.manifest.profiles.some(
    (active) =>
      active.id === reference.id && active.version === reference.version,
  );
}

function activeRecipeRef(
  reference: VersionRef,
  catalog: CompilerCatalog,
): boolean {
  return catalog.manifest.recipes.some((active) =>
    sameVersionRef(active, reference),
  );
}

function validateManifestBindings(
  configuration: RecipeConfiguration,
  catalog: CompilerCatalog,
  issues: ValidationIssue[],
): void {
  if (
    !sameLanguageRegistryRef(
      configuration.languageRegistry,
      catalog.manifest.languageRegistry,
    ) ||
    !sameLanguageRegistryRef(
      catalog.manifest.languageRegistry,
      catalog.languageRegistry,
    )
  ) {
    issue(
      issues,
      "artifact-identity",
      "E-LANGUAGE-REGISTRY-VERSION",
      "$.languageRegistry",
    );
  }
  if (!activeProfileRef(configuration.languages.home, catalog)) {
    issue(
      issues,
      "artifact-identity",
      "E-PROFILE-VERSION",
      "$.languages.home.version",
      {
        id: configuration.languages.home.id,
        version: configuration.languages.home.version,
      },
    );
  }
  if (!activeProfileRef(configuration.languages.target, catalog)) {
    issue(
      issues,
      "artifact-identity",
      "E-PROFILE-VERSION",
      "$.languages.target.version",
      {
        id: configuration.languages.target.id,
        version: configuration.languages.target.version,
      },
    );
  }
  if (!activeRecipeRef(configuration.recipe, catalog)) {
    issue(
      issues,
      "artifact-identity",
      "E-RECIPE-VERSION",
      "$.recipe.version",
      {
        id: configuration.recipe.id,
        version: configuration.recipe.version,
      },
    );
  }
  if (
    !sameVersionRef(
      configuration.promptSurface,
      catalog.manifest.promptSurface,
    )
  ) {
    issue(
      issues,
      "artifact-identity",
      "E-PROMPT-SURFACE-VERSION",
      "$.promptSurface",
    );
  }
}

function validatedPairPacks(
  catalog: CompilerCatalog,
  issues: ValidationIssue[],
): readonly PairPack[] {
  const packs: PairPack[] = [];
  for (const [index, pack] of catalog.pairPacks.entries()) {
    const validated = collectNestedValidation(
      validatePairPack(pack, catalog.languageRegistry),
      `$catalog.pairPacks[${index}]`,
      issues,
    );
    if (validated !== undefined) {
      packs.push(validated);
    }
  }
  return packs;
}

function resolvePairPack(
  configuration: RecipeConfiguration,
  packs: readonly PairPack[],
  issues: ValidationIssue[],
): PairPack | null {
  const matches: PairPack[] = [];
  for (const pack of packs) {
    const matchingDirections = pack.directions.filter((direction) =>
      directionMatchesConfiguration(direction, configuration),
    );
    if (matchingDirections.length > 1) {
      issue(
        issues,
        "pair-resolution",
        "E-PAIR-DIRECTION-AMBIGUOUS",
        "$catalog.pairPacks",
        { pairPackId: pack.id, count: matchingDirections.length },
      );
    } else if (matchingDirections.length === 1) {
      matches.push(pack);
    }

    const sameIds = pack.directions.filter((direction) =>
      sameDirectionIds(direction, configuration),
    );
    if (
      matchingDirections.length === 0 &&
      sameIds.length > 0
    ) {
      issue(
        issues,
        "pair-resolution",
        "E-PAIR-PROFILE-VERSION",
        "$.languages",
        { pairPackId: pack.id },
      );
    }
  }

  if (matches.length > 1) {
    issue(
      issues,
      "pair-resolution",
      "E-PAIR-AMBIGUOUS",
      "$catalog.pairPacks",
      { count: matches.length },
    );
    return null;
  }
  return matches[0] ?? null;
}

export function resolveCompilerArtifacts(
  input: unknown,
  catalog: CompilerCatalog,
): ValidationResult<ResolvedCompilerArtifacts> {
  const issues: ValidationIssue[] = [];
  const configuration = collectNestedValidation(
    validateRecipeConfiguration(input, catalog.languageRegistry),
    "$",
    issues,
  );
  if (configuration === undefined) {
    return failure(issues);
  }

  validateManifestBindings(configuration, catalog, issues);

  const rawHome = resolveExactlyOne(
    catalog.profiles.filter((profile) =>
      profileMatchesRef(profile, configuration.languages.home),
    ),
    "$catalog.profiles",
    "E-HOME-PROFILE-NOT-FOUND",
    "E-HOME-PROFILE-AMBIGUOUS",
    issues,
  );
  const rawTarget = resolveExactlyOne(
    catalog.profiles.filter((profile) =>
      profileMatchesRef(profile, configuration.languages.target),
    ),
    "$catalog.profiles",
    "E-TARGET-PROFILE-NOT-FOUND",
    "E-TARGET-PROFILE-AMBIGUOUS",
    issues,
  );
  const rawRecipe = resolveExactlyOne(
    catalog.recipes.filter(
      (recipe) =>
        recipe.id === configuration.recipe.id &&
        recipe.version === configuration.recipe.version,
    ),
    "$catalog.recipes",
    "E-RECIPE-NOT-FOUND",
    "E-RECIPE-AMBIGUOUS",
    issues,
  );
  const rawSurface = resolveExactlyOne(
    catalog.promptSurfaces.filter((surface) =>
      sameVersionRef(surface, configuration.promptSurface),
    ),
    "$catalog.promptSurfaces",
    "E-PROMPT-SURFACE-NOT-FOUND",
    "E-PROMPT-SURFACE-AMBIGUOUS",
    issues,
  );
  const rawPolicy = resolveExactlyOne(
    catalog.compilerPolicies.filter(
      (policy) =>
        policy.version === catalog.manifest.compilerPolicyVersion,
    ),
    "$catalog.compilerPolicies",
    "E-COMPILER-POLICY-NOT-FOUND",
    "E-COMPILER-POLICY-AMBIGUOUS",
    issues,
  );
  const rawSummaryCatalog = resolveExactlyOne(
    catalog.summaryCatalogs.filter(
      (summary) =>
        summary.locale === catalog.manifest.summaryCatalog.locale &&
        summary.version === catalog.manifest.summaryCatalog.version,
    ),
    "$catalog.summaryCatalogs",
    "E-SUMMARY-CATALOG-NOT-FOUND",
    "E-SUMMARY-CATALOG-AMBIGUOUS",
    issues,
  );

  const home =
    rawHome === undefined
      ? undefined
      : collectNestedValidation(
          validateLanguageProfile(rawHome, catalog.languageRegistry),
          "$catalog.profiles",
          issues,
        );
  const target =
    rawTarget === undefined
      ? undefined
      : collectNestedValidation(
          validateLanguageProfile(rawTarget, catalog.languageRegistry),
          "$catalog.profiles",
          issues,
        );
  const recipe =
    rawRecipe === undefined
      ? undefined
      : collectNestedValidation(
          validateModalityRecipe(rawRecipe, catalog.languageRegistry),
          "$catalog.recipes",
          issues,
        );
  const promptSurface =
    rawSurface === undefined
      ? undefined
      : collectNestedValidation(
          validatePromptSurface(rawSurface),
          "$catalog.promptSurfaces",
          issues,
        );
  const policy =
    rawPolicy === undefined
      ? undefined
      : collectNestedValidation(
          validateCompilerPolicy(rawPolicy),
          "$catalog.compilerPolicies",
          issues,
        );
  const summaryCatalog =
    rawSummaryCatalog === undefined
      ? undefined
      : collectNestedValidation(
          validateSummaryCatalog(rawSummaryCatalog),
          "$catalog.summaryCatalogs",
          issues,
        );

  if (
    policy !== undefined &&
    policy.compatibleCompilerVersion !== catalog.manifest.compilerVersion
  ) {
    issue(
      issues,
      "artifact-identity",
      "E-COMPILER-POLICY-COMPATIBILITY",
      "$catalog.compilerPolicies",
      {
        actualCompilerVersion: catalog.manifest.compilerVersion,
        expectedCompilerVersion: policy.compatibleCompilerVersion,
      },
    );
  }
  if (
    recipe !== undefined &&
    (recipe.id !== configuration.recipe.id ||
      recipe.settingsSchemaVersion !== configuration.schemaVersion)
  ) {
    issue(
      issues,
      "artifact-identity",
      "E-RECIPE-COMPATIBILITY",
      "$.recipe",
    );
  }

  const packs = validatedPairPacks(catalog, issues);
  const pairPack = resolvePairPack(configuration, packs, issues);

  if (issues.length > 0) {
    return failure(issues);
  }
  if (
    home === undefined ||
    target === undefined ||
    recipe === undefined ||
    promptSurface === undefined ||
    policy === undefined ||
    summaryCatalog === undefined
  ) {
    issue(issues, "artifact-identity", "E-RESOLUTION-INCOMPLETE", "$");
    return failure(issues);
  }

  return {
    ok: true,
    value: {
      inputs: {
        compilerVersion: catalog.manifest.compilerVersion,
        languageRegistry: catalog.languageRegistry,
        policy,
        configuration,
        recipe,
        homeProfile: home,
        targetProfile: target,
        pairPack,
        promptSurface,
      },
      summaryCatalog,
    },
  };
}
