import type { PairPack } from "../domain";
import { CANONICAL_LANGUAGE_REGISTRY_REF } from "./canonical-language-registry";
import { LANGUAGE_PROFILE_VERSION } from "./language-profiles";

export const EN_JA_PREVIEW_PACK_ID = "en-ja-preview";
export const EN_JA_PREVIEW_PACK_VERSION = "1.0.0-preview.1";

export const EN_JA_PREVIEW_PACK: PairPack = {
  id: EN_JA_PREVIEW_PACK_ID,
  version: EN_JA_PREVIEW_PACK_VERSION,
  directions: [
    {
      languageRegistry: CANONICAL_LANGUAGE_REGISTRY_REF,
      home: { id: "en", version: LANGUAGE_PROFILE_VERSION },
      target: { id: "ja", version: LANGUAGE_PROFILE_VERSION },
      clauses: [
        {
          id: "pair.en-ja.target-realization",
          origin: "pair-pack",
          authority: "pair-pack",
          section: 6,
          order: 700,
          whenAll: [],
          renderingKey: "pair.en-ja.target-realization",
          effect: {
            key: "pair.target-realization",
            value: "english-intent-as-natural-japanese",
          },
        },
        {
          id: "pair.en-ja.social-force",
          origin: "pair-pack",
          authority: "pair-pack",
          section: 6,
          order: 710,
          whenAll: [],
          renderingKey: "pair.en-ja.social-force",
          effect: {
            key: "pair.social-force",
            value: "preserve-english-force-in-japanese",
          },
        },
        {
          id: "pair.en-ja.referents",
          origin: "pair-pack",
          authority: "pair-pack",
          section: 6,
          order: 720,
          whenAll: [],
          renderingKey: "pair.en-ja.referents",
          effect: {
            key: "pair.referents",
            value: "omit-unneeded-japanese-pronouns-without-invention",
          },
        },
        {
          id: "pair.en-ja.names-and-honorifics",
          origin: "pair-pack",
          authority: "pair-pack",
          section: 6,
          order: 730,
          whenAll: [],
          renderingKey: "pair.en-ja.names-and-honorifics",
          effect: {
            key: "pair.names-and-honorifics",
            value: "preserve-marked-honorifics-and-unknown-readings",
          },
        },
        {
          id: "pair.en-ja.code-switching",
          origin: "pair-pack",
          authority: "pair-pack",
          section: 6,
          order: 740,
          whenAll: [],
          renderingKey: "pair.en-ja.code-switching",
          effect: {
            key: "pair.code-switching",
            value: "preserve-intentional-english-japanese-switches",
          },
        },
      ],
      knownLimitations: [
        {
          code: "L-EN-JA-UNKNOWN-NAME-READING",
          order: 160,
          whenAll: [
            { path: "unknownName", op: "eq", value: "preserve-and-ask" },
          ],
          renderingKey: "limitation.en-ja.unknown-name-reading",
        },
      ],
    },
    {
      languageRegistry: CANONICAL_LANGUAGE_REGISTRY_REF,
      home: { id: "ja", version: LANGUAGE_PROFILE_VERSION },
      target: { id: "en", version: LANGUAGE_PROFILE_VERSION },
      clauses: [
        {
          id: "pair.ja-en.target-realization",
          origin: "pair-pack",
          authority: "pair-pack",
          section: 6,
          order: 700,
          whenAll: [],
          renderingKey: "pair.ja-en.target-realization",
          effect: {
            key: "pair.target-realization",
            value: "japanese-intent-as-natural-english",
          },
        },
        {
          id: "pair.ja-en.social-force",
          origin: "pair-pack",
          authority: "pair-pack",
          section: 6,
          order: 710,
          whenAll: [],
          renderingKey: "pair.ja-en.social-force",
          effect: {
            key: "pair.social-force",
            value: "preserve-japanese-force-in-english",
          },
        },
        {
          id: "pair.ja-en.referents",
          origin: "pair-pack",
          authority: "pair-pack",
          section: 6,
          order: 720,
          whenAll: [],
          renderingKey: "pair.ja-en.referents",
          effect: {
            key: "pair.referents",
            value: "do-not-invent-omitted-japanese-referents",
          },
        },
        {
          id: "pair.ja-en.names-and-honorifics",
          origin: "pair-pack",
          authority: "pair-pack",
          section: 6,
          order: 730,
          whenAll: [],
          renderingKey: "pair.ja-en.names-and-honorifics",
          effect: {
            key: "pair.names-and-honorifics",
            value: "preserve-honorific-and-name-reading-uncertainty",
          },
        },
        {
          id: "pair.ja-en.code-switching",
          origin: "pair-pack",
          authority: "pair-pack",
          section: 6,
          order: 740,
          whenAll: [],
          renderingKey: "pair.ja-en.code-switching",
          effect: {
            key: "pair.code-switching",
            value: "preserve-intentional-japanese-english-switches",
          },
        },
      ],
      knownLimitations: [
        {
          code: "L-JA-EN-UNKNOWN-NAME-READING",
          order: 160,
          whenAll: [
            { path: "unknownName", op: "eq", value: "preserve-and-ask" },
          ],
          renderingKey: "limitation.ja-en.unknown-name-reading",
        },
      ],
    },
  ],
};
