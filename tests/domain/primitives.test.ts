import { describe, expect, it } from "vitest";

import type {
  Clause,
  CompilerWarning,
  InterpreterRecipeConfiguration,
  LimitationSpec,
  ResolvedConditionContext,
  SummaryItemSpec,
  ValidationIssue,
  VoiceRecipeConfiguration,
  WrittenRecipeConfiguration,
} from "../../src/domain";
import {
  AMBIGUITY_STRATEGIES,
  ASSISTANT_OUTPUT_CAPABILITIES,
  AUTHORITIES,
  CLAUSE_ORIGINS,
  CLAUSE_SECTIONS,
  CODE_SWITCHING_STRATEGIES,
  COMPILER_WARNING_CODES,
  CONDITION_PATHS,
  COVERAGE_OWNERS,
  DATA_HANDLING_STRATEGIES,
  FAILURE_CLASSES,
  FIXTURE_EVIDENCE_TYPES,
  FIXTURE_HOST_EVENTS,
  FIXTURE_STATES,
  FIXTURE_TURN_ROLES,
  HIERARCHIES,
  INTERPRETER_CLARIFICATIONS,
  INTERPRETER_TURN_MODES,
  LANGUAGE_DIRECTIONS,
  MODALITIES,
  PRONUNCIATION_MODES,
  RECIPE_IDS,
  REGISTER_LEVELS,
  RELATIONSHIPS,
  RENDER_VALUE_FORMATS,
  RENDER_VALUE_PATHS,
  REVIEW_ROLES,
  SIGNAL_CAPABILITIES,
  SUPPORT_TIERS,
  TEACHING_DEPTHS,
  TITLE_HANDLING_STRATEGIES,
  UNKNOWN_NAME_STRATEGIES,
  USER_EVIDENCE_CAPABILITIES,
  VALIDATION_STAGES,
  VOICE_CORRECTION_FOCI,
  VOICE_CORRECTION_TIMINGS,
  VOICE_PACES,
  WRITTEN_OUTPUT_DETAILS,
  compareClauseOrder,
  compareCodeUnits,
  compareLimitationOrder,
  compareSummaryOrder,
  compareValidationIssues,
  compareWarningCode,
  conditionValueAt,
  evaluateClauseCondition,
  isClauseConditionWellFormed,
  isStrictlyCodeUnitSorted,
  matchesAllConditions,
  promptBudgetState,
  sameVersionRef,
  utf8ByteLength,
} from "../../src/domain";
import { CANONICAL_LANGUAGE_REGISTRY_REF } from "../../src/packs";

const writtenConfiguration: WrittenRecipeConfiguration = {
  schemaVersion: 1,
  languageRegistry: CANONICAL_LANGUAGE_REGISTRY_REF,
  recipe: { id: "written-translator", version: "0.0.0-test" },
  promptSurface: { id: "instructions-en", version: "0.0.0-test" },
  languages: {
    home: { id: "en", version: "0.0.0-test" },
    target: { id: "ja", version: "0.0.0-test" },
  },
  socialContext: {
    relationship: "unspecified",
    hierarchy: "unspecified",
  },
  register: { strategy: "preserve" },
  ambiguity: "ask-if-blocking",
  codeSwitching: "preserve",
  dataHandling: { strategy: "preserve-as-written" },
  titleHandling: "preserve-marked-title",
  unknownName: "preserve-and-ask",
  destination: {
    userEvidence: "text-or-transcript",
    assistantOutput: "text",
    interruptionSignal: "unavailable",
    silenceSignal: "unavailable",
    playbackRateControl: "unavailable",
  },
  settings: { modality: "written", outputDetail: "concise" },
};

const flagshipResolved: ResolvedConditionContext = {
  supportTier: "flagship",
  pairPack: "present",
};

const voiceConfiguration: VoiceRecipeConfiguration = {
  ...writtenConfiguration,
  recipe: { id: "live-voice-coach", version: "0.0.0-test" },
  destination: {
    userEvidence: "audible-audio",
    assistantOutput: "spoken",
    interruptionSignal: "unknown",
    silenceSignal: "unknown",
    playbackRateControl: "unknown",
  },
  settings: {
    modality: "live-voice",
    correction: { timing: "after-turn", focus: "balanced" },
    pronunciation: "on-request",
    teachingDepth: "brief",
    pace: "natural",
  },
};

const interpreterConfiguration: InterpreterRecipeConfiguration = {
  ...writtenConfiguration,
  recipe: { id: "interpreter", version: "0.0.0-test" },
  settings: {
    modality: "interpreting",
    turnMode: "consecutive",
    clarification: "ask-if-blocking",
  },
};

describe("closed configuration model", () => {
  it("locks each recipe ID to its modality discriminant", () => {
    expect([
      [writtenConfiguration.recipe.id, writtenConfiguration.settings.modality],
      [voiceConfiguration.recipe.id, voiceConfiguration.settings.modality],
      [
        interpreterConfiguration.recipe.id,
        interpreterConfiguration.settings.modality,
      ],
    ]).toEqual([
      ["written-translator", "written"],
      ["live-voice-coach", "live-voice"],
      ["interpreter", "interpreting"],
    ]);
  });

  it("locks every authored closed set used by Gate 2 validation", () => {
    expect({
      recipeIds: RECIPE_IDS,
      modalities: MODALITIES,
      relationships: RELATIONSHIPS,
      hierarchies: HIERARCHIES,
      registerLevels: REGISTER_LEVELS,
      ambiguity: AMBIGUITY_STRATEGIES,
      codeSwitching: CODE_SWITCHING_STRATEGIES,
      dataHandling: DATA_HANDLING_STRATEGIES,
      titleHandling: TITLE_HANDLING_STRATEGIES,
      unknownName: UNKNOWN_NAME_STRATEGIES,
      userEvidence: USER_EVIDENCE_CAPABILITIES,
      assistantOutput: ASSISTANT_OUTPUT_CAPABILITIES,
      signalCapabilities: SIGNAL_CAPABILITIES,
      writtenOutput: WRITTEN_OUTPUT_DETAILS,
      correctionTiming: VOICE_CORRECTION_TIMINGS,
      correctionFocus: VOICE_CORRECTION_FOCI,
      pronunciation: PRONUNCIATION_MODES,
      teachingDepth: TEACHING_DEPTHS,
      voicePace: VOICE_PACES,
      interpreterTurn: INTERPRETER_TURN_MODES,
      interpreterClarification: INTERPRETER_CLARIFICATIONS,
      supportTiers: SUPPORT_TIERS,
      authorities: AUTHORITIES,
      clauseOrigins: CLAUSE_ORIGINS,
      clauseSections: CLAUSE_SECTIONS,
      conditionPaths: CONDITION_PATHS,
      renderValuePaths: RENDER_VALUE_PATHS,
      renderFormats: RENDER_VALUE_FORMATS,
      reviewRoles: REVIEW_ROLES,
      languageDirections: LANGUAGE_DIRECTIONS,
      validationStages: VALIDATION_STAGES,
      warningCodes: COMPILER_WARNING_CODES,
      failureClasses: FAILURE_CLASSES,
      fixtureStates: FIXTURE_STATES,
      fixtureRoles: FIXTURE_TURN_ROLES,
      fixtureEvidence: FIXTURE_EVIDENCE_TYPES,
      fixtureEvents: FIXTURE_HOST_EVENTS,
      coverageOwners: COVERAGE_OWNERS,
    }).toEqual({
      recipeIds: [
        "written-translator",
        "live-voice-coach",
        "interpreter",
      ],
      modalities: ["written", "live-voice", "interpreting"],
      relationships: [
        "unspecified",
        "strangers",
        "acquaintances",
        "friends",
        "close-relationship",
        "family",
        "romantic-partners",
        "coworkers",
        "customer-service",
        "teacher-learner",
        "other",
      ],
      hierarchies: [
        "unspecified",
        "peers",
        "source-speaker-higher",
        "addressee-higher",
      ],
      registerLevels: ["casual", "neutral", "polite", "formal"],
      ambiguity: [
        "preserve-and-note",
        "ask-if-blocking",
        "marked-best-effort",
      ],
      codeSwitching: ["preserve"],
      dataHandling: ["preserve-as-written"],
      titleHandling: ["preserve-marked-title", "adapt-only-known-role"],
      unknownName: ["preserve-and-ask", "preserve-and-note"],
      userEvidence: ["unknown", "text-or-transcript", "audible-audio"],
      assistantOutput: ["unknown", "text", "spoken"],
      signalCapabilities: ["unknown", "available", "unavailable"],
      writtenOutput: ["concise", "brief-notes", "teaching"],
      correctionTiming: [
        "on-request",
        "after-turn",
        "blocking-only",
        "after-each-turn",
      ],
      correctionFocus: ["meaning-and-force", "balanced", "form-detail"],
      pronunciation: ["off", "on-request", "when-helpful"],
      teachingDepth: ["minimal", "brief", "guided", "deep"],
      voicePace: ["natural", "slower"],
      interpreterTurn: ["consecutive", "short-relay"],
      interpreterClarification: ["ask-if-blocking", "mark-uncertainty"],
      supportTiers: [
        "flagship",
        "reviewed",
        "community",
        "preview",
        "generic",
      ],
      authorities: [
        "invariant",
        "normalized-setting",
        "modality",
        "pair-pack",
        "profile",
        "fallback",
      ],
      clauseOrigins: ["invariant", "recipe", "profile", "pair-pack"],
      clauseSections: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      conditionPaths: [
        "recipe.id",
        "languages.home.id",
        "languages.target.id",
        "socialContext.relationship",
        "socialContext.hierarchy",
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
        "settings.modality",
        "settings.outputDetail",
        "settings.correction.timing",
        "settings.correction.focus",
        "settings.pronunciation",
        "settings.teachingDepth",
        "settings.pace",
        "settings.turnMode",
        "settings.clarification",
        "resolved.supportTier",
        "resolved.pairPack",
      ],
      renderValuePaths: [
        "compiler.version",
        "compiler.policyVersion",
        "schema.version",
        "languageRegistry.version",
        "languageRegistry.contentSha256",
        "recipe.id",
        "recipe.version",
        "home.id",
        "home.version",
        "home.autonym",
        "target.id",
        "target.version",
        "target.autonym",
        "pairPack.id-or-none",
        "pairPack.version-or-none",
        "support.tier",
        "support.direction",
        "support.review-status",
        "support.review-date",
        "promptSurface.id",
        "promptSurface.locale",
        "promptSurface.version",
      ],
      renderFormats: ["plain", "inline-code"],
      reviewRoles: [
        "qualified-speaker",
        "community-reviewer",
        "maintainer",
      ],
      languageDirections: ["ltr", "rtl"],
      validationStages: [
        "input-shape",
        "configuration",
        "artifact-identity",
        "authored-data",
        "pair-resolution",
        "selection",
        "rendering",
        "budget",
      ],
      warningCodes: [
        "W-GENERIC-LIMITED",
        "W-PREVIEW-EXTERNAL-REVIEW",
        "W-USER-EVIDENCE-UNKNOWN",
        "W-ASSISTANT-OUTPUT-UNKNOWN",
        "W-INTERRUPTION-UNKNOWN",
        "W-INTERRUPTION-UNAVAILABLE",
        "W-SILENCE-UNKNOWN",
        "W-SILENCE-UNAVAILABLE",
        "W-PLAYBACK-RATE-UNKNOWN",
        "W-PLAYBACK-RATE-UNAVAILABLE",
        "W-PRONUNCIATION-TRANSCRIPT",
        "W-PROMPT-BUDGET",
      ],
      failureClasses: [
        "compiler",
        "recipe",
        "language-profile",
        "pair-pack",
        "model-behavior",
        "interface",
        "accessibility",
        "unsupported-capability",
      ],
      fixtureStates: [
        "untouched holdout",
        "prospective evaluation",
        "exposed",
        "development",
        "regression",
        "transport qualification",
        "contaminated",
        "unknown provenance",
      ],
      fixtureRoles: ["source", "learner", "coach", "control", "host-event"],
      fixtureEvidence: [
        "text",
        "transcript",
        "audible-audio",
        "host-signal",
      ],
      fixtureEvents: ["interrupt", "silence", "repeat", "slower"],
      coverageOwners: [
        "construction",
        "validator",
        "prompt",
        "ui",
        "semantic-evaluation",
        "host-qualification",
      ],
    });

    expect(new Set(CONDITION_PATHS).size).toBe(CONDITION_PATHS.length);
    expect(new Set(RENDER_VALUE_PATHS).size).toBe(RENDER_VALUE_PATHS.length);
  });
});

describe("typed conditions", () => {
  it("uses exact equality without coercion or fallback", () => {
    expect(
      evaluateClauseCondition(
        { path: "languages.target.id", op: "eq", value: "ja" },
        writtenConfiguration,
        flagshipResolved,
      ),
    ).toBe(true);
    expect(
      evaluateClauseCondition(
        { path: "languages.target.id", op: "eq", value: "JA" },
        writtenConfiguration,
        flagshipResolved,
      ),
    ).toBe(false);
    expect(
      evaluateClauseCondition(
        { path: "register.level", op: "eq", value: "polite" },
        writtenConfiguration,
        flagshipResolved,
      ),
    ).toBe(false);
    expect(
      conditionValueAt(
        writtenConfiguration,
        flagshipResolved,
        "register.level",
      ),
    ).toBeUndefined();
  });

  it("requires unique code-unit-sorted in-values", () => {
    expect(isStrictlyCodeUnitSorted(["a", "b", "c"])).toBe(true);
    expect(isStrictlyCodeUnitSorted(["a", "a"])).toBe(false);
    expect(isStrictlyCodeUnitSorted(["b", "a"])).toBe(false);
    expect(
      isClauseConditionWellFormed({
        path: "ambiguity",
        op: "in",
        values: ["ask-if-blocking", "preserve-and-note"],
      }),
    ).toBe(true);
    expect(
      isClauseConditionWellFormed({
        path: "ambiguity",
        op: "in",
        values: ["preserve-and-note", "ask-if-blocking"],
      }),
    ).toBe(false);
  });

  it("implements exact pair-pack presence and empty all-of semantics", () => {
    expect(
      evaluateClauseCondition(
        { path: "resolved.pairPack", op: "present" },
        writtenConfiguration,
        flagshipResolved,
      ),
    ).toBe(true);
    expect(
      evaluateClauseCondition(
        { path: "resolved.pairPack", op: "absent" },
        writtenConfiguration,
        flagshipResolved,
      ),
    ).toBe(false);
    expect(
      matchesAllConditions(
        [],
        writtenConfiguration,
        flagshipResolved,
      ),
    ).toBe(true);
  });

  it("fails a whole all-of when any condition fails", () => {
    expect(
      matchesAllConditions(
        [
          { path: "recipe.id", op: "eq", value: "written-translator" },
          { path: "socialContext.relationship", op: "eq", value: "friends" },
        ],
        writtenConfiguration,
        flagshipResolved,
      ),
    ).toBe(false);
  });
});

describe("canonical comparisons", () => {
  it("uses exact code-unit order instead of locale collation", () => {
    expect(compareCodeUnits("Z", "a")).toBeLessThan(0);
    expect(compareCodeUnits("a", "a")).toBe(0);
    expect(compareCodeUnits("ä", "z")).toBeGreaterThan(0);
    expect(
      sameVersionRef(
        { id: "ja", version: "1" },
        { id: "ja", version: "1" },
      ),
    ).toBe(true);
  });

  it("orders authored selections by their normative keys", () => {
    const clauseBase: Clause = {
      id: "clause-b",
      origin: "recipe",
      authority: "modality",
      section: 2,
      order: 20,
      whenAll: [],
      renderingKey: "clause-b",
      effect: { key: "effect-b", value: "on" },
    };
    const clauses: Clause[] = [
      clauseBase,
      {
        ...clauseBase,
        id: "clause-a",
        section: 1,
        order: 30,
        effect: { key: "effect-a", value: "on" },
      },
    ];
    const summaries: SummaryItemSpec[] = [
      { id: "b", order: 20, whenAll: [], values: {} },
      { id: "a", order: 10, whenAll: [], values: {} },
    ];
    const limitations: LimitationSpec[] = [
      { code: "L-B", order: 20, whenAll: [], renderingKey: "b" },
      { code: "L-A", order: 10, whenAll: [], renderingKey: "a" },
    ];
    const warnings: CompilerWarning[] = [
      { code: "W-SILENCE-UNKNOWN", severity: "warning", values: {} },
      { code: "W-GENERIC-LIMITED", severity: "notice", values: {} },
    ];

    expect(clauses.sort(compareClauseOrder).map((item) => item.id)).toEqual([
      "clause-a",
      "clause-b",
    ]);
    expect(summaries.sort(compareSummaryOrder).map((item) => item.id)).toEqual([
      "a",
      "b",
    ]);
    expect(
      limitations.sort(compareLimitationOrder).map((item) => item.code),
    ).toEqual(["L-A", "L-B"]);
    expect(warnings.sort(compareWarningCode).map((item) => item.code)).toEqual([
      "W-GENERIC-LIMITED",
      "W-SILENCE-UNKNOWN",
    ]);
  });

  it("orders validation issues by fixed stage, code, then path", () => {
    const stageIssues: ValidationIssue[] = [...VALIDATION_STAGES]
      .reverse()
      .map((stage) => ({ stage, code: "E-STAGE", path: "$" }));
    expect(
      stageIssues.sort(compareValidationIssues).map((issue) => issue.stage),
    ).toEqual(VALIDATION_STAGES);

    const withinStageIssues: ValidationIssue[] = [
      { stage: "configuration", code: "E-A", path: "$.a" },
      { stage: "configuration", code: "E-B", path: "$.a" },
      { stage: "configuration", code: "E-A", path: "$.z" },
    ];
    expect(withinStageIssues.sort(compareValidationIssues)).toEqual([
      { stage: "configuration", code: "E-A", path: "$.a" },
      { stage: "configuration", code: "E-A", path: "$.z" },
      { stage: "configuration", code: "E-B", path: "$.a" },
    ]);
  });
});

describe("UTF-8 prompt budgets", () => {
  it("counts ASCII, combining marks, Japanese, and astral code points", () => {
    expect(utf8ByteLength("PhraseGarden")).toBe(12);
    expect(utf8ByteLength("e\u0301")).toBe(3);
    expect(utf8ByteLength("日本語")).toBe(9);
    expect(utf8ByteLength("🌱")).toBe(4);
  });

  it("uses replacement-character byte length for unpaired surrogates", () => {
    expect(utf8ByteLength("\ud800")).toBe(3);
    expect(utf8ByteLength("\udc00")).toBe(3);
  });

  it("applies the exact open warning and hard-limit boundaries", () => {
    expect(promptBudgetState(9_000)).toBe("within-budget");
    expect(promptBudgetState(9_001)).toBe("warning");
    expect(promptBudgetState(12_000)).toBe("warning");
    expect(promptBudgetState(12_001)).toBe("over-limit");
  });
});
