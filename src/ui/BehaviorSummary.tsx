import type { RenderedSummary } from "../domain";

interface BehaviorSummaryProps {
  readonly summary: RenderedSummary;
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
  title = "These instructions ask the tool to",
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
      <p class="eyebrow">Your choices</p>
      <h2 id="behavior-summary-title">{title}</h2>
      <div class="summary-groups">
        <section>
          <h3>Keep</h3>
          <SummaryList
            items={preserves}
            emptyText="No items to keep are listed."
          />
        </section>
        <section>
          <h3>Change only when you ask</h3>
          <SummaryList
            items={adapts}
            emptyText="No optional changes selected."
          />
        </section>
        <section>
          <h3>Follow these choices</h3>
          <SummaryList
            items={behavior}
            emptyText="No other choices are listed."
          />
        </section>
      </div>
    </section>
  );
}
