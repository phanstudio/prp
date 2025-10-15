// TextElementList.tsx
import React from "react";
import type { TextElement } from "../types";
import TextEditor from "./texteditor";
import { Bolt } from "lucide-react";
import type { TextProperties } from "../../hooks/usecase/text-manager";


interface TextElementListProps {
  textElements: TextElement[];
  selectedElement: string | null;
  setSelectedElement: (id: string|null) => void;
  updateProperty: (props: Partial<TextProperties>) => void;
  deleteSelectedElement: () => void;
  currentTextProps: TextProperties | null
}

const TextElementList: React.FC<TextElementListProps> = ({
  textElements,
  selectedElement,
  setSelectedElement,
  updateProperty,
  deleteSelectedElement,
  currentTextProps
}) => {
  return (
    <div className="space-y-2 max-h-60 overflow-y-auto p-2">
      {textElements.map((element, index) => {
        const isSelected = selectedElement === element.id;
        return (
          <div key={element.id}>
            <div
              className={`join cursor-pointer w-full ${
                selectedElement === element.id
                  ? "text-primary font-semibold"
                  : "text-default"
              }`}
            >
              <textarea
                placeholder={`Text ${index + 1}: Enter text...`}
                className="textarea textarea-sm textarea-bordered w-full mb-2 min-h-10"
                value={isSelected ? currentTextProps?.text || "" : element.text || ""}
                onChange={(e) => {
                  setSelectedElement(element.id);
                  updateProperty({ text: e.target.value });
                }}
                onFocus={() => setSelectedElement(element.id)}
              />
              <button className="btn join-item" popoverTarget={`popover-${element.id}`} 
                style={{ anchorName: `--anchor-${element.id}` } as React.CSSProperties }
                onClick={() => setSelectedElement(element.id)}
                // onBlur={()=> onElementSelect(null)} // we can check if the blur is mutual then remove it.
              >
                <Bolt className="size-[1.2em]"/>
              </button>
            </div>

            <div 
              className="dropdown menu w-65 card bg-base-200 p-3 max-w-80 border border-base-300 dropdown-end"
              popover="auto" 
              id={`popover-${element.id}`} 
              style={{ 
                positionAnchor: `--anchor-${element.id}`,
                opacity: 0,
                transition: 'opacity 0.15s ease-in',
              } as React.CSSProperties}
              onToggle={(e: any) => {
                // Show the popover only after it's positioned
                if (e.newState === 'open') {
                  requestAnimationFrame(() => {
                    const popover = document.getElementById(`popover-${element.id}`);
                    if (popover) {
                      popover.style.opacity = '1';
                    }
                  });
                } else {
                  const popover = document.getElementById(`popover-${element.id}`);
                  if (popover) {
                    popover.style.opacity = '0';
                  }
                }
              }}
            >
              <TextEditor
                element={element}
                currentTextProps={currentTextProps}
                updateProperty={updateProperty}
                onDelete={deleteSelectedElement}
              />
            </div>
            
          </div>
        )}
      )}

      {textElements.length === 0 && (
        <div className="text-sm text-center py-4">
          No text elements yet.
          <br />
          Click "Add Text" to create one.
        </div>
      )}
    </div>
  );
};

export default TextElementList;
