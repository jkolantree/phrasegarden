import { useId } from "preact/hooks";

import type { ArtifactProvenance } from "../domain";
import { uiText, type UiLocaleCatalog } from "../locales";

interface SupportStatusProps {
  readonly provenance: ArtifactProvenance;
  readonly ui: UiLocaleCatalog;
  readonly compact?: boolean;
}

export function SupportStatus({
  provenance,
  ui,
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
        <span>
          {uiText(ui, preview ? "support.previewLabel" : "support.genericLabel")}
        </span>
        <span class="support-badge" lang="en" dir="ltr">
          {uiText(ui, preview ? "support.previewBadge" : "support.genericBadge")}
        </span>
      </p>
      <p class="support-detail">
        {uiText(ui, preview ? "support.previewDetail" : "support.genericDetail")}
      </p>
    </section>
  );
}
