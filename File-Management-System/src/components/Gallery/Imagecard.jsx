import { useRef, useState, useEffect } from "react";
import { useFileContext } from "../../context/useFileContext";
import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Move,
  Copy,
  Star,
} from "lucide-react";

export default function ImageCard({ file }) {
  const { openModal, favorites, toggleFavorite } = useFileContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const imgRef = useRef(null);
  const menuRef = useRef(null);

  // ✅ Match backend type strings
  const isImage = file.type === "image" || file.type.startsWith("image/");
  const isVideo = file.type === "video" || file.type.startsWith("video/");

  // ✅ String compare for numeric backend IDs
  const isFav = favorites.some((f) => String(f) === String(file.id));

  // ✅ Handle cached images where onLoad never fires
  useEffect(() => {
    if (imgRef.current?.complete) {
      setImgLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleAction = (type) => {
    setMenuOpen(false);
    if (type === "favorite") toggleFavorite(file);
    else openModal(type, file);
  };

  return (
    <div className="img-card">
      <div
        className="img-card__thumb"
        onClick={() => openModal("preview", file)}
      >
        {/* 🖼 IMAGE */}
        {isImage && (
          <>
            {!imgLoaded && <div className="img-card__skeleton" />}
            <img
              ref={imgRef}
              src={file.url}
              alt={file.name}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgLoaded(true)}
              style={{
                opacity: imgLoaded ? 1 : 0,
                transition: "opacity 0.3s ease",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </>
        )}

        {/* 🎥 VIDEO */}
        {isVideo && (
          <>
            {!videoLoaded && <div className="img-card__skeleton" />}
            <video
              src={file.url}
              muted
              preload="metadata"
              onLoadedData={() => setVideoLoaded(true)}
              style={{
                opacity: videoLoaded ? 1 : 0,
                transition: "opacity 0.3s ease",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            <div className="video-badge">▶</div>
          </>
        )}

        <div className="img-card__overlay">
          <Eye size={22} />
        </div>
      </div>

      <div className="img-card__footer">
        <span className="img-card__name" title={file.name}>
          {file.name}
        </span>

        <div className="img-card__menu-wrap" ref={menuRef}>
          <button
            className="img-card__menu-btn"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
          >
            <MoreVertical size={15} />
          </button>

          {menuOpen && (
            <div className="img-card__menu">
              {[
                { type: "preview", icon: <Eye size={14} />, label: "Preview" },
                { type: "rename", icon: <Pencil size={14} />, label: "Rename" },
                { type: "move", icon: <Move size={14} />, label: "Move" },
                { type: "copy", icon: <Copy size={14} />, label: "Copy" },
                {
                  type: "favorite",
                  icon: <Star size={14} />,
                  label: isFav ? "Unfavorite" : "Favorite",
                },
                {
                  type: "delete",
                  icon: <Trash2 size={14} />,
                  label: "Delete",
                  danger: true,
                },
              ].map(({ type, icon, label, danger }) => (
                <button
                  key={type}
                  className={`img-card__menu-item${danger ? " danger" : ""}`}
                  onClick={() => handleAction(type)}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
