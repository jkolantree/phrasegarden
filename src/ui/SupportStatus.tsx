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
        <span>{preview ? "Guidance: Built in" : "Guidance: General only"}</span>
        <span class="support-badge">{preview ? "Preview" : "Generic"}</span>
      </p>
      <p class="support-detail">
        {preview
          ? "External language review: incomplete."
          : "No pair-specific guidance or independent language review for this exact direction."}
      </p>
    </div>
  );
}
