import {
  AMBIGUITY_STRATEGIES,
  ASSISTANT_OUTPUT_CAPABILITIES,
  HIERARCHIES,
  INTERPRETER_CLARIFICATIONS,
  INTERPRETER_TURN_MODES,
  PRONUNCIATION_MODES,
  RECIPE_IDS,
  REGISTER_LEVELS,
  RELATIONSHIPS,
  SIGNAL_CAPABILITIES,
  TEACHING_DEPTHS,
  TITLE_HANDLING_STRATEGIES,
  UNKNOWN_NAME_STRATEGIES,
  USER_EVIDENCE_CAPABILITIES,
  VOICE_CORRECTION_FOCI,
  VOICE_CORRECTION_TIMINGS,
  VOICE_PACES,
  WRITTEN_OUTPUT_DETAILS,
  type DataHandling,
  type DestinationCapabilities,
  type InterpreterSettings,
  type ModalitySettings,
  type RecipeConfiguration,
  type RecipeId,
  type RegisterPreference,
  type VersionRef,
  type VoiceSettings,
  type WrittenSettings,
} from "./configuration";
import {
  type CanonicalLanguageRegistry,
  type LanguageProfileRef,
  type LanguageRegistryRef,
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
  addValidationIssue as issue,
  childPath,
  dataValue,
  inspectRecord,
  type InspectedRecord,
} from "./validation-input";

const SETTINGS_KEYS = [
  "modality",
  "outputDetail",
  "correction",
  "pronunciation",
  "teachingDepth",
  "pace",
  "turnMode",
  "clarification",
] as const;
const SETTINGS_KEY_SET: ReadonlySet<string> = new Set(SETTINGS_KEYS);

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
    issue(issues, "configuration", "E-EMPTY-STRING", childPath(path, key));
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
  const value = stringValue(record, key, path, issues);
  if (value === undefined) {
    return undefined;
  }
  if (!(allowed as readonly string[]).includes(value)) {
    issue(issues, "configuration", "E-INVALID-ENUM", childPath(path, key), {
      value,
    });
    return undefined;
  }
  return value as Values[number];
}

function versionRef(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
): VersionRef | undefined {
  const record = inspectRecord(input, path, ["id", "version"], ["id", "version"], issues);
  const id = stringValue(record, "id", path, issues);
  const version = stringValue(record, "version", path, issues);
  if (
    record !== undefined &&
    record.values.has("version") &&
    (typeof record.values.get("version") !== "string" ||
      record.values.get("version") === "")
  ) {
    issue(
      issues,
      "artifact-identity",
      "E-MISSING-PINNED-VERSION",
      childPath(path, "version"),
    );
  }
  return id === undefined || version === undefined ? undefined : { id, version };
}

function recipeRef(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
): { readonly id: RecipeId; readonly version: string } | undefined {
  const record = inspectRecord(input, path, ["id", "version"], ["id", "version"], issues);
  const id = enumValue(record, "id", path, RECIPE_IDS, issues);
  const version = stringValue(record, "version", path, issues);
  if (
    record !== undefined &&
    record.values.has("version") &&
    (typeof record.values.get("version") !== "string" ||
      record.values.get("version") === "")
  ) {
    issue(
      issues,
      "artifact-identity",
      "E-MISSING-PINNED-VERSION",
      childPath(path, "version"),
    );
  }
  return id === undefined || version === undefined ? undefined : { id, version };
}

function registerPreference(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
): RegisterPreference | undefined {
  const record = inspectRecord(
    input,
    path,
    ["strategy", "level"],
    ["strategy"],
    issues,
  );
  const strategy = enumValue(
    record,
    "strategy",
    path,
    ["preserve", "adapt"] as const,
    issues,
  );

  if (strategy === "preserve") {
    if (record?.present.has("level") === true) {
      issue(
        issues,
        "configuration",
        "E-REGISTER-PRESERVE-LEVEL",
        childPath(path, "level"),
      );
    }
    return { strategy: "preserve" };
  }
  if (strategy === "adapt") {
    if (record?.present.has("level") !== true) {
      issue(
        issues,
        "configuration",
        "E-REGISTER-ADAPT-LEVEL",
        childPath(path, "level"),
      );
      return undefined;
    }
    const level = enumValue(record, "level", path, REGISTER_LEVELS, issues);
    return level === undefined ? undefined : { strategy: "adapt", level };
  }
  return undefined;
}

function destinationCapabilities(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
): DestinationCapabilities | undefined {
  const keys = [
    "userEvidence",
    "assistantOutput",
    "interruptionSignal",
    "silenceSignal",
    "playbackRateControl",
  ] as const;
  const record = inspectRecord(input, path, keys, keys, issues);
  const userEvidence = enumValue(
    record,
    "userEvidence",
    path,
    USER_EVIDENCE_CAPABILITIES,
    issues,
  );
  const assistantOutput = enumValue(
    record,
    "assistantOutput",
    path,
    ASSISTANT_OUTPUT_CAPABILITIES,
    issues,
  );
  const interruptionSignal = enumValue(
    record,
    "interruptionSignal",
    path,
    SIGNAL_CAPABILITIES,
    issues,
  );
  const silenceSignal = enumValue(
    record,
    "silenceSignal",
    path,
    SIGNAL_CAPABILITIES,
    issues,
  );
  const playbackRateControl = enumValue(
    record,
    "playbackRateControl",
    path,
    SIGNAL_CAPABILITIES,
    issues,
  );

  return userEvidence === undefined ||
    assistantOutput === undefined ||
    interruptionSignal === undefined ||
    silenceSignal === undefined ||
    playbackRateControl === undefined
    ? undefined
    : {
        userEvidence,
        assistantOutput,
        interruptionSignal,
        silenceSignal,
        playbackRateControl,
      };
}

function rejectSettingsFields(
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
    if (
      SETTINGS_KEY_SET.has(key) &&
      !allowedSet.has(key)
    ) {
      issue(issues, "input-shape", "E-UNKNOWN-FIELD", childPath(path, key));
    }
  }
}

function modalitySettings(
  input: unknown,
  path: string,
  issues: ValidationIssue[],
): ModalitySettings | undefined {
  const record = inspectRecord(input, path, SETTINGS_KEYS, ["modality"], issues);
  const modality = enumValue(
    record,
    "modality",
    path,
    ["written", "live-voice", "interpreting"] as const,
    issues,
  );

  if (modality === "written") {
    const allowed = ["modality", "outputDetail"] as const;
    rejectSettingsFields(record, allowed, path, issues);
    if (record?.present.has("outputDetail") !== true) {
      issue(
        issues,
        "input-shape",
        "E-MISSING-FIELD",
        childPath(path, "outputDetail"),
      );
      return undefined;
    }
    const outputDetail = enumValue(
      record,
      "outputDetail",
      path,
      WRITTEN_OUTPUT_DETAILS,
      issues,
    );
    return outputDetail === undefined
      ? undefined
      : ({ modality, outputDetail } satisfies WrittenSettings);
  }

  if (modality === "live-voice") {
    const allowed = [
      "modality",
      "correction",
      "pronunciation",
      "teachingDepth",
      "pace",
    ] as const;
    rejectSettingsFields(record, allowed, path, issues);
    for (const key of allowed.slice(1)) {
      if (record?.present.has(key) !== true) {
        issue(
          issues,
          "input-shape",
          "E-MISSING-FIELD",
          childPath(path, key),
        );
      }
    }

    const correctionPath = childPath(path, "correction");
    const correctionRecord = record?.present.has("correction")
      ? inspectRecord(
          dataValue(record, "correction"),
          correctionPath,
          ["timing", "focus"],
          ["timing", "focus"],
          issues,
        )
      : undefined;
    const timing = enumValue(
      correctionRecord,
      "timing",
      correctionPath,
      VOICE_CORRECTION_TIMINGS,
      issues,
    );
    const focus = enumValue(
      correctionRecord,
      "focus",
      correctionPath,
      VOICE_CORRECTION_FOCI,
      issues,
    );
    const pronunciation = enumValue(
      record,
      "pronunciation",
      path,
      PRONUNCIATION_MODES,
      issues,
    );
    const teachingDepth = enumValue(
      record,
      "teachingDepth",
      path,
      TEACHING_DEPTHS,
      issues,
    );
    const pace = enumValue(record, "pace", path, VOICE_PACES, issues);

    return timing === undefined ||
      focus === undefined ||
      pronunciation === undefined ||
      teachingDepth === undefined ||
      pace === undefined
      ? undefined
      : ({
          modality,
          correction: { timing, focus },
          pronunciation,
          teachingDepth,
          pace,
        } satisfies VoiceSettings);
  }

  if (modality === "interpreting") {
    const allowed = ["modality", "turnMode", "clarification"] as const;
    rejectSettingsFields(record, allowed, path, issues);
    for (const key of allowed.slice(1)) {
      if (record?.present.has(key) !== true) {
        issue(
          issues,
          "input-shape",
          "E-MISSING-FIELD",
          childPath(path, key),
        );
      }
    }
    const turnMode = enumValue(
      record,
      "turnMode",
      path,
      INTERPRETER_TURN_MODES,
      issues,
    );
    const clarification = enumValue(
      record,
      "clarification",
      path,
      INTERPRETER_CLARIFICATIONS,
      issues,
    );
    return turnMode === undefined || clarification === undefined
      ? undefined
      : ({ modality, turnMode, clarification } satisfies InterpreterSettings);
  }

  return undefined;
}

function failure(issues: ValidationIssue[]): ValidationResult<never> {
  return { ok: false, issues: [...issues].sort(compareValidationIssues) };
}

export function validateRecipeConfiguration(
  input: unknown,
  registry: CanonicalLanguageRegistry,
): ValidationResult<RecipeConfiguration> {
  const issues: ValidationIssue[] = [];
  const rootKeys = [
    "schemaVersion",
    "languageRegistry",
    "recipe",
    "promptSurface",
    "languages",
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
  const root = inspectRecord(input, "$", rootKeys, rootKeys, issues);
  if (root === undefined) {
    return failure(issues);
  }

  const schemaVersion = dataValue(root, "schemaVersion");
  if (root?.values.has("schemaVersion") === true && schemaVersion !== 1) {
    issue(issues, "input-shape", "E-SCHEMA-VERSION", "$.schemaVersion");
  }

  const languageRegistry: LanguageRegistryRef | undefined =
    collectNestedValidation(
      validateLanguageRegistryRef(
        dataValue(root, "languageRegistry"),
        registry,
      ),
      "$.languageRegistry",
      issues,
    );
  const recipe = recipeRef(dataValue(root, "recipe"), "$.recipe", issues);
  const promptSurface = versionRef(
    dataValue(root, "promptSurface"),
    "$.promptSurface",
    issues,
  );

  const languages = inspectRecord(
    dataValue(root, "languages"),
    "$.languages",
    ["home", "target"],
    ["home", "target"],
    issues,
  );
  const home: LanguageProfileRef | undefined =
    languages?.values.has("home") === true
      ? collectNestedValidation(
          validateLanguageProfileRef(dataValue(languages, "home"), registry),
          "$.languages.home",
          issues,
        )
      : undefined;
  const target: LanguageProfileRef | undefined =
    languages?.values.has("target") === true
      ? collectNestedValidation(
          validateLanguageProfileRef(dataValue(languages, "target"), registry),
          "$.languages.target",
          issues,
        )
      : undefined;
  if (home !== undefined && target !== undefined && home.id === target.id) {
    issue(
      issues,
      "configuration",
      "E-IDENTICAL-LANGUAGES",
      "$.languages",
    );
  }

  const social = inspectRecord(
    dataValue(root, "socialContext"),
    "$.socialContext",
    ["relationship", "hierarchy"],
    ["relationship", "hierarchy"],
    issues,
  );
  const relationship = enumValue(
    social,
    "relationship",
    "$.socialContext",
    RELATIONSHIPS,
    issues,
  );
  const hierarchy = enumValue(
    social,
    "hierarchy",
    "$.socialContext",
    HIERARCHIES,
    issues,
  );

  const register = registerPreference(
    dataValue(root, "register"),
    "$.register",
    issues,
  );
  const ambiguity = enumValue(
    root,
    "ambiguity",
    "$",
    AMBIGUITY_STRATEGIES,
    issues,
  );
  const codeSwitching = enumValue(
    root,
    "codeSwitching",
    "$",
    ["preserve"] as const,
    issues,
  );

  const dataHandlingRecord = inspectRecord(
    dataValue(root, "dataHandling"),
    "$.dataHandling",
    ["strategy"],
    ["strategy"],
    issues,
  );
  const dataStrategy = enumValue(
    dataHandlingRecord,
    "strategy",
    "$.dataHandling",
    ["preserve-as-written"] as const,
    issues,
  );
  const dataHandling: DataHandling | undefined =
    dataStrategy === undefined ? undefined : { strategy: dataStrategy };

  const titleHandling = enumValue(
    root,
    "titleHandling",
    "$",
    TITLE_HANDLING_STRATEGIES,
    issues,
  );
  const unknownName = enumValue(
    root,
    "unknownName",
    "$",
    UNKNOWN_NAME_STRATEGIES,
    issues,
  );
  const destination = destinationCapabilities(
    dataValue(root, "destination"),
    "$.destination",
    issues,
  );
  const settings = modalitySettings(
    dataValue(root, "settings"),
    "$.settings",
    issues,
  );

  if (
    recipe !== undefined &&
    settings !== undefined &&
    !(
      (recipe.id === "written-translator" &&
        settings.modality === "written") ||
      (recipe.id === "live-voice-coach" &&
        settings.modality === "live-voice") ||
      (recipe.id === "interpreter" && settings.modality === "interpreting")
    )
  ) {
    issue(
      issues,
      "configuration",
      "E-MODALITY-MISMATCH",
      "$.settings.modality",
      { recipeId: recipe.id, modality: settings.modality },
    );
  }

  if (issues.length > 0) {
    return failure(issues);
  }

  if (
    schemaVersion !== 1 ||
    languageRegistry === undefined ||
    recipe === undefined ||
    promptSurface === undefined ||
    home === undefined ||
    target === undefined ||
    relationship === undefined ||
    hierarchy === undefined ||
    register === undefined ||
    ambiguity === undefined ||
    codeSwitching === undefined ||
    dataHandling === undefined ||
    titleHandling === undefined ||
    unknownName === undefined ||
    destination === undefined ||
    settings === undefined
  ) {
    issue(issues, "configuration", "E-VALIDATION-INCOMPLETE", "$");
    return failure(issues);
  }

  const common = {
    schemaVersion,
    languageRegistry,
    promptSurface,
    languages: { home, target },
    socialContext: { relationship, hierarchy },
    register,
    ambiguity,
    codeSwitching,
    dataHandling,
    titleHandling,
    unknownName,
    destination,
  } as const;

  if (recipe.id === "written-translator" && settings.modality === "written") {
    return {
      ok: true,
      value: {
        ...common,
        recipe: { id: "written-translator", version: recipe.version },
        settings,
      },
    };
  }
  if (
    recipe.id === "live-voice-coach" &&
    settings.modality === "live-voice"
  ) {
    return {
      ok: true,
      value: {
        ...common,
        recipe: { id: "live-voice-coach", version: recipe.version },
        settings,
      },
    };
  }
  if (recipe.id === "interpreter" && settings.modality === "interpreting") {
    return {
      ok: true,
      value: {
        ...common,
        recipe: { id: "interpreter", version: recipe.version },
        settings,
      },
    };
  }

  issue(issues, "configuration", "E-MODALITY-MISMATCH", "$.settings.modality");
  return failure(issues);
}
