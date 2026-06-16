import { Check, Clipboard, Loader2 } from "lucide-react";
import { useState } from "react";
import type { SearchStatus } from "../types";
import { safeJson } from "../utils/format";

interface DslPanelProps {
  dsl: unknown;
  status: SearchStatus;
}

export function DslPanel({ dsl, status }: DslPanelProps) {
  const [copied, setCopied] = useState(false);
  const isLoading = status === "loading";
  const text = isLoading ? "Generating Elasticsearch DSL from your question..." : safeJson(dsl);
  const validationLabel = isLoading ? "Generating" : status === "error" ? "Failed" : status === "success" ? "Valid" : "Waiting";

  async function copyDsl() {
    if (isLoading) {
      return;
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <section className="dsl-panel">
      <header className="panel-header">
        <h2>Generated Elasticsearch DSL</h2>
        <button className="secondary-button" type="button" onClick={copyDsl} disabled={isLoading}>
          {copied ? <Check size={16} /> : <Clipboard size={16} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </header>
      <pre>{text}</pre>
      <footer>
        <span>Elasticsearch DSL</span>
        <strong className={`dsl-status dsl-status-${status}`}>
          {isLoading ? <Loader2 className="spin" size={14} /> : null}
          {validationLabel}
        </strong>
      </footer>
    </section>
  );
}
