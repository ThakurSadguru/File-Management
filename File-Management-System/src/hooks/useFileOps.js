import { useCallback } from "react";
import { FileService } from "../services/FileService";
import { collectFolderDescendants } from "../context/Helper";

//receive userId as a prop — don't read sessionStorage inside

const FOLDERS_API = "http://localhost:8080/api/folders";

export function useFileOps({
  folders, files, setFolders, setFiles,
  currentFolderId, setCurrentFolderId,
  refreshFolder, refreshStats,
  userId, 
}) {

  const createFolder = useCallback(async ({ name, parentId }) => {
    const trimmed = (name || "").trim();
    if (!trimmed || !userId) return false;

    const saved = await fetch(FOLDERS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: trimmed,
        parentId: parentId ?? currentFolderId,
        userId,
      }),
    }).then((res) => res.json());

    setFolders((prev) => [saved, ...prev]);
    await refreshFolder(currentFolderId);  
    await refreshStats();
    return true;
  }, [currentFolderId, setFolders, refreshFolder, refreshStats, userId]);  



  const renameItem = useCallback(async ({ item, name }) => {
    const trimmed = (name || "").trim();
    if (!item || !trimmed || !userId) return false;  
    if (item.kind === "folder") {
      try {
        const updated = await fetch(`${FOLDERS_API}/${item.id}/rename`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmed, userId: String(userId) }),  
        }).then((res) => {
          if (!res.ok) throw new Error("Rename folder failed");
          return res.json();
        });
        setFolders((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, name: updated.name } : f))
        );
        return true;
      } catch (err) {
        console.error("Rename folder failed", err);
        return false;
      }
    }
    try {
      await FileService.rename(item.id, trimmed);
      await refreshFolder(currentFolderId);
      return true;
    } catch (err) {
      console.error("Rename file failed", err);
      return false;
    }
  }, [currentFolderId, setFolders, refreshFolder, userId]);

  const deleteItem = useCallback(async ({ item }) => {
    if (!item || !userId) return false;  
    if (item.kind === "folder") {
      if (item.id === "root") return false;
      try {
        await fetch(`${FOLDERS_API}/${item.id}?userId=${userId}`, {  
          method: "DELETE",
        });
        const ids = collectFolderDescendants(folders, item.id);
        setFolders((prev) => prev.filter((f) => !ids.has(f.id)));
        setFiles((prev) => prev.filter((f) => !ids.has(f.folderId)));
        if (ids.has(currentFolderId)) setCurrentFolderId("root");
        await refreshStats();
        return true;
      } catch (err) {
        console.error("Delete folder failed", err);
        return false;
      }
    }
    try {
      await FileService.moveToTrash(item.id);
      await refreshFolder(currentFolderId);
      await refreshStats();
      return true;
    } catch (err) {
      console.error("Delete file failed", err);
      return false;
    }
  }, [folders, currentFolderId, setFolders, setFiles, setCurrentFolderId, refreshFolder, refreshStats, userId]);

  const moveFile = useCallback(async ({ fileId, targetFolderId, item }) => {
    if (!userId) return false;  // ✅ guard
    if (item?.kind === "folder") {
      try {
        await fetch(`${FOLDERS_API}/${fileId}/move`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parentId: targetFolderId, userId: String(userId) }),  
        }).then((res) => {
          if (!res.ok) throw new Error("Move folder failed");
          return res.json();
        });
        await refreshFolder(currentFolderId);
        await refreshStats();
        return true;
      } catch (err) {
        console.error("Move folder failed", err);
        return false;
      }
    }
    try {
      await FileService.move(fileId, targetFolderId);
      await refreshFolder(currentFolderId);
      await refreshStats();
      return true;
    } catch (err) {
      console.error("Move file failed", err);
      return false;
    }
  }, [currentFolderId, refreshFolder, refreshStats, userId]);

  const copyFile = useCallback(async ({ fileId, targetFolderId, item }) => {
    if (!userId) return false;  
    if (item?.kind === "folder") {
      alert("Folders cannot be copied. You can move them instead.");
      return false;
    }
    try {
      await FileService.copy(fileId, targetFolderId);
      await refreshFolder(currentFolderId);
      await refreshStats();
      return true;
    } catch (err) {
      console.error("Copy failed", err);
      return false;
    }
  }, [currentFolderId, refreshFolder, refreshStats, userId]);

  return { createFolder, renameItem, deleteItem, moveFile, copyFile };
}