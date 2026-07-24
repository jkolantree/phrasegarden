import { describe, expect, it } from "vitest";

import {
  validateSummaryCatalog,
  type SummaryCatalog,
  type ValidationIssue,
} from "../../src/domain";
import { jsonClone } from "../fixtures/configurations";

const exactLiteral =
  "{{summary}}\n```txt\r\n日本語 e\u0301 🌿 \u2067RTL\u2069\n```";

const validCatalog: SummaryCatalog = {
  locale: "en",
  version: "0.0.0-test",
  messages: [
    {
      id: "summary.intent",
      parts: [
        { kind: "literal", text: exactLiteral },
        { kind: "value", name: "home" },
        { kind: "literal", text: "" },
        { kind: "value", name: "home" },
      ],
    },
    {
      id: "summary.empty",
      parts: [],
    },
  ],
};

function issuesFor(input: unknown): readonly ValidationIssue[] {
  const result = validateSummaryCatalog(input);
  expect(result.ok).toBe(false);
  return result.ok ? [] : result.issues;
}

function issueKeys(issues: readonly ValidationIssue[]): string[] {
  return issues.map((item) => `${item.stage}|${item.code}|${item.path}`);
}

describe("valid summary catalogs", () => {
  it("preserves exact literal bytes, repeated value names, and array order", () => {
    const result = validateSummaryCatalog(validCatalog);
    expect(result).toEqual({ ok: true, value: validCatalog });
    if (result.ok) {
      expect(result.value.messages[0]?.parts[0]).toEqual({
        kind: "literal",
        text: exactLiteral,
      });
      expect(result.value.messages[0]?.parts[1]).toEqual({
        kind: "value",
        name: "home",
      });
      expect(result.value.messages[0]?.parts[3]).toEqual({
        kind: "value",
        name: "home",
      });
    }
  });

  it("accepts empty message and part arrays structurally", () => {
    expect(
      validateSummaryCatalog({
        locale: "en",
        version: "0.0.0-test",
        messages: [],
      }),
    ).toEqual({
      ok: true,
      value: {
        locale: "en",
        version: "0.0.0-test",
        messages: [],
      },
    });
    expect(validateSummaryCatalog(validCatalog).ok).toBe(true);
  });

  it("returns a deeply detached catalog", () => {
    const input = jsonClone(validCatalog);
    const result = validateSummaryCatalog(input);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value).not.toBe(input);
    expect(result.value.messages).not.toBe(input.messages);
    expect(result.value.messages[0]?.parts).not.toBe(
      input.messages[0]?.parts,
    );
    Reflect.set(input.messages[0]!.parts[0]!, "text", "changed");
    expect(result.value.messages[0]?.parts[0]).toEqual({
      kind: "literal",
      text: exactLiteral,
    });
  });
});

describe("catalog intrinsic failures", () => {
  it.each([
    ["null root", null, "input-shape|E-EXPECTED-RECORD|$"],
    [
      "record messages",
      { locale: "en", version: "test", messages: {} },
      "input-shape|E-EXPECTED-ARRAY|$.messages",
    ],
    [
      "primitive message",
      { locale: "en", version: "test", messages: [7] },
      "input-shape|E-EXPECTED-RECORD|$.messages[0]",
    ],
    [
      "primitive part",
      {
        locale: "en",
        version: "test",
        messages: [{ id: "message", parts: [7] }],
      },
      "input-shape|E-EXPECTED-RECORD|$.messages[0].parts[0]",
    ],
  ])("rejects a %s shape", (_label, input, expected) => {
    expect(issueKeys(issuesFor(input))).toEqual([expected]);
  });

  it("rejects duplicate message IDs at every later occurrence", () => {
    const message = jsonClone(validCatalog.messages[0]);
    const input = { ...jsonClone(validCatalog), messages: [message, message, message] };
    expect(issueKeys(issuesFor(input))).toEqual([
      "authored-data|E-DUPLICATE-SUMMARY-MESSAGE-ID|$.messages[1].id",
      "authored-data|E-DUPLICATE-SUMMARY-MESSAGE-ID|$.messages[2].id",
    ]);
  });

  it("requires nonempty catalog/message/value identities but allows empty literals", () => {
    const input = {
      locale: "",
      version: "",
      messages: [
        {
          id: "",
          parts: [
            { kind: "literal", text: "" },
            { kind: "value", name: "" },
          ],
        },
      ],
    };
    expect(issueKeys(issuesFor(input))).toEqual([
      "artifact-identity|E-EMPTY-STRING|$.locale",
      "artifact-identity|E-EMPTY-STRING|$.version",
      "authored-data|E-EMPTY-STRING|$.messages[0].id",
      "authored-data|E-EMPTY-STRING|$.messages[0].parts[1].name",
    ]);
  });

  it("rejects branch-disallowed and truly unknown part fields once", () => {
    const input = {
      ...jsonClone(validCatalog),
      messages: [
        {
          id: "invalid",
          parts: [
            {
              kind: "literal",
              text: "literal",
              name: "home",
              extra: true,
            },
            {
              kind: "value",
              name: "home",
              text: "not-allowed",
            },
          ],
        },
      ],
    };
    expect(issueKeys(issuesFor(input))).toEqual([
      "input-shape|E-UNKNOWN-FIELD|$.messages[0].parts[0].extra",
      "input-shape|E-UNKNOWN-FIELD|$.messages[0].parts[0].name",
      "input-shape|E-UNKNOWN-FIELD|$.messages[0].parts[1].text",
    ]);
  });

  it("rejects unknown and non-string part discriminators", () => {
    const input = {
      ...jsonClone(validCatalog),
      messages: [
        {
          id: "invalid",
          parts: [
            { kind: "placeholder", name: "home" },
            { kind: 7, text: "literal" },
          ],
        },
      ],
    };
    expect(issueKeys(issuesFor(input))).toEqual([
      "input-shape|E-EXPECTED-STRING|$.messages[0].parts[1].kind",
      "authored-data|E-INVALID-ENUM|$.messages[0].parts[0].kind",
    ]);
  });

  it("rejects missing fields and wrong collection shapes", () => {
    const input = {
      locale: "en",
      messages: [
        {
          id: "invalid",
          parts: {},
        },
      ],
      extra: true,
    };
    expect(issueKeys(issuesFor(input))).toEqual([
      "input-shape|E-EXPECTED-ARRAY|$.messages[0].parts",
      "input-shape|E-MISSING-FIELD|$.version",
      "input-shape|E-UNKNOWN-FIELD|$.extra",
    ]);
  });

  it("does not invoke message or part-index getters", () => {
    let getterCalls = 0;
    const parts: unknown[] = [];
    Object.defineProperty(parts, "0", {
      enumerable: true,
      get() {
        getterCalls += 1;
        return { kind: "literal", text: "hidden" };
      },
    });
    const input = {
      locale: "en",
      version: "0.0.0-test",
      messages: [{ id: "unsafe", parts }],
    };
    expect(issueKeys(issuesFor(input))).toEqual([
      "input-shape|E-ACCESSOR-FIELD|$.messages[0].parts[0]",
      "input-shape|E-SPARSE-ARRAY|$.messages[0].parts",
    ]);
    expect(getterCalls).toBe(0);
  });

  it("sorts sibling issues independently of record insertion order", () => {
    const first = {
      extra: true,
      messages: {},
      version: "",
      locale: 7,
    };
    const second = {
      locale: 7,
      version: "",
      messages: {},
      extra: true,
    };
    expect(issueKeys(issuesFor(first))).toEqual(issueKeys(issuesFor(second)));
  });
});
