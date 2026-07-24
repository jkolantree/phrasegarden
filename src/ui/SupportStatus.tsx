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
        {preview ? "Preview" : "Generic"}
      </p>
      <p class="support-detail">
        {preview
          ? "Built-in, versioned pair guidance · external review not completed"
          : "Conservative universal instructions · no pair-specific guidance"}
      </p>
    </div>
  );
}
