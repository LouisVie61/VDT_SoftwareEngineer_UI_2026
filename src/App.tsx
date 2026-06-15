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
import type { AggregationRow, EventRow, QueryHistoryItem, SearchResponse, Theme } from "./types";

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
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
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
    const startedAt = performance.now();

    try {
      const data = await searchEvents({ question: trimmed, page: 0, pageSize: 5000 });
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
              isLoading={status === "loading"}
              onQuestionChange={setQuestion}
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
                <DslPanel dsl={response?.generatedDsl || emptyDsl} />
              </div>
              <div className="right-stack">
                <ChartPanel
                  aggregations={aggregations}
                  results={results}
                  chartType={chartType}
                  onExport={handleExport}
                />
                <ResultList
                  results={results}
                  totalCount={response?.totalCount || results.length}
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

function normalizeResults(value: SearchResponse["results"] | undefined): EventRow[] {
  return Array.isArray(value) ? (value as EventRow[]) : [];
}

function normalizeAggregations(value: SearchResponse["aggregations"] | undefined): AggregationRow[] {
  return Array.isArray(value) ? (value as AggregationRow[]) : [];
}
