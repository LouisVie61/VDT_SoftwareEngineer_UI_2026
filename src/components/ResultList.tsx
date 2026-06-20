import { BarChart3, ChevronLeft, ChevronRight, Loader2, LockKeyhole, MoreVertical, UserRound } from "lucide-react";
import type { AggregationRow, EventRow, SearchStatus } from "../types";
import { formatDateTime, formatNumber, severityLabel } from "../utils/format";

interface ResultListProps {
  results: EventRow[];
  aggregations: AggregationRow[];
  totalCount: number;
  status: SearchStatus;
  page: number;
  pageSize: number;
  selectedId?: string | null;
  onSelect: (row: EventRow) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function ResultList({
  results,
  aggregations,
  totalCount,
  status,
  page,
  pageSize,
  selectedId,
  onSelect,
  onPageChange,
  onPageSizeChange,
}: ResultListProps) {
  const isLoading = status === "loading";
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentStart = totalCount === 0 ? 0 : page * pageSize + 1;
  const currentEnd = Math.min(totalCount, page * pageSize + results.length);
  const canPageResults = !isLoading && results.length > 0;
  const canGoPrevious = canPageResults && page > 0;
  const canGoNext = canPageResults && currentEnd < totalCount;
  const countLabel = isLoading
    ? "Waiting for query results"
    : results.length
      ? `Showing ${formatNumber(currentStart)}-${formatNumber(currentEnd)} of ${formatNumber(totalCount)} events`
      : aggregations.length
        ? `Showing ${formatNumber(aggregations.length)} buckets from ${formatNumber(totalCount)} matching events`
      : `Showing 0 of ${formatNumber(totalCount)} events`;

  return (
    <section className="results-panel">
      <header className="panel-header">
        <h2>Results</h2>
        <span className="sort-label">{countLabel}</span>
        <label className="page-size-control">
          <span>Rows</span>
          <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))} disabled={isLoading}>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
      </header>
      <div className="result-list">
        {isLoading ? (
          <LoadingResults />
        ) : results.length ? (
          results.map((row, index) => {
            const severity = severityLabel(row.severity);
            const id = String(row.id || index);
            return (
              <button
                key={id}
                className={`result-item ${selectedId === id ? "selected" : ""}`}
                type="button"
                onClick={() => onSelect(row)}
              >
                <span className={`event-icon severity-${severity}`}>
                  {severity === "high" || severity === "critical" ? <LockKeyhole size={22} /> : <UserRound size={22} />}
                </span>
                <span className="result-body">
                  <strong>{row.message || "Security event returned by Elasticsearch"}</strong>
                  <small>
                    {formatDateTime(row.timestamp)} <b>•</b> {row.host || "unknown-host"} <b>•</b> {row.ip || row.src_ip || "-"}{" "}
                    <b>•</b> {row.user || "-"} <b>•</b> {row.event_type || "-"}
                  </small>
                  <em>{row.raw || row.message || "No raw message available."}</em>
                </span>
                <span className={`badge severity-${severity}`}>{severity}</span>
                <MoreVertical size={18} />
              </button>
            );
          })
        ) : aggregations.length ? (
          aggregations.map((row, index) => <AggregationItem key={`${row.aggregation || "agg"}-${String(row.key ?? index)}`} row={row} />)
        ) : (
          <div className="empty-state">Run a search to inspect matching security events.</div>
        )}
      </div>
      <footer className="results-pagination">
        <span>
          Page {formatNumber(page + 1)} of {formatNumber(pageCount)}
        </span>
        <div>
          <button className="secondary-button compact" type="button" onClick={() => onPageChange(page - 1)} disabled={!canGoPrevious}>
            <ChevronLeft size={15} />
            Previous
          </button>
          <button className="secondary-button compact" type="button" onClick={() => onPageChange(page + 1)} disabled={!canGoNext}>
            Next
            <ChevronRight size={15} />
          </button>
        </div>
      </footer>
    </section>
  );
}

function LoadingResults() {
  return (
    <div className="loading-results">
      <div className="loading-state compact">
        <Loader2 className="spin" size={20} />
        <strong>Query is running</strong>
        <span>Waiting for matching events or aggregation buckets...</span>
      </div>
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="result-item result-skeleton" key={index}>
          <span className="event-icon skeleton-block" />
          <span className="result-body">
            <strong className="skeleton-line wide" />
            <small className="skeleton-line medium" />
            <em className="skeleton-line full" />
          </span>
          <span className="badge skeleton-block" />
          <span className="skeleton-dot" />
        </div>
      ))}
    </div>
  );
}

function AggregationItem({ row }: { row: AggregationRow }) {
  const label = String(row.key ?? row.value_as_string ?? "unknown");
  const metric = row.count ?? row.value ?? 0;

  return (
    <div className="result-item aggregation-item">
      <span className="event-icon aggregation-icon">
        <BarChart3 size={22} />
      </span>
      <span className="result-body">
        <strong>{label}</strong>
        <small>{row.aggregation || "aggregation"}</small>
        <em>Aggregated query result bucket</em>
      </span>
      <span className="badge aggregation-badge">{formatNumber(Number(metric))}</span>
      <MoreVertical size={18} />
    </div>
  );
}
