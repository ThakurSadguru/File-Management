import { useEffect, useState } from "react";
import {
  Share2,
  Download,
  Copy,
  Trash2,
  Check,
  Search,
  X,
  FileText,
  Image,
  Film,
  Archive,
  Plus,
  Eye,
} from "lucide-react";
import { ShareService } from "../services/ShareService";
import { FriendService } from "../services/FriendService";
import { FileService } from "../services/FileService";
import { formatBytes } from "../utils/format";
import { useFileContext } from "../context/useFileContext";

/* ── Helpers ── */
function typeColor(type) {
  if (type === "image") return "#0ea5e9";
  if (type === "video") return "#8b5cf6";
  if (type === "document" || type === "pdf") return "#ef4444";
  return "#f59e0b";
}

function FileTypeIcon({ type, size = 15 }) {
  const p = { size, strokeWidth: 1.8 };
  if (type === "image") return <Image {...p} />;
  if (type === "video") return <Film {...p} />;
  if (type === "document") return <Archive {...p} />;
  return <FileText {...p} />;
}

function Avatar({ name = "?", size = 32 }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}

function useCopy() {
  const [id, setId] = useState(null);
  const copy = (copyId, text) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setId(copyId);
    setTimeout(() => setId(null), 1800);
  };
  return { copiedId: id, copy };
}

/* ── Share Modal ── */
function ShareModal({ onClose, onShare, userId }) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [friend, setFriend] = useState(null);
  const [q, setQ] = useState("");
  const [allFiles, setAllFiles] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load real files and friends
    FileService.getAllFiles()
      .then(setAllFiles)
      .catch(() => setError("Failed to load files"));

    FriendService.getAll(userId)
      .then(setFriends)
      .catch(() => setError("Failed to load friends"));
  }, [userId]);

  const filteredFiles = allFiles.filter((f) =>
    f.name.toLowerCase().includes(q.toLowerCase()),
  );
  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(q.toLowerCase()),
  );

  const handleShare = async () => {
    if (!file || !friend) return;
    setLoading(true);
    setError("");
    try {
      const result = await ShareService.share({
        fromUserId: userId,
        toUserId: friend.id,
        fileId: file.id,
      });
      onShare(result);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="sl-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="sl-modal">
        <div className="sl-mhead">
          <span className="sl-mtitle">
            <Share2 size={15} /> Share a file
          </span>
          <button className="sl-xbtn" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        {/* Steps */}
        <div className="sl-msteps">
          <div
            className={`sl-mstep ${step >= 1 ? "on" : ""} ${step > 1 ? "done" : ""}`}
          >
            <div className="sl-sdot">
              {step > 1 ? <Check size={10} /> : "1"}
            </div>{" "}
            Select file
          </div>
          <div className="sl-sline" />
          <div className={`sl-mstep ${step === 2 ? "on" : ""}`}>
            <div className="sl-sdot">2</div> Choose friend
          </div>
        </div>

        <div className="sl-mbody">
          <div className="sl-searchrow">
            <Search size={13} className="sl-sicon" />
            <input
              className="sl-sinput"
              autoFocus
              placeholder={
                step === 1 ? "Search your files…" : "Search friends…"
              }
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {error && (
            <div className="error" style={{ margin: "8px 0" }}>
              {error}
            </div>
          )}

          {/* Step 1 — pick file */}
          {step === 1 && (
            <div className="sl-picklist">
              {filteredFiles.length === 0 && (
                <div className="muted" style={{ padding: 12 }}>
                  No files found
                </div>
              )}
              {filteredFiles.map((f) => (
                <button
                  key={f.id}
                  className={`sl-pickitem ${file?.id === f.id ? "sel" : ""}`}
                  onClick={() => setFile(f)}
                >
                  <div
                    className="sl-ficon"
                    style={{
                      color: typeColor(f.type),
                      background: typeColor(f.type) + "18",
                    }}
                  >
                    <FileTypeIcon type={f.type} />
                  </div>
                  <div className="sl-pinfo">
                    <div className="sl-pname">{f.name}</div>
                    <div className="sl-pmeta">{formatBytes(f.size)}</div>
                  </div>
                  {file?.id === f.id && (
                    <div className="sl-chk">
                      <Check size={11} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step 2 — pick friend */}
          {step === 2 && (
            <>
              <div className="sl-selfile">
                <div
                  className="sl-ficon sm"
                  style={{
                    color: typeColor(file.type),
                    background: typeColor(file.type) + "18",
                  }}
                >
                  <FileTypeIcon type={file.type} size={13} />
                </div>
                <span className="sl-pname">{file.name}</span>
              </div>
              <div className="sl-picklist">
                {filteredFriends.length === 0 && (
                  <div className="muted" style={{ padding: 12 }}>
                    No friends yet — add friends first
                  </div>
                )}
                {filteredFriends.map((f) => (
                  <button
                    key={f.id}
                    className={`sl-pickitem ${friend?.id === f.id ? "sel" : ""}`}
                    onClick={() => setFriend(f)}
                  >
                    <Avatar name={f.name} size={30} />
                    <div className="sl-pinfo">
                      <div className="sl-pname">{f.name}</div>
                      <div className="sl-pmeta">{f.email}</div>
                    </div>
                    {friend?.id === f.id && (
                      <div className="sl-chk">
                        <Check size={11} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="sl-mfoot">
          {step === 2 && (
            <button
              className="sl-back"
              onClick={() => {
                setStep(1);
                setQ("");
              }}
            >
              ← Back
            </button>
          )}
          {step === 1 ? (
            <button
              className="sl-confirm"
              disabled={!file}
              onClick={() => {
                setStep(2);
                setQ("");
              }}
            >
              Next →
            </button>
          ) : (
            <button
              className="sl-confirm"
              disabled={!friend || loading}
              onClick={handleShare}
            >
              <Share2 size={13} /> {loading ? "Sharing..." : "Share"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Shared by you tab ── */
function SharedTab({ shared, onRemove }) {
  const { openModal } = useFileContext();
  const { copiedId, copy } = useCopy();

  if (shared.length === 0) {
    return (
      <div className="empty-state">
        <h3>Nothing shared yet</h3>
        <p>Share a file using the button above</p>
      </div>
    );
  }

  return (
    <div className="sl-section">
      {shared.map((s) => (
        <div key={s.id} className="sl-row">
          <div
            className="sl-ficon"
            style={{
              color: typeColor(s.type),
              background: typeColor(s.type) + "18",
            }}
          >
            <FileTypeIcon type={s.type} />
          </div>
          <div className="sl-rowinfo">
            <div className="sl-rowname">{s.name}</div>
            <div className="sl-rowmeta">
              {formatBytes(s.size)} · To <strong>{s.toName}</strong> · {s.date}
            </div>
          </div>
          <div className="sl-rowacts">
            {/* Preview */}
            <button
              className="sl-act"
              onClick={() => openModal("preview", { ...s, kind: "file" })}
              title="Preview"
            >
              <Eye size={13} /> Preview
            </button>

            {/* Copy link */}
            <button
              className={`sl-act ${copiedId === s.id ? "copied" : ""}`}
              onClick={() => copy(s.id, s.url)}
            >
              {copiedId === s.id ? (
                <>
                  <Check size={13} /> Copied
                </>
              ) : (
                <>
                  <Copy size={13} /> Copy link
                </>
              )}
            </button>

            {/* Revoke */}
            <button className="sl-act danger" onClick={() => onRemove(s.id)}>
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Received tab ── */
function ReceivedTab({ received }) {
  const { openModal } = useFileContext();

  if (received.length === 0) {
    return (
      <div className="empty-state">
        <h3>No files received</h3>
        <p>Files shared with you will appear here</p>
      </div>
    );
  }

  return (
    <div className="sl-section">
      {received.map((r) => (
        <div key={r.id} className="sl-row">
          <div
            className="sl-ficon"
            style={{
              color: typeColor(r.type),
              background: typeColor(r.type) + "18",
            }}
          >
            <FileTypeIcon type={r.type} />
          </div>
          <div className="sl-rowinfo">
            <div className="sl-rowname">{r.name}</div>
            <div className="sl-rowmeta">
              {formatBytes(r.size)} · From <strong>{r.fromName}</strong> ·{" "}
              {r.date}
            </div>
          </div>
          <div className="sl-rowacts">
            <button
              className="sl-act"
              onClick={() => openModal("preview", { ...r, kind: "file" })}
            >
              <Eye size={13} /> Preview
            </button>
            <a className="sl-act" href={r.url} download={r.name}>
              <Download size={13} /> Save
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Tabs ── */
const TABS = [
  { id: "shared", label: "Shared by you", icon: Share2 },
  { id: "received", label: "Received", icon: Download },
];

/* ── Main ── */
export default function Shareable() {
  const [tab, setTab] = useState("shared");
  const [shared, setShared] = useState([]);
  const [received, setReceived] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const user = JSON.parse(sessionStorage.getItem("user"));
  const userId = user?.id;

  // ✅ Load sent and received
  useEffect(() => {
    if (!userId) return;

    ShareService.getSent(userId)
      .then(setShared)
      .catch(() => setError("Failed to load shared files"));

    ShareService.getReceived(userId)
      .then(setReceived)
      .catch(() => setError("Failed to load received files"));
  }, [userId]);

  const handleShare = (newShare) => {
    setShared((prev) => [newShare, ...prev]);
    setTab("shared");
  };

  const handleRevoke = async (id) => {
    try {
      await ShareService.revoke(id);
      setShared((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError("Failed to revoke share");
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-title">Shareable</div>
          <div className="page-sub">Share files with your friends</div>
        </div>
        <div className="actions">
          <button className="btn primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Share a file
          </button>
        </div>
      </div>

      {error && (
        <div className="error" style={{ marginBottom: 12 }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="sl-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`sl-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <t.icon size={14} /> {t.label}
            {t.id === "shared" && shared.length > 0 && (
              <span className="sl-badge">{shared.length}</span>
            )}
            {t.id === "received" && received.length > 0 && (
              <span className="sl-badge">{received.length}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "shared" && (
        <SharedTab shared={shared} onRemove={handleRevoke} />
      )}
      {tab === "received" && <ReceivedTab received={received} />}

      {showModal && (
        <ShareModal
          onClose={() => setShowModal(false)}
          onShare={handleShare}
          userId={userId}
        />
      )}
    </div>
  );
}
