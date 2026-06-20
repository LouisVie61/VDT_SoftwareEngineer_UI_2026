import { ChevronsLeft, ChevronsRight, Code2, ExternalLink, Minus } from "lucide-react";
import type { EventRow, QueryHistoryItem } from "../types";
import { chartLabel, formatDateTime, formatNumber, severityLabel } from "../utils/format";

interface RightPanelProps {
  history: QueryHistoryItem[];
  selectedEvent: EventRow | null;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onHistoryClick: (question: string) => void;
}

export function RightPanel({ history, selectedEvent, collapsed, onToggleCollapsed, onHistoryClick }: RightPanelProps) {
  if (collapsed) {
    return (
      <aside className="right-panel collapsed" aria-label="Investigation panel">
        <button className="icon-button panel-collapse-button" type="button" onClick={onToggleCollapsed} aria-label="Expand investigation panel">
          <ChevronsLeft size={17} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="right-panel">
      <section className="side-card" id="history">
        <header className="panel-header compact">
          <h2>Recent Queries</h2>
          <button className="icon-button panel-collapse-button" type="button" onClick={onToggleCollapsed} aria-label="Minimize investigation panel">
            <Minus size={17} />
          </button>
        </header>
        <div className="history-list">
          {history.length ? (
            history.slice(0, 5).map((item) => (
              <button key={item.id} type="button" onClick={() => onHistoryClick(item.nlQuery)}>
                <span>
                  <strong>{item.nlQuery}</strong>
                  <small>
                    {formatNumber(item.totalCount)} events - {chartLabel(item.chartType)}
                  </small>
                </span>
              </button>
            ))
          ) : (
            <div className="empty-state compact">No history yet.</div>
          )}
        </div>
      </section>

      {selectedEvent ? (
        <section className="side-card details-card">
          <header className="panel-header compact">
            <h2>Event Details</h2>
            <button className="icon-button panel-collapse-button" type="button" onClick={onToggleCollapsed} aria-label="Minimize investigation panel">
              <ChevronsRight size={17} />
            </button>
          </header>
          <EventDetails event={selectedEvent} />
        </section>
      ) : null}
    </aside>
  );
}

function EventDetails({ event }: { event: EventRow }) {
  const severity = severityLabel(event.severity);
  const fields = Object.entries(event).map(([label, value]) => [
    label === "timestamp" ? "@timestamp" : label,
    label === "timestamp" ? formatDateTime(String(value || "")) : formatDetailValue(value),
  ]);

  return (
    <div className="event-details">
      <div className="detail-title">
        <strong>{event.event_type || "Security Event"}</strong>
        <span className={`badge severity-${severity}`}>{severity}</span>
      </div>
      {fields.map(([label, value]) => (
        <div className="detail-row" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
      <button className="secondary-button full" type="button">
        <Code2 size={16} />
        View full raw event
        <ExternalLink size={14} />
      </button>
    </div>
  );
}

function formatDetailValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}
