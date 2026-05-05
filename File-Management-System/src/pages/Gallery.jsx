import { useEffect, useMemo, useState } from "react";
import { Images, Search } from "lucide-react";
import { FileService } from "../services/FileService";
import ImageCard from "../components/Gallery/Imagecard";

export default function Gallery() {
  const [allFiles, setAllFiles] = useState([]);
  const [query, setQuery] = useState("");

  // ✅ Load ALL files from backend on mount
  useEffect(() => {
    const userId = JSON.parse(sessionStorage.getItem("user"))?.id; // ✅
    if (!userId) return;
    FileService.getAllFiles(userId) // ✅ pass userId
      .then((files) => {
        setAllFiles((files ?? []).map((f) => ({ ...f, kind: "file" })));
      })
      .catch((err) => console.error("❌ Failed:", err));
  }, []);

  const media = useMemo(() => {
    const items = allFiles.filter((f) => {
      const t = f.type || "";
      return (
        t === "image" ||
        t === "video" ||
        t.startsWith("image/") ||
        t.startsWith("video/")
      );
    });

    if (!query.trim()) return items;
    return items.filter((f) =>
      f.name.toLowerCase().includes(query.toLowerCase()),
    );
  }, [allFiles, query]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-title">Gallery</div>
          <div className="page-sub">
            {media.length} file{media.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="gallery-search">
          <Search size={15} className="gallery-search__icon" />
          <input
            type="text"
            placeholder="Search images or videos…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {media.length > 0 ? (
        <div className="gallery-grid">
          {media.map((file) => (
            <ImageCard key={file.id} file={file} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <Images
            size={40}
            strokeWidth={1.2}
            style={{ opacity: 0.3, marginBottom: 10 }}
          />
          <div className="empty-title">
            {query ? "No media matches your search" : "No images or videos yet"}
          </div>
          <div className="empty-sub">
            {query
              ? "Try a different search term"
              : "Upload image or video files to see them here"}
          </div>
        </div>
      )}
    </div>
  );
}
