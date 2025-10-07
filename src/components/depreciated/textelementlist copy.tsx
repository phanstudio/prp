// TextElementList.tsx
import React from "react";
import type { TextElement } from "../types";
import TextEditor from "../memegen/texteditor";
import { Bolt, Pencil } from "lucide-react";
import { DropDown } from "./dropdown";


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
                type="text" 
                className="grow" 
                value={element.text}
                onChange={(e) => onUpdate(element.id, "text", e.target.value)}
                placeholder={`Text ${index + 1}: Enter text...`} 
                onFocus={() => {
                  onElementSelect(element.id);
                }}
              />
            </label>
            <DropDown 
              data={[
                (props) => ( // Wrap in a function to receive the close prop
                  <div className="card bg-base-200 p-3 max-w-80">
                    <TextEditor
                      element={element}
                      onUpdate={(field, value) => onUpdate(element.id, field, value)}
                      onDelete={() => {
                        onDelete(element.id);
                        props.close(); // Close dropdown after delete
                      }}
                    />
                  </div>
                )
              ]}
            >
              <button className="btn join-item" onClick={() => onElementSelect(element.id)}>
                <Bolt className="size-[1.2em]"/>
              </button>
            </DropDown>
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
