import type { RenderedSummary } from "../domain";

interface BehaviorSummaryProps {
  readonly summary: RenderedSummary;
  readonly title?: string;
  readonly review?: boolean;
}

function SummaryList({
  items,
}: {
  readonly items: readonly RenderedSummary["items"][number][];
}) {
  if (items.length === 0) {
    return <p class="summary-empty">No optional adaptation is selected.</p>;
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
  title = "Your prompt will",
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
      <p class="eyebrow">Behavior synthesis</p>
      <h2 id="behavior-summary-title">{title}</h2>
      <div class="summary-groups">
        <section>
          <h3>Preserves</h3>
          <SummaryList items={preserves} />
        </section>
        <section>
          <h3>Adapts only when asked</h3>
          <SummaryList items={adapts} />
        </section>
        <section>
          <h3>How it works</h3>
          <SummaryList items={behavior} />
        </section>
      </div>
    </section>
  );
}
