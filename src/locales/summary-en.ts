import type { SummaryCatalog } from "../domain";

export const SUMMARY_EN_VERSION = "1.1.0";

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
      "Keeps what you mean, how strongly you say it, the tone, formality, ambiguity, and your personal style—even when a word-for-word translation would not.",
    ),
    message(
      "preserves.non-invention",
      "Does not guess gender, pronouns, status, closeness, motives, certainty, consent, or cultural context.",
    ),
    {
      id: "behavior.support.preview",
      parts: [
        { kind: "literal", text: "Uses guidance built into PhraseGarden from " },
        { kind: "value", name: "home" },
        { kind: "literal", text: " to " },
        { kind: "value", name: "target" },
        {
          kind: "literal",
          text: ". Independent language review is not complete.",
        },
      ],
    },
    {
      id: "behavior.support.generic",
      parts: [
        { kind: "literal", text: "Uses general guidance from " },
        { kind: "value", name: "home" },
        { kind: "literal", text: " to " },
        { kind: "value", name: "target" },
        {
          kind: "literal",
          text: ". It has no guidance written for this exact language direction.",
        },
      ],
    },
    message(
      "behavior.tool.written",
      "Creates a Written Translator prompt to copy or download. You enter the text to translate only after using that prompt in another tool.",
    ),
    message(
      "behavior.tool.voice",
      "Creates a Live Voice Coach prompt for short spoken turns. It does not assume audio features that your other tool has not confirmed.",
    ),
    ...choiceMessages("behavior", "relationship", {
      unspecified:
        "Leaves the relationship open instead of guessing how close or formal the people are.",
      strangers: "Treats the people as strangers without adding extra formality.",
      acquaintances:
        "Uses an acquaintance relationship while keeping the warmth or distance in the message.",
      friends:
        "Uses a friendship without adding closeness that the message does not show.",
      "close-relationship":
        "Uses a close relationship while keeping the level of closeness expressed in the message.",
      family:
        "Uses a family relationship without guessing roles or emotions.",
      "romantic-partners":
        "Uses a romantic relationship while keeping the affection or distance actually expressed.",
      coworkers:
        "Uses a coworker relationship and keeps any workplace status you clearly provide.",
      "customer-service":
        "Uses a customer-service relationship without weakening complaints, requests, or refusals.",
      "teacher-learner":
        "Uses a teacher–learner relationship without guessing who has higher status.",
      other:
        "Uses only the relationship details that you or the message clearly provide.",
    }),
    ...choiceMessages("behavior", "hierarchy", {
      unspecified: "Leaves relative status open instead of guessing.",
      peers:
        "Treats the people as equals while keeping any respect or formality in the message.",
      "source-speaker-higher":
        "Uses the speaker's or writer's stated higher status without exaggerating it.",
      "addressee-higher":
        "Uses the listener's or reader's stated higher status without making the other person sound more submissive than intended.",
    }),
    ...choiceMessages("preserves", "register", {
      preserve:
        "Keeps the message's tone and formality instead of making it more casual, polite, formal, close, or blunt.",
    }),
    ...choiceMessages("adapts", "register", {
      casual:
        "Uses more casual language only when the meaning and strength stay intact.",
      neutral:
        "Uses more neutral language only when the meaning and strength stay intact.",
      polite:
        "Uses more polite language without weakening boundaries or guessing status.",
      formal:
        "Uses more formal language only when the meaning and strength stay intact.",
    }),
    ...choiceMessages("behavior", "ambiguity", {
      "preserve-and-note":
        "Keeps important ambiguity and adds a short note only when needed.",
      "ask-if-blocking":
        "Asks one short question only when unclear wording prevents a reliable result.",
      "marked-best-effort":
        "Makes a careful best effort and clearly marks important uncertainty that remains.",
    }),
    ...choiceMessages("behavior", "written-detail", {
      concise: "Keeps the answer short and shows the translation first.",
      "brief-notes":
        "Adds short notes only when wording, formality, or ambiguity could change the meaning.",
      teaching:
        "Shows the translation first, then briefly explains important choices.",
    }),
    ...choiceMessages("behavior", "voice-correction-timing", {
      "on-request": "Gives corrections only when you ask.",
      "after-turn":
        "Gives at most one useful correction after you finish a turn.",
      "blocking-only":
        "Corrects only mistakes that block understanding or change the meaning or tone.",
      "after-each-turn":
        "Gives one important correction after each turn.",
    }),
    ...choiceMessages("behavior", "voice-correction-focus", {
      "meaning-and-force":
        "Focuses on corrections that protect your meaning, tone, and strength.",
      balanced:
        "Balances meaning and tone with grammar and natural wording.",
      "form-detail":
        "After protecting meaning and tone, focuses on grammar and wording details.",
    }),
    ...choiceMessages("behavior", "pronunciation", {
      off: "Does not provide pronunciation coaching.",
      "on-request":
        "Provides pronunciation help when asked, using only the audio or transcript information your tool provides.",
      "when-helpful":
        "Offers brief pronunciation help when useful, using only the audio or transcript information your tool provides.",
    }),
    ...choiceMessages("behavior", "teaching-depth", {
      minimal: "Keeps explanations to one necessary phrase.",
      brief: "Briefly explains one useful pattern in plain language.",
      guided:
        "Gives a short cue, lets you try again, then adds a brief explanation.",
      deep:
        "Explains important patterns in detail while keeping the practice conversational.",
    }),
    ...choiceMessages("behavior", "voice-pace", {
      natural: "Uses a natural pace unless you ask to slow down.",
      slower:
        "Uses shorter phrases and a slower pace while keeping pronunciation natural.",
    }),
  ],
};
