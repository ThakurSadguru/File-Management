import FileItem from "./FileItem";

export default function FileList({
  items,
  isLoading,
  selectMode,
  selectedIds,
  onToggleItem,
}) {
  if (isLoading) {
    return (
      <div className="table">
        <div className="thead">
          <div className="th">Name</div>
          <div className="th">Size</div>
          <div className="th">Modified</div>
          <div className="th"></div>
        </div>
        <div className="tbody">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="row skeleton">
              <div className="cell name">
                <span className="sk sk-ic" />
                <span className="sk sk-line" />
              </div>
              <div className="cell meta">
                <span className="sk sk-sm" />
              </div>
              <div className="cell meta">
                <span className="sk sk-sm" />
              </div>
              <div className="cell actions">
                <span className="sk sk-btn" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="empty">
        <div className="empty-title">This folder is empty</div>
        <div className="empty-sub">
          Upload files or create a folder to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="table" role="table">
      <div className="thead" role="rowgroup">
        <div className="th">Name</div>
        <div className="th">Size</div>
        <div className="th">Modified</div>
        <div className="th"></div>
      </div>
      <div className="tbody" role="rowgroup">
        {items.map((item) => (
          <FileItem
            key={`${item.kind}:${item.id}`}
            item={item}
            selectMode={selectMode}
            isSelected={selectedIds?.has(item.id)}
            onToggle={() => onToggleItem?.(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
