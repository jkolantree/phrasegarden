import { compareValidationIssues } from "./primitives";
import type {
  ValidationIssue,
  ValidationResult,
} from "./results";
import {
  addValidationIssue as issue,
  dataValue,
  inspectRecord,
} from "./validation-input";

export type CanonicalLanguageId = string;

export interface LanguageRegistryRef {
  readonly version: string;
  readonly contentSha256: string;
}

export interface LanguageProfileRef {
  readonly id: CanonicalLanguageId;
  readonly version: string;
}

export interface CanonicalLanguageRegistry
  extends LanguageRegistryRef {
  readonly registryId: "phrasegarden-canonical-language-tags";
  readonly source: {
    readonly name: string;
    readonly registryFileDate: string;
    readonly uri: string;
  };
  readonly policy: {
    readonly aliases: "reject";
    readonly grandfathered: "reject";
    readonly privateUse: "reject";
    readonly extensions: "reject";
  };
  readonly canonicalTags: readonly CanonicalLanguageId[];
  readonly deprecatedForms: readonly {
    readonly tag: string;
    readonly preferredTag: CanonicalLanguageId;
  }[];
  readonly grandfatheredTags: readonly string[];
}

function failure(issues: ValidationIssue[]): ValidationResult<never> {
  return { ok: false, issues: [...issues].sort(compareValidationIssues) };
}

function asciiFold(value: string): string {
  let folded = "";
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    folded += String.fromCharCode(
      code >= 0x41 && code <= 0x5a ? code + 0x20 : code,
    );
  }
  return folded;
}

function isPrivateUse(value: string): boolean {
  const folded = asciiFold(value);
  return folded === "x" || folded.startsWith("x-") || folded.includes("-x-");
}

function hasExtension(value: string): boolean {
  const parts = value.split("-");
  return parts.some((part, index) => {
    if (index === 0 || part.length !== 1) {
      return false;
    }
    const code = part.charCodeAt(0);
    const asciiLetter =
      (code >= 0x41 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a);
    const digit = code >= 0x30 && code <= 0x39;
    return (asciiLetter || digit) && asciiFold(part) !== "x";
  });
}

function exactCanonicalTag(
  value: string,
  registry: CanonicalLanguageRegistry,
): CanonicalLanguageId | undefined {
  return registry.canonicalTags.find((tag) => tag === value);
}

function casingMatch(
  value: string,
  registry: CanonicalLanguageRegistry,
): CanonicalLanguageId | undefined {
  const folded = asciiFold(value);
  return registry.canonicalTags.find((tag) => asciiFold(tag) === folded);
}

function deprecatedMatch(
  value: string,
  registry: CanonicalLanguageRegistry,
): CanonicalLanguageRegistry["deprecatedForms"][number] | undefined {
  const primary = asciiFold(value).split("-")[0];
  return registry.deprecatedForms.find((entry) => entry.tag === primary);
}

function grandfatheredMatch(
  value: string,
  registry: CanonicalLanguageRegistry,
): string | undefined {
  const folded = asciiFold(value);
  return registry.grandfatheredTags.find(
    (tag) => asciiFold(tag) === folded,
  );
}

export function languageRegistryRef(
  registry: CanonicalLanguageRegistry,
): LanguageRegistryRef {
  return {
    version: registry.version,
    contentSha256: registry.contentSha256,
  };
}

export function sameLanguageRegistryRef(
  left: LanguageRegistryRef,
  right: LanguageRegistryRef,
): boolean {
  return (
    left.version === right.version &&
    left.contentSha256 === right.contentSha256
  );
}

export function validateLanguageRegistryRef(
  input: unknown,
  registry: CanonicalLanguageRegistry,
): ValidationResult<LanguageRegistryRef> {
  const issues: ValidationIssue[] = [];
  if (input === undefined) {
    issue(
      issues,
      "artifact-identity",
      "E-LANGUAGE-REGISTRY-VERSION",
      "$.version",
      { expectedVersion: registry.version },
    );
    return failure(issues);
  }

  const record = inspectRecord(
    input,
    "$",
    ["version", "contentSha256"],
    [],
    issues,
  );
  const versionValue = dataValue(record, "version");
  const hashValue = dataValue(record, "contentSha256");

  if (record !== undefined && !record.present.has("version")) {
    issue(
      issues,
      "artifact-identity",
      "E-LANGUAGE-REGISTRY-VERSION",
      "$.version",
      { expectedVersion: registry.version },
    );
  } else if (typeof versionValue !== "string") {
    issue(issues, "input-shape", "E-EXPECTED-STRING", "$.version");
  } else if (versionValue !== registry.version) {
    issue(
      issues,
      "artifact-identity",
      "E-LANGUAGE-REGISTRY-VERSION",
      "$.version",
      { actualVersion: versionValue, expectedVersion: registry.version },
    );
  }

  if (record !== undefined && !record.present.has("contentSha256")) {
    issue(
      issues,
      "artifact-identity",
      "E-LANGUAGE-REGISTRY-HASH",
      "$.contentSha256",
      { expectedHash: registry.contentSha256 },
    );
  } else if (typeof hashValue !== "string") {
    issue(issues, "input-shape", "E-EXPECTED-STRING", "$.contentSha256");
  } else if (hashValue !== registry.contentSha256) {
    issue(
      issues,
      "artifact-identity",
      "E-LANGUAGE-REGISTRY-HASH",
      "$.contentSha256",
      { actualHash: hashValue, expectedHash: registry.contentSha256 },
    );
  }

  return issues.length > 0
    ? failure(issues)
    : { ok: true, value: languageRegistryRef(registry) };
}

export function validateCanonicalLanguageId(
  input: unknown,
  registry: CanonicalLanguageRegistry,
): ValidationResult<CanonicalLanguageId> {
  const issues: ValidationIssue[] = [];
  if (typeof input !== "string") {
    issue(issues, "input-shape", "E-EXPECTED-STRING", "$");
    return failure(issues);
  }
  if (input.length === 0) {
    issue(issues, "artifact-identity", "E-EMPTY-STRING", "$");
    return failure(issues);
  }

  const canonical = exactCanonicalTag(input, registry);
  if (canonical !== undefined) {
    return { ok: true, value: canonical };
  }

  const differentlyCased = casingMatch(input, registry);
  if (differentlyCased !== undefined) {
    issue(
      issues,
      "artifact-identity",
      "E-LANGUAGE-TAG-CASING",
      "$",
      { actualTag: input, canonicalTag: differentlyCased },
    );
  } else {
    const deprecated = deprecatedMatch(input, registry);
    const grandfathered = grandfatheredMatch(input, registry);
    if (deprecated !== undefined) {
      issue(
        issues,
        "artifact-identity",
        "E-LANGUAGE-TAG-DEPRECATED",
        "$",
        { actualTag: input, preferredTag: deprecated.preferredTag },
      );
    } else if (grandfathered !== undefined) {
      issue(
        issues,
        "artifact-identity",
        "E-LANGUAGE-TAG-GRANDFATHERED",
        "$",
        { actualTag: input },
      );
    } else if (isPrivateUse(input)) {
      issue(
        issues,
        "artifact-identity",
        "E-LANGUAGE-TAG-PRIVATE-USE",
        "$",
        { actualTag: input },
      );
    } else if (hasExtension(input)) {
      issue(
        issues,
        "artifact-identity",
        "E-LANGUAGE-TAG-EXTENSION",
        "$",
        { actualTag: input },
      );
    } else {
      issue(
        issues,
        "artifact-identity",
        "E-LANGUAGE-TAG-UNSUPPORTED",
        "$",
        { actualTag: input },
      );
    }
  }
  return failure(issues);
}

export function validateLanguageProfileRef(
  input: unknown,
  registry: CanonicalLanguageRegistry,
): ValidationResult<LanguageProfileRef> {
  const issues: ValidationIssue[] = [];
  const record = inspectRecord(
    input,
    "$",
    ["id", "version"],
    ["id", "version"],
    issues,
  );
  if (record === undefined) {
    return failure(issues);
  }

  const idInput = dataValue(record, "id");
  const idResult = record.values.has("id")
    ? validateCanonicalLanguageId(idInput, registry)
    : undefined;
  if (idResult !== undefined && !idResult.ok) {
    for (const item of idResult.issues) {
      issues.push({ ...item, path: "$.id" });
    }
  }
  const versionInput = dataValue(record, "version");
  let version: string | undefined;
  if (record.values.has("version")) {
    if (typeof versionInput !== "string") {
      issue(issues, "input-shape", "E-EXPECTED-STRING", "$.version");
      issue(
        issues,
        "artifact-identity",
        "E-MISSING-PINNED-VERSION",
        "$.version",
      );
    } else if (versionInput.length === 0) {
      issue(issues, "configuration", "E-EMPTY-STRING", "$.version");
      issue(
        issues,
        "artifact-identity",
        "E-MISSING-PINNED-VERSION",
        "$.version",
      );
    } else {
      version = versionInput;
    }
  }

  if (issues.length > 0 || idResult?.ok !== true || version === undefined) {
    return failure(issues);
  }
  return { ok: true, value: { id: idResult.value, version } };
}
