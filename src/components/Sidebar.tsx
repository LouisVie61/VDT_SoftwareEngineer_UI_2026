import {
  History,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShieldCheck,
} from "lucide-react";
import { RawLogUpload } from "./RawLogUpload";

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
      </nav>

      <div className="sidebar-spacer" />

      <RawLogUpload compact={collapsed} />
    </aside>
  );
}
