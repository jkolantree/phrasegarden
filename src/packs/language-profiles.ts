import type {
  LanguageProfile,
  LanguageProfileRef,
} from "../domain";
import { CANONICAL_LANGUAGE_REGISTRY_REF } from "./canonical-language-registry";

export const LANGUAGE_PROFILE_VERSION = "1.0.0";

const englishProfile: LanguageProfile = {
  languageRegistry: CANONICAL_LANGUAGE_REGISTRY_REF,
  id: "en",
  version: LANGUAGE_PROFILE_VERSION,
  bcp47: "en",
  autonym: "English",
  searchableNames: ["English"],
  direction: "ltr",
  scripts: ["Latn"],
  monolingualClauses: [
    {
      id: "profile.en.target-naturalness",
      origin: "profile",
      authority: "profile",
      section: 6,
      order: 820,
      whenAll: [
        { path: "languages.target.id", op: "eq", value: "en" },
        { path: "resolved.pairPack", op: "present" },
      ],
      renderingKey: "profile.en.target-naturalness",
      effect: {
        key: "profile.target-naturalness",
        value: "natural-contemporary-english",
      },
      refines: [{ key: "pair.target-realization" }],
    },
  ],
};

const japaneseProfile: LanguageProfile = {
  languageRegistry: CANONICAL_LANGUAGE_REGISTRY_REF,
  id: "ja",
  version: LANGUAGE_PROFILE_VERSION,
  bcp47: "ja",
  autonym: "日本語",
  searchableNames: ["Japanese", "Nihongo", "日本語"],
  direction: "ltr",
  scripts: ["Hani", "Hira", "Kana"],
  monolingualClauses: [
    {
      id: "profile.ja.target-naturalness",
      origin: "profile",
      authority: "profile",
      section: 6,
      order: 820,
      whenAll: [
        { path: "languages.target.id", op: "eq", value: "ja" },
        { path: "resolved.pairPack", op: "present" },
      ],
      renderingKey: "profile.ja.target-naturalness",
      effect: {
        key: "profile.target-naturalness",
        value: "natural-contextual-japanese",
      },
      refines: [{ key: "pair.target-realization" }],
    },
  ],
};

const germanProfile: LanguageProfile = {
  languageRegistry: CANONICAL_LANGUAGE_REGISTRY_REF,
  id: "de",
  version: LANGUAGE_PROFILE_VERSION,
  bcp47: "de",
  autonym: "Deutsch",
  searchableNames: ["German", "Deutsch"],
  direction: "ltr",
  scripts: ["Latn"],
  monolingualClauses: [],
};

const spanishProfile: LanguageProfile = {
  languageRegistry: CANONICAL_LANGUAGE_REGISTRY_REF,
  id: "es",
  version: LANGUAGE_PROFILE_VERSION,
  bcp47: "es",
  autonym: "español",
  searchableNames: ["Spanish", "Español", "Espanol"],
  direction: "ltr",
  scripts: ["Latn"],
  monolingualClauses: [],
};

const frenchProfile: LanguageProfile = {
  languageRegistry: CANONICAL_LANGUAGE_REGISTRY_REF,
  id: "fr",
  version: LANGUAGE_PROFILE_VERSION,
  bcp47: "fr",
  autonym: "français",
  searchableNames: ["French", "Français", "Francais"],
  direction: "ltr",
  scripts: ["Latn"],
  monolingualClauses: [],
};

const italianProfile: LanguageProfile = {
  languageRegistry: CANONICAL_LANGUAGE_REGISTRY_REF,
  id: "it",
  version: LANGUAGE_PROFILE_VERSION,
  bcp47: "it",
  autonym: "italiano",
  searchableNames: ["Italian", "Italiano"],
  direction: "ltr",
  scripts: ["Latn"],
  monolingualClauses: [],
};

const portugueseProfile: LanguageProfile = {
  languageRegistry: CANONICAL_LANGUAGE_REGISTRY_REF,
  id: "pt",
  version: LANGUAGE_PROFILE_VERSION,
  bcp47: "pt",
  autonym: "português",
  searchableNames: ["Portuguese", "Português", "Portugues"],
  direction: "ltr",
  scripts: ["Latn"],
  monolingualClauses: [],
};

const identityOnlyProfiles: readonly LanguageProfile[] = [
  {
    languageRegistry: CANONICAL_LANGUAGE_REGISTRY_REF,
    id: "he",
    version: LANGUAGE_PROFILE_VERSION,
    bcp47: "he",
    autonym: "עברית",
    searchableNames: ["Hebrew", "Ivrit", "עברית"],
    direction: "rtl",
    scripts: ["Hebr"],
    monolingualClauses: [],
  },
  {
    languageRegistry: CANONICAL_LANGUAGE_REGISTRY_REF,
    id: "id",
    version: LANGUAGE_PROFILE_VERSION,
    bcp47: "id",
    autonym: "Bahasa Indonesia",
    searchableNames: ["Bahasa Indonesia", "Indonesian"],
    direction: "ltr",
    scripts: ["Latn"],
    monolingualClauses: [],
  },
  {
    languageRegistry: CANONICAL_LANGUAGE_REGISTRY_REF,
    id: "tlh",
    version: LANGUAGE_PROFILE_VERSION,
    bcp47: "tlh",
    autonym: "tlhIngan Hol",
    searchableNames: ["Klingon", "tlhIngan Hol"],
    direction: "ltr",
    scripts: ["Latn"],
    monolingualClauses: [],
  },
  {
    languageRegistry: CANONICAL_LANGUAGE_REGISTRY_REF,
    id: "yi",
    version: LANGUAGE_PROFILE_VERSION,
    bcp47: "yi",
    autonym: "ייִדיש",
    searchableNames: ["Yiddish", "ייִדיש"],
    direction: "rtl",
    scripts: ["Hebr"],
    monolingualClauses: [],
  },
  {
    languageRegistry: CANONICAL_LANGUAGE_REGISTRY_REF,
    id: "zh-Hant-TW",
    version: LANGUAGE_PROFILE_VERSION,
    bcp47: "zh-Hant-TW",
    autonym: "正體中文（臺灣）",
    searchableNames: [
      "Chinese, Traditional (Taiwan)",
      "Mandarin Chinese",
      "Traditional Chinese",
      "正體中文",
    ],
    direction: "ltr",
    scripts: ["Hant"],
    monolingualClauses: [],
  },
];

export const LANGUAGE_PROFILES: readonly LanguageProfile[] = Object.freeze([
  germanProfile,
  englishProfile,
  spanishProfile,
  frenchProfile,
  identityOnlyProfiles[0]!,
  identityOnlyProfiles[1]!,
  italianProfile,
  japaneseProfile,
  portugueseProfile,
  ...identityOnlyProfiles.slice(2),
]);

export const LANGUAGE_PROFILE_REFS: readonly LanguageProfileRef[] =
  Object.freeze(
    LANGUAGE_PROFILES.map((profile) =>
      Object.freeze({ id: profile.id, version: profile.version }),
    ),
  );

export interface SearchableLanguageProfile {
  readonly ref: LanguageProfileRef;
  readonly autonym: string;
  readonly searchableNames: readonly string[];
  readonly direction: "ltr" | "rtl";
}

export const SEARCHABLE_LANGUAGE_PROFILE_CATALOG: readonly SearchableLanguageProfile[] =
  Object.freeze(
    LANGUAGE_PROFILES.map((profile) =>
      Object.freeze({
        ref: Object.freeze({ id: profile.id, version: profile.version }),
        autonym: profile.autonym,
        searchableNames: Object.freeze([...profile.searchableNames]),
        direction: profile.direction,
      }),
    ),
  );

export function searchLanguageProfiles(
  query: string,
): readonly SearchableLanguageProfile[] {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return SEARCHABLE_LANGUAGE_PROFILE_CATALOG;
  }
  return SEARCHABLE_LANGUAGE_PROFILE_CATALOG.filter((profile) =>
    [profile.ref.id, profile.autonym, ...profile.searchableNames].some(
      (value) => value.toLowerCase().includes(needle),
    ),
  );
}
