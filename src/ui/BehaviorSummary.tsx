import type { RenderedSummary } from "../domain";
import { uiText, type UiLocaleCatalog } from "../locales";

interface BehaviorSummaryProps {
  readonly summary: RenderedSummary;
  readonly ui: UiLocaleCatalog;
  readonly title?: string;
  readonly review?: boolean;
}

function SummaryList({
  items,
  emptyText,
}: {
  readonly items: readonly RenderedSummary["items"][number][];
  readonly emptyText: string;
}) {
  if (items.length === 0) {
    return <p class="summary-empty">{emptyText}</p>;
  }
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  );
}

export function BehaviorSummary({
  summary,
  ui,
  title = uiText(ui, "summary.defaultTitle"),
  review = false,
}: BehaviorSummaryProps) {
  const preserves = summary.items.filter((item) =>
    item.id.startsWith("preserves."),
  );
  const adapts = summary.items.filter((item) =>
    item.id.startsWith("adapts."),
  );
  const behavior = summary.items.filter(
    (item) =>
      !item.id.startsWith("preserves.") &&
      !item.id.startsWith("adapts."),
  );

  return (
    <section
      class={`behavior-summary${review ? " review-summary" : ""}`}
      aria-labelledby="behavior-summary-title"
      data-testid="behavior-summary"
    >
      <p class="eyebrow">{uiText(ui, "summary.eyebrow")}</p>
      <h2 id="behavior-summary-title">{title}</h2>
      <div class="summary-groups">
        <section>
          <h3>{uiText(ui, "summary.keep")}</h3>
          <SummaryList
            items={preserves}
            emptyText={uiText(ui, "summary.keepEmpty")}
          />
        </section>
        <section>
          <h3>{uiText(ui, "summary.adapt")}</h3>
          <SummaryList
            items={adapts}
            emptyText={uiText(ui, "summary.adaptEmpty")}
          />
        </section>
        <section>
          <h3>{uiText(ui, "summary.behavior")}</h3>
          <SummaryList
            items={behavior}
            emptyText={uiText(ui, "summary.behaviorEmpty")}
          />
        </section>
      </div>
    </section>
  );
}
