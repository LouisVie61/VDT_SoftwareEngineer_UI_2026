import { Sparkles } from "lucide-react";

interface SummaryPanelProps {
  summary: string;
}

export function SummaryPanel({ summary }: SummaryPanelProps) {
  return (
    <section className="summary-panel">
      <h2>
        <Sparkles size={17} />
        Summary (LLM)
      </h2>
      <p>{summary || "Run a search to generate an LLM summary."}</p>
      <small>Generated from demo server response</small>
    </section>
  );
}
