export type ChartType = "table" | "line_chart" | "bar_chart" | "pie_chart";

export type Theme = "dark" | "light";

export type SearchStatus = "idle" | "loading" | "success" | "error";

export interface SearchRequest {
  question: string;
  page?: number;
  pageSize?: number;
  sessionId?: string;
  historySelectionId?: string;
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
  value?: number;
  value_as_string?: string;
  [key: string]: unknown;
}

export type TemplateType = "SIMPLE_SEARCH" | "TERMS_AGGREGATION" | "TIME_AGGREGATION";

export interface SearchIntent {
  intent: TemplateType;
  textQuery?: string | null;
  filters?: Record<string, string>;
  groupBy?: string | null;
  metric?: string | null;
  topN?: number | null;
  timeBucket?: string | null;
  overrideIntent?: string | null;
  overrideReason?: string | null;
}

export interface TemplateSelection {
  type: TemplateType;
  groupBy?: string | null;
  size: number;
  reason?: string | null;
}

export interface SearchWarning {
  code: string;
  message: string;
}

export interface SearchConfirmation {
  confirmationId: string;
  intent: SearchIntent;
  templateSelection: TemplateSelection;
  warnings: SearchWarning[];
  requestFilters?: Record<string, string> | null;
}

export interface ConfirmSearchRequest {
  confirmationId: string;
  sessionId?: string;
  editedIntent?: SearchIntent;
  page?: number;
  pageSize?: number;
}

export interface SearchResponse {
  id: string;
  nlQuery: string;
  generatedDsl: unknown;
  summary: string;
  summaryStatus?: string | null;
  results: EventRow[] | unknown;
  aggregations: AggregationRow[] | unknown;
  totalCount: number;
  chartType: ChartType;
  page: number | null;
  pageSize: number | null;
  needsConfirmation?: boolean;
  confirmation?: SearchConfirmation | null;
  warnings?: SearchWarning[] | null;
  selectedTemplate?: string | null;
}

export interface SummaryResponse {
  status: string;
  summary: string;
  chartType: ChartType;
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
  requestId: string;
  fileName: string;
  format: "jsonl" | "csv";
  bytesAccepted: number;
  status: "ACCEPTED" | string;
  submittedAt: string;
}
