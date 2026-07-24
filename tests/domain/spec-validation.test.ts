import { describe, expect, it } from "vitest";

import {
  CONDITION_PATHS,
  RENDER_VALUE_PATHS,
  validateLimitationSpec,
  validateSummaryItemSpec,
  type LimitationSpec,
  type SummaryItemSpec,
  type ValidationIssue,
} from "../../src/domain";
import { jsonClone } from "../fixtures/configurations";

const validSummary: SummaryItemSpec = {
  id: "summary.intent",
  order: 10,
  whenAll: [
    {
      path: "recipe.id",
      op: "eq",
      value: "written-translator",
    },
  ],
  values: {
    home: "home.autonym",
    relationship: "socialContext.relationship",
  },
};

const validLimitation: LimitationSpec = {
  code: "L-GENERIC-PAIR",
  order: 90,
  whenAll: [{ path: "resolved.pairPack", op: "absent" }],
  renderingKey: "limitation.generic-pair",
};

function summaryIssues(input: unknown): readonly ValidationIssue[] {
  const result = validateSummaryItemSpec(input);
  expect(result.ok).toBe(false);
  return result.ok ? [] : result.issues;
}

function limitationIssues(input: unknown): readonly ValidationIssue[] {
  const result = validateLimitationSpec(input);
  expect(result.ok).toBe(false);
  return result.ok ? [] : result.issues;
}

function issueKeys(issues: readonly ValidationIssue[]): string[] {
  return issues.map((item) => `${item.stage}|${item.code}|${item.path}`);
}

describe("valid authored specs", () => {
  it("reconstructs exact fresh summary and limitation specs", () => {
    const summaryInput = jsonClone(validSummary);
    const limitationInput = jsonClone(validLimitation);
    const summary = validateSummaryItemSpec(summaryInput);
    const limitation = validateLimitationSpec(limitationInput);
    expect(summary).toEqual({ ok: true, value: validSummary });
    expect(limitation).toEqual({ ok: true, value: validLimitation });
    if (summary.ok && limitation.ok) {
      expect(summary.value).not.toBe(summaryInput);
      expect(summary.value.whenAll).not.toBe(summaryInput.whenAll);
      expect(summary.value.values).not.toBe(summaryInput.values);
      expect(limitation.value).not.toBe(limitationInput);
      expect(limitation.value.whenAll).not.toBe(limitationInput.whenAll);
    }
  });

  it("accepts empty value maps and empty all-of conjunctions", () => {
    const input = { ...jsonClone(validSummary), whenAll: [], values: {} };
    expect(validateSummaryItemSpec(input)).toEqual({
      ok: true,
      value: input,
    });
  });

  it("accepts every closed condition/render value path", () => {
    const paths = [...new Set([...CONDITION_PATHS, ...RENDER_VALUE_PATHS])];
    const values = Object.fromEntries(
      paths.map((path, index) => [`value.${String(index).padStart(3, "0")}`, path]),
    );
    const result = validateSummaryItemSpec({
      ...jsonClone(validSummary),
      values,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(Object.values(result.value.values)).toEqual(paths);
    }
  });

  it("preserves condition order without evaluating conditions", () => {
    const whenAll = [
      {
        path: "socialContext.relationship",
        op: "in",
        values: ["family", "friend"],
      },
      { path: "resolved.pairPack", op: "present" },
      { path: "recipe.id", op: "eq", value: "written-translator" },
    ];
    const summary = validateSummaryItemSpec({
      ...jsonClone(validSummary),
      whenAll,
    });
    const limitation = validateLimitationSpec({
      ...jsonClone(validLimitation),
      whenAll,
    });
    expect(summary.ok && summary.value.whenAll).toEqual(whenAll);
    expect(limitation.ok && limitation.value.whenAll).toEqual(whenAll);
  });
});

describe("canonical summary value maps", () => {
  it("canonicalizes integer-like and other names independent of insertion", () => {
    const firstValues: Record<string, string> = {};
    firstValues.b = "recipe.id";
    firstValues["10"] = "home.id";
    firstValues.a = "target.id";
    firstValues["2"] = "support.tier";

    const secondValues: Record<string, string> = {};
    secondValues["2"] = "support.tier";
    secondValues.a = "target.id";
    secondValues["10"] = "home.id";
    secondValues.b = "recipe.id";

    const first = validateSummaryItemSpec({
      ...jsonClone(validSummary),
      values: firstValues,
    });
    const second = validateSummaryItemSpec({
      ...jsonClone(validSummary),
      values: secondValues,
    });
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(Object.keys(first.value.values)).toEqual(["2", "10", "a", "b"]);
      expect(first.value).toEqual(second.value);
      expect(JSON.stringify(first.value)).toBe(JSON.stringify(second.value));
    }
  });

  it("accepts a null-prototype map and returns an ordinary detached map", () => {
    const values = Object.assign(
      Object.create(null) as Record<string, string>,
      { toString: "recipe.id", home: "home.id" },
    );
    const result = validateSummaryItemSpec({
      ...jsonClone(validSummary),
      values,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(Object.getPrototypeOf(result.value.values)).toBe(
        Object.prototype,
      );
      expect(Object.hasOwn(result.value.values, "toString")).toBe(true);
      expect(result.value.values).not.toBe(values);
    }
  });

  it("rejects unsafe dynamic shapes without invoking getters", () => {
    let getterCalls = 0;
    const values = { home: "home.id" } as Record<PropertyKey, unknown>;
    Object.defineProperty(values, "secret", {
      enumerable: true,
      get() {
        getterCalls += 1;
        return "target.id";
      },
    });
    Object.defineProperty(values, "hidden", {
      enumerable: false,
      value: "recipe.id",
    });
    Object.defineProperty(values, "constructor", {
      enumerable: true,
      value: "support.tier",
    });
    values[Symbol("private")] = "recipe.id";

    expect(
      issueKeys(
        summaryIssues({ ...jsonClone(validSummary), values }),
      ),
    ).toEqual([
      "input-shape|E-ACCESSOR-FIELD|$.values.secret",
      "input-shape|E-NONENUMERABLE-FIELD|$.values.hidden",
      "input-shape|E-SYMBOL-FIELD|$.values",
      'input-shape|E-UNSAFE-KEY|$.values["constructor"]',
    ]);
    expect(getterCalls).toBe(0);
  });
});

describe("spec intrinsic failures", () => {
  it("rejects empty names, wrong primitives, and unknown mapped paths", () => {
    const values: Record<string, unknown> = {
      "": "recipe.id",
      badPath: "home.name",
      badPrimitive: 7,
    };
    expect(
      issueKeys(summaryIssues({ ...jsonClone(validSummary), values })),
    ).toEqual([
      "input-shape|E-EXPECTED-STRING|$.values.badPrimitive",
      'authored-data|E-EMPTY-MAP-KEY|$.values[""]',
      "authored-data|E-INVALID-MAPPED-PATH|$.values.badPath",
    ]);
  });

  it.each([
    [
      "summary order fraction",
      () => summaryIssues({ ...jsonClone(validSummary), order: 1.5 }),
      "input-shape|E-EXPECTED-SAFE-INTEGER|$.order",
    ],
    [
      "limitation order infinity",
      () =>
        limitationIssues({
          ...jsonClone(validLimitation),
          order: Number.POSITIVE_INFINITY,
        }),
      "input-shape|E-EXPECTED-SAFE-INTEGER|$.order",
    ],
    [
      "summary empty id",
      () => summaryIssues({ ...jsonClone(validSummary), id: "" }),
      "authored-data|E-EMPTY-STRING|$.id",
    ],
    [
      "limitation empty code",
      () => limitationIssues({ ...jsonClone(validLimitation), code: "" }),
      "authored-data|E-EMPTY-STRING|$.code",
    ],
    [
      "limitation empty rendering key",
      () =>
        limitationIssues({ ...jsonClone(validLimitation), renderingKey: "" }),
      "authored-data|E-EMPTY-STRING|$.renderingKey",
    ],
  ])("rejects %s", (_label, run, expected) => {
    expect(issueKeys(run())).toEqual([expected]);
  });

  it("reuses exact condition grammar and issue paths", () => {
    const whenAll = [
      { path: "recipe.id", op: "in", values: ["b", "a"] },
      { path: "recipe.id", op: "present" },
    ];
    const expected = [
      "authored-data|E-INVALID-PRESENCE-PATH|$.whenAll[1].path",
      "authored-data|E-UNSORTED-IN-VALUES|$.whenAll[0].values",
    ];
    expect(
      issueKeys(
        summaryIssues({ ...jsonClone(validSummary), whenAll }),
      ),
    ).toEqual(expected);
    expect(
      issueKeys(
        limitationIssues({ ...jsonClone(validLimitation), whenAll }),
      ),
    ).toEqual(expected);
  });

  it("rejects unknown/missing root fields and wrong value-map shape", () => {
    const input = {
      order: validSummary.order,
      whenAll: validSummary.whenAll,
      values: [],
      extra: true,
    };
    expect(issueKeys(summaryIssues(input))).toEqual([
      "input-shape|E-EXPECTED-RECORD|$.values",
      "input-shape|E-MISSING-FIELD|$.id",
      "input-shape|E-UNKNOWN-FIELD|$.extra",
    ]);
  });

  it("orders independent sibling issues regardless of insertion order", () => {
    const first = {
      extra: true,
      values: { bad: "not.a.path" },
      whenAll: {},
      order: "10",
      id: "",
    };
    const second = {
      id: "",
      order: "10",
      whenAll: {},
      values: { bad: "not.a.path" },
      extra: true,
    };
    expect(issueKeys(summaryIssues(first))).toEqual(
      issueKeys(summaryIssues(second)),
    );
  });
});
