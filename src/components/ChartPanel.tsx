import { Download, Table2, BarChart3 } from "lucide-react";
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
import type { AggregationRow, ChartType, EventRow } from "../types";
import { chartLabel } from "../utils/format";

const COLORS = ["#4f6bff", "#7c3aed", "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444"];

interface ChartPanelProps {
  activeTab: "chart" | "table";
  aggregations: AggregationRow[];
  results: EventRow[];
  chartType: ChartType;
  onTabChange: (tab: "chart" | "table") => void;
  onExport: () => void;
}

export function ChartPanel({ activeTab, aggregations, results, chartType, onTabChange, onExport }: ChartPanelProps) {
  const data = aggregations.map((row) => ({
    name: String(row.key ?? "unknown"),
    count: Number(row.count || 0),
  }));

  return (
    <section className="chart-panel">
      <header className="panel-header with-tabs">
        <div className="tabs">
          <button className={activeTab === "chart" ? "active" : ""} type="button" onClick={() => onTabChange("chart")}>
            <BarChart3 size={16} />
            Chart
          </button>
          <button className={activeTab === "table" ? "active" : ""} type="button" onClick={() => onTabChange("table")}>
            <Table2 size={16} />
            Table
          </button>
        </div>
        <button className="secondary-button" type="button" onClick={onExport}>
          <Download size={16} />
          Export CSV
        </button>
      </header>

      {activeTab === "chart" ? (
        <div className="chart-area">
          <h3>{chartLabel(chartType)} from aggregations</h3>
          {data.length ? <ChartRenderer chartType={chartType} data={data} /> : <EmptyChart />}
        </div>
      ) : (
        <div className="table-wrap">
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
              {results.length ? (
                results.slice(0, 12).map((row, index) => (
                  <tr key={String(row.id || index)}>
                    <td>{row.timestamp || "-"}</td>
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
        </div>
      )}
    </section>
  );
}

function ChartRenderer({ chartType, data }: { chartType: ChartType; data: Array<{ name: string; count: number }> }) {
  if (chartType === "pie_chart") {
    return (
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="name" outerRadius={95} label>
            {data.map((entry, index) => (
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
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#4f6bff" strokeWidth={3} dot />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyChart() {
  return <div className="empty-state">No aggregation buckets returned for this query.</div>;
}
