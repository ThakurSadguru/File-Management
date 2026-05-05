import { useCallback, useEffect, useMemo, useState } from "react";
import { FileContext } from "./FileContextInstance";
import { FileService } from "../services/FileService";
import { toFolderItem, toFileItem, getFolderAncestors } from "./Helper";
import { useStats } from "../hooks/useStats";
import { useFavorites } from "../hooks/useFavorite";
import { useFileOps } from "../hooks/useFileOps";
import { useLocation } from "react-router-dom";

const FOLDERS_API = "http://localhost:8080/api/folders";

const readUserId = () => {
  try {
    return JSON.parse(sessionStorage.getItem("user"))?.id ?? null;
  } catch {
    return null;
  }
};

export function FileProvider({ children }) {
  const location = useLocation();

  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [allFolders, setAllFolders] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState("root");
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalData, setModalData] = useState(null);

  const [userId, setUserId] = useState(readUserId);

  useEffect(() => {
    const id = readUserId();
    setUserId(id);
  }, [location.pathname]);

  const { globalStats, refreshStats } = useStats(userId);

  const loadAllFiles = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await FileService.getAllFiles(userId);
      setAllFiles((res ?? []).map(toFileItem));
    } catch (err) {
      console.error("Failed to load all files", err);
    }
  }, [userId]);

  const loadAllFolders = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${FOLDERS_API}/all?userId=${userId}`).then((r) =>
        r.json(),
      );
      setAllFolders((res ?? []).map(toFolderItem));
    } catch (err) {
      console.error("Failed to load all folders", err);
    }
  }, [userId]);

  useEffect(() => {
    loadAllFiles();
    loadAllFolders();
  }, [loadAllFiles, loadAllFolders]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await FileService.getAll(currentFolderId, userId);
        if (cancelled) return;
        setFolders((res?.folders ?? []).map(toFolderItem));
        setFiles((res?.files ?? []).map(toFileItem));
      } catch (err) {
        console.error("Failed to load data", err);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [currentFolderId, userId]);

  const refreshFolder = useCallback(
    async (folderId) => {
      if (!userId) return;
      try {
        const res = await FileService.getAll(
          folderId ?? currentFolderId,
          userId,
        );
        setFolders((res?.folders ?? []).map(toFolderItem));
        setFiles((res?.files ?? []).map(toFileItem));
        await loadAllFiles();
        await loadAllFolders();
      } catch (err) {
        console.error("Failed to refresh", err);
      }
    },
    [currentFolderId, userId, loadAllFiles, loadAllFolders],
  );

  const openModal = useCallback((type, data = null) => {
    setModalType(type);
    if (data?.kind) {
      setSelectedItem(data);
      setModalData(null);
    } else {
      setSelectedItem(null);
      setModalData(data);
    }
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalType(null);
    setSelectedItem(null);
    setModalData(null);
  }, []);

  const { favorites, setFavorites, toggleFavorite, removeFavorite } =
    useFavorites(openModal);

  const { createFolder, renameItem, deleteItem, moveFile, copyFile } =
    useFileOps({
      folders,
      files,
      setFolders,
      setFiles,
      currentFolderId,
      setCurrentFolderId,
      refreshFolder,
      refreshStats,
      userId,
    });

  const handleUpload = useCallback(
    async (file, targetFolderId) => {
      // ✅ accept optional targetFolderId
      if (!file) return;
      try {
        await FileService.upload(file, targetFolderId ?? currentFolderId); // ✅ use override if provided
      } catch (err) {
        console.error("Upload failed", err);
      }
      // ✅ NOTE: refresh is now handled by UploadDropzone after all files done
      // But keep refresh here for single-file uploads via UploadButton
      if (!targetFolderId) {
        await refreshFolder(currentFolderId);
        await refreshStats();
      }
    },
    [currentFolderId, refreshFolder, refreshStats],
  );
  const startFakeLoading = useCallback(async (ms = 650) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, ms));
    setIsLoading(false);
  }, []);

  const openFolder = useCallback((folderId) => {
    setCurrentFolderId(folderId);
    setSelectedItem(null);
  }, []);

  const currentFolder = useMemo(() => {
    if (!Array.isArray(folders)) return null;
    return folders.find((f) => f.id === currentFolderId) || null;
  }, [folders, currentFolderId]);

  const breadcrumbFolders = useMemo(
    () => getFolderAncestors(allFolders, currentFolderId),
    [allFolders, currentFolderId],
  );

  const currentItems = useMemo(() => {
    const childFolders = folders
      .filter((f) => f.parentId === currentFolderId)
      .map(toFolderItem);
    const childFiles = files
      .filter((f) => f.folderId === currentFolderId)
      .map(toFileItem);
    return [...childFolders, ...childFiles];
  }, [folders, files, currentFolderId]);

  const recentFiles = useMemo(() => {
    return [...allFiles]
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime(),
      )
      .slice(0, 8);
  }, [allFiles]);

  const value = {
    files,
    folders,
    allFiles,
    allFolders,
    currentFolderId,
    currentFolder,
    breadcrumbFolders,
    currentItems,
    selectedItem,
    modalType,
    isModalOpen,
    isLoading,
    stats: globalStats,
    recentFiles,
    favorites,
    modalData,
    handleUpload,
    refreshFolder,
    refreshStats,
    toggleFavorite,
    removeFavorite,
    setFavorites,
    setSelectedItem,
    setCurrentFolderId,
    openModal,
    closeModal,
    openFolder,
    createFolder,
    renameItem,
    deleteItem,
    moveFile,
    copyFile,
    startFakeLoading,
  };

  return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
}
