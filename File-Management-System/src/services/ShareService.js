const BASE = "http://localhost:8080/api/share";

export const ShareService = {
  share: async ({ fromUserId, toUserId, fileId }) => {
    const res = await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromUserId, toUserId, fileId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to share");
    return data;
  },

  getSent: async (userId) => {
    const res = await fetch(`${BASE}/sent/${userId}`);
    return res.json();
  },

  getReceived: async (userId) => {
    const res = await fetch(`${BASE}/received/${userId}`);
    return res.json();
  },

  revoke: async (id) => {
    await fetch(`${BASE}/${id}`, { method: "DELETE" });
  },
};