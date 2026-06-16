import { Clock3, Code2, ExternalLink } from "lucide-react";
import type { EventRow, QueryHistoryItem } from "../types";
import { formatDateTime, formatNumber, severityLabel } from "../utils/format";

interface RightPanelProps {
  history: QueryHistoryItem[];
  selectedEvent: EventRow | null;
  onHistoryClick: (question: string) => void;
}

export function RightPanel({ history, selectedEvent, onHistoryClick }: RightPanelProps) {
  return (
    <aside className="right-panel">
      <section className="side-card" id="history">
        <header className="panel-header compact">
          <h2>Recent Queries</h2>
          <button type="button">View all</button>
        </header>
        <div className="history-list">
          {history.length ? (
            history.slice(0, 5).map((item) => (
              <button key={item.id} type="button" onClick={() => onHistoryClick(item.nlQuery)}>
                <Clock3 size={15} />
                <span>
                  <strong>{item.nlQuery}</strong>
                  <small>{formatNumber(item.totalCount)} events</small>
                </span>
                <em>{item.chartType.replace("_", " ")}</em>
              </button>
            ))
          ) : (
            <div className="empty-state compact">No history yet.</div>
          )}
        </div>
      </section>

      <section className="side-card details-card">
        <header className="panel-header compact">
          <h2>Event Details</h2>
        </header>
        {selectedEvent ? <EventDetails event={selectedEvent} /> : <div className="empty-state compact">Select an event to view details.</div>}
      </section>
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
