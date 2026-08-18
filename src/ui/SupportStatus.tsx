import type { ArtifactProvenance } from "../domain";

interface SupportStatusProps {
  readonly provenance: ArtifactProvenance;
  readonly compact?: boolean;
}

export function SupportStatus({
  provenance,
  compact = false,
}: SupportStatusProps) {
  const preview = provenance.supportTier === "preview";
  return (
    <div
      class={`support-status support-${provenance.supportTier}${
        compact ? " support-compact" : ""
      }`}
      data-testid="support-status"
    >
      <p class="support-tier">
        <span class="status-marker" aria-hidden="true" />
        Support level: {preview ? "Preview" : "Generic"}
      </p>
      <p class="support-detail">
        {preview
          ? "Includes built-in guidance for this language direction. Independent language review is not complete."
          : "Uses PhraseGarden's general meaning-and-tone rules. This exact language direction has no pair-specific guidance or independent language review."}
      </p>
    </div>
  );
}
