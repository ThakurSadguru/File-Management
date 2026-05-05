import { useEffect, useMemo, useRef, useState } from "react";
import {
  Copy,
  Eye,
  Pencil,
  File as FileIcon,
  FileText,
  FileType2,
  FileVideo,
  Folder,
  Image as ImageIcon,
  MoreVertical,
  MoveRight,
  Trash2,
  Star,
  Square,
  CheckSquare,
} from "lucide-react";
import { useFileContext } from "../../context/useFileContext";
import { formatBytes, formatDate } from "../../utils/format";

function typeIcon(item) {
  if (item.kind === "folder") return <Folder size={18} />;
  if (item.type === "image") return <ImageIcon size={18} />;
  if (item.type === "video") return <FileVideo size={18} />;
  if (item.type === "pdf") return <FileType2 size={18} />;
  if (item.type === "text") return <FileText size={18} />;
  if (item.type === "document") return <FileText size={18} />;
  return <FileIcon size={18} />;
}

export default function FileItem({ item, selectMode, isSelected, onToggle }) {
  const {
    selectedItem,
    setSelectedItem,
    openFolder,
    openModal,
    favorites,
    toggleFavorite,
  } = useFileContext();

  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const isHighlighted =
    !selectMode &&
    selectedItem?.id === item.id &&
    selectedItem?.kind === item.kind;

  const isFav = favorites.some((f) => String(f) === String(item.id));

  const updated = useMemo(
    () => item.updatedAt || item.createdAt,
    [item.updatedAt, item.createdAt],
  );

  useEffect(() => {
    const onDown = (e) => {
      if (!open) return;
      const inBtn = btnRef.current?.contains(e.target);
      const inMenu = menuRef.current?.contains(e.target);
      if (!inBtn && !inMenu) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  const handleClick = () => {
    if (selectMode) {
      onToggle();
      return;
    }
    setSelectedItem(item);
  };

  const onDoubleClick = () => {
    if (selectMode) return;
    if (item.kind === "folder") {
      openFolder(item.id);
      return;
    }
    openModal("preview", item);
  };

  return (
    <div
      className={`row ${isHighlighted ? "selected" : ""} ${selectMode && isSelected ? "selected" : ""}`}
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
      role="row"
      tabIndex={0}
      style={{ cursor: selectMode ? "pointer" : "default" }}
    >
      {/* ── Name cell ── */}
      <div className="cell name" role="cell">
        {/* Checkbox in select mode */}
        {selectMode && (
          <span
            className="select-checkbox"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {isSelected ? (
              <CheckSquare size={18} color="var(--accent)" />
            ) : (
              <Square size={18} color="var(--muted)" />
            )}
          </span>
        )}
        <span className="file-ic">{typeIcon(item)}</span>
        <span className="file-name">{item.name}</span>
      </div>

      {/* ── Size ── */}
      <div className="cell meta" role="cell">
        {item.kind === "folder" ? "—" : formatBytes(item.size)}
      </div>

      {/* ── Date ── */}
      <div className="cell meta" role="cell">
        {formatDate(updated)}
      </div>

      {/* ── Actions (hidden in select mode) ── */}
      <div className="cell actions" role="cell">
        {!selectMode && (
          <>
            <button
              className="icon-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(item);
              }}
              aria-label="Favorite"
            >
              <Star
                size={18}
                fill={isFav ? "gold" : "none"}
                color={isFav ? "gold" : "#888"}
              />
            </button>

            <button
              className="icon-btn"
              ref={btnRef}
              type="button"
              aria-label="Open actions"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItem(item);
                setOpen((v) => !v);
              }}
            >
              <MoreVertical size={18} />
            </button>

            {open && (
              <div className="menu" ref={menuRef} role="menu">
                {item.kind === "file" && (
                  <button
                    className="menu-item"
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      openModal("preview", item);
                    }}
                  >
                    <Eye size={16} /> Preview
                  </button>
                )}
                <button
                  className="menu-item"
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    openModal("rename", item);
                  }}
                >
                  <Pencil size={16} /> Rename
                </button>
                <button
                  className="menu-item"
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    openModal("move", item);
                  }}
                >
                  <MoveRight size={16} /> Move
                </button>
                <button
                  className="menu-item"
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    openModal("copy", item);
                  }}
                >
                  <Copy size={16} /> Copy
                </button>
                <button
                  className="menu-item danger"
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    openModal("delete", item);
                  }}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
