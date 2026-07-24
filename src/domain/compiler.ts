import type {
  Authority,
  Clause,
  ClauseSection,
  CompilerInputs,
  LimitationSpec,
  RenderPart,
  RenderValuePath,
  ResolvedConditionContext,
  SummaryCatalog,
  SummaryItemSpec,
} from "./authored";
import { resolveCompilerArtifacts } from "./artifact-resolution";
import type { CompilerCatalog } from "./catalog";
import type {
  ConditionPath,
} from "./authored";
import {
  compareClauseOrder,
  compareLimitationOrder,
  compareSummaryOrder,
  compareValidationIssues,
  compareWarningCode,
  conditionValueAt,
  matchesAllConditions,
  promptBudgetState,
  utf8ByteLength,
} from "./primitives";
import type {
  ArtifactProvenance,
  CompileResult,
  CompilerWarning,
  RenderedSummary,
  ValidationIssue,
  ValidationResult,
} from "./results";
import { validateSummaryCatalog } from "./summary-catalog-validation";
import { addValidationIssue as issue } from "./validation-input";

const SECTION_HEADING_KEY: Readonly<Record<ClauseSection, string>> = {
  1: "section.1.heading",
  2: "section.2.heading",
  3: "section.3.heading",
  4: "section.4.heading",
  5: "section.5.heading",
  6: "section.6.heading",
  7: "section.7.heading",
  8: "section.8.heading",
  9: "section.9.heading",
  10: "section.10.heading",
};

const AUTHORITY_RANK: Readonly<Record<Authority, number>> = {
  invariant: 1,
  "normalized-setting": 2,
  modality: 3,
  "pair-pack": 4,
  profile: 5,
  fallback: 6,
};

interface RenderContext {
  readonly inputs: CompilerInputs;
  readonly resolved: ResolvedConditionContext;
  readonly provenance: ArtifactProvenance;
}

function failure(issues: ValidationIssue[]): ValidationResult<never> {
  return { ok: false, issues: [...issues].sort(compareValidationIssues) };
}

function supportDirection(inputs: CompilerInputs): string {
  const { home, target } = inputs.configuration.languages;
  return `${home.id}@${home.version}→${target.id}@${target.version}`;
}

function pairDirection(inputs: CompilerInputs): {
  readonly clauses: readonly Clause[];
  readonly knownLimitations: readonly LimitationSpec[];
} | null {
  if (inputs.pairPack === null) {
    return null;
  }
  const { home, target } = inputs.configuration.languages;
  const matches = inputs.pairPack.directions.filter(
    (direction) =>
      direction.home.id === home.id &&
      direction.home.version === home.version &&
      direction.target.id === target.id &&
      direction.target.version === target.version,
  );
  return matches.length === 1 ? matches[0] ?? null : null;
}

function renderValue(
  path: RenderValuePath,
  context: RenderContext,
): string | undefined {
  const { inputs, provenance } = context;
  switch (path) {
    case "compiler.version":
      return provenance.compilerVersion;
    case "compiler.policyVersion":
      return provenance.compilerPolicyVersion;
    case "schema.version":
      return String(provenance.schemaVersion);
    case "languageRegistry.version":
      return provenance.languageRegistry.version;
    case "languageRegistry.contentSha256":
      return provenance.languageRegistry.contentSha256;
    case "recipe.id":
      return provenance.recipe.id;
    case "recipe.version":
      return provenance.recipe.version;
    case "home.id":
      return provenance.homeProfile.id;
    case "home.version":
      return provenance.homeProfile.version;
    case "home.autonym":
      return inputs.homeProfile.autonym;
    case "target.id":
      return provenance.targetProfile.id;
    case "target.version":
      return provenance.targetProfile.version;
    case "target.autonym":
      return inputs.targetProfile.autonym;
    case "pairPack.id-or-none":
      return provenance.pairPack === "none"
        ? "none"
        : provenance.pairPack.id;
    case "pairPack.version-or-none":
      return provenance.pairPack === "none"
        ? "none"
        : provenance.pairPack.version;
    case "support.tier":
      return provenance.supportTier;
    case "support.direction":
      return provenance.supportDirection;
    case "support.review-status":
      return provenance.supportReviewStatus;
    case "support.review-date":
      return provenance.supportReviewDate;
    case "promptSurface.id":
      return provenance.promptSurface.id;
    case "promptSurface.locale":
      return provenance.promptSurface.locale;
    case "promptSurface.version":
      return provenance.promptSurface.version;
  }
}

function renderPart(
  part: RenderPart,
  context: RenderContext,
  path: string,
  issues: ValidationIssue[],
): string {
  if (part.kind === "literal") {
    if (part.text.includes("\r")) {
      issue(
        issues,
        "rendering",
        "E-NONCANONICAL-LINE-ENDINGS",
        path,
      );
    }
    return part.text;
  }
  const value = renderValue(part.path, context);
  if (value === undefined) {
    issue(issues, "rendering", "E-UNRESOLVED-RENDER-VALUE", path, {
      valuePath: part.path,
    });
    return "";
  }
  return part.format === "inline-code" ? `\`${value}\`` : value;
}

function renderKey(
  key: string,
  context: RenderContext,
  issues: ValidationIssue[],
): string {
  const matches = context.inputs.promptSurface.renderings.filter(
    (rendering) => rendering.key === key,
  );
  if (matches.length === 0) {
    issue(issues, "rendering", "E-RENDERING-KEY-MISSING", key);
    return "";
  }
  if (matches.length > 1) {
    issue(issues, "rendering", "E-RENDERING-KEY-AMBIGUOUS", key, {
      count: matches.length,
    });
    return "";
  }
  return (matches[0]?.parts ?? [])
    .map((part, index) =>
      renderPart(part, context, `${key}.parts[${index}]`, issues),
    )
    .join("");
}

function validateSelectedClauses(
  clauses: readonly Clause[],
  issues: ValidationIssue[],
): void {
  const firstById = new Map<string, Clause>();
  const firstByOrder = new Map<string, Clause>();
  const firstByEffect = new Map<string, Clause>();

  for (const clause of clauses) {
    const sameId = firstById.get(clause.id);
    if (sameId !== undefined) {
      issue(issues, "selection", "E-DUPLICATE-CLAUSE-ID", clause.id, {
        firstId: sameId.id,
      });
    } else {
      firstById.set(clause.id, clause);
    }

    const orderKey = `${clause.section}\u0000${clause.order}`;
    const sameOrder = firstByOrder.get(orderKey);
    if (sameOrder !== undefined) {
      issue(
        issues,
        "selection",
        "E-DUPLICATE-SELECTED-ORDER",
        clause.id,
        {
          firstId: sameOrder.id,
          order: clause.order,
          section: clause.section,
        },
      );
    } else {
      firstByOrder.set(orderKey, clause);
    }

    const sameEffect = firstByEffect.get(clause.effect.key);
    if (sameEffect !== undefined) {
      issue(
        issues,
        "selection",
        sameEffect.effect.value === clause.effect.value
          ? "E-REPEATED-EFFECT"
          : "E-CONFLICTING-EFFECT",
        clause.id,
        {
          effectKey: clause.effect.key,
          firstId: sameEffect.id,
        },
      );
    } else {
      firstByEffect.set(clause.effect.key, clause);
    }
  }

  for (const clause of clauses) {
    for (const [index, refinement] of (clause.refines ?? []).entries()) {
      const path = `${clause.id}.refines[${index}]`;
      if (refinement.key === clause.effect.key) {
        issue(issues, "selection", "E-SELF-REFINEMENT", path);
        continue;
      }
      const target = firstByEffect.get(refinement.key);
      if (target === undefined) {
        issue(issues, "selection", "E-REFINEMENT-TARGET-MISSING", path, {
          effectKey: refinement.key,
        });
        continue;
      }
      if (
        AUTHORITY_RANK[clause.authority] <=
        AUTHORITY_RANK[target.authority]
      ) {
        issue(issues, "selection", "E-REFINEMENT-AUTHORITY", path, {
          authority: clause.authority,
          targetAuthority: target.authority,
        });
      }
      if (
        refinement.value !== undefined &&
        refinement.value !== target.effect.value
      ) {
        issue(issues, "selection", "E-REFINEMENT-VALUE", path, {
          actualValue: target.effect.value,
          expectedValue: refinement.value,
        });
      }
    }
  }
}

function validateSelectedLimitations(
  limitations: readonly LimitationSpec[],
  clauses: readonly Clause[],
  issues: ValidationIssue[],
): void {
  const codes = new Map<string, LimitationSpec>();
  const orders = new Map<number, LimitationSpec>();
  const clauseSectionNineOrders = new Set(
    clauses.filter((clause) => clause.section === 9).map((clause) => clause.order),
  );
  for (const limitation of limitations) {
    if (codes.has(limitation.code)) {
      issue(
        issues,
        "selection",
        "E-DUPLICATE-LIMITATION-CODE",
        limitation.code,
      );
    } else {
      codes.set(limitation.code, limitation);
    }
    if (
      orders.has(limitation.order) ||
      clauseSectionNineOrders.has(limitation.order)
    ) {
      issue(
        issues,
        "selection",
        "E-DUPLICATE-LIMITATION-ORDER",
        limitation.code,
        { order: limitation.order },
      );
    } else {
      orders.set(limitation.order, limitation);
    }
  }
}

function selectedSummaryItems(
  specs: readonly SummaryItemSpec[],
  inputs: CompilerInputs,
  resolved: ResolvedConditionContext,
  context: RenderContext,
  issues: ValidationIssue[],
): CompileResult["summaryItems"] {
  const selected = specs
    .filter((item) =>
      matchesAllConditions(item.whenAll, inputs.configuration, resolved),
    )
    .sort(compareSummaryOrder);
  const ids = new Set<string>();
  const orders = new Set<number>();
  const output: {
    id: string;
    values: Readonly<Record<string, string>>;
  }[] = [];

  for (const item of selected) {
    if (ids.has(item.id)) {
      issue(issues, "selection", "E-DUPLICATE-SUMMARY-ID", item.id);
    }
    if (orders.has(item.order)) {
      issue(issues, "selection", "E-DUPLICATE-SUMMARY-ORDER", item.id, {
        order: item.order,
      });
    }
    ids.add(item.id);
    orders.add(item.order);

    const values: [string, string][] = [];
    for (const [name, valuePath] of Object.entries(item.values)) {
      const value = (valuePath as string).startsWith("resolved.") ||
        (valuePath as string).startsWith("settings.") ||
        (valuePath as string).startsWith("languages.") ||
        (valuePath as string).startsWith("socialContext.") ||
        [
          "recipe.id",
          "register.strategy",
          "register.level",
          "ambiguity",
          "codeSwitching",
          "dataHandling.strategy",
          "titleHandling",
          "unknownName",
          "destination.userEvidence",
          "destination.assistantOutput",
          "destination.interruptionSignal",
          "destination.silenceSignal",
          "destination.playbackRateControl",
        ].includes(valuePath as string)
        ? conditionValueAt(
            inputs.configuration,
            resolved,
            valuePath as ConditionPath,
          )
        : renderValue(valuePath as RenderValuePath, context);
      if (value === undefined) {
        issue(issues, "rendering", "E-SUMMARY-VALUE-UNRESOLVED", item.id, {
          name,
          valuePath,
        });
      } else {
        values.push([name, value]);
      }
    }
    output.push({ id: item.id, values: Object.fromEntries(values) });
  }
  return output;
}

function compilerWarnings(
  inputs: CompilerInputs,
  resolved: ResolvedConditionContext,
  byteState: "within-budget" | "warning" | "over-limit",
  byteLength: number,
): readonly CompilerWarning[] {
  const warnings: CompilerWarning[] = [];
  const add = (
    code: CompilerWarning["code"],
    severity: CompilerWarning["severity"],
    values: Readonly<Record<string, string | number | boolean>> = {},
  ): void => {
    warnings.push({ code, severity, values });
  };

  if (resolved.supportTier === "generic") {
    add("W-GENERIC-LIMITED", "notice");
  } else if (resolved.supportTier === "preview") {
    add("W-PREVIEW-EXTERNAL-REVIEW", "notice");
  }

  const configuration = inputs.configuration;
  if (configuration.settings.modality === "live-voice") {
    const destination = configuration.destination;
    if (destination.userEvidence === "unknown") {
      add("W-USER-EVIDENCE-UNKNOWN", "warning");
    }
    if (destination.assistantOutput === "unknown") {
      add("W-ASSISTANT-OUTPUT-UNKNOWN", "warning");
    }
    for (const [capability, unknownCode, unavailableCode] of [
      [
        destination.interruptionSignal,
        "W-INTERRUPTION-UNKNOWN",
        "W-INTERRUPTION-UNAVAILABLE",
      ],
      [
        destination.silenceSignal,
        "W-SILENCE-UNKNOWN",
        "W-SILENCE-UNAVAILABLE",
      ],
      [
        destination.playbackRateControl,
        "W-PLAYBACK-RATE-UNKNOWN",
        "W-PLAYBACK-RATE-UNAVAILABLE",
      ],
    ] as const) {
      if (capability === "unknown") {
        add(unknownCode, "warning");
      } else if (capability === "unavailable") {
        add(unavailableCode, "notice");
      }
    }
    if (
      configuration.settings.pronunciation !== "off" &&
      destination.userEvidence === "text-or-transcript"
    ) {
      add("W-PRONUNCIATION-TRANSCRIPT", "warning");
    }
  }
  if (byteState === "warning") {
    add("W-PROMPT-BUDGET", "warning", { byteLength });
  }
  return warnings.sort(compareWarningCode);
}

export function compileRecipe(
  inputs: CompilerInputs,
): ValidationResult<CompileResult> {
  const issues: ValidationIssue[] = [];
  const direction = pairDirection(inputs);
  if (inputs.pairPack !== null && direction === null) {
    issue(
      issues,
      "pair-resolution",
      "E-PAIR-DIRECTION-MISMATCH",
      "$.pairPack.directions",
    );
  }
  const resolved: ResolvedConditionContext = {
    supportTier: direction === null ? "generic" : "preview",
    pairPack: direction === null ? "absent" : "present",
  };
  const provenance: ArtifactProvenance = {
    compilerVersion: inputs.compilerVersion,
    compilerPolicyVersion: inputs.policy.version,
    schemaVersion: inputs.configuration.schemaVersion,
    languageRegistry: inputs.configuration.languageRegistry,
    recipe: inputs.configuration.recipe,
    homeProfile: inputs.configuration.languages.home,
    targetProfile: inputs.configuration.languages.target,
    pairPack:
      inputs.pairPack === null
        ? "none"
        : { id: inputs.pairPack.id, version: inputs.pairPack.version },
    supportTier: resolved.supportTier,
    supportDirection: supportDirection(inputs),
    supportReviewStatus:
      resolved.supportTier === "preview"
        ? "external-review-not-completed"
        : "not-applicable",
    supportReviewDate: "not-applicable",
    promptSurface: {
      id: inputs.promptSurface.id,
      locale: inputs.promptSurface.locale,
      version: inputs.promptSurface.version,
    },
  };
  const context: RenderContext = { inputs, resolved, provenance };

  const clauseCandidates = [
    ...inputs.policy.invariantClauses,
    ...inputs.recipe.clauses,
    ...(direction === null
      ? []
      : [
          ...direction.clauses,
          ...inputs.homeProfile.monolingualClauses,
          ...inputs.targetProfile.monolingualClauses,
        ]),
  ];
  const clauses = clauseCandidates
    .filter((clause) =>
      matchesAllConditions(
        clause.whenAll,
        inputs.configuration,
        resolved,
      ),
    )
    .sort(compareClauseOrder);
  if (
    resolved.supportTier === "generic" &&
    clauses.some(
      (clause) =>
        clause.origin === "profile" || clause.origin === "pair-pack",
    )
  ) {
    issue(
      issues,
      "selection",
      "E-GENERIC-LINGUISTIC-CLAUSE",
      "$.selectedClauses",
    );
  }
  validateSelectedClauses(clauses, issues);

  const limitations = [
    ...inputs.policy.knownLimitations,
    ...inputs.recipe.knownLimitations,
    ...(direction?.knownLimitations ?? []),
  ]
    .filter((limitation) =>
      matchesAllConditions(
        limitation.whenAll,
        inputs.configuration,
        resolved,
      ),
    )
    .sort(compareLimitationOrder);
  validateSelectedLimitations(limitations, clauses, issues);

  const summaryItems = selectedSummaryItems(
    [...inputs.policy.summaryItems, ...inputs.recipe.summaryItems],
    inputs,
    resolved,
    context,
    issues,
  );

  const sectionLines = new Map<ClauseSection, string[]>();
  for (const clause of clauses) {
    const rendered = renderKey(clause.renderingKey, context, issues);
    const lines = sectionLines.get(clause.section) ?? [];
    lines.push(`- ${rendered}`);
    sectionLines.set(clause.section, lines);
  }
  if (limitations.length > 0) {
    const lines = sectionLines.get(9) ?? [];
    for (const limitation of limitations) {
      lines.push(
        `- ${renderKey(limitation.renderingKey, context, issues)}`,
      );
    }
    sectionLines.set(9, lines);
  }

  const title = renderKey("prompt.title", context, issues);
  const promptBlocks = [title];
  for (const section of [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  ] as const) {
    const lines = sectionLines.get(section);
    if (lines === undefined || lines.length === 0) {
      continue;
    }
    const heading = renderKey(SECTION_HEADING_KEY[section], context, issues);
    promptBlocks.push(`${heading}\n${lines.join("\n")}`);
  }
  const canonicalPrompt = `${promptBlocks.join("\n\n")}\n`;
  if (canonicalPrompt.includes("\r")) {
    issue(issues, "rendering", "E-NONCANONICAL-LINE-ENDINGS", "$.prompt");
  }
  const byteLength = utf8ByteLength(canonicalPrompt);
  const budgetState = promptBudgetState(byteLength);
  if (budgetState === "over-limit") {
    issue(issues, "budget", "E-PROMPT-BUDGET", "$.prompt", { byteLength });
  }

  if (issues.length > 0) {
    return failure(issues);
  }
  return {
    ok: true,
    value: {
      canonicalPrompt,
      summaryItems,
      warnings: compilerWarnings(
        inputs,
        resolved,
        budgetState,
        byteLength,
      ),
      limitationCodes: limitations.map((item) => item.code),
      normalizedConfiguration: inputs.configuration,
      provenance,
    },
  };
}

export function compileFromCatalog(
  input: unknown,
  catalog: CompilerCatalog,
): ValidationResult<CompileResult> {
  const resolved = resolveCompilerArtifacts(input, catalog);
  return resolved.ok ? compileRecipe(resolved.value.inputs) : resolved;
}

function exactValueNames(
  parts: SummaryCatalog["messages"][number]["parts"],
): readonly string[] {
  return [
    ...new Set(
      parts
        .filter(
          (part): part is Extract<typeof part, { kind: "value" }> =>
            part.kind === "value",
        )
        .map((part) => part.name),
    ),
  ].sort();
}

export function renderSummary(
  items: CompileResult["summaryItems"],
  catalogInput: unknown,
): ValidationResult<RenderedSummary> {
  const validatedCatalog = validateSummaryCatalog(catalogInput);
  if (!validatedCatalog.ok) {
    return validatedCatalog;
  }
  const catalog = validatedCatalog.value;
  const issues: ValidationIssue[] = [];
  const rendered: { id: string; text: string }[] = [];

  for (const [index, item] of items.entries()) {
    const messages = catalog.messages.filter(
      (message) => message.id === item.id,
    );
    if (messages.length !== 1) {
      issue(
        issues,
        "rendering",
        messages.length === 0
          ? "E-SUMMARY-MESSAGE-MISSING"
          : "E-SUMMARY-MESSAGE-AMBIGUOUS",
        `$.items[${index}].id`,
        { id: item.id },
      );
      continue;
    }
    const message = messages[0];
    if (message === undefined) {
      continue;
    }
    const expected = exactValueNames(message.parts);
    const actual = Object.keys(item.values).sort();
    if (
      expected.length !== actual.length ||
      expected.some((name, nameIndex) => name !== actual[nameIndex])
    ) {
      issue(
        issues,
        "rendering",
        "E-SUMMARY-VALUE-NAMES",
        `$.items[${index}].values`,
        { actual: actual.join(","), expected: expected.join(",") },
      );
      continue;
    }
    const text = message.parts
      .map((part) =>
        part.kind === "literal" ? part.text : item.values[part.name] ?? "",
      )
      .join("");
    rendered.push({ id: item.id, text });
  }

  if (issues.length > 0) {
    return failure(issues);
  }
  return {
    ok: true,
    value: {
      text: rendered.map((item) => item.text).join("\n"),
      items: rendered,
      catalog: { locale: catalog.locale, version: catalog.version },
    },
  };
}
