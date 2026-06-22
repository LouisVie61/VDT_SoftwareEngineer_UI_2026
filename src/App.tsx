import { useEffect, useMemo, useRef, useState } from "react";
import { confirmSearch, exportSearchCsv, getSearchHistory, getSearchSummary, searchEvents } from "./api/search";
import { ChartPanel } from "./components/ChartPanel";
import { ConfirmationCard } from "./components/ConfirmationCard";
import { DslPanel } from "./components/DslPanel";
import { MetricCards } from "./components/MetricCards";
import { ResultList } from "./components/ResultList";
import { RightPanel } from "./components/RightPanel";
import { RequestConfirmationCard } from "./components/RequestConfirmationCard";
import { SearchHero } from "./components/SearchHero";
import { Sidebar } from "./components/Sidebar";
import { SummaryPanel } from "./components/SummaryPanel";
import { ToastStack, type ToastMessage } from "./components/ToastStack";
import { Topbar } from "./components/Topbar";
import { emptyDsl } from "./data/examples";
import type {
  AggregationRow,
  EventRow,
  QueryHistoryItem,
  SearchFilters,
  SearchIntent,
  SearchRequest,
  SearchResponse,
  SearchStatus,
  Theme,
} from "./types";

const DEFAULT_QUERY = "";
const SESSION_STORAGE_KEY = "soc-search-session-id";
const DEFAULT_PAGE_SIZE = 50;

interface ConfirmedSearchContext {
  confirmationId: string;
  editedIntent: SearchIntent;
}

interface PendingSearchRequest {
  question: string;
  filters: SearchFilters;
  page: number;
  pageSize: number;
}

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
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [dslVisible, setDslVisible] = useState(false);
  const [chartExpanded, setChartExpanded] = useState(false);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState(getSessionId);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [confirmedSearch, setConfirmedSearch] = useState<ConfirmedSearchContext | null>(null);
  const [pendingSearch, setPendingSearch] = useState<PendingSearchRequest | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const filterRerunTimer = useRef<number | null>(null);

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
  const showRunBar = status !== "idle" || Boolean(response) || elapsedMs !== null;
  const warningText = response?.warnings?.map((warning) => warning.message).filter(Boolean).join(" ") || "";

  useEffect(() => {
    if (error) {
      pushToast("error", "Request failed", error);
    }
  }, [error]);

  useEffect(() => {
    if (warningText) {
      pushToast("warning", "Warning", warningText);
    }
  }, [warningText]);

  useEffect(() => {
    if (!response || status !== "success" || pendingSearch) {
      return;
    }
    if (filterRerunTimer.current) {
      window.clearTimeout(filterRerunTimer.current);
    }
    filterRerunTimer.current = window.setTimeout(() => {
      void runSearch(0, pageSize, question, filters);
    }, 500);
    return () => {
      if (filterRerunTimer.current) {
        window.clearTimeout(filterRerunTimer.current);
      }
    };
  }, [filters]);

  useEffect(() => {
    if (!response?.id || response.summaryStatus !== "PENDING") {
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const pollSummary = async () => {
      attempts += 1;
      try {
        const summary = await getSearchSummary(response.id);
        if (cancelled) {
          return;
        }
        setResponse((current) => {
          if (!current || current.id !== response.id) {
            return current;
          }
          return {
            ...current,
            summary: summary.summary,
            summaryStatus: summary.status,
            chartType: summary.chartType || current.chartType,
          };
        });
        if (summary.status === "PENDING" && attempts < 12) {
          window.setTimeout(pollSummary, 1000);
        }
      } catch {
        if (!cancelled && attempts < 3) {
          window.setTimeout(pollSummary, 1000);
        }
      }
    };

    const timer = window.setTimeout(pollSummary, 600);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [response?.id, response?.summaryStatus]);

  function pushToast(type: ToastMessage["type"], title: string, message: string) {
    const toast: ToastMessage = {
      id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type,
      title,
      message,
    };
    setToasts((current) => [...current.slice(-3), toast]);
  }

  async function refreshHistory() {
    try {
      const items = await getSearchHistory();
      setHistory(items);
    } catch {
      setHistory([]);
    }
  }

  function requestSearch(nextPage = 0, nextPageSize = pageSize, queryOverride?: string) {
    const trimmed = (queryOverride ?? question).trim();
    if (!trimmed) {
      return;
    }

    setPendingSearch({
      question: trimmed,
      filters: { ...filters },
      page: nextPage,
      pageSize: nextPageSize,
    });
    setError(null);
  }

  async function runSearch(nextPage = 0, nextPageSize = pageSize, queryOverride?: string, filtersOverride = filters) {
    const trimmed = (queryOverride ?? question).trim();
    if (!trimmed) {
      return;
    }

    setPendingSearch(null);
    setPage(nextPage);
    setPageSize(nextPageSize);
    setConfirmedSearch(null);
    setStatus("loading");
    setError(null);
    setResponse(null);
    setSelectedEvent(null);
    setElapsedMs(null);
    const startedAt = performance.now();

    try {
      const data = await searchEvents({ question: trimmed, page: nextPage, pageSize: nextPageSize, sessionId, ...activeFilters(filtersOverride) });
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

  function handleHistoryClick(historyQuestion: string) {
    setQuestion(historyQuestion);
    requestSearch(0, pageSize, historyQuestion);
  }

  function handleFiltersChange(nextFilters: SearchFilters) {
    setFilters(nextFilters);
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

  async function handleConfirm(editedIntent: SearchIntent) {
    if (!response?.confirmation?.confirmationId) {
      return;
    }

    await runConfirmedSearch(
      {
        confirmationId: response.confirmation.confirmationId,
        editedIntent,
      },
      0,
      pageSize
    );
  }

  async function runConfirmedSearch(context: ConfirmedSearchContext, nextPage = 0, nextPageSize = pageSize) {
    setPage(nextPage);
    setPageSize(nextPageSize);
    setConfirmedSearch(context);
    setStatus("loading");
    setError(null);
    setElapsedMs(null);
    setSelectedEvent(null);
    const startedAt = performance.now();

    try {
      const data = await confirmSearch({
        confirmationId: context.confirmationId,
        sessionId,
        editedIntent: context.editedIntent,
        page: nextPage,
        pageSize: nextPageSize,
      });
      setResponse(data);
      setElapsedMs(performance.now() - startedAt);
      setStatus("success");
      await refreshHistory();
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : "Confirmation failed.");
      setElapsedMs(performance.now() - startedAt);
      setStatus("error");
    }
  }

  function handleNewSession() {
    const next = crypto.randomUUID();
    localStorage.setItem(SESSION_STORAGE_KEY, next);
    setSessionId(next);
    setResponse(null);
    setSelectedEvent(null);
    setError(null);
    setElapsedMs(null);
    setPage(0);
    setPageSize(DEFAULT_PAGE_SIZE);
    setConfirmedSearch(null);
    setPendingSearch(null);
    setStatus("idle");
  }

  function handleResultPageChange(nextPage: number) {
    if (confirmedSearch) {
      void runConfirmedSearch(confirmedSearch, nextPage, pageSize);
      return;
    }
    void runSearch(nextPage, pageSize);
  }

  function handleResultPageSizeChange(nextPageSize: number) {
    if (confirmedSearch) {
      void runConfirmedSearch(confirmedSearch, 0, nextPageSize);
      return;
    }
    if (response) {
      void runSearch(0, nextPageSize);
      return;
    }
    setPage(0);
    setPageSize(nextPageSize);
  }

  return (
    <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((current) => !current)} />
      <div className="app-content">
        <Topbar
          theme={theme}
          onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          onNewSession={handleNewSession}
        />
        <main className={`dashboard ${rightPanelCollapsed ? "right-panel-collapsed" : ""}`}>
          <section className="main-column">
            <SearchHero
              question={question}
              filters={filters}
              isLoading={status === "loading"}
              filtersCollapsed={filtersCollapsed}
              onQuestionChange={setQuestion}
              onFiltersChange={handleFiltersChange}
              onResetFilters={() => setFilters({})}
              onToggleFilters={() => setFiltersCollapsed((current) => !current)}
              onSubmit={() => requestSearch(0, pageSize)}
              onClear={() => setQuestion("")}
            />
            {pendingSearch ? (
              <RequestConfirmationCard
                question={pendingSearch.question}
                filters={pendingSearch.filters}
                pageSize={pendingSearch.pageSize}
                onCancel={() => setPendingSearch(null)}
                onConfirm={() => void runSearch(pendingSearch.page, pendingSearch.pageSize, pendingSearch.question, pendingSearch.filters)}
              />
            ) : null}
            <ConfirmationCard confirmation={response?.confirmation} status={status} onConfirm={handleConfirm} />
            {showRunBar ? (
              <MetricCards
                totalCount={response?.totalCount || 0}
                elapsedMs={elapsedMs}
                chartType={chartType}
                status={status}
                dslVisible={dslVisible}
                onToggleDsl={() => setDslVisible((current) => !current)}
                onExport={handleExport}
                onRerun={() => requestSearch(0, pageSize)}
              />
            ) : null}
            <div className="workbench-grid">
              <div className={`left-stack ${dslVisible ? "" : "dsl-hidden"}`}>
                <SummaryPanel
                  summary={response?.summary}
                  summaryStatus={response?.summaryStatus}
                  hasResponse={Boolean(response)}
                  isLoading={status === "loading"}
                />
                {dslVisible ? <DslPanel dsl={response?.generatedDsl || emptyDsl} status={status} /> : null}
              </div>
              <div className="right-stack">
                <ChartPanel
                  aggregations={aggregations}
                  results={results}
                  chartType={chartType}
                  status={status}
                  expanded={chartExpanded}
                  onExport={handleExport}
                  onExpandedChange={setChartExpanded}
                />
                <ResultList
                  results={results}
                  aggregations={aggregations}
                  totalCount={response?.totalCount || results.length}
                  status={status}
                  page={page}
                  pageSize={pageSize}
                  selectedId={selectedEvent?.id ? String(selectedEvent.id) : null}
                  onSelect={setSelectedEvent}
                  onPageChange={handleResultPageChange}
                  onPageSizeChange={handleResultPageSizeChange}
                />
              </div>
            </div>
          </section>
          <RightPanel
            history={history}
            selectedEvent={selectedEvent}
            collapsed={rightPanelCollapsed}
            onToggleCollapsed={() => setRightPanelCollapsed((current) => !current)}
            onHistoryClick={handleHistoryClick}
          />
        </main>
      </div>
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
    </div>
  );
}

function activeFilters(filters: SearchFilters): Partial<SearchRequest> {
  return Object.fromEntries(
    Object.entries(filters)
      .filter(([, value]) => typeof value === "string" && value.trim())
      .map(([key, value]) => {
        const normalized = String(value).trim();
        return [key, key === "severity" || key === "eventType" ? normalized.toLowerCase() : normalized];
      })
  ) as Partial<SearchRequest>;
}

function getSessionId(): string {
  const saved = localStorage.getItem(SESSION_STORAGE_KEY);
  if (saved) {
    return saved;
  }
  const next = crypto.randomUUID();
  localStorage.setItem(SESSION_STORAGE_KEY, next);
  return next;
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
