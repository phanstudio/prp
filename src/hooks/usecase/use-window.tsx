// import { useEffect, useState } from "react"

// type WindowSize = {
//   width: number | undefined
//   height: number | undefined
// }

// type WindowDimensions = {
//   windowSize: WindowSize
//   isMobile: boolean
//   isDesktop: boolean
// }

// export function useWindow(): WindowDimensions {
//   const [windowSize, setWindowSize] = useState<WindowSize>(() => {
//     // Initialize with actual window dimensions on mount
//     // This ensures dimensions are available immediately
//     if (typeof window !== 'undefined') {
//       return {
//         width: window.innerWidth,
//         height: window.innerHeight,
//       }
//     }
//     return {
//       width: undefined,
//       height: undefined,
//     }
//   })

//   useEffect(() => {
//     const handleResize = () => {
//       setWindowSize({
//         width: window.innerWidth,
//         height: window.innerHeight,
//       })
//     }

//     // Only add listener, don't call handleResize since state is already initialized
//     window.addEventListener("resize", handleResize)

//     return () => window.removeEventListener("resize", handleResize)
//   }, [])

//   const isMobile: boolean =
//     typeof windowSize.width === "number" && windowSize.width < 768
//   const isDesktop: boolean =
//     typeof windowSize.width === "number" && windowSize.width >= 768

//   return { windowSize, isMobile, isDesktop }
// }


import { useEffect, useState } from "react";

type WindowSize = {
  width: number | undefined;
  height: number | undefined;
};

type WindowDimensions = {
  windowSize: WindowSize;
  isMobile: boolean;
  isDesktop: boolean;
};

/**
 * This version still returns {windowSize, isMobile, isDesktop}
 * BUT it tracks the REAL canvas container using ResizeObserver.
 * This fixes the shrinking issue.
 */
export function useWindow(): WindowDimensions {
  const [size, setSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // Track the canvas container instead of the full window
    const container = document.getElementById("canvas-wrapper");

    // Fallback → if wrapper does not exist, use window size like before
    if (!container) {
      const fallback = () => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };
      fallback();
      window.addEventListener("resize", fallback);
      return () => window.removeEventListener("resize", fallback);
    }

    // Use ResizeObserver to track layout changes even if window doesn't change
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setSize({
        width: rect.width,
        height: rect.height,
      });
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  const isMobile =
    typeof size.width === "number" && size.width < 768;

  const isDesktop =
    typeof size.width === "number" && size.width >= 768;

  return {
    windowSize: size,
    isMobile,
    isDesktop,
  };
}
