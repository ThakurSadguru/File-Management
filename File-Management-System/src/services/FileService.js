const BASE_URL = "http://localhost:8080/api/files";

// shared helper
const getUserId = () => {
  try {
    return JSON.parse(sessionStorage.getItem("user"))?.id;
  } catch {
    return null;
  }
};

export const FileService = {
  upload: async (file, folderId) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folderId", folderId);
    formData.append("userId", getUserId());  
    const res = await fetch(`${BASE_URL}/upload`, { method: "POST", body: formData });
    return res.json();
  },

  getAll: async (folderId, userId) => { 
    const uid = userId ?? getUserId();
    const res = await fetch(`${BASE_URL}/all/${folderId}?userId=${uid}`);
    return res.json();
  },

  getAllFiles: async (userId) => { 
    const uid = userId ?? getUserId();
    const res = await fetch(`${BASE_URL}/all?userId=${uid}`);
    return res.json();
  },

  rename: async (id, name) => {
    const res = await fetch(`${BASE_URL}/${id}/rename`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, userId: String(getUserId()) }),  
    });
    return res.json();
  },

  delete: async (id) => {
    await fetch(`${BASE_URL}/${id}?userId=${getUserId()}`, { method: "DELETE" });  
  },

  move: async (id, folderId) => {
    const res = await fetch(`${BASE_URL}/${id}/move`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId, userId: String(getUserId()) }),  
    });
    return res.json();
  },

  getDuplicates: async () => {
  const userId = getUserId();
  const res = await fetch(`${BASE_URL}/duplicates?userId=${userId}`);
  return res.json();
},

  copy: async (id, folderId) => {
    const res = await fetch(`${BASE_URL}/${id}/copy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId, userId: String(getUserId()) }),  
    });
    return res.json();
  },

  getTrash: async () => {
    const res = await fetch(`${BASE_URL}/trash?userId=${getUserId()}`);  
    return res.json();
  },

  moveToTrash: async (id) => {
    const res = await fetch(`${BASE_URL}/${id}/trash?userId=${getUserId()}`, { method: "PUT" }); 
    return res.json();
  },

  restore: async (id) => {
    const res = await fetch(`${BASE_URL}/${id}/restore?userId=${getUserId()}`, { method: "PUT" }); 
    return res.json();
  },

  deletePermanent: async (id) => {
    await fetch(`${BASE_URL}/${id}/permanent?userId=${getUserId()}`, { method: "DELETE" }); 
  },
};