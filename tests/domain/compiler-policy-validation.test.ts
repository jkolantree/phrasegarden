import { describe, expect, it } from "vitest";

import {
  validateCompilerPolicy,
  type Clause,
  type CompilerPolicy,
  type LimitationSpec,
  type SummaryItemSpec,
  type ValidationIssue,
} from "../../src/domain";
import { jsonClone } from "../fixtures/configurations";

const invariantClause: Clause = {
  id: "invariant.meaning",
  origin: "invariant",
  authority: "invariant",
  section: 1,
  order: 10,
  whenAll: [],
  renderingKey: "invariant.meaning",
  effect: { key: "meaning.preservation", value: "required" },
};

const summaryItem: SummaryItemSpec = {
  id: "summary.meaning",
  order: 10,
  whenAll: [],
  values: { recipe: "recipe.id" },
};

const limitation: LimitationSpec = {
  code: "L-GENERIC",
  order: 90,
  whenAll: [{ path: "resolved.pairPack", op: "absent" }],
  renderingKey: "limitation.generic",
};

const validPolicy: CompilerPolicy = {
  version: "policy-0.0.0-test",
  compatibleCompilerVersion: "compiler-0.0.0-test",
  invariantClauses: [invariantClause],
  summaryItems: [summaryItem],
  knownLimitations: [limitation],
};

function issuesFor(input: unknown): readonly ValidationIssue[] {
  const result = validateCompilerPolicy(input);
  expect(result.ok).toBe(false);
  return result.ok ? [] : result.issues;
}

function issueKeys(issues: readonly ValidationIssue[]): string[] {
  return issues.map((item) => `${item.stage}|${item.code}|${item.path}`);
}

describe("valid compiler policies", () => {
  it("returns an exact deeply detached policy", () => {
    const input = jsonClone(validPolicy);
    const result = validateCompilerPolicy(input);
    expect(result).toEqual({ ok: true, value: validPolicy });
    if (!result.ok) {
      return;
    }
    expect(result.value).not.toBe(input);
    expect(result.value.invariantClauses).not.toBe(input.invariantClauses);
    expect(result.value.invariantClauses[0]).not.toBe(
      input.invariantClauses[0],
    );
    expect(result.value.summaryItems[0]?.values).not.toBe(
      input.summaryItems[0]?.values,
    );
    Reflect.set(input.invariantClauses[0]!.effect, "value", "changed");
    expect(result.value.invariantClauses[0]?.effect.value).toBe("required");
  });

  it("accepts structurally empty child arrays", () => {
    const input = {
      version: "policy-empty",
      compatibleCompilerVersion: "compiler-any",
      invariantClauses: [],
      summaryItems: [],
      knownLimitations: [],
    };
    expect(validateCompilerPolicy(input)).toEqual({ ok: true, value: input });
  });

  it("treats versions as immutable nonempty strings, not semver", () => {
    const input = {
      ...jsonClone(validPolicy),
      version: "policy/日本語 @ immutable",
      compatibleCompilerVersion: "compiler:exact candidate",
    };
    expect(validateCompilerPolicy(input)).toEqual({ ok: true, value: input });
  });

  it("preserves child and child-internal authored order", () => {
    const secondClause = {
      ...jsonClone(invariantClause),
      id: "invariant.second",
      order: -5,
      whenAll: [
        { path: "recipe.id", op: "eq", value: "written-translator" },
        { path: "resolved.pairPack", op: "present" },
      ],
    };
    const input = {
      ...jsonClone(validPolicy),
      invariantClauses: [secondClause, invariantClause],
    };
    const result = validateCompilerPolicy(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.invariantClauses.map((clause) => clause.id)).toEqual([
        "invariant.second",
        "invariant.meaning",
      ]);
      expect(result.value.invariantClauses[0]?.whenAll).toEqual(
        secondClause.whenAll,
      );
    }
  });
});

describe("compiler-policy child validation", () => {
  it("rebases exact child issues under container indexes", () => {
    const clause = {
      ...jsonClone(invariantClause),
      whenAll: [{ path: "recipe.id", op: "in", values: ["b", "a"] }],
    };
    const summary = {
      ...jsonClone(summaryItem),
      values: { bad: "not.a.path" },
    };
    const knownLimitation = {
      ...jsonClone(limitation),
      renderingKey: "",
    };
    const input = {
      ...jsonClone(validPolicy),
      invariantClauses: [clause],
      summaryItems: [summary],
      knownLimitations: [knownLimitation],
    };
    expect(issueKeys(issuesFor(input))).toEqual([
      "authored-data|E-EMPTY-STRING|$.knownLimitations[0].renderingKey",
      "authored-data|E-INVALID-MAPPED-PATH|$.summaryItems[0].values.bad",
      "authored-data|E-UNSORTED-IN-VALUES|$.invariantClauses[0].whenAll[0].values",
    ]);
  });

  it("rejects every intrinsically valid non-invariant clause origin", () => {
    const clauses: Clause[] = [
      {
        ...jsonClone(invariantClause),
        id: "recipe.rule",
        origin: "recipe",
        authority: "modality",
      },
      {
        ...jsonClone(invariantClause),
        id: "profile.rule",
        origin: "profile",
        authority: "profile",
      },
      {
        ...jsonClone(invariantClause),
        id: "pair.rule",
        origin: "pair-pack",
        authority: "pair-pack",
      },
    ];
    expect(
      issueKeys(
        issuesFor({ ...jsonClone(validPolicy), invariantClauses: clauses }),
      ),
    ).toEqual([
      "authored-data|E-POLICY-CLAUSE-ORIGIN|$.invariantClauses[0].origin",
      "authored-data|E-POLICY-CLAUSE-ORIGIN|$.invariantClauses[1].origin",
      "authored-data|E-POLICY-CLAUSE-ORIGIN|$.invariantClauses[2].origin",
    ]);
  });

  it("rejects each later duplicate local child identity", () => {
    const input = {
      ...jsonClone(validPolicy),
      invariantClauses: [invariantClause, invariantClause, invariantClause],
      summaryItems: [summaryItem, summaryItem, summaryItem],
      knownLimitations: [limitation, limitation, limitation],
    };
    expect(issueKeys(issuesFor(input))).toEqual([
      "authored-data|E-DUPLICATE-CLAUSE-ID|$.invariantClauses[1].id",
      "authored-data|E-DUPLICATE-CLAUSE-ID|$.invariantClauses[2].id",
      "authored-data|E-DUPLICATE-LIMITATION-CODE|$.knownLimitations[1].code",
      "authored-data|E-DUPLICATE-LIMITATION-CODE|$.knownLimitations[2].code",
      "authored-data|E-DUPLICATE-SUMMARY-ID|$.summaryItems[1].id",
      "authored-data|E-DUPLICATE-SUMMARY-ID|$.summaryItems[2].id",
    ]);
    const result = validateCompilerPolicy(input);
    if (!result.ok) {
      expect(
        result.issues.find(
          (item) =>
            item.code === "E-DUPLICATE-LIMITATION-CODE" &&
            item.path === "$.knownLimitations[1].code",
        )?.values,
      ).toEqual({ code: "L-GENERIC", firstIndex: 0 });
    }
  });

  it("never retains invalid children", () => {
    const input = {
      ...jsonClone(validPolicy),
      invariantClauses: [
        invariantClause,
        { ...jsonClone(invariantClause), id: "", order: "ten" },
      ],
    };
    const result = validateCompilerPolicy(input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(issueKeys(result.issues)).toEqual([
        "input-shape|E-EXPECTED-SAFE-INTEGER|$.invariantClauses[1].order",
        "authored-data|E-EMPTY-STRING|$.invariantClauses[1].id",
      ]);
    }
  });
});

describe("compiler-policy root failures", () => {
  it("rejects empty/wrong version fields and exact root/array shapes", () => {
    const input = {
      version: "",
      compatibleCompilerVersion: 7,
      invariantClauses: {},
      summaryItems: [],
      extra: true,
    };
    expect(issueKeys(issuesFor(input))).toEqual([
      "input-shape|E-EXPECTED-ARRAY|$.invariantClauses",
      "input-shape|E-EXPECTED-STRING|$.compatibleCompilerVersion",
      "input-shape|E-MISSING-FIELD|$.knownLimitations",
      "input-shape|E-UNKNOWN-FIELD|$.extra",
      "artifact-identity|E-EMPTY-STRING|$.version",
    ]);
  });

  it("does not invoke child-index getters", () => {
    let getterCalls = 0;
    const clauses: unknown[] = [];
    Object.defineProperty(clauses, "0", {
      enumerable: true,
      get() {
        getterCalls += 1;
        return invariantClause;
      },
    });
    const input = { ...jsonClone(validPolicy), invariantClauses: clauses };
    expect(issueKeys(issuesFor(input))).toEqual([
      "input-shape|E-ACCESSOR-FIELD|$.invariantClauses[0]",
      "input-shape|E-SPARSE-ARRAY|$.invariantClauses",
    ]);
    expect(getterCalls).toBe(0);
  });

  it("sorts independent root issues regardless of key insertion order", () => {
    const first = {
      extra: true,
      knownLimitations: {},
      summaryItems: [],
      invariantClauses: [],
      compatibleCompilerVersion: "",
      version: 7,
    };
    const second = {
      version: 7,
      compatibleCompilerVersion: "",
      invariantClauses: [],
      summaryItems: [],
      knownLimitations: {},
      extra: true,
    };
    expect(issueKeys(issuesFor(first))).toEqual(issueKeys(issuesFor(second)));
  });
});
