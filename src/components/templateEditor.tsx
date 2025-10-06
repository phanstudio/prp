import React from "react";
import { Plus, Edit3, Trash2, Download } from "lucide-react";
import type { TextElement } from "./types";
import FontSelector from "./main/FontSelector";

interface TemplateEditorProps {
  templateName: string;
  setTemplateName: (name: string) => void;
  templateDescription: string;
  setTemplateDescription: (desc: string) => void;
  templateTags: string;
  setTemplateTags: (tags: string) => void;
  textElements: TextElement[];
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
  addText: () => void;
  updateSelectedText: (field: keyof TextElement, value: any) => void;
  deleteSelectedElement: () => void;
  saveTemplate: () => void;
  image?: HTMLImageElement | null;
  resetToTemplate: () => void;
  toEdit: boolean; // can merge and jsut nvaldate above instead of here
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  templateName,
  setTemplateName,
  templateDescription,
  setTemplateDescription,
  templateTags,
  setTemplateTags,
  textElements,
  selectedElement,
  setSelectedElement,
  addText,
  updateSelectedText,
  deleteSelectedElement,
  saveTemplate,
  image,
  resetToTemplate,
  toEdit,
}) => {
  return (
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
          {toEdit && (
            <button
              onClick={resetToTemplate}
              className="btn btn-base w-full mb-4"
            >
              Reset
            </button>
          )}
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
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {textElements.map((element, index) => (
              <div
                key={element.id}
                className={`p-3 rounded border ${
                  selectedElement === element.id
                    ? "border-primary bg-primary/10"
                    : "border-base-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">Text {index + 1}</span>
                  <button
                    onClick={() =>
                      setSelectedElement(
                        selectedElement === element.id ? null : element.id
                      )
                    }
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
                    updateSelectedText("text", e.target.value);
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
                          max="100"
                          className="range range-sm"
                          value={element.fontSize}
                          onChange={(e) =>
                            updateSelectedText(
                              "fontSize",
                              parseInt(e.target.value)
                            )
                          }
                        />
                        <div className="text-xs text-center">
                          {element.fontSize}px
                        </div>
                      </div>
                      <div>
                        <label className="label-text text-xs">Outline Size</label>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          className="range range-sm"
                          value={element.outlineSize}
                          onChange={(e) =>
                            updateSelectedText(
                              "outlineSize",
                              parseInt(e.target.value)
                            )
                          }
                        />
                        <div className="text-xs text-center">
                          {element.outlineSize}px
                        </div>
                      </div>
                      <div>
                        <label className="label-text text-xs">Color</label>
                        <input
                          type="color"
                          className="input input-xs input-bordered w-full h-8"
                          value={element.color}
                          onChange={(e) =>
                            updateSelectedText("color", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="label-text text-xs">Outline Color</label>
                        <input
                          type="color"
                          className="input input-xs input-bordered w-full h-8"
                          value={element.outlineColor}
                          onChange={(e) =>
                            updateSelectedText("outlineColor", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <FontSelector
                      value={element.fontFamily}
                      onChange={(font) => updateSelectedText("fontFamily", font)}
                    />

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
              No text elements yet.
              <br />
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
  );
};

export default TemplateEditor;
