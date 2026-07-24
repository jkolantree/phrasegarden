import type { SummaryCatalog } from "../domain";

export const SUMMARY_EN_VERSION = "1.0.0";

type Message = SummaryCatalog["messages"][number];

function message(id: string, text: string): Message {
  return { id, parts: [{ kind: "literal", text }] };
}

function choiceMessages(
  group: "adapts" | "behavior" | "preserves",
  prefix: string,
  choices: Readonly<Record<string, string>>,
): readonly Message[] {
  return Object.entries(choices).map(([value, text]) =>
    message(`${group}.${prefix}.${value}`, text),
  );
}

export const SUMMARY_EN_CATALOG: SummaryCatalog = {
  locale: "en",
  version: SUMMARY_EN_VERSION,
  messages: [
    message(
      "preserves.core",
      "Preserves intended meaning, social force, ambiguity, register, and your voice before literal wording.",
    ),
    message(
      "preserves.non-invention",
      "Does not invent gender, pronouns, hierarchy, intimacy, motives, certainty, consent, or cultural context.",
    ),
    {
      id: "behavior.support.preview",
      parts: [
        { kind: "literal", text: "Uses built-in, versioned " },
        { kind: "value", name: "home" },
        { kind: "literal", text: " → " },
        { kind: "value", name: "target" },
        {
          kind: "literal",
          text: " guidance; external linguistic review has not been completed.",
        },
      ],
    },
    {
      id: "behavior.support.generic",
      parts: [
        { kind: "literal", text: "Uses conservative Generic behavior for " },
        { kind: "value", name: "home" },
        { kind: "literal", text: " → " },
        { kind: "value", name: "target" },
        {
          kind: "literal",
          text: ", with no endpoint- or pair-specific linguistic guidance.",
        },
      ],
    },
    message(
      "behavior.tool.written",
      "Produces a portable Written Translator prompt; PhraseGarden never asks for the source text.",
    ),
    message(
      "behavior.tool.voice",
      "Produces a screenless Live Voice Coach prompt with short, speakable turns and honest host-capability limits.",
    ),
    ...choiceMessages("behavior", "relationship", {
      unspecified:
        "Leaves the relationship unspecified and does not infer familiarity or distance.",
      strangers: "Uses a stranger relationship without inventing extra formality.",
      acquaintances:
        "Accounts for an acquaintance relationship while preserving source warmth and distance.",
      friends:
        "Accounts for friendship without adding intimacy the source does not express.",
      "close-relationship":
        "Accounts for a close relationship while preserving the source's actual intimacy.",
      family:
        "Accounts for a family relationship without stereotyping roles or emotions.",
      "romantic-partners":
        "Accounts for romantic partners while preserving affection or distance exactly as expressed.",
      coworkers:
        "Accounts for coworkers and preserves any explicitly supplied workplace hierarchy.",
      "customer-service":
        "Accounts for customer service without weakening complaints, requests, or refusals.",
      "teacher-learner":
        "Accounts for a teacher–learner relationship without inventing rank.",
      other:
        "Uses only relationship context explicitly supplied by the user or source.",
    }),
    ...choiceMessages("behavior", "hierarchy", {
      unspecified: "Leaves hierarchy unspecified instead of guessing status.",
      peers: "Treats the participants as peers while preserving source-marked deference.",
      "source-speaker-higher":
        "Accounts for the source speaker's stated higher status without exaggerating it.",
      "addressee-higher":
        "Accounts for the addressee's stated higher status without inventing submissiveness.",
    }),
    ...choiceMessages("preserves", "register", {
      preserve:
        "Preserves the source register rather than making it more casual, polite, formal, intimate, or blunt.",
    }),
    ...choiceMessages("adapts", "register", {
      casual:
        "Adapts toward casual language only when meaning and interpersonal force stay intact.",
      neutral:
        "Adapts toward neutral language only when meaning and interpersonal force stay intact.",
      polite:
        "Adapts toward polite language without weakening boundaries or inventing hierarchy.",
      formal:
        "Adapts toward formal language only when meaning and interpersonal force stay intact.",
    }),
    ...choiceMessages("behavior", "ambiguity", {
      "preserve-and-note":
        "Preserves material ambiguity and adds a brief note only when it matters.",
      "ask-if-blocking":
        "Asks one concise clarification only when ambiguity blocks a responsible result.",
      "marked-best-effort":
        "Makes a conservative best effort and marks material unresolved ambiguity.",
    }),
    ...choiceMessages("behavior", "written-detail", {
      concise: "Keeps written output concise and translation-first.",
      "brief-notes":
        "Adds brief notes for consequential wording, register, or ambiguity choices.",
      teaching:
        "Gives the translation first, then compact teaching notes on important choices.",
    }),
    ...choiceMessages("behavior", "voice-correction-timing", {
      "on-request": "Corrects the learner only when asked.",
      "after-turn":
        "Gives at most one useful correction after the learner finishes a turn.",
      "blocking-only":
        "Corrects only errors that block or materially change meaning or social force.",
      "after-each-turn":
        "Gives one prioritized correction after each learner turn.",
    }),
    ...choiceMessages("behavior", "voice-correction-focus", {
      "meaning-and-force":
        "Prioritizes corrections that protect intended meaning and social force.",
      balanced:
        "Balances meaning, social force, grammar, and natural form in corrections.",
      "form-detail":
        "Prioritizes grammar and form detail after preserving meaning and social force.",
    }),
    ...choiceMessages("behavior", "pronunciation", {
      off: "Does not provide pronunciation coaching.",
      "on-request":
        "Provides pronunciation help on request, bounded by the evidence actually available.",
      "when-helpful":
        "Offers brief pronunciation help when useful, bounded by the evidence actually available.",
    }),
    ...choiceMessages("behavior", "teaching-depth", {
      minimal: "Keeps teaching explanations to a necessary phrase.",
      brief: "Explains one useful pattern briefly in plain language.",
      guided: "Uses a short cue, retry, and concise explanation.",
      deep:
        "Explains important patterns thoroughly while preserving conversational turns.",
    }),
    ...choiceMessages("behavior", "voice-pace", {
      natural: "Uses a natural pace unless the learner asks to slow down.",
      slower: "Uses shorter phrases and a slower pace without distorting pronunciation.",
    }),
  ],
};
