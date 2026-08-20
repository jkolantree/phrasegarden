import { describe, expect, it } from "vitest";

import {
  AMBIGUITY_STRATEGIES,
  ASSISTANT_OUTPUT_CAPABILITIES,
  COMPILER_WARNING_CODES,
  HIERARCHIES,
  INTERPRETER_CLARIFICATIONS,
  INTERPRETER_TURN_MODES,
  PRONUNCIATION_MODES,
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
  compileFromCatalog,
  renderSummary,
} from "../../src/domain";
import { decideLanguageEntry } from "../../src/app/language-entry";
import { PHRASEGARDEN_CATALOG } from "../../src/app/runtime-catalog";
import {
  LANGUAGE_NAMES_EN,
  LANGUAGE_NAMES_JA,
  LIMITATION_MESSAGES_EN,
  LIMITATION_MESSAGES_JA,
  OPTION_LABELS_EN,
  OPTION_LABELS_JA,
  INTERFACE_LOCALE_IDS,
  UI_COPY_REVIEW_STATUSES,
  UI_EN_CATALOG,
  UI_JA_CATALOG,
  UI_MESSAGES_EN,
  UI_MESSAGES_JA,
  WARNING_MESSAGES_EN,
  WARNING_MESSAGES_JA,
  defineUiLocaleCatalog,
  localizeSummaryItems,
  uiLanguageName,
  uiLimitationMessage,
  uiLocaleCatalog,
  uiOptionLabel,
  uiText,
  type UiMessageId,
} from "../../src/locales";

const EXPOSED_OPTION_VALUES = [
  ...RELATIONSHIPS,
  ...HIERARCHIES,
  "preserve",
  ...REGISTER_LEVELS,
  ...WRITTEN_OUTPUT_DETAILS,
  ...VOICE_CORRECTION_TIMINGS,
  ...VOICE_CORRECTION_FOCI,
  ...PRONUNCIATION_MODES,
  ...TEACHING_DEPTHS,
  ...VOICE_PACES,
  ...INTERPRETER_TURN_MODES,
  ...INTERPRETER_CLARIFICATIONS,
  ...AMBIGUITY_STRATEGIES,
  ...TITLE_HANDLING_STRATEGIES,
  ...UNKNOWN_NAME_STRATEGIES,
  ...USER_EVIDENCE_CAPABILITIES,
  ...ASSISTANT_OUTPUT_CAPABILITIES,
  ...SIGNAL_CAPABILITIES,
] as const;

function sortedKeys(value: Readonly<Record<string, unknown>>): readonly string[] {
  return Object.keys(value).sort();
}

function expectNonBlankValues(value: Readonly<Record<string, string>>): void {
  expect(Object.values(value).filter((text) => text.trim().length === 0)).toEqual(
    [],
  );
}

function authoredLimitationCodes(): readonly string[] {
  return [
    ...PHRASEGARDEN_CATALOG.compilerPolicies.flatMap((policy) =>
      policy.knownLimitations.map((limitation) => limitation.code),
    ),
    ...PHRASEGARDEN_CATALOG.recipes.flatMap((recipe) =>
      recipe.knownLimitations.map((limitation) => limitation.code),
    ),
    ...PHRASEGARDEN_CATALOG.pairPacks.flatMap((pack) =>
      pack.directions.flatMap((direction) =>
        direction.knownLimitations.map((limitation) => limitation.code),
      ),
    ),
  ].filter((code, index, codes) => codes.indexOf(code) === index).sort();
}

describe("English source and public unreviewed-preview Japanese interface catalogs", () => {
  it("has exact, nonblank key parity across every localized map", () => {
    expect(Object.isFrozen(INTERFACE_LOCALE_IDS)).toBe(true);
    expect(Object.isFrozen(UI_COPY_REVIEW_STATUSES)).toBe(true);
    for (const [english, japanese] of [
      [UI_MESSAGES_EN, UI_MESSAGES_JA],
      [OPTION_LABELS_EN, OPTION_LABELS_JA],
      [LANGUAGE_NAMES_EN, LANGUAGE_NAMES_JA],
      [LIMITATION_MESSAGES_EN, LIMITATION_MESSAGES_JA],
      [WARNING_MESSAGES_EN, WARNING_MESSAGES_JA],
    ] as const) {
      expect(sortedKeys(japanese)).toEqual(sortedKeys(english));
      expectNonBlankValues(english);
      expectNonBlankValues(japanese);
    }
    for (const catalog of [
      UI_EN_CATALOG,
      UI_JA_CATALOG,
      UI_EN_CATALOG.summaryCatalog,
      UI_JA_CATALOG.summaryCatalog,
    ]) {
      expect(Object.isFrozen(catalog)).toBe(true);
    }
    for (const catalog of [
      UI_EN_CATALOG.summaryCatalog,
      UI_JA_CATALOG.summaryCatalog,
    ]) {
      expect(Object.isFrozen(catalog.messages)).toBe(true);
      for (const message of catalog.messages) {
        expect(Object.isFrozen(message)).toBe(true);
        expect(Object.isFrozen(message.parts)).toBe(true);
        expect(message.parts.every((part) => Object.isFrozen(part))).toBe(true);
      }
    }
    expect(UI_EN_CATALOG.copyReviewStatus).toBe("source-interface");
    expect(UI_JA_CATALOG.copyReviewStatus).toBe(
      "public-unreviewed-preview",
    );
    expect(UI_JA_CATALOG.version).toBe("1.0.0-preview.1");
    expect(UI_JA_CATALOG.summaryCatalog.version).toBe("1.0.0-preview.1");
  });

  it("covers every exposed option and bundled public language in both catalogs", () => {
    const exposedOptions = [...new Set(EXPOSED_OPTION_VALUES)].sort();
    expect(sortedKeys(OPTION_LABELS_EN)).toEqual(exposedOptions);
    expect(sortedKeys(OPTION_LABELS_JA)).toEqual(exposedOptions);

    const publicLanguageIds = PHRASEGARDEN_CATALOG.profiles
      .map((profile) => profile.id)
      .sort();
    expect(sortedKeys(LANGUAGE_NAMES_EN)).toEqual(publicLanguageIds);
    expect(sortedKeys(LANGUAGE_NAMES_JA)).toEqual(publicLanguageIds);
  });

  it("covers every authored limitation and compiler warning in both catalogs", () => {
    const limitationCodes = authoredLimitationCodes();
    expect(sortedKeys(LIMITATION_MESSAGES_EN)).toEqual(limitationCodes);
    expect(sortedKeys(LIMITATION_MESSAGES_JA)).toEqual(limitationCodes);

    const warningCodes = [...COMPILER_WARNING_CODES].sort();
    expect(sortedKeys(WARNING_MESSAGES_EN)).toEqual(warningCodes);
    expect(sortedKeys(WARNING_MESSAGES_JA)).toEqual(warningCodes);
  });

  it("keeps region-unspecified Portuguese explicit in each interface", () => {
    expect(LANGUAGE_NAMES_EN.pt).toBe("Portuguese (region not specified)");
    expect(LANGUAGE_NAMES_JA.pt).toBe("ポルトガル語（地域未指定）");
  });

  it("fails closed for unsupported locales, keys, and value sets", () => {
    expect(() => uiLocaleCatalog("fr")).toThrow(
      "Unsupported interface locale: fr",
    );
    expect(() =>
      uiText(UI_EN_CATALOG, "missing.message" as UiMessageId),
    ).toThrow();
    expect(() =>
      uiText(UI_EN_CATALOG, "entry.startTitle", { unexpected: "value" }),
    ).toThrow("Invalid UI message values for entry.startTitle");
    expect(() => uiOptionLabel(UI_JA_CATALOG, "missing-option")).toThrow(
      "Missing option label: missing-option",
    );
    expect(() => uiLanguageName(UI_JA_CATALOG, "x-private")).toThrow(
      "Missing public language name: x-private",
    );
    expect(() =>
      uiLimitationMessage(UI_JA_CATALOG, "L-NOT-A-LIMITATION"),
    ).toThrow("Missing limitation message: L-NOT-A-LIMITATION");
    expect(() =>
      defineUiLocaleCatalog({
        ...UI_EN_CATALOG,
        extra: "unsupported",
      } as never),
    ).toThrow("Invalid UI locale catalog keys");
    expect(() =>
      defineUiLocaleCatalog({
        ...UI_EN_CATALOG,
        copyReviewStatus: "reviewed-without-evidence",
      } as never),
    ).toThrow("Invalid interface copy review status: en");
  });

  it("renders one compiled result in either interface without changing its bytes or identity", () => {
    const decision = decideLanguageEntry("starting", "ja");
    if (decision.kind !== "apply-start-preset") {
      throw new Error("The Japanese starting decision did not apply its preset.");
    }
    const compiled = compileFromCatalog(
      decision.configuration,
      PHRASEGARDEN_CATALOG,
    );
    expect(compiled.ok).toBe(true);
    if (!compiled.ok) {
      throw new Error(
        compiled.issues.map((issue) => `${issue.code}:${issue.path}`).join("\n"),
      );
    }
    const identityBefore = JSON.stringify({
      prompt: compiled.value.canonicalPrompt,
      configuration: compiled.value.normalizedConfiguration,
      provenance: compiled.value.provenance,
    });

    const englishItems = localizeSummaryItems(UI_EN_CATALOG, compiled.value);
    const japaneseItems = localizeSummaryItems(UI_JA_CATALOG, compiled.value);
    const english = renderSummary(englishItems, UI_EN_CATALOG.summaryCatalog);
    const japanese = renderSummary(japaneseItems, UI_JA_CATALOG.summaryCatalog);
    expect(english.ok).toBe(true);
    expect(japanese.ok).toBe(true);
    if (!english.ok || !japanese.ok) {
      return;
    }

    expect(english.value.catalog.locale).toBe("en");
    expect(japanese.value.catalog.locale).toBe("ja");
    expect(japanese.value.catalog.version).toBe("1.0.0-preview.1");
    expect(japanese.value.items.map((item) => item.id)).toEqual(
      english.value.items.map((item) => item.id),
    );
    expect(japanese.value.text).not.toBe(english.value.text);
    expect(japanese.value.text).toContain("独立した言語レビューは完了していません");
    expect(japanese.value.text).toContain(
      "\u2068日本語\u2069から\u2068英語\u2069",
    );
    expect(english.value.text).toContain("Japanese to English");
    expect(
      compiled.value.summaryItems.find(
        (item) => item.id === "behavior.support.preview",
      )?.values,
    ).toEqual({ home: "日本語", target: "English" });
    expect(
      japaneseItems.find((item) => item.id === "behavior.support.preview")
        ?.values,
    ).toEqual({ home: "日本語", target: "英語" });
    expect(compiled.value.provenance.promptSurface.locale).toBe("en");
    expect(
      JSON.stringify({
        prompt: compiled.value.canonicalPrompt,
        configuration: compiled.value.normalizedConfiguration,
        provenance: compiled.value.provenance,
      }),
    ).toBe(identityBefore);
    expect(identityBefore).not.toContain("interfaceLocale");
  });
});
