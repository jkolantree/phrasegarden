import {
  SEARCHABLE_LANGUAGE_PROFILE_CATALOG,
  type SearchableLanguageProfile,
} from "../packs";
import { uiLanguageName, type UiLocaleCatalog } from "../locales";

const FIRST_STRONG_ISOLATE = "\u2068";
const POP_DIRECTIONAL_ISOLATE = "\u2069";

const PUBLIC_LANGUAGE_IDS = [
  "zh-Hant-TW",
  "en",
  "fr",
  "de",
  "he",
  "id",
  "it",
  "ja",
  "tlh",
  "pt",
  "es",
  "yi",
] as const;

function requiredProfile(id: string): SearchableLanguageProfile {
  const profile = SEARCHABLE_LANGUAGE_PROFILE_CATALOG.find(
    (candidate) => candidate.ref.id === id,
  );
  if (profile === undefined) {
    throw new Error(`Missing public language profile: ${id}`);
  }
  return profile;
}

if (
  new Set(PUBLIC_LANGUAGE_IDS).size !== PUBLIC_LANGUAGE_IDS.length ||
  PUBLIC_LANGUAGE_IDS.length !== SEARCHABLE_LANGUAGE_PROFILE_CATALOG.length ||
  SEARCHABLE_LANGUAGE_PROFILE_CATALOG.some(
    (profile) => !PUBLIC_LANGUAGE_IDS.includes(profile.ref.id as never),
  )
) {
  throw new Error("Public language presentation catalog is not exact");
}

export const PUBLIC_LANGUAGE_PROFILE_CATALOG: readonly SearchableLanguageProfile[] =
  Object.freeze(PUBLIC_LANGUAGE_IDS.map((id) => requiredProfile(id)));

export function publicLanguageName(
  catalog: UiLocaleCatalog,
  id: string,
): string {
  return uiLanguageName(catalog, id);
}

export function publicLanguageOptionLabel(
  catalog: UiLocaleCatalog,
  profile: SearchableLanguageProfile,
): string {
  const publicName = publicLanguageName(catalog, profile.ref.id);
  if (publicName === profile.autonym) {
    return publicName;
  }
  return `${publicName} — ${FIRST_STRONG_ISOLATE}${profile.autonym}${POP_DIRECTIONAL_ISOLATE}`;
}
