import React from "react";
import type { TextElement } from "./textelement";
import TextElementList from './textelementlist';
import TextEditor from './texteditor';

// Text Panel Component
interface TextPanelProps {
  textElements: TextElement[];
  selectedElement: string | null;
  onAddText: () => void;
  onElementSelect: (id: string) => void;
  onUpdateElement: (field: keyof TextElement, value: string | number) => void;
  onDeleteElement: () => void;
}

const TextPanel: React.FC<TextPanelProps> = ({
  textElements,
  selectedElement,
  onAddText,
  onElementSelect,
  onUpdateElement,
  onDeleteElement
}) => {
  const selectedTextElement = textElements.find(el => el.id === selectedElement) || null;

  return (
    <div className="w-80 bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Text Elements</h2>
        <button
          onClick={onAddText}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
        >
          Add Text
        </button>
      </div>
      
      {/* List of text elements */}
      <TextElementList 
        textElements={textElements}
        selectedElement={selectedElement}
        onElementSelect={onElementSelect}
      />
      
      {/* Edit Selected Element */}
      <div className="border-t pt-4">
        <h3 className="font-medium mb-3">Edit Selected Text</h3>
        <TextEditor 
          element={selectedTextElement}
          onUpdate={onUpdateElement}
          onDelete={onDeleteElement}
        />
      </div>
    </div>
  );
};

export default TextPanel;