import React from "react";
import type { TextElement } from "./textelement";
import TextElementList from "./textelementlist";
import TextEditor from "./texteditor";

// Text Panel Component
interface TextPanelProps {
  textElements: TextElement[];
  selectedElement: string | null;
  onAddText: () => void;
  onElementSelect: (id: string | null) => void;
  onUpdateElement: (field: keyof TextElement, value: string | number) => void;
  onDeleteElement: () => void;
  onSave: () => void;
  classname: string;
}

const TextPanel: React.FC<TextPanelProps> = ({
  textElements,
  selectedElement,
  onAddText,
  onElementSelect,
  onUpdateElement,
  onDeleteElement,
  onSave,
  classname,
}) => {
  return (
    <div className={classname}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Text Elements</h2>
      </div>

      {/* List of text elements */}
      <TextElementList
        textElements={textElements}
        selectedElement={selectedElement}
        onElementSelect={onElementSelect}
        onUpdate={(id, field, value) => {
          if (selectedElement === id) {
            onUpdateElement(field, value);
          }
        }}
        onDelete={(id) => {
          if (selectedElement === id) {
            onDeleteElement();
          }
        }}
      />
      
      <div className="flex flex-col sm:text-center text-left">
        <div className="join flex justify-between p-2">
          <button
            onClick={onAddText}
            className="btn btn-neutral text-sm join-item flex-1"
          >
            Add text
          </button>
        </div>

        <div className="join flex justify-between p-2 join-vertical md:join-horizontal">
          <button
            onClick={onSave}
            className="btn btn-primary text-sm join-item"
          >
            Generate Meme
          </button>
          <button
            onClick={onAddText}
            className="btn btn-neutral text-sm join-item"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextPanel;
