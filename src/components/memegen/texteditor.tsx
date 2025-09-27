import React from "react";
import type { TextElement } from "./textelement";

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
      {/* <div>
        <label className="block text-sm font-medium mb-1">Text:</label>
        <textarea
          value={element.text}
          onChange={(e) => onUpdate('text', e.target.value)}
          className="w-full border rounded px-2 py-1 text-sm resize-none"
          rows={2}
          placeholder="Enter your text here..."
        />
      </div> */}
      
      <div>
        <label className="block text-sm font-medium mb-1">Font Size:</label>
        <input
          type="range"
          min="12"
          max="72"
          value={element.fontSize}
          onChange={(e) => onUpdate('fontSize', parseInt(e.target.value))}
          className="w-full"
        />
        <div className="text-xs text-gray-500 text-center">
          {element.fontSize}px
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Color:</label>
        <input
          type="color"
          value={element.color}
          onChange={(e) => onUpdate('color', e.target.value)}
          className="w-full h-8 border rounded"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Font:</label>
        <select
          value={element.fontFamily}
          onChange={(e) => onUpdate('fontFamily', e.target.value)}
          className="w-full border rounded px-2 py-1 text-sm"
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Impact">Impact</option>
          <option value="Comic Sans MS">Comic Sans MS</option>
        </select>
      </div>
      
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