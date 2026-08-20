import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "preact/hooks";

import {
  AMBIGUITY_STRATEGIES,
  ASSISTANT_OUTPUT_CAPABILITIES,
  HIERARCHIES,
  INTERPRETER_CLARIFICATIONS,
  INTERPRETER_TURN_MODES,
  PRONUNCIATION_MODES,
  REGISTER_LEVELS,
  RELATIONSHIPS,
  SIGNAL_CAPABILITIES,
  TEACHING_DEPTHS,
  TITLE_HANDLING_STRATEGIES,
  UNKNOWN_NAME_STRATEGIES,
  USER_EVIDENCE_CAPABILITIES,
  VOICE_CORRECTION_FOCI,
  VOICE_CORRECTION_TIMINGS,
  VOICE_PACES,
  WRITTEN_OUTPUT_DETAILS,
  compileFromCatalog,
  materializeSelection,
  renderSummary,
  type CompileResult,
  type InterpreterSettings,
  type RecipeConfiguration,
  type RenderedSummary,
  type ValidationIssue,
  type VoiceSettings,
  type WrittenSettings,
} from "../domain";
import {
  localizeSummaryItems,
  uiLimitationMessage,
  uiLocaleCatalog,
  uiOptionLabel,
  uiText,
  type InterfaceLocaleId,
  type UiLocaleCatalog,
} from "../locales";
import type { SearchableLanguageProfile } from "../packs";
import { BehaviorSummary } from "../ui/BehaviorSummary";
import { LanguageLabel } from "../ui/LanguageLabel";
import { SupportStatus } from "../ui/SupportStatus";
import {
  PUBLIC_LANGUAGE_PROFILE_CATALOG,
  publicLanguageName,
  publicLanguageOptionLabel,
} from "../ui/language-presentation";
import {
  activePromptText,
  createPromptDraft,
  promptDownloadBytes,
  promptDownloadName,
  type PromptDraft,
} from "./prompt-artifact";
import {
  decideLanguageEntry,
  type LanguageEntryPhase,
} from "./language-entry";
import {
  DEFAULT_WRITTEN_CONFIGURATION,
  PHRASEGARDEN_CATALOG,
} from "./runtime-catalog";

type View = "home" | "builder" | "review";
type ActiveRecipeId = RecipeConfiguration["recipe"]["id"];
type ActiveModality = RecipeConfiguration["settings"]["modality"];
type ActiveSettings = RecipeConfiguration["settings"];

interface ActionFeedback {
  readonly kind: "success" | "error";
  readonly message: string;
}

type Presentation =
  | {
      readonly ok: true;
      readonly result: CompileResult;
      readonly summary: RenderedSummary;
    }
  | {
      readonly ok: false;
      readonly issues: readonly ValidationIssue[];
    };

interface ReviewArtifact {
  readonly result: CompileResult;
  readonly draft: PromptDraft;
  readonly editing: boolean;
}

function renderPresentation(
  compiled: ReturnType<typeof compileFromCatalog>,
  ui: UiLocaleCatalog,
): Presentation {
  if (!compiled.ok) {
    return compiled;
  }
  const rendered = renderSummary(
    localizeSummaryItems(ui, compiled.value),
    ui.summaryCatalog,
  );
  return rendered.ok
    ? { ok: true, result: compiled.value, summary: rendered.value }
    : rendered;
}

function reviewWarnings(result: CompileResult): CompileResult["warnings"] {
  return result.warnings.filter(
    (warning) =>
      !(
        (warning.code === "W-PREVIEW-EXTERNAL-REVIEW" &&
          result.limitationCodes.includes("L-PREVIEW-EXTERNAL-REVIEW")) ||
        (warning.code === "W-GENERIC-LIMITED" &&
          result.limitationCodes.includes("L-GENERIC-NO-PAIR-GUIDANCE"))
      ),
  );
}

function reviewLimitations(
  result: CompileResult,
): CompileResult["limitationCodes"] {
  return result.limitationCodes.filter(
    (code) =>
      code !== "L-PREVIEW-EXTERNAL-REVIEW" &&
      code !== "L-GENERIC-NO-PAIR-GUIDANCE",
  );
}

function profileFor(id: string): SearchableLanguageProfile {
  const profile = PUBLIC_LANGUAGE_PROFILE_CATALOG.find(
    (item) => item.ref.id === id,
  );
  if (profile === undefined) {
    throw new Error(`Missing bundled language profile: ${id}`);
  }
  return profile;
}

function toolName(ui: UiLocaleCatalog, recipeId: ActiveRecipeId): string {
  switch (recipeId) {
    case "written-translator":
      return uiText(ui, "tool.written");
    case "live-voice-coach":
      return uiText(ui, "tool.voice");
    case "interpreter":
      return uiText(ui, "tool.interpreter");
  }
}

function pairRailCopy(ui: UiLocaleCatalog, modality: ActiveModality) {
  switch (modality) {
    case "written":
      return {
        homeKicker: uiText(ui, "pair.writtenHomeKicker"),
        homeLabel: uiText(ui, "pair.writtenHomeLabel"),
        homeHelp: uiText(ui, "pair.writtenHomeHelp"),
        targetKicker: uiText(ui, "pair.writtenTargetKicker"),
        targetLabel: uiText(ui, "pair.writtenTargetLabel"),
        targetHelp: uiText(ui, "pair.writtenTargetHelp"),
      } as const;
    case "live-voice":
      return {
        homeKicker: uiText(ui, "pair.voiceHomeKicker"),
        homeLabel: uiText(ui, "pair.voiceHomeLabel"),
        homeHelp: uiText(ui, "pair.voiceHomeHelp"),
        targetKicker: uiText(ui, "pair.voiceTargetKicker"),
        targetLabel: uiText(ui, "pair.voiceTargetLabel"),
        targetHelp: uiText(ui, "pair.voiceTargetHelp"),
      } as const;
    case "interpreting":
      return {
        homeKicker: uiText(ui, "pair.interpreterHomeKicker"),
        homeLabel: uiText(ui, "pair.interpreterHomeLabel"),
        homeHelp: uiText(ui, "pair.interpreterHomeHelp"),
        targetKicker: uiText(ui, "pair.interpreterTargetKicker"),
        targetLabel: uiText(ui, "pair.interpreterTargetLabel"),
        targetHelp: uiText(ui, "pair.interpreterTargetHelp"),
      } as const;
  }
}

function reviewUseInstruction(ui: UiLocaleCatalog, settings: ActiveSettings): string {
  switch (settings.modality) {
    case "written":
      return uiText(ui, "review.useWritten");
    case "live-voice":
      return uiText(ui, "review.useVoice");
    case "interpreting": {
      return uiText(
        ui,
        settings.turnMode === "short-relay"
          ? "review.useInterpreterShort"
          : "review.useInterpreterConsecutive",
      );
    }
  }
}

function destinationPrivacyObject(
  ui: UiLocaleCatalog,
  modality: ActiveModality,
): string {
  switch (modality) {
    case "written":
      return uiText(ui, "review.privacyWritten");
    case "live-voice":
      return uiText(ui, "review.privacyVoice");
    case "interpreting":
      return uiText(ui, "review.privacyInterpreter");
  }
}

function rematerialize(
  current: RecipeConfiguration,
  homeLanguageId: string,
  targetLanguageId: string,
  recipeId: ActiveRecipeId,
): RecipeConfiguration {
  const materialized = materializeSelection(
    { homeLanguageId, targetLanguageId, recipeId },
    PHRASEGARDEN_CATALOG,
  );
  if (!materialized.ok) {
    throw new Error(
      materialized.issues
        .map((item) => `${item.code}:${item.path}`)
        .join(", "),
    );
  }
  const base = materialized.value;
  const common = {
    socialContext: current.socialContext,
    register: current.register,
    ambiguity: current.ambiguity,
    codeSwitching: current.codeSwitching,
    dataHandling: current.dataHandling,
    titleHandling: current.titleHandling,
    unknownName: current.unknownName,
  } as const;
  if (
    base.settings.modality === current.settings.modality &&
    base.recipe.id === current.recipe.id
  ) {
    return {
      ...base,
      ...common,
      destination: current.destination,
      settings: current.settings,
    } as RecipeConfiguration;
  }
  return { ...base, ...common } as RecipeConfiguration;
}

function directionAnnouncement(
  ui: UiLocaleCatalog,
  configuration: RecipeConfiguration,
): string {
  const homeName = publicLanguageName(ui, configuration.languages.home.id);
  const targetName = publicLanguageName(ui, configuration.languages.target.id);
  const compiled = compileFromCatalog(configuration, PHRASEGARDEN_CATALOG);
  if (!compiled.ok) {
    return uiText(ui, "announce.directionUnknown", {
      home: homeName,
      target: targetName,
    });
  }
  const preview = compiled.value.provenance.supportTier === "preview";
  return uiText(
    ui,
    preview ? "announce.directionPreview" : "announce.directionGeneric",
    { home: homeName, target: targetName },
  );
}

interface LanguageSelectProps {
  readonly ui: UiLocaleCatalog;
  readonly id: string;
  readonly label: string;
  readonly help: string;
  readonly value: string;
  readonly excludedId: string;
  readonly onChange: (id: string) => void;
}

function LanguageSelect({
  ui,
  id,
  label,
  help,
  value,
  excludedId,
  onChange,
}: LanguageSelectProps) {
  const helpId = `${id}-help`;
  return (
    <label class="field language-select-field" for={id}>
      <span class="field-label">{label}</span>
      <select
        id={id}
        value={value}
        aria-describedby={helpId}
        onChange={(event) => onChange(event.currentTarget.value)}
      >
        {PUBLIC_LANGUAGE_PROFILE_CATALOG.map((profile) => (
          <option
            key={profile.ref.id}
            value={profile.ref.id}
            disabled={profile.ref.id === excludedId}
            dir="auto"
          >
            {publicLanguageOptionLabel(ui, profile)}
          </option>
        ))}
      </select>
      <small id={helpId} class="field-help">
        {help}
      </small>
    </label>
  );
}

interface ToolChooserProps {
  readonly ui: UiLocaleCatalog;
  readonly prefix: string;
  readonly value: ActiveRecipeId;
  readonly onChange: (recipeId: ActiveRecipeId) => void;
}

function ToolChooser({ ui, prefix, value, onChange }: ToolChooserProps) {
  return (
    <fieldset class="tool-chooser">
      <legend>{uiText(ui, "tool.question")}</legend>
      <div class="segmented-options">
        <label class="recommended-tool" for={`${prefix}-written`}>
          <input
            id={`${prefix}-written`}
            type="radio"
            name={`${prefix}-tool`}
            value="written-translator"
            checked={value === "written-translator"}
            onChange={() => onChange("written-translator")}
          />
          <span>
            <strong>
              {uiText(ui, "tool.written")} {" "}
              <small class="recommended-label">
                {uiText(ui, "tool.recommended")}
              </small>
            </strong>
              <small>{uiText(ui, "tool.writtenHelp")}</small>
          </span>
        </label>
        <p class="other-tools-label">{uiText(ui, "tool.other")}</p>
        <div class="other-tool-options">
          <label for={`${prefix}-voice`}>
            <input
              id={`${prefix}-voice`}
              type="radio"
              name={`${prefix}-tool`}
              value="live-voice-coach"
              checked={value === "live-voice-coach"}
              onChange={() => onChange("live-voice-coach")}
            />
            <span>
              <strong>{uiText(ui, "tool.voice")}</strong>
              <small>{uiText(ui, "tool.voiceHelp")}</small>
            </span>
          </label>
          <label for={`${prefix}-interpreter`}>
            <input
              id={`${prefix}-interpreter`}
              type="radio"
              name={`${prefix}-tool`}
              value="interpreter"
              checked={value === "interpreter"}
              onChange={() => onChange("interpreter")}
            />
            <span>
              <strong>{uiText(ui, "tool.interpreter")}</strong>
              <small>{uiText(ui, "tool.interpreterHelp")}</small>
            </span>
          </label>
        </div>
      </div>
    </fieldset>
  );
}

interface SelectFieldProps<Value extends string> {
  readonly ui: UiLocaleCatalog;
  readonly id: string;
  readonly label: string;
  readonly value: Value;
  readonly values: readonly Value[];
  readonly onChange: (value: Value) => void;
  readonly help?: string;
}

function SelectField<Value extends string>({
  ui,
  id,
  label,
  value,
  values,
  onChange,
  help,
}: SelectFieldProps<Value>) {
  const helpId = help === undefined ? undefined : `${id}-help`;
  return (
    <label class="field" for={id}>
      <span class="field-label">{label}</span>
      <select
        id={id}
        value={value}
        aria-describedby={helpId}
        onChange={(event) =>
          onChange(event.currentTarget.value as Value)
        }
      >
        {values.map((option) => (
          <option key={option} value={option}>
            {uiOptionLabel(ui, option)}
          </option>
        ))}
      </select>
      {help !== undefined && (
        <small id={helpId} class="field-help">
          {help}
        </small>
      )}
    </label>
  );
}

function updateWrittenSettings(
  configuration: RecipeConfiguration,
  update: (settings: WrittenSettings) => WrittenSettings,
): RecipeConfiguration {
  if (configuration.settings.modality !== "written") {
    return configuration;
  }
  return {
    ...configuration,
    settings: update(configuration.settings),
  } as RecipeConfiguration;
}

function updateVoiceSettings(
  configuration: RecipeConfiguration,
  update: (settings: VoiceSettings) => VoiceSettings,
): RecipeConfiguration {
  if (configuration.settings.modality !== "live-voice") {
    return configuration;
  }
  return {
    ...configuration,
    settings: update(configuration.settings),
  } as RecipeConfiguration;
}

function updateInterpreterSettings(
  configuration: RecipeConfiguration,
  update: (settings: InterpreterSettings) => InterpreterSettings,
): RecipeConfiguration {
  if (configuration.settings.modality !== "interpreting") {
    return configuration;
  }
  return {
    ...configuration,
    settings: update(configuration.settings),
  } as RecipeConfiguration;
}

function PairRails({
  ui,
  configuration,
  onHome,
  onTarget,
  onSwap,
  compact = false,
}: {
  readonly ui: UiLocaleCatalog;
  readonly configuration: RecipeConfiguration;
  readonly onHome: (value: string) => void;
  readonly onTarget: (value: string) => void;
  readonly onSwap: () => void;
  readonly compact?: boolean;
}) {
  const home = profileFor(configuration.languages.home.id);
  const target = profileFor(configuration.languages.target.id);
  const copy = pairRailCopy(ui, configuration.settings.modality);
  return (
    <div class={`pair-rails${compact ? " pair-rails-compact" : ""}`}>
      <section class="language-rail home-rail" aria-labelledby="home-rail-title">
        <p class="rail-kicker" id="home-rail-title">
          {copy.homeKicker}
        </p>
        <LanguageLabel ui={ui} profile={home} showCode={false} />
        <LanguageSelect
          ui={ui}
          id={compact ? "builder-home-language" : "home-language"}
          label={copy.homeLabel}
          help={copy.homeHelp}
          value={home.ref.id}
          excludedId={target.ref.id}
          onChange={onHome}
        />
      </section>
      <div class="pair-connector">
          <span aria-hidden="true">{uiText(ui, "global.to").trim()}</span>
          <button type="button" class="swap-button" onClick={onSwap}>
          {uiText(ui, "pair.swap")}
        </button>
      </div>
      <section
        class="language-rail target-rail"
        aria-labelledby="target-rail-title"
      >
        <p class="rail-kicker" id="target-rail-title">
          {copy.targetKicker}
        </p>
        <LanguageLabel ui={ui} profile={target} showCode={false} />
        <LanguageSelect
          ui={ui}
          id={compact ? "builder-target-language" : "target-language"}
          label={copy.targetLabel}
          help={copy.targetHelp}
          value={target.ref.id}
          excludedId={home.ref.id}
          onChange={onTarget}
        />
      </section>
    </div>
  );
}

function ReviewDirection({
  ui,
  configuration,
}: {
  readonly ui: UiLocaleCatalog;
  readonly configuration: RecipeConfiguration;
}) {
  const home = profileFor(configuration.languages.home.id);
  const target = profileFor(configuration.languages.target.id);
  const targetName = publicLanguageName(ui, target.ref.id);
  return (
    <p class="review-direction" data-testid="review-direction">
      <span lang={ui.locale} dir={ui.direction}>
        {publicLanguageName(ui, home.ref.id)}
      </span>
      <span aria-hidden="true">→</span>
      <span class="sr-only">{uiText(ui, "global.to")}</span>
      <span lang={ui.locale} dir={ui.direction}>
        {targetName}
        {targetName !== target.autonym && (
          <>
            {" ("}
            <bdi lang={target.ref.id} dir={target.direction}>
              {target.autonym}
            </bdi>
            {")"}
          </>
        )}
      </span>
      <span aria-hidden="true">·</span>
      <span class="sr-only">, </span>
      <span>{toolName(ui, configuration.recipe.id)}</span>
    </p>
  );
}

function CompilerErrors({
  ui,
  issues,
}: {
  readonly ui: UiLocaleCatalog;
  readonly issues: readonly ValidationIssue[];
}) {
  return (
    <section class="error-summary" role="alert" aria-labelledby="error-title">
      <h2 id="error-title">{uiText(ui, "error.title")}</h2>
      <p>{uiText(ui, "error.body")}</p>
      <details>
        <summary>{uiText(ui, "error.details")}</summary>
        <ul>
          {issues.map((item, index) => (
            <li key={`${item.code}-${item.path}-${index}`}>
              <code>{item.code}</code>{uiText(ui, "error.at")}<code>{item.path}</code>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}

function ReplacePromptConfirmation({
  ui,
  onKeep,
  onReplace,
}: {
  readonly ui: UiLocaleCatalog;
  readonly onKeep: () => void;
  readonly onReplace: () => void;
}) {
  return (
    <section
      class="replace-confirmation"
      role="alertdialog"
      aria-labelledby="replace-prompt-title"
      aria-describedby="replace-prompt-description"
      data-testid="replace-prompt-confirmation"
    >
      <h2 id="replace-prompt-title">{uiText(ui, "replace.title")}</h2>
      <p id="replace-prompt-description">{uiText(ui, "replace.body")}</p>
      <div>
        <button
          type="button"
          class="secondary-action"
          onClick={onKeep}
          autoFocus
        >
          {uiText(ui, "replace.keep")}
        </button>
        <button type="button" class="primary-action" onClick={onReplace}>
          {uiText(ui, "replace.confirm")}
        </button>
      </div>
    </section>
  );
}

function LanguageEntry({
  ui,
  locale,
  phase,
  onSelect,
}: {
  readonly ui: UiLocaleCatalog;
  readonly locale: InterfaceLocaleId;
  readonly phase: LanguageEntryPhase;
  readonly onSelect: (locale: InterfaceLocaleId) => void;
}) {
  const starting = phase === "starting";
  const titleId = "language-entry-title";
  const helpId = "language-entry-help";
  const entries = [
    {
      locale: "en" as const,
      label: starting ? (
        <>
          <bdi lang="en" dir="ltr">English</bdi>
          <span aria-hidden="true"> → </span>
          <bdi lang="ja" dir="ltr">日本語</bdi>
        </>
      ) : (
        <bdi lang="en" dir="ltr">English</bdi>
      ),
      aria: uiText(
        ui,
        starting ? "entry.englishStartAria" : "entry.englishPageAria",
      ),
    },
    {
      locale: "ja" as const,
      label: starting ? (
        <>
          <bdi lang="ja" dir="ltr">日本語</bdi>
          <span aria-hidden="true"> → </span>
          <bdi lang="en" dir="ltr">English</bdi>
        </>
      ) : (
        <bdi lang="ja" dir="ltr">日本語</bdi>
      ),
      aria: uiText(
        ui,
        starting ? "entry.japaneseStartAria" : "entry.japanesePageAria",
      ),
    },
  ];
  return (
    <section
      class="language-entry"
      aria-labelledby={titleId}
      aria-describedby={helpId}
      data-testid="language-entry"
    >
      <div class="language-entry-inner">
        <div class="language-entry-copy">
          <p id={titleId} class="language-entry-title">
            {uiText(ui, starting ? "entry.startTitle" : "entry.pageTitle")}
          </p>
          <p id={helpId} class="language-entry-help">
            {uiText(ui, starting ? "entry.startHelp" : "entry.pageHelp")}
          </p>
        </div>
        <div class="language-entry-actions">
          {entries.map((entry) => (
            <button
              key={entry.locale}
              type="button"
              class="language-entry-action"
              aria-label={entry.aria}
              aria-pressed={locale === entry.locale}
              onClick={() => onSelect(entry.locale)}
            >
              <span>{entry.label}</span>
              {locale === entry.locale && (
                <small>{uiText(ui, "entry.current")}</small>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function App() {
  const [interfaceLocale, setInterfaceLocale] =
    useState<InterfaceLocaleId>("en");
  const [languageEntryPhase, setLanguageEntryPhase] =
    useState<LanguageEntryPhase>("starting");
  const [view, setView] = useState<View>("home");
  const [homeChoicesOpen, setHomeChoicesOpen] = useState(false);
  const [configuration, setConfiguration] = useState<RecipeConfiguration>(
    DEFAULT_WRITTEN_CONFIGURATION,
  );
  const [artifact, setArtifact] = useState<ReviewArtifact | null>(null);
  const [announcement, setAnnouncement] = useState(
    uiText(uiLocaleCatalog("en"), "announce.initial"),
  );
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [confirmReplacePrompt, setConfirmReplacePrompt] = useState(false);
  const [actionFeedback, setActionFeedback] =
    useState<ActionFeedback | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const homeReadyHeadingRef = useRef<HTMLHeadingElement>(null);
  const homeChoicesHeadingRef = useRef<HTMLHeadingElement>(null);
  const homeChoicesFocusTargetRef = useRef<"ready" | "choices" | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const promptSurfaceRef = useRef<HTMLPreElement>(null);
  const keepEditsRef = useRef<HTMLButtonElement>(null);
  const restoreButtonRef = useRef<HTMLButtonElement>(null);
  const composingRef = useRef(false);
  const initialViewRef = useRef(true);
  const ui = useMemo(() => uiLocaleCatalog(interfaceLocale), [interfaceLocale]);

  const compiledConfiguration = useMemo(
    () => compileFromCatalog(configuration, PHRASEGARDEN_CATALOG),
    [configuration],
  );
  const presentation = useMemo(
    () => renderPresentation(compiledConfiguration, ui),
    [compiledConfiguration, ui],
  );
  const homeProfile = profileFor(configuration.languages.home.id);
  const targetProfile = profileFor(configuration.languages.target.id);

  const artifactSummary = useMemo(() => {
    if (artifact === null) {
      return null;
    }
    const rendered = renderSummary(
      localizeSummaryItems(ui, artifact.result),
      ui.summaryCatalog,
    );
    if (!rendered.ok) {
      throw new Error(
        `Invalid bundled summary presentation: ${rendered.issues
          .map((issue) => `${issue.code}:${issue.path}`)
          .join(",")}`,
      );
    }
    return rendered.value;
  }, [artifact?.result, ui]);

  useLayoutEffect(() => {
    const titles: Readonly<Record<View, string>> = {
      home: uiText(ui, "document.homeTitle"),
      builder: uiText(ui, "document.builderTitle"),
      review: uiText(ui, "document.reviewTitle"),
    };
    document.documentElement.lang = ui.locale;
    document.documentElement.dir = ui.direction;
    document.title = titles[view];
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", uiText(ui, "document.description"));
  }, [ui, view]);

  useEffect(() => {
    if (initialViewRef.current) {
      initialViewRef.current = false;
    } else {
      headingRef.current?.focus();
    }
  }, [view]);

  useEffect(() => {
    globalThis.history.replaceState(
      { phraseGardenView: "home" satisfies View },
      "",
      globalThis.location.href,
    );
    const handlePopState = (event: PopStateEvent): void => {
      const candidate = (event.state as { phraseGardenView?: unknown } | null)
        ?.phraseGardenView;
      setView(
        candidate === "home" ||
          candidate === "builder" ||
          candidate === "review"
          ? candidate
          : "home",
      );
    };
    globalThis.addEventListener("popstate", handlePopState);
    return () => globalThis.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (artifact?.draft.modified !== true) {
      return;
    }
    const protectEditedPrompt = (event: BeforeUnloadEvent): void => {
      event.preventDefault();
      event.returnValue = "";
    };
    globalThis.addEventListener("beforeunload", protectEditedPrompt);
    return () =>
      globalThis.removeEventListener("beforeunload", protectEditedPrompt);
  }, [artifact?.draft.modified]);

  useEffect(() => {
    if (artifact?.editing === true) {
      editorRef.current?.focus();
    }
  }, [artifact?.editing]);

  useEffect(() => {
    if (view !== "home" || homeChoicesFocusTargetRef.current === null) {
      return;
    }
    const target = homeChoicesFocusTargetRef.current;
    homeChoicesFocusTargetRef.current = null;
    (target === "choices"
      ? homeChoicesHeadingRef.current
      : homeReadyHeadingRef.current
    )?.focus();
  }, [homeChoicesOpen, view]);

  useEffect(() => {
    if (confirmRegenerate) {
      keepEditsRef.current?.focus();
    }
  }, [confirmRegenerate]);

  function navigateTo(nextView: View): void {
    setConfirmReplacePrompt(false);
    setActionFeedback(null);
    if (nextView === view) {
      return;
    }
    globalThis.history.pushState(
      { phraseGardenView: nextView },
      "",
      globalThis.location.href,
    );
    setView(nextView);
  }

  function openHomeChoices(): void {
    homeChoicesFocusTargetRef.current = "choices";
    setHomeChoicesOpen(true);
    navigateTo("home");
  }

  function closeHomeChoices(): void {
    homeChoicesFocusTargetRef.current = "ready";
    setHomeChoicesOpen(false);
  }

  function announceConfiguration(message: string): void {
    setAnnouncement(message);
  }

  function selectInterfaceLocale(locale: InterfaceLocaleId): void {
    if (locale === interfaceLocale) {
      return;
    }
    const nextUi = uiLocaleCatalog(locale);
    const decision = decideLanguageEntry(languageEntryPhase, locale);
    if (decision.kind === "apply-start-preset") {
      setConfiguration(decision.configuration);
      setHomeChoicesOpen(false);
    }
    setInterfaceLocale(locale);
    setActionFeedback(null);
    setAnnouncement(
      uiText(
        nextUi,
        decision.kind === "apply-start-preset"
          ? locale === "en"
            ? "entry.englishStartAnnouncement"
            : "entry.japaneseStartAnnouncement"
          : locale === "en"
            ? "entry.englishPageAnnouncement"
            : "entry.japanesePageAnnouncement",
      ),
    );
  }

  function selectLanguages(
    homeLanguageId: string,
    targetLanguageId: string,
  ): void {
    if (homeLanguageId === targetLanguageId) {
      setAnnouncement(
        uiText(ui, "announce.sameLanguage"),
      );
      return;
    }
    const next = rematerialize(
      configuration,
      homeLanguageId,
      targetLanguageId,
      configuration.recipe.id,
    );
    setConfiguration(next);
    setLanguageEntryPhase("preserve-work");
    setAnnouncement(directionAnnouncement(ui, next));
  }

  function chooseTool(recipeId: ActiveRecipeId): void {
    setLanguageEntryPhase("preserve-work");
    setConfiguration((current) =>
      rematerialize(
        current,
        current.languages.home.id,
        current.languages.target.id,
        recipeId,
      ),
    );
    const message: Readonly<Record<ActiveRecipeId, string>> = {
      "written-translator": uiText(ui, "announce.written"),
      "live-voice-coach": uiText(ui, "announce.voice"),
      interpreter: uiText(ui, "announce.interpreter"),
    };
    setAnnouncement(message[recipeId]);
  }

  function setCommon(
    update: (current: RecipeConfiguration) => RecipeConfiguration,
    message: string,
  ): void {
    setLanguageEntryPhase("preserve-work");
    setConfiguration((current) => update(current));
    announceConfiguration(message);
  }

  function generatePrompt(replaceEdited = false): void {
    if (artifact?.draft.modified === true && !replaceEdited) {
      setConfirmReplacePrompt(true);
      setAnnouncement(
        uiText(ui, "announce.replace"),
      );
      return;
    }
    if (!presentation.ok) {
      setAnnouncement(
        uiText(ui, "announce.compileError"),
      );
      return;
    }
    setArtifact({
      result: presentation.result,
      draft: createPromptDraft(presentation.result),
      editing: false,
    });
    setConfirmRegenerate(false);
    setConfirmReplacePrompt(false);
    setActionFeedback(null);
    setLanguageEntryPhase("preserve-work");
    navigateTo("review");
  }

  async function copyPrompt(): Promise<void> {
    if (artifact === null) {
      return;
    }
    const text = activePromptText(artifact.draft);
    try {
      if (navigator.clipboard === undefined) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(text);
      setActionFeedback({
        kind: "success",
        message: artifact.draft.modified
          ? uiText(ui, "announce.copyEdited")
          : uiText(ui, "announce.copy"),
      });
    } catch {
      setActionFeedback({
        kind: "error",
        message: uiText(ui, "announce.copyError"),
      });
    }
  }

  function downloadPrompt(): void {
    if (artifact === null) {
      return;
    }
    let url: string | null = null;
    try {
      url = URL.createObjectURL(
        new Blob([promptDownloadBytes(artifact.draft)], {
          type: "text/plain;charset=utf-8",
        }),
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = promptDownloadName(artifact.result);
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      globalThis.setTimeout(() => {
        if (url !== null) {
          URL.revokeObjectURL(url);
        }
      }, 0);
      setActionFeedback({
        kind: "success",
        message: artifact.draft.modified
          ? uiText(ui, "announce.downloadEdited")
          : uiText(ui, "announce.download"),
      });
    } catch {
      if (url !== null) {
        URL.revokeObjectURL(url);
      }
      setActionFeedback({
        kind: "error",
        message: uiText(ui, "announce.downloadError"),
      });
    }
  }

  function commitEditedText(value: string): void {
    setArtifact((current) => {
      if (current === null) {
        return current;
      }
      return {
        ...current,
        draft: {
          ...current.draft,
          editedText: value,
          modified:
            current.draft.modified ||
            value !== current.draft.canonicalText,
        },
      };
    });
    setActionFeedback(null);
  }

  function restoreCanonical(): void {
    setArtifact((current) => {
      if (current === null) {
        return current;
      }
      return {
        ...current,
        draft: createPromptDraft(current.result),
        editing: false,
      };
    });
    setConfirmRegenerate(false);
    setConfirmReplacePrompt(false);
    setActionFeedback(null);
    setAnnouncement(uiText(ui, "announce.restored"));
    globalThis.requestAnimationFrame(() => promptSurfaceRef.current?.focus());
  }

  function keepEditedCopy(): void {
    setConfirmRegenerate(false);
    globalThis.requestAnimationFrame(() => restoreButtonRef.current?.focus());
  }

  const visibleLimitations =
    artifact === null ? [] : reviewLimitations(artifact.result);
  const visibleWarnings =
    artifact === null ? [] : reviewWarnings(artifact.result);
  const hasReviewNotices =
    visibleLimitations.length > 0 || visibleWarnings.length > 0;

  return (
    <>
      <a
        class="skip-link"
        href="#page-title"
        onClick={(event) => {
          event.preventDefault();
          headingRef.current?.focus();
        }}
      >
        {uiText(ui, "global.skip")}
      </a>
      <header class="site-header">
        <div class="header-inner">
          <button
            class="wordmark"
            type="button"
            onClick={() => {
              setHomeChoicesOpen(false);
              navigateTo("home");
            }}
            aria-label={uiText(ui, "global.home")}
          >
            <span aria-hidden="true" class="wordmark-weave" />
            PhraseGarden
          </button>
          <p class="privacy-status" aria-label={uiText(ui, "global.sessionAria")}>
            <span class="privacy-dot" aria-hidden="true" />
            <span class="privacy-long">{uiText(ui, "global.sessionPrefix")}</span>
            {uiText(ui, "global.notSaved")}
          </p>
        </div>
      </header>
      <LanguageEntry
        ui={ui}
        locale={interfaceLocale}
        phase={languageEntryPhase}
        onSelect={selectInterfaceLocale}
      />
      <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {view === "home" && (
        <main id="main-content" class="page home-page">
          <section class="hero">
            <h1 id="page-title" ref={headingRef} tabIndex={-1}>
              {uiText(ui, "home.heroTitle")}
            </h1>
            <p class="hero-copy">
              {uiText(ui, "home.heroCopy")} {" "}
              <strong>{uiText(ui, "home.heroPrivacy")}</strong>
            </p>
          </section>

          {!homeChoicesOpen && (
            <section
              class="home-start-card"
              aria-labelledby="ready-choices-title"
            >
              <div class="home-start-summary">
                <p class="eyebrow" aria-hidden="true">
                  {uiText(ui, "home.ready")}
                </p>
                <h2
                  id="ready-choices-title"
                  ref={homeReadyHeadingRef}
                  tabIndex={-1}
                >
                  <span class="sr-only">{uiText(ui, "home.readyPrefix")}</span>
                  {publicLanguageName(ui, configuration.languages.home.id)}
                  <span aria-hidden="true"> → </span>
                  <span class="sr-only">{uiText(ui, "global.to")}</span>
                  {publicLanguageName(ui, configuration.languages.target.id)}
                </h2>
                <p class="ready-tool">{toolName(ui, configuration.recipe.id)}</p>
                {presentation.ok ? (
                  <SupportStatus
                    ui={ui}
                    compact
                    provenance={presentation.result.provenance}
                  />
                ) : null}
              </div>
              <div class="home-start-actions">
                <button
                  type="button"
                  class="primary-action primary-action-large"
                  onClick={() => generatePrompt()}
                  disabled={!presentation.ok}
                >
                  {uiText(ui, "home.make")}
                </button>
                <button
                  type="button"
                  class="secondary-action"
                  onClick={() => navigateTo("builder")}
                >
                  {uiText(ui, "home.adjust")}
                </button>
                <button
                  type="button"
                  class="text-action"
                  onClick={openHomeChoices}
                >
                  {uiText(ui, "home.change")}
                </button>
                {artifact !== null && (
                  <button
                    type="button"
                    class="text-action"
                    onClick={() => navigateTo("review")}
                  >
                    {uiText(ui, "home.return")}
                  </button>
                )}
              </div>
              {confirmReplacePrompt && (
                <ReplacePromptConfirmation
                  ui={ui}
                  onKeep={() => navigateTo("review")}
                  onReplace={() => generatePrompt(true)}
                />
              )}
            </section>
          )}

          {homeChoicesOpen && (
            <section class="home-weave" aria-labelledby="choose-direction">
              <div class="home-choices-heading">
                <div>
                  <p class="eyebrow">{uiText(ui, "home.changeEyebrow")}</p>
                  <h2
                    id="choose-direction"
                    class="section-title"
                    ref={homeChoicesHeadingRef}
                    tabIndex={-1}
                  >
                    {uiText(ui, "home.chooseTitle")}
                  </h2>
                </div>
                <button
                  type="button"
                  class="text-action"
                  onClick={closeHomeChoices}
                >
                  {uiText(ui, "home.useCurrent")}
                </button>
              </div>
              <PairRails
                ui={ui}
                configuration={configuration}
                onHome={(id) =>
                  selectLanguages(
                    id,
                    configuration.languages.target.id,
                  )
                }
                onTarget={(id) =>
                  selectLanguages(
                    configuration.languages.home.id,
                    id,
                  )
                }
                onSwap={() =>
                  selectLanguages(
                    configuration.languages.target.id,
                    configuration.languages.home.id,
                  )
                }
              />
              <div class="home-task-panel">
                {presentation.ok ? (
                  <SupportStatus
                    ui={ui}
                    compact
                    provenance={presentation.result.provenance}
                  />
                ) : null}
                <ToolChooser
                  ui={ui}
                  prefix="home"
                  value={configuration.recipe.id}
                  onChange={chooseTool}
                />
                <div class="home-actions">
                  <button
                    type="button"
                    class="primary-action primary-action-large"
                    onClick={() => generatePrompt()}
                    disabled={!presentation.ok}
                  >
                    {uiText(ui, "home.make")}
                  </button>
                  <button
                    type="button"
                    class="secondary-action"
                    onClick={() => navigateTo("builder")}
                  >
                    {uiText(ui, "home.adjust")}
                  </button>
                </div>
                <p class="quick-start-note">
                  {configuration.settings.modality === "interpreting"
                    ? uiText(ui, "home.interpreterNote")
                    : uiText(ui, "home.defaultsNote")}
                </p>
                {confirmReplacePrompt && (
                  <ReplacePromptConfirmation
                    ui={ui}
                    onKeep={() => navigateTo("review")}
                    onReplace={() => generatePrompt(true)}
                  />
                )}
              </div>
            </section>
          )}

          <section class="proof-strip" aria-label={uiText(ui, "home.promisesAria")}>
            <p>
              <strong>{uiText(ui, "home.privateTitle")}</strong>
              <span>{uiText(ui, "home.privateBody")}</span>
            </p>
            <p>
              <strong>{uiText(ui, "home.sessionTitle")}</strong>
              <span>{uiText(ui, "home.sessionBody")}</span>
            </p>
            <p>
              <strong>{uiText(ui, "home.portableTitle")}</strong>
              <span>{uiText(ui, "home.portableBody")}</span>
            </p>
          </section>
        </main>
      )}

      {view === "builder" && (
        <main id="main-content" class="page builder-page">
          <div class="page-heading">
            <p class="eyebrow">{uiText(ui, "builder.eyebrow")}</p>
            <h1 id="page-title" ref={headingRef} tabIndex={-1}>
              {uiText(ui, "builder.title")}
            </h1>
            <p>{uiText(ui, "builder.intro")}</p>
          </div>

          <section class="builder-setup" aria-labelledby="current-setup-title">
            <div>
              <p class="eyebrow">{uiText(ui, "builder.current")}</p>
              <h2 id="current-setup-title">
                {publicLanguageName(ui, configuration.languages.home.id)}
                <span aria-hidden="true"> → </span>
                <span class="sr-only">{uiText(ui, "global.to")}</span>
                {publicLanguageName(ui, configuration.languages.target.id)}
                <span class="setup-tool">
                  <span aria-hidden="true"> · </span>
                  {toolName(ui, configuration.recipe.id)}
                </span>
              </h2>
            </div>
            <button
              type="button"
              class="text-action"
              onClick={openHomeChoices}
            >
              {uiText(ui, "home.change")}
            </button>
          </section>

          {presentation.ok ? (
            <SupportStatus ui={ui} compact provenance={presentation.result.provenance} />
          ) : null}

          <form
            class="builder-form"
            onSubmit={(event) => {
              event.preventDefault();
              generatePrompt();
            }}
          >
            <div class="settings-weave">
              <fieldset class="settings-side settings-home">
                <legend>
                  <span>{uiText(ui, "builder.contextLegend")}</span>
                  <bdi lang={homeProfile.ref.id} dir={homeProfile.direction}>
                    {homeProfile.autonym}
                  </bdi>
                </legend>
                <SelectField
                  ui={ui}
                  id="relationship"
                  label={uiText(ui, "builder.relationship")}
                  value={configuration.socialContext.relationship}
                  values={RELATIONSHIPS}
                  onChange={(value) =>
                    setCommon(
                      (current) =>
                        ({
                          ...current,
                          socialContext: {
                            ...current.socialContext,
                            relationship: value,
                          },
                        }) as RecipeConfiguration,
                      uiText(ui, "announce.relationship"),
                    )
                  }
                />
              </fieldset>

              <div class="weave-gutter" aria-hidden="true">
                <span />
              </div>

              <fieldset class="settings-side settings-target">
                <legend>
                  <span>
                    {configuration.settings.modality === "interpreting"
                      ? uiText(ui, "builder.interpreterLegend")
                      : uiText(ui, "builder.resultLegend")}
                  </span>
                  <bdi
                    lang={targetProfile.ref.id}
                    dir={targetProfile.direction}
                  >
                    {targetProfile.autonym}
                  </bdi>
                </legend>
                <SelectField
                  ui={ui}
                  id="register"
                  label={uiText(ui, "builder.register")}
                  value={
                    configuration.register.strategy === "preserve"
                      ? "preserve"
                      : configuration.register.level
                  }
                  values={["preserve", ...REGISTER_LEVELS]}
                  onChange={(value) =>
                    setCommon(
                      (current) =>
                        ({
                          ...current,
                          register:
                            value === "preserve"
                              ? { strategy: "preserve" }
                              : { strategy: "adapt", level: value },
                        }) as RecipeConfiguration,
                      uiText(ui, "announce.register"),
                    )
                  }
                />

                {configuration.settings.modality === "written" ? (
                  <SelectField
                    ui={ui}
                    id="written-detail"
                    label={uiText(ui, "builder.detail")}
                    value={configuration.settings.outputDetail}
                    values={WRITTEN_OUTPUT_DETAILS}
                    onChange={(value) =>
                      setCommon(
                        (current) =>
                          updateWrittenSettings(current, (settings) => ({
                            ...settings,
                            outputDetail: value,
                          })),
                        uiText(ui, "announce.detail"),
                      )
                    }
                  />
                ) : configuration.settings.modality === "live-voice" ? (
                  <>
                    <SelectField
                      ui={ui}
                      id="correction-timing"
                      label={uiText(ui, "builder.correctionTiming")}
                      value={configuration.settings.correction.timing}
                      values={VOICE_CORRECTION_TIMINGS}
                      onChange={(value) =>
                        setCommon(
                          (current) =>
                            updateVoiceSettings(current, (settings) => ({
                              ...settings,
                              correction: {
                                ...settings.correction,
                                timing: value,
                              },
                            })),
                          uiText(ui, "announce.correctionTiming"),
                        )
                      }
                    />
                    <SelectField
                      ui={ui}
                      id="correction-focus"
                      label={uiText(ui, "builder.correctionFocus")}
                      value={configuration.settings.correction.focus}
                      values={VOICE_CORRECTION_FOCI}
                      onChange={(value) =>
                        setCommon(
                          (current) =>
                            updateVoiceSettings(current, (settings) => ({
                              ...settings,
                              correction: {
                                ...settings.correction,
                                focus: value,
                              },
                            })),
                          uiText(ui, "announce.correctionFocus"),
                        )
                      }
                    />
                    <SelectField
                      ui={ui}
                      id="pronunciation"
                      label={uiText(ui, "builder.pronunciation")}
                      value={configuration.settings.pronunciation}
                      values={PRONUNCIATION_MODES}
                      help={uiText(ui, "builder.audioHelp")}
                      onChange={(value) =>
                        setCommon(
                          (current) =>
                            updateVoiceSettings(current, (settings) => ({
                              ...settings,
                              pronunciation: value,
                            })),
                          uiText(ui, "announce.pronunciation"),
                        )
                      }
                    />
                    <SelectField
                      ui={ui}
                      id="teaching-depth"
                      label={uiText(ui, "builder.teachingDepth")}
                      value={configuration.settings.teachingDepth}
                      values={TEACHING_DEPTHS}
                      onChange={(value) =>
                        setCommon(
                          (current) =>
                            updateVoiceSettings(current, (settings) => ({
                              ...settings,
                              teachingDepth: value,
                            })),
                          uiText(ui, "announce.teaching"),
                        )
                      }
                    />
                    <SelectField
                      ui={ui}
                      id="voice-pace"
                      label={uiText(ui, "builder.pace")}
                      value={configuration.settings.pace}
                      values={VOICE_PACES}
                      onChange={(value) =>
                        setCommon(
                          (current) =>
                            updateVoiceSettings(current, (settings) => ({
                              ...settings,
                              pace: value,
                            })),
                          uiText(ui, "announce.pace"),
                        )
                      }
                    />
                  </>
                ) : configuration.settings.modality === "interpreting" ? (
                  <>
                    <SelectField
                      ui={ui}
                      id="interpreter-turn-mode"
                      label={uiText(ui, "builder.turnMode")}
                      value={configuration.settings.turnMode}
                      values={INTERPRETER_TURN_MODES}
                      help={uiText(ui, "builder.turnModeHelp")}
                      onChange={(value) =>
                        setCommon(
                          (current) =>
                            updateInterpreterSettings(current, (settings) => ({
                              ...settings,
                              turnMode: value,
                            })),
                          uiText(ui, "announce.turnMode"),
                        )
                      }
                    />
                    <SelectField
                      ui={ui}
                      id="interpreter-clarification"
                      label={uiText(ui, "builder.clarification")}
                      value={configuration.settings.clarification}
                      values={INTERPRETER_CLARIFICATIONS}
                      help={uiText(ui, "builder.clarificationHelp")}
                      onChange={(value) =>
                        setCommon(
                          (current) =>
                            updateInterpreterSettings(current, (settings) => ({
                              ...settings,
                              clarification: value,
                            })),
                          uiText(ui, "announce.clarification"),
                        )
                      }
                    />
                  </>
                ) : null}
              </fieldset>
            </div>

            <details class="safeguards advanced-settings">
              <summary>{uiText(ui, "builder.advanced")}</summary>
              <div class="details-grid">
                <SelectField
                  ui={ui}
                  id="hierarchy"
                  label={uiText(ui, "builder.hierarchy")}
                  value={configuration.socialContext.hierarchy}
                  values={HIERARCHIES}
                  help={uiText(ui, "builder.hierarchyHelp")}
                  onChange={(value) =>
                    setCommon(
                      (current) =>
                        ({
                          ...current,
                          socialContext: {
                            ...current.socialContext,
                            hierarchy: value,
                          },
                        }) as RecipeConfiguration,
                      uiText(ui, "announce.hierarchy"),
                    )
                  }
                />
                {configuration.settings.modality !== "interpreting" && (
                  <SelectField
                    ui={ui}
                    id="ambiguity"
                    label={uiText(ui, "builder.ambiguity")}
                    value={configuration.ambiguity}
                    values={AMBIGUITY_STRATEGIES}
                    onChange={(value) =>
                      setCommon(
                        (current) =>
                          ({
                            ...current,
                            ambiguity: value,
                          }) as RecipeConfiguration,
                        uiText(ui, "announce.ambiguity"),
                      )
                    }
                  />
                )}
                <SelectField
                  ui={ui}
                  id="title-handling"
                  label={uiText(ui, "builder.titles")}
                  value={configuration.titleHandling}
                  values={TITLE_HANDLING_STRATEGIES}
                  onChange={(value) =>
                    setCommon(
                      (current) =>
                        ({
                          ...current,
                          titleHandling: value,
                        }) as RecipeConfiguration,
                      uiText(ui, "announce.titles"),
                    )
                  }
                />
                {configuration.settings.modality !== "interpreting" && (
                  <SelectField
                    ui={ui}
                    id="unknown-name"
                    label={uiText(ui, "builder.unknownName")}
                    value={configuration.unknownName}
                    values={UNKNOWN_NAME_STRATEGIES}
                    onChange={(value) =>
                      setCommon(
                        (current) =>
                          ({
                            ...current,
                            unknownName: value,
                          }) as RecipeConfiguration,
                        uiText(ui, "announce.unknownName"),
                      )
                    }
                  />
                )}
              </div>

              {configuration.settings.modality === "live-voice" && (
                <section
                  class="capability-settings"
                  aria-labelledby="capability-settings-heading"
                >
                  <h2
                    id="capability-settings-heading"
                    class="details-heading"
                  >
                    {uiText(ui, "builder.capabilities")}
                  </h2>
                  <p class="details-intro">
                    {uiText(ui, "builder.capabilitiesIntro")}
                  </p>
                  <div class="details-grid">
                    <SelectField
                      ui={ui}
                      id="user-evidence"
                      label={uiText(ui, "builder.userEvidence")}
                      value={configuration.destination.userEvidence}
                      values={USER_EVIDENCE_CAPABILITIES}
                      help={uiText(ui, "builder.audioHelp")}
                      onChange={(value) =>
                        setCommon(
                          (current) =>
                            ({
                              ...current,
                              destination: {
                                ...current.destination,
                                userEvidence: value,
                              },
                            }) as RecipeConfiguration,
                          uiText(ui, "announce.userEvidence"),
                        )
                      }
                    />
                    <SelectField
                      ui={ui}
                      id="assistant-output"
                      label={uiText(ui, "builder.assistantOutput")}
                      value={configuration.destination.assistantOutput}
                      values={ASSISTANT_OUTPUT_CAPABILITIES}
                      onChange={(value) =>
                        setCommon(
                          (current) =>
                            ({
                              ...current,
                              destination: {
                                ...current.destination,
                                assistantOutput: value,
                              },
                            }) as RecipeConfiguration,
                          uiText(ui, "announce.assistantOutput"),
                        )
                      }
                    />
                    <SelectField
                      ui={ui}
                      id="interruption-signal"
                      label={uiText(ui, "builder.interruptions")}
                      value={configuration.destination.interruptionSignal}
                      values={SIGNAL_CAPABILITIES}
                      onChange={(value) =>
                        setCommon(
                          (current) =>
                            ({
                              ...current,
                              destination: {
                                ...current.destination,
                                interruptionSignal: value,
                              },
                            }) as RecipeConfiguration,
                          uiText(ui, "announce.interruptions"),
                        )
                      }
                    />
                    <SelectField
                      ui={ui}
                      id="silence-signal"
                      label={uiText(ui, "builder.silence")}
                      value={configuration.destination.silenceSignal}
                      values={SIGNAL_CAPABILITIES}
                      onChange={(value) =>
                        setCommon(
                          (current) =>
                            ({
                              ...current,
                              destination: {
                                ...current.destination,
                                silenceSignal: value,
                              },
                            }) as RecipeConfiguration,
                          uiText(ui, "announce.silence"),
                        )
                      }
                    />
                    <SelectField
                      ui={ui}
                      id="playback-rate"
                      label={uiText(ui, "builder.playback")}
                      value={configuration.destination.playbackRateControl}
                      values={SIGNAL_CAPABILITIES}
                      onChange={(value) =>
                        setCommon(
                          (current) =>
                            ({
                              ...current,
                              destination: {
                                ...current.destination,
                                playbackRateControl: value,
                              },
                            }) as RecipeConfiguration,
                          uiText(ui, "announce.playback"),
                        )
                      }
                    />
                  </div>
                </section>
              )}
            </details>

            {!presentation.ok && <CompilerErrors ui={ui} issues={presentation.issues} />}

            <div class="form-actions">
              <button
                type="button"
                class="text-action"
                onClick={() => {
                  if (artifact === null) {
                    openHomeChoices();
                  } else {
                    navigateTo("review");
                  }
                }}
              >
                {artifact === null
                  ? uiText(ui, "home.change")
                  : uiText(ui, "builder.back")}
              </button>
              <button
                type="submit"
                class="primary-action"
                disabled={!presentation.ok}
              >
                {artifact === null
                  ? uiText(ui, "home.make")
                  : uiText(ui, "builder.update")}
              </button>
            </div>
            {confirmReplacePrompt && (
              <ReplacePromptConfirmation
                ui={ui}
                onKeep={() => navigateTo("review")}
                onReplace={() => generatePrompt(true)}
              />
            )}
            {presentation.ok && (
              <details class="builder-protection">
                <summary>{uiText(ui, "builder.protection")}</summary>
                <BehaviorSummary ui={ui} summary={presentation.summary} />
              </details>
            )}
          </form>
        </main>
      )}

      {view === "review" && artifact !== null && (
        <main id="main-content" class="page review-page">
          <div class="page-heading review-heading">
            <p class="eyebrow">{uiText(ui, "review.eyebrow")}</p>
            <h1 id="page-title" ref={headingRef} tabIndex={-1}>
              {uiText(ui, "review.title")}
            </h1>
            <p>{uiText(ui, "review.intro")}</p>
          </div>

          <ReviewDirection
            ui={ui}
            configuration={artifact.result.normalizedConfiguration}
          />

          <div class="review-handoff-grid">
            <div class="review-notices">
              <SupportStatus ui={ui} compact provenance={artifact.result.provenance} />

              {hasReviewNotices && (
                <section
                  class="limitations limitations-compact"
                  aria-labelledby="limitations-title"
                  data-testid="limitations"
                >
                  <p class="eyebrow">{uiText(ui, "review.beforeCopy")}</p>
                  <h2 id="limitations-title" class="sr-only">
                    {uiText(ui, "review.limitationsTitle")}
                  </h2>
                  <ul>
                    {visibleLimitations.map((code) => (
                      <li key={code}>
                        <strong>{uiLimitationMessage(ui, code)}</strong>
                      </li>
                    ))}
                    {visibleWarnings.map((warning) => (
                      <li key={warning.code}>
                        <span>{ui.warningMessages[warning.code]}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            <section
              class="handoff"
              aria-labelledby="handoff-title"
              data-testid="prompt-handoff"
            >
              <p class="eyebrow">{uiText(ui, "review.next")}</p>
              <h2 id="handoff-title">{uiText(ui, "review.handoffTitle")}</h2>
              <p class="handoff-lead">
                {uiText(ui, "review.handoffLead")}
              </p>
              <div class="prompt-actions" aria-label={uiText(ui, "review.actionsAria")}>
                <button
                  type="button"
                  class="primary-action"
                  onClick={() => void copyPrompt()}
                  data-testid="copy-prompt"
                >
                  {uiText(ui, "review.copy")}
                </button>
                <button
                  type="button"
                  class="secondary-action"
                  onClick={downloadPrompt}
                  data-testid="download-prompt"
                >
                  {uiText(ui, "review.download")}
                </button>
              </div>
              <div class="handoff-secondary-actions">
                <button
                  type="button"
                  class="text-action"
                  onClick={() => navigateTo("builder")}
                >
                  {uiText(ui, "home.adjust")}
                </button>
                <button
                  type="button"
                  class="text-action"
                  onClick={() => {
                    setHomeChoicesOpen(false);
                    navigateTo("home");
                  }}
                >
                  {uiText(ui, "review.startAnother")}
                </button>
              </div>
              <details class="handoff-steps">
                <summary>{uiText(ui, "review.steps")}</summary>
                <ol>
                  <li>{uiText(ui, "review.stepCopy")}</li>
                  <li>{uiText(ui, "review.stepOpen")}</li>
                  <li>
                    {reviewUseInstruction(
                      ui,
                      artifact.result.normalizedConfiguration.settings,
                    )}
                  </li>
                </ol>
              </details>
              {actionFeedback !== null && (
                <p
                  class={`handoff-feedback handoff-feedback-${actionFeedback.kind}`}
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  data-testid="handoff-feedback"
                >
                  {actionFeedback.message}
                </p>
              )}
              <p
                class="destination-privacy"
                data-testid="destination-privacy"
              >
                {uiText(ui, "review.privacyPrefix")}
                {destinationPrivacyObject(
                  ui,
                  artifact.result.normalizedConfiguration.settings.modality,
                )}
              </p>
            </section>
          </div>

          {artifactSummary !== null && (
            <BehaviorSummary
              ui={ui}
              summary={artifactSummary}
              title={uiText(ui, "summary.reviewTitle")}
              review
            />
          )}

          <section class="prompt-review" aria-labelledby="prompt-title">
            <div class="prompt-toolbar">
              <div>
                <p class="eyebrow">{uiText(ui, "prompt.eyebrow")}</p>
                <h2 id="prompt-title">
                  {artifact.draft.modified
                    ? uiText(ui, "prompt.editedTitle")
                    : uiText(ui, "prompt.generatedTitle")}
                </h2>
                {artifact.draft.modified && (
                  <p class="modified-status" role="status">
                    {uiText(ui, "prompt.modified")}
                  </p>
                )}
              </div>
            </div>

            <p id="complete-text-note" class="prompt-visibility-note">
              {uiText(ui, "prompt.completeNote")}
            </p>

            {artifact.editing ? (
              <label class="edited-prompt-label" for="edited-prompt">
                <span>{uiText(ui, "prompt.editedTitle")}</span>
                <textarea
                  ref={editorRef}
                  id="edited-prompt"
                  lang="en"
                  dir="ltr"
                  spellcheck={false}
                  aria-describedby="complete-text-note"
                  value={artifact.draft.editedText}
                  onCompositionStart={() => {
                    composingRef.current = true;
                  }}
                  onCompositionEnd={(event) => {
                    composingRef.current = false;
                    commitEditedText(event.currentTarget.value);
                  }}
                  onInput={(event) => {
                    if (
                      !composingRef.current &&
                      !(event as InputEvent).isComposing
                    ) {
                      commitEditedText(event.currentTarget.value);
                    }
                  }}
                />
              </label>
            ) : (
              <pre
                ref={promptSurfaceRef}
                class="prompt-surface"
                role="document"
                lang="en"
                dir="ltr"
                tabIndex={0}
                aria-labelledby="prompt-title"
                aria-describedby="complete-text-note"
                data-testid="canonical-prompt"
              >
                {artifact.draft.canonicalText}
              </pre>
            )}

            <div class="edit-actions">
              {!artifact.editing && (
                <button
                  type="button"
                  class="text-action"
                  onClick={() =>
                    setArtifact((current) =>
                      current === null
                        ? current
                        : { ...current, editing: true },
                    )
                  }
                >
                  {uiText(ui, "prompt.edit")}
                </button>
              )}
              <button
                ref={restoreButtonRef}
                type="button"
                class="text-action"
                onClick={() => {
                  if (artifact.draft.modified) {
                    setConfirmRegenerate(true);
                  } else {
                    restoreCanonical();
                  }
                }}
              >
                {uiText(ui, "prompt.restore")}
              </button>
            </div>

            {confirmRegenerate && (
              <div
                class="regenerate-confirmation"
                role="alertdialog"
                aria-labelledby="regenerate-title"
                aria-describedby="regenerate-description"
              >
                <h3 id="regenerate-title">{uiText(ui, "prompt.discardTitle")}</h3>
                <p id="regenerate-description">
                  {uiText(ui, "prompt.discardBody")}
                </p>
                <div>
                  <button
                    ref={keepEditsRef}
                    type="button"
                    class="secondary-action"
                    onClick={keepEditedCopy}
                  >
                    {uiText(ui, "prompt.keep")}
                  </button>
                  <button
                    type="button"
                    class="primary-action"
                    onClick={restoreCanonical}
                  >
                    {uiText(ui, "prompt.discard")}
                  </button>
                </div>
              </div>
            )}
          </section>

          <details class="provenance">
            <summary>{uiText(ui, "provenance.title")}</summary>
            <p>{uiText(ui, "provenance.intro")}</p>
            <dl>
              <div>
                <dt>{uiText(ui, "provenance.compiler")}</dt>
                <dd>
                  <code>{artifact.result.provenance.compilerVersion}</code>
                </dd>
              </div>
              <div>
                <dt>{uiText(ui, "provenance.policy")}</dt>
                <dd>
                  <code>
                    {artifact.result.provenance.compilerPolicyVersion}
                  </code>
                </dd>
              </div>
              <div>
                <dt>{uiText(ui, "provenance.recipe")}</dt>
                <dd>
                  <code>
                    {artifact.result.provenance.recipe.id}@
                    {artifact.result.provenance.recipe.version}
                  </code>
                </dd>
              </div>
              <div>
                <dt>{uiText(ui, "provenance.profiles")}</dt>
                <dd>
                  <code>
                    {artifact.result.provenance.homeProfile.id}@
                    {artifact.result.provenance.homeProfile.version} →{" "}
                    {artifact.result.provenance.targetProfile.id}@
                    {artifact.result.provenance.targetProfile.version}
                  </code>
                </dd>
              </div>
              <div>
                <dt>{uiText(ui, "provenance.pairPack")}</dt>
                <dd>
                  <code>
                    {artifact.result.provenance.pairPack === "none"
                      ? "none"
                      : `${artifact.result.provenance.pairPack.id}@${artifact.result.provenance.pairPack.version}`}
                  </code>
                </dd>
              </div>
              <div>
                <dt>{uiText(ui, "provenance.support")}</dt>
                <dd>
                  <code>
                    {artifact.result.provenance.supportTier} ·{" "}
                    {artifact.result.provenance.supportReviewStatus}
                  </code>
                </dd>
              </div>
              <div>
                <dt>{uiText(ui, "provenance.promptSurface")}</dt>
                <dd>
                  <code>
                    {artifact.result.provenance.promptSurface.id}@
                    {artifact.result.provenance.promptSurface.version} ·{" "}
                    {artifact.result.provenance.promptSurface.locale}
                  </code>
                </dd>
              </div>
              <div>
                <dt>{uiText(ui, "provenance.summaryCatalog")}</dt>
                <dd>
                  <code>
                    {artifactSummary?.catalog.locale}@
                    {artifactSummary?.catalog.version}
                  </code>
                </dd>
              </div>
              <div>
                <dt>{uiText(ui, "provenance.registry")}</dt>
                <dd>
                  <code>
                    {artifact.result.provenance.languageRegistry.version}
                  </code>
                  <code class="hash">
                    {artifact.result.provenance.languageRegistry.contentSha256}
                  </code>
                </dd>
              </div>
              <div>
                <dt>{uiText(ui, "provenance.limitations")}</dt>
                <dd>
                  <code>{artifact.result.limitationCodes.join(", ")}</code>
                </dd>
              </div>
            </dl>
          </details>

          <div class="review-footer-actions">
            <button
              type="button"
              class="primary-action"
              onClick={() => void copyPrompt()}
            >
              {uiText(ui, "review.copy")}
            </button>
            <button
              type="button"
              class="text-action"
              onClick={() => navigateTo("builder")}
            >
              {uiText(ui, "home.adjust")}
            </button>
            <button
              type="button"
              class="text-action"
              onClick={() => {
                setHomeChoicesOpen(false);
                navigateTo("home");
              }}
            >
              {uiText(ui, "review.startAnother")}
            </button>
          </div>
        </main>
      )}
    </>
  );
}
