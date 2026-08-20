import { describe, expect, it } from "vitest";

import {
  compileFromCatalog,
  materializeSelection,
  type RecipeConfiguration,
} from "../../src/domain";
import {
  START_PRESET_BY_LOCALE,
  decideLanguageEntry,
} from "../../src/app/language-entry";
import { PHRASEGARDEN_CATALOG } from "../../src/app/runtime-catalog";

function expectMaterialized(
  homeLanguageId: string,
  targetLanguageId: string,
): RecipeConfiguration {
  const result = materializeSelection(
    {
      homeLanguageId,
      targetLanguageId,
      recipeId: "written-translator",
    },
    PHRASEGARDEN_CATALOG,
  );
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error(
      result.issues.map((issue) => `${issue.code}:${issue.path}`).join("\n"),
    );
  }
  return result.value;
}

function expectCompiled(configuration: RecipeConfiguration) {
  const result = compileFromCatalog(configuration, PHRASEGARDEN_CATALOG);
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error(
      result.issues.map((issue) => `${issue.code}:${issue.path}`).join("\n"),
    );
  }
  return result.value;
}

describe("language-entry decisions", () => {
  it.each([
    ["en", "en", "ja"],
    ["ja", "ja", "en"],
  ] as const)(
    "materializes the exact %s fresh-session Written preset",
    (locale, homeLanguageId, targetLanguageId) => {
      const decision = decideLanguageEntry("starting", locale);
      expect(decision.kind).toBe("apply-start-preset");
      if (decision.kind !== "apply-start-preset") {
        return;
      }

      expect(START_PRESET_BY_LOCALE[locale]).toEqual({
        homeLanguageId,
        targetLanguageId,
        recipeId: "written-translator",
      });
      expect(decision.locale).toBe(locale);
      expect(decision.configuration.languages.home.id).toBe(homeLanguageId);
      expect(decision.configuration.languages.target.id).toBe(targetLanguageId);
      expect(decision.configuration.recipe.id).toBe("written-translator");
      expect(decision.configuration.settings.modality).toBe("written");
      expect(decision.configuration).toEqual(
        expectMaterialized(homeLanguageId, targetLanguageId),
      );
    },
  );

  it.each(["en", "ja"] as const)(
    "keeps a %s locale change presentation-only after work exists",
    (locale) => {
      expect(decideLanguageEntry("preserve-work", locale)).toEqual({
        kind: "change-interface-only",
        locale,
      });
    },
  );

  it.each([
    ["en", "en", "ja"],
    ["ja", "ja", "en"],
  ] as const)(
    "compiles the %s preset byte-for-byte like direct materialization",
    (locale, homeLanguageId, targetLanguageId) => {
      const decision = decideLanguageEntry("starting", locale);
      if (decision.kind !== "apply-start-preset") {
        throw new Error("A starting decision did not apply its preset.");
      }
      const direct = expectMaterialized(homeLanguageId, targetLanguageId);
      const fromEntry = expectCompiled(decision.configuration);
      const fromDirect = expectCompiled(direct);

      expect(fromEntry).toEqual(fromDirect);
      expect(new TextEncoder().encode(fromEntry.canonicalPrompt)).toEqual(
        new TextEncoder().encode(fromDirect.canonicalPrompt),
      );
    },
  );

  it("never adds interface locale to configuration or compiler provenance", () => {
    for (const locale of ["en", "ja"] as const) {
      const decision = decideLanguageEntry("starting", locale);
      if (decision.kind !== "apply-start-preset") {
        throw new Error("A starting decision did not apply its preset.");
      }
      const compiled = expectCompiled(decision.configuration);

      expect(Object.hasOwn(decision.configuration, "interfaceLocale")).toBe(false);
      expect(Object.hasOwn(compiled.normalizedConfiguration, "interfaceLocale")).toBe(
        false,
      );
      expect(Object.hasOwn(compiled.provenance, "interfaceLocale")).toBe(false);
      expect(
        JSON.stringify({
          configuration: compiled.normalizedConfiguration,
          provenance: compiled.provenance,
        }),
      ).not.toContain("interfaceLocale");
      expect(compiled.provenance.promptSurface.locale).toBe("en");
    }
  });
});
