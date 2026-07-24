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
        warning.code === "W-PREVIEW-EXTERNAL-REVIEW" &&
        result.limitationCodes.includes("L-PREVIEW-EXTERNAL-REVIEW")
      ),
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
  readonly value: string;
  readonly excludedId: string;
  readonly onChange: (id: string) => void;
}

function LanguageSelect({
  id,
  label,
  value,
  excludedId,
  onChange,
}: LanguageSelectProps) {
  return (
    <label class="field language-select-field" for={id}>
      <span class="field-label">{label}</span>
      <select
        id={id}
        value={value}
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
      <legend>Choose your tool</legend>
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
            <small>Translation-first, with optional notes</small>
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
            <small>Short, screenless practice turns</small>
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
          Home
        </p>
        <LanguageLabel profile={home} />
        <LanguageSelect
          id={compact ? "builder-home-language" : "home-language"}
          label="Home language"
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
          Target
        </p>
        <LanguageLabel profile={target} />
        <LanguageSelect
          id={compact ? "builder-target-language" : "target-language"}
          label="Target language"
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
      <h2 id="error-title">This prompt could not be prepared</h2>
      <p>The bundled configuration failed closed. No prompt was generated.</p>
      <ul>
        {issues.map((item, index) => (
          <li key={`${item.code}-${item.path}-${index}`}>
            <code>{item.code}</code> at <code>{item.path}</code>
          </li>
        ))}
      </ul>
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
        : "Live Voice Coach selected. Destination capabilities reset to Unknown.",
    );
  }

  function setCommon(
    update: (current: RecipeConfiguration) => RecipeConfiguration,
    message: string,
  ): void {
    setConfiguration((current) => update(current));
    announceConfiguration(message);
  }

  function generatePrompt(): void {
    const current = compilePresentation(configuration);
    if (!current.ok) {
      setAnnouncement("Prompt generation failed closed.");
      return;
    }
    setArtifact({
      result: current.result,
      summary: current.summary,
      draft: createPromptDraft(current.result),
      editing: false,
    });
    setConfirmRegenerate(false);
    setView("review");
    setAnnouncement("Canonical prompt generated locally.");
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
      setAnnouncement(
        artifact.draft.modified
          ? "Your edited copy was copied."
          : "Canonical compiler output was copied.",
      );
    } catch {
      setAnnouncement(
        "Copy was not available. Select the visible prompt text and copy it manually.",
      );
    }
  }

  function downloadPrompt(): void {
    if (artifact === null) {
      return;
    }
    const url = URL.createObjectURL(
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
    globalThis.setTimeout(() => URL.revokeObjectURL(url), 0);
    setAnnouncement(
      artifact.draft.modified
        ? "Your edited copy was downloaded."
        : "Canonical compiler output was downloaded.",
    );
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
  }

  function restoreCanonical(): void {
    const current = compilePresentation(configuration);
    if (!current.ok) {
      setAnnouncement("Regeneration failed closed; your edited copy remains.");
      return;
    }
    setArtifact({
      result: current.result,
      summary: current.summary,
      draft: createPromptDraft(current.result),
      editing: false,
    });
    setConfirmRegenerate(false);
    setAnnouncement("Canonical compiler output was regenerated locally.");
  }

  const currentStatus = presentation.ok ? (
    <SupportStatus provenance={presentation.result.provenance} />
  ) : null;

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
            onClick={() => setView("home")}
            aria-label="PhraseGarden home"
          >
            <span aria-hidden="true" class="wordmark-weave" />
            PhraseGarden
          </button>
          <p class="privacy-status">
            <span class="privacy-dot" aria-hidden="true" />
            Local compiler · nothing sent
          </p>
        </div>
      </header>
      <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {view === "home" && (
        <main id="main-content" class="page home-page">
          <section class="hero">
            <p class="eyebrow">Portable language prompts, grown locally</p>
            <h1 id="page-title" ref={headingRef} tabIndex={-1}>
              Carry what you mean.
              <span>Let it land naturally.</span>
            </h1>
            <p class="hero-copy">
              Choose a direction and a tool. PhraseGarden compiles a readable
              prompt on this device—without receiving the words you want to
              translate.
            </p>
          </section>

          <section class="home-weave" aria-labelledby="choose-direction">
            <h2 id="choose-direction" class="section-title">
              Choose your conversation
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
            {currentStatus}
            <ToolChooser
              prefix="home"
              value={configuration.recipe.id}
              onChange={chooseTool}
            />
            <button
              type="button"
              class="primary-action"
              onClick={() => setView("builder")}
            >
              Open the prompt builder
            </button>
          </section>

          <section class="proof-strip" aria-label="PhraseGarden promises">
            <p>
              <strong>No source text</strong>
              <span>The builder asks for settings, never private prose.</span>
            </p>
            <p>
              <strong>No runtime AI</strong>
              <span>Versioned instructions compile deterministically.</span>
            </p>
            <p>
              <strong>Yours to carry</strong>
              <span>Inspect, edit, copy, and download plain text.</span>
            </p>
          </section>
        </main>
      )}

      {view === "builder" && (
        <main id="main-content" class="page builder-page">
          <div class="page-heading">
            <p class="eyebrow">Prompt builder</p>
            <h1 id="page-title" ref={headingRef} tabIndex={-1}>
              Shape the behavior
            </h1>
            <p>
              Set the relationship and destination behavior. Your private
              source stays outside PhraseGarden.
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
                  <span>What you bring</span>
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
                  label="Hierarchy"
                  value={configuration.socialContext.hierarchy}
                  values={HIERARCHIES}
                  help="Unspecified never becomes an inferred social rank."
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
                      "Hierarchy updated.",
                    )
                  }
                />
              </fieldset>

              <div class="weave-gutter" aria-hidden="true">
                <span />
              </div>

              <fieldset class="settings-side settings-target">
                <legend>
                  <span>How it should land</span>
                  <bdi
                    lang={targetProfile.ref.id}
                    dir={targetProfile.direction}
                  >
                    {targetProfile.autonym}
                  </bdi>
                </legend>
                <SelectField
                  id="register"
                  label="Register treatment"
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
                      "Register treatment updated.",
                    )
                  }
                />

                {configuration.settings.modality === "written" ? (
                  <SelectField
                    id="written-detail"
                    label="Output detail"
                    value={configuration.settings.outputDetail}
                    values={WRITTEN_OUTPUT_DETAILS}
                    onChange={(value) =>
                      setCommon(
                        (current) =>
                          updateWrittenSettings(current, (settings) => ({
                            ...settings,
                            outputDetail: value,
                          })),
                        "Written output detail updated.",
                      )
                    }
                  />
                ) : configuration.settings.modality === "live-voice" ? (
                  <>
                    <SelectField
                      id="correction-timing"
                      label="Correction timing"
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
                          "Correction timing updated.",
                        )
                      }
                    />
                    <SelectField
                      id="correction-focus"
                      label="Correction focus"
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
                          "Correction focus updated.",
                        )
                      }
                    />
                    <SelectField
                      id="pronunciation"
                      label="Pronunciation help"
                      value={configuration.settings.pronunciation}
                      values={PRONUNCIATION_MODES}
                      help="Text can teach a form; only audible evidence can support assessment."
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
                      label="Teaching depth"
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
                      label="Default pace"
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
              <summary>Safeguards and ambiguity</summary>
              <div class="details-grid">
                <SelectField
                  id="ambiguity"
                  label="Ambiguity"
                  value={configuration.ambiguity}
                  values={AMBIGUITY_STRATEGIES}
                  onChange={(value) =>
                    setCommon(
                      (current) =>
                        ({ ...current, ambiguity: value }) as RecipeConfiguration,
                      "Ambiguity strategy updated.",
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
                      "Title handling updated.",
                    )
                  }
                />
                <SelectField
                  id="unknown-name"
                  label="Unknown name readings"
                  value={configuration.unknownName}
                  values={UNKNOWN_NAME_STRATEGIES}
                  onChange={(value) =>
                    setCommon(
                      (current) =>
                        ({
                          ...current,
                          unknownName: value,
                        }) as RecipeConfiguration,
                      "Unknown-name handling updated.",
                    )
                  }
                />
              </div>
            </details>

            {configuration.settings.modality === "live-voice" && (
              <details class="safeguards capability-settings">
                <summary>Destination capabilities</summary>
                <p class="details-intro">
                  Leave a capability Unknown unless the destination actually
                  provides it. These settings bound what the prompt may claim.
                </p>
                <div class="details-grid">
                  <SelectField
                    id="user-evidence"
                    label="Learner evidence"
                    value={configuration.destination.userEvidence}
                    values={USER_EVIDENCE_CAPABILITIES}
                    help="Audible audio is required for pronunciation assessment."
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
                        "Learner evidence capability updated.",
                      )
                    }
                  />
                  <SelectField
                    id="assistant-output"
                    label="Assistant output"
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
                        "Assistant output capability updated.",
                      )
                    }
                  />
                  <SelectField
                    id="interruption-signal"
                    label="Interruption signal"
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
                        "Interruption capability updated.",
                      )
                    }
                  />
                  <SelectField
                    id="silence-signal"
                    label="Silence signal"
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
                        "Silence capability updated.",
                      )
                    }
                  />
                  <SelectField
                    id="playback-rate"
                    label="Playback-rate control"
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
                        "Playback-rate capability updated.",
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
                onClick={() => setView("home")}
              >
                Back
              </button>
              <button
                type="submit"
                class="primary-action"
                disabled={!presentation.ok}
              >
                Generate portable prompt
              </button>
            </div>
          </form>
        </main>
      )}

      {view === "review" && artifact !== null && (
        <main id="main-content" class="page review-page">
          <div class="page-heading review-heading">
            <p class="eyebrow">Generated-prompt review</p>
            <h1 id="page-title" ref={headingRef} tabIndex={-1}>
              Your portable prompt
            </h1>
            <p>
              Read every instruction. Copy it into the language tool you choose,
              or make a local edit first.
            </p>
          </div>

          <SupportStatus provenance={artifact.result.provenance} />
          <BehaviorSummary
            summary={artifact.summary}
            title="What this prompt will do"
            review
          />

          <section
            class="limitations"
            aria-labelledby="limitations-title"
            data-testid="limitations"
          >
            <p class="eyebrow">Read before use</p>
            <h2 id="limitations-title">Limitations and notices</h2>
            <ul>
              {artifact.result.limitationCodes.map((code) => (
                <li key={code}>
                  <strong>{LIMITATION_MESSAGES_EN[code] ?? code}</strong>
                  <code>{code}</code>
                </li>
              ))}
              {reviewWarnings(artifact.result).map((warning) => (
                <li key={warning.code}>
                  <span>{WARNING_MESSAGES_EN[warning.code]}</span>
                  <code>{warning.code}</code>
                </li>
              ))}
            </ul>
          </section>

          <section class="prompt-review" aria-labelledby="prompt-title">
            <div class="prompt-toolbar">
              <div>
                <p class="eyebrow">English instruction surface</p>
                <h2 id="prompt-title">
                  {artifact.draft.modified
                    ? "Your edited copy"
                    : "Canonical compiler output"}
                </h2>
                {artifact.draft.modified && (
                  <p class="modified-status" role="status">
                    Modified locally · canonicality is not certified
                  </p>
                )}
              </div>
              <div class="prompt-actions" aria-label="Prompt actions">
                <button
                  type="button"
                  class="secondary-action"
                  onClick={() => void copyPrompt()}
                  data-testid="copy-prompt"
                >
                  Copy
                </button>
                <button
                  type="button"
                  class="secondary-action"
                  onClick={downloadPrompt}
                  data-testid="download-prompt"
                >
                  Download
                </button>
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
                  Edit a local copy
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
                Regenerate canonical output
              </button>
            </div>

            {confirmRegenerate && (
              <div
                class="regenerate-confirmation"
                role="group"
                aria-labelledby="regenerate-title"
                aria-describedby="regenerate-description"
              >
                <h3 id="regenerate-title">Replace your edited copy?</h3>
                <p id="regenerate-description">
                  Regeneration restores deterministic compiler output and
                  removes the local edit from this memory-only session.
                </p>
                <div>
                  <button
                    type="button"
                    class="secondary-action"
                    onClick={() => setConfirmRegenerate(false)}
                  >
                    Keep my edit
                  </button>
                  <button
                    type="button"
                    class="primary-action"
                    onClick={restoreCanonical}
                  >
                    Restore canonical
                  </button>
                </div>
              </div>
            )}
          </section>

          <details class="provenance">
            <summary>Version and provenance</summary>
            <p>
              This record describes the compiler output. If you edit the text,
              it does not certify your changes.
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
              onClick={() => setView("builder")}
            >
              Edit settings
            </button>
            <button
              type="button"
              class="text-action"
              onClick={() => setView("home")}
            >
              Start another prompt
            </button>
          </div>
        </main>
      )}
    </>
  );
}
