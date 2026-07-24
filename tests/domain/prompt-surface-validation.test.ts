import { describe, expect, it } from "vitest";

import {
  RENDER_VALUE_FORMATS,
  RENDER_VALUE_PATHS,
  validatePromptSurface,
  type PromptSurface,
  type ValidationIssue,
} from "../../src/domain";
import { jsonClone } from "../fixtures/configurations";

const literalEvidence =
  "{{source}}\n```txt\r\n彼女 e\u0301 🌱 \u2067RTL\u2069\n```";

const validPromptSurface: PromptSurface = {
  id: "instructions-en",
  locale: "en",
  version: "0.0.0-test",
  renderings: [
    {
      key: "section.identity",
      parts: [
        { kind: "literal", text: literalEvidence },
        { kind: "value", path: "home.autonym", format: "inline-code" },
      ],
    },
    {
      key: "section.empty-literal",
      parts: [{ kind: "literal", text: "" }],
    },
  ],
};

function issuesFor(input: unknown): readonly ValidationIssue[] {
  const result = validatePromptSurface(input);
  expect(result.ok).toBe(false);
  return result.ok ? [] : result.issues;
}

function issueKeys(issues: readonly ValidationIssue[]): string[] {
  return issues.map((item) => `${item.stage}|${item.code}|${item.path}`);
}

function withRenderings(renderings: unknown): Record<string, unknown> {
  return {
    id: validPromptSurface.id,
    locale: validPromptSurface.locale,
    version: validPromptSurface.version,
    renderings,
  };
}

describe("valid prompt surfaces", () => {
  it("preserves exact literal bytes, order, and empty literal text", () => {
    const result = validatePromptSurface(validPromptSurface);
    expect(result).toEqual({ ok: true, value: validPromptSurface });
    if (!result.ok) {
      return;
    }
    expect(result.value.renderings[0]?.parts[0]).toEqual({
      kind: "literal",
      text: literalEvidence,
    });
    expect(result.value.renderings.map((item) => item.key)).toEqual([
      "section.identity",
      "section.empty-literal",
    ]);
  });

  it("accepts every closed value path with both formats", () => {
    const renderings = RENDER_VALUE_PATHS.map((path, index) => ({
      key: `value.${index}`,
      parts: RENDER_VALUE_FORMATS.map((format) => ({
        kind: "value",
        path,
        format,
      })),
    }));
    const result = validatePromptSurface(withRenderings(renderings));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.renderings).toEqual(renderings);
    }
  });

  it("returns a deeply detached exact value", () => {
    const input = jsonClone(validPromptSurface);
    const result = validatePromptSurface(input);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value).not.toBe(input);
    expect(result.value.renderings).not.toBe(input.renderings);
    expect(result.value.renderings[0]?.parts).not.toBe(
      input.renderings[0]?.parts,
    );
    Reflect.set(input.renderings[0]!.parts[0]!, "text", "changed");
    expect(result.value.renderings[0]?.parts[0]).toEqual({
      kind: "literal",
      text: literalEvidence,
    });
  });

  it("accepts a null-prototype record without retaining it", () => {
    const input = Object.assign(
      Object.create(null) as Record<string, unknown>,
      jsonClone(validPromptSurface),
    );
    const result = validatePromptSurface(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(Object.getPrototypeOf(result.value)).toBe(Object.prototype);
      expect(result.value).toEqual(validPromptSurface);
    }
  });
});

describe("fail-closed record inspection", () => {
  it.each([
    ["null", null, "E-EXPECTED-RECORD"],
    ["primitive", 7, "E-EXPECTED-RECORD"],
    ["array", [], "E-EXPECTED-RECORD"],
    ["custom prototype", Object.create({}), "E-UNSAFE-PROTOTYPE"],
  ])("rejects %s roots", (_label, input, code) => {
    expect(issueKeys(issuesFor(input))).toContain(`input-shape|${code}|$`);
  });

  it("does not invoke getters or ordinary proxy get traps", () => {
    let getterCalls = 0;
    const accessorInput = jsonClone(validPromptSurface) as unknown as Record<
      string,
      unknown
    >;
    Object.defineProperty(accessorInput, "id", {
      enumerable: true,
      get() {
        getterCalls += 1;
        return "instructions-en";
      },
    });
    expect(issueKeys(issuesFor(accessorInput))).toContain(
      "input-shape|E-ACCESSOR-FIELD|$.id",
    );
    expect(getterCalls).toBe(0);

    let getTrapCalls = 0;
    const proxy = new Proxy(jsonClone(validPromptSurface), {
      get(target, property, receiver) {
        getTrapCalls += 1;
        return Reflect.get(target, property, receiver);
      },
    });
    expect(validatePromptSurface(proxy).ok).toBe(true);
    expect(getTrapCalls).toBe(0);
  });

  it.each([
    [
      "getPrototypeOf",
      new Proxy({}, { getPrototypeOf: () => { throw new Error("blocked"); } }),
    ],
    [
      "ownKeys",
      new Proxy({}, { ownKeys: () => { throw new Error("blocked"); } }),
    ],
    [
      "descriptor",
      new Proxy(
        { id: "instructions-en" },
        {
          getOwnPropertyDescriptor: () => {
            throw new Error("blocked");
          },
        },
      ),
    ],
  ])("contains a throwing %s trap", (_label, input) => {
    expect(issueKeys(issuesFor(input))).toEqual([
      "input-shape|E-UNSAFE-OBJECT|$",
    ]);
  });

  it("contains revoked root proxies", () => {
    const revocable = Proxy.revocable({}, {});
    revocable.revoke();
    expect(issueKeys(issuesFor(revocable.proxy))).toEqual([
      "input-shape|E-UNSAFE-OBJECT|$",
    ]);
  });

  it("rejects an unsafe prototype before asking for own keys", () => {
    let ownKeyCalls = 0;
    const input = new Proxy(Object.create({}), {
      ownKeys(target) {
        ownKeyCalls += 1;
        return Reflect.ownKeys(target);
      },
    });
    expect(issueKeys(issuesFor(input))).toEqual([
      "input-shape|E-UNSAFE-PROTOTYPE|$",
    ]);
    expect(ownKeyCalls).toBe(0);
  });

  it("rejects symbols, unknown fields, and non-enumerable known fields", () => {
    const input = jsonClone(validPromptSurface) as unknown as Record<
      PropertyKey,
      unknown
    >;
    input.extra = true;
    input[Symbol("private")] = true;
    input[Symbol("second-private")] = true;
    Object.defineProperty(input, "locale", {
      value: "en",
      enumerable: false,
    });
    expect(issueKeys(issuesFor(input))).toEqual([
      "input-shape|E-NONENUMERABLE-FIELD|$.locale",
      "input-shape|E-SYMBOL-FIELD|$",
      "input-shape|E-UNKNOWN-FIELD|$.extra",
    ]);
  });
});

describe("fail-closed array inspection", () => {
  it.each([
    ["record", {}, "E-EXPECTED-ARRAY"],
    ["sparse", new Array(2), "E-SPARSE-ARRAY"],
    [
      "custom prototype",
      Object.setPrototypeOf(jsonClone(validPromptSurface.renderings), null),
      "E-UNSAFE-PROTOTYPE",
    ],
  ])("rejects a %s rendering collection", (_label, renderings, code) => {
    expect(issueKeys(issuesFor(withRenderings(renderings)))).toContain(
      `input-shape|${code}|$.renderings`,
    );
  });

  it("rejects accessor and non-enumerable indexes without reading them", () => {
    let getterCalls = 0;
    const accessorArray: unknown[] = [];
    Object.defineProperty(accessorArray, "0", {
      configurable: true,
      enumerable: true,
      get() {
        getterCalls += 1;
        return validPromptSurface.renderings[0];
      },
    });
    const nonEnumerableArray = [validPromptSurface.renderings[0]];
    Object.defineProperty(nonEnumerableArray, "0", {
      value: validPromptSurface.renderings[0],
      enumerable: false,
    });

    expect(issueKeys(issuesFor(withRenderings(accessorArray)))).toEqual([
      "input-shape|E-ACCESSOR-FIELD|$.renderings[0]",
      "input-shape|E-SPARSE-ARRAY|$.renderings",
    ]);
    expect(getterCalls).toBe(0);
    expect(
      issueKeys(issuesFor(withRenderings(nonEnumerableArray))),
    ).toEqual([
      "input-shape|E-NONENUMERABLE-FIELD|$.renderings[0]",
      "input-shape|E-SPARSE-ARRAY|$.renderings",
    ]);
  });

  it("rejects extra and symbol array properties", () => {
    const renderings = jsonClone(validPromptSurface.renderings) as unknown[];
    Object.defineProperty(renderings, "extra", {
      value: true,
      enumerable: true,
    });
    Object.defineProperty(renderings, "constructor", {
      value: true,
      enumerable: true,
    });
    Object.defineProperty(renderings, Symbol("private"), {
      value: true,
      enumerable: true,
    });
    Object.defineProperty(renderings, Symbol("second-private"), {
      value: true,
      enumerable: true,
    });
    expect(issueKeys(issuesFor(withRenderings(renderings)))).toEqual([
      "input-shape|E-SYMBOL-FIELD|$.renderings",
      "input-shape|E-UNKNOWN-FIELD|$.renderings.extra",
      'input-shape|E-UNSAFE-KEY|$.renderings["constructor"]',
    ]);
  });

  it("contains revoked and throwing array proxies", () => {
    const revoked = Proxy.revocable([], {});
    revoked.revoke();
    expect(issueKeys(issuesFor(withRenderings(revoked.proxy)))).toEqual([
      "input-shape|E-UNSAFE-OBJECT|$.renderings",
    ]);

    const throwing = new Proxy([], {
      ownKeys: () => {
        throw new Error("blocked");
      },
    });
    expect(issueKeys(issuesFor(withRenderings(throwing)))).toEqual([
      "input-shape|E-UNSAFE-OBJECT|$.renderings",
    ]);
  });

  it("rejects a proxy-reported malformed array length", () => {
    const malformedLength = new Proxy([], {
      getOwnPropertyDescriptor(target, property) {
        const descriptor = Reflect.getOwnPropertyDescriptor(target, property);
        return property === "length" && descriptor !== undefined
          ? { ...descriptor, value: -1 }
          : descriptor;
      },
    });
    expect(issueKeys(issuesFor(withRenderings(malformedLength)))).toEqual([
      "input-shape|E-UNSAFE-ARRAY-LENGTH|$.renderings",
    ]);
  });
});

describe("prompt-surface authored rules", () => {
  it("rejects empty identity fields and invalid value-part enums", () => {
    const input = {
      id: "",
      locale: "",
      version: "",
      renderings: [
        {
          key: "invalid-value",
          parts: [{ kind: "value", path: "home.name", format: "markdown" }],
        },
      ],
    };
    expect(issueKeys(issuesFor(input))).toEqual([
      "artifact-identity|E-EMPTY-STRING|$.id",
      "artifact-identity|E-EMPTY-STRING|$.locale",
      "artifact-identity|E-EMPTY-STRING|$.version",
      "authored-data|E-INVALID-ENUM|$.renderings[0].parts[0].format",
      "authored-data|E-INVALID-ENUM|$.renderings[0].parts[0].path",
    ]);
  });

  it("rejects duplicate rendering keys at every later occurrence", () => {
    const rendering = jsonClone(validPromptSurface.renderings[0]);
    const input = withRenderings([rendering, rendering, rendering]);
    expect(issueKeys(issuesFor(input))).toEqual([
      "authored-data|E-DUPLICATE-RENDERING-KEY|$.renderings[1].key",
      "authored-data|E-DUPLICATE-RENDERING-KEY|$.renderings[2].key",
    ]);
  });

  it("reports variant-disallowed and truly unknown part fields once", () => {
    const input = withRenderings([
      {
        key: "invalid-literal",
        parts: [
          {
            kind: "literal",
            text: "literal",
            path: "home.id",
            extra: true,
          },
        ],
      },
    ]);
    expect(issueKeys(issuesFor(input))).toEqual([
      "input-shape|E-UNKNOWN-FIELD|$.renderings[0].parts[0].extra",
      "input-shape|E-UNKNOWN-FIELD|$.renderings[0].parts[0].path",
    ]);
  });

  it("sorts issues independently of object key insertion order", () => {
    const first = {
      extra: true,
      version: "",
      locale: 7,
      id: "",
      renderings: {},
    };
    const second = {
      renderings: {},
      id: "",
      locale: 7,
      version: "",
      extra: true,
    };
    expect(issueKeys(issuesFor(first))).toEqual(issueKeys(issuesFor(second)));
  });
});
