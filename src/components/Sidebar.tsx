import {
  Bookmark,
  ChevronDown,
  History,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="brand">
          <span className="brand-icon">
            <ShieldCheck size={21} />
          </span>
          <span className="sidebar-label">AI Event Search</span>
        </div>
        <button className="sidebar-toggle" type="button" onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className="nav">
        <a className="nav-item active" href="#search">
          <Search size={18} />
          <span className="sidebar-label">Search</span>
        </a>
        <a className="nav-item" href="#history">
          <History size={18} />
          <span className="sidebar-label">History</span>
        </a>
        <a className="nav-item" href="#saved">
          <Bookmark size={18} />
          <span className="sidebar-label">Saved Queries</span>
        </a>
        <a className="nav-item" href="#playbooks">
          <SlidersHorizontal size={18} />
          <span className="sidebar-label">Playbooks</span>
          <span className="soon sidebar-label">Soon</span>
        </a>
        <a className="nav-item" href="#settings">
          <Settings size={18} />
          <span className="sidebar-label">Settings</span>
        </a>
      </nav>

      <div className="sidebar-spacer" />

      <div className="profile">
        <span className="avatar">AD</span>
        <span className="sidebar-label">
          <strong>Analyst</strong>
          <small>analyst@demo.local</small>
        </span>
        <ChevronDown className="sidebar-label" size={16} />
      </div>
    </aside>
  );
}
