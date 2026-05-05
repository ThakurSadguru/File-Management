import { useEffect, useState } from "react";
import { Trash2, RotateCcw, Eye, AlertTriangle } from "lucide-react";
import { FileService } from "../services/FileService";
import { formatBytes } from "../utils/format";
import { useFileContext } from "../context/useFileContext";

function daysLeft(deletedAt) {
  const deleted = new Date(deletedAt);
  const expires = new Date(deleted.getTime() + 30 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diff = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export default function Trash() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { openModal, isModalOpen } = useFileContext();

  // ✅ Load trashed files
  const loadTrash = async () => {
    try {
      const data = await FileService.getTrash();
      setFiles(data);
    } catch {
      setError("Failed to load trash");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrash();
  }, []);

  // ✅ Refresh list when modal closes (after restore/delete)
  useEffect(() => {
    if (!isModalOpen) loadTrash();
  }, [isModalOpen]);

  // ✅ Restore — uses modal confirm
  const handleRestore = (file) => {
    openModal("confirmRestore", { ...file, kind: "file" });
  };

  // ✅ Delete forever — uses modal confirm
  const handleDeleteForever = (file) => {
    openModal("confirmPermanentDelete", { ...file, kind: "file" });
  };

  // ✅ Preview — reuses existing preview modal
  const handlePreview = (file) => {
    openModal("preview", { ...file, kind: "file" });
  };

  // ✅ Empty trash
  const handleEmptyTrash = () => {
    openModal("confirmEmptyTrash", {
      items: files,
      message: `Permanently delete all ${files.length} items?`,
    });
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page-head">
          <div className="page-title">Recycle Bin</div>
        </div>
        <div className="muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-title">Recycle Bin</div>
          <div className="page-sub">
            Items are permanently deleted after 30 days
          </div>
        </div>

        {files.length > 0 && (
          <button className="btn danger" onClick={handleEmptyTrash}>
            <Trash2 size={16} />
            Empty Trash
          </button>
        )}
      </div>

      {/* 30 day notice */}
      {files.length > 0 && (
        <div
          className="selection-bar"
          style={{
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <AlertTriangle size={14} />
          Items in the recycle bin are automatically deleted after 30 days.
        </div>
      )}

      {error && (
        <div className="error" style={{ marginBottom: 12 }}>
          {error}
        </div>
      )}

      {files.length === 0 ? (
        <div className="empty-state">
          <h3>Recycle bin is empty</h3>
          <p>Deleted files will appear here for 30 days</p>
        </div>
      ) : (
        <div className="trash-list">
          {files.map((file) => {
            const days = file.deletedAt ? daysLeft(file.deletedAt) : 30;
            const urgent = days <= 3;

            return (
              <div key={file.id} className="trash-row">
                {/* File info */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 3 }}
                >
                  <div className="trash-name">{file.name}</div>
                  <div
                    style={{
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      color: urgent ? "var(--danger)" : "var(--muted)",
                    }}
                  >
                    {urgent && <AlertTriangle size={12} />}
                    {days === 0
                      ? "Deletes today"
                      : `Deletes in ${days} day${days !== 1 ? "s" : ""}`}
                    {file.size ? ` · ${formatBytes(file.size)}` : ""}
                    {` · ${file.type || "file"}`}
                  </div>
                </div>

                {/* Actions */}
                <div className="trash-actions">
                  {/* Preview */}
                  <button
                    className="btn"
                    onClick={() => handlePreview(file)}
                    title="Preview"
                  >
                    <Eye size={15} />
                    Preview
                  </button>

                  {/* Restore */}
                  <button
                    className="btn restore"
                    onClick={() => handleRestore(file)}
                    title="Restore"
                  >
                    <RotateCcw size={15} />
                    Restore
                  </button>

                  {/* Delete forever */}
                  <button
                    className="btn delete"
                    onClick={() => handleDeleteForever(file)}
                    title="Delete permanently"
                  >
                    <Trash2 size={15} />
                    Delete Forever
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
