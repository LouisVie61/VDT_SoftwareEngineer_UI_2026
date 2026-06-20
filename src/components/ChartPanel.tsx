import { Download, Loader2, Maximize2, Minimize2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AggregationRow, ChartType, EventRow, SearchStatus } from "../types";
import { chartLabel, formatDateTime } from "../utils/format";

const COLORS = ["#4f6bff", "#7c3aed", "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444"];

interface ChartPanelProps {
  aggregations: AggregationRow[];
  results: EventRow[];
  chartType: ChartType;
  status: SearchStatus;
  expanded: boolean;
  onExport: () => void;
  onExpandedChange: (expanded: boolean) => void;
}

export function ChartPanel({ aggregations, results, chartType, status, expanded, onExport, onExpandedChange }: ChartPanelProps) {
  const renderPanel = (isExpanded: boolean) => {
    const visibleBuckets = isExpanded ? aggregations : aggregations.slice(0, 10);
    const data = visibleBuckets
    .map((row) => ({
      name: String(row.key ?? row.value_as_string ?? row.aggregation ?? "unknown"),
      count: Number(row.count ?? row.value ?? 0),
    }))
    .filter((row) => Number.isFinite(row.count));
    const hasChart = chartType !== "table" && data.length > 0;
    const bucketLabel = aggregations.length > visibleBuckets.length ? `${visibleBuckets.length} of ${aggregations.length} buckets` : `${visibleBuckets.length} buckets`;

    return (
      <section className={`chart-panel ${isExpanded ? "chart-panel-expanded" : ""}`}>
      <header className="panel-header">
        <div className="panel-title-stack">
          <h2>{chartLabel(chartType)}</h2>
          <span>{bucketLabel}</span>
        </div>
        <div className="panel-actions">
          <button className="secondary-button compact" type="button" onClick={() => onExpandedChange(!isExpanded)} disabled={status === "loading"}>
            {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            {isExpanded ? "Collapse" : "Expand"}
          </button>
          <button className="secondary-button compact" type="button" onClick={onExport} disabled={status === "loading"}>
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </header>

      {status === "loading" ? (
        <LoadingChart />
      ) : chartType === "table" ? (
        <div className="table-wrap">
          {visibleBuckets.length ? <AggregationTable rows={visibleBuckets} /> : <EventTable rows={results} />}
        </div>
      ) : (
        <div className="chart-area">
          <h3>{chartLabel(chartType)} from aggregations</h3>
          {hasChart ? <ChartRenderer chartType={chartType} data={data} height={isExpanded ? 460 : 210} /> : <EmptyChart chartType={chartType} />}
        </div>
      )}
    </section>
    );
  };

  return (
    <>
      {renderPanel(false)}
      {expanded ? <div className="chart-expand-overlay">{renderPanel(true)}</div> : null}
    </>
  );
}

function LoadingChart() {
  return (
    <div className="chart-area loading-state">
      <Loader2 className="spin" size={22} />
      <strong>Running query</strong>
      <span>Waiting for Elasticsearch results and aggregation buckets...</span>
    </div>
  );
}

function ChartRenderer({ chartType, data, height }: { chartType: ChartType; data: Array<{ name: string; count: number }>; height: number }) {
  const chartData = chartType === "line_chart" ? [...data].sort((a, b) => Date.parse(a.name) - Date.parse(b.name)) : data;

  if (chartType === "pie_chart") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={chartData} dataKey="count" nameKey="name" outerRadius={74} label>
            {chartData.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === "line_chart") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" minTickGap={18} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#4f6bff" strokeWidth={3} dot />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" minTickGap={14} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function AggregationTable({ rows }: { rows: AggregationRow[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Aggregation</th>
          <th>Key</th>
          <th>Count / Value</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={`${row.aggregation || "agg"}-${String(row.key || index)}`}>
            <td>{row.aggregation || "-"}</td>
            <td>{String(row.key ?? row.value_as_string ?? "-")}</td>
            <td>{String(row.count ?? row.value ?? "-")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EventTable({ rows }: { rows: EventRow[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Host</th>
          <th>User</th>
          <th>IP</th>
          <th>Type</th>
          <th>Severity</th>
        </tr>
      </thead>
      <tbody>
        {rows.length ? (
          rows.map((row, index) => (
            <tr key={String(row.id || index)}>
              <td>{formatDateTime(row.timestamp)}</td>
              <td>{row.host || "-"}</td>
              <td>{row.user || "-"}</td>
              <td>{row.ip || row.src_ip || "-"}</td>
              <td>{row.event_type || "-"}</td>
              <td>{row.severity || "-"}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={6}>Run a search to populate table results.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function EmptyChart({ chartType }: { chartType: ChartType }) {
  return <div className="empty-state">No aggregation buckets returned for this {chartLabel(chartType).toLowerCase()} query.</div>;
}
