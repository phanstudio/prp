// TextElementList.tsx
import React from "react";
import type { TextElement } from "../types";
import TextEditor from "./texteditor";
import { Bolt, Pencil } from "lucide-react";


interface TextElementListProps {
  textElements: TextElement[];
  selectedElement: string | null;
  onElementSelect: (id: string|null) => void;
  onUpdate: (id: string, field: keyof TextElement, value: string | number) => void;
  onDelete: (id: string) => void;
}

const TextElementList: React.FC<TextElementListProps> = ({
  textElements,
  selectedElement,
  onElementSelect,
  onUpdate,
  onDelete,
}) => {
  return (
    <div className="space-y-2 max-h-60 overflow-y-auto p-2">
      {textElements.map((element, index) => (
        <div key={element.id}>
          <div
            className={`join cursor-pointer w-full ${
              selectedElement === element.id
                ? "text-primary font-semibold"
                : "text-default"
            }`}
          >
            <label className="input flex-1 join-item">
              <Pencil className="h-[1em] opacity-50"/>
              <input 
                type="text" className="grow" value={element.text}
                onChange={(e) => onUpdate(element.id, "text", e.target.value)}
                placeholder={`Text ${index + 1}: Enter text...`} 
                onFocus={() => {
                  onElementSelect(element.id);
                }}
              />
            </label>
            <button className="btn join-item" popoverTarget={`popover-${element.id}`} 
              style={{ anchorName: `--anchor-${element.id}` } as React.CSSProperties }
              onClick={() => onElementSelect(element.id)}
              // onBlur={()=> onElementSelect(null)} // we can check if the blur is mutual then remove it.
            >
              <Bolt className="size-[1.2em]"/>
            </button>
          </div>

          <div 
            className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm"
            popover="auto" id={`popover-${element.id}`} 
            style={{ positionAnchor: `--anchor-${element.id}` } as React.CSSProperties }>
            <TextEditor
              element={element}
              onUpdate={(field, value) => onUpdate(element.id, field, value)}
              onDelete={() => onDelete(element.id)}
            />
          </div>
        </div>
      ))}

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
