import { useState, useCallback, useEffect } from "react";

const CAPACITY = 10_000_000_000;

export function useStats(userId) {  
  const [globalStats, setGlobalStats] = useState({
    totalFiles: 0,
    totalFolders: 0,
    storage: { capacityBytes: CAPACITY, usedBytes: 0 },
  });

  const refreshStats = useCallback(async () => {
    if (!userId) return; 
    try {
      const res = await fetch(`http://localhost:8080/api/files/stats?userId=${userId}`);
      const data = await res.json();
      setGlobalStats({
        totalFiles: data.totalFiles,
        totalFolders: data.totalFolders,
        storage: { capacityBytes: CAPACITY, usedBytes: data.usedBytes },
      });
    } catch (err) {
      console.error("Failed to refresh stats", err);
    }
  }, [userId]);  

  useEffect(() => {
    refreshStats();
  }, [refreshStats]); 

  return { globalStats, refreshStats };
}