export type ChartType = "table" | "line_chart" | "bar_chart" | "pie_chart";

export type Theme = "dark" | "light";

export type SearchStatus = "idle" | "loading" | "success" | "error";

export interface SearchRequest {
  question: string;
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
  severity?: string;
  eventType?: string;
  user?: string;
  host?: string;
  ip?: string;
}

export type SearchFilters = Omit<SearchRequest, "question" | "page" | "pageSize">;

export interface EventRow {
  id?: string | null;
  timestamp?: string | null;
  source?: string | null;
  severity?: string | null;
  event_type?: string | null;
  user?: string | null;
  host?: string | null;
  ip?: string | null;
  src_ip?: string | null;
  dst_ip?: string | null;
  action?: string | null;
  message?: string | null;
  raw?: string | null;
  [key: string]: unknown;
}

export interface AggregationRow {
  aggregation?: string;
  key?: string | number | null;
  count?: number;
  [key: string]: unknown;
}

export interface SearchResponse {
  id: string;
  nlQuery: string;
  generatedDsl: unknown;
  summary: string;
  results: EventRow[] | unknown;
  aggregations: AggregationRow[] | unknown;
  totalCount: number;
  chartType: ChartType;
  page: number | null;
  pageSize: number | null;
}

export interface QueryHistoryItem {
  id: string;
  userIdentity: string;
  nlQuery: string;
  generatedDsl: string;
  summary: string;
  chartType: ChartType;
  totalCount: number;
  createdAt: string;
}

export interface IngestResponse {
  totalRows: number;
  indexedRows: number;
  failedRows: number;
  indexName: string;
  durationMs: number;
}
