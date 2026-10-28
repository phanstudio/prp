import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2Icon, Copy, Download, RotateCcw } from "lucide-react";
import type { TextProperties } from "../hooks/usecase/use-konva";
import FontSelector from "./main/FontSelector";
import { useTemplateInfo } from "../hooks/useTemplateInfo";
import { TextEffectsPanel } from "./TextEffectsPanel";
import { DefualtTextSettings } from "./types";

interface TemplateEditorProps {
  templateInfo: ReturnType<typeof useTemplateInfo>;
  textElements: any[];
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
  addText: () => void;
  textManager: any;
  deleteSelectedElement: () => void;
  saveTemplate: () => Promise<void>;
  image?: HTMLImageElement | null;
  resetToTemplate: () => void;
  onResetAll?: () => void;
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
  onResetAll,
  toEdit,
}) => {
  const [currentTextProps, setCurrentTextProps] = useState<TextProperties | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [textValues, setTextValues] = useState<{ [id: string]: string }>({});

  const {
    templateName,
    setTemplateName,
    templateDescription,
    setTemplateDescription,
    templateTags,
    setTemplateTags,
  } = templateInfo;

  // Sync current properties when selected element changes
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

  const handleSave = async () => {
    if (!image || !templateName.trim() || isSaving) return;
    setIsSaving(true);
    try {
      await saveTemplate();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Text Elements Panel */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-base">Text Elements</h3>
              <p className="text-xs text-base-content/60">
                {textElements.length} {textElements.length === 1 ? "box" : "boxes"} on canvas
              </p>
            </div>
            <button
              type="button"
              onClick={addText}
              className="btn btn-primary btn-sm gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Text
            </button>
          </div>

          {/* Text Elements List */}
          <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-1">
            {textElements.map((element, index) => {
              const isSelected = selectedElement === element.id;

              return (
                <div
                  key={element.id}
                  className={`rounded-lg border transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-base-300 hover:border-base-content/30"
                  }`}
                >
                  {/* Item Header */}
                  <div
                    className="p-3 flex items-center justify-between cursor-pointer select-none bg-base-200/40 rounded-t-lg"
                    onClick={() => setSelectedElement(isSelected ? null : element.id)}
                  >
                    <div className="flex items-center gap-2 truncate mr-2">
                      <span className="badge badge-sm badge-neutral font-mono font-bold">
                        #{index + 1}
                      </span>
                      <span className="text-xs font-semibold truncate max-w-[140px] sm:max-w-[180px]">
                        {element.text?.trim() ? element.text : "Empty Text Box"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {isSelected && (
                        <>
                          <button
                            type="button"
                            onClick={textManager?.duplicateSelectedText}
                            className="btn btn-ghost btn-xs text-info hover:bg-info/20"
                            title="Duplicate Text"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={deleteSelectedElement}
                            className="btn btn-ghost btn-xs text-error hover:bg-error/20"
                            title="Delete Text"
                          >
                            <Trash2Icon className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedElement(isSelected ? null : element.id)}
                        className={`btn btn-xs ${isSelected ? "btn-primary" : "btn-ghost"}`}
                        title={isSelected ? "Collapse" : "Edit"}
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Properties Editor */}
                  {isSelected && currentTextProps && (
                    <div className="p-3 space-y-3.5 border-t border-base-200">
                      {/* Text Input */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="label-text text-xs font-medium">Text Content</label>
                          <span className="text-[10px] text-base-content/50">Supports line breaks</span>
                        </div>
                        <textarea
                          placeholder="Type meme text here..."
                          className="textarea textarea-sm textarea-bordered w-full min-h-20 text-sm focus:textarea-primary"
                          value={currentTextProps?.text || ""}
                          onChange={(e) => {
                            setTextValues((prev) => ({ ...prev, [element.id]: e.target.value }));
                            updateProperty({
                              text: e.target.value,
                              allCaps: currentTextProps?.allCaps === true,
                            });
                          }}
                        />
                      </div>

                      {/* Font Size & Text Color */}
                      <div className="grid grid-cols-2 gap-3 items-center">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="label-text text-xs font-medium">Font Size</label>
                            <span className="badge badge-xs badge-neutral">
                              {currentTextProps.maxFontSize || DefualtTextSettings.fontSize}px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="12"
                            max="100"
                            step="1"
                            className="range range-xs range-primary"
                            value={currentTextProps.maxFontSize || DefualtTextSettings.fontSize}
                            onChange={(e) =>
                              updateProperty({ maxFontSize: parseInt(e.target.value) || 20 })
                            }
                          />
                        </div>

                        <div>
                          <label className="label-text text-xs font-medium block mb-1">Text Color</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              className="input input-xs input-bordered w-10 h-8 p-1 cursor-pointer"
                              value={currentTextProps.fill || DefualtTextSettings.textColor}
                              onChange={(e) => updateProperty({ fill: e.target.value })}
                            />
                            <span className="text-xs font-mono text-base-content/70 uppercase">
                              {currentTextProps.fill || DefualtTextSettings.textColor}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Font Family Selector (With High z-index portal dropdown) */}
                      <FontSelector
                        value={currentTextProps.fontFamily || DefualtTextSettings.fontFamily}
                        onChange={(font) => updateProperty({ fontFamily: font })}
                      />

                      {/* Typography Style & Alignment in Responsive Columns */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {/* Style buttons */}
                        <div>
                          <label className="label-text text-xs font-medium mb-1 block">Style</label>
                          <div className="join w-full">
                            <button
                              type="button"
                              className={`btn btn-xs join-item flex-1 ${
                                currentTextProps.fontWeight === "bold" ? "btn-primary" : "btn-outline border-base-300"
                              }`}
                              onClick={() =>
                                updateProperty({
                                  fontWeight: currentTextProps.fontWeight === "bold" ? "normal" : "bold",
                                })
                              }
                              title="Bold"
                            >
                              <strong>B</strong>
                            </button>
                            <button
                              type="button"
                              className={`btn btn-xs join-item flex-1 ${
                                currentTextProps.fontStyle === "italic" ? "btn-primary" : "btn-outline border-base-300"
                              }`}
                              onClick={() =>
                                updateProperty({
                                  fontStyle: currentTextProps.fontStyle === "italic" ? "normal" : "italic",
                                })
                              }
                              title="Italic"
                            >
                              <em>I</em>
                            </button>
                            <button
                              type="button"
                              className={`btn btn-xs join-item flex-1 ${
                                currentTextProps.underline ? "btn-primary" : "btn-outline border-base-300"
                              }`}
                              onClick={() =>
                                updateProperty({ underline: !currentTextProps.underline })
                              }
                              title="Underline"
                            >
                              <u>U</u>
                            </button>
                            <button
                              type="button"
                              className={`btn btn-xs join-item flex-1 ${
                                currentTextProps?.allCaps ? "btn-primary" : "btn-outline border-base-300"
                              }`}
                              onClick={() =>
                                updateProperty({
                                  allCaps: !currentTextProps?.allCaps,
                                  text: textValues[element.id] ?? element.text,
                                })
                              }
                              title="All Caps"
                            >
                              AA
                            </button>
                          </div>
                        </div>

                        {/* Alignment buttons */}
                        <div>
                          <label className="label-text text-xs font-medium mb-1 block">Align</label>
                          <div className="join w-full">
                            {(["left", "center", "right"] as const).map((align) => (
                              <button
                                key={align}
                                type="button"
                                className={`btn btn-xs join-item flex-1 capitalize ${
                                  currentTextProps.textAlign === align ? "btn-primary" : "btn-outline border-base-300"
                                }`}
                                onClick={() => updateProperty({ textAlign: align })}
                              >
                                {align}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Text Effects Panel */}
                      <TextEffectsPanel
                        currentTextProps={currentTextProps}
                        updateProperty={updateProperty}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {textElements.length === 0 && (
            <div className="text-center text-base-content/60 py-8 border-2 border-dashed border-base-300 rounded-lg">
              <p className="text-sm font-medium">No text elements yet</p>
              <p className="text-xs text-base-content/50 mt-1">
                Click "Add Text" to start placing text on your template.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Template Info Card */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-4 sm:p-5 space-y-3">
          <h3 className="font-bold text-base">Template Details</h3>

          <div>
            <label className="label py-1">
              <span className="label-text text-xs font-medium">Template Name *</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Drake Hotline Bling"
              className="input input-sm input-bordered w-full"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </div>

          <div>
            <label className="label py-1">
              <span className="label-text text-xs font-medium">Description (optional)</span>
            </label>
            <textarea
              placeholder="Brief description of the template..."
              className="textarea textarea-sm textarea-bordered w-full"
              rows={2}
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="label py-1">
              <span className="label-text text-xs font-medium">Tags</span>
            </label>
            <input
              type="text"
              placeholder="funny, reaction, meme (comma separated)"
              className="input input-sm input-bordered w-full"
              value={templateTags}
              onChange={(e) => setTemplateTags(e.target.value)}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            {toEdit && (
              <button
                type="button"
                onClick={resetToTemplate}
                className="btn btn-outline btn-sm flex-1 gap-1"
                title="Reset text elements back to original template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Text
              </button>
            )}
            {onResetAll && !toEdit && (
              <button
                type="button"
                onClick={onResetAll}
                className="btn btn-outline btn-warning btn-sm flex-1 gap-1"
                title="Reset canvas, text, and image"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="btn btn-success w-full btn-md sm:btn-lg gap-2 text-white shadow-md hover:shadow-lg transition-all"
        disabled={!image || !templateName.trim() || isSaving}
      >
        <Download className="w-5 h-5" />
        {isSaving ? "Saving..." : toEdit ? "Save Changes" : "Create Template"}
      </button>
    </div>
  );
};

export default TemplateEditor;