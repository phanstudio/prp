// TemplateGallery.tsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Trash2, Search, Edit2, X } from "lucide-react";
import type { Template } from "../components/types";
import TemplateService from "../services/templateService";
import { useTemplates } from "../contexts/TemplateContext";

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

  const { templates, appendTemplatesPaginated, clearTemplates } = useTemplates();

  // pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 12; // adjust as needed
  
  // loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [_, setDeleteError] = useState<string | null>(null); //deleteError


  const fetchTemplates = async (pageNum: number, search: string = urlSearchTerm) => {
    try {
      setSearchError(null);
      const data = await TemplateService.getTemplates(search, (pageNum - 1) * pageSize, pageSize);
      
      if (data.length < pageSize) {
        setHasMore(false); // ✅ This hides "Load More"
      } else {
        setHasMore(true);
      }
      
      appendTemplatesPaginated(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setSearchError('Failed to load templates. Please try again.');
      setHasMore(false);
    }
  };

  const performSearch = async () => {
    const trimmedSearch = searchTerm.trim();
    
    // Update URL with search query
    if (trimmedSearch) {
      setSearchParams({ q: trimmedSearch });
    } else {
      setSearchParams({});
    }
    
    // Reset pagination and fetch from beginning
    setPage(1);
    setHasMore(true);
    clearTemplates(); // Clear existing templates
    setIsSearching(true);
    await fetchTemplates(1, trimmedSearch);
    setIsSearching(false);
  };
  // page number gets reset but not the content
  const clearSearch = async () => {
    setSearchTerm("");
    setSearchParams({}); // Remove query param from URL
    setPage(1);
    setHasMore(true);
    clearTemplates();
    setIsSearching(true);
    await fetchTemplates(1, "");
    setIsSearching(false);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      performSearch();
    }
  };

  // Sync search input with URL on mount and when URL changes
  useEffect(() => {
    setSearchTerm(urlSearchTerm);
  }, [urlSearchTerm]);

  // Initial load based on URL search param
  useEffect(() => {
    const initialLoad = async () => {
      if (templates.length === 0) {
        setIsInitialLoading(true);
        await fetchTemplates(1, urlSearchTerm);
        setIsInitialLoading(false);
      }else{
        await fetchTemplates(1, urlSearchTerm);
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
    await fetchTemplates(nextPage);
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

  const filteredTemplates = templates
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

  const allTags = [...new Set(templates.flatMap((t) => t.tags || []))].sort();

  const deleteTemplate = async (
    templateId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    if (!confirm("Are you sure you want to delete this template?")) return;
  
    setDeleteError(null);
    setDeletingIds((prev) => new Set(prev).add(templateId));
  
    try {
      await TemplateService.deleteTemplate(templateId);
  
      // reload from first page
      // way to metigate t multi select delete
      setPage(1);
      setHasMore(true);
      clearTemplates();
      setIsSearching(true);
      await fetchTemplates(1, urlSearchTerm);
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
    <div className="max-w-7xl mx-auto p-4">
      {/* Full page loading overlay - only show when templates storage is empty */}
      {isInitialLoading && templates.length === 0 && (
        <div className="fixed inset-0 bg-base-100/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <span className="loading loading-spinner loading-lg"></span>
            <p className="text-base-content/70">Loading templates...</p>
          </div>
        </div>
      )}

      {/* Small loading indicator for searches when there's already content */}
      {isSearching && templates.length > 0 && (
        <div className="alert alert-info mb-4">
          <span className="loading loading-spinner loading-sm"></span>
          <span>Searching templates...</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Meme Templates</h1>
        {isAdmin && (
          <button onClick={onCreateTemplate} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        )}
      </div>

      {/* Search + Filter */}
      <div className="card bg-base-100 shadow-sm mb-6">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  className="input input-bordered w-full pl-10 pr-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  disabled={isSearching}
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50 hover:text-base-content"
                    aria-label="Clear search"
                    disabled={isSearching}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button 
                onClick={performSearch} 
                className="btn btn-primary"
                aria-label="Search"
                disabled={isSearching}
              >
                {isSearching ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="sm:w-48">
              <select
                className="select select-bordered w-full"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="">All Categories</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Active search indicator */}
          {urlSearchTerm && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-base-content/70">
                Searching for: <span className="font-semibold">{urlSearchTerm}</span>
              </span>
              <button
                onClick={clearSearch}
                className="btn btn-ghost btn-xs"
                disabled={isSearching}
              >
                Clear
              </button>
            </div>
          )}
          
          {/* Error message */}
          {searchError && (
            <div className="alert alert-error mt-2">
              <span>{searchError}</span>
              <button
                onClick={() => {
                  setSearchError(null);
                  performSearch();
                }}
                className="btn btn-sm btn-ghost"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 && !isInitialLoading && !isSearching ? (
        <div className="text-center py-12">
          <div className="text-base-content/60 mb-4">
            {searchError ? (
              "Failed to load templates."
            ) : templates.length === 0 ? (
              urlSearchTerm 
                ? `No templates found for "${urlSearchTerm}"`
                : "No templates created yet."
            ) : (
              "No templates match your search."
            )}
          </div>
          {urlSearchTerm && !searchError && (
            <button onClick={clearSearch} className="btn btn-outline">
              Clear Search
            </button>
          )}
          {isAdmin && templates.length === 0 && !urlSearchTerm && !searchError && (
            <button onClick={onCreateTemplate} className="btn btn-primary">
              <Plus className="w-4 h-4" />
              Create Your First Template
            </button>
          )}
        </div>
      ) : isSearching && templates.length === 0 ? (
        <div className="text-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="text-base-content/70 mt-4">Searching templates...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id.toString()}
                className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onSelectTemplate(template)}
              >
                <figure className="relative">
                  <img
                    src={template.thumbnailUrl}
                    alt={template.name}
                    className="w-full h-48 object-cover"
                  />
                  {isAdmin && (
                    <div className="join absolute top-2 right-2 gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTemplate(template.id.toString(), e);
                        }}
                        className="btn btn-sm btn-circle btn-error join-item disabled:!bg-neutral disabled:!opacity-80"
                        disabled={deletingIds.has(template.id.toString())}
                      >
                        {deletingIds.has(template.id.toString()) ? (
                          <span className="loading loading-spinner loading-xs text-error"/>
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTemplate(template);
                        }}
                        className="btn btn-sm btn-circle btn-error join-item"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </figure>

                <div className="card-body">
                  <h3 className="card-title text-sm">{template.name}</h3>
                  {template.description && (
                    <p className="text-xs text-base-content/70 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.tags?.slice(0, 3).map((tag) => (
                      <span key={tag} className="badge badge-sm badge-outline">
                        {tag}
                      </span>
                    ))}
                    {(template.tags?.length || 0) > 3 && (
                      <span className="badge badge-sm badge-ghost">
                        +{(template.tags?.length || 0) - 3}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-base-content/50 mt-2">
                    {template.textElements.length} text elements
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination button */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button 
                onClick={loadMore} 
                className={`btn ${!isLoadingMore ? "btn-outline": "btn-ghost"}`}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <span className="loading loading-spinner loading-sm text-accent"/>
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};