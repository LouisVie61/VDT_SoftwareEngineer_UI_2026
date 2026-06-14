import {
  Bookmark,
  ChevronDown,
  History,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-icon">
          <ShieldCheck size={21} />
        </span>
        <span>AI Event Search</span>
      </div>

      <nav className="nav">
        <a className="nav-item active" href="#search">
          <Search size={18} />
          Search
        </a>
        <a className="nav-item" href="#history">
          <History size={18} />
          History
        </a>
        <a className="nav-item" href="#saved">
          <Bookmark size={18} />
          Saved Queries
        </a>
        <a className="nav-item" href="#playbooks">
          <SlidersHorizontal size={18} />
          Playbooks
          <span className="soon">Soon</span>
        </a>
        <a className="nav-item" href="#settings">
          <Settings size={18} />
          Settings
        </a>
      </nav>

      <div className="sidebar-spacer" />

      <section className="system-card">
        <p className="eyebrow success">System Status</p>
        <div className="status-row">
          <span className="dot" />
          <strong>AI System: Operational</strong>
        </div>
        <div className="system-line">
          <span>Elasticsearch</span>
          <strong>Healthy</strong>
        </div>
        <div className="system-line">
          <span>LLM Provider</span>
          <strong>Gemini + Groq</strong>
        </div>
        <div className="system-line">
          <span>Last Check</span>
          <strong>10:24:30</strong>
        </div>
      </section>

      <div className="profile">
        <span className="avatar">AD</span>
        <span>
          <strong>Analyst</strong>
          <small>analyst@demo.local</small>
        </span>
        <ChevronDown size={16} />
      </div>
    </aside>
  );
}
