import { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { exportSearchCsv, getSearchHistory, searchEvents } from "./api/search";
import { ChartPanel } from "./components/ChartPanel";
import { DslPanel } from "./components/DslPanel";
import { MetricCards } from "./components/MetricCards";
import { ResultList } from "./components/ResultList";
import { RightPanel } from "./components/RightPanel";
import { SearchHero } from "./components/SearchHero";
import { Sidebar } from "./components/Sidebar";
import { SummaryPanel } from "./components/SummaryPanel";
import { Topbar } from "./components/Topbar";
import { emptyDsl } from "./data/examples";
import type { AggregationRow, EventRow, QueryHistoryItem, SearchFilters, SearchRequest, SearchResponse, SearchStatus, Theme } from "./types";

const DEFAULT_QUERY = "Đếm số lần login thất bại theo từng user trong 7 ngày qua";

function getInitialTheme(): Theme {
  const saved = localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") {
    return saved;
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [question, setQuestion] = useState(DEFAULT_QUERY);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    void refreshHistory();
  }, []);

  const results = useMemo(() => normalizeResults(response?.results), [response]);
  const aggregations = useMemo(() => normalizeAggregations(response?.aggregations), [response]);
  const chartType = response?.chartType || "table";

  useEffect(() => {
    setSelectedEvent(results[0] || null);
  }, [results]);

  async function refreshHistory() {
    try {
      const items = await getSearchHistory();
      setHistory(items);
    } catch {
      setHistory([]);
    }
  }

  async function runSearch() {
    const trimmed = question.trim();
    if (!trimmed) {
      return;
    }

    setStatus("loading");
    setError(null);
    setResponse(null);
    setSelectedEvent(null);
    setElapsedMs(null);
    const startedAt = performance.now();

    try {
      const data = await searchEvents({ question: trimmed, page: 0, pageSize: 10000, ...activeFilters(filters) });
      setResponse(data);
      setElapsedMs(performance.now() - startedAt);
      setStatus("success");
      await refreshHistory();
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Search failed.");
      setElapsedMs(performance.now() - startedAt);
      setStatus("error");
    }
  }

  async function handleExport() {
    try {
      if (!response?.id) {
        throw new Error("Run a search before exporting CSV.");
      }
      await exportSearchCsv(response.id);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "CSV export failed.");
    }
  }

  return (
    <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((current) => !current)} />
      <div className="app-content">
        <Topbar
          theme={theme}
          onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
        />
        <main className="dashboard">
          <section className="main-column">
            <SearchHero
              question={question}
              filters={filters}
              isLoading={status === "loading"}
              onQuestionChange={setQuestion}
              onFiltersChange={setFilters}
              onResetFilters={() => setFilters({})}
              onSubmit={runSearch}
              onClear={() => setQuestion("")}
            />
            {error ? (
              <div className="error-banner">
                <AlertCircle size={18} />
                {error}
              </div>
            ) : null}
            <MetricCards totalCount={response?.totalCount || 0} elapsedMs={elapsedMs} chartType={chartType} status={status} />
            <div className="workbench-grid">
              <div className="left-stack">
                <SummaryPanel summary={response?.summary || ""} />
                <DslPanel dsl={response?.generatedDsl || emptyDsl} status={status} />
              </div>
              <div className="right-stack">
                <ChartPanel
                  aggregations={aggregations}
                  results={results}
                  chartType={chartType}
                  status={status}
                  onExport={handleExport}
                />
                <ResultList
                  results={results}
                  aggregations={aggregations}
                  totalCount={response?.totalCount || results.length}
                  status={status}
                  selectedId={selectedEvent?.id ? String(selectedEvent.id) : null}
                  onSelect={setSelectedEvent}
                />
              </div>
            </div>
          </section>
          <RightPanel history={history} selectedEvent={selectedEvent} onHistoryClick={setQuestion} />
        </main>
      </div>
    </div>
  );
}

function activeFilters(filters: SearchFilters): Partial<SearchRequest> {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => typeof value === "string" && value.trim())
  ) as Partial<SearchRequest>;
}

function normalizeResults(value: SearchResponse["results"] | undefined): EventRow[] {
  if (Array.isArray(value)) {
    return value as EventRow[];
  }

  if (value && typeof value === "object") {
    const maybeWrapped = value as { results?: unknown; hits?: { hits?: unknown } };
    if (Array.isArray(maybeWrapped.results)) {
      return maybeWrapped.results as EventRow[];
    }
    if (Array.isArray(maybeWrapped.hits?.hits)) {
      return maybeWrapped.hits.hits.map((hit) => {
        if (hit && typeof hit === "object" && "_source" in hit) {
          const source = (hit as { _source?: EventRow })._source || {};
          return { id: (hit as { _id?: string })._id, ...source };
        }
        return hit as EventRow;
      });
    }
  }

  return [];
}

function normalizeAggregations(value: SearchResponse["aggregations"] | undefined): AggregationRow[] {
  if (Array.isArray(value)) {
    return value as AggregationRow[];
  }

  if (value && typeof value === "object") {
    const maybeWrapped = value as { aggregations?: unknown };
    if (Array.isArray(maybeWrapped.aggregations)) {
      return maybeWrapped.aggregations as AggregationRow[];
    }
  }

  return [];
}
