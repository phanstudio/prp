// src/components/FontSelector.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { allFonts, recommendedFonts } from "../../utilities/fontList";
import {
  queueFontLoad,
  ensureFontLoadedsync,
  isFontLoaded,
  isFontLoading
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
  const [search, setSearch] = useState("");
  const [, forceUpdate] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const fontRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const initRef = useRef<boolean>(false);

  // -------------------------------
  // Ensure the selected font is loaded
  // -------------------------------
  useEffect(() => {
    if (initRef.current) return;
    if (value && !isFontLoaded(value)) {
      ensureFontLoadedsync(value).then(() => {
        onChange(value);
        forceUpdate((prev) => prev + 1);
      });
    }
    initRef.current = true;
  }, [value]);

  // --------------------------------
  // Prepare font list
  // --------------------------------
  const fontOptions: FontOption[] = allFonts.map((font) => ({
    name: font,
    recommended: recommendedFonts
      .map((r) => r.toLowerCase())
      .includes(font.toLowerCase())
  }));

  const filteredFonts = fontOptions
    .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => Number(b.recommended) - Number(a.recommended));

  // --------------------------------
  // Setup IntersectionObserver
  // --------------------------------
  useEffect(() => {
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
        threshold: 0.01
      }
    );

    return () => observerRef.current?.disconnect();
  }, []);

  // -----------------------------------------
  // DELAY observe items UNTIL layout is stable
  // -----------------------------------------
  useEffect(() => {
    const timeout = setTimeout(() => {
      const observer = observerRef.current;
      if (!observer) return;

      filteredFonts.forEach((font) => {
        const el = fontRefs.current.get(font.name);
        if (el) observer.observe(el);
      });
    }, 50);

    return () => clearTimeout(timeout);
  }, [filteredFonts]);

  // -----------------------------------------
  // Manage individual refs
  // -----------------------------------------
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

  // -----------------------------------------
  // Handle selecting a font
  // -----------------------------------------
  const handleFontSelect = async (fontName: string) => {
    await ensureFontLoadedsync(fontName);
    onChange(fontName);
    setSearch("");
    (document.activeElement as HTMLElement)?.blur();
  };

  return (
    <div className="dropdown dropdown-top w-full">
      {/* Button */}
      <div
        tabIndex={0}
        role="button"
        className="btn btn-sm w-full justify-between normal-case font-normal"
      >
        <span style={{ fontFamily: isFontLoaded(value) ? value : "inherit" }}>
          {value || "Select font..."}
        </span>

        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Dropdown content */}
      <div
        tabIndex={0}
        className="dropdown-content z-50 bg-base-200 border border-base-300 shadow-lg w-full mt-1"
      >
        {/* Search */}
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search fonts..."
          className="input input-sm w-full rounded-none border-b border-base-300"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />

        {/* Scrollable list */}
        <div
          ref={scrollContainerRef}
          className="max-h-48 overflow-y-auto"
        >
          {filteredFonts.map((font) => {
            const isLoaded = isFontLoaded(font.name);
            const isLoading = isFontLoading(font.name);

            return (
              <div
                key={font.name}
                ref={(el) => setFontRef(font.name, el)}
                data-font={font.name}
                className={`px-3 py-2 cursor-pointer hover:bg-accent/20 flex items-center justify-between ${
                  font.recommended ? "font-semibold" : ""
                }`}
                style={isLoaded ? { fontFamily: font.name } : {}}
                onClick={() => handleFontSelect(font.name)}
              >
                <span>
                  {font.name}
                  {font.recommended && (
                    <span className="ml-2 text-xs text-accent">★</span>
                  )}
                </span>

                {isLoading && (
                  <span className="loading loading-spinner loading-xs"></span>
                )}
              </div>
            );
          })}

          {filteredFonts.length === 0 && (
            <div className="px-3 py-2 text-sm">No fonts found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FontSelector;
