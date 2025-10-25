// src/components/FontSelector.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { allFonts, recommendedFonts } from "../../utilities/fontList";
import { queueFontLoad, ensureFontLoaded, isFontLoaded, isFontLoading } from "../../utilities/fontLoader";

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
  const initRef = useRef<boolean>(false)

  // Ensure the current value font is loaded
  useEffect(() => {
    if (initRef.current) return
    if (value && !isFontLoaded(value)) {
      console.log(value);
      ensureFontLoaded(value).then(() => {
        onChange(value);
        forceUpdate(prev => prev + 1);
      });
    }
    initRef.current = true
  }, [value]);

  // Merge recommended flag into the list
  const fontOptions: FontOption[] = allFonts.map((font) => ({
    name: font,
    recommended: recommendedFonts
      .map((r) => r.toLowerCase())
      .includes(font.toLowerCase()),
  }));

  const filteredFonts = fontOptions
    .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => Number(b.recommended) - Number(a.recommended));

  // Setup Intersection Observer for progressive loading
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const fontName = entry.target.getAttribute('data-font');
            if (fontName) {
              queueFontLoad(fontName);
              // Force re-render to show loaded state
              setTimeout(() => forceUpdate(prev => prev + 1), 200);
            }
          }
        });
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '100px', // Load 100px before visible
        threshold: 0.01,
      }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Observe font elements
  const setFontRef = useCallback((fontName: string, element: HTMLDivElement | null) => {
    if (element) {
      fontRefs.current.set(fontName, element);
      observerRef.current?.observe(element);
    } else {
      const oldElement = fontRefs.current.get(fontName);
      if (oldElement) {
        observerRef.current?.unobserve(oldElement);
        fontRefs.current.delete(fontName);
      }
    }
  }, []);

  const handleFontSelect = async (fontName: string) => {
    // Ensure font is loaded before applying
    await ensureFontLoaded(fontName);
    onChange(fontName);
    setSearch("");
    // Close dropdown after selection
    (document.activeElement as HTMLElement)?.blur();
  };

  return (
    <div className="dropdown dropdown-top w-full">
      {/* Focusable trigger */}
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
        {/* Search box */}
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search fonts..."
          className="input input-sm w-full rounded-none border-b border-base-300"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />

        {/* Options with progressive loading */}
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
                    <span className="ml-2 text-xs text-accent">
                      ★
                    </span>
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