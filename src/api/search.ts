import type { IngestResponse, QueryHistoryItem, SearchRequest, SearchResponse } from "../types";
import { apiRequest } from "./client";

const DEFAULT_USER_ID = "soc-analyst-demo";

export function searchEvents(payload: SearchRequest): Promise<SearchResponse> {
  return apiRequest<SearchResponse>("/api/search", {
    method: "POST",
    body: JSON.stringify({
      page: 0,
      pageSize: 10000,
      ...payload,
    }),
  });
}

export function getSearchHistory(limit = 20, userId = DEFAULT_USER_ID): Promise<QueryHistoryItem[]> {
  const params = new URLSearchParams({
    userId,
    limit: String(limit),
  });

  return apiRequest<QueryHistoryItem[]>(`/api/search/history?${params.toString()}`);
}

export async function exportSearchCsv(queryId: string): Promise<void> {
  if (!queryId) {
    throw new Error("Run a search before exporting CSV.");
  }

  const response = await fetch(`/api/search/${queryId}/export.csv`);
  if (!response.ok) {
    throw new Error(`CSV export failed with status ${response.status}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `query-${queryId}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function importEventFile(file: File): Promise<IngestResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<IngestResponse>("/api/events/import-file", {
    method: "POST",
    body: formData,
  });
}
