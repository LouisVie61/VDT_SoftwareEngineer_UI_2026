import { LockKeyhole, MoreVertical, UserRound } from "lucide-react";
import type { EventRow } from "../types";
import { formatDateTime, severityLabel } from "../utils/format";

interface ResultListProps {
  results: EventRow[];
  selectedId?: string | null;
  onSelect: (row: EventRow) => void;
}

export function ResultList({ results, selectedId, onSelect }: ResultListProps) {
  return (
    <section className="results-panel">
      <header className="panel-header">
        <h2>Results ({results.length} events)</h2>
        <span className="sort-label">Sort by: @timestamp (desc)</span>
      </header>
      <div className="result-list">
        {results.length ? (
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
        ) : (
          <div className="empty-state">Run a search to inspect matching security events.</div>
        )}
      </div>
    </section>
  );
}
