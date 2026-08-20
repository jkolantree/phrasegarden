import type { CompilerWarningCode } from "../domain";
import type {
  LanguageNameCatalog,
  LimitationMessageCatalog,
  OptionLabelCatalog,
  UiMessageCatalog,
} from "./ui-en";

// Development-only Japanese copy. Presence in the bundle is not evidence of
// qualified-speaker review and does not change any directed-pair support tier.
export const LIMITATION_MESSAGES_JA = Object.freeze({
  "L-PREVIEW-EXTERNAL-REVIEW":
    "この翻訳方向では、PhraseGardenに組み込まれたガイドを使います。独立した言語レビューは完了していません。",
  "L-GENERIC-NO-PAIR-GUIDANCE":
    "PhraseGardenには、この翻訳方向専用のガイドがありません。この指示文では一般的なガイドだけを使います。",
  "L-EN-JA-UNKNOWN-NAME-READING":
    "綴りだけでは、見慣れない日本語の名前をどう発音するか判断できません。",
  "L-JA-EN-UNKNOWN-NAME-READING":
    "日本語の文字だけでは、見慣れない名前をラテン文字でどう表記すべきか判断できません。",
  "L-VOICE-AUDIO-EVIDENCE-UNKNOWN":
    "言語ツールがあなたの音声を受け取れるかは不明です。音声がなければ、コーチは実際にどう発音したかを評価できません。",
  "L-VOICE-PRONUNCIATION-TRANSCRIPT":
    "文字起こしは発音学習の助けになりますが、実際にどう発音したかを示すことはできません。",
  "L-VOICE-OUTPUT-UNKNOWN":
    "言語ツールがコーチの返答を音声で読み上げられるかは不明です。",
  "L-VOICE-INTERRUPTION-UNKNOWN":
    "言語ツールが割り込みを検出できるかは不明です。",
  "L-VOICE-INTERRUPTION-UNAVAILABLE":
    "言語ツールは割り込みを検出できません。",
  "L-VOICE-SILENCE-UNKNOWN":
    "言語ツールが無音を検出できるかは不明です。",
  "L-VOICE-SILENCE-UNAVAILABLE": "言語ツールは無音を検出できません。",
  "L-VOICE-PLAYBACK-UNKNOWN":
    "言語ツールが発話速度を変えられるかは不明です。",
  "L-VOICE-PLAYBACK-UNAVAILABLE":
    "言語ツールは発話速度を変えられません。",
} as const satisfies LimitationMessageCatalog);

export const WARNING_MESSAGES_JA = Object.freeze({
  "W-GENERIC-LIMITED":
    "このGeneric指示文では一般的なガイドだけを使います。この翻訳方向専用に書かれたガイドはありません。",
  "W-PREVIEW-EXTERNAL-REVIEW":
    "このPreviewガイドは、独立した言語レビューを完了していません。",
  "W-USER-EVIDENCE-UNKNOWN":
    "言語ツールが音声、テキスト、文字起こしのどれを受け取るかは不明です。",
  "W-ASSISTANT-OUTPUT-UNKNOWN":
    "言語ツールがコーチの返答を音声で読み上げられるかは不明です。",
  "W-INTERRUPTION-UNKNOWN":
    "言語ツールが割り込みを検出できるかは不明です。",
  "W-INTERRUPTION-UNAVAILABLE": "言語ツールは割り込みを検出できません。",
  "W-SILENCE-UNKNOWN": "言語ツールが無音を検出できるかは不明です。",
  "W-SILENCE-UNAVAILABLE": "言語ツールは無音を検出できません。",
  "W-PLAYBACK-RATE-UNKNOWN":
    "言語ツールが発話速度を変えられるかは不明です。",
  "W-PLAYBACK-RATE-UNAVAILABLE":
    "言語ツールは発話速度を変えられません。",
  "W-PRONUNCIATION-TRANSCRIPT":
    "文字起こしだけでは、実際にどう発音したかは分かりません。",
  "W-PROMPT-BUDGET":
    "この指示文はPhraseGardenの最大サイズに近づいています。",
} as const satisfies Readonly<Record<CompilerWarningCode, string>>);

export const OPTION_LABELS_JA = Object.freeze({
  unspecified: "未指定",
  strangers: "初対面の人",
  acquaintances: "知り合い",
  friends: "友人",
  "close-relationship": "親しい関係",
  family: "家族",
  "romantic-partners": "恋愛関係のパートナー",
  coworkers: "同僚",
  "customer-service": "顧客とサービス担当者",
  "teacher-learner": "教える人と学ぶ人",
  other: "その他",
  peers: "ほぼ対等",
  "source-speaker-higher": "話し手／書き手の立場が上",
  "addressee-higher": "聞き手／読み手の立場が上",
  preserve: "元の語調を保つ",
  casual: "よりくだけた表現",
  neutral: "中立的",
  polite: "より丁寧",
  formal: "より改まった表現",
  concise: "翻訳＋ごく短い注記",
  "brief-notes": "翻訳＋短い注記",
  teaching: "翻訳＋学習用の解説",
  "on-request": "求めたときだけ",
  "after-turn": "1回の発話後、役立つ場合",
  "blocking-only": "理解を妨げる、または意味や語調が変わる場合だけ",
  "after-each-turn": "毎回の発話後",
  "meaning-and-force": "意味と語調",
  balanced: "バランス重視",
  "form-detail": "文法と表現",
  off: "発音サポートなし",
  "when-helpful": "役立つ場合",
  minimal: "ごく短く",
  brief: "短い説明",
  guided: "ヒント付きで再挑戦",
  deep: "詳しい解説",
  natural: "自然なペース",
  slower: "ゆっくり、短いフレーズ",
  "preserve-and-note": "曖昧さを保ち、注記を付ける",
  "ask-if-blocking": "必要な場合だけ短い質問を1つする",
  "marked-best-effort": "慎重に最善を尽くす",
  consecutive: "完結した発話／メッセージを1つずつ",
  "short-relay": "短く完結した部分を1つずつ",
  "mark-uncertainty": "慎重に続け、不確かな点を明示する",
  "preserve-marked-title":
    "敬称を保ち、安全な対応語がない場合はその旨を示す",
  "adapt-only-known-role": "その人の役割が明確な場合だけ調整する",
  "preserve-and-ask": "名前を保ち、必要な場合は読み方を尋ねる",
  unknown: "わからない",
  "text-or-transcript": "テキストまたは文字起こしのみ",
  "audible-audio": "ツールは音声を受け取れる",
  text: "テキストのみ",
  spoken: "音声",
  available: "はい",
  unavailable: "いいえ",
} as const satisfies OptionLabelCatalog);

export const LANGUAGE_NAMES_JA = Object.freeze({
  "zh-Hant-TW": "中国語（繁体字・台湾）",
  en: "英語",
  fr: "フランス語",
  de: "ドイツ語",
  he: "ヘブライ語",
  id: "インドネシア語",
  it: "イタリア語",
  ja: "日本語",
  tlh: "クリンゴン語",
  pt: "ポルトガル語（地域未指定）",
  es: "スペイン語",
  yi: "イディッシュ語",
} as const satisfies LanguageNameCatalog);

export const UI_MESSAGES_JA = Object.freeze({
  "document.homeTitle": "PhraseGarden · 言語ツールに伝わる指示文",
  "document.builderTitle": "指示文を調整 · PhraseGarden",
  "document.reviewTitle": "指示文を使う · PhraseGarden",
  "document.description":
    "PhraseGardenで、語学学習や翻訳に使える、読みやすく持ち運べる指示文を端末上で作成できます。",
  "global.skip": "メインコンテンツへ移動",
  "global.home": "PhraseGarden ホーム",
  "global.sessionAria": "このセッションだけで使用し、保存しません",
  "global.sessionPrefix": "このセッションのみ・",
  "global.notSaved": "保存しません",
  "global.to": "から",
  "entry.startTitle": "使いたい言語で始める",
  "entry.startHelp":
    "表示言語と翻訳の初期設定が変わります。あとでどちらも変更できます。作成される指示文は英語です。",
  "entry.pageTitle": "表示言語",
  "entry.pageHelp":
    "ページの表示だけを変更します。翻訳設定と指示文は変わりません。",
  "entry.current": "選択中",
  "entry.englishStartAria":
    "英語で始めます。英語から日本語への文章翻訳を選びます。",
  "entry.japaneseStartAria":
    "日本語で始めます。日本語から英語への文章翻訳を選びます。",
  "entry.englishPageAria":
    "PhraseGardenを英語で表示します。翻訳設定と指示文は変わりません。",
  "entry.japanesePageAria":
    "PhraseGardenを日本語で表示します。翻訳設定と指示文は変わりません。",
  "entry.englishStartAnnouncement":
    "PhraseGardenを英語表示に変更しました。初期設定は英語から日本語への「文章を翻訳」です。作成される指示文は英語です。",
  "entry.japaneseStartAnnouncement":
    "PhraseGardenを日本語表示に変更しました。初期設定は日本語から英語への「文章を翻訳」です。作成される指示文は英語です。",
  "entry.englishPageAnnouncement":
    "PhraseGardenを英語表示に変更しました。翻訳設定と指示文は変更していません。",
  "entry.japanesePageAnnouncement":
    "PhraseGardenを日本語表示に変更しました。翻訳設定と指示文は変更していません。",
  "home.heroTitle": "AIで翻訳しても、意図をそのままに。",
  "home.heroCopy":
    "言語とやりたいことを選ぶと、PhraseGardenが別のAIチャットや言語ツールで繰り返し使える指示文を作ります。指示文をそのツールに貼り付けてから、翻訳したい言葉を送ってください。",
  "home.heroPrivacy": "翻訳する本文がここに送られることはありません。",
  "home.ready": "準備完了",
  "home.readyPrefix": "準備完了：",
  "home.make": "指示文を作る",
  "home.adjust": "語調や状況を調整",
  "home.change": "言語や用途を変更",
  "home.return": "現在の指示文に戻る",
  "home.changeEyebrow": "選択を変更",
  "home.chooseTitle": "言語と用途を選ぶ",
  "home.useCurrent": "現在の選択を使う",
  "home.interpreterNote":
    "一度に扱うのは一方向だけです。逆方向にするには言語を入れ替え、別の指示文を作ってください。",
  "home.defaultsNote":
    "通常は初期設定のままで使えます。必要な場合だけ語調や状況を調整してください。",
  "home.promisesAria": "PhraseGardenの約束",
  "home.privateTitle": "翻訳する本文はここに送られません",
  "home.privateBody": "PhraseGardenは翻訳したい言葉の入力を求めません。",
  "home.sessionTitle": "このセッションのみ",
  "home.sessionBody":
    "ページを再読み込みするか、このタブを閉じると、設定、指示文、編集内容は消えます。",
  "home.portableTitle": "持ち出して使えます",
  "home.portableBody":
    "対応するAIや言語ツール向けに、プレーンテキストでコピーまたはダウンロードできます。",
  "pair.writtenHomeKicker": "翻訳元",
  "pair.writtenHomeLabel": "元の文章の言語",
  "pair.writtenHomeHelp": "別のツールに渡す文章の言語です。",
  "pair.writtenTargetKicker": "翻訳先",
  "pair.writtenTargetLabel": "翻訳先の言語",
  "pair.writtenTargetHelp": "別のツールに出力してほしい言語です。",
  "pair.voiceHomeKicker": "説明に使う言語",
  "pair.voiceHomeLabel": "説明に使う言語",
  "pair.voiceHomeHelp": "説明や学習サポートに使ってほしい言語です。",
  "pair.voiceTargetKicker": "練習する言語",
  "pair.voiceTargetLabel": "練習する言語",
  "pair.voiceTargetHelp": "会話を練習したい言語です。",
  "pair.interpreterHomeKicker": "翻訳元",
  "pair.interpreterHomeLabel": "発話の言語",
  "pair.interpreterHomeHelp": "別のツールに渡す各発話の言語です。",
  "pair.interpreterTargetKicker": "翻訳先",
  "pair.interpreterTargetLabel": "翻訳先の言語",
  "pair.interpreterTargetHelp": "別のツールが出力する1つの言語です。",
  "pair.swap": "言語を入れ替える",
  "tool.question": "何をしたいですか？",
  "tool.written": "文章を翻訳",
  "tool.recommended": "おすすめ",
  "tool.writtenHelp": "メッセージ、メール、文書などの文章向けです。",
  "tool.other": "PhraseGardenのほかの使い方",
  "tool.voice": "会話を練習",
  "tool.voiceHelp": "音声機能のあるAIツールで会話を練習するときに使います。",
  "tool.interpreter": "会話を翻訳",
  "tool.interpreterHelp": "完結した発話を一方向ずつ翻訳するときに使います。",
  "error.title": "指示文を作成できませんでした",
  "error.body": "設定は残っています。戻ってもう一度お試しください。",
  "error.details": "技術的なエラー詳細",
  "error.at": "：",
  "replace.title": "編集したコピーを置き換えますか？",
  "replace.body":
    "この設定から新しい指示文を作ると、このタブで編集したコピーが置き換えられます。残したい場合は、先にコピーまたはダウンロードしてください。",
  "replace.keep": "編集したコピーを残す",
  "replace.confirm": "置き換えて指示文を作る",
  "builder.eyebrow": "任意の設定",
  "builder.title": "語調や状況を調整",
  "builder.intro":
    "通常は初期設定のままで使えます。この状況で必要な項目だけ変更してください。元の文章がPhraseGardenに送られることはありません。",
  "builder.current": "現在の設定",
  "builder.contextLegend": "会話の状況（任意）",
  "builder.interpreterLegend": "各発話の訳し方（任意）",
  "builder.resultLegend": "仕上がりの表現（任意）",
  "builder.relationship": "関係",
  "builder.register": "語調と丁寧さ",
  "builder.detail": "回答の詳しさ",
  "builder.correctionTiming": "訂正するタイミング",
  "builder.correctionFocus": "訂正で優先すること",
  "builder.pronunciation": "発音サポート",
  "builder.audioHelp":
    "実際の発音を評価するには、ツールが音声を受け取る必要があります。",
  "builder.teachingDepth": "説明の詳しさ",
  "builder.pace": "話すペース",
  "builder.turnMode": "一度に訳す長さ",
  "builder.turnModeHelp":
    "別のツールが、完結した発話または部分を受け取る必要があります。この指示文だけでは、その終わりを検出できません。",
  "builder.clarification": "発話が不明瞭すぎる場合",
  "builder.clarificationHelp":
    "慎重に続ける場合でも、欠けた意味を推測することはありません。",
  "builder.advanced": "詳細設定",
  "builder.hierarchy": "相対的な立場",
  "builder.hierarchyHelp": "わからない場合は「未指定」のままにしてください。",
  "builder.ambiguity": "表現が曖昧な場合",
  "builder.titles": "肩書き・敬称",
  "builder.unknownName": "読み方が不明な名前",
  "builder.capabilities": "言語ツールで使える機能",
  "builder.capabilitiesIntro":
    "わからない場合は「わからない」のままにしてください。PhraseGardenは、ツールが音声を受け取れる、音声で返答できる、間を検出できる、または発話速度を変えられるとは想定しません。",
  "builder.userEvidence": "ツールが受け取るもの",
  "builder.assistantOutput": "ツールの返答方法",
  "builder.interruptions": "割り込みを検出できますか？",
  "builder.silence": "無音を検出できますか？",
  "builder.playback": "発話速度を変えられますか？",
  "builder.back": "現在の指示文に戻る",
  "builder.update": "指示文を更新",
  "builder.protection": "PhraseGardenが何を守るか詳しく見る",
  "review.eyebrow": "使用準備完了",
  "review.title": "指示文ができました",
  "review.intro":
    "この指示文を別のAIや言語ツールにコピーしてください。PhraseGardenが送信したり実行したりすることはありません。",
  "review.beforeCopy": "コピーする前に",
  "review.limitationsTitle": "既知の制限",
  "review.next": "次の手順",
  "review.handoffTitle": "コピーして別のツールに貼り付ける",
  "review.handoffLead":
    "作業を始める前に、新しいAIチャットや言語ツールへこの指示文を貼り付けます。",
  "review.actionsAria": "指示文の操作",
  "review.copy": "指示文をコピー",
  "review.download": "テキストファイルをダウンロード",
  "review.startAnother": "別の指示文を作る",
  "review.steps": "手順を見る",
  "review.stepCopy": "この指示文をコピーまたはダウンロードします。",
  "review.stepOpen":
    "対応するAIチャットや言語ツールで、新しい会話または指示入力欄を開きます。",
  "review.useWritten":
    "まず指示文を貼り付けます。次のメッセージとして、翻訳したい文章を送ります。",
  "review.useVoice":
    "練習を始める前に指示文を貼り付けます。音声機能を使えるかどうかは、別のツールによって異なります。",
  "review.useInterpreterConsecutive":
    "通訳を始める前に指示文を貼り付けます。その後、元の言語で完結した発話またはメッセージを1つずつツールに渡します。ツールは翻訳先の言語にだけ訳します。逆方向にするには言語を入れ替え、別の指示文を作ります。",
  "review.useInterpreterShort":
    "通訳を始める前に指示文を貼り付けます。その後、元の言語で短く完結した部分を1つずつツールに渡します。ツールは翻訳先の言語にだけ訳します。逆方向にするには言語を入れ替え、別の指示文を作ります。",
  "review.privacyPrefix":
    "貼り付ける前に、そのツールのプライバシーポリシーを確認してください。PhraseGardenは、そのツールが何を保存し、次の情報をどう扱うかを管理できません：",
  "review.privacyWritten": "そのツールに入力する文章。",
  "review.privacyVoice":
    "練習中に受け取る音声、文字起こし、またはテキスト。",
  "review.privacyInterpreter":
    "通訳中に受け取る参加者のテキスト、文字起こし、または音声。",
  "summary.eyebrow": "選択した内容",
  "summary.defaultTitle": "この指示文がツールに求めること",
  "summary.reviewTitle": "この指示文がツールに求めること",
  "summary.keep": "保つ",
  "summary.keepEmpty": "保つ項目はありません。",
  "summary.adapt": "求めた場合だけ変える",
  "summary.adaptEmpty": "任意の変更は選ばれていません。",
  "summary.behavior": "次の設定に従う",
  "summary.behaviorEmpty": "ほかの設定はありません。",
  "prompt.eyebrow": "指示文 · 英語",
  "prompt.editedTitle": "編集したコピー",
  "prompt.generatedTitle": "作成された指示文の全文",
  "prompt.modified": "この端末で編集済み・作成時の原文とは一致しません",
  "prompt.completeNote":
    "下の閲覧領域に全文を表示しています。コピーとダウンロードには、すべての行が含まれます。",
  "prompt.edit": "この指示文を編集",
  "prompt.restore": "作成時の指示文に戻す",
  "prompt.discardTitle": "編集内容を破棄しますか？",
  "prompt.discardBody":
    "編集内容を破棄し、このセッションで最初に作成された指示文に戻します。",
  "prompt.keep": "編集内容を残す",
  "prompt.discard": "編集を破棄して戻す",
  "provenance.title": "技術情報とバージョン",
  "provenance.intro":
    "この情報は、元の指示文がどのように作られたかを正確に示します。編集後の内容を検証するものではありません。",
  "provenance.compiler": "コンパイラ",
  "provenance.policy": "ポリシー",
  "provenance.recipe": "レシピ",
  "provenance.profiles": "言語プロファイル",
  "provenance.pairPack": "言語ペアパック",
  "provenance.support": "サポート",
  "provenance.promptSurface": "指示文サーフェス",
  "provenance.summaryCatalog": "要約カタログ",
  "provenance.registry": "言語レジストリ",
  "provenance.limitations": "既知の制限",
  "support.previewLabel": "ガイド：組み込み済み",
  "support.previewBadge": "Preview",
  "support.previewDetail": "外部の言語レビュー：未完了",
  "support.genericLabel": "ガイド：一般ルールのみ",
  "support.genericBadge": "Generic",
  "support.genericDetail":
    "この翻訳方向に固有のガイドや、独立した言語レビューはありません。",
  "announce.initial": "英語から日本語への「文章を翻訳」が選択されています。",
  "announce.sameLanguage":
    "翻訳元と翻訳先には別の言語を選んでください。直前の選択をそのまま使います。",
  "announce.directionUnknown":
    "翻訳方向を{home}から{target}に変更しました。サポート区分を確認できませんでした。",
  "announce.directionPreview":
    "翻訳方向を{home}から{target}に変更しました。サポート区分：Preview。この翻訳方向専用のガイドを含みます。独立した言語レビューは完了していません。",
  "announce.directionGeneric":
    "翻訳方向を{home}から{target}に変更しました。サポート区分：Generic。一般的なガイドだけを使います。",
  "announce.written": "「文章を翻訳」を選びました。",
  "announce.voice":
    "「会話を練習」を選びました。音声ツールの機能設定を「わからない」に戻しました。",
  "announce.interpreter":
    "「会話を翻訳」を選びました。一度に扱うのは一方向だけです。",
  "announce.relationship": "関係を更新しました。",
  "announce.register": "語調と丁寧さを更新しました。",
  "announce.detail": "回答の詳しさを更新しました。",
  "announce.correctionTiming": "訂正するタイミングを更新しました。",
  "announce.correctionFocus": "訂正の優先項目を更新しました。",
  "announce.pronunciation": "発音サポートの設定を更新しました。",
  "announce.teaching": "説明の詳しさを更新しました。",
  "announce.pace": "話すペースを更新しました。",
  "announce.turnMode": "一度に訳す長さを更新しました。",
  "announce.clarification": "不明瞭な発話への対応を更新しました。",
  "announce.hierarchy": "相対的な立場を更新しました。",
  "announce.ambiguity": "曖昧な表現への対応を更新しました。",
  "announce.titles": "肩書き・敬称の扱いを更新しました。",
  "announce.unknownName": "読み方が不明な名前の扱いを更新しました。",
  "announce.userEvidence": "ツールが受け取る情報を更新しました。",
  "announce.assistantOutput": "ツールの返答方法を更新しました。",
  "announce.interruptions": "割り込み検出の設定を更新しました。",
  "announce.silence": "無音検出の設定を更新しました。",
  "announce.playback": "発話速度の設定を更新しました。",
  "announce.replace":
    "新しい指示文を作ると編集済みのコピーが置き換えられます。確認が必要です。",
  "announce.compileError": "指示文を作成できませんでした。設定は残っています。",
  "announce.copyEdited": "編集した指示文をコピーしました。",
  "announce.copy": "指示文をコピーしました。",
  "announce.copyError":
    "コピーできませんでした。表示されている指示文を選択し、手動でコピーしてください。",
  "announce.downloadEdited":
    "編集した指示文のテキストファイルをダウンロードしています。",
  "announce.download": "指示文のテキストファイルをダウンロードしています。",
  "announce.downloadError":
    "ダウンロードを開始できませんでした。表示されている指示文を選択し、手動でコピーしてください。",
  "announce.restored": "作成時の指示文に戻しました。",
} as const satisfies UiMessageCatalog);
