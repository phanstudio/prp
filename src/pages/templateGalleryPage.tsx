// TemplateGallery.tsx
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import TemplateService from "../components/templateService";
import type { Template } from "../components/types";

interface TemplateGalleryProps {
  onSelectTemplate: (template: Template) => void;
  onCreateTemplate: () => void;
  isAdmin?: boolean; // admin toggle
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  onSelectTemplate,
  onCreateTemplate,
  isAdmin = false,
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("");

  useEffect(() => {
    setTemplates(TemplateService.getTemplates());
  }, []);

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.description &&
        template.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTag =
      !selectedTag || (template.tags && template.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  const allTags = [...new Set(templates.flatMap((t) => t.tags || []))].sort();

  const deleteTemplate = (templateId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm("Are you sure you want to delete this template?")) {
      TemplateService.deleteTemplate(templateId);
      setTemplates(TemplateService.getTemplates());
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Meme Templates</h1>
        {isAdmin && (
          <button onClick={onCreateTemplate} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="card bg-base-100 shadow-sm mb-6">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  className="input input-bordered w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
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
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-base-content/60 mb-4">
            {templates.length === 0
              ? "No templates created yet."
              : "No templates match your search."}
          </div>
          {isAdmin && templates.length === 0 && (
            <button onClick={onCreateTemplate} className="btn btn-primary">
              <Plus className="w-4 h-4" />
              Create Your First Template
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectTemplate(template)}
            >
              <figure className="relative">
                <img
                  src={template.image}
                  alt={template.name}
                  className="w-full h-48 object-cover"
                />
                {isAdmin && (
                  <button
                    onClick={(e) => deleteTemplate(template.id, e)}
                    className="btn btn-sm btn-circle btn-error absolute top-2 right-2"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
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
                    <span className="badge badge-sm badge-outline">
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
      )}
    </div>
  );
};
