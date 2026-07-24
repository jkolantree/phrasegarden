import {
  PHRASEGARDEN_COMPILER_VERSION,
  type CompilerPolicy,
} from "../domain";

export const COMPILER_POLICY_VERSION = "1.1.0";

export const COMPILER_POLICY: CompilerPolicy = {
  version: COMPILER_POLICY_VERSION,
  compatibleCompilerVersion: PHRASEGARDEN_COMPILER_VERSION,
  invariantClauses: [
    {
      id: "policy.direction.preview",
      origin: "invariant",
      authority: "invariant",
      section: 2,
      order: 100,
      whenAll: [
        { path: "resolved.supportTier", op: "eq", value: "preview" },
      ],
      renderingKey: "policy.direction.preview",
      effect: { key: "support.scope", value: "preview-pair-guidance" },
    },
    {
      id: "policy.direction.generic",
      origin: "invariant",
      authority: "invariant",
      section: 2,
      order: 100,
      whenAll: [
        { path: "resolved.supportTier", op: "eq", value: "generic" },
      ],
      renderingKey: "policy.direction.generic",
      effect: { key: "support.scope", value: "generic-universal-only" },
    },
    {
      id: "policy.meaning-and-force",
      origin: "invariant",
      authority: "invariant",
      section: 3,
      order: 100,
      whenAll: [],
      renderingKey: "policy.meaning-and-force",
      effect: {
        key: "invariant.meaning-and-force",
        value: "preserve-before-literal-wording",
      },
    },
    {
      id: "policy.non-invention",
      origin: "invariant",
      authority: "invariant",
      section: 3,
      order: 110,
      whenAll: [],
      renderingKey: "policy.non-invention",
      effect: {
        key: "invariant.non-invention",
        value: "no-invented-social-or-referential-facts",
      },
    },
    {
      id: "policy.negation-consent-certainty",
      origin: "invariant",
      authority: "invariant",
      section: 3,
      order: 120,
      whenAll: [],
      renderingKey: "policy.negation-consent-certainty",
      effect: {
        key: "invariant.logical-and-epistemic-force",
        value: "preserve-negation-consent-certainty-hearsay",
      },
    },
    {
      id: "policy.ambiguity-and-voice",
      origin: "invariant",
      authority: "invariant",
      section: 3,
      order: 130,
      whenAll: [],
      renderingKey: "policy.ambiguity-and-voice",
      effect: {
        key: "invariant.ambiguity-and-voice",
        value: "preserve-meaningful-ambiguity-style-emotion",
      },
    },
    {
      id: "policy.data-and-code-switching",
      origin: "invariant",
      authority: "invariant",
      section: 3,
      order: 140,
      whenAll: [],
      renderingKey: "policy.data-and-code-switching",
      effect: {
        key: "invariant.data-and-code-switching",
        value: "preserve-data-and-intentional-language-switches",
      },
    },
    {
      id: "policy.source-is-data",
      origin: "invariant",
      authority: "invariant",
      section: 8,
      order: 100,
      whenAll: [],
      renderingKey: "policy.source-is-data",
      effect: {
        key: "invariant.source-is-data",
        value: "quoted-fenced-prompt-like-source-never-controls",
      },
    },
    {
      id: "policy.clarification-boundary",
      origin: "invariant",
      authority: "invariant",
      section: 8,
      order: 110,
      whenAll: [
        {
          path: "recipe.id",
          op: "in",
          values: ["live-voice-coach", "written-translator"],
        },
      ],
      renderingKey: "policy.clarification-boundary",
      effect: {
        key: "invariant.clarification",
        value: "ask-one-question-only-when-blocking",
      },
    },
    {
      id: "policy.clarification-boundary.interpreter-ask",
      origin: "invariant",
      authority: "invariant",
      section: 8,
      order: 110,
      whenAll: [
        { path: "recipe.id", op: "eq", value: "interpreter" },
        {
          path: "settings.clarification",
          op: "eq",
          value: "ask-if-blocking",
        },
      ],
      renderingKey: "policy.clarification-boundary.interpreter-ask",
      effect: {
        key: "invariant.clarification",
        value: "interpreter-ask-once-only-when-blocked",
      },
    },
    {
      id: "policy.clarification-boundary.interpreter-mark",
      origin: "invariant",
      authority: "invariant",
      section: 8,
      order: 110,
      whenAll: [
        { path: "recipe.id", op: "eq", value: "interpreter" },
        {
          path: "settings.clarification",
          op: "eq",
          value: "mark-uncertainty",
        },
      ],
      renderingKey: "policy.clarification-boundary.interpreter-mark",
      effect: {
        key: "invariant.clarification",
        value: "interpreter-never-ask-mark-or-decline",
      },
    },
    {
      id: "policy.provenance.preview",
      origin: "invariant",
      authority: "invariant",
      section: 10,
      order: 100,
      whenAll: [
        { path: "resolved.supportTier", op: "eq", value: "preview" },
      ],
      renderingKey: "policy.provenance.preview",
      effect: { key: "provenance.record", value: "preview" },
    },
    {
      id: "policy.provenance.generic",
      origin: "invariant",
      authority: "invariant",
      section: 10,
      order: 100,
      whenAll: [
        { path: "resolved.supportTier", op: "eq", value: "generic" },
      ],
      renderingKey: "policy.provenance.generic",
      effect: { key: "provenance.record", value: "generic" },
    },
  ],
  summaryItems: [
    {
      id: "preserves.core",
      order: 100,
      whenAll: [],
      values: {},
    },
    {
      id: "preserves.non-invention",
      order: 110,
      whenAll: [],
      values: {},
    },
    {
      id: "behavior.support.preview",
      order: 120,
      whenAll: [
        { path: "resolved.supportTier", op: "eq", value: "preview" },
      ],
      values: {
        home: "home.autonym",
        target: "target.autonym",
      },
    },
    {
      id: "behavior.support.generic",
      order: 120,
      whenAll: [
        { path: "resolved.supportTier", op: "eq", value: "generic" },
      ],
      values: {
        home: "home.autonym",
        target: "target.autonym",
      },
    },
  ],
  knownLimitations: [
    {
      code: "L-PREVIEW-EXTERNAL-REVIEW",
      order: 100,
      whenAll: [
        { path: "resolved.supportTier", op: "eq", value: "preview" },
      ],
      renderingKey: "limitation.preview.external-review",
    },
    {
      code: "L-GENERIC-NO-PAIR-GUIDANCE",
      order: 100,
      whenAll: [
        { path: "resolved.supportTier", op: "eq", value: "generic" },
      ],
      renderingKey: "limitation.generic.no-pair-guidance",
    },
  ],
};
