import type { SearchableLanguageProfile } from "../packs";
import { publicLanguageName } from "./language-presentation";

interface LanguageLabelProps {
  readonly profile: SearchableLanguageProfile;
  readonly showCode?: boolean;
}

export function LanguageLabel({
  profile,
  showCode = true,
}: LanguageLabelProps) {
  const primaryName = publicLanguageName(profile.ref.id);
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
