import { useCallback, useState } from "react";
import { UploadCloud } from "lucide-react";
import { useFileContext } from "../../context/useFileContext";

const FOLDERS_API = "http://localhost:8080/api/folders";

const getUserId = () => {
  try {
    return JSON.parse(sessionStorage.getItem("user"))?.id ?? null;
  } catch {
    return null;
  }
};

async function readAllEntries(reader) {
  const all = [];
  while (true) {
    const batch = await new Promise((resolve, reject) =>
      reader.readEntries(resolve, reject),
    );
    if (!batch.length) break;
    all.push(...batch);
  }
  return all;
}

// ✅ Recursively create folders and upload files, preserving structure
async function processEntry(entry, parentFolderId, handleUpload) {
  if (entry.isFile) {
    // Get the actual File object and upload it
    const file = await new Promise((resolve, reject) =>
      entry.file(resolve, reject),
    );
    await handleUpload(file, parentFolderId);
  } else if (entry.isDirectory) {
    const userId = getUserId();

    // ✅ Create this folder in the backend under parentFolderId
    let newFolder;
    try {
      newFolder = await fetch(FOLDERS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: entry.name,
          parentId: parentFolderId,
          userId,
        }),
      }).then((res) => res.json());
    } catch (err) {
      console.error("Failed to create folder:", entry.name, err);
      return;
    }

    // ✅ Read all children entries
    const reader = entry.createReader();
    const children = await readAllEntries(reader);

    // ✅ Recursively process each child
    for (const child of children) {
      await processEntry(child, newFolder.id, handleUpload);
    }
  }
}

export default function UploadDropzone() {
  const { handleUpload, currentFolderId, refreshFolder, refreshStats } =
    useFileContext();
  const [isOver, setIsOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (e) => {
      e.preventDefault();
      setIsOver(false);

      const items = Array.from(e.dataTransfer.items || []);
      if (!items.length) return;

      setUploading(true);

      try {
        for (const item of items) {
          const entry = item.webkitGetAsEntry?.();
          if (!entry) continue;
          await processEntry(entry, currentFolderId, handleUpload);
        }
        // ✅ Refresh after all done
        await refreshFolder(currentFolderId);
        await refreshStats();
      } catch (err) {
        console.error("Drop upload failed:", err);
      } finally {
        setUploading(false);
      }
    },
    [handleUpload, currentFolderId, refreshFolder, refreshStats],
  );

  return (
    <div
      className={`dropzone ${isOver ? "over" : ""} ${uploading ? "over" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={onDrop}
      role="region"
      aria-label="Upload dropzone"
    >
      <UploadCloud size={20} />
      <div className="dz-title">
        {uploading ? "Uploading..." : "Drag and drop files or folders"}
      </div>
      <div className="dz-sub">
        {uploading
          ? "Please wait, uploading folder contents..."
          : "Folders will be created with their contents preserved"}
      </div>
    </div>
  );
}
