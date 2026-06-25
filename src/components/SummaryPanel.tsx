import { Sparkles } from "lucide-react";

interface SummaryPanelProps {
  summary?: string | null;
  summaryStatus?: string | null;
  hasResponse: boolean;
  isLoading: boolean;
}

export function SummaryPanel({ summary, summaryStatus, hasResponse, isLoading }: SummaryPanelProps) {
  const normalizedSummary = summary?.trim();
  const isPending = summaryStatus === "PENDING";
  const isNotRequired = summaryStatus === "NOT_REQUIRED";
  const isFailed = summaryStatus === "FAILED";
  const panelText = isLoading
    ? "Generating summary from the current query response..."
    : isPending
      ? "Generating summary from the current query response..."
      : normalizedSummary
        ? normalizedSummary
        : isNotRequired
          ? "No result rows or aggregation buckets were returned, so there is nothing substantive to summarize. Review the generated DSL or broaden the query before continuing."
          : isFailed
            ? "Summary generation failed; the chart, result table, and generated DSL remain available for review."
            : hasResponse
              ? "Summary is not available yet. Review the chart, results, and DSL output for the generated response."
              : "Run a search to generate a result summary and next investigation steps.";
  const statusLabel = isLoading || isPending
    ? "Generating"
    : normalizedSummary
      ? "Ready"
      : isNotRequired
        ? "Not required"
        : isFailed
          ? "Unavailable"
          : hasResponse
            ? "Waiting"
            : "Waiting";

  return (
    <section className="summary-panel">
      <h2>
        <Sparkles size={17} />
        Summary & next steps
      </h2>
      <p className={normalizedSummary && !isPending ? undefined : "summary-empty"}>{panelText}</p>
      <small>{statusLabel}</small>
    </section>
  );
}
