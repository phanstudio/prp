import React, { useState, useRef } from "react";
import { allFonts, recommendedFonts } from "../../utilities/fontList";

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
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const handleFontSelect = (fontName: string) => {
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
        <span style={{ fontFamily: value || "inherit" }}>
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
          onClick={(e) => e.stopPropagation()} // keep dropdown open while typing
        />

        {/* Options */}
        <div className="max-h-48 overflow-y-auto">
          {filteredFonts.map((font) => (
            <div
              key={font.name}
              className={`px-3 py-2 cursor-pointer hover:bg-accent/20 ${
                font.recommended ? "font-semibold" : ""
              }`}
              style={!font.recommended ? { fontFamily: font.name } : {}}
              onClick={() => handleFontSelect(font.name)}
            >
              {font.name}
              {font.recommended && (
                <span className="ml-2 text-xs text-accent">
                  (Recommended)
                </span>
              )}
            </div>
          ))}

          {filteredFonts.length === 0 && (
            <div className="px-3 py-2 text-sm">No fonts found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FontSelector;
