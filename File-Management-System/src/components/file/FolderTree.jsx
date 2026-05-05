import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Folder } from "lucide-react";
import { useFileContext } from "../../context/useFileContext";

function buildTree(folders) {
  const byParent = new Map();

  for (const f of folders) {
    const pid = f.parentId;
    const parent =
      pid === null || pid === undefined || pid === "root" || pid === ""
        ? "__ROOT__"
        : pid;

    if (!byParent.has(parent)) byParent.set(parent, []);
    byParent.get(parent).push(f);
  }

  for (const arr of byParent.values()) {
    arr.sort((a, b) => a.name.localeCompare(b.name));
  }

  return byParent;
}

function Node({
  folder,
  depth,
  byParent,
  currentFolderId,
  openFolder,
  expanded,
  toggle,
  visited,
}) {
  if (visited.has(folder.id)) return null;

  const nextVisited = new Set(visited);
  nextVisited.add(folder.id);

  const children = byParent.get(folder.id) || [];
  const hasChildren = children.length > 0;
  const isActive = String(currentFolderId) === String(folder.id);
  const isExpanded = expanded.has(folder.id);

  return (
    <div className="tree-node">
      <div
        className={`tree-btn ${isActive ? "active" : ""}`}
        style={{ paddingLeft: 10 + depth * 14 }}
      >
        <span
          className="tree-caret"
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) toggle(folder.id);
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )
          ) : (
            <span className="tree-dot" />
          )}
        </span>

        <span className="tree-label" onClick={() => openFolder(folder.id)}>
          <Folder size={16} />
          <span className="tree-name">{folder.name}</span>
        </span>
      </div>

      {hasChildren && isExpanded && (
        <div className="tree-children">
          {children.map((child) => (
            <Node
              key={child.id}
              folder={child}
              depth={depth + 1}
              byParent={byParent}
              currentFolderId={currentFolderId}
              openFolder={openFolder}
              expanded={expanded}
              toggle={toggle}
              visited={nextVisited}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FolderTree() {
  const { currentFolderId, openFolder, allFolders } = useFileContext(); // ✅ use context
  const [expanded, setExpanded] = useState(new Set());

  // ✅ no useEffect fetch — allFolders already loaded with userId in FileContext
  const byParent = useMemo(() => buildTree(allFolders ?? []), [allFolders]);
  const roots = byParent.get("__ROOT__") || [];

  const toggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="folder-tree">
      <div className="tree-title">Folders</div>
      <div className="tree">
        {roots.length === 0 ? (
          <div className="muted" style={{ padding: "8px 10px", fontSize: 13 }}>
            No folders yet
          </div>
        ) : (
          roots.map((root) => (
            <Node
              key={root.id}
              folder={root}
              depth={0}
              byParent={byParent}
              currentFolderId={currentFolderId}
              openFolder={openFolder}
              expanded={expanded}
              toggle={toggle}
              visited={new Set()}
            />
          ))
        )}
      </div>
    </div>
  );
}
