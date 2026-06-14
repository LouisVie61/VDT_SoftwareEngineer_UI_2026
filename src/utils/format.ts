import type { ChartType } from "../types";

export function formatNumber(value: number | null | undefined): string {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

export function formatDuration(ms: number | null | undefined): string {
  if (ms == null) {
    return "-";
  }
  if (ms < 1000) {
    return `${Math.round(ms)} ms`;
  }
  return `${(ms / 1000).toFixed(1)} s`;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export function chartLabel(chartType: ChartType | undefined): string {
  const labels: Record<ChartType, string> = {
    table: "Table",
    line_chart: "Line Chart",
    bar_chart: "Bar Chart",
    pie_chart: "Pie Chart",
  };
  return labels[chartType || "table"];
}

export function severityLabel(severity: unknown): string {
  return String(severity || "low").toLowerCase();
}

export function safeJson(value: unknown): string {
  if (!value) {
    return "{}";
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
