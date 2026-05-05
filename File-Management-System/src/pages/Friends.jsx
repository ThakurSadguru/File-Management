import { useEffect, useState } from "react";
import { UserPlus, Trash2, Check, X, Clock } from "lucide-react";
import { FriendService } from "../services/FriendService";

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sent, setSent] = useState([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("friends"); // "friends" | "requests" | "sent"

  // ✅ Confirm remove modal state
  const [confirmRemove, setConfirmRemove] = useState(null); // holds friend object

  const user = JSON.parse(sessionStorage.getItem("user"));
  const userId = user?.id;

  const loadFriends = () =>
    FriendService.getAll(userId)
      .then(setFriends)
      .catch(() => {});

  const loadRequests = () =>
    FriendService.getRequests(userId)
      .then(setRequests)
      .catch(() => {});

  const loadSent = () =>
    FriendService.getSent(userId)
      .then(setSent)
      .catch(() => {});

  useEffect(() => {
    if (!userId) return;
    loadFriends();
    loadRequests();
    loadSent();
  }, [userId]);

  const addFriend = async () => {
    if (!email.trim()) return;
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await FriendService.add(userId, email.trim());
      setSuccess(res.message || "Friend request sent!");
      setEmail("");
      loadSent(); // refresh sent list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (fromUserId) => {
    try {
      await FriendService.accept(userId, fromUserId);
      await loadRequests();
      await loadFriends();
    } catch (err) {
      setError(err.message);
    }
  };

  const declineRequest = async (fromUserId) => {
    try {
      await FriendService.decline(userId, fromUserId);
      setRequests((prev) => prev.filter((r) => r.id !== fromUserId));
    } catch (err) {
      setError(err.message);
    }
  };

  // ✅ Opens confirm modal instead of deleting directly
  const handleRemoveClick = (friend) => {
    setConfirmRemove(friend);
  };

  // ✅ Confirmed remove
  const confirmRemoveFriend = async () => {
    if (!confirmRemove) return;
    try {
      await FriendService.remove(userId, confirmRemove.id);
      setFriends((prev) => prev.filter((f) => f.id !== confirmRemove.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setConfirmRemove(null);
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-title">Friends</div>
          <div className="page-sub">Manage your connections</div>
        </div>
      </div>

      {/* ✅ Confirm Remove Modal */}
      {confirmRemove && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setConfirmRemove(null)}
        >
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Remove Friend</div>
              <button
                className="icon-btn"
                onClick={() => setConfirmRemove(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form">
                <div className="confirm">
                  Remove <b>{confirmRemove.name}</b> from your friends?
                </div>
                <div className="muted">
                  They will no longer appear in your friends list. You can send
                  a request again later.
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setConfirmRemove(null)}>
                Cancel
              </button>
              <button className="btn danger" onClick={confirmRemoveFriend}>
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Friend */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="friend-add">
          <input
            className="input"
            type="email"
            placeholder="Enter friend's email to send a request"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
              setSuccess("");
            }}
            onKeyDown={(e) => e.key === "Enter" && addFriend()}
          />
          <button
            className="btn primary"
            onClick={addFriend}
            disabled={loading}
          >
            <UserPlus size={16} />
            {loading ? "Sending..." : "Send Request"}
          </button>
        </div>
        {error && (
          <div className="error" style={{ marginTop: 8 }}>
            {error}
          </div>
        )}
        {success && (
          <div
            style={{
              marginTop: 8,
              padding: "8px 10px",
              borderRadius: 10,
              background: "rgba(22,163,74,0.1)",
              color: "var(--ok)",
              fontSize: 13,
            }}
          >
            {success}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="sl-tabs">
        <button
          className={`sl-tab ${tab === "friends" ? "active" : ""}`}
          onClick={() => setTab("friends")}
        >
          Friends {friends.length > 0 && `(${friends.length})`}
        </button>
        <button
          className={`sl-tab ${tab === "requests" ? "active" : ""}`}
          onClick={() => setTab("requests")}
        >
          Requests
          {requests.length > 0 && (
            <span
              style={{
                marginLeft: 6,
                background: "var(--accent)",
                color: "#fff",
                borderRadius: 999,
                fontSize: 11,
                padding: "1px 7px",
                fontWeight: 700,
              }}
            >
              {requests.length}
            </span>
          )}
        </button>
        {/* ✅ Sent/Pending tab */}
        <button
          className={`sl-tab ${tab === "sent" ? "active" : ""}`}
          onClick={() => setTab("sent")}
        >
          Pending
          {sent.length > 0 && (
            <span
              style={{
                marginLeft: 6,
                background: "var(--muted)",
                color: "#fff",
                borderRadius: 999,
                fontSize: 11,
                padding: "1px 7px",
                fontWeight: 700,
              }}
            >
              {sent.length}
            </span>
          )}
        </button>
      </div>

      {/* Friends Tab */}
      {tab === "friends" && (
        <>
          {friends.length === 0 ? (
            <div className="empty-state">
              <h3>No friends yet</h3>
              <p>Send a request to connect with someone</p>
            </div>
          ) : (
            <div className="friend-list">
              {friends.map((f) => (
                <div key={`friend-${f.id}`} className="friend-card">
                  <div className="friend-info">
                    <div className="friend-avatar">
                      {f.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="friend-name">{f.name}</div>
                      <div className="friend-email">{f.email}</div>
                    </div>
                  </div>
                  <div className="friend-actions">
                    {/* ✅ Opens confirm modal */}
                    <button
                      className="btn danger"
                      onClick={() => handleRemoveClick(f)}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Requests Tab */}
      {tab === "requests" && (
        <>
          {requests.length === 0 ? (
            <div className="empty-state">
              <h3>No pending requests</h3>
              <p>
                When someone sends you a friend request, it will appear here
              </p>
            </div>
          ) : (
            <div className="friend-list">
              {requests.map((r) => (
                <div key={`req-${r.id}`} className="friend-card">
                  <div className="friend-info">
                    <div className="friend-avatar">
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="friend-name">{r.name}</div>
                      <div className="friend-email">{r.email}</div>
                    </div>
                  </div>
                  <div className="friend-actions">
                    <button
                      className="btn"
                      style={{
                        color: "var(--ok)",
                        borderColor: "rgba(22,163,74,0.3)",
                      }}
                      onClick={() => acceptRequest(r.id)}
                    >
                      <Check size={14} /> Accept
                    </button>
                    <button
                      className="btn danger"
                      onClick={() => declineRequest(r.id)}
                    >
                      <X size={14} /> Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ✅ Sent/Pending Tab */}
      {tab === "sent" && (
        <>
          {sent.length === 0 ? (
            <div className="empty-state">
              <h3>No pending requests</h3>
              <p>Requests you send will appear here until they are accepted</p>
            </div>
          ) : (
            <div className="friend-list">
              {sent.map((s) => (
                <div key={`sent-${s.id}`} className="friend-card">
                  <div className="friend-info">
                    <div className="friend-avatar">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="friend-name">{s.name}</div>
                      <div className="friend-email">{s.email}</div>
                    </div>
                  </div>
                  <div className="friend-actions">
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 12,
                        color: "var(--muted)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        padding: "5px 10px",
                      }}
                    >
                      <Clock size={13} /> Pending
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
