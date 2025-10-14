import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Download } from "lucide-react";
import type { TextProperties, TextManager } from "../hooks/usecase/text-manager";
import FontSelector from "./main/FontSelector";
import { useTemplateInfo } from "../hooks/useTemplateInfo"
import { TextEffectsPanel } from "./TextEffectsPanel";
import { DefualtTextSettings } from "./types";

interface TemplateEditorProps {
  templateInfo: ReturnType<typeof useTemplateInfo>;
  textElements: any[]; // From fabric canvas
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
  addText: () => void;
  textManager: TextManager;
  deleteSelectedElement: () => void;
  saveTemplate: () => Promise<void>;
  image?: HTMLImageElement | null;
  resetToTemplate: () => void;
  toEdit: boolean;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  templateInfo,
  textElements,
  selectedElement,
  setSelectedElement,
  addText,
  textManager,
  deleteSelectedElement,
  saveTemplate,
  image,
  resetToTemplate,
  toEdit,
}) => {
  const [currentTextProps, setCurrentTextProps] = useState<TextProperties | null>(null);
  const [isSaving, setIsSaving] = useState(false); // <-- new state

  const handleSave = async () => {
    if (!image || !templateName.trim()) return;
    setIsSaving(true);
    try {
      await saveTemplate();
    } finally {
      setIsSaving(false);
    }
  };

  // Update current properties when selection changes
  useEffect(() => {
    if (selectedElement) {
      const props = textManager.getSelectedTextProperties();
      setCurrentTextProps(props);
    } else {
      setCurrentTextProps(null);
    }
  }, [selectedElement, textManager]);

  const updateProperty = (updates: Partial<TextProperties>) => {
    if (!currentTextProps) return;
    
    const newProps = { ...currentTextProps, ...updates };
    setCurrentTextProps(newProps);
    textManager.updateSelectedText(updates);
  };

  const {
    templateName,
    setTemplateName,
    templateDescription,
    setTemplateDescription,
    templateTags,
    setTemplateTags,
  } = templateInfo;

  return (
    <div className="space-y-6">
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
            {textElements.map((element, index) => {
              const isSelected = selectedElement === element.id;
              
              return (
                <div
                  key={element.id}
                  className={`p-3 rounded border ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-base-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">Text {index + 1}</span>
                    <button
                      onClick={() =>
                        setSelectedElement(isSelected ? null : element.id)
                      }
                      className="btn btn-xs btn-ghost"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>

                  <textarea
                    placeholder="Enter your meme text..."
                    className="textarea textarea-sm textarea-bordered w-full mb-2 min-h-20"
                    value={isSelected ? currentTextProps?.text || "" : element.text || ""}
                    onChange={(e) => {
                      setSelectedElement(element.id);
                      updateProperty({ text: e.target.value });
                    }}
                    onFocus={() => setSelectedElement(element.id)}
                  />

                  {isSelected && currentTextProps && (
                    <div className="space-y-3 pt-2 border-t border-base-300">
                      {/* Font Settings */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="label-text text-xs">Max Font Size</label>
                          <input
                            type="range"
                            min="12"
                            max="100"
                            className="range range-sm"
                            value={currentTextProps.maxFontSize || DefualtTextSettings.fontSize}
                            onChange={(e) =>
                              updateProperty({ maxFontSize: parseInt(e.target.value) })
                            }
                          />
                          <div className="text-xs text-center">
                            {currentTextProps.maxFontSize}px
                          </div>
                        </div>
                        <div>
                          <label className="label-text text-xs">Text Color</label>
                          <input
                            type="color"
                            className="input input-xs input-bordered w-full h-8"
                            value={currentTextProps.fill || DefualtTextSettings.textColor}
                            onChange={(e) =>
                              updateProperty({ fill: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <FontSelector
                        value={currentTextProps.fontFamily || DefualtTextSettings.fontFamily}
                        onChange={(font) => updateProperty({ fontFamily: font })}
                      />

                      {/* Text Style */}
                      <div>
                        <label className="label-text text-xs mb-1 block">Text Style</label>
                        <div className="flex gap-2">
                          <button
                            className={`btn btn-xs ${currentTextProps.fontWeight === "bold" ? "btn-primary" : "btn-ghost"}`}
                            onClick={() => 
                              updateProperty({ fontWeight: currentTextProps.fontWeight === "bold" ? "normal" : "bold" })
                            }
                          >
                            <strong>B</strong>
                          </button>
                          <button
                            className={`btn btn-xs ${currentTextProps.fontStyle === "italic" ? "btn-primary" : "btn-ghost"}`}
                            onClick={() => 
                              updateProperty({ fontStyle: currentTextProps.fontStyle === "italic" ? "normal" : "italic" })
                            }
                          >
                            <em>I</em>
                          </button>
                          <button
                            className={`btn btn-xs ${currentTextProps.underline ? "btn-primary" : "btn-ghost"}`}
                            onClick={() => 
                              updateProperty({ underline: !currentTextProps.underline })
                            }
                          >
                            <u>U</u>
                          </button>
                          {/* TODO: Add linethrough support - uncomment when ready */}
                          {/* <button
                            className={`btn btn-xs ${currentTextProps.linethrough ? "btn-primary" : "btn-ghost"}`}
                            onClick={() => 
                              updateProperty({ linethrough: !currentTextProps.linethrough })
                            }
                          >
                            <s>S</s>
                          </button> */}
                        </div>
                      </div>

                      {/* Text Alignment use select instead */}
                      <div>
                        <label className="label-text text-xs mb-1 block">Alignment</label>
                        <div className="flex gap-2">
                          {(["left", "center", "right"] as const).map((align) => (
                            <button
                              key={align}
                              className={`btn btn-xs ${currentTextProps.textAlign === align ? "btn-primary" : "btn-ghost"}`}
                              onClick={() => updateProperty({ textAlign: align })}
                            >
                              {align[0].toUpperCase()}
                            </button>
                          ))}
                          {/* TODO: Add justify support - uncomment when ready */}
                          {/* <button
                            className={`btn btn-xs ${currentTextProps.textAlign === "justify" ? "btn-primary" : "btn-ghost"}`}
                            onClick={() => updateProperty({ textAlign: "justify" })}
                          >
                            J
                          </button> */}
                        </div>
                      </div>

                      {/* Text Effects */}
                      <TextEffectsPanel
                        currentTextProps={currentTextProps}
                        updateProperty={updateProperty}
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
              );
            })}
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

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="btn btn-success w-full btn-lg"
        disabled={!image || !templateName.trim() || isSaving}
      >
        <Download className="w-5 h-5" />
        {isSaving ? "Saving..." : "Save Template"}
      </button>
    </div>
  );
};

export default TemplateEditor;