import TextElementList from "./textelementlist";
import React, { useEffect, useState } from "react";
import type { TextManager, TextProperties } from "../../hooks/usecase/text-manager";

interface TextPanelProps {
  textManager: TextManager;
  textElements: any[]; // from fabric
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
  addText: () => void;
  deleteSelectedElement: () => void;
  onSave: () => void;
  onResetTemplate: () => void;
  className?: string;
}

const TextPanel: React.FC<TextPanelProps> = ({
  textManager,
  textElements,
  selectedElement,
  setSelectedElement,
  addText,
  deleteSelectedElement,
  onSave,
  onResetTemplate,
  className = "",
}) => {
  const [currentTextProps, setCurrentTextProps] = useState<TextProperties | null>(null);
  
  // Sync current text properties when selection changes
  useEffect(() => {
    if (selectedElement) {
      const props = textManager.getSelectedTextProperties();
      setCurrentTextProps(props);
    } else {
      setCurrentTextProps(null);
    }
  }, [selectedElement, textManager]);

  // Update selected text through TextManager
  const updateProperty = (updates: Partial<TextProperties>) => {
    if (!currentTextProps) return;
    const newProps = { ...currentTextProps, ...updates };
    setCurrentTextProps(newProps);
    textManager.updateSelectedText(updates);
  };

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Text Elements</h2>
      </div>

      {/* List of text elements */}
      <TextElementList
        textElements={textElements}
        selectedElement={selectedElement}
        setSelectedElement={setSelectedElement}
        updateProperty={updateProperty}
        deleteSelectedElement={deleteSelectedElement}
        currentTextProps={currentTextProps}
        textManager={textManager}
      />
      
      <div className="flex flex-col sm:text-center text-left">
        <div className="join flex justify-between p-2">
          <button
            onClick={addText}
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
            onClick={onResetTemplate}
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
