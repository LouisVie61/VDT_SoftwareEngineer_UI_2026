import { Check, Clipboard } from "lucide-react";
import { useState } from "react";
import { safeJson } from "../utils/format";

interface DslPanelProps {
  dsl: unknown;
}

export function DslPanel({ dsl }: DslPanelProps) {
  const [copied, setCopied] = useState(false);
  const text = safeJson(dsl);

  async function copyDsl() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <section className="dsl-panel">
      <header className="panel-header">
        <h2>Generated Elasticsearch DSL</h2>
        <button className="secondary-button" type="button" onClick={copyDsl}>
          {copied ? <Check size={16} /> : <Clipboard size={16} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </header>
      <pre>{text}</pre>
      <footer>
        <span>Elasticsearch DSL</span>
        <strong>Valid</strong>
      </footer>
    </section>
  );
}
