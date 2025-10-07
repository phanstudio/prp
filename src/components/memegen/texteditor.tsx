import React from "react";
import type { TextElement } from "../types";
import FontSelector from "../main/FontSelector";

// Text Editor Component
interface TextEditorProps {
  element: TextElement | null;
  onUpdate: (field: keyof TextElement, value: string | number) => void;
  onDelete: () => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ element, onUpdate, onDelete }) => {
  if (!element) {
    return (
      <div className="text-gray-500 text-sm text-center py-4">
        Select a text element to edit it
      </div>
    );
  }

  return (
    <div className="space-y-3 p-2">
      <div>
        <label className="label-text text-xs">Color:</label>
        <input
          type="color"
          value={element.color}
          onChange={(e) => onUpdate('color', e.target.value)}
          className="input input-xs input-bordered w-full h-8"
        />
      </div>
      
      <div>
        <label className="label-text text-xs">Font Size: {element.fontSize}px</label>
        <input
          type="range" min="12" max="100" className="range range-sm"
          value={element.fontSize}
          onChange={(e) =>
            onUpdate(
              "fontSize",
              parseInt(e.target.value)
            )
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
            onUpdate("outlineColor", e.target.value)
          }
        />
      </div>

      <div>
        <label className="label-text text-xs">Outline Size ({element.outlineSize}px)</label>
        <input
          type="range" min="0" max="30" className="range range-sm"
          value={element.outlineSize}
          onChange={(e) =>
            onUpdate(
              "outlineSize",
              parseInt(e.target.value)
            )
          }
        />
      </div>
      <FontSelector
        value={element.fontFamily}
        onChange={(font) => onUpdate("fontFamily", font)}
      />
      
      <button
        onClick={onDelete}
        className="btn w-full btn-error text-sm"
      >
        Delete This Text
      </button>
    </div>
  );
};

export default TextEditor