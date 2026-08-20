import type {
  CompilerWarningCode,
} from "../domain";

export const LIMITATION_MESSAGES_EN = Object.freeze({
  "L-PREVIEW-EXTERNAL-REVIEW":
    "This language direction uses guidance built into PhraseGarden. Independent language review is not complete.",
  "L-GENERIC-NO-PAIR-GUIDANCE":
    "PhraseGarden has no built-in guide for this language direction. These instructions use general guidance only.",
  "L-EN-JA-UNKNOWN-NAME-READING":
    "Spelling alone is not enough to know how an unfamiliar Japanese name is pronounced.",
  "L-JA-EN-UNKNOWN-NAME-READING":
    "Japanese characters alone are not enough to know how an unfamiliar name should be written in Latin letters.",
  "L-VOICE-AUDIO-EVIDENCE-UNKNOWN":
    "It is not known whether your language tool provides audio. Without audio, the coach cannot assess what you actually pronounced.",
  "L-VOICE-PRONUNCIATION-TRANSCRIPT":
    "A transcript can help teach pronunciation, but it cannot show what you actually pronounced.",
  "L-VOICE-OUTPUT-UNKNOWN":
    "It is not known whether your language tool can speak the coach's replies aloud.",
  "L-VOICE-INTERRUPTION-UNKNOWN":
    "It is not known whether your language tool can detect interruptions.",
  "L-VOICE-INTERRUPTION-UNAVAILABLE":
    "Your language tool cannot detect interruptions.",
  "L-VOICE-SILENCE-UNKNOWN":
    "It is not known whether your language tool can detect silence.",
  "L-VOICE-SILENCE-UNAVAILABLE":
    "Your language tool cannot detect silence.",
  "L-VOICE-PLAYBACK-UNKNOWN":
    "It is not known whether your language tool can change speaking speed.",
  "L-VOICE-PLAYBACK-UNAVAILABLE":
    "Your language tool cannot change speaking speed.",
} as const);

export const WARNING_MESSAGES_EN = Object.freeze({
  "W-GENERIC-LIMITED":
    "These Generic instructions use general guidance only. They have no guidance written for this exact language direction.",
  "W-PREVIEW-EXTERNAL-REVIEW":
    "This Preview guidance has not completed independent language review.",
  "W-USER-EVIDENCE-UNKNOWN":
    "It is not known whether your language tool receives audio, text, or a transcript.",
  "W-ASSISTANT-OUTPUT-UNKNOWN":
    "It is not known whether your language tool can speak the coach's replies aloud.",
  "W-INTERRUPTION-UNKNOWN":
    "It is not known whether your language tool can detect interruptions.",
  "W-INTERRUPTION-UNAVAILABLE":
    "Your language tool cannot detect interruptions.",
  "W-SILENCE-UNKNOWN":
    "It is not known whether your language tool can detect silence.",
  "W-SILENCE-UNAVAILABLE":
    "Your language tool cannot detect silence.",
  "W-PLAYBACK-RATE-UNKNOWN":
    "It is not known whether your language tool can change speaking speed.",
  "W-PLAYBACK-RATE-UNAVAILABLE":
    "Your language tool cannot change speaking speed.",
  "W-PRONUNCIATION-TRANSCRIPT":
    "A transcript cannot show what you actually pronounced.",
  "W-PROMPT-BUDGET":
    "These instructions are close to PhraseGarden's maximum size.",
} as const satisfies Readonly<Record<CompilerWarningCode, string>>);

export const OPTION_LABELS_EN = Object.freeze({
  unspecified: "Not specified",
  strangers: "Strangers",
  acquaintances: "Acquaintances",
  friends: "Friends",
  "close-relationship": "Close relationship",
  family: "Family",
  "romantic-partners": "Romantic partners",
  coworkers: "Coworkers",
  "customer-service": "Customer and service worker",
  "teacher-learner": "Teacher and learner",
  other: "Something else",
  peers: "About equal",
  "source-speaker-higher": "Speaker or writer has higher status",
  "addressee-higher": "Listener or reader has higher status",
  preserve: "Keep original tone",
  casual: "More casual",
  neutral: "Neutral",
  polite: "More polite",
  formal: "More formal",
  concise: "Translation + few notes",
  "brief-notes": "Translation + short notes",
  teaching: "Translation + teaching notes",
  "on-request": "Only when asked",
  "after-turn": "After a turn, when useful",
  "blocking-only":
    "Only when it blocks understanding or changes meaning or tone",
  "after-each-turn": "After every turn",
  "meaning-and-force": "Meaning and tone",
  balanced: "Balanced",
  "form-detail": "Grammar and wording",
  off: "No pronunciation help",
  "when-helpful": "When it would help",
  minimal: "Very short",
  brief: "Short explanation",
  guided: "Guided retry",
  deep: "Detailed teaching",
  natural: "Natural pace",
  slower: "Slower, shorter phrases",
  "preserve-and-note": "Keep it and add a note",
  "ask-if-blocking": "Ask one short question only if needed",
  "marked-best-effort": "Make a careful best effort",
  consecutive: "One complete turn or message",
  "short-relay": "One short, complete chunk",
  "mark-uncertainty": "Continue carefully and mark uncertainty",
  "preserve-marked-title":
    "Keep the title, marking it if there is no safe equivalent",
  "adapt-only-known-role": "Adapt only when the person's role is clear",
  "preserve-and-ask": "Keep the name and ask if its reading is needed",
  unknown: "I don't know",
  "text-or-transcript": "Text or transcript only",
  "audible-audio": "The tool can hear audio",
  text: "Text only",
  spoken: "Spoken audio",
  available: "Yes",
  unavailable: "No",
} as const);

export const LANGUAGE_NAMES_EN = Object.freeze({
  "zh-Hant-TW": "Chinese, Traditional (Taiwan)",
  en: "English",
  fr: "French",
  de: "German",
  he: "Hebrew",
  id: "Indonesian",
  it: "Italian",
  ja: "Japanese",
  tlh: "Klingon",
  pt: "Portuguese (region not specified)",
  es: "Spanish",
  yi: "Yiddish",
} as const);

export const UI_MESSAGES_EN = Object.freeze({
  "document.homeTitle": "PhraseGarden · Better instructions for language tools",
  "document.builderTitle": "Adjust your instructions · PhraseGarden",
  "document.reviewTitle": "Use your instructions · PhraseGarden",
  "document.description":
    "Build readable, portable language-learning and translation prompts locally with PhraseGarden.",
  "global.skip": "Skip to main content",
  "global.home": "PhraseGarden home",
  "global.sessionAria": "Session only; not saved",
  "global.sessionPrefix": "Session only · ",
  "global.notSaved": "not saved",
  "global.to": " to ",
  "entry.startTitle": "Start in your language",
  "entry.startHelp":
    "This changes the page language and your starting translation direction. You can change either later. Generated instructions remain in English.",
  "entry.pageTitle": "Page language",
  "entry.pageHelp":
    "This changes the page only. Your translation settings and instructions stay the same.",
  "entry.current": "Current",
  "entry.englishStartAria":
    "Start in English with English to Japanese written translation.",
  "entry.japaneseStartAria":
    "Start in Japanese with Japanese to English written translation.",
  "entry.englishPageAria":
    "Show PhraseGarden in English. Translation settings and instructions will not change.",
  "entry.japanesePageAria":
    "Show PhraseGarden in Japanese. Translation settings and instructions will not change.",
  "entry.englishStartAnnouncement":
    "PhraseGarden is now in English. Starting setup: English to Japanese, Translate writing. Generated instructions remain in English.",
  "entry.japaneseStartAnnouncement":
    "PhraseGarden is now in Japanese. Starting setup: Japanese to English, Translate writing. Generated instructions remain in English.",
  "entry.englishPageAnnouncement":
    "PhraseGarden is now in English. Translation settings and instructions were not changed.",
  "entry.japanesePageAnnouncement":
    "PhraseGarden is now in Japanese. Translation settings and instructions were not changed.",
  "home.heroTitle": "Keep your meaning when AI translates.",
  "home.heroCopy":
    "Choose languages and what you want to do. PhraseGarden makes reusable instructions for another AI chat or language tool. Copy the instructions there, then send the words you want translated.",
  "home.heroPrivacy": "Your text never comes here.",
  "home.ready": "Ready to start",
  "home.readyPrefix": "Ready to start: ",
  "home.make": "Make my instructions",
  "home.adjust": "Adjust tone or context",
  "home.change": "Change languages or task",
  "home.return": "Return to current instructions",
  "home.changeEyebrow": "Change choices",
  "home.chooseTitle": "Choose languages and task",
  "home.useCurrent": "Use current choices",
  "home.interpreterNote":
    "One direction at a time. Swap the languages and make another set of instructions for the reverse direction.",
  "home.defaultsNote":
    "The defaults work for most people. Adjust tone or context only when it matters.",
  "home.promisesAria": "PhraseGarden promises",
  "home.privateTitle": "Your text never comes here",
  "home.privateBody":
    "PhraseGarden never asks for the words you want translated.",
  "home.sessionTitle": "Session only",
  "home.sessionBody":
    "Settings, instructions, and edits disappear when you refresh or close this tab.",
  "home.portableTitle": "Take it with you",
  "home.portableBody":
    "Copy or download plain text for a compatible AI or language tool.",
  "pair.writtenHomeKicker": "Translate from",
  "pair.writtenHomeLabel": "Text is in",
  "pair.writtenHomeHelp":
    "The language of the text you will give the other tool.",
  "pair.writtenTargetKicker": "Translate into",
  "pair.writtenTargetLabel": "Translate to",
  "pair.writtenTargetHelp":
    "The language you want the other tool to produce.",
  "pair.voiceHomeKicker": "Explain in",
  "pair.voiceHomeLabel": "Explain in",
  "pair.voiceHomeHelp":
    "The language you want explanations and teaching in.",
  "pair.voiceTargetKicker": "Practice in",
  "pair.voiceTargetLabel": "Practice in",
  "pair.voiceTargetHelp": "The language you want to practice speaking.",
  "pair.interpreterHomeKicker": "Translate from",
  "pair.interpreterHomeLabel": "Turn is in",
  "pair.interpreterHomeHelp":
    "The language of each turn you give the other tool.",
  "pair.interpreterTargetKicker": "Translate into",
  "pair.interpreterTargetLabel": "Translate to",
  "pair.interpreterTargetHelp":
    "The one language the other tool should produce.",
  "pair.swap": "Swap languages",
  "tool.question": "What do you want help with?",
  "tool.written": "Translate writing",
  "tool.recommended": "Recommended",
  "tool.writtenHelp":
    "For messages, emails, documents, and other written text.",
  "tool.other": "Other ways to use PhraseGarden",
  "tool.voice": "Practice speaking",
  "tool.voiceHelp":
    "For conversation practice in an AI tool with voice features.",
  "tool.interpreter": "Translate a conversation",
  "tool.interpreterHelp":
    "For translating each complete turn in one direction.",
  "error.title": "PhraseGarden couldn't make these instructions",
  "error.body": "Your settings are still here. Please go back and try again.",
  "error.details": "Technical error details",
  "error.at": " at ",
  "replace.title": "Replace your edited copy?",
  "replace.body":
    "Making new instructions from these settings will replace the edited copy currently in this tab. Copy or download it first if you want to keep it.",
  "replace.keep": "Keep edited copy",
  "replace.confirm": "Replace and make instructions",
  "builder.eyebrow": "Optional settings",
  "builder.title": "Adjust tone and context",
  "builder.intro":
    "The defaults work for most people. Change only what matters for this situation; your source text stays outside PhraseGarden.",
  "builder.current": "Current setup",
  "builder.contextLegend": "Conversation context (optional)",
  "builder.interpreterLegend":
    "How each translated turn should work (optional)",
  "builder.resultLegend": "How the result should sound (optional)",
  "builder.relationship": "Relationship",
  "builder.register": "Tone and formality",
  "builder.detail": "How much detail",
  "builder.correctionTiming": "When to correct me",
  "builder.correctionFocus": "What to correct first",
  "builder.pronunciation": "Pronunciation help",
  "builder.audioHelp":
    "The tool must receive audio to assess what you actually pronounced.",
  "builder.teachingDepth": "Explanation detail",
  "builder.pace": "Speaking pace",
  "builder.turnMode": "How much to interpret at once",
  "builder.turnModeHelp":
    "The other tool must receive the complete turn or chunk. These instructions cannot detect where it ends.",
  "builder.clarification": "If a turn is too unclear",
  "builder.clarificationHelp":
    "Continuing carefully never means guessing missing meaning.",
  "builder.advanced": "Advanced settings",
  "builder.hierarchy": "Relative status",
  "builder.hierarchyHelp":
    "Leave this as Not specified if you are not sure.",
  "builder.ambiguity": "If wording is unclear",
  "builder.titles": "Titles and honorifics",
  "builder.unknownName": "Names with an unknown reading",
  "builder.capabilities": "What your language tool can do",
  "builder.capabilitiesIntro":
    "If you do not know, leave I don't know. PhraseGarden will not assume the tool can hear, speak, notice pauses, or change speaking speed.",
  "builder.userEvidence": "What the tool receives from you",
  "builder.assistantOutput": "How the tool responds",
  "builder.interruptions": "Can it detect interruptions?",
  "builder.silence": "Can it detect silence?",
  "builder.playback": "Can it change speaking speed?",
  "builder.back": "Back to current instructions",
  "builder.update": "Update instructions",
  "builder.protection": "See exactly what PhraseGarden will protect",
  "review.eyebrow": "Ready to use",
  "review.title": "Your instructions are ready",
  "review.intro":
    "Copy these instructions into another AI or language tool. PhraseGarden does not send or run them.",
  "review.beforeCopy": "Before you copy",
  "review.limitationsTitle": "Known limitations",
  "review.next": "Next step",
  "review.handoffTitle": "Copy, then paste elsewhere",
  "review.handoffLead":
    "Paste these instructions into a new AI chat or language tool before you begin.",
  "review.actionsAria": "Instruction actions",
  "review.copy": "Copy instructions",
  "review.download": "Download text file",
  "review.startAnother": "Start another set",
  "review.steps": "Step-by-step",
  "review.stepCopy": "Copy or download these instructions.",
  "review.stepOpen":
    "Open a new conversation or instruction field in a compatible AI chat or language tool.",
  "review.useWritten":
    "Paste the instructions first. Send the text you want translated as your next message.",
  "review.useVoice":
    "Paste the instructions before practice begins. Voice features still depend on the other tool.",
  "review.useInterpreterConsecutive":
    "Paste the instructions before interpreting starts. Then give the tool one complete home-language turn or message at a time. It translates only into the target language; swap the languages and make another set of instructions for the reverse direction.",
  "review.useInterpreterShort":
    "Paste the instructions before interpreting starts. Then give the tool one short, complete home-language chunk at a time. It translates only into the target language; swap the languages and make another set of instructions for the reverse direction.",
  "review.privacyPrefix":
    "Before you paste: the other tool's privacy policy applies. PhraseGarden cannot control what it stores or how it handles ",
  "review.privacyWritten": "the text you enter there.",
  "review.privacyVoice":
    "any audio, transcripts, or text it receives during practice.",
  "review.privacyInterpreter":
    "any participant's text, transcript, or audio while interpreting.",
  "summary.eyebrow": "Your choices",
  "summary.defaultTitle": "These instructions ask the tool to",
  "summary.reviewTitle": "What these instructions ask the tool to do",
  "summary.keep": "Keep",
  "summary.keepEmpty": "No items to keep are listed.",
  "summary.adapt": "Change only when you ask",
  "summary.adaptEmpty": "No optional changes selected.",
  "summary.behavior": "Follow these choices",
  "summary.behaviorEmpty": "No other choices are listed.",
  "prompt.eyebrow": "Instruction text · English",
  "prompt.editedTitle": "Your edited copy",
  "prompt.generatedTitle": "Complete generated instructions",
  "prompt.modified":
    "Edited on this device · this copy no longer matches the generated original",
  "prompt.completeNote":
    "Every line is present in the reading area below. Copy and download include the complete text.",
  "prompt.edit": "Edit these instructions",
  "prompt.restore": "Restore generated instructions",
  "prompt.discardTitle": "Discard your edits?",
  "prompt.discardBody":
    "This will discard your edits and restore the original generated instructions for this session.",
  "prompt.keep": "Keep my edits",
  "prompt.discard": "Discard edits and restore",
  "provenance.title": "Technical details and versions",
  "provenance.intro":
    "These details identify exactly how the original instructions were made. If you edit them, the details do not verify your changes.",
  "provenance.compiler": "Compiler",
  "provenance.policy": "Policy",
  "provenance.recipe": "Recipe",
  "provenance.profiles": "Profiles",
  "provenance.pairPack": "Pair pack",
  "provenance.support": "Support",
  "provenance.promptSurface": "Prompt surface",
  "provenance.summaryCatalog": "Summary catalog",
  "provenance.registry": "Language registry",
  "provenance.limitations": "Known limitations",
  "support.previewLabel": "Guidance: Built in",
  "support.previewBadge": "Preview",
  "support.previewDetail": "External language review: incomplete.",
  "support.genericLabel": "Guidance: General only",
  "support.genericBadge": "Generic",
  "support.genericDetail":
    "No pair-specific guidance or independent language review for this exact direction.",
  "announce.initial": "English to Japanese Translate writing selected.",
  "announce.sameLanguage":
    "Home and target languages must be different. The previous selection remains.",
  "announce.directionUnknown":
    "Direction changed to {home} to {target}. Support level could not be determined.",
  "announce.directionPreview":
    "Direction changed to {home} to {target}. Support level: Preview. Built-in direction guidance; independent language review is not complete.",
  "announce.directionGeneric":
    "Direction changed to {home} to {target}. Support level: Generic. General guidance only.",
  "announce.written": "Translate writing selected.",
  "announce.voice":
    "Practice speaking selected. Voice-tool abilities reset to I don't know.",
  "announce.interpreter":
    "Translate a conversation selected. It works in one direction at a time.",
  "announce.relationship": "Relationship updated.",
  "announce.register": "Tone and formality updated.",
  "announce.detail": "Answer detail updated.",
  "announce.correctionTiming": "When corrections happen was updated.",
  "announce.correctionFocus": "Correction priority updated.",
  "announce.pronunciation": "Pronunciation setting updated.",
  "announce.teaching": "Teaching depth updated.",
  "announce.pace": "Voice pace updated.",
  "announce.turnMode": "Interpreter turn handling updated.",
  "announce.clarification": "Interpreter clarification choice updated.",
  "announce.hierarchy": "Relative status updated.",
  "announce.ambiguity": "Unclear-wording choice updated.",
  "announce.titles": "Title and honorific choice updated.",
  "announce.unknownName": "Unknown-name choice updated.",
  "announce.userEvidence": "What the tool receives was updated.",
  "announce.assistantOutput": "How the tool responds was updated.",
  "announce.interruptions": "Interruption detection updated.",
  "announce.silence": "Silence detection updated.",
  "announce.playback": "Speaking-speed control updated.",
  "announce.replace":
    "Making new instructions would replace your edited copy. Confirmation is required.",
  "announce.compileError":
    "PhraseGarden couldn't make these instructions. Your settings are still here.",
  "announce.copyEdited": "Your edited instructions were copied.",
  "announce.copy": "Your instructions were copied.",
  "announce.copyError":
    "Copy was not available. Select the visible instruction text and copy it manually.",
  "announce.downloadEdited": "Your edited text-file download started.",
  "announce.download": "Your text-file download started.",
  "announce.downloadError":
    "Download could not start. Select the visible instruction text and copy it manually.",
  "announce.restored": "The original generated instructions were restored.",
} as const);

export type UiMessageId = keyof typeof UI_MESSAGES_EN;
export type UiMessageCatalog = Readonly<Record<UiMessageId, string>>;
export type OptionLabelId = keyof typeof OPTION_LABELS_EN;
export type OptionLabelCatalog = Readonly<Record<OptionLabelId, string>>;
export type PublicLanguageId = keyof typeof LANGUAGE_NAMES_EN;
export type LanguageNameCatalog = Readonly<Record<PublicLanguageId, string>>;
export type LimitationMessageId = keyof typeof LIMITATION_MESSAGES_EN;
export type LimitationMessageCatalog = Readonly<
  Record<LimitationMessageId, string>
>;
