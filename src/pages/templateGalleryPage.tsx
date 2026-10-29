// src/pages/templateGalleryPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Trash2, Edit2, SearchX, Sparkles, Type, Heart, ArrowRight } from "lucide-react";
import type { Template } from "../components/types";
import TemplateService from "../services/templateService";
import { useTemplates } from "../contexts/TemplateContext";
import { useToast } from "../services/ToastProvider";
import { useTemplateLikes } from "../hooks/useTemplateLikes";
import GalleryFilterToolbar from "../components/main/GalleryFilterToolbar";
import TemplateCardSkeleton from "../components/main/TemplateCardSkeleton";

interface TemplateGalleryProps {
  onSelectTemplate: (template: Template) => void;
  onCreateTemplate: () => void;
  onEditTemplate: (template: Template) => void;
  isAdmin?: boolean;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  onSelectTemplate,
  onCreateTemplate,
  onEditTemplate,
  isAdmin = false,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearchTerm = searchParams.get("q") || "";

  const [searchTerm, setSearchTerm] = useState(urlSearchTerm);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");

  const { templates, appendTemplatesPaginated, clearTemplates } = useTemplates();
  const { isLiked, getLikesCount, toggleLike } = useTemplateLikes();

  // pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 12;
  const { addToast, removeToast } = useToast();

  // loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [_, setDeleteError] = useState<string | null>(null);

  const fetchTemplates = async (
    pageNum: number,
    search: string = urlSearchTerm,
    tag: string = selectedTag,
    sort: string = sortBy
  ) => {
    try {
      setSearchError(null);
      const data = await TemplateService.getTemplates(
        search,
        (pageNum - 1) * pageSize,
        pageSize,
        tag || undefined,
        sort
      );

      if (data.length < pageSize) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      appendTemplatesPaginated(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
      setSearchError("Failed to load templates. Please try again.");
      setHasMore(false);
    }
  };

  const handleTagChange = async (newTag: string) => {
    setSelectedTag(newTag);
    setPage(1);
    setHasMore(true);
    clearTemplates();
    setIsSearching(true);
    await fetchTemplates(1, searchTerm.trim(), newTag, sortBy);
    setIsSearching(false);
  };

  const handleSortChange = async (newSort: "newest" | "popular") => {
    setSortBy(newSort);
    setPage(1);
    setHasMore(true);
    clearTemplates();
    setIsSearching(true);
    await fetchTemplates(1, searchTerm.trim(), selectedTag, newSort);
    setIsSearching(false);
  };

  const performSearch = async () => {
    const trimmedSearch = searchTerm.trim();

    if (trimmedSearch) {
      setSearchParams({ q: trimmedSearch });
    } else {
      setSearchParams({});
    }

    setPage(1);
    setHasMore(true);
    clearTemplates();
    setIsSearching(true);
    await fetchTemplates(1, trimmedSearch, selectedTag, sortBy);
    setIsSearching(false);
  };

  const clearSearch = async () => {
    setSearchTerm("");
    setSearchParams({});
    setPage(1);
    setHasMore(true);
    clearTemplates();
    setIsSearching(true);
    await fetchTemplates(1, "", selectedTag, sortBy);
    setIsSearching(false);
  };

  // Sync search input with URL on mount and when URL changes
  useEffect(() => {
    setSearchTerm(urlSearchTerm);
  }, [urlSearchTerm]);

  // Initial load
  const hasInitializedRef = React.useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    const initialLoad = async () => {
      if (templates.length === 0) {
        setIsInitialLoading(true);
        await fetchTemplates(1, urlSearchTerm);
        setIsInitialLoading(false);
      } else {
        const loader = addToast("Refreshing templates...", "loading", 0);
        await fetchTemplates(1, urlSearchTerm);
        removeToast(loader, true);
      }
    };
    initialLoad();
  }, []);

  useEffect(() => {
    if (templates.length > 0) {
      setPage(Math.ceil(templates.length / pageSize));
    }
  }, [templates]);

  const loadMore = async () => {
    const nextPage = page + 1;
    setIsLoadingMore(true);
    await fetchTemplates(nextPage, searchTerm.trim(), selectedTag, sortBy);
    setPage(nextPage);
    setIsLoadingMore(false);
  };

  const ensureTemplateId = (template: Partial<Template>): Template => {
    return {
      ...template,
      id:
        template.id ??
        (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`),
      textElements: template.textElements ?? [],
    } as Template;
  };

  // Filter & sort templates
  const filteredTemplates = useMemo(() => {
    const list = templates
      .map((t) => ensureTemplateId(t))
      .filter((template) => {
        const matchesSearch =
          template.name.toLowerCase().includes(urlSearchTerm.toLowerCase()) ||
          (template.description &&
            template.description.toLowerCase().includes(urlSearchTerm.toLowerCase()));
        const matchesTag =
          !selectedTag || (template.tags && template.tags.includes(selectedTag));

        return matchesSearch && matchesTag;
      });

    if (sortBy === "popular") {
      return [...list].sort((a, b) => getLikesCount(b.id) - getLikesCount(a.id));
    }

    return list;
  }, [templates, urlSearchTerm, selectedTag, sortBy, getLikesCount]);

  const allTags = useMemo(() => {
    return [...new Set(templates.flatMap((t) => t.tags || []))].sort();
  }, [templates]);

  const handleLike = (templateId: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const liked = toggleLike(templateId);
    if (liked) {
      addToast("Added to your favorites!", "success", 1800);
    }
  };

  const deleteTemplate = async (templateId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!confirm("Are you sure you want to delete this template?")) return;

    setDeleteError(null);
    setDeletingIds((prev) => new Set(prev).add(templateId));

    try {
      await TemplateService.deleteTemplate(templateId);
      setPage(1);
      setHasMore(true);
      clearTemplates();
      setIsSearching(true);
      await fetchTemplates(1, urlSearchTerm, selectedTag, sortBy);
      setIsSearching(false);
    } catch (err) {
      console.error("Failed to delete template:", err);
      setDeleteError("Failed to delete template. Please try again.");
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(templateId);
        return newSet;
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Top Shimmer Loading Bar */}
      {(isInitialLoading || isSearching || isLoadingMore) && (
        <div className="fixed top-16 left-0 right-0 z-30 h-1 bg-base-200/50 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary via-accent to-primary animate-shimmer w-full" />
        </div>
      )}

      {/* Header section with title and stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Meme Templates
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-0.5">
            Discover, customize, and generate instant memes
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onCreateTemplate}
            className="btn btn-primary btn-sm rounded-xl gap-1.5 shadow-sm btn-press"
          >
            <Plus className="w-4 h-4 text-primary-content" />
            Create Template
          </button>
        )}
      </div>

      {/* Unified Filter Toolbar (Consolidated custom component) */}
      <GalleryFilterToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={performSearch}
        onClearSearch={clearSearch}
        selectedTag={selectedTag}
        onSelectTag={handleTagChange}
        availableTags={allTags}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        isSearching={isSearching}
        totalCount={filteredTemplates.length}
      />

      {/* Search error alert */}
      {searchError && (
        <div className="alert alert-error mb-4 shadow-sm text-xs sm:text-sm flex justify-between items-center">
          <span>{searchError}</span>
          <button
            onClick={() => {
              setSearchError(null);
              performSearch();
            }}
            className="btn btn-xs btn-ghost"
          >
            Retry
          </button>
        </div>
      )}

      {/* Templates Grid / Skeleton Loading / Zero State */}
      {isInitialLoading || (isSearching && templates.length === 0) ? (
        <TemplateCardSkeleton count={8} />
      ) : filteredTemplates.length === 0 ? (
        <div className="card bg-base-100 shadow-sm border border-base-200 text-center py-16 px-4 max-w-lg mx-auto my-8 rounded-2xl">
          <div className="flex flex-col items-center">
            {urlSearchTerm || selectedTag ? (
              <>
                <div className="p-4 bg-base-200 rounded-full mb-3">
                  <SearchX className="w-8 h-8 text-base-content/60" />
                </div>
                <h3 className="text-base font-bold mb-1">No templates found</h3>
                <p className="text-xs text-base-content/70 mb-4 max-w-xs">
                  We couldn't find anything matching your filters.
                </p>
                <button
                  onClick={() => {
                    clearSearch();
                    setSelectedTag("");
                  }}
                  className="btn btn-outline btn-sm rounded-xl"
                >
                  Clear All Filters
                </button>
              </>
            ) : (
              <>
                <div className="p-4 bg-primary/10 text-primary rounded-full mb-3">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold mb-1">No templates yet!</h3>
                <p className="text-xs text-base-content/70 mb-4 max-w-xs">
                  Create the first meme template to get started with the collection.
                </p>
                {isAdmin && (
                  <button onClick={onCreateTemplate} className="btn btn-primary btn-sm rounded-xl">
                    <Plus className="w-4 h-4 text-primary-content" />
                    Create Your First Template
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => {
              const liked = isLiked(template.id);
              const likes = getLikesCount(template.id);

              return (
                <div
                  key={template.id.toString()}
                  className="card bg-base-100 border border-base-200/80 shadow-xs card-interactive rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between group"
                  onClick={() => onSelectTemplate(template)}
                >
                  {/* Card Media Preview */}
                  <figure className="relative bg-base-300 h-48 w-full overflow-hidden shrink-0">
                    <img
                      src={template.thumbnailUrl}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src =
                          "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20300%20200%22%3E%3Crect%20width%3D%22300%22%20height%3D%22200%22%20fill%3D%22%232a2e37%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23888%22%20font-size%3D%2214%22%20font-family%3D%22sans-serif%22%3EImage%20Unavailable%3C%2Ftext%3E%3C%2Fsvg%3E";
                      }}
                    />

                    {/* Admin Action Buttons with High-Contrast Colors */}
                    {isAdmin && (
                      <div className="join absolute top-2 right-2 gap-1.5 z-10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTemplate(template.id.toString(), e);
                          }}
                          className="btn btn-xs btn-circle btn-error shadow-sm text-white"
                          disabled={deletingIds.has(template.id.toString())}
                          title="Delete Template"
                        >
                          {deletingIds.has(template.id.toString()) ? (
                            <span className="loading loading-spinner loading-xs text-white" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5 text-white" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTemplate(template);
                          }}
                          className="btn btn-xs btn-circle btn-neutral shadow-sm text-neutral-content"
                          title="Edit Template"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-neutral-content" />
                        </button>
                      </div>
                    )}
                  </figure>

                  {/* Standardized Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-2.5">
                    <div>
                      {/* Truncated Name with Tooltip */}
                      <h3
                        className="text-sm font-bold truncate text-base-content group-hover:text-primary transition-colors"
                        title={template.name}
                      >
                        {template.name}
                      </h3>

                      {/* Clamped Description with Consistent Height */}
                      <p
                        className="text-xs text-base-content/65 line-clamp-2 h-8 leading-snug mt-1"
                        title={template.description || ""}
                      >
                        {template.description || "No description provided."}
                      </p>

                      {/* Tag Badges */}
                      <div className="flex flex-wrap gap-1 mt-2 max-h-5 overflow-hidden">
                        {template.tags?.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="badge badge-xs badge-ghost text-base-content/70 px-1.5 py-0.5 truncate max-w-[90px]"
                            title={tag}
                          >
                            #{tag}
                          </span>
                        ))}
                        {(template.tags?.length || 0) > 3 && (
                          <span className="badge badge-xs badge-ghost text-[10px] opacity-60">
                            +{(template.tags?.length || 0) - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Standardized Bottom Stats & Action Bar */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-base-200/70 mt-1">
                      <div className="flex items-center gap-2">
                        {/* Text Element Icon Badge */}
                        <div
                          className="flex items-center gap-1 text-xs text-base-content/70 font-mono bg-base-200/70 px-2 py-0.5 rounded-md"
                          title={`${template.textElements.length} text captions`}
                        >
                          <Type className="w-3.5 h-3.5 text-primary" />
                          <span>{template.textElements.length}</span>
                        </div>

                        {/* Optimistic Liking Button & Count */}
                        <button
                          type="button"
                          onClick={(e) => handleLike(template.id, e)}
                          className="flex items-center gap-1 text-xs text-base-content/70 hover:text-error transition-colors px-1.5 py-0.5 rounded-md hover:bg-error/10 btn-press"
                          title={liked ? "Unlike template" : "Like template"}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              liked
                                ? "fill-error text-error scale-110 heart-pop"
                                : "text-base-content/50 hover:text-error"
                            }`}
                          />
                          <span className="font-mono text-xs">{likes}</span>
                        </button>
                      </div>

                      {/* Use CTA */}
                      <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Remix
                        <ArrowRight className="w-3 h-3 text-primary" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                className="btn btn-sm btn-outline rounded-xl px-6 font-medium btn-press"
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <span className="loading loading-spinner loading-xs text-primary" />
                    Loading more templates...
                  </>
                ) : (
                  "Load More Templates"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TemplateGallery;
