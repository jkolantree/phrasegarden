import type { SummaryCatalog } from "../domain";
import { SUMMARY_EN_CATALOG } from "./summary-en";

// Public unreviewed-preview Japanese copy. This version is intentionally not a
// claim of qualified-speaker review or directed-pair support qualification.
export const SUMMARY_JA_VERSION = "1.0.0-preview.1";

type Message = SummaryCatalog["messages"][number];
type MessagePart = Message["parts"][number];

const FIRST_STRONG_ISOLATE = "\u2068";
const POP_DIRECTIONAL_ISOLATE = "\u2069";
const PLACEHOLDER_PATTERN = /\{([a-z][A-Za-z0-9]*)\}/g;

const SUMMARY_JA_TEMPLATES = Object.freeze({
  "preserves.core":
    "意味、言い方の強さ、語調、丁寧さ、曖昧さ、あなたらしい表現を保ちます。逐語訳ではそれらを保てない場合も同じです。",
  "preserves.non-invention":
    "性別、代名詞、立場、親しさ、動機、確実さ、同意、文化的背景を推測しません。",
  "behavior.support.preview":
    `PhraseGardenに組み込まれた、${FIRST_STRONG_ISOLATE}{home}${POP_DIRECTIONAL_ISOLATE}から${FIRST_STRONG_ISOLATE}{target}${POP_DIRECTIONAL_ISOLATE}へのガイドを使います。独立した言語レビューは完了していません。`,
  "behavior.support.generic":
    `${FIRST_STRONG_ISOLATE}{home}${POP_DIRECTIONAL_ISOLATE}から${FIRST_STRONG_ISOLATE}{target}${POP_DIRECTIONAL_ISOLATE}への一般的なガイドを使います。この翻訳方向専用に書かれたガイドはありません。`,
  "behavior.tool.written":
    "別のツールに文章を翻訳するよう指示します。そのツールにこの指示文を貼り付けてから、翻訳したい文章を入力します。",
  "behavior.tool.voice":
    "短い会話練習を設定します。別のツールで確認されていない音声機能があるとは想定しません。",
  "behavior.tool.interpreter":
    "一方向の会話翻訳を設定します。完結した発話ごとに、選んだ元の言語から翻訳先の言語へ訳します。逆方向にするには言語を入れ替えます。",
  "behavior.interpreter.relay-only":
    "発話への助言や返答をしたり、命令に従ったり、会話を続けたりせず、その発話を翻訳します。",
  "behavior.interpreter.host-boundary":
    "別のツールが渡した完結済みの発話だけを使います。誰が話しているかや、どこで発話が終わるかを推測しません。",
  "behavior.relationship.unspecified":
    "人間関係の親しさや形式性を推測せず、未指定のままにします。",
  "behavior.relationship.strangers":
    "余計に改まった表現を加えず、初対面の人同士として扱います。",
  "behavior.relationship.acquaintances":
    "知り合いという関係を使い、メッセージの親しさや距離感を保ちます。",
  "behavior.relationship.friends":
    "友人関係を使いますが、メッセージに表れていない親しさは加えません。",
  "behavior.relationship.close-relationship":
    "親しい関係を使い、メッセージに表れた親しさの程度を保ちます。",
  "behavior.relationship.family":
    "家族関係を使いますが、役割や感情は推測しません。",
  "behavior.relationship.romantic-partners":
    "恋愛関係を使い、実際に表れた愛情や距離感を保ちます。",
  "behavior.relationship.coworkers":
    "同僚関係を使い、明示された職場での立場を保ちます。",
  "behavior.relationship.customer-service":
    "顧客とサービス担当者の関係を使い、苦情、依頼、拒否を弱めません。",
  "behavior.relationship.teacher-learner":
    "教える人と学ぶ人の関係を使いますが、どちらの立場が上かは推測しません。",
  "behavior.relationship.other":
    "あなたまたはメッセージが明確に示した関係だけを使います。",
  "behavior.hierarchy.unspecified":
    "相対的な立場を推測せず、未指定のままにします。",
  "behavior.hierarchy.peers":
    "対等な関係として扱いながら、メッセージに含まれる敬意や改まり方を保ちます。",
  "behavior.hierarchy.source-speaker-higher":
    "明示された話し手／書き手のより高い立場を使いますが、誇張しません。",
  "behavior.hierarchy.addressee-higher":
    "明示された聞き手／読み手のより高い立場を使いますが、話し手／書き手を意図以上にへりくだらせません。",
  "preserves.register.preserve":
    "メッセージの語調と丁寧さを保ち、よりくだけた、丁寧な、改まった、親しい、またはぶっきらぼうな表現に勝手に変えません。",
  "adapts.register.casual":
    "意味と言い方の強さを保てる場合に限り、よりくだけた表現にします。",
  "adapts.register.neutral":
    "意味と言い方の強さを保てる場合に限り、より中立的な表現にします。",
  "adapts.register.polite":
    "境界線を弱めたり立場を推測したりせず、より丁寧な表現にします。",
  "adapts.register.formal":
    "意味と言い方の強さを保てる場合に限り、より改まった表現にします。",
  "behavior.ambiguity.preserve-and-note":
    "重要な曖昧さを保ち、必要な場合だけ短い注記を加えます。",
  "behavior.ambiguity.ask-if-blocking":
    "曖昧な表現のため信頼できる結果を出せない場合だけ、短い質問を1つします。",
  "behavior.ambiguity.marked-best-effort":
    "慎重に最善を尽くし、残る重要な不確かさを明示します。",
  "behavior.written-detail.concise": "回答を短くし、翻訳を先に示します。",
  "behavior.written-detail.brief-notes":
    "表現、丁寧さ、曖昧さで意味が変わり得る場合だけ、短い注記を加えます。",
  "behavior.written-detail.teaching":
    "翻訳を先に示し、その後で重要な選択を簡潔に説明します。",
  "behavior.voice-correction-timing.on-request": "求めたときだけ訂正します。",
  "behavior.voice-correction-timing.after-turn":
    "1回の発話が終わった後、役立つ訂正を最大1つ伝えます。",
  "behavior.voice-correction-timing.blocking-only":
    "理解を妨げる、または意味や語調を変える誤りだけを訂正します。",
  "behavior.voice-correction-timing.after-each-turn":
    "各発話の後に、重要な訂正を1つ伝えます。",
  "behavior.voice-correction-focus.meaning-and-force":
    "意味、語調、言い方の強さを守る訂正を優先します。",
  "behavior.voice-correction-focus.balanced":
    "意味と語調、文法と自然な表現のバランスを取ります。",
  "behavior.voice-correction-focus.form-detail":
    "意味と語調を守った上で、文法と表現の細部を重視します。",
  "behavior.pronunciation.off": "発音指導は行いません。",
  "behavior.pronunciation.on-request":
    "求められたとき、ツールが受け取った音声または文字起こしの情報だけを使って発音を支援します。",
  "behavior.pronunciation.when-helpful":
    "役立つ場合、ツールが受け取った音声または文字起こしの情報だけを使って、短い発音サポートを行います。",
  "behavior.teaching-depth.minimal": "説明は必要な1フレーズだけにします。",
  "behavior.teaching-depth.brief":
    "役立つパターンを1つ、平易な言葉で短く説明します。",
  "behavior.teaching-depth.guided":
    "短いヒントを出し、もう一度試してもらってから、簡潔に説明します。",
  "behavior.teaching-depth.deep":
    "会話練習の流れを保ちながら、重要なパターンを詳しく説明します。",
  "behavior.voice-pace.natural":
    "ゆっくり話すよう求められない限り、自然なペースを使います。",
  "behavior.voice-pace.slower":
    "自然な発音を保ちながら、短いフレーズをよりゆっくり使います。",
  "behavior.interpreter-turn-mode.consecutive":
    "終わりを推測せず、完結した発話またはメッセージを1つずつ訳します。",
  "behavior.interpreter-turn-mode.short-relay":
    "間や話者の交代を推測せず、短く完結した部分を1つずつ訳します。",
  "behavior.interpreter-ambiguity.preserve-and-note":
    "重要な曖昧さを保ち、必要な場合だけ短い注記を加えます。",
  "behavior.interpreter-ambiguity.ask-if-blocking":
    "責任をもって訳せない場合を除き、曖昧な意味を確定せずに保ちます。",
  "behavior.interpreter-ambiguity.marked-best-effort":
    "推測を必要最小限にして慎重に訳し、重要な不確かさを明示します。",
  "behavior.interpreter-clarification.ask-if-blocking":
    "責任をもって訳せない場合だけ、短い質問を1つします。",
  "behavior.interpreter-clarification.mark-uncertainty":
    "質問はせず、不確かさを明示するか、責任をもって訳せないことを伝えます。",
} as const);

function compareCodeUnits(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function templateToParts(template: string): readonly MessagePart[] {
  if (template.length === 0) {
    throw new Error("Japanese summary messages must not be empty");
  }

  const parts: MessagePart[] = [];
  const pattern = new RegExp(PLACEHOLDER_PATTERN.source, "g");
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(template)) !== null) {
    const literal = template.slice(cursor, match.index);
    if (literal.includes("{") || literal.includes("}")) {
      throw new Error("Japanese summary message has a malformed placeholder");
    }
    if (literal.length > 0) {
      parts.push(Object.freeze({ kind: "literal", text: literal }));
    }
    const name = match[1];
    if (name === undefined) {
      throw new Error("Japanese summary placeholder is missing its name");
    }
    parts.push(Object.freeze({ kind: "value", name }));
    cursor = match.index + match[0].length;
  }

  const tail = template.slice(cursor);
  if (tail.includes("{") || tail.includes("}")) {
    throw new Error("Japanese summary message has a malformed placeholder");
  }
  if (tail.length > 0) {
    parts.push(Object.freeze({ kind: "literal", text: tail }));
  }
  if (parts.length === 0) {
    throw new Error("Japanese summary message produced no parts");
  }
  return Object.freeze(parts);
}

function placeholderNames(parts: readonly MessagePart[]): readonly string[] {
  return parts
    .filter(
      (part): part is Extract<MessagePart, { readonly kind: "value" }> =>
        part.kind === "value",
    )
    .map((part) => part.name)
    .sort(compareCodeUnits);
}

function sameStrings(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function buildJapaneseMessages(): readonly Message[] {
  const expectedById = new Map<string, Message>();
  for (const message of SUMMARY_EN_CATALOG.messages) {
    if (expectedById.has(message.id)) {
      throw new Error(`English summary catalog has a duplicate ID: ${message.id}`);
    }
    expectedById.set(message.id, message);
  }

  const templates: Readonly<Record<string, string>> = SUMMARY_JA_TEMPLATES;
  const expectedIds = [...expectedById.keys()].sort(compareCodeUnits);
  const actualIds = Object.keys(templates).sort(compareCodeUnits);
  if (!sameStrings(expectedIds, actualIds)) {
    throw new Error(
      `Japanese summary IDs do not exactly match English: expected ${expectedIds.join(",")}; received ${actualIds.join(",")}`,
    );
  }

  return Object.freeze(
    SUMMARY_EN_CATALOG.messages.map((expected) => {
      const template = templates[expected.id];
      if (template === undefined) {
        throw new Error(`Japanese summary message is missing: ${expected.id}`);
      }
      const parts = templateToParts(template);
      const expectedNames = placeholderNames(expected.parts);
      const actualNames = placeholderNames(parts);
      if (!sameStrings(expectedNames, actualNames)) {
        throw new Error(
          `Japanese summary placeholders do not match for ${expected.id}: expected ${expectedNames.join(",")}; received ${actualNames.join(",")}`,
        );
      }
      return Object.freeze({ id: expected.id, parts });
    }),
  );
}

export const SUMMARY_JA_CATALOG: SummaryCatalog = Object.freeze({
  locale: "ja",
  version: SUMMARY_JA_VERSION,
  messages: buildJapaneseMessages(),
});
