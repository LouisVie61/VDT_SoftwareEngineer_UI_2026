import { Loader2, Play, RotateCcw, Search, X } from "lucide-react";
import { exampleQueries } from "../data/examples";
import type { SearchFilters } from "../types";

interface SearchHeroProps {
  question: string;
  filters: SearchFilters;
  isLoading: boolean;
  onQuestionChange: (question: string) => void;
  onFiltersChange: (filters: SearchFilters) => void;
  onResetFilters: () => void;
  onSubmit: () => void;
  onClear: () => void;
}

export function SearchHero({
  question,
  filters,
  isLoading,
  onQuestionChange,
  onFiltersChange,
  onResetFilters,
  onSubmit,
  onClear,
}: SearchHeroProps) {
  const updateFilter = (field: keyof SearchFilters, value: string) => {
    onFiltersChange({ ...filters, [field]: value || undefined });
  };

  return (
    <section className="search-hero" id="search">
      <h1>Ask anything about your security events</h1>
      <p>Use natural language to search, analyze and investigate events.</p>
      <form
        className="search-box"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Search size={19} />
        <input
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          placeholder="Đếm số lần login thất bại theo từng user trong 7 ngày qua"
        />
        {question ? (
          <button className="ghost-icon" type="button" onClick={onClear} aria-label="Clear query">
            <X size={17} />
          </button>
        ) : null}
        <button className="primary-button search-submit" type="submit" disabled={isLoading || !question.trim()} aria-label="Run search">
          {isLoading ? <Loader2 className="spin" size={17} /> : <Play size={17} />}
        </button>
      </form>
      <div className="filter-grid" aria-label="Basic search filters">
        <label className="filter-field">
          <span>From</span>
          <input type="datetime-local" value={filters.from || ""} onChange={(event) => updateFilter("from", event.target.value)} />
        </label>
        <label className="filter-field">
          <span>To</span>
          <input type="datetime-local" value={filters.to || ""} onChange={(event) => updateFilter("to", event.target.value)} />
        </label>
        <label className="filter-field">
          <span>Severity</span>
          <select value={filters.severity || ""} onChange={(event) => updateFilter("severity", event.target.value)}>
            <option value="">Any</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Info</option>
          </select>
        </label>
        <label className="filter-field">
          <span>Event type</span>
          <input value={filters.eventType || ""} onChange={(event) => updateFilter("eventType", event.target.value)} placeholder="auth" />
        </label>
        <label className="filter-field">
          <span>User</span>
          <input value={filters.user || ""} onChange={(event) => updateFilter("user", event.target.value)} placeholder="alice" />
        </label>
        <label className="filter-field">
          <span>Host</span>
          <input value={filters.host || ""} onChange={(event) => updateFilter("host", event.target.value)} placeholder="host-1" />
        </label>
        <label className="filter-field">
          <span>IP</span>
          <input value={filters.ip || ""} onChange={(event) => updateFilter("ip", event.target.value)} placeholder="10.0.0.1" />
        </label>
        <button className="secondary-button filter-reset" type="button" onClick={onResetFilters} disabled={!Object.values(filters).some(Boolean)}>
          Reset filters
        </button>
      </div>
      <div className="examples">
        <span>Suggestions:</span>
        {exampleQueries.map((query) => (
          <button key={query} type="button" onClick={() => onQuestionChange(query)}>
            {query}
          </button>
        ))}
        <button className="round-chip" type="button" onClick={() => onQuestionChange(exampleQueries[0])}>
          <RotateCcw size={15} />
        </button>
      </div>
    </section>
  );
}
