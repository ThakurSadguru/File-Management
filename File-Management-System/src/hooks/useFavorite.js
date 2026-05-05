import { useState, useCallback, useEffect } from "react";

const API = "http://localhost:8080/api/favorites";

export function useFavorites(openModal) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetch(API)
      .then((res) => res.json())
      .then((ids) => setFavorites(ids.map(String)))
      .catch((err) => console.error("Failed to load favorites", err));
  }, []);

  const toggleFavorite = useCallback((item) => {
    const safeItem = { ...item, kind: item.kind || "file" };
    const id = String(safeItem.id);

    setFavorites((prev) => {
      const exists = prev.some((f) => String(f) === id);
      if (exists) {
        openModal("confirmRemoveFavorite", safeItem);
        return prev;
      }
      fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id, itemType: safeItem.kind }),
      }).catch((err) => console.error("Failed to add favorite", err));
      return [...prev, id];
    });
  }, [openModal]);

  const removeFavorite = useCallback((id) => {
    const strId = String(id);
    fetch(`${API}/${strId}`, { method: "DELETE" })
      .catch((err) => console.error("Failed to remove favorite", err));
    setFavorites((prev) => prev.filter((f) => String(f) !== strId));
  }, []);

  return { favorites, setFavorites, toggleFavorite, removeFavorite };
}