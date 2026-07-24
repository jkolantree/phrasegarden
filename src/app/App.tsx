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
import {
  SEARCHABLE_LANGUAGE_PROFILE_CATALOG,
  type SearchableLanguageProfile,
} from "../packs";
import { BehaviorSummary } from "../ui/BehaviorSummary";
import { LanguageLabel } from "../ui/LanguageLabel";
import { SupportStatus } from "../ui/SupportStatus";
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
  const profile = SEARCHABLE_LANGUAGE_PROFILE_CATALOG.find(
    (item) => item.ref.id === id,
  );
  if (profile === undefined) {
    throw new Error(`Missing bundled language profile: ${id}`);
  }
  return profile;
}

function optionLabel(profile: SearchableLanguageProfile): string {
  const primaryName = profile.searchableNames[0] ?? profile.ref.id;
  return primaryName === profile.autonym
    ? `${profile.autonym} (${profile.ref.id})`
    : `${primaryName} — ${profile.autonym} (${profile.ref.id})`;
}

function humanize(value: string): string {
  const explicit = OPTION_LABELS_EN[value];
  if (explicit !== undefined) {
    return explicit;
  }
  const spaced = value.replaceAll("-", " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function rematerialize(
  current: RecipeConfiguration,
  homeLanguageId: string,
  targetLanguageId: string,
  recipeId: "written-translator" | "live-voice-coach",
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
        {SEARCHABLE_LANGUAGE_PROFILE_CATALOG.map((profile) => (
          <option
            key={profile.ref.id}
            value={profile.ref.id}
            disabled={profile.ref.id === excludedId}
          >
            {optionLabel(profile)}
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
  readonly value: RecipeConfiguration["recipe"]["id"];
  readonly onChange: (
    recipeId: "written-translator" | "live-voice-coach",
  ) => void;
}

function ToolChooser({ prefix, value, onChange }: ToolChooserProps) {
  return (
    <fieldset class="tool-chooser">
      <legend>What do you want help with?</legend>
      <div class="segmented-options">
        <label for={`${prefix}-written`}>
          <input
            id={`${prefix}-written`}
            type="radio"
            name={`${prefix}-tool`}
            value="written-translator"
            checked={value === "written-translator"}
            onChange={() => onChange("written-translator")}
          />
          <span>
            <strong>Written Translator</strong>
            <small>Translate text while keeping meaning and tone.</small>
          </span>
        </label>
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
            <strong>Live Voice Coach</strong>
            <small>
              Practice speaking with corrections and pacing you control.
            </small>
          </span>
        </label>
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
  return (
    <div class={`pair-rails${compact ? " pair-rails-compact" : ""}`}>
      <section class="language-rail home-rail" aria-labelledby="home-rail-title">
        <p class="rail-kicker" id="home-rail-title">
          Start with
        </p>
        <LanguageLabel profile={home} showCode={false} />
        <LanguageSelect
          id={compact ? "builder-home-language" : "home-language"}
          label="Home language"
          help="The language you start from or use for explanations."
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
          Work in
        </p>
        <LanguageLabel profile={target} showCode={false} />
        <LanguageSelect
          id={compact ? "builder-target-language" : "target-language"}
          label="Target language"
          help="The language you want to produce or practice."
          value={target.ref.id}
          excludedId={home.ref.id}
          onChange={onTarget}
        />
      </section>
    </div>
  );
}

function CompilerErrors({ issues }: { readonly issues: readonly ValidationIssue[] }) {
  return (
    <section class="error-summary" role="alert" aria-labelledby="error-title">
      <h2 id="error-title">PhraseGarden couldn't build this prompt</h2>
      <p>
        Your settings are still here, and no prompt was generated. Please go
        back and try again.
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
        Creating a prompt from these settings will replace the edited copy
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
          Replace and create prompt
        </button>
      </div>
    </section>
  );
}

export function App() {
  const [view, setView] = useState<View>("home");
  const [configuration, setConfiguration] = useState<RecipeConfiguration>(
    DEFAULT_WRITTEN_CONFIGURATION,
  );
  const [artifact, setArtifact] = useState<ReviewArtifact | null>(null);
  const [announcement, setAnnouncement] = useState(
    "English to Japanese Written Translator selected.",
  );
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [confirmReplacePrompt, setConfirmReplacePrompt] = useState(false);
  const [actionFeedback, setActionFeedback] =
    useState<ActionFeedback | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
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
      home: "PhraseGarden · Portable language prompts",
      builder: "Build your prompt · PhraseGarden",
      review: "Review your prompt · PhraseGarden",
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

  function announceConfiguration(message: string): void {
    setAnnouncement(message);
  }

  function selectLanguages(
    homeLanguageId: string,
    targetLanguageId: string,
    message: string,
  ): void {
    if (homeLanguageId === targetLanguageId) {
      setAnnouncement(
        "Home and target languages must be different. The previous selection remains.",
      );
      return;
    }
    setConfiguration((current) =>
      rematerialize(
        current,
        homeLanguageId,
        targetLanguageId,
        current.recipe.id as "written-translator" | "live-voice-coach",
      ),
    );
    setAnnouncement(message);
  }

  function chooseTool(
    recipeId: "written-translator" | "live-voice-coach",
  ): void {
    setConfiguration((current) =>
      rematerialize(
        current,
        current.languages.home.id,
        current.languages.target.id,
        recipeId,
      ),
    );
    setAnnouncement(
      recipeId === "written-translator"
        ? "Written Translator selected."
        : "Live Voice Coach selected. Voice-tool abilities reset to I don't know.",
    );
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
        "Creating a new prompt would replace your edited copy. Confirmation is required.",
      );
      return;
    }
    const current = compilePresentation(configuration);
    if (!current.ok) {
      setAnnouncement(
        "PhraseGarden couldn't create this prompt. Your settings are still here.",
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
    setAnnouncement("Your prompt is ready.");
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
          ? "Your edited prompt was copied."
          : "Your prompt was copied.",
      });
    } catch {
      setActionFeedback({
        kind: "error",
        message:
          "Copy was not available. Select the visible prompt text and copy it manually.",
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
          "Download could not start. Select the visible prompt text and copy it manually.",
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
    setAnnouncement("The original generated prompt was restored.");
  }

  const currentStatus = presentation.ok ? (
    <SupportStatus provenance={presentation.result.provenance} />
  ) : null;
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
            onClick={() => navigateTo("home")}
            aria-label="PhraseGarden home"
          >
            <span aria-hidden="true" class="wordmark-weave" />
            PhraseGarden
          </button>
          <p class="privacy-status">
            <span class="privacy-dot" aria-hidden="true" />
            Session only · not saved
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
              Make a better translation prompt.
            </h1>
            <p class="hero-copy">
              <strong>No prompt skills needed.</strong> Choose your languages
              and what you need. PhraseGarden makes a ready-to-copy prompt for
              another AI or language tool. It does not translate, send, or ask
              for your private text.
            </p>
          </section>

          {artifact === null && (
            <section
              class="mobile-quick-start"
              aria-labelledby="mobile-quick-start-title"
            >
              <p class="eyebrow">Quick start</p>
              <h2 id="mobile-quick-start-title">
                {profileFor(configuration.languages.home.id)
                  .searchableNames[0] ??
                  configuration.languages.home.id}
                {" to "}
                {profileFor(configuration.languages.target.id)
                  .searchableNames[0] ??
                  configuration.languages.target.id}
                {" · "}
                {configuration.recipe.id === "written-translator"
                  ? "Written Translator"
                  : "Live Voice Coach"}
              </h2>
              <p>These choices are ready. You can change them below.</p>
              <button
                type="button"
                class="primary-action"
                onClick={() => generatePrompt()}
                disabled={!presentation.ok}
              >
                Create with these choices
              </button>
            </section>
          )}

          <section class="home-weave" aria-labelledby="choose-direction">
            <h2 id="choose-direction" class="section-title">
              Choose your languages
            </h2>
            <PairRails
              configuration={configuration}
              onHome={(id) =>
                selectLanguages(
                  id,
                  configuration.languages.target.id,
                  `Home language changed to ${profileFor(id).autonym}.`,
                )
              }
              onTarget={(id) =>
                selectLanguages(
                  configuration.languages.home.id,
                  id,
                  `Target language changed to ${profileFor(id).autonym}.`,
                )
              }
              onSwap={() =>
                selectLanguages(
                  configuration.languages.target.id,
                  configuration.languages.home.id,
                  "Language direction swapped.",
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
              <p class="quick-start-note">
                Most people can use these choices as they are. Create the
                prompt now, or change optional details first.
              </p>
              <div class="home-actions">
                <button
                  type="button"
                  class="primary-action primary-action-large"
                  onClick={() => generatePrompt()}
                  disabled={!presentation.ok}
                >
                  Create my prompt
                </button>
                <button
                  type="button"
                  class="secondary-action"
                  onClick={() => navigateTo("builder")}
                >
                  Adjust optional settings
                </button>
                {artifact !== null && (
                  <button
                    type="button"
                    class="text-action"
                    onClick={() => navigateTo("review")}
                  >
                    Return to current prompt
                  </button>
                )}
              </div>
              {confirmReplacePrompt && (
                <ReplacePromptConfirmation
                  onKeep={() => navigateTo("review")}
                  onReplace={() => generatePrompt(true)}
                />
              )}
            </div>
          </section>

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
                Settings, prompts, and edits disappear when you refresh or
                close this tab.
              </span>
            </p>
            <p>
              <strong>Take it with you</strong>
              <span>
                Copy or download plain text for a compatible AI or language
                tool.
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
              Adjust how the prompt should work
            </h1>
            <p>
              Most people can use the defaults. Change only what matters for
              tone, corrections, or teaching; your source text stays outside
              PhraseGarden.
            </p>
          </div>

          <PairRails
            compact
            configuration={configuration}
            onHome={(id) =>
              selectLanguages(
                id,
                configuration.languages.target.id,
                `Home language changed to ${profileFor(id).autonym}.`,
              )
            }
            onTarget={(id) =>
              selectLanguages(
                configuration.languages.home.id,
                id,
                `Target language changed to ${profileFor(id).autonym}.`,
              )
            }
            onSwap={() =>
              selectLanguages(
                configuration.languages.target.id,
                configuration.languages.home.id,
                "Language direction swapped.",
              )
            }
          />
          {currentStatus}

          <form
            class="builder-form"
            onSubmit={(event) => {
              event.preventDefault();
              generatePrompt();
            }}
          >
            <ToolChooser
              prefix="builder"
              value={configuration.recipe.id}
              onChange={chooseTool}
            />

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
              </fieldset>

              <div class="weave-gutter" aria-hidden="true">
                <span />
              </div>

              <fieldset class="settings-side settings-target">
                <legend>
                  <span>How the result should sound (optional)</span>
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
                ) : null}
              </fieldset>
            </div>

            <details class="safeguards">
              <summary>Names, titles, and unclear wording</summary>
              <div class="details-grid">
                <SelectField
                  id="ambiguity"
                  label="If wording is unclear"
                  value={configuration.ambiguity}
                  values={AMBIGUITY_STRATEGIES}
                  onChange={(value) =>
                    setCommon(
                      (current) =>
                        ({ ...current, ambiguity: value }) as RecipeConfiguration,
                      "Unclear-wording choice updated.",
                    )
                  }
                />
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
              </div>
            </details>

            {configuration.settings.modality === "live-voice" && (
              <details class="safeguards capability-settings">
                <summary>What your language tool can do</summary>
                <p class="details-intro">
                  If you do not know, leave I don't know. PhraseGarden will not
                  assume the tool can hear, speak, notice pauses, or change
                  speaking speed.
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
              </details>
            )}

            {presentation.ok ? (
              <BehaviorSummary summary={presentation.summary} />
            ) : (
              <CompilerErrors issues={presentation.issues} />
            )}

            <div class="form-actions">
              <button
                type="button"
                class="text-action"
                onClick={() =>
                  navigateTo(artifact === null ? "home" : "review")
                }
              >
                {artifact === null
                  ? "Back to languages and tool"
                  : "Back to current prompt"}
              </button>
              <button
                type="submit"
                class="primary-action"
                disabled={!presentation.ok}
              >
                {artifact === null ? "Create my prompt" : "Update prompt"}
              </button>
            </div>
            {confirmReplacePrompt && (
              <ReplacePromptConfirmation
                onKeep={() => navigateTo("review")}
                onReplace={() => generatePrompt(true)}
              />
            )}
          </form>
        </main>
      )}

      {view === "review" && artifact !== null && (
        <main id="main-content" class="page review-page">
          <div class="page-heading review-heading">
            <p class="eyebrow">Ready to use</p>
            <h1 id="page-title" ref={headingRef} tabIndex={-1}>
              Your prompt is ready
            </h1>
            <p>
              Use this prompt in another AI or language tool that accepts
              instructions. PhraseGarden does not send or run it.
            </p>
          </div>

          <div class="review-handoff-grid">
            <div class="review-notices">
              <SupportStatus provenance={artifact.result.provenance} />

              {hasReviewNotices && (
                <section
                  class="limitations"
                  aria-labelledby="limitations-title"
                  data-testid="limitations"
                >
                  <p class="eyebrow">Good to know</p>
                  <h2 id="limitations-title">Before you use this prompt</h2>
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
              <p class="eyebrow">What to do next</p>
              <h2 id="handoff-title">Copy it, then use it elsewhere</h2>
              <ol>
                <li>
                  <strong>Copy or download this prompt.</strong>
                </li>
                <li>
                  Open a new conversation or instruction field in a compatible
                  AI chat or language tool.
                </li>
                <li>
                  {artifact.result.normalizedConfiguration.settings.modality ===
                  "written"
                    ? "Paste the prompt first. Send the text you want translated as your next message."
                    : "Paste the prompt before practice begins. Voice features still depend on the other tool."}
                </li>
              </ol>
              <div class="prompt-actions" aria-label="Prompt actions">
                <button
                  type="button"
                  class="primary-action"
                  onClick={() => void copyPrompt()}
                  data-testid="copy-prompt"
                >
                  Copy prompt
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
                {artifact.result.normalizedConfiguration.settings.modality ===
                "written"
                  ? "the text you enter there."
                  : "any audio, transcripts, or text it receives during practice."}
              </p>
            </section>
          </div>

          <BehaviorSummary
            summary={artifact.summary}
            title="What this prompt asks the tool to do"
            review
          />

          <section class="prompt-review" aria-labelledby="prompt-title">
            <div class="prompt-toolbar">
              <div>
                <p class="eyebrow">Prompt text · English</p>
                <h2 id="prompt-title">
                  {artifact.draft.modified
                    ? "Your edited copy"
                    : "Original generated prompt"}
                </h2>
                {artifact.draft.modified && (
                  <p class="modified-status" role="status">
                    Edited on this device · this copy no longer matches the
                    generated original
                  </p>
                )}
              </div>
            </div>

            {artifact.editing ? (
              <label class="edited-prompt-label" for="edited-prompt">
                <span>Your edited copy</span>
                <textarea
                  id="edited-prompt"
                  lang="en"
                  dir="ltr"
                  spellcheck={false}
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
                class="prompt-surface"
                lang="en"
                dir="ltr"
                tabIndex={0}
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
                  Edit this copy
                </button>
              )}
              <button
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
                Restore generated original
              </button>
            </div>

            {confirmRegenerate && (
              <div
                class="regenerate-confirmation"
                role="group"
                aria-labelledby="regenerate-title"
                aria-describedby="regenerate-description"
              >
                <h3 id="regenerate-title">Discard your edits?</h3>
                <p id="regenerate-description">
                  This will discard your edits and restore the original
                  generated prompt for this session.
                </p>
                <div>
                  <button
                    type="button"
                    class="secondary-action"
                    onClick={() => setConfirmRegenerate(false)}
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
              These details identify exactly how the original prompt was made.
              If you edit the prompt, they do not verify your changes.
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
              class="text-action"
              onClick={() => navigateTo("builder")}
            >
              Adjust optional settings
            </button>
            <button
              type="button"
              class="text-action"
              onClick={() => navigateTo("home")}
            >
              Start another prompt
            </button>
          </div>
        </main>
      )}
    </>
  );
}
