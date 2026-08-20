import { describe, expect, it } from "vitest";

import {
  AMBIGUITY_STRATEGIES,
  ASSISTANT_OUTPUT_CAPABILITIES,
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
} from "../../src/domain";
import {
  OPTION_LABELS_EN,
  UI_EN_CATALOG,
  UI_JA_CATALOG,
} from "../../src/locales";
import {
  PUBLIC_LANGUAGE_PROFILE_CATALOG,
  publicLanguageName,
  publicLanguageOptionLabel,
} from "../../src/ui/language-presentation";

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

describe("plain-language UI copy", () => {
  it("gives every exposed configuration value an intentional English label", () => {
    const missing = [...new Set(EXPOSED_OPTION_VALUES)].filter((value) => {
      const label = OPTION_LABELS_EN[value];
      return label === undefined || label.trim().length === 0;
    });
    expect(missing).toEqual([]);
  });

  it("keeps the default tone and detail labels concise for native mobile selects", () => {
    expect(OPTION_LABELS_EN.preserve).toBe("Keep original tone");
    expect(OPTION_LABELS_EN.concise).toBe("Translation + few notes");
  });

  it("presents the exact language catalog in authored English-name order", () => {
    expect(
      PUBLIC_LANGUAGE_PROFILE_CATALOG.map((profile) => [
        profile.ref.id,
        publicLanguageName(UI_EN_CATALOG, profile.ref.id),
      ]),
    ).toEqual([
      ["zh-Hant-TW", "Chinese, Traditional (Taiwan)"],
      ["en", "English"],
      ["fr", "French"],
      ["de", "German"],
      ["he", "Hebrew"],
      ["id", "Indonesian"],
      ["it", "Italian"],
      ["ja", "Japanese"],
      ["tlh", "Klingon"],
      ["pt", "Portuguese (region not specified)"],
      ["es", "Spanish"],
      ["yi", "Yiddish"],
    ]);
  });

  it("keeps canonical tags out of visible labels and isolates autonyms", () => {
    const labels = PUBLIC_LANGUAGE_PROFILE_CATALOG.map((profile) => ({
      id: profile.ref.id,
      label: publicLanguageOptionLabel(UI_EN_CATALOG, profile),
    }));
    expect(labels).toEqual([
      { id: "zh-Hant-TW", label: "Chinese, Traditional (Taiwan) — ⁨正體中文（臺灣）⁩" },
      { id: "en", label: "English" },
      { id: "fr", label: "French — ⁨français⁩" },
      { id: "de", label: "German — ⁨Deutsch⁩" },
      { id: "he", label: "Hebrew — ⁨עברית⁩" },
      { id: "id", label: "Indonesian — ⁨Bahasa Indonesia⁩" },
      { id: "it", label: "Italian — ⁨italiano⁩" },
      { id: "ja", label: "Japanese — ⁨日本語⁩" },
      { id: "tlh", label: "Klingon — ⁨tlhIngan Hol⁩" },
      {
        id: "pt",
        label: "Portuguese (region not specified) — ⁨português⁩",
      },
      { id: "es", label: "Spanish — ⁨español⁩" },
      { id: "yi", label: "Yiddish — ⁨ייִדיש⁩" },
    ]);
    for (const { id, label } of labels) {
      expect(label).not.toContain(`(${id})`);
      expect(label).not.toMatch(/[\u{1f1e6}-\u{1f1ff}]/u);
    }
  });

  it("presents deterministic development-only Japanese language names", () => {
    expect(
      PUBLIC_LANGUAGE_PROFILE_CATALOG.map((profile) => [
        profile.ref.id,
        publicLanguageName(UI_JA_CATALOG, profile.ref.id),
      ]),
    ).toEqual([
      ["zh-Hant-TW", "中国語（繁体字・台湾）"],
      ["en", "英語"],
      ["fr", "フランス語"],
      ["de", "ドイツ語"],
      ["he", "ヘブライ語"],
      ["id", "インドネシア語"],
      ["it", "イタリア語"],
      ["ja", "日本語"],
      ["tlh", "クリンゴン語"],
      ["pt", "ポルトガル語（地域未指定）"],
      ["es", "スペイン語"],
      ["yi", "イディッシュ語"],
    ]);

    const english = PUBLIC_LANGUAGE_PROFILE_CATALOG.find(
      (profile) => profile.ref.id === "en",
    );
    const japanese = PUBLIC_LANGUAGE_PROFILE_CATALOG.find(
      (profile) => profile.ref.id === "ja",
    );
    expect(english).toBeDefined();
    expect(japanese).toBeDefined();
    if (english === undefined || japanese === undefined) {
      return;
    }
    expect(publicLanguageOptionLabel(UI_JA_CATALOG, english)).toBe(
      "英語 — ⁨English⁩",
    );
    expect(publicLanguageOptionLabel(UI_JA_CATALOG, japanese)).toBe("日本語");
  });
});
