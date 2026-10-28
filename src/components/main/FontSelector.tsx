// src/components/main/FontSelector.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { allFonts, recommendedFonts } from "../../utilities/fontList";
import {
  queueFontLoad,
  ensureFontLoadedsync,
  isFontLoaded,
  isFontLoading,
} from "../../utilities/fontLoader";

interface FontSelectorProps {
  value: string;
  onChange: (font: string) => void;
}

interface FontOption {
  name: string;
  recommended: boolean;
}

const FontSelector: React.FC<FontSelectorProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [, forceUpdate] = useState(0);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const fontRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 260,
  });

  // Calculate coords whenever opening
  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const popupHeight = 240;
      const spaceBelow = window.innerHeight - rect.bottom;
      const showAbove = spaceBelow < popupHeight && rect.top > popupHeight;

      setCoords({
        top: showAbove ? rect.top - popupHeight - 4 : rect.bottom + 4,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8)),
        width: Math.max(240, rect.width),
      });
    }
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setIsOpen(false);
    }
  };

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      updatePosition();
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, updatePosition]);

  // Ensure selected font is loaded
  useEffect(() => {
    if (value && !isFontLoaded(value)) {
      ensureFontLoadedsync(value).then(() => {
        forceUpdate((prev) => prev + 1);
      });
    }
  }, [value]);

  // Prepare font list
  const fontOptions: FontOption[] = allFonts.map((font) => ({
    name: font,
    recommended: recommendedFonts
      .map((r) => r.toLowerCase())
      .includes(font.toLowerCase()),
  }));

  const filteredFonts = fontOptions
    .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => Number(b.recommended) - Number(a.recommended));

  // IntersectionObserver for lazy loading fonts in viewport
  useEffect(() => {
    if (!isOpen) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const fontName = entry.target.getAttribute("data-font");
            if (fontName) {
              queueFontLoad(fontName);
              setTimeout(() => forceUpdate((prev) => prev + 1), 200);
            }
          }
        });
      },
      {
        root: scrollContainerRef.current,
        rootMargin: "120px",
        threshold: 0.01,
      }
    );

    return () => observerRef.current?.disconnect();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const timeout = setTimeout(() => {
      const observer = observerRef.current;
      if (!observer) return;

      filteredFonts.forEach((font) => {
        const el = fontRefs.current.get(font.name);
        if (el) observer.observe(el);
      });
    }, 50);

    return () => clearTimeout(timeout);
  }, [filteredFonts, isOpen]);

  const setFontRef = useCallback((fontName: string, el: HTMLDivElement | null) => {
    const observer = observerRef.current;
    if (el) {
      fontRefs.current.set(fontName, el);
    } else {
      const elem = fontRefs.current.get(fontName);
      if (elem) {
        observer?.unobserve(elem);
        fontRefs.current.delete(fontName);
      }
    }
  }, []);

  const handleFontSelect = async (fontName: string) => {
    await ensureFontLoadedsync(fontName);
    onChange(fontName);
    setSearch("");
    setIsOpen(false);
  };

  return (
    <div className="w-full relative">
      <label className="label-text text-xs mb-1 block">Font Family</label>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="btn btn-sm btn-outline border-base-300 w-full justify-between normal-case font-normal text-left px-3 h-9"
      >
        <span
          className="truncate"
          style={{ fontFamily: isFontLoaded(value) ? value : "inherit" }}
        >
          {value || "Select font..."}
        </span>
        <svg
          className={`w-4 h-4 ml-2 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Popover rendered via Portal at highest z-level */}
      {isOpen &&
        createPortal(
          <div
            ref={popupRef}
            className="fixed z-[99999] bg-base-100 border border-base-300 shadow-2xl rounded-lg overflow-hidden flex flex-col"
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              maxHeight: "250px",
            }}
          >
            {/* Search Input */}
            <div className="p-2 border-b border-base-300 bg-base-200/50">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search fonts..."
                className="input input-xs input-bordered w-full rounded"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Scrollable list */}
            <div
              ref={scrollContainerRef}
              className="overflow-y-auto max-h-48 divide-y divide-base-200"
            >
              {filteredFonts.map((font) => {
                const isLoaded = isFontLoaded(font.name);
                const isLoading = isFontLoading(font.name);
                const isCurrent = value === font.name;

                return (
                  <div
                    key={font.name}
                    ref={(el) => setFontRef(font.name, el)}
                    data-font={font.name}
                    className={`px-3 py-2 cursor-pointer flex items-center justify-between transition-colors text-sm ${
                      isCurrent
                        ? "bg-primary text-primary-content font-medium"
                        : "hover:bg-base-200"
                    }`}
                    style={isLoaded ? { fontFamily: font.name } : {}}
                    onClick={() => handleFontSelect(font.name)}
                  >
                    <span className="truncate">
                      {font.name}
                      {font.recommended && (
                        <span className="ml-2 text-xs text-warning">★</span>
                      )}
                    </span>

                    {isLoading && (
                      <span className="loading loading-spinner loading-xs ml-2"></span>
                    )}
                  </div>
                );
              })}

              {filteredFonts.length === 0 && (
                <div className="px-3 py-4 text-center text-xs text-base-content/60">
                  No fonts matching "{search}"
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default FontSelector;
