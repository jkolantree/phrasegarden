import { describe, expect, it } from "vitest";

import {
  validateRecipeConfiguration as validateRecipeConfigurationInput,
  type RecipeConfiguration,
  type ValidationIssue,
} from "../../src/domain";
import { canonicalLanguageRegistry } from "../../src/packs";
import {
  jsonClone,
  validInterpreterConfiguration,
  validVoiceConfiguration,
  validWrittenConfiguration,
} from "../fixtures/configurations";

function validateRecipeConfiguration(input: unknown) {
  return validateRecipeConfigurationInput(input, canonicalLanguageRegistry);
}

function issuesFor(input: unknown): readonly ValidationIssue[] {
  const result = validateRecipeConfiguration(input);
  expect(result.ok).toBe(false);
  return result.ok ? [] : result.issues;
}

function issueKeys(issues: readonly ValidationIssue[]): string[] {
  return issues.map(
    (item) => `${item.stage}|${item.code}|${item.path}`,
  );
}

describe("valid recipe configurations", () => {
  it.each([
    ["written", validWrittenConfiguration],
    ["voice", validVoiceConfiguration],
    ["interpreter", validInterpreterConfiguration],
  ] as const)("accepts and reconstructs the %s configuration", (_, input) => {
    const result = validateRecipeConfiguration(input);
    expect(result).toEqual({ ok: true, value: input });
    if (result.ok) {
      expect(result.value).not.toBe(input);
      expect(result.value.languageRegistry).not.toBe(input.languageRegistry);
      expect(result.value.recipe).not.toBe(input.recipe);
      expect(result.value.languages).not.toBe(input.languages);
      expect(result.value.destination).not.toBe(input.destination);
      expect(result.value.settings).not.toBe(input.settings);
    }
  });

  it("accepts a safe null-prototype JSON-like root", () => {
    const input = Object.assign(
      Object.create(null) as Record<string, unknown>,
      validWrittenConfiguration,
    );
    expect(validateRecipeConfiguration(input)).toEqual({
      ok: true,
      value: validWrittenConfiguration,
    });
  });
});

describe("fail-closed object inspection", () => {
  it.each([
    ["null", null, "E-EXPECTED-RECORD"],
    ["array", [], "E-EXPECTED-RECORD"],
    ["date", new Date(0), "E-UNSAFE-PROTOTYPE"],
    [
      "custom prototype",
      Object.create({ schemaVersion: 1 }),
      "E-UNSAFE-PROTOTYPE",
    ],
  ] as const)("rejects a %s root without coercion", (_, input, code) => {
    expect(issuesFor(input).some((item) => item.code === code)).toBe(true);
  });

  it("never invokes an accessor", () => {
    const input = jsonClone(validWrittenConfiguration) as unknown as Record<
      string,
      unknown
    >;
    let getterCalls = 0;
    Object.defineProperty(input, "recipe", {
      enumerable: true,
      get() {
        getterCalls += 1;
        return validWrittenConfiguration.recipe;
      },
    });

    const issues = issuesFor(input);
    expect(getterCalls).toBe(0);
    expect(issueKeys(issues)).toContain(
      "input-shape|E-ACCESSOR-FIELD|$.recipe",
    );
  });

  it("does not use proxy property reads and contains inspection traps", () => {
    let getCalls = 0;
    const readableProxy = new Proxy(jsonClone(validWrittenConfiguration), {
      get(target, property, receiver) {
        getCalls += 1;
        return Reflect.get(target, property, receiver);
      },
    });
    expect(validateRecipeConfiguration(readableProxy).ok).toBe(true);
    expect(getCalls).toBe(0);

    const throwingProxy = new Proxy(
      {},
      {
        getPrototypeOf() {
          throw new Error("inspection trap");
        },
      },
    );
    expect(issueKeys(issuesFor(throwingProxy))).toEqual([
      "input-shape|E-UNSAFE-OBJECT|$",
    ]);

    const revocable = Proxy.revocable({}, {});
    revocable.revoke();
    expect(issueKeys(issuesFor(revocable.proxy))).toEqual([
      "input-shape|E-UNSAFE-OBJECT|$",
    ]);
  });

  it("rejects symbol, non-enumerable, and prototype-pollution keys", () => {
    const input = jsonClone(validWrittenConfiguration) as unknown as Record<
      PropertyKey,
      unknown
    >;
    input[Symbol("hidden")] = true;
    Object.defineProperty(input, "schemaVersion", {
      value: 1,
      enumerable: false,
    });
    Object.defineProperty(input, "__proto__", {
      value: { polluted: true },
      enumerable: true,
    });

    expect(issueKeys(issuesFor(input))).toEqual(
      expect.arrayContaining([
        "input-shape|E-SYMBOL-FIELD|$",
        "input-shape|E-NONENUMERABLE-FIELD|$.schemaVersion",
        "input-shape|E-UNSAFE-KEY|$[\"__proto__\"]",
      ]),
    );
  });

  it("rejects caller-supplied support and review claims as unknown", () => {
    const input = {
      ...jsonClone(validWrittenConfiguration),
      supportTier: "flagship",
      pairPack: { id: "en-ja", version: "forged" },
      reviewBasis: { tier: "flagship" },
    };

    expect(issueKeys(issuesFor(input))).toEqual([
      "input-shape|E-UNKNOWN-FIELD|$.pairPack",
      "input-shape|E-UNKNOWN-FIELD|$.reviewBasis",
      "input-shape|E-UNKNOWN-FIELD|$.supportTier",
    ]);
  });
});

describe("configuration semantics", () => {
  it("rejects missing fields and wrong primitives without defaulting", () => {
    const input = jsonClone(validWrittenConfiguration) as unknown as Record<
      string,
      unknown
    >;
    delete input.ambiguity;
    input.schemaVersion = "1";
    input.titleHandling = false;

    const keys = issueKeys(issuesFor(input));
    expect(keys).toEqual(
      expect.arrayContaining([
        "input-shape|E-MISSING-FIELD|$.ambiguity",
        "input-shape|E-SCHEMA-VERSION|$.schemaVersion",
        "input-shape|E-EXPECTED-STRING|$.titleHandling",
      ]),
    );
  });

  it("rejects empty pinned versions and empty IDs", () => {
    const input = jsonClone(validWrittenConfiguration) as {
      recipe: { id: string; version: string };
      promptSurface: { id: string; version: string };
    };
    input.recipe.version = "";
    input.promptSurface.id = "";

    expect(issueKeys(issuesFor(input))).toEqual(
      expect.arrayContaining([
        "configuration|E-EMPTY-STRING|$.promptSurface.id",
        "configuration|E-EMPTY-STRING|$.recipe.version",
        "artifact-identity|E-MISSING-PINNED-VERSION|$.recipe.version",
      ]),
    );
  });

  it("enforces the closed register union", () => {
    const preserveWithLevel = jsonClone(validWrittenConfiguration) as {
      register: { strategy: string; level?: string };
    };
    preserveWithLevel.register.level = "polite";
    expect(issueKeys(issuesFor(preserveWithLevel))).toContain(
      "configuration|E-REGISTER-PRESERVE-LEVEL|$.register.level",
    );

    const adaptWithoutLevel = jsonClone(validWrittenConfiguration) as {
      register: { strategy: string; level?: string };
    };
    adaptWithoutLevel.register.strategy = "adapt";
    expect(issueKeys(issuesFor(adaptWithoutLevel))).toContain(
      "configuration|E-REGISTER-ADAPT-LEVEL|$.register.level",
    );

    const invalidLevel = jsonClone(validWrittenConfiguration) as {
      register: { strategy: string; level?: string };
    };
    invalidLevel.register = { strategy: "adapt", level: "deferential" };
    expect(issueKeys(issuesFor(invalidLevel))).toContain(
      "configuration|E-INVALID-ENUM|$.register.level",
    );
  });

  it("rejects recipe/settings modality mismatches", () => {
    const input = jsonClone(validWrittenConfiguration) as {
      recipe: { id: string; version: string };
    };
    input.recipe.id = "live-voice-coach";
    expect(issueKeys(issuesFor(input))).toContain(
      "configuration|E-MODALITY-MISMATCH|$.settings.modality",
    );
  });

  it("enforces modality-specific setting fields", () => {
    const input = {
      ...jsonClone(validVoiceConfiguration),
      settings: {
        ...jsonClone(validVoiceConfiguration.settings),
        outputDetail: "concise",
      },
    };
    expect(issueKeys(issuesFor(input))).toContain(
      "input-shape|E-UNKNOWN-FIELD|$.settings.outputDetail",
    );
  });

  it("reports a truly unknown settings field exactly once", () => {
    const input = {
      ...jsonClone(validWrittenConfiguration),
      settings: {
        ...jsonClone(validWrittenConfiguration.settings),
        extra: "not-allowed",
      },
    };
    expect(
      issueKeys(issuesFor(input)).filter(
        (key) => key === "input-shape|E-UNKNOWN-FIELD|$.settings.extra",
      ),
    ).toEqual(["input-shape|E-UNKNOWN-FIELD|$.settings.extra"]);
  });

  it("rejects identical language IDs even with different versions", () => {
    const input = jsonClone(validWrittenConfiguration) as {
      languages: {
        home: { id: string; version: string };
        target: { id: string; version: string };
      };
    };
    input.languages.target = { id: "en", version: "other-version" };
    expect(issueKeys(issuesFor(input))).toContain(
      "configuration|E-IDENTICAL-LANGUAGES|$.languages",
    );
  });

  it("rejects unsupported code-switching and datum strategies", () => {
    const input = jsonClone(validWrittenConfiguration) as {
      codeSwitching: string;
      dataHandling: { strategy: string };
    };
    input.codeSwitching = "translate";
    input.dataHandling.strategy = "normalize";

    expect(issueKeys(issuesFor(input))).toEqual(
      expect.arrayContaining([
        "configuration|E-INVALID-ENUM|$.codeSwitching",
        "configuration|E-INVALID-ENUM|$.dataHandling.strategy",
      ]),
    );
  });
});

describe("canonical evidence", () => {
  it("returns identical ordered issues for different key insertion orders", () => {
    const first = {
      ...jsonClone(validWrittenConfiguration),
      zClaim: true,
      aClaim: true,
    };
    const second = Object.fromEntries(Object.entries(first).reverse());

    expect(validateRecipeConfiguration(second)).toEqual(
      validateRecipeConfiguration(first),
    );
  });

  it("sorts input, configuration, then artifact issues canonically", () => {
    const input = jsonClone(validWrittenConfiguration) as unknown as Record<
      string,
      unknown
    >;
    input.extra = true;
    (input.socialContext as { relationship: string }).relationship =
      "best-friends";
    (input.recipe as { version: string }).version = "";

    const issues = issuesFor(input);
    expect(issueKeys(issues)).toEqual([
      "input-shape|E-UNKNOWN-FIELD|$.extra",
      "configuration|E-EMPTY-STRING|$.recipe.version",
      "configuration|E-INVALID-ENUM|$.socialContext.relationship",
      "artifact-identity|E-MISSING-PINNED-VERSION|$.recipe.version",
    ]);
  });

  it("does not mutate an invalid input", () => {
    const input = jsonClone(validWrittenConfiguration) as {
      register: { strategy: string; level?: string };
    };
    input.register.level = "polite";
    const before = JSON.stringify(input);
    validateRecipeConfiguration(input);
    expect(JSON.stringify(input)).toBe(before);
  });

  it("returns a RecipeConfiguration on every successful branch", () => {
    const values: RecipeConfiguration[] = [
      validWrittenConfiguration,
      validVoiceConfiguration,
      validInterpreterConfiguration,
    ];
    expect(
      values.every((value) => validateRecipeConfiguration(value).ok),
    ).toBe(true);
  });
});
