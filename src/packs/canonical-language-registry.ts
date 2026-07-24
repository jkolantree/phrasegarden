import registryData from "./canonical-language-registry.data.json";
import type { CanonicalLanguageRegistry } from "../domain/language-identity";

export const CANONICAL_LANGUAGE_REGISTRY_CONTENT_SHA256 =
  "37EEF56CD6238F87ADA21F22BCA7CC947D3A4FAE224DEFE67141C10DE4DEED91";

function exactRegistryId(
  value: string,
): "phrasegarden-canonical-language-tags" {
  if (value !== "phrasegarden-canonical-language-tags") {
    throw new Error("Invalid bundled canonical-language registry ID");
  }
  return value;
}

function rejectPolicy(value: string, field: string): "reject" {
  if (value !== "reject") {
    throw new Error(`Invalid bundled canonical-language ${field} policy`);
  }
  return value;
}

const source = Object.freeze({ ...registryData.source });
const policy = Object.freeze({
  aliases: rejectPolicy(registryData.policy.aliases, "aliases"),
  grandfathered: rejectPolicy(
    registryData.policy.grandfathered,
    "grandfathered",
  ),
  privateUse: rejectPolicy(registryData.policy.privateUse, "private-use"),
  extensions: rejectPolicy(registryData.policy.extensions, "extensions"),
});
const canonicalTags = Object.freeze([...registryData.canonicalTags]);
const deprecatedForms = Object.freeze(
  registryData.deprecatedForms.map((entry) => Object.freeze({ ...entry })),
);
const grandfatheredTags = Object.freeze([
  ...registryData.grandfatheredTags,
]);

export const canonicalLanguageRegistry: CanonicalLanguageRegistry =
  Object.freeze({
    registryId: exactRegistryId(registryData.registryId),
    version: registryData.version,
    contentSha256: CANONICAL_LANGUAGE_REGISTRY_CONTENT_SHA256,
    source,
    policy,
    canonicalTags,
    deprecatedForms,
    grandfatheredTags,
  });

export const CANONICAL_LANGUAGE_REGISTRY_REF = Object.freeze({
  version: canonicalLanguageRegistry.version,
  contentSha256: canonicalLanguageRegistry.contentSha256,
});
