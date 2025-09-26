import React from 'react';
import type { TextElement } from './textelement';

interface TextElementListProps {
  textElements: TextElement[];
  selectedElement: string | null;
  onElementSelect: (id: string) => void;
}

const TextElementList: React.FC<TextElementListProps> = ({ 
  textElements, 
  selectedElement, 
  onElementSelect 
}) => {
  return (
    <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
      {textElements.map((element, index) => (
        <div 
          key={element.id}
          className={`p-2 border rounded cursor-pointer transition-colors ${
            selectedElement === element.id 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
          onClick={() => onElementSelect(element.id)}
        >
          <div className="font-medium text-sm">
            Text {index + 1}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {element.text || 'Empty text'}
          </div>
          <div className="text-xs text-gray-400">
            {element.fontSize}px, {element.fontFamily}
          </div>
        </div>
      ))}
      {textElements.length === 0 && (
        <div className="text-gray-500 text-sm text-center py-4">
          No text elements yet.<br/>Click "Add Text" to create one.
        </div>
      )}
    </div>
  );
};

export default TextElementList