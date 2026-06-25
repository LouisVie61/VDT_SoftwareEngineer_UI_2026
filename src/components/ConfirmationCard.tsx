import { Check, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import type { SearchConfirmation, SearchIntent, SearchStatus } from "../types";

interface ConfirmationCardProps {
  confirmation: SearchConfirmation | null | undefined;
  status: SearchStatus;
  onConfirm: (intent: SearchIntent) => void;
}

const GROUPABLE_FIELDS = ["source", "severity", "event_type", "action", "user", "host", "ip"];
const FILTER_LABELS: Record<string, string> = {
  from: "From",
  to: "To",
  severity: "Severity",
  eventType: "Event type",
  user: "User",
  host: "Host",
  ip: "IP",
};

export function ConfirmationCard({ confirmation, status, onConfirm }: ConfirmationCardProps) {
  const [intent, setIntent] = useState<SearchIntent | null>(null);

  useEffect(() => {
    setIntent(
      confirmation?.intent
        ? {
            ...confirmation.intent,
            topN: confirmation.intent.topN ?? confirmation.templateSelection.size ?? 100,
            filters: { ...(confirmation.intent.filters || {}) },
          }
        : null
    );
  }, [confirmation]);

  if (!confirmation || !intent) {
    return null;
  }

  const update = <K extends keyof SearchIntent>(field: K, value: SearchIntent[K]) => {
    setIntent((current) => (current ? { ...current, [field]: value } : current));
  };
  const requestFilters = Object.entries(confirmation.requestFilters || {}).filter(([, value]) => value?.trim());

  return (
    <section className="confirmation-card">
      <header>
        <span className="confirmation-icon">
          <ShieldAlert size={18} />
        </span>
        <div>
          <h2>Confirm query intent</h2>
          <p>{confirmation.templateSelection.type.replace("_", " ").toLowerCase()}</p>
        </div>
      </header>
      <div className="confirmation-grid">
        <div className="confirmation-readonly-field">
          <span>Template</span>
          <strong>{confirmation.templateSelection.type.replace("_", " ")}</strong>
        </div>
        <label className="group-by-field">
          <span>Group by</span>
          <select value={intent.groupBy || ""} onChange={(event) => update("groupBy", event.target.value || null)}>
            <option value="">None</option>
            {GROUPABLE_FIELDS.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Top N</span>
          <input
            type="number"
            min={0}
            max={100}
            value={intent.topN ?? 100}
            onChange={(event) => {
              const nextTopN = Number(event.target.value);
              update("topN", Number.isFinite(nextTopN) && nextTopN >= 0 ? Math.min(nextTopN, 100) : 0);
            }}
          />
        </label>
      </div>
      {requestFilters.length ? (
        <div className="request-filter-list" aria-label="Applied request filters">
          {requestFilters.map(([key, value]) => (
            <span key={key}>
              {FILTER_LABELS[key] || key}: {value}
            </span>
          ))}
        </div>
      ) : null}
      {confirmation.warnings?.length ? (
        <ul className="confirmation-warnings">
          {confirmation.warnings.map((warning) => (
            <li key={warning.code}>{warning.message}</li>
          ))}
        </ul>
      ) : null}
      <footer>
        <button className="primary-button" type="button" disabled={status === "loading"} onClick={() => onConfirm(intent)}>
          <Check size={16} />
          Confirm
        </button>
      </footer>
    </section>
  );
}
