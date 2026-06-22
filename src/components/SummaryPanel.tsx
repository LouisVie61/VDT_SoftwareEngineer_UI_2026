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
  const panelText = isLoading
    ? "Generating summary from the current query response..."
    : isPending
      ? "Generating summary from the current query response..."
    : normalizedSummary
      ? normalizedSummary
      : hasResponse
        ? "No summary was returned for this query. Review the chart, results, and DSL output for the generated response."
        : "Run a search to generate an LLM summary.";
  const statusLabel = isLoading || isPending ? "Generating" : summaryStatus || (normalizedSummary ? "Generated" : hasResponse ? "Missing" : "Waiting");

  return (
    <section className="summary-panel">
      <h2>
        <Sparkles size={17} />
        Summary (LLM)
      </h2>
      <p className={normalizedSummary && !isPending ? undefined : "summary-empty"}>{panelText}</p>
      <small>{statusLabel}</small>
    </section>
  );
}
