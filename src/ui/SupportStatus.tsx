import { useId } from "preact/hooks";

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
  const labelId = useId();
  return (
    <section
      class={`support-status support-${provenance.supportTier}${
        compact ? " support-compact" : ""
      }`}
      aria-labelledby={labelId}
      data-testid="support-status"
    >
      <p id={labelId} class="support-tier">
        <span class="status-marker" aria-hidden="true" />
        <span>{preview ? "Guidance: Built in" : "Guidance: General only"}</span>
        <span class="support-badge">{preview ? "Preview" : "Generic"}</span>
      </p>
      <p class="support-detail">
        {preview
          ? "External language review: incomplete."
          : "No pair-specific guidance or independent language review for this exact direction."}
      </p>
    </section>
  );
}
