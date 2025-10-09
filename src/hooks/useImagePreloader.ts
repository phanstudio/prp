import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function useImagePreloader(imageUrl?: string, fallbackPath?: string) {
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setLoaded(true);
    img.onerror = () => {
      if (fallbackPath) navigate(fallbackPath, { replace: true });
    };
  }, [imageUrl, navigate, fallbackPath]);

  return loaded;
}
