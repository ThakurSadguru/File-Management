import { useFileContext } from "../../context/useFileContext";
import { formatBytes } from "../../utils/format";
import { Folder, HardDrive, FileText, Search, Copy } from "lucide-react";

function Card({ icon, label, value, sub, danger }) {
  return (
    <div
      className="stat-card"
      style={
        danger
          ? {
              borderColor: "rgba(239,68,68,0.3)",
              background: "rgba(239,68,68,0.04)",
            }
          : {}
      }
    >
      <div
        className="stat-icon"
        style={
          danger
            ? {
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "var(--danger)",
              }
            : {}
        }
      >
        {icon}
      </div>
      <div className="stat-body">
        <div className="stat-label">{label}</div>
        <div
          className="stat-value"
          style={danger ? { color: "var(--danger)" } : {}}
        >
          {value}
        </div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}
export default function StatsCards({
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  duplicateCount = 0,
}) {
  const { stats } = useFileContext();

  const used = stats.storage.usedBytes;
  const cap = stats.storage.capacityBytes;
  const pct = cap > 0 ? Math.min(100, Math.round((used / cap) * 100)) : 0;

  return (
    <div className="stats-grid">
      <Card
        icon={<FileText size={20} />}
        label="Total files"
        value={stats.totalFiles}
      />
      <Card
        icon={<Folder size={20} />}
        label="Total folders"
        value={stats.totalFolders}
      />
      <Card
        icon={<HardDrive size={20} />}
        label="Storage usage"
        value={`${formatBytes(used)} / ${formatBytes(cap)}`}
        sub={`${pct}% used (mock)`}
      />

      {duplicateCount > 0 && (
        <Card
          icon={<Copy size={20} />}
          label="Duplicate files"
          value={duplicateCount}
          sub="Scroll down to clean up"
          danger
        />
      )}
      <div className="search-filter-bar">
        {/* SEARCH */}
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />

          <input
            type="text"
            placeholder="Search files & folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* FILTERS */}
        <div className="filter-bar">
          <select
            value={filters.kind}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, kind: e.target.value }))
            }
          >
            <option value="all">All</option>
            <option value="file">Files</option>
            <option value="folder">Folders</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, type: e.target.value }))
            }
          >
            <option value="all">All Types</option>
            <option value=".pdf">PDF</option>
            <option value=".jpg">Image</option>
            <option value=".png">PNG</option>
            <option value=".docx">DOCX</option>
          </select>

          <select
            value={filters.date}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, date: e.target.value }))
            }
          >
            <option value="all">Any Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>
    </div>
  );
}
