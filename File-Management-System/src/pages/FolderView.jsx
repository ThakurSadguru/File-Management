import { useEffect, useMemo, useState, useRef } from "react";
import Breadcrumb from "../components/ui/Breadcrumb";
import UploadButton from "../components/upload/UploadButton";
import UploadDropzone from "../components/upload/UploadDropzone";
import FolderTree from "../components/file/FolderTree";
import FileList from "../components/file/FileList";
import { useFileContext } from "../context/useFileContext";
import {
  Plus,
  Trash2,
  CheckSquare,
  Square,
  X,
  Search,
  ArrowUpDown,
  Check,
} from "lucide-react";

function matchesFilter(item, filterId) {
  if (filterId === "all") return true;
  if (filterId === "folder") return item.kind === "folder";
  if (item.kind === "folder") return false;
  return item.type === filterId;
}

// ✅ Sort items based on sort config
function sortItems(items, sortBy, sortDir) {
  return [...items].sort((a, b) => {
    let valA, valB;

    if (sortBy === "name") {
      valA = a.name.toLowerCase();
      valB = b.name.toLowerCase();
      return sortDir === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    if (sortBy === "date") {
      valA = new Date(a.updatedAt || a.createdAt).getTime();
      valB = new Date(b.updatedAt || b.createdAt).getTime();
    }

    if (sortBy === "size") {
      valA = a.kind === "folder" ? -1 : a.size || 0;
      valB = b.kind === "folder" ? -1 : b.size || 0;
    }

    if (sortBy === "type") {
      valA = a.kind === "folder" ? "folder" : a.type || "";
      valB = b.kind === "folder" ? "folder" : b.type || "";
      return sortDir === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    return sortDir === "asc" ? valA - valB : valB - valA;
  });
}

// ✅ Sort dropdown component
function SortDropdown({ sortBy, setSortBy, sortDir, setSortDir }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const sortOptions = [
    { key: "name", label: "Name" },
    { key: "date", label: "Date Modified" },
    { key: "type", label: "Type" },
    { key: "size", label: "Size" },
  ];

  const currentLabel =
    sortOptions.find((o) => o.key === sortBy)?.label || "Name";

  return (
    <div style={{ position: "relative", flexShrink: 0 }} ref={ref}>
      <button
        className="btn"
        onClick={() => setOpen((v) => !v)}
        style={{ display: "flex", alignItems: "center", gap: 6 }}
      >
        <ArrowUpDown size={14} />
        Sort · {currentLabel}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            zIndex: 50,
            minWidth: 180,
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "var(--shadow)",
            padding: 6,
          }}
        >
          {/* Sort by section */}
          <div
            style={{
              fontSize: 11,
              color: "var(--muted)",
              padding: "4px 10px 6px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Sort by
          </div>
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                setSortBy(opt.key);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                padding: "8px 10px",
                border: "1px solid transparent",
                borderRadius: 9,
                background: "transparent",
                color: "var(--text)",
                fontSize: 13,
                fontWeight: sortBy === opt.key ? 600 : 400,
                cursor: "pointer",
                textAlign: "left",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--panel-2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {opt.label}
              {sortBy === opt.key && <Check size={14} color="var(--accent)" />}
            </button>
          ))}

          {/* Divider */}
          <div
            style={{ height: 1, background: "var(--border)", margin: "6px 0" }}
          />

          {/* Direction section */}
          <div
            style={{
              fontSize: 11,
              color: "var(--muted)",
              padding: "4px 10px 6px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Order
          </div>
          {[
            { key: "asc", label: "Ascending" },
            { key: "desc", label: "Descending" },
          ].map((dir) => (
            <button
              key={dir.key}
              onClick={() => {
                setSortDir(dir.key);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                padding: "8px 10px",
                border: "1px solid transparent",
                borderRadius: 9,
                background: "transparent",
                color: "var(--text)",
                fontSize: 13,
                fontWeight: sortDir === dir.key ? 600 : 400,
                cursor: "pointer",
                textAlign: "left",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--panel-2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {dir.label}
              {sortDir === dir.key && <Check size={14} color="var(--accent)" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FolderView() {
  const { currentFolder, currentItems, isLoading, openModal, isModalOpen } =
    useFileContext();

  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({
    kind: "all",
    type: "all",
    date: "all",
  });
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // ✅ Sort state
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const result = currentItems.filter((it) => {
      if (filters.kind !== "all" && it.kind !== filters.kind) return false;
      if (!matchesFilter(it, filters.type)) return false;
      if (filters.date !== "all") {
        const now = new Date();
        const itemDate = new Date(it.updatedAt || it.createdAt);
        if (
          filters.date === "today" &&
          itemDate.toDateString() !== now.toDateString()
        )
          return false;
        if (filters.date === "week" && now - itemDate > 7 * 24 * 60 * 60 * 1000)
          return false;
        if (
          filters.date === "month" &&
          now - itemDate > 30 * 24 * 60 * 60 * 1000
        )
          return false;
      }
      if (!query) return true;
      return it.name.toLowerCase().includes(query);
    });

    return sortItems(result, sortBy, sortDir); // ✅ apply sort
  }, [currentItems, q, filters, sortBy, sortDir]);

  const allSelected =
    filtered.length > 0 && filtered.every((i) => selectedIds.has(i.id));

  const toggleSelectMode = () => {
    setSelectMode((v) => !v);
    setSelectedIds(new Set());
  };
  const toggleItem = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((i) => i.id)));
  };
  const deleteSelected = () => {
    if (!selectedIds.size) return;
    openModal("confirmBulkDelete", {
      items: filtered.filter((i) => selectedIds.has(i.id)),
    });
  };

  useEffect(() => {
    if (!isModalOpen) {
      setSelectedIds(new Set());
      setSelectMode(false);
    }
  }, [isModalOpen]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-title">{currentFolder?.name || "My Files"}</div>
          <div className="page-sub">
            Folders and files in your current location
          </div>
        </div>

        <div className="actions">
          <button
            className={`btn ${selectMode ? "primary" : ""}`}
            onClick={toggleSelectMode}
          >
            {selectMode ? <X size={16} /> : <CheckSquare size={16} />}
            {selectMode ? "Cancel" : "Select"}
          </button>

          {selectMode && (
            <>
              <button className="btn" onClick={toggleAll}>
                {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                {allSelected ? "Deselect All" : "Select All"}
              </button>
              {selectedIds.size > 0 && (
                <button className="btn danger" onClick={deleteSelected}>
                  <Trash2 size={16} /> Delete ({selectedIds.size})
                </button>
              )}
            </>
          )}

          <UploadButton />

          <button
            className="btn"
            onClick={() => openModal("create", currentFolder)}
          >
            <Plus size={16} /> Create Folder
          </button>
        </div>
      </div>

      {selectMode && (
        <div className="selection-bar">
          <span>
            {selectedIds.size > 0
              ? `${selectedIds.size} item${selectedIds.size !== 1 ? "s" : ""} selected`
              : "Click items to select them"}
          </span>
        </div>
      )}

      {/* ✅ Search + Filters + Sort */}
      <div className="search-filter-bar" style={{ marginBottom: 12 }}>
        <div style={{ flexShrink: 0 }}>
          <Breadcrumb />
        </div>

        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search files & folders..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="filter-bar">
          <select
            value={filters.kind}
            onChange={(e) =>
              setFilters((p) => ({ ...p, kind: e.target.value }))
            }
          >
            <option value="all">All</option>
            <option value="file">Files</option>
            <option value="folder">Folders</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) =>
              setFilters((p) => ({ ...p, type: e.target.value }))
            }
          >
            <option value="all">All Types</option>
            <option value="pdf">PDF</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="text">Text</option>
            <option value="document">Document</option>
          </select>

          <select
            value={filters.date}
            onChange={(e) =>
              setFilters((p) => ({ ...p, date: e.target.value }))
            }
          >
            <option value="all">Any Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>

        {/* ✅ Sort dropdown */}
        <SortDropdown
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortDir={sortDir}
          setSortDir={setSortDir}
        />
      </div>

      <div className="split">
        <div className="left">
          <FolderTree />
        </div>
        <div className="right">
          <UploadDropzone />
          <FileList
            items={filtered}
            isLoading={isLoading}
            selectMode={selectMode}
            selectedIds={selectedIds}
            onToggleItem={toggleItem}
          />
        </div>
      </div>
    </div>
  );
}
