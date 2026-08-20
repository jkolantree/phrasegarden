import type { SearchableLanguageProfile } from "../packs";
import type { UiLocaleCatalog } from "../locales";
import { publicLanguageName } from "./language-presentation";

interface LanguageLabelProps {
  readonly ui: UiLocaleCatalog;
  readonly profile: SearchableLanguageProfile;
  readonly showCode?: boolean;
}

export function LanguageLabel({
  ui,
  profile,
  showCode = true,
}: LanguageLabelProps) {
  const primaryName = publicLanguageName(ui, profile.ref.id);
  const namesMatch = primaryName === profile.autonym;
  return (
    <span class="language-label">
      {!namesMatch && <span>{primaryName}</span>}
      <bdi
        class="language-autonym"
        lang={profile.ref.id}
        dir={profile.direction}
      >
        {profile.autonym}
      </bdi>
      {showCode && <span class="language-code">{profile.ref.id}</span>}
    </span>
  );
}
