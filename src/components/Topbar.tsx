import { HelpCircle, Moon, Sun, UserRound } from "lucide-react";
import type { Theme } from "../types";

interface TopbarProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export function Topbar({ theme, onToggleTheme }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-system-status">
        <span className="dot" />
        <span>
          <small>System Status</small>
          Operational
        </span>
      </div>
      <div className="topbar-spacer" />
      <div className="provider-status">
        <span className="dot" />
        <span>
          <small>Engine</small>
          Elasticsearch
        </span>
      </div>
      <div className="provider-status">
        <span className="dot" />
        <span>
          <small>LLM Provider</small>
          Gemini + Groq
        </span>
      </div>
      <button className="icon-button" type="button" onClick={onToggleTheme} aria-label="Toggle theme">
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <button className="icon-button" type="button" aria-label="Help">
        <HelpCircle size={18} />
      </button>
      <button className="icon-button" type="button" aria-label="User menu">
        <UserRound size={18} />
      </button>
    </header>
  );
}
