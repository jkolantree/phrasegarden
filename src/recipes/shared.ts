import type {
  Clause,
  ConditionPath,
  SummaryItemSpec,
} from "../domain";

interface ChoiceDefinition {
  readonly value: string;
  readonly renderingKey?: string;
}

export function choiceClauses(
  idPrefix: string,
  path: ConditionPath,
  choices: readonly ChoiceDefinition[],
  order: number,
  effectKey: string,
): readonly Clause[] {
  return choices.map((choice) => ({
    id: `recipe.${idPrefix}.${choice.value}`,
    origin: "recipe",
    authority: "normalized-setting",
    section: 5,
    order,
    whenAll: [{ path, op: "eq", value: choice.value }],
    renderingKey:
      choice.renderingKey ?? `choice.${idPrefix}.${choice.value}`,
    effect: { key: effectKey, value: choice.value },
  }));
}

export function choiceSummaries(
  group: "adapts" | "behavior" | "preserves",
  idPrefix: string,
  path: ConditionPath,
  values: readonly string[],
  order: number,
): readonly SummaryItemSpec[] {
  return values.map((value) => ({
    id: `${group}.${idPrefix}.${value}`,
    order,
    whenAll: [{ path, op: "eq", value }],
    values: {},
  }));
}

export const COMMON_DEFAULTS = {
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
} as const;

export const COMMON_CHOICE_CLAUSES: readonly Clause[] = [
  ...choiceClauses(
    "relationship",
    "socialContext.relationship",
    [
      { value: "unspecified" },
      { value: "strangers" },
      { value: "acquaintances" },
      { value: "friends" },
      { value: "close-relationship" },
      { value: "family" },
      { value: "romantic-partners" },
      { value: "coworkers" },
      { value: "customer-service" },
      { value: "teacher-learner" },
      { value: "other" },
    ],
    400,
    "setting.relationship",
  ),
  ...choiceClauses(
    "hierarchy",
    "socialContext.hierarchy",
    [
      { value: "unspecified" },
      { value: "peers" },
      { value: "source-speaker-higher" },
      { value: "addressee-higher" },
    ],
    410,
    "setting.hierarchy",
  ),
  ...choiceClauses(
    "register",
    "register.strategy",
    [{ value: "preserve", renderingKey: "choice.register.preserve" }],
    420,
    "setting.register",
  ),
  ...choiceClauses(
    "register",
    "register.level",
    [
      { value: "casual" },
      { value: "neutral" },
      { value: "polite" },
      { value: "formal" },
    ],
    420,
    "setting.register",
  ),
  ...choiceClauses(
    "ambiguity",
    "ambiguity",
    [
      { value: "preserve-and-note" },
      { value: "ask-if-blocking" },
      { value: "marked-best-effort" },
    ],
    430,
    "setting.ambiguity",
  ),
  ...choiceClauses(
    "title",
    "titleHandling",
    [
      { value: "preserve-marked-title" },
      { value: "adapt-only-known-role" },
    ],
    440,
    "setting.title-handling",
  ),
  ...choiceClauses(
    "unknown-name",
    "unknownName",
    [{ value: "preserve-and-ask" }, { value: "preserve-and-note" }],
    450,
    "setting.unknown-name",
  ),
];

export const COMMON_SUMMARY_ITEMS: readonly SummaryItemSpec[] = [
  ...choiceSummaries(
    "behavior",
    "relationship",
    "socialContext.relationship",
    [
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
    300,
  ),
  ...choiceSummaries(
    "behavior",
    "hierarchy",
    "socialContext.hierarchy",
    [
      "unspecified",
      "peers",
      "source-speaker-higher",
      "addressee-higher",
    ],
    310,
  ),
  ...choiceSummaries(
    "preserves",
    "register",
    "register.strategy",
    ["preserve"],
    320,
  ),
  ...choiceSummaries(
    "adapts",
    "register",
    "register.level",
    ["casual", "neutral", "polite", "formal"],
    320,
  ),
  ...choiceSummaries(
    "behavior",
    "ambiguity",
    "ambiguity",
    ["preserve-and-note", "ask-if-blocking", "marked-best-effort"],
    330,
  ),
];
