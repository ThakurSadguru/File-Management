const BASE = "http://localhost:8080/api/friends";

export const FriendService = {
  // Get accepted friends
  getAll: async (userId) => {
    const res = await fetch(`${BASE}/${userId}`);
    if (!res.ok) throw new Error("Failed to load friends");
    return res.json();
  },

  // Get incoming pending requests
  getRequests: async (userId) => {
    const res = await fetch(`${BASE}/${userId}/requests`);
    if (!res.ok) throw new Error("Failed to load requests");
    return res.json();
  },

  
getSent: async (userId) => {
  const res = await fetch(`${BASE}/${userId}/sent`);
  if (!res.ok) throw new Error("Failed to load sent requests");
  return res.json();
},

  // Send friend request
  add: async (userId, email) => {
    const res = await fetch(`${BASE}/${userId}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send request");
    return data;
  },

  // Accept a friend request
  accept: async (userId, fromUserId) => {
    const res = await fetch(`${BASE}/${userId}/accept/${fromUserId}`, {
      method: "PUT",
    });
    if (!res.ok) throw new Error("Failed to accept request");
    return res.json();
  },

  // Decline a friend request
  decline: async (userId, fromUserId) => {
    const res = await fetch(`${BASE}/${userId}/decline/${fromUserId}`, {
      method: "PUT",
    });
    if (!res.ok) throw new Error("Failed to decline request");
    return res.json();
  },

  // Remove a friend
  remove: async (userId, friendId) => {
    const res = await fetch(`${BASE}/${userId}/remove/${friendId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to remove friend");
  },
};