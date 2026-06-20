import { Code2, Download, Play } from "lucide-react";
import type { ChartType, SearchStatus } from "../types";
import { chartLabel, formatDuration, formatNumber } from "../utils/format";

interface MetricCardsProps {
  totalCount: number;
  elapsedMs: number | null;
  chartType: ChartType;
  status: SearchStatus;
  dslVisible: boolean;
  onToggleDsl: () => void;
  onExport: () => void;
  onRerun: () => void;
}

export function MetricCards({
  totalCount,
  elapsedMs,
  chartType,
  status,
  dslVisible,
  onToggleDsl,
  onExport,
  onRerun,
}: MetricCardsProps) {
  const statusText =
    status === "loading"
      ? "Query running"
      : status === "error"
        ? "Query failed"
        : status === "success"
          ? "Query completed"
          : "Ready";
  const dslStatus = status === "success" ? "Elasticsearch DSL valid" : status === "loading" ? "Generating DSL" : "DSL waiting";

  return (
    <section className={`query-runbar status-${status}`} aria-label="Query execution summary">
      <div className="query-runbar-summary">
        <strong>{statusText}</strong>
        <span>{formatNumber(totalCount)} events</span>
        <span>{formatDuration(elapsedMs)}</span>
        <span>{chartLabel(chartType)}</span>
        <span>{dslStatus}</span>
      </div>
      <div className="query-runbar-actions">
        <button className="secondary-button compact" type="button" onClick={onToggleDsl}>
          <Code2 size={15} />
          {dslVisible ? "Hide DSL" : "Show DSL"}
        </button>
        <button className="secondary-button compact" type="button" onClick={onExport} disabled={status === "loading" || status === "idle"}>
          <Download size={15} />
          Export CSV
        </button>
        <button className="secondary-button compact" type="button" onClick={onRerun} disabled={status === "loading"}>
          <Play size={15} />
          Rerun
        </button>
      </div>
    </section>
  );
}
