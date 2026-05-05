import { useState } from "react";
import { Pencil, User } from "lucide-react";
import { AuthService } from "../services/AuthService";

export default function Account() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(user);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // 👉 mock extra data (can come from backend later)
  const [stats] = useState({
    friends: 128,
    posts: 42,
    joined: "2024",
  });

  const openModal = () => {
    setForm(user);
    setIsOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        `http://localhost:8080/api/auth/update/${user.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
          }),
        },
      );

      if (!res.ok) throw new Error("Update failed");

      const updated = await res.json();
      setUser(updated);
      sessionStorage.setItem("user", JSON.stringify(updated));
      setIsOpen(false);
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page account-page">
      {/* HEADER */}
      <div className="profile-card">
        <div className="avatar">
          <User size={40} />
        </div>

        <div className="profile-info">
          <div className="name">{user.name || "User Name"}</div>
          <div className="email">{user.email}</div>
        </div>

        <button className="icon-btn edit-btn" onClick={openModal}>
          <Pencil size={18} />
        </button>
      </div>

      {/* STATS */}
      <div className="stats">
        <div className="stat-box">
          <div className="stat-num">{stats.friends}</div>
          <div className="stat-label">Friends</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">{stats.posts}</div>
          <div className="stat-label">Posts</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">{stats.joined}</div>
          <div className="stat-label">Joined</div>
        </div>
      </div>

      {/* DETAILS */}
      <div className="card">
        <div className="card-title">Account Details</div>

        <div className="kv">
          <div className="kv-row">
            <div className="kv-k">Name</div>
            <div className="kv-v">{user.name}</div>
          </div>

          <div className="kv-row">
            <div className="kv-k">Email</div>
            <div className="kv-v">{user.email}</div>
          </div>

          <div className="kv-row">
            <div className="kv-k">Password</div>
            <div className="kv-v">••••••••</div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isOpen && (
        <div className="modal-backdrop" onClick={() => setIsOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Edit Profile</div>
            </div>

            <div className="modal-body">
              <div className="form">
                <input
                  className="input"
                  placeholder="Name"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <input
                  className="input"
                  placeholder="Email"
                  value={form.email || ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />

                <input
                  className="input"
                  placeholder="New password"
                  type="password"
                  value={form.password || ""}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />

                {/* extra optional field */}
                <textarea
                  className="input"
                  placeholder="Bio (optional)"
                  value={form.bio || ""}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />

                {error && <div className="error">{error}</div>}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn" onClick={() => setIsOpen(false)}>
                Cancel
              </button>

              <button className="btn primary" onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
