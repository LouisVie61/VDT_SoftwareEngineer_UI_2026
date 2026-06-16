import { BarChart3, CheckCircle2, Clock3, Database } from "lucide-react";
import type { ChartType, SearchStatus } from "../types";
import { chartLabel, formatDuration, formatNumber } from "../utils/format";

interface MetricCardsProps {
  totalCount: number;
  elapsedMs: number | null;
  chartType: ChartType;
  status: SearchStatus;
}

export function MetricCards({ totalCount, elapsedMs, chartType, status }: MetricCardsProps) {
  const statusText = status === "loading" ? "Running" : status === "error" ? "Failed" : status === "success" ? "Success" : "Ready";

  return (
    <section className="metric-grid">
      <article className="metric-card">
        <Database size={24} />
        <div>
          <span>Results</span>
          <strong>{formatNumber(totalCount)}</strong>
          <small>events</small>
        </div>
      </article>
      <article className="metric-card">
        <Clock3 size={24} />
        <div>
          <span>Execution Time</span>
          <strong>{formatDuration(elapsedMs)}</strong>
          <small>Runtime</small>
        </div>
      </article>
      <article className="metric-card">
        <BarChart3 size={24} />
        <div>
          <span>Chart Hint</span>
          <strong>{chartLabel(chartType)}</strong>
          <small>by aggregation</small>
        </div>
      </article>
      <article className={`metric-card status-${status}`}>
        <CheckCircle2 size={24} />
        <div>
          <span>Status</span>
          <strong>{statusText}</strong>
          <small>{status === "success" ? "Completed" : "Search service"}</small>
        </div>
      </article>
    </section>
  );
}
