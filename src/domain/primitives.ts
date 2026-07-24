import type {
  Clause,
  ClauseCondition,
  ConditionPath,
  LimitationSpec,
  ResolvedConditionContext,
  SummaryItemSpec,
} from "./authored";
import type { RecipeConfiguration, VersionRef } from "./configuration";
import {
  VALIDATION_STAGE_ORDINAL,
  type CompilerWarning,
  type ValidationIssue,
} from "./results";

export const PROMPT_BUDGET_WARNING_BYTES = 9_000;
export const PROMPT_BUDGET_HARD_LIMIT_BYTES = 12_000;

export function compareCodeUnits(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}

export function sameVersionRef(left: VersionRef, right: VersionRef): boolean {
  return left.id === right.id && left.version === right.version;
}

export function compareVersionRefs(left: VersionRef, right: VersionRef): number {
  return (
    compareCodeUnits(left.id, right.id) ||
    compareCodeUnits(left.version, right.version)
  );
}

export function isStrictlyCodeUnitSorted(values: readonly string[]): boolean {
  for (let index = 1; index < values.length; index += 1) {
    const previous = values[index - 1];
    const current = values[index];
    if (
      previous === undefined ||
      current === undefined ||
      compareCodeUnits(previous, current) >= 0
    ) {
      return false;
    }
  }
  return true;
}

export function isClauseConditionWellFormed(
  condition: ClauseCondition,
): boolean {
  if (condition.op === "in") {
    return (
      condition.values.length > 0 &&
      condition.values.every((value) => value.length > 0) &&
      isStrictlyCodeUnitSorted(condition.values)
    );
  }
  if (condition.op === "eq") {
    return condition.value.length > 0;
  }
  return condition.path === "resolved.pairPack";
}

export function conditionValueAt(
  configuration: RecipeConfiguration,
  resolved: ResolvedConditionContext,
  path: ConditionPath,
): string | undefined {
  switch (path) {
    case "recipe.id":
      return configuration.recipe.id;
    case "languages.home.id":
      return configuration.languages.home.id;
    case "languages.target.id":
      return configuration.languages.target.id;
    case "socialContext.relationship":
      return configuration.socialContext.relationship;
    case "socialContext.hierarchy":
      return configuration.socialContext.hierarchy;
    case "register.strategy":
      return configuration.register.strategy;
    case "register.level":
      return configuration.register.strategy === "adapt"
        ? configuration.register.level
        : undefined;
    case "ambiguity":
      return configuration.ambiguity;
    case "codeSwitching":
      return configuration.codeSwitching;
    case "dataHandling.strategy":
      return configuration.dataHandling.strategy;
    case "titleHandling":
      return configuration.titleHandling;
    case "unknownName":
      return configuration.unknownName;
    case "destination.userEvidence":
      return configuration.destination.userEvidence;
    case "destination.assistantOutput":
      return configuration.destination.assistantOutput;
    case "destination.interruptionSignal":
      return configuration.destination.interruptionSignal;
    case "destination.silenceSignal":
      return configuration.destination.silenceSignal;
    case "destination.playbackRateControl":
      return configuration.destination.playbackRateControl;
    case "settings.modality":
      return configuration.settings.modality;
    case "settings.outputDetail":
      return configuration.settings.modality === "written"
        ? configuration.settings.outputDetail
        : undefined;
    case "settings.correction.timing":
      return configuration.settings.modality === "live-voice"
        ? configuration.settings.correction.timing
        : undefined;
    case "settings.correction.focus":
      return configuration.settings.modality === "live-voice"
        ? configuration.settings.correction.focus
        : undefined;
    case "settings.pronunciation":
      return configuration.settings.modality === "live-voice"
        ? configuration.settings.pronunciation
        : undefined;
    case "settings.teachingDepth":
      return configuration.settings.modality === "live-voice"
        ? configuration.settings.teachingDepth
        : undefined;
    case "settings.pace":
      return configuration.settings.modality === "live-voice"
        ? configuration.settings.pace
        : undefined;
    case "settings.turnMode":
      return configuration.settings.modality === "interpreting"
        ? configuration.settings.turnMode
        : undefined;
    case "settings.clarification":
      return configuration.settings.modality === "interpreting"
        ? configuration.settings.clarification
        : undefined;
    case "resolved.supportTier":
      return resolved.supportTier;
    case "resolved.pairPack":
      return resolved.pairPack;
  }
}

export function evaluateClauseCondition(
  condition: ClauseCondition,
  configuration: RecipeConfiguration,
  resolved: ResolvedConditionContext,
): boolean {
  if (!isClauseConditionWellFormed(condition)) {
    return false;
  }

  if (condition.op === "present") {
    return resolved.pairPack === "present";
  }
  if (condition.op === "absent") {
    return resolved.pairPack === "absent";
  }

  const actual = conditionValueAt(configuration, resolved, condition.path);
  if (actual === undefined) {
    return false;
  }

  if (condition.op === "eq") {
    return actual === condition.value;
  }
  if (condition.op === "in") {
    return condition.values.includes(actual);
  }
  return false;
}

export function matchesAllConditions(
  conditions: readonly ClauseCondition[],
  configuration: RecipeConfiguration,
  resolved: ResolvedConditionContext,
): boolean {
  return conditions.every((condition) =>
    evaluateClauseCondition(condition, configuration, resolved),
  );
}

export function compareClauseOrder(left: Clause, right: Clause): number {
  return (
    left.section - right.section ||
    left.order - right.order ||
    compareCodeUnits(left.id, right.id)
  );
}

export function compareSummaryOrder(
  left: SummaryItemSpec,
  right: SummaryItemSpec,
): number {
  return left.order - right.order || compareCodeUnits(left.id, right.id);
}

export function compareLimitationOrder(
  left: LimitationSpec,
  right: LimitationSpec,
): number {
  return left.order - right.order || compareCodeUnits(left.code, right.code);
}

export function compareWarningCode(
  left: CompilerWarning,
  right: CompilerWarning,
): number {
  return compareCodeUnits(left.code, right.code);
}

export function compareValidationIssues(
  left: ValidationIssue,
  right: ValidationIssue,
): number {
  return (
    VALIDATION_STAGE_ORDINAL[left.stage] -
      VALIDATION_STAGE_ORDINAL[right.stage] ||
    compareCodeUnits(left.code, right.code) ||
    compareCodeUnits(left.path, right.path)
  );
}

export function utf8ByteLength(value: string): number {
  let bytes = 0;

  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);

    if (codeUnit <= 0x7f) {
      bytes += 1;
    } else if (codeUnit <= 0x7ff) {
      bytes += 2;
    } else if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        bytes += 4;
        index += 1;
      } else {
        bytes += 3;
      }
    } else {
      bytes += 3;
    }
  }

  return bytes;
}

export type PromptBudgetState = "within-budget" | "warning" | "over-limit";

export function promptBudgetState(byteLength: number): PromptBudgetState {
  if (byteLength > PROMPT_BUDGET_HARD_LIMIT_BYTES) {
    return "over-limit";
  }
  if (byteLength > PROMPT_BUDGET_WARNING_BYTES) {
    return "warning";
  }
  return "within-budget";
}
