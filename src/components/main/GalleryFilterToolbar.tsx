// src/components/main/GalleryFilterToolbar.tsx
import React from "react";
import { Search, X, SlidersHorizontal, Flame, Clock, Sparkles } from "lucide-react";

export interface GalleryFilterToolbarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  selectedTag: string;
  onSelectTag: (tag: string) => void;
  availableTags: string[];
  sortBy: "newest" | "popular";
  onSortChange: (sort: "newest" | "popular") => void;
  isSearching?: boolean;
  totalCount?: number;
  customActions?: React.ReactNode;
}

export const GalleryFilterToolbar: React.FC<GalleryFilterToolbarProps> = ({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  selectedTag,
  onSelectTag,
  availableTags,
  sortBy,
  onSortChange,
  isSearching = false,
  totalCount,
  customActions,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchSubmit();
    }
  };

  const hasActiveFilters = Boolean(searchTerm.trim() || selectedTag);

  return (
    <div className="space-y-3 mb-6">
      {/* Main unified search & control row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search input with integrated icons and clear */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/50 pointer-events-none" />
          <input
            type="text"
            placeholder="Search templates by title or description..."
            className="input input-sm sm:input-md input-bordered w-full pl-10 pr-20 text-xs sm:text-sm bg-base-100 rounded-xl focus:border-primary transition-all shadow-xs"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSearching}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchTerm && (
              <button
                type="button"
                onClick={onClearSearch}
                className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-base-content"
                aria-label="Clear search"
                title="Clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onSearchSubmit}
              className="btn btn-primary btn-xs sm:btn-sm rounded-lg text-primary-content"
              disabled={isSearching}
              title="Search"
            >
              {isSearching ? (
                <span className="loading loading-spinner loading-xs text-primary-content"></span>
              ) : (
                "Search"
              )}
            </button>
          </div>
        </div>

        {/* Consolidated Sort & Filter Dropdown (Replaces 2 separate bulky selects) */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-sm btn-outline border-base-300 bg-base-100 rounded-xl gap-2 font-medium text-xs sm:text-sm hover:border-primary"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
              <span>
                Sort: <span className="text-primary font-semibold">{sortBy === "popular" ? "Popular" : "Newest"}</span>
              </span>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu menu-sm bg-base-100 rounded-box z-40 w-52 p-2 shadow-xl border border-base-200 mt-2 space-y-1"
            >
              <li className="menu-title text-[10px] uppercase font-bold text-base-content/50 px-2 py-1">
                Sort Collection
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSortChange("popular")}
                  className={`flex items-center justify-between py-2 rounded-lg ${
                    sortBy === "popular" ? "active font-semibold" : ""
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-warning" />
                    Most Popular
                  </span>
                  {sortBy === "popular" && <span className="badge badge-xs badge-primary">Active</span>}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSortChange("newest")}
                  className={`flex items-center justify-between py-2 rounded-lg ${
                    sortBy === "newest" ? "active font-semibold" : ""
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-info" />
                    Newest First
                  </span>
                  {sortBy === "newest" && <span className="badge badge-xs badge-primary">Active</span>}
                </button>
              </li>

              {hasActiveFilters && (
                <>
                  <div className="divider my-1"></div>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        onClearSearch();
                        onSelectTag("");
                      }}
                      className="text-error font-medium py-1.5"
                    >
                      Reset All Filters
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Any custom action slot (e.g., Admin Create Template or secondary button) */}
          {customActions}
        </div>
      </div>

      {/* Quick Category Tag Pills (Horizontal smooth scrolling) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          type="button"
          onClick={() => onSelectTag("")}
          className={`btn btn-xs rounded-full px-3 text-xs font-medium transition-all ${
            !selectedTag
              ? "btn-primary text-primary-content shadow-xs"
              : "btn-ghost bg-base-100 border border-base-200/80 hover:bg-base-200"
          }`}
        >
          <Sparkles className="w-3 h-3" />
          All Templates
          {typeof totalCount === "number" && (
            <span className="opacity-75 font-mono text-[10px]">({totalCount})</span>
          )}
        </button>

        {availableTags.map((tag) => {
          const isSelected = selectedTag === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onSelectTag(isSelected ? "" : tag)}
              className={`btn btn-xs rounded-full px-3 text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? "btn-primary text-primary-content shadow-xs"
                  : "btn-ghost bg-base-100 border border-base-200/80 hover:bg-base-200 text-base-content/80"
              }`}
            >
              #{tag}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GalleryFilterToolbar;

