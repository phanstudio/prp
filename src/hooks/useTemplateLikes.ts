// src/hooks/useTemplateLikes.ts
import { useState, useEffect, useCallback } from "react";

const LIKED_STORAGE_KEY = "prp_liked_templates_v1";
const COUNTS_STORAGE_KEY = "prp_template_likes_delta_v1";

// Deterministic base like count based on template ID hash
function getDeterministicBaseCount(id: any): number {
  const str = String(id);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 75) + 14;
}

export function useTemplateLikes() {
  const [likedIds, setLikedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(LIKED_STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [likeDeltas, setLikeDeltas] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem(COUNTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(Array.from(likedIds)));
    } catch (e) {
      console.warn("Failed to persist liked templates", e);
    }
  }, [likedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(COUNTS_STORAGE_KEY, JSON.stringify(likeDeltas));
    } catch (e) {
      console.warn("Failed to persist like counts", e);
    }
  }, [likeDeltas]);

  const isLiked = useCallback(
    (templateId: any): boolean => {
      return likedIds.has(String(templateId));
    },
    [likedIds]
  );

  const getLikesCount = useCallback(
    (templateId: any): number => {
      const idStr = String(templateId);
      const base = getDeterministicBaseCount(templateId);
      const delta = likeDeltas[idStr] || 0;
      return Math.max(0, base + delta);
    },
    [likeDeltas]
  );

  // Optimistic toggle like
  const toggleLike = useCallback(
    (templateId: any): boolean => {
      const idStr = String(templateId);
      const currentlyLiked = likedIds.has(idStr);
      const willBeLiked = !currentlyLiked;

      // Optimistically update liked state
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (currentlyLiked) {
          next.delete(idStr);
        } else {
          next.add(idStr);
        }
        return next;
      });

      // Optimistically update count
      setLikeDeltas((prev) => {
        const currentDelta = prev[idStr] || 0;
        return {
          ...prev,
          [idStr]: currentlyLiked ? currentDelta - 1 : currentDelta + 1,
        };
      });

      return willBeLiked;
    },
    [likedIds]
  );

  return {
    isLiked,
    getLikesCount,
    toggleLike,
  };
}
