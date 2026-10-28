// src/components/memegen/textelementlist.tsx
import React, { useState } from "react";
import type { TextElement } from "../types";
import TextEditor from "./texteditor";
import { Sliders, Copy, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { TextProperties } from "../../hooks/usecase/use-konva";

interface TextElementListProps {
  textElements: TextElement[];
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
  updateProperty: (props: Partial<TextProperties>) => void;
  deleteSelectedElement: () => void;
  currentTextProps: TextProperties | null;
  textManager: any;
}

const TextElementList: React.FC<TextElementListProps> = ({
  textElements,
  selectedElement,
  setSelectedElement,
  updateProperty,
  deleteSelectedElement,
  currentTextProps,
  textManager,
}) => {
  const [textValues, setTextValues] = useState<{ [id: string]: string }>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setSelectedElement(id);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-3 max-h-[30rem] overflow-y-auto pr-1">
      {textElements.map((element, index) => {
        const isSelected = selectedElement === element.id;
        const isExpanded = expandedId === element.id || (isSelected && expandedId === null && textElements.length === 1);

        return (
          <div
            key={element.id}
            className={`rounded-lg border transition-all ${
              isSelected
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-base-300 hover:border-base-content/30"
            }`}
          >
            {/* Element Header & Actions */}
            <div className="p-2.5 flex items-center justify-between bg-base-200/50 rounded-t-lg">
              <div
                className="flex items-center gap-2 cursor-pointer flex-1 truncate select-none"
                onClick={() => setSelectedElement(element.id)}
              >
                <span className="badge badge-sm badge-neutral font-mono font-bold">
                  #{index + 1}
                </span>
                <span className="text-xs font-medium truncate max-w-[140px] sm:max-w-[200px]">
                  {element.text?.trim() ? element.text : "Empty Text Box"}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {isSelected && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        textManager?.duplicateSelectedText?.();
                      }}
                      className="btn btn-ghost btn-xs text-info hover:bg-info/20"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSelectedElement();
                      }}
                      className="btn btn-ghost btn-xs text-error hover:bg-error/20"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => toggleExpand(element.id)}
                  className={`btn btn-xs gap-1 ${isExpanded ? "btn-primary" : "btn-ghost"}`}
                  title={isExpanded ? "Hide Settings" : "Style Settings"}
                >
                  <Sliders className="w-3 h-3" />
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Direct Text Input */}
            <div className="p-2.5">
              <textarea
                placeholder={`Meme text #${index + 1}...`}
                className="textarea textarea-sm textarea-bordered w-full min-h-16 text-sm focus:textarea-primary"
                value={isSelected ? currentTextProps?.text || "" : element.text || ""}
                onChange={(e) => {
                  setSelectedElement(element.id);
                  setTextValues((prev) => ({ ...prev, [element.id]: e.target.value }));
                  updateProperty({
                    text: e.target.value,
                    allCaps: currentTextProps?.allCaps === true,
                  });
                }}
                onFocus={() => setSelectedElement(element.id)}
              />
            </div>

            {/* Inline Expandable Style & Font Editor */}
            {isExpanded && isSelected && currentTextProps && (
              <div className="p-3 border-t border-base-200 bg-base-100 rounded-b-lg">
                <TextEditor
                  element={element}
                  currentTextProps={currentTextProps}
                  updateProperty={updateProperty}
                  onDelete={deleteSelectedElement}
                  textManager={textManager}
                  textValue={textValues[element.id]}
                />
              </div>
            )}
          </div>
        );
      })}

      {textElements.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-base-300 rounded-lg text-base-content/60">
          <p className="text-sm font-medium">No text boxes on this meme</p>
          <p className="text-xs text-base-content/50 mt-1">
            Click "Add Text Box" below to insert meme captions.
          </p>
        </div>
      )}
    </div>
  );
};

export default TextElementList;
