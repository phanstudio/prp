import { useEffect, useState } from "react";

type WindowSize = {
  width: number;
  height: number;
};

type WindowDimensions = {
  windowSize: WindowSize;
  isMobile: boolean;
  isDesktop: boolean;
};

export function useWindow(): WindowDimensions {
  const [size, setSize] = useState<WindowSize>(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
  }));

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = size.width < 768;
  const isDesktop = size.width >= 768;

  return {
    windowSize: size,
    isMobile,
    isDesktop,
  };
}
