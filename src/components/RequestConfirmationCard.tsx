import { Check, SearchCheck, X } from "lucide-react";
import type { SearchFilters } from "../types";

interface RequestConfirmationCardProps {
  question: string;
  filters: SearchFilters;
  pageSize: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const FILTER_LABELS: Partial<Record<keyof SearchFilters, string>> = {
  from: "From",
  to: "To",
  severity: "Severity",
  eventType: "Event type",
  user: "User",
  host: "Host",
  ip: "IP",
};

export function RequestConfirmationCard({ question, filters, pageSize, onConfirm, onCancel }: RequestConfirmationCardProps) {
  const activeFilters = Object.entries(filters).filter(([, value]) => typeof value === "string" && value.trim());

  return (
    <section className="confirmation-card request-confirmation-card">
      <header>
        <span className="confirmation-icon">
          <SearchCheck size={18} />
        </span>
        <div>
          <h2>Confirm request</h2>
          <p>Review the search request before it is sent.</p>
        </div>
      </header>
      <div className="confirmation-grid request-confirmation-grid">
        <div className="confirmation-readonly-field request-question-field">
          <span>Question</span>
          <strong>{question}</strong>
        </div>
        <div className="confirmation-readonly-field">
          <span>Page size</span>
          <strong>{pageSize}</strong>
        </div>
        <div className="confirmation-readonly-field">
          <span>Filters</span>
          <strong>{activeFilters.length ? `${activeFilters.length} active` : "None"}</strong>
        </div>
      </div>
      {activeFilters.length ? (
        <div className="request-filter-list" aria-label="Request filters">
          {activeFilters.map(([key, value]) => (
            <span key={key}>
              {(FILTER_LABELS[key as keyof SearchFilters] || key)}: {value}
            </span>
          ))}
        </div>
      ) : null}
      <footer>
        <button className="secondary-button" type="button" onClick={onCancel}>
          <X size={16} />
          Cancel
        </button>
        <button className="primary-button" type="button" onClick={onConfirm}>
          <Check size={16} />
          Confirm and run
        </button>
      </footer>
    </section>
  );
}
