import {
  useEffect,
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
  LIMITATION_MESSAGES_EN,
  OPTION_LABELS_EN,
  WARNING_MESSAGES_EN,
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
  readonly summary: RenderedSummary;
  readonly draft: PromptDraft;
  readonly editing: boolean;
}

function compilePresentation(configuration: RecipeConfiguration): Presentation {
  const compiled = compileFromCatalog(
    configuration,
    PHRASEGARDEN_CATALOG,
  );
  if (!compiled.ok) {
    return compiled;
  }
  const rendered = renderSummary(
    compiled.value.summaryItems,
    PHRASEGARDEN_CATALOG.summaryCatalogs[0],
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

function humanize(value: string): string {
  const explicit = OPTION_LABELS_EN[value];
  if (explicit !== undefined) {
    return explicit;
  }
  const spaced = value.replaceAll("-", " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function toolName(recipeId: ActiveRecipeId): string {
  switch (recipeId) {
    case "written-translator":
      return "Translate writing";
    case "live-voice-coach":
      return "Practice speaking";
    case "interpreter":
      return "Translate a conversation";
  }
}

function pairRailCopy(modality: ActiveModality) {
  switch (modality) {
    case "written":
      return {
        homeKicker: "Translate from",
        homeLabel: "Text is in",
        homeHelp: "The language of the text you will give the other tool.",
        targetKicker: "Translate into",
        targetLabel: "Translate to",
        targetHelp: "The language you want the other tool to produce.",
      } as const;
    case "live-voice":
      return {
        homeKicker: "Explain in",
        homeLabel: "Explain in",
        homeHelp: "The language you want explanations and teaching in.",
        targetKicker: "Practice in",
        targetLabel: "Practice in",
        targetHelp: "The language you want to practice speaking.",
      } as const;
    case "interpreting":
      return {
        homeKicker: "Translate from",
        homeLabel: "Turn is in",
        homeHelp: "The language of each turn you give the other tool.",
        targetKicker: "Translate into",
        targetLabel: "Translate to",
        targetHelp: "The one language the other tool should produce.",
      } as const;
  }
}

function reviewUseInstruction(settings: ActiveSettings): string {
  switch (settings.modality) {
    case "written":
      return "Paste the instructions first. Send the text you want translated as your next message.";
    case "live-voice":
      return "Paste the instructions before practice begins. Voice features still depend on the other tool.";
    case "interpreting": {
      const sourceUnit =
        settings.turnMode === "short-relay"
          ? "one short, complete home-language chunk at a time"
          : "one complete home-language turn or message at a time";
      return `Paste the instructions before interpreting starts. Then give the tool ${sourceUnit}. It translates only into the target language; swap the languages and make another set of instructions for the reverse direction.`;
    }
  }
}

function destinationPrivacyObject(modality: ActiveModality): string {
  switch (modality) {
    case "written":
      return "the text you enter there.";
    case "live-voice":
      return "any audio, transcripts, or text it receives during practice.";
    case "interpreting":
      return "any participant's text, transcript, or audio while interpreting.";
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

function directionAnnouncement(configuration: RecipeConfiguration): string {
  const homeName = publicLanguageName(configuration.languages.home.id);
  const targetName = publicLanguageName(configuration.languages.target.id);
  const compiled = compilePresentation(configuration);
  if (!compiled.ok) {
    return `Direction changed to ${homeName} to ${targetName}. Support level could not be determined.`;
  }
  const preview = compiled.result.provenance.supportTier === "preview";
  return `Direction changed to ${homeName} to ${targetName}. Support level: ${
    preview ? "Preview" : "Generic"
  }. ${
    preview
      ? "Built-in direction guidance; independent language review is not complete."
      : "General guidance only."
  }`;
}

interface LanguageSelectProps {
  readonly id: string;
  readonly label: string;
  readonly help: string;
  readonly value: string;
  readonly excludedId: string;
  readonly onChange: (id: string) => void;
}

function LanguageSelect({
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
            {publicLanguageOptionLabel(profile)}
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
  readonly prefix: string;
  readonly value: ActiveRecipeId;
  readonly onChange: (recipeId: ActiveRecipeId) => void;
}

function ToolChooser({ prefix, value, onChange }: ToolChooserProps) {
  return (
    <fieldset class="tool-chooser">
      <legend>What do you want help with?</legend>
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
              Translate writing <small class="recommended-label">Recommended</small>
            </strong>
            <small>
              For messages, emails, documents, and other written text.
            </small>
          </span>
        </label>
        <p class="other-tools-label">Other ways to use PhraseGarden</p>
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
              <strong>Practice speaking</strong>
              <small>
                For conversation practice in an AI tool with voice features.
              </small>
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
              <strong>Translate a conversation</strong>
              <small>
                For translating each complete turn in one direction.
              </small>
            </span>
          </label>
        </div>
      </div>
    </fieldset>
  );
}

interface SelectFieldProps<Value extends string> {
  readonly id: string;
  readonly label: string;
  readonly value: Value;
  readonly values: readonly Value[];
  readonly onChange: (value: Value) => void;
  readonly help?: string;
}

function SelectField<Value extends string>({
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
            {humanize(option)}
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
  configuration,
  onHome,
  onTarget,
  onSwap,
  compact = false,
}: {
  readonly configuration: RecipeConfiguration;
  readonly onHome: (value: string) => void;
  readonly onTarget: (value: string) => void;
  readonly onSwap: () => void;
  readonly compact?: boolean;
}) {
  const home = profileFor(configuration.languages.home.id);
  const target = profileFor(configuration.languages.target.id);
  const copy = pairRailCopy(configuration.settings.modality);
  return (
    <div class={`pair-rails${compact ? " pair-rails-compact" : ""}`}>
      <section class="language-rail home-rail" aria-labelledby="home-rail-title">
        <p class="rail-kicker" id="home-rail-title">
          {copy.homeKicker}
        </p>
        <LanguageLabel profile={home} showCode={false} />
        <LanguageSelect
          id={compact ? "builder-home-language" : "home-language"}
          label={copy.homeLabel}
          help={copy.homeHelp}
          value={home.ref.id}
          excludedId={target.ref.id}
          onChange={onHome}
        />
      </section>
      <div class="pair-connector">
        <span aria-hidden="true">to</span>
        <button type="button" class="swap-button" onClick={onSwap}>
          Swap languages
        </button>
      </div>
      <section
        class="language-rail target-rail"
        aria-labelledby="target-rail-title"
      >
        <p class="rail-kicker" id="target-rail-title">
          {copy.targetKicker}
        </p>
        <LanguageLabel profile={target} showCode={false} />
        <LanguageSelect
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
  configuration,
}: {
  readonly configuration: RecipeConfiguration;
}) {
  const home = profileFor(configuration.languages.home.id);
  const target = profileFor(configuration.languages.target.id);
  const targetName = publicLanguageName(target.ref.id);
  return (
    <p class="review-direction" data-testid="review-direction">
      <span lang="en" dir="ltr">
        {publicLanguageName(home.ref.id)}
      </span>
      <span aria-hidden="true">→</span>
      <span class="sr-only"> to </span>
      <span lang="en" dir="ltr">
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
      <span>{toolName(configuration.recipe.id)}</span>
    </p>
  );
}

function CompilerErrors({ issues }: { readonly issues: readonly ValidationIssue[] }) {
  return (
    <section class="error-summary" role="alert" aria-labelledby="error-title">
      <h2 id="error-title">PhraseGarden couldn't make these instructions</h2>
      <p>
        Your settings are still here. Please go back and try again.
      </p>
      <details>
        <summary>Technical error details</summary>
        <ul>
          {issues.map((item, index) => (
            <li key={`${item.code}-${item.path}-${index}`}>
              <code>{item.code}</code> at <code>{item.path}</code>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}

function ReplacePromptConfirmation({
  onKeep,
  onReplace,
}: {
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
      <h2 id="replace-prompt-title">Replace your edited copy?</h2>
      <p id="replace-prompt-description">
        Making new instructions from these settings will replace the edited copy
        currently in this tab. Copy or download it first if you want to keep
        it.
      </p>
      <div>
        <button
          type="button"
          class="secondary-action"
          onClick={onKeep}
          autoFocus
        >
          Keep edited copy
        </button>
        <button type="button" class="primary-action" onClick={onReplace}>
          Replace and make instructions
        </button>
      </div>
    </section>
  );
}

export function App() {
  const [view, setView] = useState<View>("home");
  const [homeChoicesOpen, setHomeChoicesOpen] = useState(false);
  const [configuration, setConfiguration] = useState<RecipeConfiguration>(
    DEFAULT_WRITTEN_CONFIGURATION,
  );
  const [artifact, setArtifact] = useState<ReviewArtifact | null>(null);
  const [announcement, setAnnouncement] = useState(
    "English to Japanese Translate writing selected.",
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

  const presentation = useMemo(
    () => compilePresentation(configuration),
    [configuration],
  );
  const homeProfile = profileFor(configuration.languages.home.id);
  const targetProfile = profileFor(configuration.languages.target.id);

  useEffect(() => {
    const titles: Readonly<Record<View, string>> = {
      home: "PhraseGarden · Better instructions for language tools",
      builder: "Adjust your instructions · PhraseGarden",
      review: "Use your instructions · PhraseGarden",
    };
    document.title = titles[view];
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

  function selectLanguages(
    homeLanguageId: string,
    targetLanguageId: string,
  ): void {
    if (homeLanguageId === targetLanguageId) {
      setAnnouncement(
        "Home and target languages must be different. The previous selection remains.",
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
    setAnnouncement(directionAnnouncement(next));
  }

  function chooseTool(recipeId: ActiveRecipeId): void {
    setConfiguration((current) =>
      rematerialize(
        current,
        current.languages.home.id,
        current.languages.target.id,
        recipeId,
      ),
    );
    const message: Readonly<Record<ActiveRecipeId, string>> = {
      "written-translator": "Translate writing selected.",
      "live-voice-coach":
        "Practice speaking selected. Voice-tool abilities reset to I don't know.",
      interpreter:
        "Translate a conversation selected. It works in one direction at a time.",
    };
    setAnnouncement(message[recipeId]);
  }

  function setCommon(
    update: (current: RecipeConfiguration) => RecipeConfiguration,
    message: string,
  ): void {
    setConfiguration((current) => update(current));
    announceConfiguration(message);
  }

  function generatePrompt(replaceEdited = false): void {
    if (artifact?.draft.modified === true && !replaceEdited) {
      setConfirmReplacePrompt(true);
      setAnnouncement(
        "Making new instructions would replace your edited copy. Confirmation is required.",
      );
      return;
    }
    const current = compilePresentation(configuration);
    if (!current.ok) {
      setAnnouncement(
        "PhraseGarden couldn't make these instructions. Your settings are still here.",
      );
      return;
    }
    setArtifact({
      result: current.result,
      summary: current.summary,
      draft: createPromptDraft(current.result),
      editing: false,
    });
    setConfirmRegenerate(false);
    setConfirmReplacePrompt(false);
    setActionFeedback(null);
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
          ? "Your edited instructions were copied."
          : "Your instructions were copied.",
      });
    } catch {
      setActionFeedback({
        kind: "error",
        message:
          "Copy was not available. Select the visible instruction text and copy it manually.",
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
          ? "Your edited text-file download started."
          : "Your text-file download started.",
      });
    } catch {
      if (url !== null) {
        URL.revokeObjectURL(url);
      }
      setActionFeedback({
        kind: "error",
        message:
          "Download could not start. Select the visible instruction text and copy it manually.",
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
    setAnnouncement("The original generated instructions were restored.");
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
        Skip to main content
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
            aria-label="PhraseGarden home"
          >
            <span aria-hidden="true" class="wordmark-weave" />
            PhraseGarden
          </button>
          <p class="privacy-status" aria-label="Session only; not saved">
            <span class="privacy-dot" aria-hidden="true" />
            <span class="privacy-long">Session only · </span>not saved
          </p>
        </div>
      </header>
      <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {view === "home" && (
        <main id="main-content" class="page home-page">
          <section class="hero">
            <h1 id="page-title" ref={headingRef} tabIndex={-1}>
              Keep your meaning when AI translates.
            </h1>
            <p class="hero-copy">
              Choose languages and what you want to do. PhraseGarden makes
              reusable instructions for another AI chat or language tool.
              Copy the instructions there, then send the words you want
              translated. <strong>Your text never comes here.</strong>
            </p>
          </section>

          {!homeChoicesOpen && (
            <section
              class="home-start-card"
              aria-labelledby="ready-choices-title"
            >
              <div class="home-start-summary">
                <p class="eyebrow" aria-hidden="true">Ready to start</p>
                <h2
                  id="ready-choices-title"
                  ref={homeReadyHeadingRef}
                  tabIndex={-1}
                >
                  <span class="sr-only">Ready to start: </span>
                  {publicLanguageName(configuration.languages.home.id)}
                  <span aria-hidden="true"> → </span>
                  <span class="sr-only"> to </span>
                  {publicLanguageName(configuration.languages.target.id)}
                </h2>
                <p class="ready-tool">{toolName(configuration.recipe.id)}</p>
                {presentation.ok ? (
                  <SupportStatus
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
                  Make my instructions
                </button>
                <button
                  type="button"
                  class="secondary-action"
                  onClick={() => navigateTo("builder")}
                >
                  Adjust tone or context
                </button>
                <button
                  type="button"
                  class="text-action"
                  onClick={openHomeChoices}
                >
                  Change languages or task
                </button>
                {artifact !== null && (
                  <button
                    type="button"
                    class="text-action"
                    onClick={() => navigateTo("review")}
                  >
                    Return to current instructions
                  </button>
                )}
              </div>
              {confirmReplacePrompt && (
                <ReplacePromptConfirmation
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
                  <p class="eyebrow">Change choices</p>
                  <h2
                    id="choose-direction"
                    class="section-title"
                    ref={homeChoicesHeadingRef}
                    tabIndex={-1}
                  >
                    Choose languages and task
                  </h2>
                </div>
                <button
                  type="button"
                  class="text-action"
                  onClick={closeHomeChoices}
                >
                  Use current choices
                </button>
              </div>
              <PairRails
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
                    compact
                    provenance={presentation.result.provenance}
                  />
                ) : null}
                <ToolChooser
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
                    Make my instructions
                  </button>
                  <button
                    type="button"
                    class="secondary-action"
                    onClick={() => navigateTo("builder")}
                  >
                    Adjust tone or context
                  </button>
                </div>
                <p class="quick-start-note">
                  {configuration.settings.modality === "interpreting"
                    ? "One direction at a time. Swap the languages and make another set of instructions for the reverse direction."
                    : "The defaults work for most people. Adjust tone or context only when it matters."}
                </p>
                {confirmReplacePrompt && (
                  <ReplacePromptConfirmation
                    onKeep={() => navigateTo("review")}
                    onReplace={() => generatePrompt(true)}
                  />
                )}
              </div>
            </section>
          )}

          <section class="proof-strip" aria-label="PhraseGarden promises">
            <p>
              <strong>Your text never comes here</strong>
              <span>
                PhraseGarden never asks for the words you want translated.
              </span>
            </p>
            <p>
              <strong>Session only</strong>
              <span>
                Settings, instructions, and edits disappear when you refresh or
                close this tab.
              </span>
            </p>
            <p>
              <strong>Take it with you</strong>
              <span>
                Copy or download plain text for a compatible AI or language tool.
              </span>
            </p>
          </section>
        </main>
      )}

      {view === "builder" && (
        <main id="main-content" class="page builder-page">
          <div class="page-heading">
            <p class="eyebrow">Optional settings</p>
            <h1 id="page-title" ref={headingRef} tabIndex={-1}>
              Adjust tone and context
            </h1>
            <p>
              The defaults work for most people. Change only what matters for
              this situation; your source text stays outside PhraseGarden.
            </p>
          </div>

          <section class="builder-setup" aria-labelledby="current-setup-title">
            <div>
              <p class="eyebrow">Current setup</p>
              <h2 id="current-setup-title">
                {publicLanguageName(configuration.languages.home.id)}
                <span aria-hidden="true"> → </span>
                <span class="sr-only"> to </span>
                {publicLanguageName(configuration.languages.target.id)}
                <span class="setup-tool">
                  <span aria-hidden="true"> · </span>
                  {toolName(configuration.recipe.id)}
                </span>
              </h2>
            </div>
            <button
              type="button"
              class="text-action"
              onClick={openHomeChoices}
            >
              Change languages or task
            </button>
          </section>

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
                  <span>Conversation context (optional)</span>
                  <bdi lang={homeProfile.ref.id} dir={homeProfile.direction}>
                    {homeProfile.autonym}
                  </bdi>
                </legend>
                <SelectField
                  id="relationship"
                  label="Relationship"
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
                      "Relationship updated.",
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
                      ? "How each translated turn should work (optional)"
                      : "How the result should sound (optional)"}
                  </span>
                  <bdi
                    lang={targetProfile.ref.id}
                    dir={targetProfile.direction}
                  >
                    {targetProfile.autonym}
                  </bdi>
                </legend>
                <SelectField
                  id="register"
                  label="Tone and formality"
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
                      "Tone and formality updated.",
                    )
                  }
                />

                {configuration.settings.modality === "written" ? (
                  <SelectField
                    id="written-detail"
                    label="How much detail"
                    value={configuration.settings.outputDetail}
                    values={WRITTEN_OUTPUT_DETAILS}
                    onChange={(value) =>
                      setCommon(
                        (current) =>
                          updateWrittenSettings(current, (settings) => ({
                            ...settings,
                            outputDetail: value,
                          })),
                        "Answer detail updated.",
                      )
                    }
                  />
                ) : configuration.settings.modality === "live-voice" ? (
                  <>
                    <SelectField
                      id="correction-timing"
                      label="When to correct me"
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
                          "When corrections happen was updated.",
                        )
                      }
                    />
                    <SelectField
                      id="correction-focus"
                      label="What to correct first"
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
                          "Correction priority updated.",
                        )
                      }
                    />
                    <SelectField
                      id="pronunciation"
                      label="Pronunciation help"
                      value={configuration.settings.pronunciation}
                      values={PRONUNCIATION_MODES}
                      help="The tool must receive audio to assess what you actually pronounced."
                      onChange={(value) =>
                        setCommon(
                          (current) =>
                            updateVoiceSettings(current, (settings) => ({
                              ...settings,
                              pronunciation: value,
                            })),
                          "Pronunciation setting updated.",
                        )
                      }
                    />
                    <SelectField
                      id="teaching-depth"
                      label="Explanation detail"
                      value={configuration.settings.teachingDepth}
                      values={TEACHING_DEPTHS}
                      onChange={(value) =>
                        setCommon(
                          (current) =>
                            updateVoiceSettings(current, (settings) => ({
                              ...settings,
                              teachingDepth: value,
                            })),
                          "Teaching depth updated.",
                        )
                      }
                    />
                    <SelectField
                      id="voice-pace"
                      label="Speaking pace"
                      value={configuration.settings.pace}
                      values={VOICE_PACES}
                      onChange={(value) =>
                        setCommon(
                          (current) =>
                            updateVoiceSettings(current, (settings) => ({
                              ...settings,
                              pace: value,
                            })),
                          "Voice pace updated.",
                        )
                      }
                    />
                  </>
                ) : configuration.settings.modality === "interpreting" ? (
                  <>
                    <SelectField
                      id="interpreter-turn-mode"
                      label="How much to interpret at once"
                      value={configuration.settings.turnMode}
                      values={INTERPRETER_TURN_MODES}
                      help="The other tool must receive the complete turn or chunk. These instructions cannot detect where it ends."
                      onChange={(value) =>
                        setCommon(
                          (current) =>
                            updateInterpreterSettings(current, (settings) => ({
                              ...settings,
                              turnMode: value,
                            })),
                          "Interpreter turn handling updated.",
                        )
                      }
                    />
                    <SelectField
                      id="interpreter-clarification"
                      label="If a turn is too unclear"
                      value={configuration.settings.clarification}
                      values={INTERPRETER_CLARIFICATIONS}
                      help="Continuing carefully never means guessing missing meaning."
                      onChange={(value) =>
                        setCommon(
                          (current) =>
                            updateInterpreterSettings(current, (settings) => ({
                              ...settings,
                              clarification: value,
                            })),
                          "Interpreter clarification choice updated.",
                        )
                      }
                    />
                  </>
                ) : null}
              </fieldset>
            </div>

            <details class="safeguards advanced-settings">
              <summary>Advanced settings</summary>
              <div class="details-grid">
                <SelectField
                  id="hierarchy"
                  label="Relative status"
                  value={configuration.socialContext.hierarchy}
                  values={HIERARCHIES}
                  help="Leave this as Not specified if you are not sure."
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
                      "Relative status updated.",
                    )
                  }
                />
                {configuration.settings.modality !== "interpreting" && (
                  <SelectField
                    id="ambiguity"
                    label="If wording is unclear"
                    value={configuration.ambiguity}
                    values={AMBIGUITY_STRATEGIES}
                    onChange={(value) =>
                      setCommon(
                        (current) =>
                          ({
                            ...current,
                            ambiguity: value,
                          }) as RecipeConfiguration,
                        "Unclear-wording choice updated.",
                      )
                    }
                  />
                )}
                <SelectField
                  id="title-handling"
                  label="Titles and honorifics"
                  value={configuration.titleHandling}
                  values={TITLE_HANDLING_STRATEGIES}
                  onChange={(value) =>
                    setCommon(
                      (current) =>
                        ({
                          ...current,
                          titleHandling: value,
                        }) as RecipeConfiguration,
                      "Title and honorific choice updated.",
                    )
                  }
                />
                {configuration.settings.modality !== "interpreting" && (
                  <SelectField
                    id="unknown-name"
                    label="Names with an unknown reading"
                    value={configuration.unknownName}
                    values={UNKNOWN_NAME_STRATEGIES}
                    onChange={(value) =>
                      setCommon(
                        (current) =>
                          ({
                            ...current,
                            unknownName: value,
                          }) as RecipeConfiguration,
                        "Unknown-name choice updated.",
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
                    What your language tool can do
                  </h2>
                  <p class="details-intro">
                    If you do not know, leave I don't know. PhraseGarden will
                    not assume the tool can hear, speak, notice pauses, or
                    change speaking speed.
                  </p>
                  <div class="details-grid">
                    <SelectField
                      id="user-evidence"
                      label="What the tool receives from you"
                      value={configuration.destination.userEvidence}
                      values={USER_EVIDENCE_CAPABILITIES}
                      help="The tool must receive audio to assess what you actually pronounced."
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
                          "What the tool receives was updated.",
                        )
                      }
                    />
                    <SelectField
                      id="assistant-output"
                      label="How the tool responds"
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
                          "How the tool responds was updated.",
                        )
                      }
                    />
                    <SelectField
                      id="interruption-signal"
                      label="Can it detect interruptions?"
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
                          "Interruption detection updated.",
                        )
                      }
                    />
                    <SelectField
                      id="silence-signal"
                      label="Can it detect silence?"
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
                          "Silence detection updated.",
                        )
                      }
                    />
                    <SelectField
                      id="playback-rate"
                      label="Can it change speaking speed?"
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
                          "Speaking-speed control updated.",
                        )
                      }
                    />
                  </div>
                </section>
              )}
            </details>

            {!presentation.ok && <CompilerErrors issues={presentation.issues} />}

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
                  ? "Change languages or task"
                  : "Back to current instructions"}
              </button>
              <button
                type="submit"
                class="primary-action"
                disabled={!presentation.ok}
              >
                {artifact === null ? "Make my instructions" : "Update instructions"}
              </button>
            </div>
            {confirmReplacePrompt && (
              <ReplacePromptConfirmation
                onKeep={() => navigateTo("review")}
                onReplace={() => generatePrompt(true)}
              />
            )}
            {presentation.ok && (
              <details class="builder-protection">
                <summary>See exactly what PhraseGarden will protect</summary>
                <BehaviorSummary summary={presentation.summary} />
              </details>
            )}
          </form>
        </main>
      )}

      {view === "review" && artifact !== null && (
        <main id="main-content" class="page review-page">
          <div class="page-heading review-heading">
            <p class="eyebrow">Ready to use</p>
            <h1 id="page-title" ref={headingRef} tabIndex={-1}>
              Your instructions are ready
            </h1>
            <p>
              Copy these instructions into another AI or language tool.
              PhraseGarden does not send or run them.
            </p>
          </div>

          <ReviewDirection
            configuration={artifact.result.normalizedConfiguration}
          />

          <div class="review-handoff-grid">
            <div class="review-notices">
              <SupportStatus compact provenance={artifact.result.provenance} />

              {hasReviewNotices && (
                <section
                  class="limitations limitations-compact"
                  aria-labelledby="limitations-title"
                  data-testid="limitations"
                >
                  <p class="eyebrow">Before you copy</p>
                  <h2 id="limitations-title" class="sr-only">
                    Known limitations
                  </h2>
                  <ul>
                    {visibleLimitations.map((code) => (
                      <li key={code}>
                        <strong>{LIMITATION_MESSAGES_EN[code] ?? code}</strong>
                      </li>
                    ))}
                    {visibleWarnings.map((warning) => (
                      <li key={warning.code}>
                        <span>{WARNING_MESSAGES_EN[warning.code]}</span>
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
              <p class="eyebrow">Next step</p>
              <h2 id="handoff-title">Copy, then paste elsewhere</h2>
              <p class="handoff-lead">
                Paste these instructions into a new AI chat or language tool
                before you begin.
              </p>
              <div class="prompt-actions" aria-label="Instruction actions">
                <button
                  type="button"
                  class="primary-action"
                  onClick={() => void copyPrompt()}
                  data-testid="copy-prompt"
                >
                  Copy instructions
                </button>
                <button
                  type="button"
                  class="secondary-action"
                  onClick={downloadPrompt}
                  data-testid="download-prompt"
                >
                  Download text file
                </button>
              </div>
              <div class="handoff-secondary-actions">
                <button
                  type="button"
                  class="text-action"
                  onClick={() => navigateTo("builder")}
                >
                  Adjust tone or context
                </button>
                <button
                  type="button"
                  class="text-action"
                  onClick={() => {
                    setHomeChoicesOpen(false);
                    navigateTo("home");
                  }}
                >
                  Start another set
                </button>
              </div>
              <details class="handoff-steps">
                <summary>Step-by-step</summary>
                <ol>
                  <li>Copy or download these instructions.</li>
                  <li>
                    Open a new conversation or instruction field in a
                    compatible AI chat or language tool.
                  </li>
                  <li>
                    {reviewUseInstruction(
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
                Before you paste: the other tool's privacy policy applies.
                PhraseGarden cannot control what it stores or how it handles{" "}
                {destinationPrivacyObject(
                  artifact.result.normalizedConfiguration.settings.modality,
                )}
              </p>
            </section>
          </div>

          <BehaviorSummary
            summary={artifact.summary}
            title="What these instructions ask the tool to do"
            review
          />

          <section class="prompt-review" aria-labelledby="prompt-title">
            <div class="prompt-toolbar">
              <div>
                <p class="eyebrow">Instruction text · English</p>
                <h2 id="prompt-title">
                  {artifact.draft.modified
                    ? "Your edited copy"
                    : "Complete generated instructions"}
                </h2>
                {artifact.draft.modified && (
                  <p class="modified-status" role="status">
                    Edited on this device · this copy no longer matches the
                    generated original
                  </p>
                )}
              </div>
            </div>

            <p id="complete-text-note" class="prompt-visibility-note">
              Every line is present in the reading area below. Copy and
              download include the complete text.
            </p>

            {artifact.editing ? (
              <label class="edited-prompt-label" for="edited-prompt">
                <span>Your edited copy</span>
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
                lang="en"
                dir="ltr"
                tabIndex={0}
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
                  Edit these instructions
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
                Restore generated instructions
              </button>
            </div>

            {confirmRegenerate && (
              <div
                class="regenerate-confirmation"
                role="alertdialog"
                aria-labelledby="regenerate-title"
                aria-describedby="regenerate-description"
              >
                <h3 id="regenerate-title">Discard your edits?</h3>
                <p id="regenerate-description">
                  This will discard your edits and restore the original
                  generated instructions for this session.
                </p>
                <div>
                  <button
                    ref={keepEditsRef}
                    type="button"
                    class="secondary-action"
                    onClick={keepEditedCopy}
                  >
                    Keep my edits
                  </button>
                  <button
                    type="button"
                    class="primary-action"
                    onClick={restoreCanonical}
                  >
                    Discard edits and restore
                  </button>
                </div>
              </div>
            )}
          </section>

          <details class="provenance">
            <summary>Technical details and versions</summary>
            <p>
              These details identify exactly how the original instructions were
              made. If you edit them, the details do not verify your changes.
            </p>
            <dl>
              <div>
                <dt>Compiler</dt>
                <dd>
                  <code>{artifact.result.provenance.compilerVersion}</code>
                </dd>
              </div>
              <div>
                <dt>Policy</dt>
                <dd>
                  <code>
                    {artifact.result.provenance.compilerPolicyVersion}
                  </code>
                </dd>
              </div>
              <div>
                <dt>Recipe</dt>
                <dd>
                  <code>
                    {artifact.result.provenance.recipe.id}@
                    {artifact.result.provenance.recipe.version}
                  </code>
                </dd>
              </div>
              <div>
                <dt>Profiles</dt>
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
                <dt>Pair pack</dt>
                <dd>
                  <code>
                    {artifact.result.provenance.pairPack === "none"
                      ? "none"
                      : `${artifact.result.provenance.pairPack.id}@${artifact.result.provenance.pairPack.version}`}
                  </code>
                </dd>
              </div>
              <div>
                <dt>Support</dt>
                <dd>
                  <code>
                    {artifact.result.provenance.supportTier} ·{" "}
                    {artifact.result.provenance.supportReviewStatus}
                  </code>
                </dd>
              </div>
              <div>
                <dt>Prompt surface</dt>
                <dd>
                  <code>
                    {artifact.result.provenance.promptSurface.id}@
                    {artifact.result.provenance.promptSurface.version} ·{" "}
                    {artifact.result.provenance.promptSurface.locale}
                  </code>
                </dd>
              </div>
              <div>
                <dt>Summary catalog</dt>
                <dd>
                  <code>
                    {artifact.summary.catalog.locale}@
                    {artifact.summary.catalog.version}
                  </code>
                </dd>
              </div>
              <div>
                <dt>Language registry</dt>
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
                <dt>Known limitations</dt>
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
              Copy instructions
            </button>
            <button
              type="button"
              class="text-action"
              onClick={() => navigateTo("builder")}
            >
              Adjust tone or context
            </button>
            <button
              type="button"
              class="text-action"
              onClick={() => {
                setHomeChoicesOpen(false);
                navigateTo("home");
              }}
            >
              Start another set
            </button>
          </div>
        </main>
      )}
    </>
  );
}
