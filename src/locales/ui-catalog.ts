import {
  validateSummaryCatalog,
  type CompilerWarningCode,
  type CompileResult,
  type SummaryCatalog,
} from "../domain";
import {
  LANGUAGE_NAMES_EN,
  LIMITATION_MESSAGES_EN,
  OPTION_LABELS_EN,
  UI_MESSAGES_EN,
  WARNING_MESSAGES_EN,
  type LanguageNameCatalog,
  type LimitationMessageCatalog,
  type OptionLabelCatalog,
  type UiMessageCatalog,
  type UiMessageId,
} from "./ui-en";
import {
  LANGUAGE_NAMES_JA,
  LIMITATION_MESSAGES_JA,
  OPTION_LABELS_JA,
  UI_MESSAGES_JA,
  WARNING_MESSAGES_JA,
} from "./ui-ja";
import { SUMMARY_EN_CATALOG } from "./summary-en";
import { SUMMARY_JA_CATALOG } from "./summary-ja";

export const INTERFACE_LOCALE_IDS = Object.freeze(["en", "ja"] as const);
export type InterfaceLocaleId = (typeof INTERFACE_LOCALE_IDS)[number];

export const UI_COPY_REVIEW_STATUSES = Object.freeze([
  "source-interface",
  "public-unreviewed-preview",
] as const);
export type UiCopyReviewStatus = (typeof UI_COPY_REVIEW_STATUSES)[number];

export interface UiLocaleCatalog {
  readonly locale: InterfaceLocaleId;
  readonly version: string;
  readonly direction: "ltr" | "rtl";
  readonly copyReviewStatus: UiCopyReviewStatus;
  readonly messages: UiMessageCatalog;
  readonly optionLabels: OptionLabelCatalog;
  readonly languageNames: LanguageNameCatalog;
  readonly limitationMessages: LimitationMessageCatalog;
  readonly warningMessages: Readonly<Record<CompilerWarningCode, string>>;
  readonly summaryCatalog: SummaryCatalog;
}

const PLACEHOLDER = /\{([a-z][a-zA-Z0-9]*)\}/g;

function exactKeys(value: Readonly<Record<string, unknown>>): readonly string[] {
  return Object.keys(value).sort();
}

function requireExactKeys(
  label: string,
  reference: Readonly<Record<string, unknown>>,
  candidate: Readonly<Record<string, unknown>>,
): void {
  const expected = exactKeys(reference);
  const actual = exactKeys(candidate);
  if (
    expected.length !== actual.length ||
    expected.some((key, index) => key !== actual[index])
  ) {
    throw new Error(
      `Invalid ${label} keys: expected ${expected.join(",")}; received ${actual.join(",")}`,
    );
  }
}

function placeholders(text: string): readonly string[] {
  return [...text.matchAll(PLACEHOLDER)].map((match) => match[1] ?? "").sort();
}

function requireTextMap(
  label: string,
  reference: Readonly<Record<string, string>>,
  candidate: Readonly<Record<string, string>>,
): void {
  requireExactKeys(label, reference, candidate);
  for (const key of exactKeys(reference)) {
    const text = candidate[key];
    if (typeof text !== "string" || text.trim().length === 0) {
      throw new Error(`Invalid ${label} text: ${key}`);
    }
    if (placeholders(reference[key] ?? "").join(",") !== placeholders(text).join(",")) {
      throw new Error(`Invalid ${label} placeholders: ${key}`);
    }
  }
}

function summarySignatures(catalog: SummaryCatalog): Readonly<Record<string, string>> {
  const signatures: Record<string, string> = {};
  for (const message of catalog.messages) {
    if (Object.hasOwn(signatures, message.id)) {
      throw new Error(`Duplicate summary message: ${message.id}`);
    }
    signatures[message.id] = message.parts
      .filter((part) => part.kind === "value")
      .map((part) => part.name)
      .sort()
      .join(",");
  }
  return signatures;
}

export function defineUiLocaleCatalog(
  candidate: UiLocaleCatalog,
): UiLocaleCatalog {
  requireExactKeys(
    "UI locale catalog",
    {
      locale: "",
      version: "",
      direction: "",
      copyReviewStatus: "",
      messages: "",
      optionLabels: "",
      languageNames: "",
      limitationMessages: "",
      warningMessages: "",
      summaryCatalog: "",
    },
    candidate as unknown as Readonly<Record<string, unknown>>,
  );
  if (!INTERFACE_LOCALE_IDS.includes(candidate.locale)) {
    throw new Error(`Unsupported interface locale: ${candidate.locale}`);
  }
  if (candidate.version.trim().length === 0) {
    throw new Error(`Missing interface catalog version: ${candidate.locale}`);
  }
  if (candidate.direction !== "ltr" && candidate.direction !== "rtl") {
    throw new Error(`Invalid interface direction: ${candidate.locale}`);
  }
  if (!UI_COPY_REVIEW_STATUSES.includes(candidate.copyReviewStatus)) {
    throw new Error(`Invalid interface copy review status: ${candidate.locale}`);
  }
  requireTextMap("UI message", UI_MESSAGES_EN, candidate.messages);
  requireTextMap("option label", OPTION_LABELS_EN, candidate.optionLabels);
  requireTextMap("language name", LANGUAGE_NAMES_EN, candidate.languageNames);
  requireTextMap(
    "limitation message",
    LIMITATION_MESSAGES_EN,
    candidate.limitationMessages,
  );
  requireTextMap("warning message", WARNING_MESSAGES_EN, candidate.warningMessages);

  const validatedSummary = validateSummaryCatalog(candidate.summaryCatalog);
  if (!validatedSummary.ok) {
    throw new Error(`Invalid summary catalog: ${candidate.locale}`);
  }
  if (validatedSummary.value.locale !== candidate.locale) {
    throw new Error(`Summary locale mismatch: ${candidate.locale}`);
  }
  requireExactKeys(
    "summary message",
    summarySignatures(SUMMARY_EN_CATALOG),
    summarySignatures(validatedSummary.value),
  );
  const expectedSummary = summarySignatures(SUMMARY_EN_CATALOG);
  const actualSummary = summarySignatures(validatedSummary.value);
  for (const id of Object.keys(expectedSummary)) {
    if (expectedSummary[id] !== actualSummary[id]) {
      throw new Error(`Summary placeholder mismatch: ${id}`);
    }
  }

  return Object.freeze({
    ...candidate,
    messages: Object.freeze(candidate.messages),
    optionLabels: Object.freeze(candidate.optionLabels),
    languageNames: Object.freeze(candidate.languageNames),
    limitationMessages: Object.freeze(candidate.limitationMessages),
    warningMessages: Object.freeze(candidate.warningMessages),
  });
}

export const UI_EN_CATALOG = defineUiLocaleCatalog({
  locale: "en",
  version: "1.1.0",
  direction: "ltr",
  copyReviewStatus: "source-interface",
  messages: UI_MESSAGES_EN,
  optionLabels: OPTION_LABELS_EN,
  languageNames: LANGUAGE_NAMES_EN,
  limitationMessages: LIMITATION_MESSAGES_EN,
  warningMessages: WARNING_MESSAGES_EN,
  summaryCatalog: SUMMARY_EN_CATALOG,
});

export const UI_JA_CATALOG = defineUiLocaleCatalog({
  locale: "ja",
  version: "1.0.0-preview.1",
  direction: "ltr",
  copyReviewStatus: "public-unreviewed-preview",
  messages: UI_MESSAGES_JA,
  optionLabels: OPTION_LABELS_JA,
  languageNames: LANGUAGE_NAMES_JA,
  limitationMessages: LIMITATION_MESSAGES_JA,
  warningMessages: WARNING_MESSAGES_JA,
  summaryCatalog: SUMMARY_JA_CATALOG,
});

const UI_LOCALE_CATALOGS: Readonly<Record<InterfaceLocaleId, UiLocaleCatalog>> =
  Object.freeze({ en: UI_EN_CATALOG, ja: UI_JA_CATALOG });

export function uiLocaleCatalog(locale: string): UiLocaleCatalog {
  if (locale !== "en" && locale !== "ja") {
    throw new Error(`Unsupported interface locale: ${locale}`);
  }
  return UI_LOCALE_CATALOGS[locale];
}

export function uiText(
  catalog: UiLocaleCatalog,
  id: UiMessageId,
  values: Readonly<Record<string, string>> = {},
): string {
  if (!Object.hasOwn(catalog.messages, id)) {
    throw new Error(`Missing UI message: ${id}`);
  }
  const template = catalog.messages[id];
  const expected = placeholders(template);
  const actual = Object.keys(values).sort();
  if (
    expected.length !== actual.length ||
    expected.some((name, index) => name !== actual[index])
  ) {
    throw new Error(
      `Invalid UI message values for ${id}: expected ${expected.join(",")}; received ${actual.join(",")}`,
    );
  }
  return template.replace(PLACEHOLDER, (_match, name: string) => values[name] ?? "");
}

export function uiOptionLabel(catalog: UiLocaleCatalog, value: string): string {
  if (!Object.hasOwn(catalog.optionLabels, value)) {
    throw new Error(`Missing option label: ${value}`);
  }
  return catalog.optionLabels[value as keyof OptionLabelCatalog];
}

export function uiLanguageName(catalog: UiLocaleCatalog, id: string): string {
  if (!Object.hasOwn(catalog.languageNames, id)) {
    throw new Error(`Missing public language name: ${id}`);
  }
  return catalog.languageNames[id as keyof LanguageNameCatalog];
}

export function localizeSummaryItems(
  catalog: UiLocaleCatalog,
  result: CompileResult,
): CompileResult["summaryItems"] {
  const localizedValues: Readonly<Record<string, string>> = Object.freeze({
    home: uiLanguageName(
      catalog,
      result.normalizedConfiguration.languages.home.id,
    ),
    target: uiLanguageName(
      catalog,
      result.normalizedConfiguration.languages.target.id,
    ),
  });
  return Object.freeze(
    result.summaryItems.map((item) =>
      Object.freeze({
        ...item,
        values: Object.freeze(
          Object.fromEntries(
            Object.entries(item.values).map(([name, value]) => [
              name,
              localizedValues[name] ?? value,
            ]),
          ),
        ),
      }),
    ),
  );
}

export function uiLimitationMessage(
  catalog: UiLocaleCatalog,
  code: string,
): string {
  if (!Object.hasOwn(catalog.limitationMessages, code)) {
    throw new Error(`Missing limitation message: ${code}`);
  }
  return catalog.limitationMessages[code as keyof LimitationMessageCatalog];
}
