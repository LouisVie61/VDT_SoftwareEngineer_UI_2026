import { ChevronDown, ChevronRight, Loader2, Play, Search, SlidersHorizontal, X } from "lucide-react";
import type { SearchFilters } from "../types";

interface SearchHeroProps {
  question: string;
  filters: SearchFilters;
  isLoading: boolean;
  filtersCollapsed: boolean;
  onQuestionChange: (question: string) => void;
  onFiltersChange: (filters: SearchFilters) => void;
  onResetFilters: () => void;
  onToggleFilters: () => void;
  onSubmit: () => void;
  onClear: () => void;
}

export function SearchHero({
  question,
  filters,
  isLoading,
  filtersCollapsed,
  onQuestionChange,
  onFiltersChange,
  onResetFilters,
  onToggleFilters,
  onSubmit,
  onClear,
}: SearchHeroProps) {
  const updateFilter = (field: keyof SearchFilters, value: string) => {
    onFiltersChange({ ...filters, [field]: value || undefined });
  };
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const activeFilters = Object.entries(filters).filter(([, value]) => typeof value === "string" && value.trim());

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
          placeholder="Nhập câu hỏi tìm kiếm..."
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
      <div className={`filter-panel ${filtersCollapsed ? "collapsed" : ""}`}>
        <div className="filter-panel-header">
          <button
            className="secondary-button compact"
            type="button"
            onClick={onToggleFilters}
            aria-expanded={!filtersCollapsed}
            aria-controls="search-filters"
          >
            {filtersCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount ? <span className="filter-count">{activeFilterCount}</span> : null}
          </button>
          {activeFilterCount ? (
            <button className="secondary-button compact" type="button" onClick={onResetFilters}>
              Reset
            </button>
          ) : filtersCollapsed ? (
            <div className="filter-summary inline" id="search-filters" aria-label="Collapsed search filters">
              <span>No filters</span>
            </div>
          ) : null}
        </div>
        {filtersCollapsed ? (
          activeFilters.length ? (
          <div className="filter-summary" id="search-filters" aria-label="Collapsed search filters">
            {activeFilters.length ? (
              activeFilters.map(([key, value]) => (
                <span key={key}>
                  {key}: {value}
                </span>
              ))
            ) : (
              <span>No filters</span>
            )}
          </div>
          ) : null
        ) : (
          <div className="filter-grid" id="search-filters" aria-label="Basic search filters">
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
            <button className="secondary-button filter-reset" type="button" onClick={onResetFilters} disabled={!activeFilterCount}>
              Reset filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
