import { useRef } from "react";
import { Upload } from "lucide-react";
import { useFileContext } from "../../context/useFileContext";
import { FileService } from "../../services/FileService";

export default function UploadButton({ variant = "primary" }) {
  const inputRef = useRef(null);
  const { currentFolderId, refreshFolder, refreshStats } = useFileContext(); // ← add refreshStats

  const onPick = async (e) => {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;

    try {
      await Promise.all(
        list.map((file) => FileService.upload(file, currentFolderId)),
      );
      await refreshFolder(currentFolderId);
      await refreshStats(); // ← now works
    } catch (err) {
      console.error("Upload failed", err);
    }

    e.target.value = "";
  };

  return (
    <>
      <button
        className={`btn ${variant}`}
        type="button"
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={16} />
        Upload
      </button>

      <input
        ref={inputRef}
        className="hidden"
        type="file"
        multiple
        onChange={onPick}
      />
    </>
  );
}
