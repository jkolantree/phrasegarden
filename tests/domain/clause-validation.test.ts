import { describe, expect, it } from "vitest";

import {
  AUTHORITIES,
  CLAUSE_ORIGINS,
  CONDITION_PATHS,
  validateClause,
  type Authority,
  type Clause,
  type ClauseOrigin,
  type ValidationIssue,
} from "../../src/domain";
import { jsonClone } from "../fixtures/configurations";

const validClause: Clause = {
  id: "recipe.written.intent",
  origin: "recipe",
  authority: "modality",
  section: 2,
  order: 20,
  whenAll: [],
  renderingKey: "clause.written.intent",
  effect: { key: "source.boundary", value: "next-turn-is-source" },
};

const legalPairs: readonly (readonly [ClauseOrigin, Authority])[] = [
  ["invariant", "invariant"],
  ["recipe", "normalized-setting"],
  ["recipe", "modality"],
  ["recipe", "fallback"],
  ["profile", "profile"],
  ["pair-pack", "pair-pack"],
];

function issuesFor(input: unknown): readonly ValidationIssue[] {
  const result = validateClause(input);
  expect(result.ok).toBe(false);
  return result.ok ? [] : result.issues;
}

function issueKeys(issues: readonly ValidationIssue[]): string[] {
  return issues.map((item) => `${item.stage}|${item.code}|${item.path}`);
}

describe("valid authored clauses", () => {
  it("accepts an empty all-of conjunction and omits absent refines", () => {
    const result = validateClause(validClause);
    expect(result).toEqual({ ok: true, value: validClause });
    if (result.ok) {
      expect(Object.hasOwn(result.value, "refines")).toBe(false);
    }
  });

  it.each(legalPairs)(
    "accepts the %s to %s origin/authority pair",
    (origin, authority) => {
      const input = { ...jsonClone(validClause), origin, authority };
      expect(validateClause(input)).toEqual({ ok: true, value: input });
    },
  );

  it("accepts every condition path and every legal operator shape", () => {
    const conditions = [
      ...CONDITION_PATHS.map((path) => ({
        path,
        op: "eq" as const,
        value: "present",
      })),
      {
        path: "socialContext.relationship" as const,
        op: "in" as const,
        values: ["family", "friend", "unspecified"],
      },
      { path: "resolved.pairPack" as const, op: "present" as const },
      { path: "resolved.pairPack" as const, op: "absent" as const },
    ];
    const input = { ...jsonClone(validClause), whenAll: conditions };
    const result = validateClause(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.whenAll).toEqual(conditions);
    }
  });

  it("preserves condition/refinement order and deeply detaches output", () => {
    const input = {
      ...jsonClone(validClause),
      whenAll: [
        { path: "recipe.id", op: "eq", value: "written-translator" },
        {
          path: "register.strategy",
          op: "in",
          values: ["adapt", "preserve"],
        },
      ],
      refines: [
        { key: "meaning.preservation" },
        { key: "register.policy", value: "preserve" },
      ],
    };
    const result = validateClause(input);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value).not.toBe(input);
    expect(result.value.whenAll).not.toBe(input.whenAll);
    expect(result.value.refines).not.toBe(input.refines);
    expect(result.value).toEqual(input);
    Reflect.set(input.whenAll[0]!, "value", "changed");
    Reflect.set(input.refines[0]!, "key", "changed");
    expect(result.value.whenAll[0]).toEqual({
      path: "recipe.id",
      op: "eq",
      value: "written-translator",
    });
    expect(result.value.refines?.[0]).toEqual({
      key: "meaning.preservation",
    });
  });

  it("accepts negative safe-integer order without deriving array position", () => {
    const input = { ...jsonClone(validClause), order: -10 };
    expect(validateClause(input)).toEqual({ ok: true, value: input });
  });
});

describe("condition grammar", () => {
  it("rejects unknown and non-string path/operator discriminators", () => {
    const input = {
      ...jsonClone(validClause),
      whenAll: [
        { path: "recipe.mode", op: "eq", value: "written-translator" },
        { path: "recipe.id", op: "contains", value: "written" },
        { path: 7, op: true },
      ],
    };
    expect(issueKeys(issuesFor(input))).toEqual([
      "input-shape|E-EXPECTED-STRING|$.whenAll[2].op",
      "input-shape|E-EXPECTED-STRING|$.whenAll[2].path",
      "authored-data|E-INVALID-ENUM|$.whenAll[0].path",
      "authored-data|E-INVALID-ENUM|$.whenAll[1].op",
    ]);
  });

  it("rejects missing, empty, and wrong-primitive condition values", () => {
    const input = {
      ...jsonClone(validClause),
      whenAll: [
        { path: "recipe.id", op: "eq" },
        { path: "recipe.id", op: "eq", value: "" },
        { path: "recipe.id", op: "in", values: [] },
        { path: "recipe.id", op: "in", values: ["valid", 7] },
      ],
    };
    expect(issueKeys(issuesFor(input))).toEqual([
      "input-shape|E-EXPECTED-STRING|$.whenAll[3].values[1]",
      "input-shape|E-MISSING-FIELD|$.whenAll[0].value",
      "authored-data|E-EMPTY-IN-VALUES|$.whenAll[2].values",
      "authored-data|E-EMPTY-STRING|$.whenAll[1].value",
    ]);
  });

  it("rejects duplicate and descending membership values independently", () => {
    const input = {
      ...jsonClone(validClause),
      whenAll: [
        {
          path: "recipe.id",
          op: "in",
          values: ["a", "a"],
        },
        {
          path: "recipe.id",
          op: "in",
          values: ["b", "a"],
        },
      ],
    };
    expect(issueKeys(issuesFor(input))).toEqual([
      "authored-data|E-DUPLICATE-IN-VALUE|$.whenAll[0].values[1]",
      "authored-data|E-UNSORTED-IN-VALUES|$.whenAll[1].values",
    ]);
  });

  it("uses strict UTF-16 code-unit order without locale collation", () => {
    const sorted = ["Z", "a", "é", "あ", "🌱"];
    const valid = {
      ...jsonClone(validClause),
      whenAll: [{ path: "recipe.id", op: "in", values: sorted }],
    };
    expect(validateClause(valid).ok).toBe(true);

    const invalid = {
      ...jsonClone(validClause),
      whenAll: [
        { path: "recipe.id", op: "in", values: [...sorted].reverse() },
      ],
    };
    expect(issueKeys(issuesFor(invalid))).toEqual([
      "authored-data|E-UNSORTED-IN-VALUES|$.whenAll[0].values",
    ]);
  });

  it("rejects branch-disallowed fields exactly once", () => {
    const input = {
      ...jsonClone(validClause),
      whenAll: [
        {
          path: "recipe.id",
          op: "eq",
          value: "written-translator",
          values: ["written-translator"],
        },
        {
          path: "recipe.id",
          op: "in",
          value: "written-translator",
          values: ["written-translator"],
        },
        {
          path: "resolved.pairPack",
          op: "present",
          value: "present",
        },
      ],
    };
    expect(issueKeys(issuesFor(input))).toEqual([
      "input-shape|E-UNKNOWN-FIELD|$.whenAll[0].values",
      "input-shape|E-UNKNOWN-FIELD|$.whenAll[1].value",
      "input-shape|E-UNKNOWN-FIELD|$.whenAll[2].value",
    ]);
  });

  it("limits present and absent to resolved.pairPack", () => {
    const input = {
      ...jsonClone(validClause),
      whenAll: [
        { path: "recipe.id", op: "present" },
        { path: "languages.home.id", op: "absent" },
      ],
    };
    expect(issueKeys(issuesFor(input))).toEqual([
      "authored-data|E-INVALID-PRESENCE-PATH|$.whenAll[0].path",
      "authored-data|E-INVALID-PRESENCE-PATH|$.whenAll[1].path",
    ]);
  });

  it("does not invoke nested condition or array-index getters", () => {
    let conditionGetterCalls = 0;
    let indexGetterCalls = 0;
    const condition = {
      op: "eq",
      value: "written-translator",
    } as Record<string, unknown>;
    Object.defineProperty(condition, "path", {
      enumerable: true,
      get() {
        conditionGetterCalls += 1;
        return "recipe.id";
      },
    });
    const whenAll: unknown[] = [];
    Object.defineProperty(whenAll, "0", {
      enumerable: true,
      get() {
        indexGetterCalls += 1;
        return condition;
      },
    });
    expect(issueKeys(issuesFor({ ...validClause, whenAll }))).toEqual([
      "input-shape|E-ACCESSOR-FIELD|$.whenAll[0]",
      "input-shape|E-SPARSE-ARRAY|$.whenAll",
    ]);
    expect(conditionGetterCalls).toBe(0);
    expect(indexGetterCalls).toBe(0);

    expect(
      issueKeys(issuesFor({ ...validClause, whenAll: [condition] })),
    ).toContain("input-shape|E-ACCESSOR-FIELD|$.whenAll[0].path");
    expect(conditionGetterCalls).toBe(0);
  });
});

describe("clause intrinsic rules", () => {
  it("rejects every illegal origin/authority pair", () => {
    const legal = new Set(legalPairs.map(([origin, authority]) => `${origin}|${authority}`));
    for (const origin of CLAUSE_ORIGINS) {
      for (const authority of AUTHORITIES) {
        if (legal.has(`${origin}|${authority}`)) {
          continue;
        }
        const input = { ...jsonClone(validClause), origin, authority };
        expect(issueKeys(issuesFor(input))).toEqual([
          "authored-data|E-ILLEGAL-ORIGIN-AUTHORITY|$.authority",
        ]);
      }
    }
  });

  it.each([
    ["section zero", { section: 0 }, "authored-data|E-INVALID-SECTION|$.section"],
    [
      "section fraction",
      { section: 1.5 },
      "input-shape|E-EXPECTED-SAFE-INTEGER|$.section",
    ],
    [
      "order fraction",
      { order: 1.5 },
      "input-shape|E-EXPECTED-SAFE-INTEGER|$.order",
    ],
    [
      "order infinity",
      { order: Number.POSITIVE_INFINITY },
      "input-shape|E-EXPECTED-SAFE-INTEGER|$.order",
    ],
    [
      "order string",
      { order: "20" },
      "input-shape|E-EXPECTED-SAFE-INTEGER|$.order",
    ],
  ])("rejects %s", (_label, patch, expected) => {
    expect(issueKeys(issuesFor({ ...jsonClone(validClause), ...patch }))).toEqual([
      expected,
    ]);
  });

  it("rejects empty clause, effect, and refinement identities", () => {
    const input = {
      ...jsonClone(validClause),
      id: "",
      renderingKey: "",
      effect: { key: "", value: "" },
      refines: [{ key: "" }, { key: "valid", value: "" }],
    };
    expect(issueKeys(issuesFor(input))).toEqual([
      "authored-data|E-EMPTY-STRING|$.effect.key",
      "authored-data|E-EMPTY-STRING|$.effect.value",
      "authored-data|E-EMPTY-STRING|$.id",
      "authored-data|E-EMPTY-STRING|$.refines[0].key",
      "authored-data|E-EMPTY-STRING|$.refines[1].value",
      "authored-data|E-EMPTY-STRING|$.renderingKey",
    ]);
  });

  it("sorts independent sibling issues regardless of key insertion order", () => {
    const first = {
      extra: true,
      ...jsonClone(validClause),
      section: 11,
      id: "",
      order: "20",
    };
    const valid = jsonClone(validClause);
    const second: Record<string, unknown> = {
      order: "20",
      id: "",
      section: 11,
      effect: valid.effect,
      renderingKey: valid.renderingKey,
      whenAll: valid.whenAll,
      authority: valid.authority,
      origin: valid.origin,
      extra: true,
    };
    expect(issueKeys(issuesFor(first))).toEqual(issueKeys(issuesFor(second)));
  });
});
