import React, { useRef, useState, useEffect } from "react";
import { Search, Plus, Edit3, Trash2, Download, ArrowLeft } from "lucide-react";
import type { TextElement, Template } from './types'
import TemplateService from "./templateService";

// Mock Canvas Component (simplified for this demo)
const MockCanvas: React.FC<{
  image: HTMLImageElement | null;
  textElements: TextElement[];
  selectedElement: string | null;
  onElementSelect: (id: string | null) => void;
  onElementMove: (id: string, x: number, y: number) => void;
  onElementRotate: (id: string, rotation: number) => void;
  onSave?: () => void;
}> = ({ image, textElements, selectedElement, onElementSelect, onElementMove, onElementRotate, onSave }) => {
  return (
    <div className="border-2 border-dashed border-base-300 rounded-lg p-8 text-center bg-base-100">
      {image ? (
        <div className="relative inline-block">
          <img 
            src={image.src} 
            alt="Template" 
            className="max-w-full max-h-96 rounded-lg shadow-sm"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-50 text-white p-2 rounded">
              Canvas Component ({textElements.length} text elements)
            </div>
          </div>
        </div>
      ) : (
        <div className="text-base-content/60">
          <div className="w-96 h-64 bg-base-200 rounded-lg mx-auto flex items-center justify-center">
            Canvas Placeholder
          </div>
        </div>
      )}
    </div>
  );
};


// Template Creator Component
export const TemplateCreator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateTags, setTemplateTags] = useState('');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const addText = () => {
    const newElement: TextElement = {
      id: Date.now().toString(),
      text: "Sample Text",
      x: 50,
      y: 50 + textElements.length * 40,
      fontSize: 24,
      color: "#ffffff",
      fontFamily: "Arial",
      rotation: 0,
    };

    setTextElements([...textElements, newElement]);
    setSelectedElement(newElement.id);
  };

  const updateSelectedText = (field: keyof TextElement, value: string | number) => {
    if (!selectedElement) return;

    setTextElements((prev) =>
      prev.map((element) =>
        element.id === selectedElement
          ? { ...element, [field]: value }
          : element
      )
    );
  };

  const moveElement = (id: string, x: number, y: number) => {
    setTextElements((prev) =>
      prev.map((element) =>
        element.id === id ? { ...element, x, y } : element
      )
    );
  };

  const deleteSelectedElement = () => {
    if (!selectedElement) return;
    setTextElements((prev) => prev.filter((el) => el.id !== selectedElement));
    setSelectedElement(null);
  };

  const saveTemplate = () => {
    if (!image || !templateName.trim()) {
      alert('Please provide an image and template name');
      return;
    }

    const template = {
      name: templateName.trim(),
      description: templateDescription.trim(),
      image: image.src,
      textElements: textElements,
      tags: templateTags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    TemplateService.saveTemplate(template);
    alert('Template saved successfully!');
    
    // Reset form
    setTemplateeName('');
    setTemplateDescription('');
    setTemplateTags('');
    setTextElements([]);
    setImage(null);
    setSelectedElement(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="btn btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
        </button>
        <h1 className="text-3xl font-bold">Template Creator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Design Area</h2>
              
              {/* Image Upload */}
              <div className="mb-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="file-input file-input-bordered w-full"
                />
              </div>

              {/* Canvas */}
              <MockCanvas
                image={image}
                textElements={textElements}
                selectedElement={selectedElement}
                onElementSelect={setSelectedElement}
                onElementMove={moveElement}
                onElementRotate={(id, rotation) => {
                  setTextElements(elements => 
                    elements.map(el => 
                      el.id === id ? { ...el, rotation } : el
                    )
                  );
                }}
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Template Info */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="font-semibold mb-4">Template Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Template Name *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter template name"
                    className="input input-bordered w-full"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="label">
                    <span className="label-text">Description</span>
                  </label>
                  <textarea
                    placeholder="Template description (optional)"
                    className="textarea textarea-bordered w-full"
                    rows={3}
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="label">
                    <span className="label-text">Tags</span>
                  </label>
                  <input
                    type="text"
                    placeholder="funny, reaction, meme (comma separated)"
                    className="input input-bordered w-full"
                    value={templateTags}
                    onChange={(e) => setTemplateTags(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Text Controls */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="font-semibold mb-4">Text Elements</h3>
              
              <button onClick={addText} className="btn btn-primary w-full mb-4">
                <Plus className="w-4 h-4" />
                Add Text Box
              </button>

              {/* Text Elements List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {textElements.map((element, index) => (
                  <div 
                    key={element.id}
                    className={`p-3 rounded border ${
                      selectedElement === element.id ? 'border-primary bg-primary/10' : 'border-base-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Text {index + 1}</span>
                      <button
                        onClick={() => setSelectedElement(selectedElement === element.id ? null : element.id)}
                        className="btn btn-xs btn-ghost"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Enter text..."
                      className="input input-sm input-bordered w-full mb-2"
                      value={element.text}
                      onChange={(e) => {
                        setSelectedElement(element.id);
                        updateSelectedText('text', e.target.value);
                      }}
                    />
                    
                    {selectedElement === element.id && (
                      <div className="space-y-2 pt-2 border-t border-base-300">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="label-text text-xs">Size</label>
                            <input
                              type="number"
                              className="input input-xs input-bordered w-full"
                              value={element.fontSize}
                              onChange={(e) => updateSelectedText('fontSize', parseInt(e.target.value) || 24)}
                            />
                          </div>
                          <div>
                            <label className="label-text text-xs">Color</label>
                            <input
                              type="color"
                              className="input input-xs input-bordered w-full h-8"
                              value={element.color}
                              onChange={(e) => updateSelectedText('color', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <button
                          onClick={deleteSelectedElement}
                          className="btn btn-xs btn-error w-full"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {textElements.length === 0 && (
                <div className="text-center text-base-content/60 py-8">
                  No text elements yet.<br />
                  Add some text boxes to create your template.
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <button 
            onClick={saveTemplate}
            className="btn btn-success w-full btn-lg"
            disabled={!image || !templateName.trim()}
          >
            <Download className="w-5 h-5" />
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
};

// Template Gallery Component
export const TemplateGallery: React.FC<{ 
  onSelectTemplate: (template: Template) => void;
  onCreateTemplate: () => void;
}> = ({ onSelectTemplate, onCreateTemplate }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  useEffect(() => {
    setTemplates(TemplateService.getTemplates());
  }, []);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTag = !selectedTag || (template.tags && template.tags.includes(selectedTag));
    
    return matchesSearch && matchesTag;
  });

  const allTags = [...new Set(templates.flatMap(t => t.tags || []))].sort();

  const deleteTemplate = (templateId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this template?')) {
      TemplateService.deleteTemplate(templateId);
      setTemplates(TemplateService.getTemplates());
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Meme Templates</h1>
        <button 
          onClick={onCreateTemplate}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </button>
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
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
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
            {templates.length === 0 ? 'No templates created yet.' : 'No templates match your search.'}
          </div>
          {templates.length === 0 && (
            <button 
              onClick={onCreateTemplate}
              className="btn btn-primary"
            >
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
                <button
                  onClick={(e) => deleteTemplate(template.id, e)}
                  className="btn btn-sm btn-circle btn-error absolute top-2 right-2"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </figure>
              
              <div className="card-body">
                <h3 className="card-title text-sm">{template.name}</h3>
                {template.description && (
                  <p className="text-xs text-base-content/70 line-clamp-2">
                    {template.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.tags?.slice(0, 3).map(tag => (
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

// Meme Generator Component
export const MemeGenerator: React.FC<{ 
  template: Template;
  onBack: () => void;
}> = ({ template, onBack }) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [textElements, setTextElements] = useState<TextElement[]>(
    template.textElements.map(el => ({ ...el, id: Date.now().toString() + Math.random() }))
  );
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = template.image;
  }, [template]);

  const addText = () => {
    const newElement: TextElement = {
      id: Date.now().toString(),
      text: "New Text",
      x: 50,
      y: 50 + textElements.length * 40,
      fontSize: 24,
      color: "#ffffff",
      fontFamily: "Arial",
      rotation: 0,
    };

    setTextElements([...textElements, newElement]);
    setSelectedElement(newElement.id);
  };

  const updateSelectedText = (field: keyof TextElement, value: string | number) => {
    if (!selectedElement) return;

    setTextElements((prev) =>
      prev.map((element) =>
        element.id === selectedElement
          ? { ...element, [field]: value }
          : element
      )
    );
  };

  const moveElement = (id: string, x: number, y: number) => {
    setTextElements((prev) =>
      prev.map((element) =>
        element.id === id ? { ...element, x, y } : element
      )
    );
  };

  const deleteSelectedElement = () => {
    if (!selectedElement) return;
    setTextElements((prev) => prev.filter((el) => el.id !== selectedElement));
    setSelectedElement(null);
  };

  const resetToTemplate = () => {
    setTextElements(template.textElements.map(el => ({ 
      ...el, 
      id: Date.now().toString() + Math.random() 
    })));
    setSelectedElement(null);
  };

  const saveMeme = () => {
    alert('Meme saved! (This would download the image)');
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="btn btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Templates
        </button>
        <div>
          <h1 className="text-3xl font-bold">Editing: {template.name}</h1>
          <p className="text-base-content/70">{template.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <MockCanvas
                image={image}
                textElements={textElements}
                selectedElement={selectedElement}
                onElementSelect={setSelectedElement}
                onElementMove={moveElement}
                onElementRotate={(id, rotation) => {
                  setTextElements(elements => 
                    elements.map(el => 
                      el.id === id ? { ...el, rotation } : el
                    )
                  );
                }}
                onSave={saveMeme}
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button onClick={addText} className="btn btn-primary w-full">
                  <Plus className="w-4 h-4" />
                  Add Text
                </button>
                <button onClick={resetToTemplate} className="btn btn-neutral w-full">
                  Reset to Template
                </button>
                <button onClick={saveMeme} className="btn btn-success w-full">
                  <Download className="w-4 h-4" />
                  Generate Meme
                </button>
              </div>
            </div>
          </div>

          {/* Text Elements */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="font-semibold mb-4">Text Elements</h3>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {textElements.map((element, index) => (
                  <div 
                    key={element.id}
                    className={`p-3 rounded border ${
                      selectedElement === element.id ? 'border-primary bg-primary/10' : 'border-base-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Text {index + 1}</span>
                      <button
                        onClick={() => setSelectedElement(selectedElement === element.id ? null : element.id)}
                        className="btn btn-xs btn-ghost"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <textarea
                      placeholder="Enter your meme text..."
                      className="textarea textarea-sm textarea-bordered w-full mb-2 min-h-20"
                      value={element.text}
                      onChange={(e) => {
                        setSelectedElement(element.id);
                        updateSelectedText('text', e.target.value);
                      }}
                      onFocus={() => setSelectedElement(element.id)}
                    />
                    
                    {selectedElement === element.id && (
                      <div className="space-y-2 pt-2 border-t border-base-300">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="label-text text-xs">Font Size</label>
                            <input
                              type="range"
                              min="12"
                              max="72"
                              className="range range-sm"
                              value={element.fontSize}
                              onChange={(e) => updateSelectedText('fontSize', parseInt(e.target.value))}
                            />
                            <div className="text-xs text-center">{element.fontSize}px</div>
                          </div>
                          <div>
                            <label className="label-text text-xs">Color</label>
                            <input
                              type="color"
                              className="input input-xs input-bordered w-full h-8"
                              value={element.color}
                              onChange={(e) => updateSelectedText('color', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <select 
                          className="select select-sm select-bordered w-full"
                          value={element.fontFamily}
                          onChange={(e) => updateSelectedText('fontFamily', e.target.value)}
                        >
                          <option value="Arial">Arial</option>
                          <option value="Impact">Impact</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Comic Sans MS">Comic Sans MS</option>
                          <option value="Courier New">Courier New</option>
                        </select>
                        
                        <button
                          onClick={deleteSelectedElement}
                          className="btn btn-xs btn-error w-full"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete Element
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {textElements.length === 0 && (
                <div className="text-center text-base-content/60 py-8">
                  No text elements.<br />
                  Add some text to start creating your meme!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
