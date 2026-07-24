import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  compileFromCatalog,
  materializeSelection,
  renderSummary,
  validateModalityRecipe,
  validatePairPack,
  type CompilerCatalog,
  type RecipeConfiguration,
  type VoiceRecipeConfiguration,
} from "../../src/domain";
import {
  DEFAULT_VOICE_CONFIGURATION,
  DEFAULT_WRITTEN_CONFIGURATION,
  PHRASEGARDEN_CATALOG,
} from "../../src/app/runtime-catalog";
import {
  EN_JA_PREVIEW_PACK,
  LANGUAGE_PROFILES,
  canonicalLanguageRegistry,
  searchLanguageProfiles,
} from "../../src/packs";
import {
  LIVE_VOICE_COACH_RECIPE,
  WRITTEN_TRANSLATOR_RECIPE,
} from "../../src/recipes";

function expectCompiled(configuration: RecipeConfiguration) {
  const result = compileFromCatalog(configuration, PHRASEGARDEN_CATALOG);
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error(
      result.issues.map((item) => `${item.code}:${item.path}`).join("\n"),
    );
  }
  return result.value;
}

function isVoiceConfiguration(
  configuration: RecipeConfiguration,
): configuration is VoiceRecipeConfiguration {
  return configuration.recipe.id === "live-voice-coach";
}

function materialize(
  homeLanguageId: string,
  targetLanguageId: string,
  recipeId: "written-translator" | "live-voice-coach",
): RecipeConfiguration {
  const result = materializeSelection(
    { homeLanguageId, targetLanguageId, recipeId },
    PHRASEGARDEN_CATALOG,
  );
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error(
      result.issues.map((item) => `${item.code}:${item.path}`).join("\n"),
    );
  }
  return result.value;
}

describe("bundled authored artifacts", () => {
  it("validates both recipes and the bidirectional Preview pack", () => {
    expect(
      validateModalityRecipe(
        WRITTEN_TRANSLATOR_RECIPE,
        canonicalLanguageRegistry,
      ).ok,
    ).toBe(true);
    expect(
      validateModalityRecipe(
        LIVE_VOICE_COACH_RECIPE,
        canonicalLanguageRegistry,
      ).ok,
    ).toBe(true);
    const pair = validatePairPack(
      EN_JA_PREVIEW_PACK,
      canonicalLanguageRegistry,
    );
    expect(pair.ok).toBe(true);
    if (pair.ok) {
      expect(
        pair.value.directions.map(
          (direction) => `${direction.home.id}->${direction.target.id}`,
        ),
      ).toEqual(["en->ja", "ja->en"]);
    }
  });

  it("provides exact searchable identity metadata for every bundled registry tag", () => {
    expect(LANGUAGE_PROFILES.map((profile) => profile.id)).toEqual(
      canonicalLanguageRegistry.canonicalTags,
    );
    expect(searchLanguageProfiles("indonesian").map((item) => item.ref.id)).toEqual([
      "id",
    ]);
    expect(searchLanguageProfiles("日本語").map((item) => item.ref.id)).toEqual([
      "ja",
    ]);
  });
});

describe("deterministic compiler", () => {
  it("compiles all required Preview directions and modalities", () => {
    const outputs = [
      expectCompiled(DEFAULT_WRITTEN_CONFIGURATION),
      expectCompiled(materialize("ja", "en", "written-translator")),
      expectCompiled(DEFAULT_VOICE_CONFIGURATION),
      expectCompiled(materialize("ja", "en", "live-voice-coach")),
    ];
    for (const output of outputs) {
      expect(output.provenance.supportTier).toBe("preview");
      expect(output.provenance.supportReviewStatus).toBe(
        "external-review-not-completed",
      );
      expect(output.provenance.pairPack).not.toBe("none");
      expect(output.limitationCodes).toContain(
        "L-PREVIEW-EXTERNAL-REVIEW",
      );
    }
  });

  it("derives Generic for a bundled direction with no exact pack", () => {
    const output = expectCompiled(
      materialize("en", "id", "written-translator"),
    );
    expect(output.provenance.supportTier).toBe("generic");
    expect(output.provenance.pairPack).toBe("none");
    expect(output.limitationCodes).toContain(
      "L-GENERIC-NO-PAIR-GUIDANCE",
    );
  });

  it("keeps Generic composition free of endpoint and pair linguistic clauses", () => {
    const output = expectCompiled(
      materialize("ja", "id", "written-translator"),
    );
    expect(output.canonicalPrompt).toContain("日本語");
    expect(output.canonicalPrompt).not.toContain("Exact pair guidance");
    expect(output.canonicalPrompt).not.toContain("ordinary Japanese omission");
    expect(output.canonicalPrompt).not.toContain("unknown Japanese name reading");
    expect(output.canonicalPrompt).not.toContain("natural contextual Japanese");
  });

  it("produces byte-identical text and semantic results for frozen inputs", () => {
    const first = expectCompiled(DEFAULT_WRITTEN_CONFIGURATION);
    const second = expectCompiled(DEFAULT_WRITTEN_CONFIGURATION);
    expect(second).toEqual(first);
    expect(new TextEncoder().encode(second.canonicalPrompt)).toEqual(
      new TextEncoder().encode(first.canonicalPrompt),
    );
  });

  it("renders the semantic summary through the exact English catalog", () => {
    const output = expectCompiled(DEFAULT_WRITTEN_CONFIGURATION);
    const summary = renderSummary(
      output.summaryItems,
      PHRASEGARDEN_CATALOG.summaryCatalogs[0],
    );
    expect(summary.ok).toBe(true);
    if (summary.ok) {
      expect(summary.value.text).toContain(
        "external linguistic review has not been completed",
      );
      expect(summary.value.items[0]?.id).toBe("preserves.core");
    }
  });

  it("changes the Voice behavior summary when correction focus changes", () => {
    const voiceConfiguration = DEFAULT_VOICE_CONFIGURATION;
    if (!isVoiceConfiguration(voiceConfiguration)) {
      throw new Error("Bundled Voice default resolved to the wrong recipe.");
    }
    const configured: RecipeConfiguration = {
      ...voiceConfiguration,
      settings: {
        ...voiceConfiguration.settings,
        correction: {
          ...voiceConfiguration.settings.correction,
          focus: "form-detail",
        },
      },
    };
    const output = expectCompiled(configured);
    expect(output.summaryItems.map((item) => item.id)).toContain(
      "behavior.voice-correction-focus.form-detail",
    );
    expect(output.summaryItems.map((item) => item.id)).not.toContain(
      "behavior.voice-correction-focus.balanced",
    );
    const summary = renderSummary(
      output.summaryItems,
      PHRASEGARDEN_CATALOG.summaryCatalogs[0],
    );
    expect(summary.ok).toBe(true);
    if (summary.ok) {
      expect(summary.value.text).toContain(
        "Prioritizes grammar and form detail after preserving meaning and social force.",
      );
    }
  });

  it("uses LF only and exactly one terminal LF", () => {
    const prompt = expectCompiled(
      DEFAULT_WRITTEN_CONFIGURATION,
    ).canonicalPrompt;
    expect(prompt).not.toContain("\r");
    expect(prompt.endsWith("\n")).toBe(true);
    expect(prompt.endsWith("\n\n")).toBe(false);
    expect(prompt).not.toMatch(/\{\{[^}]+\}\}/u);
  });
});

describe("fail-closed resolution", () => {
  it("rejects caller-supplied Preview claims at selection and configuration boundaries", () => {
    const selection = materializeSelection(
      {
        homeLanguageId: "en",
        targetLanguageId: "ja",
        recipeId: "written-translator",
        supportTier: "preview",
      },
      PHRASEGARDEN_CATALOG,
    );
    expect(selection.ok).toBe(false);
    if (!selection.ok) {
      expect(selection.issues.map((item) => item.code)).toContain(
        "E-UNKNOWN-FIELD",
      );
    }

    const configuration = compileFromCatalog(
      { ...DEFAULT_WRITTEN_CONFIGURATION, supportTier: "preview" },
      PHRASEGARDEN_CATALOG,
    );
    expect(configuration.ok).toBe(false);
    if (!configuration.ok) {
      expect(configuration.issues.map((item) => item.code)).toContain(
        "E-UNKNOWN-FIELD",
      );
    }
  });

  it("rejects multiple exact directed packs", () => {
    const catalog: CompilerCatalog = {
      ...PHRASEGARDEN_CATALOG,
      pairPacks: [
        EN_JA_PREVIEW_PACK,
        { ...EN_JA_PREVIEW_PACK, id: "duplicate-preview-pack" },
      ],
    };
    const result = compileFromCatalog(DEFAULT_WRITTEN_CONFIGURATION, catalog);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.map((item) => item.code)).toContain(
        "E-PAIR-AMBIGUOUS",
      );
    }
  });

  it("rejects a direction-reversal mutation instead of silently compiling it", () => {
    const first = EN_JA_PREVIEW_PACK.directions[0];
    expect(first).toBeDefined();
    if (first === undefined) {
      return;
    }
    const reversed = {
      ...first,
      home: first.target,
      target: first.home,
    };
    const catalog: CompilerCatalog = {
      ...PHRASEGARDEN_CATALOG,
      pairPacks: [
        {
          ...EN_JA_PREVIEW_PACK,
          directions: [reversed, EN_JA_PREVIEW_PACK.directions[1]!],
        },
      ],
    };
    const result = compileFromCatalog(DEFAULT_WRITTEN_CONFIGURATION, catalog);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.map((item) => item.code)).toContain(
        "E-DUPLICATE-PAIR-DIRECTION",
      );
    }
  });

  it("rejects missing and mismatched pinned versions", () => {
    for (const configuration of [
      {
        ...DEFAULT_WRITTEN_CONFIGURATION,
        languages: {
          ...DEFAULT_WRITTEN_CONFIGURATION.languages,
          target: { id: "ja", version: "missing" },
        },
      },
      {
        ...DEFAULT_WRITTEN_CONFIGURATION,
        recipe: { id: "written-translator", version: "missing" },
      },
      {
        ...DEFAULT_WRITTEN_CONFIGURATION,
        promptSurface: { id: "instructions-en", version: "missing" },
      },
    ]) {
      const result = compileFromCatalog(configuration, PHRASEGARDEN_CATALOG);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues.length).toBeGreaterThan(0);
      }
    }
  });

  it.each([
    {
      name: "repeated effect",
      effect: {
        key: "invariant.meaning-and-force",
        value: "preserve-before-literal-wording",
      },
      expected: "E-REPEATED-EFFECT",
      section: 5 as const,
      order: 999,
      refines: undefined,
    },
    {
      name: "conflicting effect",
      effect: {
        key: "invariant.meaning-and-force",
        value: "replace-user-voice",
      },
      expected: "E-CONFLICTING-EFFECT",
      section: 5 as const,
      order: 999,
      refines: undefined,
    },
    {
      name: "duplicate selected order",
      effect: { key: "test.unique", value: "unique" },
      expected: "E-DUPLICATE-SELECTED-ORDER",
      section: 3 as const,
      order: 100,
      refines: undefined,
    },
    {
      name: "missing refinement target",
      effect: { key: "test.refinement", value: "refinement" },
      expected: "E-REFINEMENT-TARGET-MISSING",
      section: 5 as const,
      order: 999,
      refines: [{ key: "missing.effect" }],
    },
  ])("rejects $name", ({ effect, expected, order, refines, section }) => {
    const clause = {
      id: `recipe.test.${expected}`,
      origin: "recipe" as const,
      authority: "fallback" as const,
      section,
      order,
      whenAll: [],
      renderingKey: "choice.written-detail.concise",
      effect,
      ...(refines === undefined ? {} : { refines }),
    };
    const catalog: CompilerCatalog = {
      ...PHRASEGARDEN_CATALOG,
      recipes: [
        {
          ...WRITTEN_TRANSLATOR_RECIPE,
          clauses: [...WRITTEN_TRANSLATOR_RECIPE.clauses, clause],
        },
        LIVE_VOICE_COACH_RECIPE,
      ],
    };
    const result = compileFromCatalog(DEFAULT_WRITTEN_CONFIGURATION, catalog);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.map((item) => item.code)).toContain(expected);
    }
  });

  it("rejects a missing selected rendering and an over-budget prompt", () => {
    const missingRenderingCatalog: CompilerCatalog = {
      ...PHRASEGARDEN_CATALOG,
      recipes: [
        {
          ...WRITTEN_TRANSLATOR_RECIPE,
          clauses: WRITTEN_TRANSLATOR_RECIPE.clauses.map((clause) =>
            clause.id === "recipe.written.identity"
              ? { ...clause, renderingKey: "missing.rendering" }
              : clause,
          ),
        },
        LIVE_VOICE_COACH_RECIPE,
      ],
    };
    const missing = compileFromCatalog(
      DEFAULT_WRITTEN_CONFIGURATION,
      missingRenderingCatalog,
    );
    expect(missing.ok).toBe(false);
    if (!missing.ok) {
      expect(missing.issues.map((item) => item.code)).toContain(
        "E-RENDERING-KEY-MISSING",
      );
    }

    const overBudgetCatalog: CompilerCatalog = {
      ...PHRASEGARDEN_CATALOG,
      promptSurfaces: PHRASEGARDEN_CATALOG.promptSurfaces.map((surface) => ({
        ...surface,
        renderings: surface.renderings.map((rendering) =>
          rendering.key === "prompt.title"
            ? {
                ...rendering,
                parts: [{ kind: "literal" as const, text: "x".repeat(12_001) }],
              }
            : rendering,
        ),
      })),
    };
    const overBudget = compileFromCatalog(
      DEFAULT_WRITTEN_CONFIGURATION,
      overBudgetCatalog,
    );
    expect(overBudget.ok).toBe(false);
    if (!overBudget.ok) {
      expect(overBudget.issues.map((item) => item.code)).toContain(
        "E-PROMPT-BUDGET",
      );
    }
  });
});

describe("versioned prompt snapshots", () => {
  it("matches all four Preview directions/modalities and the Generic fixture", () => {
    for (const [name, configuration] of [
      ["en-ja-written", DEFAULT_WRITTEN_CONFIGURATION],
      ["ja-en-written", materialize("ja", "en", "written-translator")],
      ["en-ja-voice", DEFAULT_VOICE_CONFIGURATION],
      ["ja-en-voice", materialize("ja", "en", "live-voice-coach")],
      ["en-id-written", materialize("en", "id", "written-translator")],
    ] as const) {
      const expected = readFileSync(
        new URL(
          `../../samples/0.1.0-preview.1/${name}.txt`,
          import.meta.url,
        ),
        "utf8",
      );
      expect(expectCompiled(configuration).canonicalPrompt).toBe(expected);
    }
  });
});
