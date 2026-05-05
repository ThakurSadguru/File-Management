import StatsCards from "../components/ui/StatsCards";
import UploadButton from "../components/upload/UploadButton";
import { useFileContext } from "../context/useFileContext";
import { formatBytes, formatDate } from "../utils/format";
import { ShareService } from "../services/ShareService";
import { FileService } from "../services/FileService";
import {
  Eye,
  Plus,
  User,
  Settings,
  LogOut,
  LogIn,
  Bell,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FriendService } from "../services/FriendService";

function getGreeting(name) {
  const hour = new Date().getHours();
  const base =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return `${base}, ${name || "there"} 👋`;
}

function getSubMessage() {
  const hour = new Date().getHours();
  if (hour < 12) return "Ready to start your day? Here's what's happening.";
  if (hour < 17) return "Keep up the great work! Here's your overview.";
  return "Wrapping up? Here's a summary of your files.";
}

function RecentRow({ file, onPreview }) {
  return (
    <div className="recent-row">
      <div className="recent-name">{file.name}</div>
      <div className="recent-meta">
        {file.kind === "file" ? formatBytes(file.size) : "--"}
      </div>
      <div className="recent-meta">
        {formatDate(file.updatedAt || file.createdAt)}
      </div>
      <button className="icon-btn" onClick={() => onPreview(file)}>
        <Eye size={18} />
      </button>
    </div>
  );
}

function NotificationPanel({ notifications, onClose, onAccept, onDecline }) {
  return (
    <div className="notif-panel" onClick={(e) => e.stopPropagation()}>
      <div className="notif-header">
        <span className="notif-title">Notifications</span>
        <span className="notif-count">{notifications.length} new</span>
      </div>
      {notifications.length === 0 ? (
        <div className="notif-empty">No new notifications</div>
      ) : (
        <div className="notif-list">
          {notifications.map((n) => (
            <div key={n.id} className="notif-item">
              <div className="notif-avatar">
                {n.fromName?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="notif-body">
                <div className="notif-msg">
                  <strong>{n.fromName}</strong>{" "}
                  {n.notifType === "request" ? (
                    "sent you a friend request"
                  ) : (
                    <>
                      shared <strong>{n.name}</strong> with you
                    </>
                  )}
                </div>
                {n.date && <div className="notif-time">{n.date}</div>}
                {n.notifType === "request" && (
                  <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    <button
                      className="btn"
                      style={{
                        fontSize: 12,
                        padding: "4px 10px",
                        color: "var(--ok)",
                        borderColor: "rgba(22,163,74,0.3)",
                      }}
                      onClick={() => onAccept(n.fromUserId)}
                    >
                      Accept
                    </button>
                    <button
                      className="btn danger"
                      style={{ fontSize: 12, padding: "4px 10px" }}
                      onClick={() => onDecline(n.fromUserId)}
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="notif-footer">
        <button
          className="btn"
          style={{ width: "100%", justifyContent: "center", fontSize: 13 }}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* ── Duplicate Files Section ── */
function DuplicatesSection({ duplicateGroups, onDelete, onPreview }) {
  const [expanded, setExpanded] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});

  const totalDuplicates = duplicateGroups.reduce(
    (sum, group) => sum + group.length - 1,
    0,
  );
  const wastedBytes = duplicateGroups.reduce(
    (sum, group) => sum + (group.length - 1) * (group[0]?.size || 0),
    0,
  );

  const toggleGroup = (idx) => {
    setExpandedGroups((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (duplicateGroups.length === 0) return null;

  return (
    <div
      className="card"
      style={{ marginBottom: 14, border: "1px solid rgba(239,68,68,0.25)" }}
    >
      <div
        className="card-head"
        style={{ cursor: "pointer", marginBottom: expanded ? 12 : 0 }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--danger)",
                flexShrink: 0,
              }}
            >
              <Copy size={16} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="card-title">Duplicate Files</div>
                <span
                  style={{
                    background: "var(--danger)",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 999,
                  }}
                >
                  {totalDuplicates} duplicates
                </span>
              </div>
              <div className="card-sub">
                {duplicateGroups.length} groups · {formatBytes(wastedBytes)}{" "}
                wasted space
              </div>
            </div>
          </div>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {expanded && (
        <div style={{ display: "grid", gap: 10 }}>
          {duplicateGroups.map((group, idx) => (
            <div
              key={idx}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {/* Group header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  background: "var(--panel-2)",
                  cursor: "pointer",
                }}
                onClick={() => toggleGroup(idx)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>
                    {group[0]?.name}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--muted)",
                      background: "var(--panel)",
                      border: "1px solid var(--border)",
                      padding: "1px 6px",
                      borderRadius: 999,
                    }}
                  >
                    {group.length} copies · {formatBytes(group[0]?.size)}
                  </span>
                </div>
                {expandedGroups[idx] ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
              </div>

              {/* Group files */}
              {expandedGroups[idx] && (
                <div>
                  {group.map((file, fileIdx) => (
                    <div
                      key={file.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        borderTop: "1px solid var(--border)",
                        background:
                          fileIdx === 0
                            ? "rgba(22,163,74,0.04)"
                            : "var(--panel)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 500 }}>
                          {fileIdx === 0
                            ? "✅ Keep (original)"
                            : `📋 Copy ${fileIdx}`}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>
                          Folder: {file.folderId || "root"} ·{" "}
                          {formatDate(file.createdAt)}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn"
                          style={{ fontSize: 12, padding: "5px 10px" }}
                          onClick={() => onPreview({ ...file, kind: "file" })}
                        >
                          <Eye size={13} /> Preview
                        </button>
                        {fileIdx !== 0 && (
                          <button
                            className="btn"
                            style={{
                              fontSize: 12,
                              padding: "5px 10px",
                              color: "var(--danger)",
                              borderColor: "rgba(239,68,68,0.3)",
                            }}
                            onClick={() => onDelete(file)}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Delete all duplicates button */}
          <button
            className="btn danger"
            style={{ justifyContent: "center" }}
            onClick={() => {
              const toDelete = duplicateGroups.flatMap((g) => g.slice(1));
              toDelete.forEach((f) => onDelete(f));
            }}
          >
            <Trash2 size={15} />
            Delete All Duplicates ({totalDuplicates} files · Save{" "}
            {formatBytes(wastedBytes)})
          </button>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const {
    recentFiles,
    allFiles,
    folders,
    favorites,
    openModal,
    deleteItem,
    refreshStats,
  } = useFileContext();

  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    type: "all",
    kind: "all",
    date: "all",
  });
  const [user] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user"));
    } catch {
      return null;
    }
  });
  const isLoggedIn = !!user;
  const [showMenu, setShowMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Duplicates state
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const totalDuplicates = duplicateGroups.reduce(
    (sum, g) => sum + g.length - 1,
    0,
  );

  // ✅ Load duplicates
  useEffect(() => {
    if (!user?.id) return;
    FileService.getDuplicates()
      .then(setDuplicateGroups)
      .catch(() => {});
  }, [user?.id, allFiles]); // refresh when allFiles changes

  // ✅ Delete duplicate
  const handleDeleteDuplicate = async (file) => {
    try {
      await FileService.moveToTrash(file.id);
      // Refresh duplicates
      const updated = await FileService.getDuplicates();
      setDuplicateGroups(updated);
      await refreshStats();
    } catch (err) {
      console.error("Failed to delete duplicate", err);
    }
  };

  const acceptFriendRequest = async (fromUserId) => {
    try {
      await FriendService.accept(user.id, fromUserId);
      setNotifications((prev) =>
        prev.filter((n) => n.fromUserId !== fromUserId),
      );
    } catch (err) {
      console.error("Accept failed", err);
    }
  };

  const declineFriendRequest = async (fromUserId) => {
    try {
      await FriendService.decline(user.id, fromUserId);
      setNotifications((prev) =>
        prev.filter((n) => n.fromUserId !== fromUserId),
      );
    } catch (err) {
      console.error("Decline failed", err);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    ShareService.getReceived(user.id)
      .then((received) => {
        const shareNotifs = received
          .slice(0, 10)
          .map((n) => ({ ...n, id: `share-${n.id}`, notifType: "share" }));
        setNotifications((prev) => {
          const requestNotifs = prev.filter((n) => n.notifType === "request");
          return [...requestNotifs, ...shareNotifs];
        });
      })
      .catch(() => {});

    FriendService.getRequests(user.id)
      .then((requests) => {
        const requestNotifs = requests.map((r) => ({
          id: `req-${r.id}`,
          fromName: r.name,
          name: "sent you a friend request",
          date: "",
          notifType: "request",
          fromUserId: r.id,
        }));
        setNotifications((prev) => {
          const shareNotifs = prev.filter((n) => n.notifType === "share");
          return [...requestNotifs, ...shareNotifs];
        });
      })
      .catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setShowMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setShowNotif(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const searchResults = useMemo(() => {
    let allItems = [
      ...(allFiles ?? []).map((f) => ({ ...f, kind: "file" })),
      ...folders.map((f) => ({ ...f, kind: "folder" })),
    ];
    if (searchQuery.trim()) {
      allItems = allItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    if (filters.kind !== "all")
      allItems = allItems.filter((item) => item.kind === filters.kind);
    if (filters.type !== "all")
      allItems = allItems.filter(
        (item) => item.kind === "file" && item.name.endsWith(filters.type),
      );
    if (filters.date !== "all") {
      const now = new Date();
      allItems = allItems.filter((item) => {
        const itemDate = new Date(item.updatedAt || item.createdAt);
        if (filters.date === "today")
          return itemDate.toDateString() === now.toDateString();
        if (filters.date === "week")
          return now - itemDate < 7 * 24 * 60 * 60 * 1000;
        if (filters.date === "month")
          return now - itemDate < 30 * 24 * 60 * 60 * 1000;
        return true;
      });
    }
    return allItems;
  }, [searchQuery, allFiles, folders, filters]);

  const favoriteItems = useMemo(() => {
    const allItems = [
      ...(allFiles ?? []).map((f) => ({ ...f, kind: "file" })),
      ...folders.map((f) => ({ ...f, kind: "folder" })),
    ];
    return allItems
      .filter((item) =>
        favorites.some((favId) => String(favId) === String(item.id)),
      )
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt),
      )
      .slice(0, 4);
  }, [allFiles, folders, favorites]);

  const limitedRecent = useMemo(() => recentFiles.slice(0, 4), [recentFiles]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-title">{getGreeting(user?.name)}</div>
          <div className="page-sub">{getSubMessage()}</div>
        </div>

        <div className="actions">
          <div className="notif-wrap" ref={notifRef}>
            <button
              className="icon-btn"
              style={{ position: "relative" }}
              onClick={() => {
                setShowNotif((v) => !v);
                setShowMenu(false);
              }}
              aria-label="Notifications"
            >
              <Bell size={18} />
              {notifications.length > 0 && <span className="notif-dot" />}
            </button>
            {showNotif && (
              <NotificationPanel
                notifications={notifications}
                onClose={() => setShowNotif(false)}
                onAccept={acceptFriendRequest}
                onDecline={declineFriendRequest}
              />
            )}
          </div>

          <UploadButton />

          <button className="btn" onClick={() => openModal("create", null)}>
            <Plus size={16} /> Create Folder
          </button>

          <div className="profile-menu" ref={menuRef}>
            <button
              className="icon-btn avatar-btn"
              onClick={() => {
                setShowMenu(!showMenu);
                setShowNotif(false);
              }}
            >
              {isLoggedIn ? (
                <div className="avatar-circle">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              ) : (
                <User size={20} />
              )}
            </button>

            {showMenu && (
              <div className="dropdown">
                <div className="dropdown-item">
                  <User size={16} /> {user?.name || "Guest"}
                </div>
                <button
                  className="dropdown-item"
                  onClick={() => navigate("/dashboard/account")}
                >
                  <Settings size={16} /> Settings
                </button>
                {!isLoggedIn ? (
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/login")}
                  >
                    <LogIn size={16} /> Login
                  </button>
                ) : (
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      sessionStorage.removeItem("user");
                      navigate("/login");
                    }}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Stats — now includes duplicate count */}
      <StatsCards
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        setFilters={setFilters}
        duplicateCount={totalDuplicates}
      />

      {/* SEARCH RESULTS */}
      {(searchQuery ||
        filters.kind !== "all" ||
        filters.type !== "all" ||
        filters.date !== "all") && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="card-head">
            <div>
              <div className="card-title">Search Results</div>
              <div className="card-sub">{searchResults.length} items found</div>
            </div>
          </div>
          {searchResults.length ? (
            <div className="recent">
              {searchResults.map((item) => (
                <RecentRow
                  key={item.id}
                  file={item}
                  onPreview={(f) => openModal("preview", f)}
                />
              ))}
            </div>
          ) : (
            <div className="empty small">No results found</div>
          )}
        </div>
      )}

      {/* ✅ DUPLICATES SECTION */}
      <DuplicatesSection
        duplicateGroups={duplicateGroups}
        onDelete={handleDeleteDuplicate}
        onPreview={(f) => openModal("preview", f)}
      />

      {/* FAVORITES */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-head">
          <div>
            <div className="card-title">⭐ Favorites</div>
            <div className="card-sub">Quick access</div>
          </div>
        </div>
        {favoriteItems.length ? (
          <div className="favorites-row">
            {favoriteItems.map((item) => (
              <div
                key={item.id}
                className="favorite-card"
                onClick={() => openModal("preview", item)}
              >
                <div className="fav-icon">
                  {item.kind === "folder" ? "📁" : "📄"}
                </div>
                <div className="fav-name">{item.name}</div>
                <div className="fav-meta">
                  {item.kind === "file" ? formatBytes(item.size) : "Folder"}
                </div>
              </div>
            ))}
            <span
              className="fav-arrow"
              onClick={() => navigate("/dashboard/favorites")}
            >
              →
            </span>
          </div>
        ) : (
          <div className="empty small">No favorites yet</div>
        )}
      </div>

      {/* RECENT */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Recent files</div>
            <div className="card-sub">Updated recently</div>
          </div>
        </div>
        {limitedRecent.length ? (
          <div className="recent">
            {limitedRecent.map((file) => (
              <RecentRow
                key={file.id}
                file={file}
                onPreview={(f) => openModal("preview", f)}
              />
            ))}
            <span
              className="fav-arrow"
              onClick={() => navigate("/dashboard/files")}
            >
              →
            </span>
          </div>
        ) : (
          <div className="empty small">No recent files</div>
        )}
      </div>
    </div>
  );
}
