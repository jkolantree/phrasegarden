import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  sameLanguageRegistryRef,
  validateCanonicalLanguageId,
  validateLanguageProfile,
  validateLanguageProfileRef,
  validateLanguageRegistryRef,
  validateRecipeConfiguration,
  type ArtifactProvenance,
  type Clause,
  type LanguageProfile,
  type PairDirection,
  type SharePayloadV1,
  type ValidationIssue,
} from "../../src/domain";
import {
  CANONICAL_LANGUAGE_REGISTRY_CONTENT_SHA256,
  CANONICAL_LANGUAGE_REGISTRY_REF,
  canonicalLanguageRegistry,
} from "../../src/packs";
import {
  jsonClone,
  validWrittenConfiguration,
} from "../fixtures/configurations";

const validProfileClause: Clause = {
  id: "profile.ja.identity",
  origin: "profile",
  authority: "profile",
  section: 2,
  order: 20,
  whenAll: [],
  renderingKey: "profile.ja.identity",
  effect: { key: "language.identity", value: "ja" },
};

const validJapaneseProfile: LanguageProfile = {
  languageRegistry: CANONICAL_LANGUAGE_REGISTRY_REF,
  id: "ja",
  version: "1.0.0-test",
  bcp47: "ja",
  autonym: "日本語",
  searchableNames: ["Japanese", "日本語"],
  direction: "ltr",
  scripts: ["Jpan"],
  monolingualClauses: [validProfileClause],
};

function issueKeys(issues: readonly ValidationIssue[]): string[] {
  return issues.map(
    (item) => `${item.stage}|${item.code}|${item.path}`,
  );
}

function profileIssues(input: unknown): readonly ValidationIssue[] {
  const result = validateLanguageProfile(input, canonicalLanguageRegistry);
  expect(result.ok).toBe(false);
  return result.ok ? [] : result.issues;
}

function recursivelyFrozen(input: unknown): boolean {
  if (typeof input !== "object" || input === null) {
    return true;
  }
  if (!Object.isFrozen(input)) {
    return false;
  }
  return Reflect.ownKeys(input).every((key) =>
    recursivelyFrozen((input as Record<PropertyKey, unknown>)[key]),
  );
}

describe("bundled canonical language registry", () => {
  it("pins the exact UTF-8/LF source bytes and external SHA-256", () => {
    const path = resolve(
      process.cwd(),
      "src/packs/canonical-language-registry.data.json",
    );
    const bytes = readFileSync(path);
    expect(bytes.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf]))).toBe(
      false,
    );
    expect(bytes.includes(0x0d)).toBe(false);
    expect(bytes.at(-1)).toBe(0x0a);
    const digest = createHash("sha256").update(bytes).digest("hex").toUpperCase();
    expect(digest).toBe(CANONICAL_LANGUAGE_REGISTRY_CONTENT_SHA256);
    expect(canonicalLanguageRegistry.contentSha256).toBe(digest);
    expect(canonicalLanguageRegistry.version).toBe("2026-08-17.1");
    expect(canonicalLanguageRegistry.source).toEqual({
      name: "IANA Language Subtag Registry",
      registryFileDate: "2026-08-08",
      uri: "https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry",
    });
    expect(canonicalLanguageRegistry.policy).toEqual({
      aliases: "reject",
      grandfathered: "reject",
      privateUse: "reject",
      extensions: "reject",
    });
  });

  it("is deeply frozen, unique, and exact-order stable", () => {
    expect(recursivelyFrozen(canonicalLanguageRegistry)).toBe(true);
    expect(canonicalLanguageRegistry.canonicalTags).toEqual([
      "de",
      "en",
      "es",
      "fr",
      "he",
      "id",
      "it",
      "ja",
      "pt",
      "tlh",
      "yi",
      "zh-Hant-TW",
    ]);
    expect(
      new Set(canonicalLanguageRegistry.canonicalTags).size,
    ).toBe(canonicalLanguageRegistry.canonicalTags.length);
    expect(
      canonicalLanguageRegistry.deprecatedForms.map((entry) => entry.tag),
    ).toEqual(["in", "iw", "ji"]);
    expect(
      canonicalLanguageRegistry.deprecatedForms.every((entry) =>
        canonicalLanguageRegistry.canonicalTags.includes(entry.preferredTag),
      ),
    ).toBe(true);
    expect(
      [...canonicalLanguageRegistry.grandfatheredTags].sort(),
    ).toEqual(canonicalLanguageRegistry.grandfatheredTags);
  });
});

describe("canonical language identity", () => {
  it.each(["de", "en", "es", "fr", "it", "ja", "pt", "zh-Hant-TW"] as const)(
    "accepts exact registry member %s",
    (tag) => {
      expect(
        validateCanonicalLanguageId(tag, canonicalLanguageRegistry),
      ).toEqual({ ok: true, value: tag });
    },
  );

  it.each([
    ["EN", "E-LANGUAGE-TAG-CASING"],
    ["zh-hant-tw", "E-LANGUAGE-TAG-CASING"],
    ["iw", "E-LANGUAGE-TAG-DEPRECATED"],
    ["i-klingon", "E-LANGUAGE-TAG-GRANDFATHERED"],
    ["x-phrasegarden", "E-LANGUAGE-TAG-PRIVATE-USE"],
    ["en-x-private", "E-LANGUAGE-TAG-PRIVATE-USE"],
    ["en-u-ca-japanese", "E-LANGUAGE-TAG-EXTENSION"],
    ["pt-BR", "E-LANGUAGE-TAG-UNSUPPORTED"],
    ["pt-PT", "E-LANGUAGE-TAG-UNSUPPORTED"],
    ["und", "E-LANGUAGE-TAG-UNSUPPORTED"],
  ] as const)("rejects %s as %s without normalization", (tag, code) => {
    const result = validateCanonicalLanguageId(
      tag,
      canonicalLanguageRegistry,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.map((item) => item.code)).toEqual([code]);
    }
  });

  it("fails missing, old, and hash-mismatched registry refs clearly", () => {
    const missing = validateLanguageRegistryRef(
      undefined,
      canonicalLanguageRegistry,
    );
    const old = validateLanguageRegistryRef(
      {
        version: "2025-01-01.1",
        contentSha256: CANONICAL_LANGUAGE_REGISTRY_REF.contentSha256,
      },
      canonicalLanguageRegistry,
    );
    const altered = validateLanguageRegistryRef(
      {
        version: CANONICAL_LANGUAGE_REGISTRY_REF.version,
        contentSha256: "0".repeat(64),
      },
      canonicalLanguageRegistry,
    );
    expect(missing.ok ? [] : issueKeys(missing.issues)).toEqual([
      "artifact-identity|E-LANGUAGE-REGISTRY-VERSION|$.version",
    ]);
    expect(old.ok ? [] : issueKeys(old.issues)).toEqual([
      "artifact-identity|E-LANGUAGE-REGISTRY-VERSION|$.version",
    ]);
    expect(altered.ok ? [] : issueKeys(altered.issues)).toEqual([
      "artifact-identity|E-LANGUAGE-REGISTRY-HASH|$.contentSha256",
    ]);
  });
});

describe("language profile validation", () => {
  it("reconstructs an exact deeply detached profile", () => {
    const input = jsonClone(validJapaneseProfile);
    const result = validateLanguageProfile(input, canonicalLanguageRegistry);
    expect(result).toEqual({ ok: true, value: validJapaneseProfile });
    if (result.ok) {
      expect(result.value).not.toBe(input);
      expect(result.value.languageRegistry).not.toBe(input.languageRegistry);
      expect(result.value.searchableNames).not.toBe(input.searchableNames);
      expect(result.value.scripts).not.toBe(input.scripts);
      expect(result.value.monolingualClauses[0]).not.toBe(
        input.monolingualClauses[0],
      );
    }
  });

  it("accepts language-script-region identity and independent profile versions", () => {
    const first = {
      ...jsonClone(validJapaneseProfile),
      id: "zh-Hant-TW",
      bcp47: "zh-Hant-TW",
      version: "1.0.0",
      autonym: "繁體中文（台灣）",
      scripts: ["Hant"],
      monolingualClauses: [],
    };
    const second = { ...jsonClone(first), version: "2.0.0" };
    expect(validateLanguageProfile(first, canonicalLanguageRegistry).ok).toBe(
      true,
    );
    expect(validateLanguageProfile(second, canonicalLanguageRegistry).ok).toBe(
      true,
    );
  });

  it("requires id and bcp47 to match byte for byte", () => {
    const mismatch = {
      ...jsonClone(validJapaneseProfile),
      id: "en",
    };
    expect(issueKeys(profileIssues(mismatch))).toContain(
      "artifact-identity|E-LANGUAGE-IDENTITY-MISMATCH|$.bcp47",
    );

    const casing = {
      ...jsonClone(validJapaneseProfile),
      id: "JA",
      bcp47: "JA",
    };
    expect(issueKeys(profileIssues(casing))).toEqual([
      "artifact-identity|E-LANGUAGE-TAG-CASING|$.bcp47",
      "artifact-identity|E-LANGUAGE-TAG-CASING|$.id",
    ]);
  });

  it("requires the exact registry version and content hash", () => {
    const input = {
      ...jsonClone(validJapaneseProfile),
      languageRegistry: {
        ...CANONICAL_LANGUAGE_REGISTRY_REF,
        version: "2025-01-01.1",
      },
    };
    expect(issueKeys(profileIssues(input))).toEqual([
      "artifact-identity|E-LANGUAGE-REGISTRY-VERSION|$.languageRegistry.version",
    ]);
  });

  it("rejects profile-owned review claims and invalid local metadata", () => {
    const input = {
      ...jsonClone(validJapaneseProfile),
      reviewRecords: [],
      searchableNames: ["Japanese", "Japanese"],
      scripts: ["jpan"],
    };
    expect(issueKeys(profileIssues(input))).toEqual([
      "input-shape|E-UNKNOWN-FIELD|$.reviewRecords",
      "authored-data|E-DUPLICATE-SEARCHABLE-NAME|$.searchableNames[1]",
      "authored-data|E-SCRIPT-CASING|$.scripts[0]",
    ]);
  });

  it("reuses exact clauses, requires profile ownership, and rejects duplicates", () => {
    const wrongOwner = {
      ...jsonClone(validProfileClause),
      id: "recipe-owned",
      origin: "recipe",
      authority: "fallback",
    };
    const duplicate = {
      ...jsonClone(validProfileClause),
      order: 30,
    };
    const input = {
      ...jsonClone(validJapaneseProfile),
      monolingualClauses: [
        jsonClone(validProfileClause),
        wrongOwner,
        duplicate,
      ],
    };
    expect(issueKeys(profileIssues(input))).toEqual([
      "authored-data|E-DUPLICATE-CLAUSE-ID|$.monolingualClauses[2].id",
      "authored-data|E-PROFILE-CLAUSE-OWNERSHIP|$.monolingualClauses[1].origin",
    ]);
  });

  it("rejects sparse arrays and never invokes a profile accessor", () => {
    const sparse = jsonClone(validJapaneseProfile) as unknown as {
      searchableNames: string[];
    };
    sparse.searchableNames = new Array(2);
    expect(issueKeys(profileIssues(sparse))).toContain(
      "input-shape|E-SPARSE-ARRAY|$.searchableNames",
    );

    const accessor = jsonClone(validJapaneseProfile) as unknown as Record<
      string,
      unknown
    >;
    let calls = 0;
    Object.defineProperty(accessor, "id", {
      enumerable: true,
      get() {
        calls += 1;
        return "ja";
      },
    });
    expect(issueKeys(profileIssues(accessor))).toContain(
      "input-shape|E-ACCESSOR-FIELD|$.id",
    );
    expect(calls).toBe(0);
  });
});

describe("cross-artifact and cross-environment identity", () => {
  it("pins profiles, pair refs, configuration, provenance, and share payloads", () => {
    const pair = {
      languageRegistry: CANONICAL_LANGUAGE_REGISTRY_REF,
      home: validWrittenConfiguration.languages.home,
      target: validWrittenConfiguration.languages.target,
    } satisfies Pick<PairDirection, "languageRegistry" | "home" | "target">;
    const provenance = {
      compilerVersion: "0.0.0-test",
      compilerPolicyVersion: "0.0.0-test",
      schemaVersion: 1,
      languageRegistry: CANONICAL_LANGUAGE_REGISTRY_REF,
      recipe: validWrittenConfiguration.recipe,
      homeProfile: pair.home,
      targetProfile: pair.target,
      pairPack: "none",
      supportTier: "generic",
      supportReviewStatus: "not-applicable",
      supportDirection: "en→ja",
      supportReviewDate: "not-applicable",
      promptSurface: {
        ...validWrittenConfiguration.promptSurface,
        locale: "en",
      },
    } satisfies ArtifactProvenance;
    const share = {
      shareVersion: 1,
      languageRegistry: CANONICAL_LANGUAGE_REGISTRY_REF,
      recipe: validWrittenConfiguration.recipe,
      promptSurface: validWrittenConfiguration.promptSurface,
      languages: validWrittenConfiguration.languages,
      register: validWrittenConfiguration.register,
      ambiguity: validWrittenConfiguration.ambiguity,
      codeSwitching: validWrittenConfiguration.codeSwitching,
      dataHandling: validWrittenConfiguration.dataHandling,
      titleHandling: validWrittenConfiguration.titleHandling,
      unknownName: validWrittenConfiguration.unknownName,
      settings: validWrittenConfiguration.settings,
    } satisfies SharePayloadV1;

    for (const ref of [
      pair.languageRegistry,
      validWrittenConfiguration.languageRegistry,
      provenance.languageRegistry,
      share.languageRegistry,
    ]) {
      expect(
        sameLanguageRegistryRef(
          ref,
          CANONICAL_LANGUAGE_REGISTRY_REF,
        ),
      ).toBe(true);
    }
    expect(
      validateLanguageProfileRef(pair.home, canonicalLanguageRegistry).ok,
    ).toBe(true);
    expect(
      validateLanguageProfileRef(
        { ...pair.target, id: "JA" },
        canonicalLanguageRegistry,
      ).ok,
    ).toBe(false);
  });

  it("enforces registry and endpoint identity in normalized configurations", () => {
    expect(
      validateRecipeConfiguration(
        validWrittenConfiguration,
        canonicalLanguageRegistry,
      ).ok,
    ).toBe(true);

    const casing = jsonClone(validWrittenConfiguration) as {
      languages: { home: { id: string } };
    };
    casing.languages.home.id = "EN";
    const casingResult = validateRecipeConfiguration(
      casing,
      canonicalLanguageRegistry,
    );
    expect(casingResult.ok ? [] : issueKeys(casingResult.issues)).toContain(
      "artifact-identity|E-LANGUAGE-TAG-CASING|$.languages.home.id",
    );

    const old = jsonClone(validWrittenConfiguration) as {
      languageRegistry?: { version: string; contentSha256: string };
    };
    delete old.languageRegistry;
    const oldResult = validateRecipeConfiguration(
      old,
      canonicalLanguageRegistry,
    );
    expect(oldResult.ok ? [] : issueKeys(oldResult.issues)).toContain(
      "artifact-identity|E-LANGUAGE-REGISTRY-VERSION|$.languageRegistry.version",
    );
  });

  it("returns byte-identical results with hostile Intl and changed locale/TZ", () => {
    const expected = JSON.stringify(
      validateLanguageProfile(
        jsonClone(validJapaneseProfile),
        canonicalLanguageRegistry,
      ),
    );
    const originalIntl = globalThis.Intl;
    const originalLang = process.env.LANG;
    const originalTz = process.env.TZ;
    Object.defineProperty(globalThis, "Intl", {
      configurable: true,
      value: new Proxy(originalIntl, {
        get() {
          throw new Error("ambient Intl must not be read");
        },
      }),
    });
    process.env.LANG = "tr_TR.UTF-8";
    process.env.TZ = "Pacific/Kiritimati";
    try {
      const actual = JSON.stringify(
        validateLanguageProfile(
          jsonClone(validJapaneseProfile),
          canonicalLanguageRegistry,
        ),
      );
      expect(actual).toBe(expected);
    } finally {
      Object.defineProperty(globalThis, "Intl", {
        configurable: true,
        value: originalIntl,
      });
      if (originalLang === undefined) {
        delete process.env.LANG;
      } else {
        process.env.LANG = originalLang;
      }
      if (originalTz === undefined) {
        delete process.env.TZ;
      } else {
        process.env.TZ = originalTz;
      }
    }
  });
});
