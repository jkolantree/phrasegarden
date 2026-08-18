import {
  SEARCHABLE_LANGUAGE_PROFILE_CATALOG,
  type SearchableLanguageProfile,
} from "../packs";

const FIRST_STRONG_ISOLATE = "\u2068";
const POP_DIRECTIONAL_ISOLATE = "\u2069";

const PUBLIC_LANGUAGE_ENTRIES = [
  ["zh-Hant-TW", "Chinese, Traditional (Taiwan)"],
  ["en", "English"],
  ["fr", "French"],
  ["de", "German"],
  ["he", "Hebrew"],
  ["id", "Indonesian"],
  ["it", "Italian"],
  ["ja", "Japanese"],
  ["tlh", "Klingon"],
  ["pt", "Portuguese"],
  ["es", "Spanish"],
  ["yi", "Yiddish"],
] as const;

const publicNameById = new Map<string, string>(PUBLIC_LANGUAGE_ENTRIES);

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
  publicNameById.size !== PUBLIC_LANGUAGE_ENTRIES.length ||
  PUBLIC_LANGUAGE_ENTRIES.length !== SEARCHABLE_LANGUAGE_PROFILE_CATALOG.length ||
  SEARCHABLE_LANGUAGE_PROFILE_CATALOG.some(
    (profile) => !publicNameById.has(profile.ref.id),
  )
) {
  throw new Error("Public language presentation catalog is not exact");
}

export const PUBLIC_LANGUAGE_PROFILE_CATALOG: readonly SearchableLanguageProfile[] =
  Object.freeze(PUBLIC_LANGUAGE_ENTRIES.map(([id]) => requiredProfile(id)));

export function publicLanguageName(id: string): string {
  const name = publicNameById.get(id);
  if (name === undefined) {
    throw new Error(`Missing public language name: ${id}`);
  }
  return name;
}

export function publicLanguageOptionLabel(
  profile: SearchableLanguageProfile,
): string {
  const publicName = publicLanguageName(profile.ref.id);
  if (publicName === profile.autonym) {
    return publicName;
  }
  return `${publicName} — ${FIRST_STRONG_ISOLATE}${profile.autonym}${POP_DIRECTIONAL_ISOLATE}`;
}
