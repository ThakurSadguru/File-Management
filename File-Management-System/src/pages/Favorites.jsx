import { useFileContext } from "../context/useFileContext";
import FileList from "../components/file/FileList";

export default function Favorites() {
  const { allFiles, folders, favorites } = useFileContext(); // ✅ allFiles instead of files

  const favoriteItems = [
    ...folders.map((f) => ({ ...f, kind: "folder" })),
    ...allFiles.map((f) => ({ ...f, kind: "file" })), // ✅ allFiles instead of files
  ].filter((item) =>
    favorites.some((favId) => String(favId) === String(item.id)),
  );

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-title">⭐ Favorites</div>
        <div className="page-sub">
          {favoriteItems.length} item{favoriteItems.length !== 1 ? "s" : ""}
        </div>
      </div>
      <FileList items={favoriteItems} isLoading={false} />
    </div>
  );
}
